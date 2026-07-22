/**
 * utils/cache.js
 * Pluggable cache layer.
 *
 * - If REDIS_URL is set: uses Redis (shared cache, survives restarts,
 *   works across multiple app instances — needed once you scale horizontally).
 * - Otherwise: falls back to an in-process LRU cache (zero setup, fine for
 *   a single instance / local dev / demo).
 *
 * Callers don't need to know which backend is active — same get/set API.
 */

const { LRUCache } = require('lru-cache');
const env = require('../config/env');
const logger = require('./logger');

const DEFAULT_TTL_SECONDS = 60 * 60; // 1 hour — common legal Q&A doesn't go stale fast

class MemoryCacheAdapter {
  constructor() {
    this.store = new LRUCache({ max: 500, ttl: DEFAULT_TTL_SECONDS * 1000 });
    logger.info('🧠 Cache backend: in-memory (LRU)');
  }

  async get(key) {
    return this.store.get(key) ?? null;
  }

  async set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    this.store.set(key, value, { ttl: ttlSeconds * 1000 });
  }
}

class RedisCacheAdapter {
  constructor(redisUrl) {
    // Lazy require so `ioredis` is only needed when REDIS_URL is actually set
    const Redis = require('ioredis');
    this.client = new Redis(redisUrl, { maxRetriesPerRequest: 2, lazyConnect: true });

    this.client.on('error', (err) => {
      logger.warn(`⚠️  Redis error: ${err.message}`);
    });

    this.client.connect().then(
      () => logger.info('🧠 Cache backend: Redis (connected)'),
      (err) => logger.warn(`⚠️  Redis connection failed, cache disabled: ${err.message}`)
    );
  }

  async get(key) {
    try {
      const raw = await this.client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.warn(`⚠️  Redis GET failed: ${err.message}`);
      return null;
    }
  }

  async set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn(`⚠️  Redis SET failed: ${err.message}`);
    }
  }
}

const cache = env.REDIS_URL ? new RedisCacheAdapter(env.REDIS_URL) : new MemoryCacheAdapter();

/**
 * Build a stable cache key for a legal question.
 * Lowercased + whitespace-collapsed so trivial variations ("What is FIR?" vs
 * "what is fir") hit the same cache entry.
 */
function chatCacheKey(message) {
  const normalized = message.trim().toLowerCase().replace(/\s+/g, ' ');
  return `chat:${normalized}`;
}

module.exports = { cache, chatCacheKey, DEFAULT_TTL_SECONDS };
