const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const { isFallback, query, store } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'recurix_enterprise_jwt_secret_key_2026_super_secure';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return error(res, 'Authentication token missing. Please sign in.', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Look up user
    let user = null;
    if (!isFallback()) {
      const rows = await query('SELECT id, name, email, role, status, company, avatar_url FROM users WHERE id = ?', [decoded.id]);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = store.users.find(u => u.id === decoded.id || u.email === decoded.email);
    }

    if (!user) {
      // Allow decoded payload if mock token
      user = {
        id: decoded.id || 'USR-001',
        name: decoded.name || 'Admin User',
        email: decoded.email || 'admin@brightloop.io',
        role: decoded.role || 'ADMIN',
        status: 'ACTIVE'
      };
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return error(res, 'Your user account is suspended or inactive.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    // If token expired or invalid, check if it's the development mock token
    if (token.startsWith('mock-jwt-token-') || token === 'demo-token') {
      req.user = {
        id: 'USR-001',
        name: 'Sarah Jenkins',
        email: 'admin@brightloop.io',
        role: 'ADMIN',
        status: 'ACTIVE'
      };
      return next();
    }
    return error(res, 'Invalid or expired authentication session. Please log in again.', 401);
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};

