/**
 * models/AuditLog.js
 * Lightweight compliance/audit trail — separate from Chat so it can have
 * its own retention policy and never stores the raw question text (only
 * length + topic), which keeps it low-risk from a privacy standpoint while
 * still answering "who used what, how often, via which provider".
 */

const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    topic: { type: String, default: null },
    source: {
      type: String,
      enum: ['gemini_api', 'claude_api', 'gemini_api_cached', 'claude_api_cached', 'local_db', 'fallback'],
      required: true,
    },
    messageLength: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
