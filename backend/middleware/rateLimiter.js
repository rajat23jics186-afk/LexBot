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

// Stricter limit specifically for login/register — these are the routes an
// attacker would brute-force (password guessing, account enumeration).
// Much lower ceiling than general API traffic.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login/register attempts. Please try again after 15 minutes.',
  },
});

module.exports = limiter;
module.exports.authLimiter = authLimiter;
