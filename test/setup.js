/**
 * Jest test environment setup
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.FSD_TEST = 'true';

// Global test utilities
global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(global.__filename);
global.testRootDir = join(global.__dirname, '..');
global.testTempDir = join(global.testRootDir, 'temp');

// Ensure temp directory exists and is clean
beforeAll(async () => {
  await fs.ensureDir(global.testTempDir);
});

// Clean up after each test
afterEach(async () => {
  // Clean temp directory but don't remove it
  if (await fs.pathExists(global.testTempDir)) {
    const files = await fs.readdir(global.testTempDir);
    for (const file of files) {
      await fs.remove(join(global.testTempDir, file));
    }
  }
});

// Clean up after all tests
afterAll(async () => {
  if (await fs.pathExists(global.testTempDir)) {
    await fs.remove(global.testTempDir);
  }
});

// Custom matchers
expect.extend({
  toBeValidModule(received) {
    const pass = received &&
      typeof received.name === 'string' &&
      typeof received.version === 'string' &&
      typeof received.category === 'string' &&
      typeof received.description === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid module`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid module with name, version, category, and description`,
        pass: false
      };
    }
  },
  
  toHaveValidDependencyGraph(received) {
    const pass = received &&
      received.modules &&
      Array.isArray(received.modules) &&
      received.graph &&
      typeof received.graph === 'object';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have a valid dependency graph`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to have a valid dependency graph with modules array and graph object`,
        pass: false
      };
    }
  }
});

// Mock console methods during tests to reduce noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  if (process.env.SILENT_TESTS === 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
  }
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});