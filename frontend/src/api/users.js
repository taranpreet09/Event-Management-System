import axios from 'axios';

const API_URL = 'http://localhost:1111/api/users';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const changePassword = (passwordData) => {
    return axios.put(`${API_URL}/change-password`, passwordData, { headers: getAuthHeaders() });
};