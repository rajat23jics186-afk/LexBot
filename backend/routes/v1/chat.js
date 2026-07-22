/**
 * routes/v1/chat.js
 * POST /api/v1/chat — send a message, get a bot reply.
 * Pipeline: rate limit -> validate body -> auth (session ownership) -> controller.
 */

const express = require('express');
const router = express.Router();
const { sendMessage } = require('../../controllers/chatController');
const limiter = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const requireSessionAuth = require('../../middleware/auth');
const { sendMessageSchema } = require('../../validators/chatValidators');

router.post('/', limiter, validate(sendMessageSchema), requireSessionAuth, sendMessage);

module.exports = router;
