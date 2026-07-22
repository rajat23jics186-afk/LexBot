// Mock every external dependency BEFORE requiring chatService, so no real
// DB, Redis, or AI API is ever touched in tests.
jest.mock('../models/Chat', () => ({ create: jest.fn().mockResolvedValue({ _id: 'chat123', createdAt: new Date() }) }));
jest.mock('../models/Session', () => ({ findOneAndUpdate: jest.fn().mockResolvedValue({}) }));
jest.mock('../models/AuditLog', () => ({ create: jest.fn().mockResolvedValue({}) }));
jest.mock('../services/providers/geminiProvider');
jest.mock('../services/providers/claudeProvider');
jest.mock('../utils/cache', () => ({
  cache: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) },
  chatCacheKey: (msg) => `chat:${msg.toLowerCase()}`,
}));

const { callGemini } = require('../services/providers/geminiProvider');
const { callClaude } = require('../services/providers/claudeProvider');
const { cache } = require('../utils/cache');
const chatService = require('../services/chatService');

describe('resolveBotReply', () => {
  afterEach(() => jest.clearAllMocks());

  it('answers from local DB without calling any AI provider', async () => {
    const result = await chatService.resolveBotReply('How do I file an FIR?');

    expect(result.source).toBe('local_db');
    expect(result.topicKey).toBe('fir');
    expect(callGemini).not.toHaveBeenCalled();
    expect(callClaude).not.toHaveBeenCalled();
  });

  it('returns a cached reply without calling any AI provider', async () => {
    cache.get.mockResolvedValueOnce({ botText: 'cached answer', source: 'gemini_api' });

    const result = await chatService.resolveBotReply('some general legal question');

    expect(result.source).toBe('gemini_api_cached');
    expect(result.botText).toBe('cached answer');
    expect(callGemini).not.toHaveBeenCalled();
  });

  it('calls Gemini for a non-local, non-cached question', async () => {
    callGemini.mockResolvedValueOnce('gemini says hi');

    const result = await chatService.resolveBotReply('some general legal question');

    expect(result.source).toBe('gemini_api');
    expect(result.botText).toBe('gemini says hi');
  });

  it('falls back to Claude when Gemini fails', async () => {
    callGemini.mockRejectedValueOnce(new Error('gemini down'));
    callClaude.mockResolvedValueOnce('claude says hi');

    const result = await chatService.resolveBotReply('some general legal question');

    expect(result.source).toBe('claude_api');
    expect(result.botText).toBe('claude says hi');
  });

  it('returns the generic fallback when both Gemini and Claude fail', async () => {
    callGemini.mockRejectedValueOnce(new Error('gemini down'));
    callClaude.mockRejectedValueOnce(new Error('claude down'));

    const result = await chatService.resolveBotReply('some general legal question');

    expect(result.source).toBe('fallback');
    expect(result.botText).toContain('NALSA');
  });
});

describe('processMessage', () => {
  afterEach(() => jest.clearAllMocks());

  it('persists user + bot messages and returns a shaped response', async () => {
    callGemini.mockResolvedValueOnce('gemini reply');

    const result = await chatService.processMessage({
      sessionId: 'session-1',
      message: '  What are my consumer rights?  ',
    });

    expect(result.sessionId).toBe('session-1');
    expect(result.source).toBe('local_db'); // "consumer" + "rights" triggers local DB
    expect(result.message).toContain('Consumer');
  });
});
