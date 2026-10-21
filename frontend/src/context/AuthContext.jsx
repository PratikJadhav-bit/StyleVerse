import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('sv_token', access_token);
      localStorage.setItem('sv_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authService.register({ name, email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('sv_token', access_token);
      localStorage.setItem('sv_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      const updated = res.data;
      localStorage.setItem('sv_user', JSON.stringify(updated));
      setUser(updated);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
