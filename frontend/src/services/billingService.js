import apiClient, { USE_MOCK, mockAdapter } from './api';

export const billingService = {
  getRuns: async () => {
    if (USE_MOCK) {
      const runs = await mockAdapter.getCollection('billingRuns');
      return { data: runs, total: runs.length };
    }
    return apiClient.get('/billing/runs');
  },

  startBillingRun: async () => {
    if (USE_MOCK) {
      const runNumber = `BRUN-${Date.now().toString().slice(-3)}`;
      const activeSubs = (await mockAdapter.getCollection('subscriptions')).filter(s => s.status === 'ACTIVE');
      
      const newRun = await mockAdapter.createItem('billingRuns', {
        runNumber,
        startedAt: new Date().toISOString(),
        completedAt: new Date(Date.now() + 2500).toISOString(),
        status: 'COMPLETED',
        processedCount: activeSubs.length,
        successCount: activeSubs.length,
        failureCount: 0,
        errorSummary: 'Billing cycle executed smoothly. Invoices dispatched to clients.',
        failedInvoices: [],
      });
      return { data: newRun, message: `Billing Run ${runNumber} completed successfully.` };
    }
    return apiClient.post('/billing/run');
  },

  retryFailed: async (runId) => {
    if (USE_MOCK) {
      const run = await mockAdapter.getItemById('billingRuns', runId);
      const updated = await mockAdapter.updateItem('billingRuns', runId, {
        failureCount: 0,
        errorSummary: 'Retried successfully. All payments resolved.',
        failedInvoices: [],
      });
      return { data: updated, message: 'Failed invoices retried and cleared.' };
    }
    return apiClient.post(`/billing/runs/${runId}/retry`);
  },
};

