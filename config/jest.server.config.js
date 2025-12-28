/**
 * Jest configuration for server tests
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/client/'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
  ],
  setupFilesAfterEnv: [],
  verbose: true,
};
