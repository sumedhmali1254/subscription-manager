const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId, generateDocNumber } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '', customerId = '' } = req.query;

    if (!isFallback()) {
      let sql = `
        SELECT s.*, c.name AS customer_name, c.company AS customer_company, p.name AS plan_name
        FROM subscriptions s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN subscription_plans p ON s.plan_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND s.status = ?';
        params.push(status);
      }
      if (customerId) {
        sql += ' AND s.customer_id = ?';
        params.push(customerId);
      }

      sql += ' ORDER BY s.created_at DESC';
      const rows = await query(sql, params);

      const formatted = rows.map(s => ({
        id: s.id,
        subscriptionNumber: s.subscription_number,
        customerId: s.customer_id,
        customerName: s.customer_name,
        company: s.customer_company,
        customerCompany: s.customer_company,
        planId: s.plan_id,
        planName: s.plan_name,
        quotationId: s.quotation_id,
        billingFrequency: s.billing_frequency,
        quantity: s.quantity,
        unitPrice: Number(s.unit_price),
        amount: Number(s.amount),
        startDate: s.start_date,
        currentPeriodStart: s.current_period_start,
        currentPeriodEnd: s.current_period_end,
        nextBillingDate: s.next_billing_date,
        expiryDate: s.expiry_date,
        autoRenew: Boolean(s.auto_renew),
        status: s.status,
        cancellationReason: s.cancellation_reason,
        createdAt: s.created_at
      }));

      return paginated(res, formatted, formatted.length);
    } else {
      let items = [...store.subscriptions];
      if (status && status !== 'ALL') items = items.filter(s => s.status === status);
      if (customerId) items = items.filter(s => s.customerId === customerId || s.customer_id === customerId);
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let subscription = null;

    if (!isFallback()) {
      const rows = await query(
        `SELECT s.*, c.name AS customer_name, c.company AS customer_company, c.email AS customer_email, p.name AS plan_name
         FROM subscriptions s
         LEFT JOIN customers c ON s.customer_id = c.id
         LEFT JOIN subscription_plans p ON s.plan_id = p.id
         WHERE s.id = ?`,
        [id]
      );
      if (rows && rows.length > 0) {
        const s = rows[0];
        const invoices = await query('SELECT * FROM invoices WHERE subscription_id = ? ORDER BY invoice_date DESC', [id]);
        subscription = {
          id: s.id,
          subscriptionNumber: s.subscription_number,
          customerId: s.customer_id,
          customerName: s.customer_name,
          company: s.customer_company,
          email: s.customer_email,
          planId: s.plan_id,
          planName: s.plan_name,
          quotationId: s.quotation_id,
          billingFrequency: s.billing_frequency,
          quantity: s.quantity,
          unitPrice: Number(s.unit_price),
          amount: Number(s.amount),
          startDate: s.start_date,
          currentPeriodStart: s.current_period_start,
          currentPeriodEnd: s.current_period_end,
          nextBillingDate: s.next_billing_date,
          expiryDate: s.expiry_date,
          autoRenew: Boolean(s.auto_renew),
          status: s.status,
          cancellationReason: s.cancellation_reason,
          invoices: invoices.map(i => ({
            id: i.id,
            invoiceNumber: i.invoice_number,
            invoiceDate: i.invoice_date,
            dueDate: i.due_date,
            totalAmount: Number(i.total_amount),
            paidAmount: Number(i.paid_amount),
            outstandingAmount: Number(i.outstanding_amount),
            status: i.status
          })),
          createdAt: s.created_at
        };
      }
    } else {
      subscription = store.subscriptions.find(s => s.id === id);
    }

    if (!subscription) return error(res, 'Subscription not found', 404);
    return success(res, subscription);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      customerId, planId, startDate = new Date().toISOString().split('T')[0],
      quantity = 1, unitPrice = 0, amount = 0, billingFrequency = 'MONTHLY', autoRenew = true
    } = req.body;

    if (!customerId || !planId) {
      return error(res, 'Customer ID and Plan ID are required', 400);
    }

    const id = generateId('SUB');
    const subscriptionNumber = generateDocNumber('SUB', Math.floor(Math.random() * 9000) + 1000);
    const start = new Date(startDate);
    const nextBill = new Date(start);
    nextBill.setMonth(nextBill.getMonth() + 1);
    const nextBillStr = nextBill.toISOString().split('T')[0];
    const now = new Date();

    const newSub = {
      id,
      subscriptionNumber,
      customerId,
      planId,
      billingFrequency,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      amount: Number(amount) || Number(quantity) * Number(unitPrice),
      startDate,
      currentPeriodStart: startDate,
      currentPeriodEnd: nextBillStr,
      nextBillingDate: nextBillStr,
      autoRenew,
      status: 'ACTIVE',
      createdAt: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO subscriptions (id, subscription_number, customer_id, plan_id, billing_frequency, quantity, unit_price, amount, start_date, current_period_start, current_period_end, next_billing_date, auto_renew, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
        [id, subscriptionNumber, customerId, planId, billingFrequency, quantity, unitPrice, newSub.amount, startDate, startDate, nextBillStr, nextBillStr, autoRenew, now]
      );
    } else {
      store.subscriptions.unshift(newSub);
    }

    return success(res, newSub, 'Subscription activated successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      const { quantity, unitPrice, amount, autoRenew } = req.body;
      await query(
        `UPDATE subscriptions SET
           quantity = COALESCE(?, quantity),
           unit_price = COALESCE(?, unit_price),
           amount = COALESCE(?, amount),
           auto_renew = COALESCE(?, auto_renew)
         WHERE id = ?`,
        [quantity, unitPrice, amount, autoRenew, id]
      );
    } else {
      const s = store.subscriptions.find(item => item.id === id);
      if (s) Object.assign(s, req.body);
    }
    return success(res, { id, ...req.body }, 'Subscription updated');
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    if (!status) return error(res, 'Status is required', 400);

    if (!isFallback()) {
      await query("UPDATE subscriptions SET status = ?, cancellation_reason = COALESCE(?, cancellation_reason) WHERE id = ?", [status, reason, id]);
    } else {
      const s = store.subscriptions.find(item => item.id === id);
      if (s) {
        s.status = status;
        if (reason) s.cancellationReason = reason;
      }
    }
    return success(res, { id, status }, `Subscription marked as ${status}`);
  } catch (err) {
    next(err);
  }
};

exports.pause = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE subscriptions SET status = 'PAUSED' WHERE id = ?", [id]);
    } else {
      const s = store.subscriptions.find(item => item.id === id);
      if (s) s.status = 'PAUSED';
    }
    return success(res, { id, status: 'PAUSED' }, 'Subscription has been paused');
  } catch (err) {
    next(err);
  }
};

exports.resume = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE subscriptions SET status = 'ACTIVE' WHERE id = ?", [id]);
    } else {
      const s = store.subscriptions.find(item => item.id === id);
      if (s) s.status = 'ACTIVE';
    }
    return success(res, { id, status: 'ACTIVE' }, 'Subscription has resumed');
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by user' } = req.body;
    if (!isFallback()) {
      await query("UPDATE subscriptions SET status = 'CLOSED', cancellation_reason = ? WHERE id = ?", [reason, id]);
    } else {
      const s = store.subscriptions.find(item => item.id === id);
      if (s) {
        s.status = 'CLOSED';
        s.cancellationReason = reason;
      }
    }
    return success(res, { id, status: 'CLOSED', reason }, 'Subscription closed successfully');
  } catch (err) {
    next(err);
  }
};

exports.renew = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const nextPeriod = new Date(now);
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
    const nextBillStr = nextPeriod.toISOString().split('T')[0];

    if (!isFallback()) {
      await query("UPDATE subscriptions SET next_billing_date = ?, status = 'ACTIVE' WHERE id = ?", [nextBillStr, id]);
    } else {
      const s = store.subscriptions.find(item => item.id === id);
      if (s) {
        s.nextBillingDate = nextBillStr;
        s.status = 'ACTIVE';
      }
    }
    return success(res, { id, nextBillingDate: nextBillStr, status: 'ACTIVE' }, 'Subscription renewed for next cycle');
  } catch (err) {
    next(err);
  }
};

exports.changePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;
    if (!planId) return error(res, 'New planId is required', 400);

    if (!isFallback()) {
      await query('UPDATE subscriptions SET plan_id = ? WHERE id = ?', [planId, id]);
    } else {
      const s = store.subscriptions.find(item => item.id === id);
      if (s) s.planId = planId;
    }
    return success(res, { id, planId }, 'Subscription plan modified');
  } catch (err) {
    next(err);
  }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { id } = req.params;
    let invoices = [];
    if (!isFallback()) {
      invoices = await query('SELECT * FROM invoices WHERE subscription_id = ? ORDER BY invoice_date DESC', [id]);
    } else {
      invoices = store.invoices.filter(i => i.subscription_id === id || i.subscriptionId === id);
    }
    return success(res, invoices);
  } catch (err) {
    next(err);
  }
};

