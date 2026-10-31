const { isFallback, query, store } = require('../config/db');
const { success, paginated, error } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const { action = '', resource = '' } = req.query;

    if (!isFallback()) {
      let sql = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];

      if (action) {
        sql += ' AND action = ?';
        params.push(action);
      }
      if (resource) {
        sql += ' AND resource = ?';
        params.push(resource);
      }

      sql += ' ORDER BY created_at DESC LIMIT 50';
      const rows = await query(sql, params);

      const formatted = rows.map(l => {
        const detailsObj = typeof l.details === 'string' ? JSON.parse(l.details) : (l.details || {});
        return {
          id: l.id,
          userId: l.user_id,
          userName: l.user_name || 'System User',
          userEmail: 'admin@brightloop.io',
          action: l.action,
          module: l.resource,
          resource: l.resource,
          recordId: l.resource_id || l.id,
          resourceId: l.resource_id,
          description: detailsObj.message || `${l.action} on ${l.resource}`,
          details: detailsObj,
          ipAddress: l.ip_address,
          timestamp: l.created_at,
          createdAt: l.created_at
        };
      });

      return paginated(res, formatted, formatted.length);
    } else {
      let items = store.audit_logs || [];
      if (action) items = items.filter(l => l.action === action);
      if (resource) items = items.filter(l => l.resource === resource);
      return paginated(res, items, items.length);
    }
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let log = null;

    if (!isFallback()) {
      const rows = await query('SELECT * FROM audit_logs WHERE id = ?', [id]);
      if (rows && rows.length > 0) log = rows[0];
    } else {
      log = (store.audit_logs || []).find(l => l.id === id);
    }

    if (!log) return error(res, 'Audit log entry not found', 404);
    return success(res, log);
  } catch (err) {
    next(err);
  }
};

