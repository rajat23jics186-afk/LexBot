/**
 * routes/history.js
 * Routes: GET / DELETE /api/history/:sessionId
 */

const express = require('express');
const router  = express.Router();
const {
  getHistory,
  deleteHistory,
  getSessionSummary,
} = require('../controllers/historyController');

// GET /api/history/:sessionId          – get all messages for a session
router.get('/:sessionId', getHistory);

// GET /api/history/:sessionId/summary  – get session metadata only
router.get('/:sessionId/summary', getSessionSummary);

// DELETE /api/history/:sessionId       – delete all messages + session
router.delete('/:sessionId', deleteHistory);

module.exports = router;