const { isFallback, query, store } = require('../config/db');
const { success, error } = require('../utils/response');
const { generateId } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    let rows = [];
    if (!isFallback()) {
      rows = await query('SELECT * FROM taxes ORDER BY created_at ASC');
    } else {
      rows = store.taxes || [];
    }
    const formatted = rows.map(t => {
      const name = t.taxName || t.name || 'GST 18%';
      const rate = Number(t.taxRate !== undefined ? t.taxRate : (t.rate !== undefined ? t.rate : 18));
      const type = t.taxType || t.type || 'PERCENTAGE';
      const status = t.status || (t.activeStatus === false ? 'INACTIVE' : 'ACTIVE');
      return {
        id: t.id,
        name,
        taxName: name,
        rate,
        taxRate: rate,
        type,
        taxType: type,
        validFrom: t.validFrom || '2026-01-01',
        validUntil: t.validUntil || '2026-12-31',
        activeStatus: status === 'ACTIVE',
        status
      };
    });
    return success(res, formatted);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let tax = null;
    if (!isFallback()) {
      const rows = await query('SELECT * FROM taxes WHERE id = ?', [id]);
      if (rows && rows.length > 0) tax = rows[0];
    } else {
      tax = (store.taxes || []).find(t => t.id === id);
    }
    if (!tax) return error(res, 'Tax configuration not found', 404);

    const name = tax.taxName || tax.name || 'GST 18%';
    const rate = Number(tax.taxRate !== undefined ? tax.taxRate : (tax.rate !== undefined ? tax.rate : 18));
    const type = tax.taxType || tax.type || 'PERCENTAGE';
    const status = tax.status || (tax.activeStatus === false ? 'INACTIVE' : 'ACTIVE');

    return success(res, {
      ...tax,
      name,
      taxName: name,
      rate,
      taxRate: rate,
      type,
      taxType: type,
      validFrom: tax.validFrom || '2026-01-01',
      validUntil: tax.validUntil || '2026-12-31',
      activeStatus: status === 'ACTIVE',
      status
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = req.body.taxName || req.body.name;
    const rate = req.body.taxRate !== undefined ? req.body.taxRate : req.body.rate;
    const type = req.body.taxType || req.body.type || 'PERCENTAGE';
    const isCompound = req.body.isCompound || false;
    const status = req.body.activeStatus !== undefined ? (req.body.activeStatus ? 'ACTIVE' : 'INACTIVE') : (req.body.status || 'ACTIVE');

    if (!name || rate === undefined) return error(res, 'Tax name and rate are required', 400);

    const id = generateId('TAX');
    const newTax = {
      id,
      name,
      taxName: name,
      rate: Number(rate),
      taxRate: Number(rate),
      type,
      taxType: type,
      is_compound: Boolean(isCompound),
      status,
      activeStatus: status === 'ACTIVE',
      validFrom: req.body.validFrom || '2026-01-01',
      validUntil: req.body.validUntil || '2026-12-31'
    };

    if (!isFallback()) {
      await query('INSERT INTO taxes (id, name, rate, type, is_compound, status) VALUES (?, ?, ?, ?, ?, ?)', [id, name, rate, type, isCompound, status]);
    } else {
      if (!store.taxes) store.taxes = [];
      store.taxes.push(newTax);
    }

    return success(res, newTax, 'Tax rule created', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const name = req.body.taxName || req.body.name;
    const rate = req.body.taxRate !== undefined ? req.body.taxRate : req.body.rate;
    const type = req.body.taxType || req.body.type;
    const status = req.body.activeStatus !== undefined ? (req.body.activeStatus ? 'ACTIVE' : 'INACTIVE') : req.body.status;

    if (!isFallback()) {
      await query('UPDATE taxes SET name = COALESCE(?, name), rate = COALESCE(?, rate), status = COALESCE(?, status) WHERE id = ?', [name, rate, status, id]);
    } else {
      const t = (store.taxes || []).find(item => item.id === id);
      if (t) {
        if (name) { t.name = name; t.taxName = name; }
        if (rate !== undefined) { t.rate = Number(rate); t.taxRate = Number(rate); }
        if (type) { t.type = type; t.taxType = type; }
        if (status) { t.status = status; t.activeStatus = status === 'ACTIVE'; }
      }
    }

    const updated = {
      id,
      ...req.body,
      name: name || req.body.name,
      taxName: name || req.body.taxName,
      rate: rate !== undefined ? Number(rate) : req.body.rate,
      taxRate: rate !== undefined ? Number(rate) : req.body.taxRate,
      status: status || 'ACTIVE',
      activeStatus: (status || 'ACTIVE') === 'ACTIVE'
    };
    return success(res, updated, 'Tax rule updated');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query('DELETE FROM taxes WHERE id = ?', [id]);
    } else {
      if (store.taxes) store.taxes = store.taxes.filter(t => t.id !== id);
    }
    return success(res, { id }, 'Tax rule deleted');
  } catch (err) {
    next(err);
  }
};

exports.calculate = async (req, res, next) => {
  try {
    const { amount = 0, state = 'Karnataka' } = req.body;
    const base = Number(amount) || 0;
    const isInterstate = state.toLowerCase() !== 'karnataka';

    let breakdown = [];
    let totalTax = 0;

    if (isInterstate) {
      const igst = Number(((base * 18) / 100).toFixed(2));
      breakdown.push({ name: 'IGST (18%)', rate: 18, amount: igst });
      totalTax = igst;
    } else {
      const cgst = Number(((base * 9) / 100).toFixed(2));
      const sgst = Number(((base * 9) / 100).toFixed(2));
      breakdown.push({ name: 'CGST (9%)', rate: 9, amount: cgst });
      breakdown.push({ name: 'SGST (9%)', rate: 9, amount: sgst });
      totalTax = Number((cgst + sgst).toFixed(2));
    }

    return success(res, {
      baseAmount: base,
      taxBreakdown: breakdown,
      totalTax,
      grandTotal: Number((base + totalTax).toFixed(2))
    });
  } catch (err) {
    next(err);
  }
};
