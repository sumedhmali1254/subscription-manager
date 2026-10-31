import apiClient, { USE_MOCK, mockAdapter } from './api';

export const invoiceService = {
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let invoices = await mockAdapter.getCollection('invoices');
      if (params.search) {
        const q = params.search.toLowerCase();
        invoices = invoices.filter(
          inv => inv.invoiceNumber.toLowerCase().includes(q) ||
                 inv.customerName.toLowerCase().includes(q) ||
                 inv.customerCompany.toLowerCase().includes(q)
        );
      }
      if (params.status && params.status !== 'ALL') {
        invoices = invoices.filter(inv => inv.status === params.status);
      }
      if (params.customerId) {
        invoices = invoices.filter(inv => inv.customerId === params.customerId);
      }
      return { data: invoices, total: invoices.length };
    }
    return apiClient.get('/invoices', { params });
  },

  getById: async (id) => {
    if (USE_MOCK) {
      const inv = await mockAdapter.getItemById('invoices', id);
      if (!inv) throw new Error('Invoice not found');
      return { data: inv };
    }
    return apiClient.get(`/invoices/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      const subtotal = Number(data.subtotal || 0);
      const taxAmount = Number(data.taxAmount || 0);
      const discountAmount = Number(data.discountAmount || 0);
      const totalAmount = subtotal + taxAmount - discountAmount;

      const created = await mockAdapter.createItem('invoices', {
        ...data,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        amountPaid: 0,
        outstandingBalance: totalAmount,
        status: data.status || 'DRAFT',
        paymentHistory: [],
      });
      return { data: created, message: 'Draft invoice created successfully' };
    }
    return apiClient.post('/invoices', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('invoices', id, data);
      return { data: updated, message: 'Invoice updated' };
    }
    return apiClient.put(`/invoices/${id}`, data);
  },

  confirm: async (id) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('invoices', id, { status: 'CONFIRMED' });
      return { data: updated, message: 'Invoice confirmed and issued' };
    }
    return apiClient.post(`/invoices/${id}/confirm`);
  },

  send: async (id) => {
    if (USE_MOCK) {
      const inv = await mockAdapter.getItemById('invoices', id);
      return { success: true, message: `Invoice ${inv.invoiceNumber} emailed to ${inv.customerEmail}` };
    }
    return apiClient.post(`/invoices/${id}/send`);
  },

  cancel: async (id) => {
    if (USE_MOCK) {
      const updated = await mockAdapter.updateItem('invoices', id, { status: 'CANCELLED' });
      return { data: updated, message: 'Invoice cancelled' };
    }
    return apiClient.post(`/invoices/${id}/cancel`);
  },

  recordPayment: async (invoiceId, paymentData) => {
    if (USE_MOCK) {
      const inv = await mockAdapter.getItemById('invoices', invoiceId);
      if (!inv) throw new Error('Invoice not found');

      const payAmount = Number(paymentData.amount);
      const newPaid = Number(inv.amountPaid || 0) + payAmount;
      const newBalance = Math.max(0, Number(inv.totalAmount) - newPaid);
      const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

      // Record payment item
      const paymentRecord = await mockAdapter.createItem('payments', {
        paymentReference: `PAY-${Date.now().toString().slice(-4)}`,
        transactionId: paymentData.transactionId || `TXN-${Date.now().toString().slice(-6)}`,
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerCompany: inv.customerCompany,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        paymentMethod: paymentData.paymentMethod || 'BANK_TRANSFER',
        amount: payAmount,
        paymentDate: paymentData.paymentDate || new Date().toISOString().slice(0, 10),
        status: 'SUCCESS',
        notes: paymentData.notes || 'Recorded via Recurix console',
      });

      // Update invoice
      const updatedHistory = [...(inv.paymentHistory || []), {
        paymentId: paymentRecord.id,
        date: paymentRecord.paymentDate,
        amount: payAmount,
        method: paymentRecord.paymentMethod,
        reference: paymentRecord.transactionId,
      }];

      const updatedInvoice = await mockAdapter.updateItem('invoices', invoiceId, {
        amountPaid: newPaid,
        outstandingBalance: newBalance,
        status: newStatus,
        paymentHistory: updatedHistory,
      });

      return {
        data: {
          invoice: updatedInvoice,
          payment: paymentRecord,
        },
        message: `Payment of ₹${payAmount.toLocaleString()} recorded successfully. New status: ${newStatus}`,
      };
    }
    return apiClient.post(`/invoices/${invoiceId}/payments`, paymentData);
  },
};

