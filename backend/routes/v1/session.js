/**
 * routes/v1/session.js
 * POST /api/v1/session — issue a new session + JWT token.
 * Intentionally NOT behind auth (you need a token before you have one).
 * Rate-limited to stop token-minting abuse.
 */

const express = require('express');
const router = express.Router();
const { createSession } = require('../../controllers/sessionController');
const limiter = require('../../middleware/rateLimiter');

router.post('/', limiter, createSession);

module.exports = router;
