import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode
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

  const login = useCallback(async (formData, navigate) => {
    try {
      const res = await api.post('/auth/login', formData);
      const decoded = jwtDecode(res.data.token);

      setToken(res.data.token);
      hideModal();

      // Redirect based on role
      if (decoded.user.role === 'organizer') {
        navigate('/dashboard/organizer');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal]);

  const registerUser = useCallback(async (formData, navigate) => {
    try {
      const res = await api.post('/auth/register-user', formData);
      setToken(res.data.token);
      hideModal();
      navigate('/dashboard/user');
    } catch (err) {
      console.error('User registration failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal]);

  const registerOrganizer = useCallback(async (formData, navigate) => {
    try {
      const res = await api.post('/auth/register-organizer', formData);
      setToken(res.data.token);
      hideModal();
      navigate('/dashboard/organizer');
    } catch (err) {
      console.error('Organizer registration failed:', err.response?.data?.msg || err.message);
    }
  }, [hideModal]);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

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
