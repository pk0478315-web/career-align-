const { sendError } = require('../utils/response');

// 404 Route Not Found
const notFoundHandler = (req, res) => {
  return sendError(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('[Error caught by global middleware]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, statusCode, code);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
