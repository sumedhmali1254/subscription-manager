import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('recurix_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default to Admin demo user for seamless out-of-the-box hackathon experience
    return {
      id: 'USR-001',
      name: 'Sumedh Mali',
      email: 'admin@brightloop.io',
      role: ROLES.ADMIN,
      company: 'Brightloop Software',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('recurix_token') || 'demo-auth-token-admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('recurix_user', JSON.stringify(user));
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
      setUser(res.user);
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
      setUser(res.user);
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

  // Quick switch role for instant live demo testing
  const switchDemoRole = (newRole) => {
    if (newRole === ROLES.ADMIN) {
      setUser({
        id: 'USR-001',
        name: 'Sumedh Mali',
        email: 'admin@brightloop.io',
        role: ROLES.ADMIN,
        company: 'Brightloop Software',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
    } else if (newRole === ROLES.STAFF) {
      setUser({
        id: 'USR-002',
        name: 'Sarah Jenkins',
        email: 'staff@brightloop.io',
        role: ROLES.STAFF,
        company: 'Brightloop Software',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      });
    } else {
      setUser({
        id: 'USR-003',
        name: 'Priya Sharma',
        email: 'customer@acme.com',
        role: ROLES.CUSTOMER,
        customerId: 'CUST-001',
        company: 'Acme Technologies Pvt Ltd',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      });
    }
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
        switchDemoRole,
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

