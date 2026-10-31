const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    if (!isFallback()) {
      const rows = await query('SELECT * FROM discounts ORDER BY created_at DESC');
      const formatted = rows.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        discountName: d.code,
        discountType: d.discount_type,
        value: Number(d.value),
        discountValue: Number(d.value),
        minimumQuantity: d.minimum_quantity,
        startDate: d.start_date,
        endDate: d.end_date,
        maximumUsage: d.maximum_usage,
        usageLimit: d.maximum_usage || 100,
        usageCount: d.usage_count,
        usedCount: d.usage_count || 0,
        status: d.status,
        activeStatus: d.status === 'ACTIVE',
        createdAt: d.created_at
      }));
      return paginated(res, formatted, formatted.length);
    } else {
      const items = store.discounts || [];
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let disc = null;

    if (!isFallback()) {
      const rows = await query('SELECT * FROM discounts WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const d = rows[0];
        disc = {
          id: d.id,
          name: d.name,
          code: d.code,
          discountType: d.discount_type,
          value: Number(d.value),
          minimumQuantity: d.minimum_quantity,
          startDate: d.start_date,
          endDate: d.end_date,
          maximumUsage: d.maximum_usage,
          usageCount: d.usage_count,
          status: d.status
        };
      }
    } else {
      disc = (store.discounts || []).find(d => d.id === id);
    }

    if (!disc) return error(res, 'Discount not found', 404);
    return success(res, disc);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, discountType = 'PERCENTAGE', value, minimumQuantity = 1, startDate = null, endDate = null, maximumUsage = 100 } = req.body;
    if (!name || !code || !value) return error(res, 'Name, code, and value are required', 400);

    const id = generateId('DISC');
    const newDisc = {
      id,
      name,
      code: code.toUpperCase().trim(),
      discountType,
      value: Number(value),
      minimumQuantity: Number(minimumQuantity),
      startDate,
      endDate,
      maximumUsage: Number(maximumUsage),
      usageCount: 0,
      status: 'ACTIVE'
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO discounts (id, name, code, discount_type, value, minimum_quantity, start_date, end_date, maximum_usage, usage_count, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'ACTIVE')`,
        [id, name, newDisc.code, discountType, newDisc.value, minimumQuantity, startDate, endDate, maximumUsage]
      );
    } else {
      if (!store.discounts) store.discounts = [];
      store.discounts.unshift(newDisc);
    }

    return success(res, newDisc, 'Discount created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      const { name, value, status, maximumUsage } = req.body;
      await query(
        'UPDATE discounts SET name = COALESCE(?, name), value = COALESCE(?, value), status = COALESCE(?, status), maximum_usage = COALESCE(?, maximum_usage) WHERE id = ?',
        [name, value, status, maximumUsage, id]
      );
    } else {
      const d = (store.discounts || []).find(item => item.id === id);
      if (d) Object.assign(d, req.body);
    }
    return success(res, { id, ...req.body }, 'Discount updated');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query('DELETE FROM discounts WHERE id = ?', [id]);
    } else {
      if (store.discounts) {
        store.discounts = store.discounts.filter(d => d.id !== id);
      }
    }
    return success(res, { id }, 'Discount deleted');
  } catch (err) {
    next(err);
  }
};

exports.validate = async (req, res, next) => {
  try {
    const { code, amount = 0 } = req.body;
    if (!code) return error(res, 'Discount code is required', 400);

    const cleanCode = code.toUpperCase().trim();
    let disc = null;

    if (!isFallback()) {
      const rows = await query("SELECT * FROM discounts WHERE code = ? AND status = 'ACTIVE'", [cleanCode]);
      if (rows && rows.length > 0) disc = rows[0];
    } else {
      disc = (store.discounts || []).find(d => d.code === cleanCode && d.status === 'ACTIVE');
    }

    if (!disc) {
      return success(res, { valid: false, message: 'Invalid or inactive promo coupon' });
    }

    const subtotal = Number(amount) || 0;
    const discType = disc.discount_type || disc.discountType;
    let savings = 0;

    if (discType === 'PERCENTAGE') {
      savings = Number(((subtotal * Number(disc.value)) / 100).toFixed(2));
    } else {
      savings = Math.min(subtotal, Number(disc.value));
    }

    return success(res, {
      valid: true,
      discount: {
        id: disc.id,
        name: disc.name,
        code: disc.code,
        discountType: discType,
        value: Number(disc.value)
      },
      savings
    }, 'Coupon code applied successfully');
  } catch (err) {
    next(err);
  }
};

