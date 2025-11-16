import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConversationMessages } from '../api/messages';

const ConversationPage = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getConversationMessages(conversationId);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load messages', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  if (loading) return <div>Loading conversation...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col min-h-[400px] max-h-[70vh]">
      {messages.length === 0 ? (
        <p className="text-gray-500 text-sm">No messages yet.</p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="flex flex-col max-w-[80%]"
            >
              <div className="text-xs text-gray-500 mb-0.5">
                <span className="font-semibold">{msg.from?.name || 'Unknown'}</span>
                <span className="ml-2">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <div className="bg-gray-100 rounded-2xl px-3 py-2 text-gray-800 text-sm shadow-sm">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationPage;
