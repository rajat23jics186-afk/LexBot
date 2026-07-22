/**
 * ============================================================
 * LexBot – AI Legal Information System
 * server.js – Main Express Server Entry Point
 * ============================================================
 *
 * Start:  node server.js
 * Dev:    nodemon server.js
 */

require('dotenv').config(); // load .env FIRST, before anything reads process.env

const env = require('./config/env'); // validates config, exits process if invalid

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const v1Routes = require('./routes/v1');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { register, metricsMiddleware } = require('./utils/metrics');
const openapiSpec = require('./docs/openapi');
const logger = require('./utils/logger');

// ─────────────────────────────────────────────
// CONNECT TO MONGODB
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// CREATE EXPRESS APP
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARE STACK
// ─────────────────────────────────────────────

app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(requestLogger);
app.use(metricsMiddleware);

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Health check – Render and uptime monitors ping this. Kept minimal in
// production so it doesn't leak internal config details publicly.
app.get('/api/health', (req, res) => {
  const base = {
    success: true,
    message: '⚖️ LexBot API is running',
    version: '1.0.0',
    time: new Date().toISOString(),
  };

  if (env.NODE_ENV !== 'production') {
    base.dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    base.env = env.NODE_ENV;
  }

  res.status(200).json(base);
});

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Versioned API
app.use('/api/v1', v1Routes);

// 404 – route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER (must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const BASE_PORT = env.PORT;
const MAX_PORT_ATTEMPTS = 10;

function startServer(port, attempt = 1) {
  const server = app.listen(port, () => {
    logger.info('⚖️  LexBot API Server started');
    logger.info(`   Port    : ${port}`);
    logger.info(`   Mode    : ${env.NODE_ENV}`);
    logger.info(`   Health  : http://localhost:${port}/api/health`);
    logger.info(`   Docs    : http://localhost:${port}/api-docs`);
    logger.info(`   Metrics : http://localhost:${port}/metrics`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      logger.warn(`⚠️  Port ${port} is busy, retrying on ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    logger.error(`❌ Server startup error: ${err.message}`);
    process.exit(1);
  });

  return server;
}

// Don't auto-start the HTTP listener when required by tests (supertest
// creates its own listener from the exported `app`).
if (env.NODE_ENV !== 'test') {
  startServer(BASE_PORT);
}

module.exports = app;
