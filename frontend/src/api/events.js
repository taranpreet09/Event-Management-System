import axios from 'axios';

const API_URL = 'http://localhost:1111/api/events';

// Helper to get the token and create the correct Authorization header
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// --- MAKE SURE THESE ARE ALL NAMED EXPORTS (using 'export const') ---

// Fetch all public events (you might need this for your events page)
export const getAllEvents = (params) => {
    // Axios can automatically convert an object into query parameters
    return axios.get(API_URL, { params });
};
export const getEventById = (eventId) => {
    return axios.get(`${API_URL}/${eventId}`);
};
export const deleteEvent = (eventId) => {
    return axios.delete(`${API_URL}/${eventId}`, { headers: getAuthHeaders() });
};
export const updateEvent = (eventId, eventData) => {
    return axios.put(`${API_URL}/${eventId}`, eventData, { headers: getAuthHeaders() });
};
// Organizer: Create a new event
export const createEvent = (eventData) => {
    return axios.post(API_URL, eventData, { headers: getAuthHeaders() });
};

// Organizer: Get events they created
export const getMyEvents = () => {
    return axios.get(`${API_URL}/my-events`, { headers: getAuthHeaders() });
};

// User: Get events they are registered for
export const getRegisteredEvents = () => {
    return axios.get(`${API_URL}/registered`, { headers: getAuthHeaders() });
};
export const getEventAttendees = (eventId) => {
    return axios.get(`${API_URL}/${eventId}/attendees`, { headers: getAuthHeaders() });
};
export const unregisterFromEvent = (eventId) => {
    return axios.put(`${API_URL}/unregister/${eventId}`, {}, { headers: getAuthHeaders() });
};
