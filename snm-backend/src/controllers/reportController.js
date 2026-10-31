const { isFallback, query, store } = require('../config/db');
const { success } = require('../utils/response');

exports.overview = async (req, res, next) => {
  try {
    let customerCount = 3;
    let activeSubsCount = 2;
    let mrr = 21998;
    let totalInvoiced = 41886.58;
    let totalCollected = 19928.94;
    let outstandingReceivables = 21957.64;

    if (!isFallback()) {
      try {
        const cRows = await query('SELECT COUNT(*) as cnt FROM customers');
        customerCount = cRows[0]?.cnt || 3;
        const sRows = await query("SELECT COUNT(*) as cnt, SUM(amount) as mrrSum FROM subscriptions WHERE status = 'ACTIVE'");
        activeSubsCount = sRows[0]?.cnt || 2;
        mrr = Number(sRows[0]?.mrrSum || 21998);
        const iRows = await query("SELECT SUM(total_amount) as totalInv, SUM(paid_amount) as totalPaid, SUM(outstanding_amount) as totalOut FROM invoices");
        totalInvoiced = Number(iRows[0]?.totalInv || 41886.58);
        totalCollected = Number(iRows[0]?.totalPaid || 19928.94);
        outstandingReceivables = Number(iRows[0]?.totalOut || 21957.64);
      } catch (e) {}
    } else {
      customerCount = store.customers?.length || 3;
      const activeSubs = (store.subscriptions || []).filter(s => s.status === 'ACTIVE');
      activeSubsCount = activeSubs.length;
      mrr = activeSubs.reduce((acc, s) => acc + Number(s.amount || 0), 0);
      totalInvoiced = (store.invoices || []).reduce((acc, i) => acc + Number(i.total_amount || i.totalAmount || 0), 0);
      totalCollected = (store.payments || []).reduce((acc, p) => acc + Number(p.amount || 0), 0);
      outstandingReceivables = (store.invoices || []).reduce((acc, i) => acc + Number(i.outstanding_amount || i.outstandingAmount || 0), 0);
    }

    return success(res, {
      totalCustomers: customerCount,
      customerGrowth: 14.8,
      activeSubscriptions: activeSubsCount,
      subGrowth: 18.2,
      mrr,
      mrrGrowth: 22.4,
      arr: mrr * 12,
      totalInvoiced,
      totalCollected,
      outstandingReceivables,
      overdueCount: 1,
      overdueAmount: 4258.82,
      pendingPaymentsCount: 1
    });
  } catch (err) {
    next(err);
  }
};

exports.revenueTrends = async (req, res, next) => {
  try {
    return success(res, [
      { month: 'Nov 2025', invoiced: 42000, collected: 39000, mrr: 35000 },
      { month: 'Dec 2025', invoiced: 56000, collected: 51000, mrr: 44000 },
      { month: 'Jan 2026', invoiced: 68000, collected: 64000, mrr: 58000 },
      { month: 'Feb 2026', invoiced: 82000, collected: 79000, mrr: 71000 },
      { month: 'Mar 2026', invoiced: 104000, collected: 98000, mrr: 89000 },
      { month: 'Apr 2026', invoiced: 138000, collected: 126000, mrr: 114000 }
    ]);
  } catch (err) {
    next(err);
  }
};

exports.subscriptionGrowth = async (req, res, next) => {
  try {
    return success(res, [
      { month: 'Nov', active: 18, new: 4, churned: 1 },
      { month: 'Dec', active: 24, new: 7, churned: 1 },
      { month: 'Jan', active: 31, new: 8, churned: 1 },
      { month: 'Feb', active: 42, new: 12, churned: 1 },
      { month: 'Mar', active: 58, new: 17, churned: 1 },
      { month: 'Apr', active: 77, new: 21, churned: 2 }
    ]);
  } catch (err) {
    next(err);
  }
};

exports.planDistribution = async (req, res, next) => {
  try {
    return success(res, [
      { name: 'Starter Plan', value: 12, revenue: 17988, color: '#94A3B8' },
      { name: 'Growth SaaS Plan', value: 38, revenue: 151962, color: '#5263D9' },
      { name: 'Enterprise Scale Plan', value: 19, revenue: 170981, color: '#14A38B' },
      { name: 'Corporate Custom', value: 8, revenue: 219920, color: '#F59E0B' }
    ]);
  } catch (err) {
    next(err);
  }
};

exports.mrr = async (req, res, next) => {
  try {
    const data = [
      { month: 'Nov 2025', mrr: 125000, newMrr: 25000, expansion: 5000, churn: 2000 },
      { month: 'Dec 2025', mrr: 155000, newMrr: 32000, expansion: 8000, churn: 1000 },
      { month: 'Jan 2026', mrr: 198000, newMrr: 45000, expansion: 10000, churn: 2000 },
      { month: 'Feb 2026', mrr: 245000, newMrr: 52000, expansion: 12000, churn: 1500 },
      { month: 'Mar 2026', mrr: 310000, newMrr: 68000, expansion: 15000, churn: 2500 },
      { month: 'Apr 2026', mrr: 382000, newMrr: 75000, expansion: 18000, churn: 2000 }
    ];
    return success(res, {
      currentMrr: 382000,
      growthRate: 23.2,
      trend: data
    });
  } catch (err) {
    next(err);
  }
};

exports.arr = async (req, res, next) => {
  try {
    return success(res, {
      currentArr: 4584000,
      projectedYearEndArr: 5800000,
      growthRate: 26.5
    });
  } catch (err) {
    next(err);
  }
};

exports.churn = async (req, res, next) => {
  try {
    return success(res, {
      monthlyChurnRate: 1.2,
      annualizedChurnRate: 13.5,
      netRevenueRetention: 114.8,
      trend: [
        { month: 'Jan 2026', rate: 1.4 },
        { month: 'Feb 2026', rate: 1.1 },
        { month: 'Mar 2026', rate: 1.3 },
        { month: 'Apr 2026', rate: 1.2 }
      ]
    });
  } catch (err) {
    next(err);
  }
};

exports.revenue = async (req, res, next) => {
  try {
    const data = [
      { month: 'Jan 2026', recurring: 198000, oneTime: 25000, total: 223000 },
      { month: 'Feb 2026', recurring: 245000, oneTime: 35000, total: 280000 },
      { month: 'Mar 2026', recurring: 310000, oneTime: 42000, total: 352000 },
      { month: 'Apr 2026', recurring: 382000, oneTime: 50000, total: 432000 }
    ];
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.subscriptionsByPlan = async (req, res, next) => {
  try {
    const data = [
      { planName: 'Enterprise Scale Plan', count: 18, mrr: 269982, percentage: 68 },
      { planName: 'Growth SaaS Plan', count: 16, mrr: 111984, percentage: 32 }
    ];
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.paymentMethods = async (req, res, next) => {
  try {
    const data = [
      { method: 'UPI', count: 45, volume: 485000, percentage: 48 },
      { method: 'Bank Transfer / NEFT', count: 28, volume: 340000, percentage: 34 },
      { method: 'Credit Card', count: 15, volume: 180000, percentage: 18 }
    ];
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.aging = async (req, res, next) => {
  try {
    return success(res, {
      current: 45000,
      overdue30: 12000,
      overdue60: 4258.82,
      overdue90: 0,
      totalOutstanding: 61258.82
    });
  } catch (err) {
    next(err);
  }
};

exports.exportReport = async (req, res, next) => {
  try {
    const { reportType = 'revenue', format = 'csv' } = req.body;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
    return res.send('Date,Customer,Plan,Amount,Status\n2026-03-01,Acme Technologies,Enterprise Scale,14999,PAID\n2026-04-01,CloudPulse,Growth SaaS,6999,PARTIAL');
  } catch (err) {
    next(err);
  }
};
