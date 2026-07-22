/**
 * controllers/historyController.js
 * Thin HTTP layer for /history routes — business logic lives in
 * services/historyService.js.
 */

const historyService = require('../services/historyService');

exports.getHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const data = await historyService.getHistory(sessionId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const deletedCount = await historyService.deleteHistory(sessionId);
    res.status(200).json({ success: true, message: `Deleted ${deletedCount} messages and session record.` });
  } catch (err) {
    next(err);
  }
};

exports.getSessionSummary = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const summary = await historyService.getSessionSummary(sessionId);

    if (!summary) {
      return res.status(404).json({ success: false, error: 'Session not found.' });
    }

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

exports.listMySessions = async (req, res, next) => {
  try {
    const sessions = await historyService.getUserSessions(req.userId);
    res.status(200).json({ success: true, data: { sessions, count: sessions.length } });
  } catch (err) {
    next(err);
  }
};
