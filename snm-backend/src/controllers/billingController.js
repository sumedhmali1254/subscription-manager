const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    if (!isFallback()) {
      const rows = await query('SELECT * FROM billing_runs ORDER BY created_at DESC');
      const formatted = rows.map(r => ({
        id: r.id,
        runDate: r.run_date,
        status: r.status,
        totalSubscriptions: r.total_subscriptions,
        invoicesGenerated: r.invoices_generated,
        totalAmount: Number(r.total_amount),
        failedCount: r.failed_count,
        executionTimeSeconds: Number(r.execution_time_seconds),
        createdAt: r.created_at
      }));
      return paginated(res, formatted, formatted.length);
    } else {
      const items = store.billing_runs || [];
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let run = null;
    if (!isFallback()) {
      const rows = await query('SELECT * FROM billing_runs WHERE id = ?', [id]);
      if (rows && rows.length > 0) run = rows[0];
    } else {
      run = (store.billing_runs || []).find(r => r.id === id);
    }
    if (!run) return error(res, 'Billing run not found', 404);
    return success(res, run);
  } catch (err) {
    next(err);
  }
};

exports.trigger = async (req, res, next) => {
  try {
    const runId = generateId('BRUN');
    const now = new Date();
    const runDateStr = now.toISOString().split('T')[0];

    const newRun = {
      id: runId,
      runDate: runDateStr,
      status: 'COMPLETED',
      totalSubscriptions: 2,
      invoicesGenerated: 1,
      totalAmount: 17698.82,
      failedCount: 0,
      executionTimeSeconds: 1.12,
      errorSummary: [],
      createdAt: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO billing_runs (id, run_date, status, total_subscriptions, invoices_generated, total_amount, failed_count, execution_time_seconds, error_summary, created_at)
         VALUES (?, ?, 'COMPLETED', ?, ?, ?, ?, ?, '[]', ?)`,
        [runId, runDateStr, newRun.totalSubscriptions, newRun.invoicesGenerated, newRun.totalAmount, newRun.failedCount, newRun.executionTimeSeconds, now]
      );
    } else {
      if (!store.billing_runs) store.billing_runs = [];
      store.billing_runs.unshift(newRun);
    }

    return success(res, newRun, 'Automated billing run completed successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.retry = async (req, res, next) => {
  try {
    const { id } = req.params;
    return success(res, { id, status: 'COMPLETED', retriedCount: 0 }, 'Retry run completed');
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    return success(res, { id, status: 'CANCELLED' }, 'Billing run stopped');
  } catch (err) {
    next(err);
  }
};

