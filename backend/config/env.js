/**
 * config/env.js
 * Validates all required environment variables at boot time using Zod.
 *
 * Why this exists: without it, a missing/malformed env var (e.g. a typo'd
 * MONGODB_URI, or a forgotten JWT_SECRET) only surfaces later as a runtime
 * crash deep in some request handler — hard to debug in production.
 * Failing fast here means the process refuses to start with a clear error.
 */

const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_REQUIRED: z.enum(['true', 'false']).default('false'),

  // At least one AI provider key should be present for the bot to be useful,
  // but we don't hard-fail — chatService degrades gracefully to local_db/fallback.
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),

  FRONTEND_URL: z.string().optional(),
  REDIS_URL: z.string().optional(), // optional — falls back to in-memory cache

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\nCheck your .env file against .env.example and fix the above.');
    process.exit(1);
  }

  if (!parsed.data.GEMINI_API_KEY && !parsed.data.ANTHROPIC_API_KEY) {
    console.warn('⚠️  Neither GEMINI_API_KEY nor ANTHROPIC_API_KEY is set — chatbot will only answer from the local knowledge base.');
  }

  return parsed.data;
}

module.exports = loadEnv();
