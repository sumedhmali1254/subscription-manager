import apiClient, { USE_MOCK, mockAdapter } from './api';

export const authService = {
  login: async (credentials) => {
    if (USE_MOCK) {
      const users = await mockAdapter.getCollection('users');
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      // Allow demo login with any matching email or standard default
      if (user) {
        const token = `mock-jwt-token-${user.id}-${Date.now()}`;
        return {
          user,
          token,
          message: 'Login successful',
        };
      }
      
      // If user not in mock, create a demo user based on email domain
      const role = credentials.email.includes('admin') ? 'ADMIN' : (credentials.email.includes('staff') ? 'STAFF' : 'CUSTOMER');
      const demoUser = {
        id: `USR-${Date.now()}`,
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: role,
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      return {
        user: demoUser,
        token: `mock-jwt-token-${demoUser.id}`,
        message: 'Login successful',
      };
    }
    return apiClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    if (USE_MOCK) {
      // Role is customer by default for public registration
      const newUser = await mockAdapter.createItem('users', {
        name: userData.name,
        email: userData.email,
        role: 'CUSTOMER',
        company: userData.company || 'Self Employed',
        status: 'ACTIVE',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      });
      return {
        user: newUser,
        token: `mock-jwt-token-${newUser.id}`,
        message: 'Account created successfully',
      };
    }
    return apiClient.post('/auth/register', userData);
  },

  forgotPassword: async (email) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      return { success: true, message: `Password reset instructions sent to ${email}` };
    }
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      return { success: true, message: 'Password has been reset successfully. Please login.' };
    }
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  getCurrentUser: async () => {
    const raw = localStorage.getItem('recurix_user');
    return raw ? JSON.parse(raw) : null;
  },
};

