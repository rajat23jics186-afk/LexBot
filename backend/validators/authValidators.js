/**
 * validators/authValidators.js
 */

const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72) // bcrypt's own hard limit
      .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('Invalid email address.'),
    password: z.string().min(1, 'Password is required.'),
  }),
});

module.exports = { registerSchema, loginSchema };
