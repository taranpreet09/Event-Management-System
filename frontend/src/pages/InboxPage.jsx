import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInbox } from '../api/messages';

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await getInbox();
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load inbox', err);
        setError('Failed to load inbox');
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, []);

  if (loading) return <div>Loading inbox...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
        <span className="text-xs text-gray-500">{conversations.length} total</span>
      </div>

      {conversations.length === 0 ? (
        <div className="p-8 text-center text-gray-600">
          No messages yet.
        </div>
      ) : (
        <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
          {conversations.map((convo) => (
            <Link
              to={`/dashboard/inbox/${convo._id}`}
              key={convo._id}
              className="block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between gap-3 items-start">
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      convo.unreadCount > 0 ? 'text-gray-900' : 'text-gray-800'
                    }`}
                  >
                    {convo.event?.title || 'Unknown event'}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      convo.unreadCount > 0
                        ? 'text-gray-700 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {convo.lastMessagePreview || 'No messages yet.'}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {convo.lastMessageAt &&
                      new Date(convo.lastMessageAt).toLocaleDateString()}
                  </span>
                  {convo.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-semibold">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxPage;
