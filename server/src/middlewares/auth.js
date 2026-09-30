const jwt = require('jsonwebtoken');
const env = require('../config/env');
const dbStore = require('../data/dbStore');
const { sendError } = require('../utils/response');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token required', 401, 'AUTH_REQUIRED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await dbStore.findUserById(decoded.id);

    if (!user) {
      return sendError(res, 'User session invalid or user not found', 401, 'INVALID_SESSION');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session token has expired. Please log in again', 401, 'TOKEN_EXPIRED');
    }
    return sendError(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await dbStore.findUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // Token invalid or expired, continue without authenticated user
    }
  }
  next();
};

module.exports = {
  requireAuth,
  optionalAuth
};
