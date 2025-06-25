/**
 * Jest configuration for Flow State Dev
 * Configured for ES modules and comprehensive testing
 */
export default {
  // Use Node's native ESM support
  testEnvironment: 'node',
  
  // Enable ES modules support
  preset: null,
  transform: {},
  
  // Test match patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    '!lib/templates/**',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true
};