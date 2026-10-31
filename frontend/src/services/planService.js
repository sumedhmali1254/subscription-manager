import apiClient, { USE_MOCK, mockAdapter } from './api';

export const planService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let plans = await mockAdapter.getCollection('plans');
      if (params.search) {
        const q = params.search.toLowerCase();
        plans = plans.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (params.frequency && params.frequency !== 'ALL') {
        plans = plans.filter(p => p.billingFrequency === params.frequency);
      }
      return { data: plans, total: plans.length };
    }
    return apiClient.get('/plans', { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      const plan = await mockAdapter.getItemById('plans', id);
      if (!plan) throw new Error('Plan not found');
      return { data: plan };
    }
    return apiClient.get(`/plans/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('plans', {
        ...data,
        subscribersCount: 0,
        activeStatus: data.activeStatus !== false,
      });
      return { data: created, message: 'Plan created successfully' };
    }
    return apiClient.post('/plans', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('plans', id, data);
      return { data: updated, message: 'Plan updated successfully' };
    }
    return apiClient.put(`/plans/${id}`, data);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      await mockAdapter.deleteItem('plans', id);
      return { success: true, message: 'Plan removed' };
    }
    return apiClient.delete(`/plans/${id}`);
  },
};

