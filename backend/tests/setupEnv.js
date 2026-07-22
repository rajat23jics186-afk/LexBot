// Runs before every test file's module registry loads (see jest.config.js
// `setupFiles`). Ensures config/env.js always sees a valid config in CI,
// regardless of which test file happens to run first.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lexbot_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_at_least_16_characters_long';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error'; // keep test output quiet
