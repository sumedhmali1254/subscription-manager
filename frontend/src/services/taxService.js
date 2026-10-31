import apiClient, { USE_MOCK, mockAdapter } from './api';

export const taxService = {
  getAll: async () => {
    if (USE_MOCK) {
      const taxes = await mockAdapter.getCollection('taxes');
      return { data: taxes, total: taxes.length };
    }
    return apiClient.get('/taxes');
  },

  create: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('taxes', {
        ...data,
        activeStatus: data.activeStatus !== false,
      });
      return { data: created, message: 'Tax configuration added' };
    }
    return apiClient.post('/taxes', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('taxes', id, data);
      return { data: updated, message: 'Tax configuration updated' };
    }
    return apiClient.put(`/taxes/${id}`, data);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      await mockAdapter.deleteItem('taxes', id);
      return { success: true, message: 'Tax configuration deleted' };
    }
    return apiClient.delete(`/taxes/${id}`);
  },
};

