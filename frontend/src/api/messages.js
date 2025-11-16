import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/messages';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getInbox = () => {
  return axios.get(`${BASE_URL}/inbox`, { headers: getAuthHeaders() });
};

export const getConversationMessages = (conversationId) => {
  return axios.get(`${BASE_URL}/conversations/${conversationId}`, { headers: getAuthHeaders() });
};

// Organizer-only helpers (for future use in UI)
export const sendMessageToAttendee = (eventId, attendeeId, text) => {
  return axios.post(
    `${BASE_URL}/events/${eventId}/to/${attendeeId}`,
    { text },
    { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
  );
};

export const broadcastInboxMessage = (eventId, text) => {
  return axios.post(
    `${BASE_URL}/events/${eventId}/broadcast-inbox`,
    { text },
    { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
  );
};
