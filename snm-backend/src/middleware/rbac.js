const { error } = require('../utils/response');

function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthenticated user', 401);
    }

    const userRole = (req.user.role || '').toUpperCase();
    const hasRole = allowedRoles.map(r => r.toUpperCase()).includes(userRole);

    if (!hasRole) {
      return error(res, `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`, 403);
    }

    next();
  };
}

function requireAdmin(req, res, next) {
  return requireRoles(['ADMIN'])(req, res, next);
}

function requireStaffOrAdmin(req, res, next) {
  return requireRoles(['ADMIN', 'STAFF'])(req, res, next);
}

module.exports = {
  requireRoles,
  requireAdmin,
  requireStaffOrAdmin
};

