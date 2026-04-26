/**
 * middleware/rateLimiter.js
 * Prevents API abuse by limiting requests per IP
 */

const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require('../config/constants');

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: RATE_LIMIT_MAX,            // 50 requests per window
  standardHeaders: true,          // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

module.exports = limiter;