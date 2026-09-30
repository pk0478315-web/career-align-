import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Check initial session
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success) {
          setUser(res.data.user);
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      setProfile(res.data.profile);
      return res.data;
    }
  };

  const register = async (email, password, displayName) => {
    const res = await api.register({ email, password, displayName });
    if (res.success) {
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(res.data.user);
      setProfile(res.data.profile);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateUserProfile = async (updates) => {
    const res = await api.updateProfile(updates);
    if (res.success) {
      setProfile(res.data);
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: Boolean(user),
        loading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
