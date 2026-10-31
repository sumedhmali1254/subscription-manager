const bcrypt = require('bcryptjs');
const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');
const { generateId } = require('../utils/idGenerator');

exports.list = async (req, res, next) => {
  try {
    const { role = '', status = '' } = req.query;

    if (!isFallback()) {
      let sql = 'SELECT id, name, email, role, status, company, avatar_url, last_login_at, created_at FROM users WHERE 1=1';
      const params = [];

      if (role && role !== 'ALL') {
        sql += ' AND role = ?';
        params.push(role);
      }
      if (status && status !== 'ALL') {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY created_at ASC';
      const rows = await query(sql, params);
      const formatted = rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        company: u.company,
        avatar: u.avatar_url,
        lastLoginAt: u.last_login_at,
        createdAt: u.created_at
      }));

      return paginated(res, formatted, formatted.length);
    } else {
      let items = [...store.users];
      if (role && role !== 'ALL') items = items.filter(u => u.role === role);
      if (status && status !== 'ALL') items = items.filter(u => u.status === status);
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user = null;

    if (!isFallback()) {
      const rows = await query('SELECT id, name, email, role, status, company, avatar_url, last_login_at, created_at FROM users WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        const u = rows[0];
        user = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          company: u.company,
          avatar: u.avatar_url,
          lastLoginAt: u.last_login_at,
          createdAt: u.created_at
        };
      }
    } else {
      user = store.users.find(u => u.id === id);
    }

    if (!user) return error(res, 'User not found', 404);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, role = 'STAFF', company = '', password = 'Password@123' } = req.body;
    if (!name || !email) return error(res, 'Name and email are required', 400);

    const id = generateId('USR');
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = {
      id,
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: role.toUpperCase(),
      status: 'ACTIVE',
      company,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`,
      createdAt: now.toISOString()
    };

    if (!isFallback()) {
      await query(
        `INSERT INTO users (id, name, email, password_hash, role, status, company, avatar_url, created_at)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)`,
        [id, name, newUser.email, passwordHash, newUser.role, company, newUser.avatar, now]
      );
    } else {
      store.users.push(newUser);
    }

    return success(res, newUser, 'User account created', 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, company } = req.body;

    if (!isFallback()) {
      await query(
        `UPDATE users SET
           name = COALESCE(?, name),
           email = COALESCE(?, email),
           role = COALESCE(?, role),
           status = COALESCE(?, status),
           company = COALESCE(?, company)
         WHERE id = ?`,
        [name, email, role, status, company, id]
      );
    } else {
      const u = store.users.find(item => item.id === id);
      if (u) Object.assign(u, req.body);
    }

    return success(res, { id, ...req.body }, 'User details updated');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isFallback()) {
      await query('DELETE FROM users WHERE id = ?', [id]);
    } else {
      const idx = store.users.findIndex(u => u.id === id);
      if (idx !== -1) store.users.splice(idx, 1);
    }
    return success(res, { id }, 'User removed');
  } catch (err) {
    next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let newStatus = 'ACTIVE';

    if (!isFallback()) {
      const rows = await query('SELECT status FROM users WHERE id = ?', [id]);
      if (!rows || rows.length === 0) return error(res, 'User not found', 404);
      newStatus = rows[0].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);
    } else {
      const u = store.users.find(item => item.id === id);
      if (!u) return error(res, 'User not found', 404);
      u.status = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      newStatus = u.status;
    }

    return success(res, { id, status: newStatus }, `User account marked as ${newStatus}`);
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tempPassword = 'Password@123';
    const hash = await bcrypt.hash(tempPassword, 10);

    if (!isFallback()) {
      await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
    } else {
      const u = store.users.find(item => item.id === id);
      if (u) u.password_hash = hash;
    }

    return success(res, { tempPassword }, 'Password reset to default (Password@123)');
  } catch (err) {
    next(err);
  }
};

