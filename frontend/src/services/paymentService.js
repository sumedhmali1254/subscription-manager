import apiClient, { USE_MOCK, mockAdapter } from './api';

export const paymentService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let payments = await mockAdapter.getCollection('payments');
      if (params.search) {
        const q = params.search.toLowerCase();
        payments = payments.filter(
          p => p.paymentReference.toLowerCase().includes(q) ||
               p.customerName.toLowerCase().includes(q) ||
               p.invoiceNumber.toLowerCase().includes(q) ||
               p.transactionId.toLowerCase().includes(q)
        );
      }
      if (params.method && params.method !== 'ALL') {
        payments = payments.filter(p => p.paymentMethod === params.method);
      }
      if (params.customerId) {
        payments = payments.filter(p => p.customerId === params.customerId);
      }
      return { data: payments, total: payments.length };
    }
    return apiClient.get('/payments', { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      const payment = await mockAdapter.getItemById('payments', id);
      if (!payment) throw new Error('Payment record not found');
      return { data: payment };
    }
    return apiClient.get(`/payments/${id}`);
  },

  recordDirectPayment: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('payments', {
        ...data,
        status: 'SUCCESS',
      });
      return { data: created, message: 'Payment recorded successfully' };
    }
    return apiClient.post('/payments', data);
  },
};

