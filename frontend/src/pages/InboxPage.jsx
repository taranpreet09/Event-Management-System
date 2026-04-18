import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getInbox, getConversationMessages } from '../api/messages';
import { useAuth } from '../context/AuthContext';

const InboxPage = () => {
  const { user } = useAuth();
  const { conversationId: activeConvoId } = useParams();
  const navigate = useNavigate();
  const myUserId = user?.id || user?._id || user?.userId;

  // Conversation list state
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active conversation state
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState('');
  const [wsReady, setWsReady] = useState(false);
  const [activeConvoMeta, setActiveConvoMeta] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ─── Fetch conversation list ───
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await getInbox();
        const data = Array.isArray(res.data) ? res.data : [];
        // Sort by newest first
        data.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));
        setConversations(data);
      } catch (err) {
        console.error('Failed to load inbox', err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchInbox();
  }, []);

  // ─── Fetch messages for active conversation ───
  useEffect(() => {
    if (!activeConvoId) {
      setMessages([]);
      setActiveConvoMeta(null);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await getConversationMessages(activeConvoId);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Set active conversation meta from list
    const convo = conversations.find(c => c._id === activeConvoId);
    setActiveConvoMeta(convo || null);
  }, [activeConvoId, conversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── WebSocket connection ───
  useEffect(() => {
    let isMounted = true;
    let reconnectDelay = 1000;

    const connect = () => {
      if (!isMounted) return;

      const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1111').replace(/^http/, 'ws');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay = 1000;
        setWsReady(true);
        const token = localStorage.getItem('token');
        if (token) ws.send(JSON.stringify({ type: 'AUTH', token }));
      };

      ws.onmessage = (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch { return; }

        if (data.type === 'INBOX_MESSAGE') {
          // Update messages if this conversation is active
          if (data.conversationId === activeConvoId) {
            // Don't add if it's my own message (already added optimistically)
            if (data.fromUserId === myUserId) return;
            setMessages(prev => [
              ...prev,
              {
                _id: data.messageId || `ws-${Date.now()}`,
                from: { _id: data.fromUserId, name: data.fromName || 'User' },
                to: { _id: data.toUserId },
                text: data.text,
                createdAt: data.createdAt || new Date().toISOString(),
              }
            ]);
          }

          // Update conversation list preview
          setConversations(prev => {
            const updated = prev.map(c => {
              if (c._id === data.conversationId) {
                return {
                  ...c,
                  lastMessagePreview: data.text,
                  lastMessageAt: data.createdAt || new Date().toISOString(),
                };
              }
              return c;
            });
            // Re-sort by newest
            updated.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));
            return updated;
          });
        }
      };

      ws.onclose = () => {
        setWsReady(false);
        wsRef.current = null;
        if (isMounted) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 15000);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = () => {
        if (ws.readyState !== WebSocket.CLOSED) ws.close();
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsReady(false);
    };
  }, [activeConvoId, myUserId]);

  // ─── Send message ───
  const handleSend = useCallback((e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !activeConvoId) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ type: 'SEND_INBOX_MESSAGE', conversationId: activeConvoId, text: trimmed }));

    // Optimistic UI
    setMessages(prev => [
      ...prev,
      {
        _id: `optimistic-${Date.now()}`,
        from: { _id: myUserId, name: user?.name || 'You' },
        text: trimmed,
        createdAt: new Date().toISOString(),
      }
    ]);

    // Update conversation preview immediately
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c._id === activeConvoId) {
          return { ...c, lastMessagePreview: trimmed, lastMessageAt: new Date().toISOString() };
        }
        return c;
      });
      updated.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));
      return updated;
    });

    setText('');
  }, [text, activeConvoId, myUserId, user?.name]);

  // ─── Filtered conversations ───
  const filteredConvos = conversations.filter(convo => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (convo.event?.title || '').toLowerCase().includes(q) ||
      (convo.lastMessagePreview || '').toLowerCase().includes(q) ||
      (convo.otherUser?.name || '').toLowerCase().includes(q)
    );
  });

  const getOtherName = (convo) => convo.otherUser?.name || convo.event?.title || 'Conversation';
  const getAvatar = (name) => `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a1c1c&textColor=faf9f8`;

  return (
    <div className="w-full h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="font-headline italic text-3xl text-primary tracking-tight mb-1">Inbox</h1>
        <p className="text-on-surface-variant text-sm font-light">Your conversations and messages.</p>
      </div>

      <div className="flex-1 flex bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden min-h-0">
        {/* ─── LEFT: Conversations List ─── */}
        <div className={`${activeConvoId ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] lg:w-[380px] flex-col border-r border-outline-variant/10 flex-shrink-0`}>
          {/* Search */}
          <div className="p-4 border-b border-outline-variant/10">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm font-body w-full placeholder:text-outline-variant/50"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
                <span className="material-symbols-outlined text-3xl text-outline/30">chat_bubble_outline</span>
                <p className="text-on-surface-variant text-xs font-light text-center">
                  {searchQuery ? 'No results.' : 'No conversations yet.'}
                </p>
              </div>
            ) : (
              filteredConvos.map((convo) => {
                const otherName = getOtherName(convo);
                const isActive = convo._id === activeConvoId;
                return (
                  <Link
                    to={`/dashboard/inbox/${convo._id}`}
                    key={convo._id}
                    className={`block p-4 border-b border-outline-variant/5 transition-all cursor-pointer ${isActive ? 'bg-surface-container' : 'hover:bg-surface-container-low'}`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img className="w-full h-full object-cover" alt={otherName} src={convo.otherUser?.profileImage || getAvatar(otherName)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className={`font-headline text-sm truncate ${isActive ? 'font-bold text-primary' : 'font-medium text-on-surface'}`}>
                            {otherName}
                          </p>
                          <span className="text-[10px] text-on-surface-variant ml-2 shrink-0">
                            {convo.lastMessageAt && new Date(convo.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {convo.event?.title && (
                          <span className="bg-tertiary-fixed-dim/30 text-on-tertiary-fixed-variant text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider inline-block mb-1">
                            {convo.event.title}
                          </span>
                        )}
                        <p className="text-xs text-on-surface-variant/70 truncate">
                          {convo.lastMessagePreview || 'No messages yet.'}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT: Active Conversation ─── */}
        <div className={`${activeConvoId ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
          {!activeConvoId ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
              <span className="material-symbols-outlined text-5xl text-outline/20">forum</span>
              <p className="text-on-surface-variant text-sm font-light text-center">Select a conversation to view messages.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <header className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-4">
                  {/* Back button (mobile only) */}
                  <button onClick={() => navigate('/dashboard/inbox')} className="md:hidden p-1 text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-surface ring-offset-1 ring-offset-primary/10">
                      <img
                        className="w-full h-full object-cover"
                        alt={activeConvoMeta ? getOtherName(activeConvoMeta) : 'User'}
                        src={activeConvoMeta?.otherUser?.profileImage || getAvatar(activeConvoMeta ? getOtherName(activeConvoMeta) : 'U')}
                      />
                    </div>
                    {wsReady && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-surface rounded-full"></div>}
                  </div>
                  <div>
                    <h2 className="font-headline text-lg font-bold text-primary">
                      {activeConvoMeta ? getOtherName(activeConvoMeta) : 'Conversation'}
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {wsReady ? 'Connected' : 'Connecting...'} {activeConvoMeta?.event?.title ? `• ${activeConvoMeta.event.title}` : ''}
                    </p>
                  </div>
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-surface-container-low/30 min-h-0">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-16">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="material-symbols-outlined text-3xl text-outline/30">chat_bubble_outline</span>
                    <p className="text-on-surface-variant text-xs font-light">No messages yet. Start the conversation.</p>
                  </div>
                ) : (
                  <>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-outline-variant/20"></div>
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Messages</span>
                      <div className="flex-1 h-px bg-outline-variant/20"></div>
                    </div>

                    {messages.map((msg) => {
                      const senderId = msg.from?._id || msg.from;
                      const isMine = myUserId && senderId && senderId.toString() === myUserId.toString();
                      return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isMine && (
                              <div className="w-7 h-7 rounded-full overflow-hidden mt-1 flex-shrink-0">
                                <img className="w-full h-full object-cover" alt={msg.from?.name || 'U'} src={getAvatar(msg.from?.name || 'U')} />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className={`${isMine ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-lowest text-on-surface'} px-4 py-3 text-sm leading-relaxed shadow-sm ${isMine ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none'}`}>
                                {msg.text}
                              </div>
                              <span className={`text-[9px] text-on-surface-variant uppercase tracking-wide ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                                {msg.from?.name || 'Unknown'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <footer className="p-4 bg-surface-container-low/50 backdrop-blur-sm border-t border-outline-variant/10 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-end gap-3 bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/10">
                  <textarea
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-body py-2 px-2 resize-none placeholder:text-outline-variant/50 max-h-[100px]"
                    placeholder="Type your message..."
                    rows="1"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!wsReady || !text.trim()}
                    className="w-9 h-9 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </form>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;