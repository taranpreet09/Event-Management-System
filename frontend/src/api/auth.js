// To be implemented
// Example: export const loginUser = async (credentials) => { ... };
import axios from 'axios';

const API_URL = 'http://localhost:1111/api/auth'; // Your backend auth URL

export const registerUser = (userData) => {
    return axios.post(`${API_URL}/register-user`, userData);
};

export const registerOrganizer = (userData) => {
    return axios.post(`${API_URL}/register-organizer`, userData);
};

export const login = (credentials) => {
    return axios.post(`${API_URL}/login`, credentials);
};