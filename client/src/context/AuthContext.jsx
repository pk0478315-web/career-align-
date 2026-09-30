import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const THEMES = [
  { 
    id: 'light', 
    name: 'Clean Light', 
    tagline: 'Crisp & Modern',
    description: 'Crisp minimal white workspace with ocean sky accents',
    color: '#0284c7', 
    secondaryColor: '#0d9488',
    bg: '#f8fafc', 
    cardBg: '#ffffff',
    icon: 'Sun' 
  },
  { 
    id: 'dark', 
    name: 'Midnight Dark', 
    tagline: 'Deep Cyberpunk',
    description: 'High contrast dark slate with electric cyan neon',
    color: '#38bdf8', 
    secondaryColor: '#2dd4bf',
    bg: '#0f172a', 
    cardBg: '#1e293b',
    icon: 'Moon' 
  },
  { 
    id: 'emerald', 
    name: 'Emerald Forest', 
    tagline: 'Focus & Nature',
    description: 'Deep soothing evergreen forest with mint glow',
    color: '#10b981', 
    secondaryColor: '#34d399',
    bg: '#051b16', 
    cardBg: '#0b2b23',
    icon: 'Sparkles' 
  },
  { 
    id: 'sunset', 
    name: 'Sunset Aurora', 
    tagline: 'Cosmic Twilight',
    description: 'Deep cosmic violet with radiant rose & magenta',
    color: '#ec4899', 
    secondaryColor: '#a855f7',
    bg: '#130a24', 
    cardBg: '#20113b',
    icon: 'Flame' 
  }
];

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

  const selectTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    if (user) {
      api.updateProfile({ themePreference: newTheme }).catch(() => {});
    }
  };

  const toggleTheme = () => {
    const themeOrder = ['light', 'dark', 'emerald', 'sunset'];
    const nextIdx = (themeOrder.indexOf(theme) + 1) % themeOrder.length;
    selectTheme(themeOrder[nextIdx]);
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
          if (res.data.profile?.themePreference) {
            setTheme(res.data.profile.themePreference);
          }
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
      if (res.data.profile?.themePreference) {
        setTheme(res.data.profile.themePreference);
      }
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
      if (updates.themePreference) {
        setTheme(updates.themePreference);
      }
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
        selectTheme,
        toggleTheme,
        themes: THEMES,
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
