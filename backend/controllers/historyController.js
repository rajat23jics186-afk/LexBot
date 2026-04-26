/**
 * controllers/historyController.js
 * Handles fetching and deleting chat history for a session
 */

const Chat    = require('../models/Chat');
const Session = require('../models/Session');

// ─────────────────────────────────────────────
// GET /api/history/:sessionId
// Returns all messages for a session
// ─────────────────────────────────────────────
exports.getHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    // Fetch all messages sorted by creation time
    const messages = await Chat.find({ sessionId })
      .sort({ createdAt: 1 })
      .select('role message topic source createdAt');

    // Fetch session metadata
    const session = await Session.findOne({ sessionId })
      .select('userName language messageCount topicsDiscussed createdAt lastActiveAt');

    res.status(200).json({
      success: true,
      data: {
        session : session || null,
        messages,
        count   : messages.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/history/:sessionId
// Deletes all messages and session record
// ─────────────────────────────────────────────
exports.deleteHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required.' });
    }

    // Delete all chat messages for this session
    const deletedChats = await Chat.deleteMany({ sessionId });

    // Delete the session record
    await Session.findOneAndDelete({ sessionId });

    res.status(200).json({
      success: true,
      message: `Deleted ${deletedChats.deletedCount} messages and session record.`,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/history/:sessionId/summary
// Returns a brief session summary (no messages)
// ─────────────────────────────────────────────
exports.getSessionSummary = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        messageCount    : session.messageCount,
        topicsDiscussed : session.topicsDiscussed,
        language        : session.language,
        createdAt       : session.createdAt,
        lastActiveAt    : session.lastActiveAt,
      },
    });
  } catch (err) {
    next(err);
  }
};