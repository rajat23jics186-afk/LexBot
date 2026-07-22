/**
 * routes/v1/auth.js
 */

const express = require('express');
const router = express.Router();
const { register, login, me } = require('../../controllers/authController');
const { authLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const requireUserAuth = require('../../middleware/requireUserAuth');
const { registerSchema, loginSchema } = require('../../validators/authValidators');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', requireUserAuth, me);

module.exports = router;
