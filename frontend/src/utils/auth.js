// frontend/src/utils/auth.js

import axios from 'axios';
// ... (rest of imports/config)

const api = axios.create({
  baseURL: 'http://localhost:1111/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // ⭐ CRITICAL: Must use the 'Bearer' prefix for your auth middleware to work
            config.headers['Authorization'] = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;