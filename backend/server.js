/**
 * ============================================================
 * LexBot – AI Legal Information System
 * server.js – Main Express Server Entry Point
 * ============================================================
 *
 * Start:  node server.js
 * Dev:    nodemon server.js
 */

const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
require('dotenv').config(); // load .env FIRST

const connectDB      = require('./config/db');
const chatRoutes     = require('./routes/chat');
const historyRoutes  = require('./routes/history');
const errorHandler   = require('./middleware/errorHandler');
const logger         = require('./middleware/logger');

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

// Security headers (disables some default helmet policies for dev)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS – allow frontend to call this API
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000',
    // Add your Netlify/Vercel URL here after deployment
    // 'https://lexbot.netlify.app',
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parse JSON bodies (max 10kb to prevent large payloads)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging
app.use(logger);

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

// Health check – Render and uptime monitors ping this
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success : true,
    message : '⚖️ LexBot API is running',
    version : '1.0.0',
    dbState : mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env     : process.env.NODE_ENV,
    time    : new Date().toISOString(),
  });
});

// Main API routes
app.use('/api/chat',    chatRoutes);
app.use('/api/history', historyRoutes);

// 404 – route not found
app.use((req, res) => {
  res.status(404).json({
    success : false,
    error   : `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER (must be last)
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const BASE_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = 10;

function startServer(port, attempt = 1) {
  const server = app.listen(port, () => {
    console.log('');
    console.log('⚖️  ================================');
    console.log('⚖️  LexBot API Server');
    console.log(`⚖️  Port    : ${port}`);
    console.log(`⚖️  Mode    : ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚖️  Health  : http://localhost:${port}/api/health`);
    console.log('⚖️  ================================');
    console.log('');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} is busy, retrying on ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error(`❌ Server startup error: ${err.message}`);
    process.exit(1);
  });
}

startServer(BASE_PORT);

module.exports = app; // for testing