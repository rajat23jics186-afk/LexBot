/**
 * validators/chatValidators.js
 * Zod schemas for request validation. Replaces loose manual `if (!x)` checks
 * with a single declarative source of truth, applied via middleware before
 * the request ever reaches a controller.
 */

const { z } = require('zod');

const uuidLike = z.string().min(8).max(100); // accepts uuid v4 or similar opaque ids

const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, 'Message cannot be empty.').max(2000, 'Message is too long (max 2000 characters).'),
    sessionId: uuidLike,
  }),
});

const sessionIdParamSchema = z.object({
  params: z.object({
    sessionId: uuidLike,
  }),
});

module.exports = { sendMessageSchema, sessionIdParamSchema };
