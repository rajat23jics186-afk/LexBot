/**
 * services/chatService.js
 * All business logic for "send a message, get a bot reply" lives here.
 * Controller stays thin — just HTTP in/out. This is what makes the logic
 * unit-testable without spinning up Express or a real DB.
 */

const Chat = require('../models/Chat');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');
const { detectTopic, legalDB, formatLocalResponse, GENERIC_FALLBACK } = require('./legalKnowledgeBase');
const { callGemini } = require('./providers/geminiProvider');
const { callClaude } = require('./providers/claudeProvider');
const createBreaker = require('../utils/circuitBreaker');
const { cache, chatCacheKey } = require('../utils/cache');
const { chatSourceCounter } = require('../utils/metrics');
const logger = require('../utils/logger');

// Circuit breakers — one per provider, shared across requests (module-level
// singletons) so failure state is tracked across the whole app, not per-call.
const geminiBreaker = createBreaker(callGemini, 'gemini');
const claudeBreaker = createBreaker(callClaude, 'claude');

/**
 * Resolve a bot reply for a user message: local DB fast-path → cache →
 * Gemini (circuit-broken) → Claude (circuit-broken) → generic fallback.
 * Pure-ish function: no DB writes here, just "what should the bot say".
 */
async function resolveBotReply(cleanMsg) {
  const topicKey = detectTopic(cleanMsg);

  if (topicKey && legalDB[topicKey]) {
    chatSourceCounter.inc({ source: 'local_db' });
    return { botText: formatLocalResponse(legalDB[topicKey]), topicKey, source: 'local_db' };
  }

  const cacheKey = chatCacheKey(cleanMsg);
  const cached = await cache.get(cacheKey);
  if (cached) {
    logger.info('💾 Cache hit for chat query');
    chatSourceCounter.inc({ source: `${cached.source}_cached` });
    return { botText: cached.botText, topicKey: null, source: `${cached.source}_cached` };
  }

  try {
    const botText = await geminiBreaker.fire(cleanMsg);
    await cache.set(cacheKey, { botText, source: 'gemini_api' });
    chatSourceCounter.inc({ source: 'gemini_api' });
    return { botText, topicKey: null, source: 'gemini_api' };
  } catch (geminiErr) {
    logger.warn(`⚠️  Gemini unavailable: ${geminiErr.message}`);

    try {
      const botText = await claudeBreaker.fire(cleanMsg);
      await cache.set(cacheKey, { botText, source: 'claude_api' });
      chatSourceCounter.inc({ source: 'claude_api' });
      return { botText, topicKey: null, source: 'claude_api' };
    } catch (claudeErr) {
      logger.warn(`⚠️  Claude unavailable: ${claudeErr.message}`);
      chatSourceCounter.inc({ source: 'fallback' });
      return { botText: GENERIC_FALLBACK, topicKey: null, source: 'fallback' };
    }
  }
}

/**
 * Full pipeline for POST /chat: upsert session, persist user message,
 * resolve bot reply, persist bot reply, update session metadata, audit log.
 */
async function processMessage({ sessionId, message, userId = null }) {
  const cleanMsg = message.trim();

  const setOnInsert = { sessionId, language: 'en' };
  const set = { lastActiveAt: Date.now(), isActive: true };
  // Only ever SET userId (link), never unset it — a session that started
  // logged-in stays linked even if a later request somehow arrives without
  // the claim (e.g. an older cached anonymous token reused by mistake).
  if (userId) set.userId = userId;

  await Session.findOneAndUpdate(
    { sessionId },
    { $setOnInsert: setOnInsert, $set: set, $inc: { messageCount: 2 } },
    { upsert: true, new: true }
  );

  await Chat.create({ sessionId, role: 'user', message: cleanMsg });

  const { botText, topicKey, source } = await resolveBotReply(cleanMsg);

  const botChat = await Chat.create({
    sessionId,
    role: 'bot',
    message: botText,
    topic: topicKey || null,
    source: source.replace('_cached', ''), // enum only knows the base source values
  });

  if (topicKey) {
    await Session.findOneAndUpdate({ sessionId }, { $addToSet: { topicsDiscussed: topicKey } });
  }

  // Compliance/audit trail — WHO asked WHAT and which system answered it.
  // Kept separate from Chat so it can have its own retention policy later.
  AuditLog.create({ sessionId, topic: topicKey, source, messageLength: cleanMsg.length }).catch((err) =>
    logger.warn(`⚠️  Audit log write failed: ${err.message}`)
  );

  return {
    messageId: botChat._id,
    sessionId,
    message: botText,
    topic: topicKey,
    source,
    timestamp: botChat.createdAt,
  };
}

module.exports = { processMessage, resolveBotReply };
