/**
 * config/db.js
 * MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are set by default in Mongoose 8+
      // but shown here for clarity
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    const mustConnect =
      process.env.MONGODB_REQUIRED === 'true' || process.env.NODE_ENV === 'production';

    if (mustConnect) {
      process.exit(1);
    }

    console.warn('⚠️  Continuing without MongoDB (degraded mode).');
    return false;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

module.exports = connectDB;