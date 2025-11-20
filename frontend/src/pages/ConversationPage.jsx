import React, { useEffect, useState, useRef } from 'react';
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
  const wsRef = useRef(null);

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

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    wsRef.current = ws;

    ws.onopen = () => {
      const token = localStorage.getItem('token');
      if (token) {
        ws.send(JSON.stringify({ type: 'AUTH', token }));
      }
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
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

    return () => {
      ws.close();
    };
  }, [conversationId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({ type: 'SEND_INBOX_MESSAGE', conversationId, text: text.trim() })
    );
    setText('');
  };

  if (loading) return <div>Loading conversation...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col min-h-[400px] max-h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const senderId = msg.from?._id || msg.from;
            const isMine = myUserId && senderId && senderId.toString() === myUserId.toString();
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`text-xs mb-1 ${isMine ? 'text-right text-gray-500' : 'text-gray-500'}`}>
                    <span className="font-semibold">{msg.from?.name || 'Unknown'}</span>
                    <span className="ml-2">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <div className={`${isMine ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-2xl px-3 py-2 shadow-sm`}> 
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type your message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ConversationPage;