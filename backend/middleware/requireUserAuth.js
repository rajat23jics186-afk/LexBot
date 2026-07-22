/**
 * middleware/requireUserAuth.js
 * Verifies a USER (logged-in account) JWT — distinct from the anonymous
 * session token used by middleware/auth.js. Protects routes like
 * GET /api/v1/auth/me and GET /api/v1/history/me/sessions.
 */

const { verifyUserToken } = require('../utils/jwt');

function requireUserAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Login required. Missing bearer token.' });
  }

  try {
    const payload = verifyUserToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired login session.' });
  }
}

module.exports = requireUserAuth;
