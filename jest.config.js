/**
 * Jest Configuration
 * Backend testing setup
 */

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['routes/**/*.js', 'middleware/**/*.js', 'utils/**/*.js'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  setupFilesAfterEnv: ['<rootDir>/server/__tests__/setup.js'],
  testTimeout: 10000,
}
