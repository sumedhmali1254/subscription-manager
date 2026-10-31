const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    if (!isFallback()) {
      let sql = 'SELECT * FROM customers WHERE 1=1';
      const params = [];

      if (search) {
        sql += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      if (status && status !== 'ALL') {
        sql += ' AND status = ?';
        params.push(status);
      }

      // Count query
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
      const countResult = await query(countSql, params);
      const total = countResult[0]?.total || 0;

      // Data query
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);
      const rows = await query(sql, params);

      // Map snake_case to frontend expected format
      const formatted = rows.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        gstin: c.gstin,
        address: {
          street: c.billing_street,
          city: c.billing_city,
          state: c.billing_state,
          zipCode: c.billing_pincode,
          country: c.billing_country
        },
        status: c.status,
        activeSubscriptions: c.active_subscriptions_count || 0,
        activeSubscriptionsCount: c.active_subscriptions_count || 0,
        totalSubscriptions: c.active_subscriptions_count || 0,
        totalRevenue: Number(c.total_revenue || 0),
        notes: c.notes,
        createdAt: c.created_at
      }));

      return paginated(res, formatted, total, pageNum, limitNum);
    } else {
      let filtered = [...store.customers];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c =>
          (c.name && c.name.toLowerCase().includes(s)) ||
          (c.email && c.email.toLowerCase().includes(s)) ||
          (c.company && c.company.toLowerCase().includes(s))
        );
      }
      if (status && status !== 'ALL') {
        filtered = filtered.filter(c => c.status === status);
      }
      const total = filtered.length;
      const paginatedItems = filtered.slice(offset, offset + limitNum);

      return paginated(res, paginatedItems, total, pageNum, limitNum);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;

    if (!isFallback()) {
      const rows = await query('SELECT * FROM customers WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const c = rows[0];
        customer = {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          gstin: c.gstin,
          address: {
            street: c.billing_street,
            city: c.billing_city,
            state: c.billing_state,
            zipCode: c.billing_pincode,
            country: c.billing_country
          },
          status: c.status,
          activeSubscriptions: c.active_subscriptions_count || 0,
          activeSubscriptionsCount: c.active_subscriptions_count || 0,
          totalRevenue: Number(c.total_revenue || 0),
          notes: c.notes,
          createdAt: c.created_at
        };
      }
    } else {
      customer = store.customers.find(c => c.id === id);
    }

    if (!customer) {
      return error(res, 'Customer not found', 404);
    }

    return success(res, customer);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, company, gstin, address, notes, status = 'ACTIVE' } = req.body;
    if (!name || !email || !company) {
      return error(res, 'Name, email, and company are required fields', 400);
    }

    const id = generateId('CUST');
    const now = new Date();

    const newCustomer = {
      id,
      name,
      email,
      phone: phone || '',
      company,
      gstin: gstin || '',
      address: address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      status,
      activeSubscriptionsCount: 0,
      totalRevenue: 0.00,
      notes: notes || '',
      createdAt: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO customers (id, name, email, phone, company, gstin, billing_street, billing_city, billing_state, billing_pincode, billing_country, status, notes, active_subscriptions_count, total_revenue, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, name, email, phone || '', company, gstin || '',
          address?.street || '', address?.city || '', address?.state || '', address?.zipCode || '', address?.country || 'India',
          status, notes || '', 0, 0.00, now
        ]
      );
    } else {
      store.customers.unshift(newCustomer);
    }

    return success(res, newCustomer, 'Customer created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, gstin, address, notes, status } = req.body;

    if (!isFallback()) {
      const rows = await query('SELECT * FROM customers WHERE id = ?', [id]);
      if (!rows || rows.length === 0) return error(res, 'Customer not found', 404);

      await query(
        `UPDATE customers SET 
           name = COALESCE(?, name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           company = COALESCE(?, company),
           gstin = COALESCE(?, gstin),
           billing_street = COALESCE(?, billing_street),
           billing_city = COALESCE(?, billing_city),
           billing_state = COALESCE(?, billing_state),
           billing_pincode = COALESCE(?, billing_pincode),
           billing_country = COALESCE(?, billing_country),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status)
         WHERE id = ?`,
        [
          name, email, phone, company, gstin,
          address?.street, address?.city, address?.state, address?.zipCode, address?.country,
          notes, status, id
        ]
      );
    } else {
      const idx = store.customers.findIndex(c => c.id === id);
      if (idx === -1) return error(res, 'Customer not found', 404);

      store.customers[idx] = {
        ...store.customers[idx],
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(company && { company }),
        ...(gstin !== undefined && { gstin }),
        ...(address && { address: { ...store.customers[idx].address, ...address } }),
        ...(notes !== undefined && { notes }),
        ...(status && { status })
      };
    }

    return success(res, { id, ...req.body }, 'Customer updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isFallback()) {
      await query('DELETE FROM customers WHERE id = ?', [id]);
    } else {
      const idx = store.customers.findIndex(c => c.id === id);
      if (idx !== -1) store.customers.splice(idx, 1);
    }

    return success(res, { id }, 'Customer deleted successfully');
  } catch (err) {
    next(err);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const { id } = req.params;
    let subs = [];

    if (!isFallback()) {
      subs = await query('SELECT * FROM subscriptions WHERE customer_id = ? ORDER BY created_at DESC', [id]);
    } else {
      subs = store.subscriptions.filter(s => s.customer_id === id || s.customerId === id);
    }

    return success(res, subs);
  } catch (err) {
    next(err);
  }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { id } = req.params;
    let invoices = [];

    if (!isFallback()) {
      invoices = await query('SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC', [id]);
    } else {
      invoices = store.invoices.filter(i => i.customer_id === id || i.customerId === id);
    }

    return success(res, invoices);
  } catch (err) {
    next(err);
  }
};

