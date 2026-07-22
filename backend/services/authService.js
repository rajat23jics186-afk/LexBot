/**
 * services/authService.js
 */

const User = require('../models/User');
const { signUserToken } = require('../utils/jwt');
const logger = require('../utils/logger');

class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AuthError('An account with this email already exists.', 409);
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  logger.info(`👤 New user registered: ${email}`);

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: signUserToken(user),
  };
}

async function login({ email, password }) {
  // passwordHash has `select: false` in the schema — must opt back in explicitly
  const user = await User.findOne({ email }).select('+passwordHash');

  // Deliberately identical error for "no such user" and "wrong password" —
  // distinguishing them lets an attacker enumerate valid email addresses.
  if (!user) {
    throw new AuthError('Invalid email or password.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthError('Invalid email or password.', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: signUserToken(user),
  };
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AuthError('User not found.', 404);
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

module.exports = { register, login, getProfile, AuthError };
