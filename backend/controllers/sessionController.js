/**
 * controllers/sessionController.js
 * POST /api/v1/session — issues a fresh sessionId + JWT bound to it.
 *
 * If the caller is logged in (sends a valid user Bearer token), the new
 * session gets linked to their account — so their chat history is tied to
 * their account, not just to one browser's localStorage. Anonymous callers
 * (no/invalid token) still get a normal guest session — login is optional.
 */

const { v4: uuidv4 } = require('uuid');
const { signSessionToken, verifyUserToken } = require('../utils/jwt');

function tryGetUserId(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;

  try {
    return verifyUserToken(token).userId;
  } catch {
    return null; // not logged in / expired — fall back to anonymous, don't error
  }
}

exports.createSession = (req, res) => {
  const sessionId = uuidv4();
  const userId = tryGetUserId(req);
  const token = signSessionToken(sessionId, userId);

  res.status(201).json({
    success: true,
    data: { sessionId, token, linkedToAccount: Boolean(userId) },
  });
};
