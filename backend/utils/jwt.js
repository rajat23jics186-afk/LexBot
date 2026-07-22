/**
 * utils/jwt.js
 * Thin wrapper around jsonwebtoken for issuing/verifying tokens.
 *
 * Two DIFFERENT token types exist, and each carries a `type` claim so one
 * can never be mistaken for (or replayed as) the other:
 *   - "session" tokens: anonymous guest chat sessions (no login needed)
 *   - "user"    tokens: real logged-in accounts (see models/User.js)
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signSessionToken(sessionId, userId = null) {
  const payload = { type: 'session', sessionId };
  if (userId) payload.userId = userId;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function verifySessionToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (payload.type !== 'session') throw new Error('Not a session token');
  return payload;
}

function signUserToken(user) {
  return jwt.sign(
    { type: 'user', userId: user._id.toString(), email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function verifyUserToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (payload.type !== 'user') throw new Error('Not a user token');
  return payload;
}

module.exports = {
  signSessionToken,
  verifySessionToken,
  signUserToken,
  verifyUserToken,
};
