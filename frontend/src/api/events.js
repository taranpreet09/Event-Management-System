import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api/events';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getAllEvents = (params) => {
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
export const createEvent = (eventData) => {
    return axios.post(API_URL, eventData, { headers: getAuthHeaders() });
};

export const getMyEvents = () => {
    return axios.get(`${API_URL}/my-events`, { headers: getAuthHeaders() });
};

export const getRegisteredEvents = () => {
    return axios.get(`${API_URL}/registered`, { headers: getAuthHeaders() });
};
export const getEventAttendees = (eventId) => {
    return axios.get(`${API_URL}/${eventId}/attendees`, { headers: getAuthHeaders() });
};
export const unregisterFromEvent = (eventId) => {
    return axios.put(`${API_URL}/unregister/${eventId}`, {}, { headers: getAuthHeaders() });
};
