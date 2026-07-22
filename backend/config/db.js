/**
 * config/db.js
 * MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);

    const mustConnect =
      process.env.MONGODB_REQUIRED === 'true' || process.env.NODE_ENV === 'production';

    if (mustConnect) {
      process.exit(1);
    }

    logger.warn('⚠️  Continuing without MongoDB (degraded mode).');
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔄 MongoDB reconnected');
});

module.exports = connectDB;
