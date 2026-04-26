/**
 * routes/chat.js
 * Route: POST /api/chat
 */

const express        = require('express');
const router         = express.Router();
const { sendMessage } = require('../controllers/chatController');
const limiter        = require('../middleware/rateLimiter');

// POST /api/chat  – send a user message and get bot reply
// Rate limited to prevent API abuse
router.post('/', limiter, sendMessage);

module.exports = router;