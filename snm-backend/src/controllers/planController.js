const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    if (!isFallback()) {
      let sql = 'SELECT * FROM subscription_plans WHERE 1=1';
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC';
      const rows = await query(sql, params);

      const formatted = rows.map(p => ({
        id: p.id,
        productId: p.product_id,
        name: p.name,
        code: p.code,
        description: p.description,
        billingFrequency: p.billing_frequency,
        basePrice: Number(p.base_price),
        price: Number(p.base_price),
        subscribersCount: 1,
        activeStatus: p.status === 'ACTIVE',
        currency: p.currency,
        minimumQuantity: p.minimum_quantity,
        startDate: p.start_date,
        endDate: p.end_date,
        autoCloseOnExpiry: Boolean(p.auto_close_on_expiry),
        allowEarlyClosure: Boolean(p.allow_early_closure),
        allowPause: Boolean(p.allow_pause),
        allowRenewal: Boolean(p.allow_renewal),
        trialPeriodDays: p.trial_period_days,
        setupFee: Number(p.setup_fee),
        features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []),
        status: p.status,
        createdAt: p.created_at
      }));

      return paginated(res, formatted, formatted.length, pageNum, limitNum);
    } else {
      let items = [...store.subscription_plans];
      if (status && status !== 'ALL') {
        items = items.filter(p => p.status === status);
      }
      return paginated(res, items, items.length, pageNum, limitNum);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let plan = null;

    if (!isFallback()) {
      const rows = await query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const p = rows[0];
        plan = {
          id: p.id,
          productId: p.product_id,
          name: p.name,
          code: p.code,
          description: p.description,
          billingFrequency: p.billing_frequency,
          basePrice: Number(p.base_price),
          currency: p.currency,
          minimumQuantity: p.minimum_quantity,
          startDate: p.start_date,
          endDate: p.end_date,
          autoCloseOnExpiry: Boolean(p.auto_close_on_expiry),
          allowEarlyClosure: Boolean(p.allow_early_closure),
          allowPause: Boolean(p.allow_pause),
          allowRenewal: Boolean(p.allow_renewal),
          trialPeriodDays: p.trial_period_days,
          setupFee: Number(p.setup_fee),
          features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []),
          status: p.status,
          createdAt: p.created_at
        };
      }
    } else {
      plan = store.subscription_plans.find(p => p.id === id);
    }

    if (!plan) return error(res, 'Plan not found', 404);
    return success(res, plan);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      name, code, productId = 'PROD-001', description = '',
      billingFrequency = 'MONTHLY', basePrice = 0, currency = 'INR',
      minimumQuantity = 1, startDate = null, endDate = null,
      autoCloseOnExpiry = true, allowEarlyClosure = true, allowPause = true, allowRenewal = true,
      trialPeriodDays = 0, setupFee = 0, features = [], status = 'ACTIVE'
    } = req.body;

    if (!name || !basePrice) {
      return error(res, 'Plan name and base price are required', 400);
    }

    const id = generateId('PLAN');
    const planCode = code || `PLAN-${name.replace(/\s+/g, '-').toUpperCase()}`;
    const now = new Date();

    const newPlan = {
      id,
      productId,
      name,
      code: planCode,
      description,
      billingFrequency,
      basePrice: Number(basePrice),
      currency,
      minimumQuantity: Number(minimumQuantity),
      startDate,
      endDate,
      autoCloseOnExpiry,
      allowEarlyClosure,
      allowPause,
      allowRenewal,
      trialPeriodDays: Number(trialPeriodDays),
      setupFee: Number(setupFee),
      features,
      status,
      createdAt: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO subscription_plans (id, product_id, name, code, description, billing_frequency, base_price, currency, minimum_quantity, start_date, end_date, auto_close_on_expiry, allow_early_closure, allow_pause, allow_renewal, trial_period_days, setup_fee, features, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, productId, name, planCode, description, billingFrequency, basePrice, currency,
          minimumQuantity, startDate, endDate, autoCloseOnExpiry, allowEarlyClosure, allowPause, allowRenewal,
          trialPeriodDays, setupFee, JSON.stringify(features), status, now
        ]
      );
    } else {
      store.subscription_plans.unshift(newPlan);
    }

    return success(res, newPlan, 'Plan created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      const { name, description, billingFrequency, basePrice, status, features } = req.body;
      await query(
        `UPDATE subscription_plans SET
           name = COALESCE(?, name),
           description = COALESCE(?, description),
           billing_frequency = COALESCE(?, billing_frequency),
           base_price = COALESCE(?, base_price),
           status = COALESCE(?, status),
           features = COALESCE(?, features)
         WHERE id = ?`,
        [name, description, billingFrequency, basePrice, status, features ? JSON.stringify(features) : null, id]
      );
    } else {
      const idx = store.subscription_plans.findIndex(p => p.id === id);
      if (idx === -1) return error(res, 'Plan not found', 404);
      store.subscription_plans[idx] = { ...store.subscription_plans[idx], ...req.body };
    }

    return success(res, { id, ...req.body }, 'Plan updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query('DELETE FROM subscription_plans WHERE id = ?', [id]);
    } else {
      const idx = store.subscription_plans.findIndex(p => p.id === id);
      if (idx !== -1) store.subscription_plans.splice(idx, 1);
    }
    return success(res, { id }, 'Plan deleted successfully');
  } catch (err) {
    next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let newStatus = 'ACTIVE';

    if (!isFallback()) {
      const rows = await query('SELECT status FROM subscription_plans WHERE id = ?', [id]);
      if (!rows || rows.length === 0) return error(res, 'Plan not found', 404);
      newStatus = rows[0].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await query('UPDATE subscription_plans SET status = ? WHERE id = ?', [newStatus, id]);
    } else {
      const plan = store.subscription_plans.find(p => p.id === id);
      if (!plan) return error(res, 'Plan not found', 404);
      plan.status = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      newStatus = plan.status;
    }

    return success(res, { id, status: newStatus }, `Plan status changed to ${newStatus}`);
  } catch (err) {
    next(err);
  }
};

