import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

import { API_BASE } from '../config/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      setUser(res.data.data.user);
    } catch (err) {
      console.error(err);
      setToken(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    const receivedToken = res.data.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
    setUser(res.data.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
    const payload = res.data?.data;
    if (payload?.token) {
      const receivedToken = payload.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(payload.user || { id: payload.id || payload._id, name: payload.name, email: payload.email });
      return res.data;
    }
    return await login(email, password);
  };

  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
