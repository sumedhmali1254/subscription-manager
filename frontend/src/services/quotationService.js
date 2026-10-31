import apiClient, { USE_MOCK, mockAdapter } from './api';

export const quotationService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let quotations = await mockAdapter.getCollection('quotations');
      if (params.search) {
        const q = params.search.toLowerCase();
        quotations = quotations.filter(
          item => item.quotationNumber.toLowerCase().includes(q) ||
                  item.customerName.toLowerCase().includes(q) ||
                  item.customerCompany.toLowerCase().includes(q)
        );
      }
      if (params.status && params.status !== 'ALL') {
        quotations = quotations.filter(item => item.status === params.status);
      }
      return { data: quotations, total: quotations.length };
    }
    return apiClient.get('/quotations', { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      const quotation = await mockAdapter.getItemById('quotations', id);
      if (!quotation) throw new Error('Quotation not found');
      return { data: quotation };
    }
    return apiClient.get(`/quotations/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('quotations', {
        ...data,
        status: data.status || 'DRAFT',
      });
      return { data: created, message: 'Quotation created successfully' };
    }
    return apiClient.post('/quotations', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('quotations', id, data);
      return { data: updated, message: 'Quotation updated successfully' };
    }
    return apiClient.put(`/quotations/${id}`, data);
  },

  sendQuotation: async (id) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('quotations', id, { status: 'SENT' });
      return { data: updated, message: 'Quotation dispatched to customer via email' };
    }
    return apiClient.post(`/quotations/${id}/send`);
  },

  confirmQuotation: async (id) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('quotations', id, { status: 'CONFIRMED' });
      return { data: updated, message: 'Quotation confirmed by customer' };
    }
    return apiClient.post(`/quotations/${id}/confirm`);
  },

  convertToSubscription: async (id) => {
    if (USE_MOCK) {
      const quote = await mockAdapter.getItemById('quotations', id);
      if (!quote) throw new Error('Quotation not found');

      // Create new subscription
      const sub = await mockAdapter.createItem('subscriptions', {
        customerId: quote.customerId,
        customerName: quote.customerName,
        customerCompany: quote.customerCompany,
        customerEmail: quote.customerEmail,
        planId: quote.planId || 'PLAN-001',
        planName: quote.planName || 'Converted Plan',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        amount: quote.subtotal,
        taxAmount: quote.taxAmount,
        discountAmount: quote.discountAmount,
        totalAmount: quote.totalAmount,
        currency: 'INR',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
        nextBillingDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
        paymentTerms: quote.paymentTerms || 'NET 15',
        autoRenew: true,
        lines: quote.lines || [],
        addOns: [],
      });

      // Update quote status
      await mockAdapter.updateItem('quotations', id, {
        status: 'CONVERTED',
        convertedSubscriptionId: sub.id,
      });

      return { data: sub, message: `Quotation converted to Subscription ${sub.id}` };
    }
    return apiClient.post(`/quotations/${id}/convert`);
  },

  getTemplates: async () => {
    if (USE_MOCK) {
      const tmpls = await mockAdapter.getCollection('quotationTemplates');
      return { data: tmpls };
    }
    return apiClient.get('/quotations/templates');
  },
};

