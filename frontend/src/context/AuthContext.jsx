import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('recurix_user');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    // Default admin user (no avatar photo — initials displayed)
    return {
      id: 'USR-001',
      name: 'Sumedh Mali',
      email: 'admin@brightloop.io',
      role: ROLES.ADMIN,
      company: 'Brightloop Software',
      status: 'ACTIVE',
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('recurix_token') || 'demo-auth-token-admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Strip any stored avatar URLs before persisting
      const { avatar, avatar_url, ...safeUser } = user;
      localStorage.setItem('recurix_user', JSON.stringify(safeUser));
    } else {
      localStorage.removeItem('recurix_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('recurix_token', token);
    } else {
      localStorage.removeItem('recurix_token');
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      // Strip avatar URL from login response — use initials only
      const { avatar, avatar_url, ...safeUser } = res.user || {};
      setUser(safeUser);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      const { avatar, avatar_url, ...safeUser } = res.user || {};
      setUser(safeUser);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('recurix_user');
    localStorage.removeItem('recurix_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === ROLES.ADMIN,
        isStaff: user?.role === ROLES.STAFF,
        isCustomer: user?.role === ROLES.CUSTOMER,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
