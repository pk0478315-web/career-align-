const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const dbStore = require('../data/dbStore');
const { sendSuccess, sendError } = require('../utils/response');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400, 'VALIDATION_ERROR');
    }

    const existingUser = await dbStore.findUserByEmail(email);
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409, 'USER_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await dbStore.createUser({
      email,
      passwordHash,
      displayName: displayName || email.split('@')[0]
    });

    const token = generateToken(newUser);
    const profile = await dbStore.getProfile(newUser.id);

    return sendSuccess(res, {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name
      },
      profile
    }, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400, 'VALIDATION_ERROR');
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user);
    const profile = await dbStore.getProfile(user.id);

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name
      },
      profile
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const profile = await dbStore.getProfile(user.id);

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name
      },
      profile
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe
};
