const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId, generateDocNumber } = require('../utils/idGenerator');
const { calculateInvoiceTotals } = require('../utils/calculations');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '', customerId = '' } = req.query;

    if (!isFallback()) {
      let sql = `
        SELECT q.*, c.name AS customer_name, c.company AS customer_company, p.name AS plan_name
        FROM quotations q
        LEFT JOIN customers c ON q.customer_id = c.id
        LEFT JOIN subscription_plans p ON q.plan_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND q.status = ?';
        params.push(status);
      }
      if (customerId) {
        sql += ' AND q.customer_id = ?';
        params.push(customerId);
      }

      sql += ' ORDER BY q.created_at DESC';
      const rows = await query(sql, params);

      const formatted = rows.map(q => ({
        id: q.id,
        quotationNumber: q.quotation_number,
        customerId: q.customer_id,
        customerName: q.customer_name,
        company: q.customer_company,
        customerCompany: q.customer_company,
        planId: q.plan_id,
        planName: q.plan_name,
        quotationDate: q.quotation_date,
        validUntil: q.valid_until,
        expiryDate: q.valid_until,
        subtotal: Number(q.subtotal),
        discountAmount: Number(q.discount_amount),
        taxAmount: Number(q.tax_amount),
        totalAmount: Number(q.total_amount),
        status: q.status,
        convertedSubscriptionId: q.converted_subscription_id,
        notes: q.notes,
        terms: q.terms,
        createdAt: q.created_at
      }));

      return paginated(res, formatted, formatted.length);
    } else {
      let items = [...store.quotations];
      if (status && status !== 'ALL') items = items.filter(q => q.status === status);
      if (customerId) items = items.filter(q => q.customerId === customerId || q.customer_id === customerId);
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let quote = null;

    if (!isFallback()) {
      const rows = await query(
        `SELECT q.*, c.name AS customer_name, c.company AS customer_company, c.email AS customer_email
         FROM quotations q
         LEFT JOIN customers c ON q.customer_id = c.id
         WHERE q.id = ?`,
        [id]
      );
      if (rows && rows.length > 0) {
        const q = rows[0];
        const lineItems = await query('SELECT * FROM quotation_line_items WHERE quotation_id = ?', [id]);
        quote = {
          id: q.id,
          quotationNumber: q.quotation_number,
          customerId: q.customer_id,
          customerName: q.customer_name,
          company: q.customer_company,
          email: q.customer_email,
          planId: q.plan_id,
          quotationDate: q.quotation_date,
          validUntil: q.valid_until,
          subtotal: Number(q.subtotal),
          discountAmount: Number(q.discount_amount),
          taxAmount: Number(q.tax_amount),
          totalAmount: Number(q.total_amount),
          status: q.status,
          notes: q.notes,
          terms: q.terms,
          convertedSubscriptionId: q.converted_subscription_id,
          lineItems: lineItems.map(li => ({
            id: li.id,
            productId: li.product_id,
            description: li.description,
            quantity: li.quantity,
            unitPrice: Number(li.unit_price),
            discountPct: Number(li.discount_pct),
            taxRate: Number(li.tax_rate),
            amount: Number(li.amount)
          }))
        };
      }
    } else {
      quote = store.quotations.find(q => q.id === id);
    }

    if (!quote) return error(res, 'Quotation not found', 404);
    return success(res, quote);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      customerId, planId, templateId = null,
      quotationDate = new Date().toISOString().split('T')[0],
      validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      lineItems = [], discount = null, notes = '', terms = ''
    } = req.body;

    if (!customerId) return error(res, 'Customer is required', 400);

    const totals = calculateInvoiceTotals(lineItems, discount);
    const id = generateId('QTN');
    const quotationNumber = generateDocNumber('QTN', Math.floor(Math.random() * 9000) + 1000);
    const now = new Date();

    const newQuote = {
      id,
      quotationNumber,
      customerId,
      planId: planId || 'PLAN-001',
      templateId,
      quotationDate,
      validUntil,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.grandTotal,
      notes,
      terms,
      status: 'DRAFT',
      lineItems: lineItems.map((li, idx) => ({
        id: generateId('QLI'),
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
        `INSERT INTO quotations (id, quotation_number, customer_id, plan_id, template_id, quotation_date, valid_until, subtotal, discount_amount, tax_amount, total_amount, notes, terms, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
        [id, quotationNumber, customerId, planId || 'PLAN-001', templateId, quotationDate, validUntil, totals.subtotal, totals.discountAmount, totals.taxAmount, totals.grandTotal, notes, terms, now]
      );

      for (const item of newQuote.lineItems) {
        await query(
          `INSERT INTO quotation_line_items (id, quotation_id, description, quantity, unit_price, tax_rate, amount)
           VALUES (?, ?, ?, ?, ?, 18.00, ?)`,
          [item.id, id, item.description, item.quantity, item.unitPrice, item.amount]
        );
      }
    } else {
      store.quotations.unshift(newQuote);
    }

    return success(res, newQuote, 'Quotation drafted successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      const { status, notes, terms } = req.body;
      await query('UPDATE quotations SET status = COALESCE(?, status), notes = COALESCE(?, notes), terms = COALESCE(?, terms) WHERE id = ?', [status, notes, terms, id]);
    } else {
      const q = store.quotations.find(item => item.id === id);
      if (q) Object.assign(q, req.body);
    }
    return success(res, { id, ...req.body }, 'Quotation updated');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query('DELETE FROM quotations WHERE id = ?', [id]);
    } else {
      const idx = store.quotations.findIndex(q => q.id === id);
      if (idx !== -1) store.quotations.splice(idx, 1);
    }
    return success(res, { id }, 'Quotation deleted');
  } catch (err) {
    next(err);
  }
};

exports.send = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE quotations SET status = 'SENT' WHERE id = ?", [id]);
    } else {
      const q = store.quotations.find(item => item.id === id);
      if (q) q.status = 'SENT';
    }
    return success(res, { id, status: 'SENT' }, 'Quotation dispatched to customer via email');
  } catch (err) {
    next(err);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE quotations SET status = 'CONFIRMED' WHERE id = ?", [id]);
    } else {
      const q = store.quotations.find(item => item.id === id);
      if (q) q.status = 'CONFIRMED';
    }
    return success(res, { id, status: 'CONFIRMED' }, 'Quotation confirmed by customer');
  } catch (err) {
    next(err);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query("UPDATE quotations SET status = 'REJECTED' WHERE id = ?", [id]);
    } else {
      const q = store.quotations.find(item => item.id === id);
      if (q) q.status = 'REJECTED';
    }
    return success(res, { id, status: 'REJECTED' }, 'Quotation marked as rejected');
  } catch (err) {
    next(err);
  }
};

exports.convert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subId = generateId('SUB');
    const subNumber = generateDocNumber('SUB', Math.floor(Math.random() * 9000) + 1000);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nextMonth = new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];

    let quote = null;
    if (!isFallback()) {
      const rows = await query('SELECT * FROM quotations WHERE id = ?', [id]);
      if (rows && rows.length > 0) quote = rows[0];
    } else {
      quote = store.quotations.find(q => q.id === id);
    }

    if (!quote) return error(res, 'Quotation not found', 404);

    const newSub = {
      id: subId,
      subscriptionNumber: subNumber,
      customerId: quote.customer_id || quote.customerId,
      planId: quote.plan_id || quote.planId || 'PLAN-001',
      quotationId: id,
      billingFrequency: 'MONTHLY',
      quantity: 1,
      unitPrice: Number(quote.subtotal || 14999),
      amount: Number(quote.subtotal || 14999),
      startDate: todayStr,
      currentPeriodStart: todayStr,
      currentPeriodEnd: nextMonth,
      nextBillingDate: nextMonth,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO subscriptions (id, subscription_number, customer_id, plan_id, quotation_id, billing_frequency, quantity, unit_price, amount, start_date, current_period_start, current_period_end, next_billing_date, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'MONTHLY', 1, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW())`,
        [subId, subNumber, newSub.customerId, newSub.planId, id, newSub.unitPrice, newSub.amount, todayStr, todayStr, nextMonth, nextMonth]
      );
      await query("UPDATE quotations SET status = 'CONVERTED', converted_subscription_id = ? WHERE id = ?", [subId, id]);
    } else {
      quote.status = 'CONVERTED';
      quote.convertedSubscriptionId = subId;
      store.subscriptions.unshift(newSub);
    }

    return success(res, newSub, 'Quotation successfully converted to active subscription');
  } catch (err) {
    next(err);
  }
};

// Templates
exports.listTemplates = async (req, res, next) => {
  try {
    let templates = [];
    if (!isFallback()) {
      templates = await query('SELECT * FROM quotation_templates ORDER BY created_at DESC');
    } else {
      templates = store.quotation_templates || [];
    }
    return success(res, templates);
  } catch (err) {
    next(err);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const { name, description = '', planId = null, paymentTerms = 'NET 15', validityDays = 30, notes = '' } = req.body;
    const id = generateId('TMPL');
    const newTmpl = { id, name, description, planId, paymentTerms, validityDays, notes };

    if (!isFallback()) {
      await query(
        'INSERT INTO quotation_templates (id, name, description, plan_id, payment_terms, validity_days, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name, description, planId, paymentTerms, validityDays, notes]
      );
    } else {
      if (!store.quotation_templates) store.quotation_templates = [];
      store.quotation_templates.unshift(newTmpl);
    }

    return success(res, newTmpl, 'Template created', 201);
  } catch (err) {
    next(err);
  }
};

