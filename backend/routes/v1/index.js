/**
 * routes/v1/index.js
 * Aggregates all v1 routes under one router, mounted at /api/v1 in server.js.
 */

const express = require('express');
const router = express.Router();

router.use('/session', require('./session'));
router.use('/auth', require('./auth'));
router.use('/chat', require('./chat'));
router.use('/history', require('./history'));

module.exports = router;
