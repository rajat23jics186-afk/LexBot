/**
 * middleware/errorHandler.js
 * Global error handler – catches all unhandled errors in Express
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message),
    });
  }

  // Mongoose invalid ObjectId / cast error (e.g. malformed id in a query)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid value for field '${err.path}'.`,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry – this session already exists.',
    });
  }

  // JWT / Auth errors (jsonwebtoken throws these names directly too)
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access.',
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;