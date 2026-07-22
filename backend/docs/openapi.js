/**
 * docs/openapi.js
 * OpenAPI 3.0 spec, served at /api-docs via swagger-ui-express.
 * Written as a plain object (rather than JSDoc-comment scanning) so the
 * spec is explicit, versioned, and doesn't drift silently from route files.
 */

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'LexBot API',
    version: '1.0.0',
    description: 'AI Legal Information Assistant API for Indian citizens.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ChatMessage: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'How do I file an FIR?' },
          sessionId: { type: 'string', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
        },
        required: ['message', 'sessionId'],
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Create a user account',
        requestBody: { required: true, content: { 'application/json': {} } },
        responses: { 201: { description: 'Account created' }, 409: { description: 'Email already registered' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in',
        requestBody: { required: true, content: { 'application/json': {} } },
        responses: { 200: { description: 'Logged in' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/me': {
      get: {
        summary: "Get the logged-in user's profile",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile' }, 401: { description: 'Not logged in' } },
      },
    },
    '/session': {
      post: {
        summary: 'Create a new chat session',
        description: 'Issues a sessionId and a JWT bound to it. Call this once before using /chat or /history.',
        responses: {
          201: { description: 'Session created' },
          429: { description: 'Rate limited' },
        },
      },
    },
    '/chat': {
      post: {
        summary: 'Send a message and get a bot reply',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChatMessage' } } },
        },
        responses: {
          200: { description: 'Bot reply' },
          400: { description: 'Validation error' },
          401: { description: 'Missing/invalid token' },
          403: { description: 'Token does not match sessionId' },
          429: { description: 'Rate limited' },
        },
      },
    },
    '/history/me/sessions': {
      get: {
        summary: "List all sessions belonging to the logged-in user's account",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of sessions' }, 401: { description: 'Not logged in' } },
      },
    },
    '/history/{sessionId}': {
      get: {
        summary: 'Get full chat history for a session',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Session history' }, 401: { description: 'Unauthorized' } },
      },
      delete: {
        summary: 'Delete all history for a session',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/history/{sessionId}/summary': {
      get: {
        summary: 'Get session metadata only (no messages)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Session summary' }, 404: { description: 'Not found' } },
      },
    },
  },
};
