import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useModal } from './ModalContext';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const api = axios.create({
  baseURL: 'http://localhost:1111/api', // Using your correct port
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const { hideModal } = useModal();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Wrap functions in useCallback
  const login = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/login', formData);
      setToken(res.data.token);
      hideModal();
    } catch (err) {
      if (err.response) {
        console.error('Login failed:', err.response.data.msg);
      } else if (err.request) {
        console.error('Login failed: No response from server. Is the server running?');
      } else {
        console.error('Login Error:', err.message);
      }
    }
  }, [hideModal]);

  const register = useCallback(async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      setToken(res.data.token);
      hideModal();
    } catch (err) {
      if (err.response) {
        console.error('Registration failed:', err.response.data.msg);
      } else if (err.request) {
        console.error('Registration failed: No response from server. Is the server running?');
      } else {
        console.error('Registration Error:', err.message);
      }
    }
  }, [hideModal]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Memoize the context value
  const value = useMemo(
    () => ({
      token,
      user,
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};