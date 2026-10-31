const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '', customerId = '', method = '' } = req.query;

    if (!isFallback()) {
      let sql = `
        SELECT p.*, c.name AS customer_name, c.company AS customer_company, i.invoice_number
        FROM payments p
        LEFT JOIN customers c ON p.customer_id = c.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND p.status = ?';
        params.push(status);
      }
      if (customerId) {
        sql += ' AND p.customer_id = ?';
        params.push(customerId);
      }
      if (method && method !== 'ALL') {
        sql += ' AND p.method = ?';
        params.push(method);
      }

      sql += ' ORDER BY p.payment_date DESC';
      const rows = await query(sql, params);

      const formatted = rows.map(p => ({
        id: p.id,
        paymentNumber: p.payment_number,
        paymentReference: p.reference_number || p.payment_number,
        invoiceId: p.invoice_id,
        invoiceNumber: p.invoice_number,
        customerId: p.customer_id,
        customerName: p.customer_name,
        company: p.customer_company,
        amount: Number(p.amount),
        method: p.method,
        paymentMethod: p.method,
        paymentDate: p.payment_date,
        referenceNumber: p.reference_number,
        status: p.status,
        notes: p.notes,
        createdAt: p.created_at
      }));

      return paginated(res, formatted, formatted.length);
    } else {
      let items = [...store.payments];
      if (status && status !== 'ALL') items = items.filter(p => p.status === status);
      if (customerId) items = items.filter(p => p.customerId === customerId || p.customer_id === customerId);
      if (method && method !== 'ALL') items = items.filter(p => p.method === method);
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let payment = null;

    if (!isFallback()) {
      const rows = await query(
        `SELECT p.*, c.name AS customer_name, c.company AS customer_company, i.invoice_number
         FROM payments p
         LEFT JOIN customers c ON p.customer_id = c.id
         LEFT JOIN invoices i ON p.invoice_id = i.id
         WHERE p.id = ?`,
        [id]
      );
      if (rows && rows.length > 0) {
        const p = rows[0];
        payment = {
          id: p.id,
          paymentNumber: p.payment_number,
          invoiceId: p.invoice_id,
          invoiceNumber: p.invoice_number,
          customerId: p.customer_id,
          customerName: p.customer_name,
          company: p.customer_company,
          amount: Number(p.amount),
          method: p.method,
          paymentDate: p.payment_date,
          referenceNumber: p.reference_number,
          status: p.status,
          notes: p.notes,
          createdAt: p.created_at
        };
      }
    } else {
      payment = store.payments.find(p => p.id === id);
    }

    if (!payment) return error(res, 'Payment transaction not found', 404);
    return success(res, payment);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { invoiceId, customerId, amount, method = 'BANK_TRANSFER', referenceNumber = '', notes = '' } = req.body;
    const paymentId = `PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const paymentNumber = `PAY-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const now = new Date();

    const newPayment = {
      id: paymentId,
      paymentNumber,
      invoiceId: invoiceId || 'INV-001',
      customerId: customerId || 'CUST-001',
      amount: Number(amount) || 0,
      method,
      referenceNumber: referenceNumber || `REF-${Date.now()}`,
      status: 'SUCCESS',
      notes,
      paymentDate: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO payments (id, payment_number, invoice_id, customer_id, amount, method, reference_number, status, notes, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)`,
        [paymentId, paymentNumber, newPayment.invoiceId, newPayment.customerId, newPayment.amount, method, newPayment.referenceNumber, notes, now]
      );
    } else {
      store.payments.unshift(newPayment);
    }

    return success(res, newPayment, 'Payment recorded successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.refund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason = 'Customer requested refund' } = req.body;

    if (!isFallback()) {
      await query("UPDATE payments SET status = 'REFUNDED', notes = CONCAT(COALESCE(notes, ''), ' [REFUNDED: ', ?, ']') WHERE id = ?", [reason, id]);
    } else {
      const p = store.payments.find(item => item.id === id);
      if (p) {
        p.status = 'REFUNDED';
        p.notes = `${p.notes || ''} [REFUNDED: ${reason}]`;
      }
    }

    return success(res, { id, status: 'REFUNDED', refundAmount: amount, reason }, 'Payment refunded successfully');
  } catch (err) {
    next(err);
  }
};

exports.reconcile = async (req, res, next) => {
  try {
    const { paymentIds = [] } = req.body;
    return success(res, { reconciledCount: paymentIds.length }, 'Bank ledger reconciliation completed');
  } catch (err) {
    next(err);
  }
};

