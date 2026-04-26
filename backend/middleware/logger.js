/**
 * middleware/logger.js
 * Custom request logger (wraps morgan for cleaner output)
 */

const morgan = require('morgan');

// Custom token: show body snippet for POST requests
morgan.token('body', (req) => {
  if (req.method === 'POST' && req.body && req.body.message) {
    const snippet = req.body.message.slice(0, 60);
    return `"${snippet}${req.body.message.length > 60 ? '…' : ''}"`;
  }
  return '';
});

// Format: METHOD URL STATUS TIME [body snippet]
const format =
  process.env.NODE_ENV === 'development'
    ? ':method :url :status :response-time ms :body'
    : ':remote-addr :method :url :status :response-time ms';

const logger = morgan(format);

module.exports = logger;