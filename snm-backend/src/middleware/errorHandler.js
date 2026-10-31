const { error } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An internal server error occurred.';

  return error(res, message, status, process.env.NODE_ENV === 'development' ? err.stack : null);
}

module.exports = errorHandler;

