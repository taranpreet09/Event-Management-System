import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Make sure you've run: npm install jwt-decode
import { useModal } from './ModalContext';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const api = axios.create({
  baseURL: 'http://localhost:1111/api',
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const { hideModal } = useModal();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // --- THIS IS THE CRITICAL FIX ---
      // Decode the token and set the user state
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
      } catch (error) {
        console.error("Invalid token:", error);
        setToken(null); // Clear invalid token
        setUser(null);
      }
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

   const login = useCallback(async (formData, navigate) => { // Accept navigate as an argument
    try {
      const res = await api.post('/auth/login', formData);
      const decoded = jwtDecode(res.data.token);
      setToken(res.data.token);
      hideModal();

      // Redirect based on the role from the new token
      if (decoded.user.role === 'organizer') {
        navigate('/dashboard/organizer');
      } else {
        navigate('/dashboard/user');
      }

    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || err.message);
      // You should display an error to the user here
    }
  }, [hideModal]);

  // --- NEW: SEPARATE REGISTER FUNCTIONS ---
  const registerUser = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/register-user', formData);
      setToken(res.data.token);
      hideModal();
    } catch (err) {
      console.error('User registration failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal]);

  const registerOrganizer = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/register-organizer', formData);
      setToken(res.data.token);
      hideModal();
    } catch (err) {
      console.error('Organizer registration failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal]);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!user, // Create a boolean for easier checks
      login,
      registerUser, // Expose the new functions
      registerOrganizer,
      logout,
    }),
    [token, user, login, registerUser, registerOrganizer, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};