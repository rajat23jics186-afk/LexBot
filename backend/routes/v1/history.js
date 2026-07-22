/**
 * routes/v1/history.js
 * GET/DELETE /api/v1/history/:sessionId — now requires the caller to hold
 * a valid token for THAT sessionId (see middleware/auth.js).
 */

const express = require('express');
const router = express.Router();
const {
  getHistory,
  deleteHistory,
  getSessionSummary,
  listMySessions,
} = require('../../controllers/historyController');
const validate = require('../../middleware/validate');
const requireSessionAuth = require('../../middleware/auth');
const requireUserAuth = require('../../middleware/requireUserAuth');
const { sessionIdParamSchema } = require('../../validators/chatValidators');

// Logged-in-user routes (registered first — /me/sessions has 2 path segments
// so it never collides with the single-segment /:sessionId routes below).
router.get('/me/sessions', requireUserAuth, listMySessions);

router.get('/:sessionId', validate(sessionIdParamSchema), requireSessionAuth, getHistory);
router.get('/:sessionId/summary', validate(sessionIdParamSchema), requireSessionAuth, getSessionSummary);
router.delete('/:sessionId', validate(sessionIdParamSchema), requireSessionAuth, deleteHistory);

module.exports = router;
