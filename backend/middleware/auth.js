/**
 * middleware/auth.js
 * Verifies the session JWT and ensures the caller can only read/write/delete
 * THEIR OWN session's data.
 *
 * Before this: any client that guessed or intercepted a sessionId (a plain
 * UUID, e.g. from a URL or localStorage) could read or DELETE that user's
 * entire chat history via GET/DELETE /api/history/:sessionId — no proof of
 * ownership was ever required. Now a valid, session-bound token is required.
 */

const { verifySessionToken } = require('../utils/jwt');

function requireSessionAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing bearer token. Call POST /api/v1/session first.' });
  }

  let payload;
  try {
    payload = verifySessionToken(token);
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
  }

  // The sessionId the token was issued for must match the sessionId the
  // request is trying to act on (from body or URL param).
  const targetSessionId = req.body?.sessionId || req.params?.sessionId;
  if (targetSessionId && targetSessionId !== payload.sessionId) {
    return res.status(403).json({ success: false, error: 'Token does not grant access to this session.' });
  }

  req.sessionId = payload.sessionId;
  req.userId = payload.userId || null; // set only if this session was minted while logged in
  next();
}

module.exports = requireSessionAuth;
