/**
 * config/constants.js
 * App-wide constants – now using Google Gemini API
 */

module.exports = {

  // Google Gemini model
  GEMINI_MODEL: 'gemini-2.5-flash',

  // Gemini API endpoint
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',

  // Claude (Anthropic) model — used as fallback when Gemini fails/is rate-limited
  CLAUDE_MODEL: 'claude-sonnet-4-6',

  // Claude API endpoint
  CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',

  // Claude API version header (required by Anthropic API)
  CLAUDE_API_VERSION: '2023-06-01',

  // Max output tokens for Gemini/Claude response
  MAX_TOKENS: 1024,

  // System prompt sent with every Gemini request
  SYSTEM_PROMPT: `You are LexBot, an AI Legal Information Assistant for Indian citizens.
You provide accurate, helpful legal INFORMATION (not legal advice) about Indian law in simple, plain language.

Always structure every response EXACTLY like this:
📌 TOPIC: <topic name>
📖 EXPLANATION: <plain language explanation of the relevant law>
📝 STEPS:
1. <step one>
2. <step two>
3. <step three>
(continue as needed)
💡 TIP: <one practical tip>
⚠️ DISCLAIMER: This is legal information only, not professional legal advice. Please consult a qualified advocate for your specific case.

Rules:
- Reference Indian laws (IPC, CrPC, IT Act 2000, Consumer Protection Act 2019, RTI Act 2005, etc.)
- Keep language simple, friendly, and accessible to common citizens
- If question is outside legal scope, redirect to relevant government helplines
- Never fabricate laws or section numbers
- Keep responses concise but complete`,

  // Rate limiter settings
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 50,                    // 50 requests per window per IP

  // Supported local topics (fast-path, no API needed)
  SUPPORTED_TOPICS: [
    'FIR Filing',
    'Cyber Fraud',
    'Consumer Rights',
    'RTI Application',
    'Labour Rights',
    'Bail Process',
    'Domestic Violence',
    'Property Dispute',
  ],
};