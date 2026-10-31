import apiClient, { USE_MOCK, mockAdapter } from './api';

export const customerService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let customers = await mockAdapter.getCollection('customers');
      if (params.search) {
        const q = params.search.toLowerCase();
        customers = customers.filter(
          c => c.name.toLowerCase().includes(q) ||
               c.company.toLowerCase().includes(q) ||
               c.email.toLowerCase().includes(q)
        );
      }
      if (params.status && params.status !== 'ALL') {
        customers = customers.filter(c => c.status === params.status);
      }
      return { data: customers, total: customers.length };
    }
    return apiClient.get('/customers', { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      const customer = await mockAdapter.getItemById('customers', id);
      if (!customer) throw new Error('Customer not found');
      return { data: customer };
    }
    return apiClient.get(`/customers/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('customers', {
        ...data,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        status: data.status || 'ACTIVE',
      });
      return { data: created, message: 'Customer created successfully' };
    }
    return apiClient.post('/customers', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('customers', id, data);
      return { data: updated, message: 'Customer updated successfully' };
    }
    return apiClient.put(`/customers/${id}`, data);
  },

  delete: async (id) => {
    if (USE_MOCK) {
      await mockAdapter.deleteItem('customers', id);
      return { success: true, message: 'Customer archived' };
    }
    return apiClient.delete(`/customers/${id}`);
  },

  getCustomerSubscriptions: async (customerId) => {
    if (USE_MOCK) {
      const subs = await mockAdapter.getCollection('subscriptions');
      return { data: subs.filter(s => s.customerId === customerId) };
    }
    return apiClient.get(`/customers/${customerId}/subscriptions`);
  },

  getCustomerInvoices: async (customerId) => {
    if (USE_MOCK) {
      const invs = await mockAdapter.getCollection('invoices');
      return { data: invs.filter(i => i.customerId === customerId) };
    }
    return apiClient.get(`/customers/${customerId}/invoices`);
  },

  getCustomerPayments: async (customerId) => {
    if (USE_MOCK) {
      const pays = await mockAdapter.getCollection('payments');
      return { data: pays.filter(p => p.customerId === customerId) };
    }
    return apiClient.get(`/customers/${customerId}/payments`);
  },
};

