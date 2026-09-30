/**
 * Standardized JSON API Response Helpers
 */

const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

const sendError = (res, message, statusCode = 400, code = 'ERROR') => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
