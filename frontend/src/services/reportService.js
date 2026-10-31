import apiClient, { USE_MOCK, mockAdapter } from './api';

export const reportService = {
  getOverviewMetrics: async (dateRange = '30d') => {
    if (USE_MOCK) {
      const customers = await mockAdapter.getCollection('customers');
      const subs = await mockAdapter.getCollection('subscriptions');
      const invoices = await mockAdapter.getCollection('invoices');
      const payments = await mockAdapter.getCollection('payments');

      const activeSubs = subs.filter(s => s.status === 'ACTIVE');
      
      // Calculate MRR from active subscriptions
      const mrr = activeSubs.reduce((acc, s) => {
        const amt = Number(s.unitPrice || s.subtotal || s.amount || 0);
        if (s.billingFrequency === 'YEARLY') return acc + (amt / 12);
        if (s.billingFrequency === 'WEEKLY') return acc + (amt * 4.33);
        if (s.billingFrequency === 'DAILY') return acc + (amt * 30);
        return acc + amt;
      }, 0);

      const arr = mrr * 12;

      // Invoiced revenue
      const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.totalAmount || 0), 0);
      
      // Collected payments
      const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

      // Outstanding receivables
      const outstandingReceivables = invoices.reduce((acc, i) => acc + Number(i.outstandingBalance || 0), 0);

      // Overdue invoices count & amount
      const overdueList = invoices.filter(i => i.status === 'OVERDUE');
      const overdueAmount = overdueList.reduce((acc, i) => acc + Number(i.outstandingBalance || 0), 0);

      return {
        data: {
          totalCustomers: customers.length,
          customerGrowth: 14.8,
          activeSubscriptions: activeSubs.length,
          subGrowth: 18.2,
          mrr,
          mrrGrowth: 22.4,
          arr,
          totalInvoiced,
          totalCollected,
          outstandingReceivables,
          overdueCount: overdueList.length,
          overdueAmount,
          pendingPaymentsCount: invoices.filter(i => i.status === 'CONFIRMED').length,
        }
      };
    }
    return apiClient.get('/reports/overview', { params: { range: dateRange } });
  },

  getRevenueTrends: async () => {
    if (USE_MOCK) {
      return {
        data: [
          { month: 'May 2026', invoiced: 42000, collected: 39000, mrr: 35000 },
          { month: 'Jun 2026', invoiced: 56000, collected: 51000, mrr: 44000 },
          { month: 'Jul 2026', invoiced: 68000, collected: 64000, mrr: 58000 },
          { month: 'Aug 2026', invoiced: 82000, collected: 79000, mrr: 71000 },
          { month: 'Sep 2026', invoiced: 104000, collected: 98000, mrr: 89000 },
          { month: 'Oct 2026', invoiced: 138000, collected: 126000, mrr: 114000 },
        ]
      };
    }
    return apiClient.get('/reports/revenue-trends');
  },

  getSubscriptionGrowth: async () => {
    if (USE_MOCK) {
      return {
        data: [
          { month: 'May', active: 18, new: 4, churned: 1 },
          { month: 'Jun', active: 24, new: 7, churned: 1 },
          { month: 'Jul', active: 31, new: 8, churned: 1 },
          { month: 'Aug', active: 42, new: 12, churned: 1 },
          { month: 'Sep', active: 58, new: 17, churned: 1 },
          { month: 'Oct', active: 77, new: 21, churned: 2 },
        ]
      };
    }
    return apiClient.get('/reports/subscription-growth');
  },

  getPlanDistribution: async () => {
    if (USE_MOCK) {
      return {
        data: [
          { name: 'Starter Plan', value: 12, revenue: 17988, color: '#94A3B8' },
          { name: 'Professional Business', value: 38, revenue: 151962, color: '#5263D9' },
          { name: 'Enterprise Scale', value: 19, revenue: 170981, color: '#14A38B' },
          { name: 'Annual Scale Corporate', value: 8, revenue: 719920, color: '#F59E0B' },
        ]
      };
    }
    return apiClient.get('/reports/plan-distribution');
  },

  getPaymentMethodsBreakdown: async () => {
    if (USE_MOCK) {
      return {
        data: [
          { method: 'Bank Transfer (NEFT/RTGS)', amount: 620000, percentage: 55 },
          { method: 'UPI (Razorpay/GooglePay)', amount: 320000, percentage: 28 },
          { method: 'Credit/Debit Cards', amount: 145000, percentage: 13 },
          { method: 'Other / Cash', amount: 45000, percentage: 4 },
        ]
      };
    }
    return apiClient.get('/reports/payment-methods');
  },
};

