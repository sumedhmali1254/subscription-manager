import apiClient, { USE_MOCK, mockAdapter } from './api';

export const auditService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let logs = await mockAdapter.getCollection('auditLogs');
      if (params.search) {
        const q = params.search.toLowerCase();
        logs = logs.filter(
          l => l.userName.toLowerCase().includes(q) ||
               l.action.toLowerCase().includes(q) ||
               l.description.toLowerCase().includes(q) ||
               l.module.toLowerCase().includes(q)
        );
      }
      return { data: logs, total: logs.length };
    }
    return apiClient.get('/audit-logs', { params });
  },
};

