/**
 * Standardized API Response Utilities
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const paginated = (res, data = [], total = 0, page = 1, limit = 10, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    total: Number(total),
    page: Number(page),
    limit: Number(limit)
  });
};

const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

module.exports = {
  success,
  paginated,
  error
};

