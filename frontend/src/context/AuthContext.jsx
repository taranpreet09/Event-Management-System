import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useModal } from './ModalContext';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api',
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const { hideModal } = useModal();
  const navigate = useNavigate(); // The only navigate instance you need

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
      } catch (error) {
        console.error("Invalid token:", error);
        setToken(null);
        setUser(null);
      }
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  // highlight-start
  // No longer accepts 'navigate' as a parameter
  const login = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/login', formData);
      setToken(res.data.token);
      hideModal();
      navigate('/dashboard'); // Uses the navigate from the context scope
    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal, navigate]); // Added navigate to dependency array

  const registerUser = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/register-user', formData);
      setToken(res.data.token);
      hideModal();
      navigate('/dashboard');
    } catch (err) {
      console.error('User registration failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal, navigate]);

  const registerOrganizer = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/register-organizer', formData);
      setToken(res.data.token);
      hideModal();
      navigate('/dashboard');
    } catch (err) {
      console.error('Organizer registration failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal, navigate]);
  

  const logout = useCallback(() => {
    setToken(null);
    navigate('/');
  }, [navigate]); // Added navigate to dependency array

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!user,
    login,
    registerUser,
    registerOrganizer,
    logout,
  }), [token, user, login, registerUser, registerOrganizer, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};