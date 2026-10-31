const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId, generateDocNumber } = require('../utils/idGenerator');
const { calculateInvoiceTotals } = require('../utils/calculations');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '', customerId = '', subscriptionId = '' } = req.query;

    if (!isFallback()) {
      let sql = `
        SELECT i.*, c.name AS customer_name, c.company AS customer_company, sub.subscription_number
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN subscriptions sub ON i.subscription_id = sub.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND i.status = ?';
        params.push(status);
      }
      if (customerId) {
        sql += ' AND i.customer_id = ?';
        params.push(customerId);
      }
      if (subscriptionId) {
        sql += ' AND i.subscription_id = ?';
        params.push(subscriptionId);
      }

      sql += ' ORDER BY i.created_at DESC';
      const rows = await query(sql, params);

      const formatted = rows.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        subscriptionId: inv.subscription_id,
        subscriptionNumber: inv.subscription_number || inv.subscription_id,
        customerId: inv.customer_id,
        customerName: inv.customer_name,
        company: inv.customer_company,
        customerCompany: inv.customer_company,
        invoiceDate: inv.invoice_date,
        dueDate: inv.due_date,
        subtotal: Number(inv.subtotal),
        discountAmount: Number(inv.discount_amount),
        taxAmount: Number(inv.tax_amount),
        totalAmount: Number(inv.total_amount),
        paidAmount: Number(inv.paid_amount),
        amountPaid: Number(inv.paid_amount),
        outstandingAmount: Number(inv.outstanding_amount),
        outstandingBalance: Number(inv.outstanding_amount),
        status: inv.status,
        notes: inv.notes,
        createdAt: inv.created_at
      }));

      return paginated(res, formatted, formatted.length);
    } else {
      let items = [...store.invoices];
      if (status && status !== 'ALL') items = items.filter(i => i.status === status);
      if (customerId) items = items.filter(i => i.customerId === customerId || i.customer_id === customerId);
      if (subscriptionId) items = items.filter(i => i.subscriptionId === subscriptionId || i.subscription_id === subscriptionId);
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let invoice = null;

    if (!isFallback()) {
      const rows = await query(
        `SELECT i.*, c.name AS customer_name, c.company AS customer_company, c.email AS customer_email,
                c.billing_street, c.billing_city, c.billing_state, c.billing_pincode, c.billing_country, c.gstin
         FROM invoices i
         LEFT JOIN customers c ON i.customer_id = c.id
         WHERE i.id = ?`,
        [id]
      );
      if (rows && rows.length > 0) {
        const inv = rows[0];
        const lineItems = await query('SELECT * FROM invoice_line_items WHERE invoice_id = ?', [id]);
        const payments = await query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC', [id]);
        invoice = {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          subscriptionId: inv.subscription_id,
          customerId: inv.customer_id,
          customerName: inv.customer_name,
          company: inv.customer_company,
          email: inv.customer_email,
          gstin: inv.gstin,
          billingAddress: {
            street: inv.billing_street,
            city: inv.billing_city,
            state: inv.billing_state,
            zipCode: inv.billing_pincode,
            country: inv.billing_country
          },
          invoiceDate: inv.invoice_date,
          dueDate: inv.due_date,
          subtotal: Number(inv.subtotal),
          discountAmount: Number(inv.discount_amount),
          taxAmount: Number(inv.tax_amount),
          totalAmount: Number(inv.total_amount),
          paidAmount: Number(inv.paid_amount),
          outstandingAmount: Number(inv.outstanding_amount),
          status: inv.status,
          notes: inv.notes,
          lineItems: lineItems.map(li => ({
            id: li.id,
            description: li.description,
            quantity: li.quantity,
            unitPrice: Number(li.unit_price),
            taxRate: Number(li.tax_rate),
            amount: Number(li.amount)
          })),
          payments: payments.map(p => ({
            id: p.id,
            paymentNumber: p.payment_number,
            amount: Number(p.amount),
            method: p.method,
            paymentDate: p.payment_date,
            referenceNumber: p.reference_number,
            status: p.status
          })),
          createdAt: inv.created_at
        };
      }
    } else {
      invoice = store.invoices.find(i => i.id === id);
    }

    if (!invoice) return error(res, 'Invoice not found', 404);
    return success(res, invoice);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      customerId, subscriptionId = null,
      invoiceDate = new Date().toISOString().split('T')[0],
      dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      lineItems = [], discount = null, notes = ''
    } = req.body;

    if (!customerId) return error(res, 'Customer ID is required', 400);

    const totals = calculateInvoiceTotals(lineItems, discount);
    const id = generateId('INV');
    const invoiceNumber = generateDocNumber('INV', Math.floor(Math.random() * 9000) + 1000);
    const now = new Date();

    const newInvoice = {
      id,
      invoiceNumber,
      subscriptionId,
      customerId,
      invoiceDate,
      dueDate,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.grandTotal,
      paidAmount: 0.00,
      outstandingAmount: totals.grandTotal,
      status: 'CONFIRMED',
      notes,
      lineItems: lineItems.map(li => ({
        id: generateId('ILI'),
        description: li.description || 'Line Item',
        quantity: Number(li.quantity) || 1,
        unitPrice: Number(li.unitPrice) || 0,
        taxRate: 18.0,
        amount: (Number(li.quantity) || 1) * (Number(li.unitPrice) || 0)
      })),
      createdAt: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO invoices (id, invoice_number, subscription_id, customer_id, invoice_date, due_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, outstanding_amount, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, ?, 'CONFIRMED', ?, ?)`,
        [id, invoiceNumber, subscriptionId, customerId, invoiceDate, dueDate, totals.subtotal, totals.discountAmount, totals.taxAmount, totals.grandTotal, totals.grandTotal, notes, now]
      );

      for (const item of newInvoice.lineItems) {
        await query(
          'INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, tax_rate, amount) VALUES (?, ?, ?, ?, ?, 18.00, ?)',
          [item.id, id, item.description, item.quantity, item.unitPrice, item.amount]
        );
      }
    } else {
      store.invoices.unshift(newInvoice);
    }

    return success(res, newInvoice, 'Invoice generated successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      const { dueDate, notes, status } = req.body;
      await query('UPDATE invoices SET due_date = COALESCE(?, due_date), notes = COALESCE(?, notes), status = COALESCE(?, status) WHERE id = ?', [dueDate, notes, status, id]);
    } else {
      const inv = store.invoices.find(item => item.id === id);
      if (inv) Object.assign(inv, req.body);
    }
    return success(res, { id, ...req.body }, 'Invoice updated');
  } catch (err) {
    next(err);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE invoices SET status = 'CONFIRMED' WHERE id = ?", [id]);
    } else {
      const inv = store.invoices.find(item => item.id === id);
      if (inv) inv.status = 'CONFIRMED';
    }
    return success(res, { id, status: 'CONFIRMED' }, 'Invoice confirmed and issued');
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  return exports.void(req, res, next);
};

exports.send = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE invoices SET status = 'SENT' WHERE id = ? AND status = 'CONFIRMED'", [id]);
    } else {
      const inv = store.invoices.find(item => item.id === id);
      if (inv && inv.status === 'CONFIRMED') inv.status = 'SENT';
    }
    return success(res, { id, status: 'SENT' }, 'Invoice PDF emailed to customer');
  } catch (err) {
    next(err);
  }
};

exports.void = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE invoices SET status = 'CANCELLED' WHERE id = ?", [id]);
    } else {
      const inv = store.invoices.find(item => item.id === id);
      if (inv) inv.status = 'CANCELLED';
    }
    return success(res, { id, status: 'CANCELLED' }, 'Invoice voided successfully');
  } catch (err) {
    next(err);
  }
};

exports.download = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Return sample PDF header response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${id}.pdf"`);
    return res.send(Buffer.from(`%PDF-1.4 RECURIX INVOICE SAMPLE FOR ${id}`));
  } catch (err) {
    next(err);
  }
};

// Record payment against invoice
exports.recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, method = 'BANK_TRANSFER', referenceNumber = '', notes = '', paymentDate = new Date().toISOString() } = req.body;
    const payAmount = Number(amount);

    if (!payAmount || payAmount <= 0) {
      return error(res, 'Valid payment amount is required', 400);
    }

    const paymentId = generateId('PAY');
    const paymentNumber = generateDocNumber('PAY', Math.floor(Math.random() * 9000) + 1000);

    let invoice = null;
    if (!isFallback()) {
      const rows = await query('SELECT * FROM invoices WHERE id = ?', [id]);
      if (rows && rows.length > 0) invoice = rows[0];
    } else {
      invoice = store.invoices.find(i => i.id === id);
    }

    if (!invoice) return error(res, 'Invoice not found', 404);

    const currentPaid = Number(invoice.paid_amount || invoice.paidAmount || 0);
    const totalAmount = Number(invoice.total_amount || invoice.totalAmount || 0);
    const newPaid = Number((currentPaid + payAmount).toFixed(2));
    const newOutstanding = Math.max(0, Number((totalAmount - newPaid).toFixed(2)));
    const newStatus = newOutstanding === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const newPayment = {
      id: paymentId,
      paymentNumber,
      invoiceId: id,
      customerId: invoice.customer_id || invoice.customerId,
      amount: payAmount,
      method,
      referenceNumber: referenceNumber || `REF-${Date.now()}`,
      status: 'SUCCESS',
      notes,
      paymentDate
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO payments (id, payment_number, invoice_id, customer_id, amount, method, reference_number, status, notes, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?, ?)`,
        [paymentId, paymentNumber, id, newPayment.customerId, payAmount, method, newPayment.referenceNumber, notes, paymentDate]
      );
      await query(
        'UPDATE invoices SET paid_amount = ?, outstanding_amount = ?, status = ? WHERE id = ?',
        [newPaid, newOutstanding, newStatus, id]
      );
    } else {
      invoice.paidAmount = newPaid;
      invoice.outstandingAmount = newOutstanding;
      invoice.status = newStatus;
      store.payments.unshift(newPayment);
    }

    return success(res, { payment: newPayment, invoiceStatus: newStatus, newOutstanding }, 'Payment recorded successfully', 201);
  } catch (err) {
    next(err);
  }
};

