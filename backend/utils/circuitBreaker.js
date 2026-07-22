/**
 * utils/circuitBreaker.js
 * Wraps an async function (e.g. "call Gemini API") in a circuit breaker.
 *
 * Why: if an AI provider starts failing/timing out repeatedly, hammering it
 * with every incoming request makes things worse (slow failures pile up,
 * users wait the full 30s timeout each time). A circuit breaker trips after
 * repeated failures and fails FAST for a cooldown period instead — freeing
 * the app to move straight to the next fallback provider.
 */

const CircuitBreaker = require('opossum');
const logger = require('./logger');

/**
 * @param {Function} fn - async function to protect, e.g. (userMessage) => Promise<string>
 * @param {String} name - label for logs
 * @param {Object} [opts] - opossum options overrides
 */
function createBreaker(fn, name, opts = {}) {
  const breaker = new CircuitBreaker(fn, {
    timeout: 15000,            // fail if the call takes longer than 15s
    errorThresholdPercentage: 50, // trip after 50% of recent calls fail
    resetTimeout: 30000,       // try again after 30s cooldown
    rollingCountTimeout: 60000,
    volumeThreshold: 3,        // need at least 3 calls before tripping
    ...opts,
  });

  breaker.on('open', () => logger.warn(`🔌 Circuit OPEN for ${name} — failing fast for 30s`));
  breaker.on('halfOpen', () => logger.info(`🔌 Circuit HALF-OPEN for ${name} — testing recovery`));
  breaker.on('close', () => logger.info(`🔌 Circuit CLOSED for ${name} — back to normal`));

  return breaker;
}

module.exports = createBreaker;
