import apiClient, { USE_MOCK, mockAdapter } from './api';

export const subscriptionService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let subs = await mockAdapter.getCollection('subscriptions');
      if (params.search) {
        const q = params.search.toLowerCase();
        subs = subs.filter(
          s => s.subscriptionNumber.toLowerCase().includes(q) ||
               s.customerName.toLowerCase().includes(q) ||
               s.customerCompany.toLowerCase().includes(q) ||
               s.planName.toLowerCase().includes(q)
        );
      }
      if (params.status && params.status !== 'ALL') {
        subs = subs.filter(s => s.status === params.status);
      }
      if (params.customerId) {
        subs = subs.filter(s => s.customerId === params.customerId);
      }
      return { data: subs, total: subs.length };
    }
    return apiClient.get('/subscriptions', { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      const sub = await mockAdapter.getItemById('subscriptions', id);
      if (!sub) throw new Error('Subscription not found');
      return { data: sub };
    }
    return apiClient.get(`/subscriptions/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      const created = await mockAdapter.createItem('subscriptions', {
        ...data,
        status: data.status || 'CONFIRMED',
        startDate: data.startDate || new Date().toISOString().slice(0, 10),
        nextBillingDate: data.nextBillingDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
        lines: data.lines || [],
        addOns: data.addOns || [],
      });
      return { data: created, message: 'Subscription initialized successfully' };
    }
    return apiClient.post('/subscriptions', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('subscriptions', id, data);
      return { data: updated, message: 'Subscription details updated' };
    }
    return apiClient.put(`/subscriptions/${id}`, data);
  },

  // State Machine Lifecycle Transitions
  transitionStatus: async (id, newStatus, reason = '') => {
    if (USE_MOCK) {
      const sub = await mockAdapter.getItemById('subscriptions', id);
      if (!sub) throw new Error('Subscription not found');

      const updates = { status: newStatus };
      if (newStatus === 'ACTIVE') {
        updates.nextBillingDate = updates.nextBillingDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10);
      } else if (newStatus === 'CLOSED' || newStatus === 'CANCELLED') {
        updates.nextBillingDate = null;
      }

      const updated = await mockAdapter.updateItem('subscriptions', id, updates);
      return { data: updated, message: `Subscription marked as ${newStatus}` };
    }
    return apiClient.post(`/subscriptions/${id}/status`, { status: newStatus, reason });
  },

  renewSubscription: async (id) => {
    if (USE_MOCK) {
      const sub = await mockAdapter.getItemById('subscriptions', id);
      const nextYear = new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10);
      const updated = await mockAdapter.updateItem('subscriptions', id, {
        status: 'ACTIVE',
        endDate: nextYear,
        nextBillingDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
      });
      return { data: updated, message: `Subscription renewed until ${nextYear}` };
    }
    return apiClient.post(`/subscriptions/${id}/renew`);
  },

  addAddOn: async (id, addOn) => {
    if (USE_MOCK) {
      const sub = await mockAdapter.getItemById('subscriptions', id);
      const addOns = [...(sub.addOns || []), {
        id: `ADD-${Date.now()}`,
        name: addOn.name,
        price: Number(addOn.price || 0),
        billingFrequency: addOn.billingFrequency || sub.billingFrequency,
        addedDate: new Date().toISOString().slice(0, 10),
      }];
      const newTotal = Number(sub.totalAmount) + Number(addOn.price || 0);
      const updated = await mockAdapter.updateItem('subscriptions', id, {
        addOns,
        totalAmount: newTotal,
      });
      return { data: updated, message: `Add-on "${addOn.name}" added to subscription` };
    }
    return apiClient.post(`/subscriptions/${id}/add-ons`, addOn);
  },

  removeAddOn: async (id, addOnId) => {
    if (USE_MOCK) {
      const sub = await mockAdapter.getItemById('subscriptions', id);
      const filtered = (sub.addOns || []).filter(a => a.id !== addOnId);
      const updated = await mockAdapter.updateItem('subscriptions', id, { addOns: filtered });
      return { data: updated, message: 'Add-on removed' };
    }
    return apiClient.delete(`/subscriptions/${id}/add-ons/${addOnId}`);
  },

  generateInvoice: async (id) => {
    if (USE_MOCK) {
      const sub = await mockAdapter.getItemById('subscriptions', id);
      const inv = await mockAdapter.createItem('invoices', {
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerCompany: sub.customerCompany,
        customerEmail: sub.customerEmail,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().slice(0, 10),
        subtotal: sub.amount,
        taxAmount: sub.taxAmount,
        discountAmount: sub.discountAmount || 0,
        totalAmount: sub.totalAmount,
        amountPaid: 0,
        outstandingBalance: sub.totalAmount,
        status: 'CONFIRMED',
        currency: sub.currency || 'INR',
        items: (sub.lines || []).map((l, i) => ({
          id: `ITM-NEW-${i}`,
          description: `${l.productName} (Recurring)`,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate: l.taxRate,
          amount: l.total || l.unitPrice * l.quantity,
        })),
        paymentHistory: [],
      });
      return { data: inv, message: `Recurring Invoice ${inv.id} generated` };
    }
    return apiClient.post(`/subscriptions/${id}/generate-invoice`);
  },
};

