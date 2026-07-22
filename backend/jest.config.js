module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  // The app opens a Mongo connection attempt on require(); in CI there's no
  // real Mongo, so force Jest to exit rather than hang on that open handle.
  forceExit: true,
  clearMocks: true,
  collectCoverageFrom: [
    'services/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    'validators/**/*.js',
    '!**/node_modules/**',
  ],
};
