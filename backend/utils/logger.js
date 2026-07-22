/**
 * utils/logger.js
 * Central structured logger (Winston).
 *
 * - Development: colorized, human-readable single-line output
 * - Production: JSON lines (easy to ship to CloudWatch/Datadog/ELK, greppable)
 *
 * Use this instead of console.log everywhere else in the app.
 */

const winston = require('winston');
const env = require('../config/env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${ts}] ${level}: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'lexbot-backend' },
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

module.exports = logger;
