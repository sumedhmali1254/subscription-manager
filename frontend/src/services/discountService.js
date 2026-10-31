import apiClient, { USE_MOCK, mockAdapter } from './api';

export const discountService = {
  getAll: async () => {
    if (USE_MOCK) {
      const discounts = await mockAdapter.getCollection('discounts');
      return { data: discounts, total: discounts.length };
    }
    return apiClient.get('/discounts');
  },

  create: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('discounts', {
        ...data,
        usedCount: 0,
        activeStatus: data.activeStatus !== false,
      });
      return { data: created, message: 'Discount rule activated' };
    }
    return apiClient.post('/discounts', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('discounts', id, data);
      return { data: updated, message: 'Discount rule updated' };
    }
    return apiClient.put(`/discounts/${id}`, data);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      await mockAdapter.deleteItem('discounts', id);
      return { success: true, message: 'Discount rule deleted' };
    }
    return apiClient.delete(`/discounts/${id}`);
  },
};

