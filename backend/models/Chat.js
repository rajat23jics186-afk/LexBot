/**
 * models/Chat.js
 * Schema for a single chat message (one user turn + one bot reply)
 */

const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    // Session ID groups messages into one conversation
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    // Who sent the message: 'user' or 'bot'
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },

    // The message text
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // Detected legal topic (optional, filled by controller)
    topic: {
      type: String,
      default: null,
    },

    // Which source generated the bot reply
    source: {
      type: String,
      enum: ['gemini_api', 'local_db', 'fallback'],
      default: 'gemini_api',
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model('Chat', ChatSchema);