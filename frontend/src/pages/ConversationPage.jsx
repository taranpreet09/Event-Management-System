import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getConversationMessages } from '../api/messages';
import { useAuth } from '../context/AuthContext';

const ConversationPage = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const myUserId = user?.id || user?._id || user?.userId;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getConversationMessages(conversationId);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    let reconnectDelay = 1000;

    const connect = () => {
      if (!isMounted) return;

      const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1111').replace(/^http/, 'ws');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ [ConversationPage] WebSocket connected');
        reconnectDelay = 1000;
        setWsReady(true);

        // Authenticate immediately
        const token = localStorage.getItem('token');
        if (token) {
          ws.send(JSON.stringify({ type: 'AUTH', token }));
        }
      };

      ws.onmessage = (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch { return; }

        if (data.type === 'INBOX_MESSAGE' && data.conversationId === conversationId) {
          setMessages((prev) => [
            ...prev,
            {
              _id: data.messageId || `${Date.now()}`,
              from: { _id: data.fromUserId, name: data.fromName || 'User' },
              to: { _id: data.toUserId },
              text: data.text,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      };

      ws.onclose = () => {
        console.log('❌ [ConversationPage] WebSocket disconnected');
        setWsReady(false);
        wsRef.current = null;

        if (isMounted) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 15000);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (err) => {
        console.error('❌ [ConversationPage] WebSocket error:', err);
        // Let onclose handle reconnection
        if (ws.readyState !== WebSocket.CLOSED) {
          ws.close();
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsReady(false);
    };
  }, [conversationId]);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready, cannot send message.');
      return;
    }

    ws.send(
      JSON.stringify({ type: 'SEND_INBOX_MESSAGE', conversationId, text: trimmed })
    );

    // Optimistic UI: add message immediately
    setMessages((prev) => [
      ...prev,
      {
        _id: `optimistic-${Date.now()}`,
        from: { _id: myUserId, name: user?.name || 'You' },
        text: trimmed,
        createdAt: new Date().toISOString(),
      },
    ]);

    setText('');
  }, [text, conversationId, myUserId, user?.name]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
    </div>
  );
  if (error) return <div className="text-error text-center py-10">{error}</div>;

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-4 md:p-6 flex flex-col min-h-[400px] max-h-[70vh]">
      {/* Connection status */}
      {!wsReady && (
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant bg-surface-container-high px-3 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          Connecting...
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="material-symbols-outlined text-4xl text-outline/30">chat_bubble_outline</span>
            <p className="text-on-surface-variant text-sm font-light">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const senderId = msg.from?._id || msg.from;
            const isMine = myUserId && senderId && senderId.toString() === myUserId.toString();
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isMine ? 'text-right text-on-surface-variant' : 'text-on-surface-variant'}`}>
                    <span>{msg.from?.name || 'Unknown'}</span>
                    <span className="ml-2 font-normal lowercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`${isMine ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface'} rounded-2xl px-4 py-2.5 text-sm font-body`}> 
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex items-center gap-3 pt-4 border-t border-outline-variant/10">
        <input
          type="text"
          className="flex-1 bg-transparent border-t-0 border-x-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-2 text-sm font-body placeholder:text-outline-variant/50 transition-colors"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!wsReady || !text.trim()}
          className="bg-primary text-white p-3 rounded-lg hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </div>
  );
};

export default ConversationPage;