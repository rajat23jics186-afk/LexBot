/**
 * services/providers/geminiProvider.js
 * Talks to Google Gemini. Isolated here so chatService doesn't need to know
 * provider-specific request/response shapes.
 */

const axios = require('axios');
const axiosRetry = require('axios-retry').default || require('axios-retry');
const { GEMINI_API_URL, MAX_TOKENS, SYSTEM_PROMPT } = require('../../config/constants');

const client = axios.create({ timeout: 12000 });

// Retry transient failures (network blips, 429, 5xx) with exponential backoff.
// Does NOT retry on 4xx client errors (bad request, invalid key) — retrying
// those just wastes time since the response will be identical.
axiosRetry(client, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status === 429 ||
    error.response?.status >= 500,
});

async function callGemini(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('xxxxxxxx')) {
    throw new Error('No valid Gemini API key configured');
  }

  // system prompt and user text are kept as SEPARATE fields (systemInstruction
  // vs contents) — never string-concatenated — so user input can't be
  // interpreted as trusted instructions (prompt injection).
  const response = await client.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty or blocked response from Gemini API');
  return text;
}

module.exports = { callGemini };
