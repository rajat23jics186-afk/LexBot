/**
 * services/providers/claudeProvider.js
 * Talks to Anthropic Claude — used as fallback when Gemini fails/trips.
 */

const axios = require('axios');
const axiosRetry = require('axios-retry').default || require('axios-retry');
const {
  CLAUDE_API_URL,
  CLAUDE_MODEL,
  CLAUDE_API_VERSION,
  MAX_TOKENS,
  SYSTEM_PROMPT,
} = require('../../config/constants');

const client = axios.create({ timeout: 12000 });

axiosRetry(client, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status === 429 ||
    error.response?.status >= 500,
});

async function callClaude(userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.includes('xxxxxxxx')) {
    throw new Error('No valid Anthropic API key configured');
  }

  // Same principle as Gemini: `system` and `messages` are separate fields,
  // never concatenated — keeps user text untrusted/non-instructional.
  const response = await client.post(
    CLAUDE_API_URL,
    {
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_API_VERSION,
      },
    }
  );

  const textBlock = response.data?.content?.find((b) => b.type === 'text');
  if (!textBlock?.text) throw new Error('Empty response from Claude API');
  return textBlock.text;
}

module.exports = { callClaude };
