/**
 * middleware/requestLogger.js
 * HTTP request logger (Morgan) piped through the Winston logger so all
 * logs — request logs and app logs — end up in one consistent stream/format.
 */

const morgan = require('morgan');
const logger = require('../utils/logger');
const env = require('../config/env');

// Custom token: show a short snippet of the message body for POST requests
// (truncated — never log full user PII/legal query content at info level in prod)
morgan.token('body', (req) => {
  if (req.method === 'POST' && req.body && req.body.message) {
    const snippet = req.body.message.slice(0, 40);
    return `"${snippet}${req.body.message.length > 40 ? '…' : ''}"`;
  }
  return '';
});

const format =
  env.NODE_ENV === 'development'
    ? ':method :url :status :response-time ms :body'
    : ':remote-addr :method :url :status :response-time ms';

const requestLogger = morgan(format, {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
});

module.exports = requestLogger;
