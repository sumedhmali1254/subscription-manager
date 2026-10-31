import apiClient, { USE_MOCK, mockAdapter } from './api';

export const userService = {
  getAll: async () => {
    if (USE_MOCK) {
      const users = await mockAdapter.getCollection('users');
      return { data: users, total: users.length };
    }
    return apiClient.get('/users');
  },

  create: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('users', {
        ...data,
        status: 'ACTIVE',
        avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      });
      return { data: created, message: 'Team member added successfully' };
    }
    return apiClient.post('/users', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('users', id, data);
      return { data: updated, message: 'User updated' };
    }
    return apiClient.put(`/users/${id}`, data);
  },

  toggleStatus: async (id, currentStatus) => {
    if (USE_MOCK) {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const updated = await mockAdapter.updateItem('users', id, { status: nextStatus });
      return { data: updated, message: `User marked as ${nextStatus}` };
    }
    return apiClient.patch(`/users/${id}/status`, { status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  },

  delete: async (id) => {
    if (USE_MOCK) {
      await mockAdapter.deleteItem('users', id);
      return { success: true, message: 'User removed' };
    }
    return apiClient.delete(`/users/${id}`);
  },
};

