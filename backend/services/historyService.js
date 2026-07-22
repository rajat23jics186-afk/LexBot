/**
 * services/historyService.js
 * Business logic for reading/deleting chat history, kept out of the
 * controller for the same testability reasons as chatService.
 */

const Chat = require('../models/Chat');
const Session = require('../models/Session');

async function getHistory(sessionId) {
  const messages = await Chat.find({ sessionId })
    .sort({ createdAt: 1 })
    .select('role message topic source createdAt');

  const session = await Session.findOne({ sessionId }).select(
    'userName language messageCount topicsDiscussed createdAt lastActiveAt'
  );

  return { session: session || null, messages, count: messages.length };
}

async function deleteHistory(sessionId) {
  const deletedChats = await Chat.deleteMany({ sessionId });
  await Session.findOneAndDelete({ sessionId });
  return deletedChats.deletedCount;
}

async function getSessionSummary(sessionId) {
  const session = await Session.findOne({ sessionId });
  if (!session) return null;

  return {
    sessionId,
    messageCount: session.messageCount,
    topicsDiscussed: session.topicsDiscussed,
    language: session.language,
    createdAt: session.createdAt,
    lastActiveAt: session.lastActiveAt,
  };
}

/** All sessions linked to a logged-in user's account, newest first. */
async function getUserSessions(userId) {
  return Session.find({ userId })
    .sort({ lastActiveAt: -1 })
    .select('sessionId messageCount topicsDiscussed language createdAt lastActiveAt');
}

module.exports = { getHistory, deleteHistory, getSessionSummary, getUserSessions };
