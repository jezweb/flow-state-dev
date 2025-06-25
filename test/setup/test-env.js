/**
 * Test environment setup for slash commands
 */

// Mock process.exit to prevent test termination
const originalExit = process.exit;
process.exit = (code) => {
  if (process.env.NODE_ENV === 'test') {
    throw new Error(`process.exit(${code})`);
  }
  return originalExit(code);
};

// Mock execSync for GitHub CLI checks
let mockExecSync = null;

export function mockGitHubCLI(shouldSucceed = true) {
  const { jest } = require('@jest/globals');
  
  if (!mockExecSync) {
    jest.doMock('child_process', () => ({
      execSync: jest.fn((cmd, options) => {
        if (cmd.includes('gh auth status')) {
          if (shouldSucceed) {
            return 'Logged in to github.com';
          } else {
            throw new Error('Not authenticated');
          }
        }
        if (cmd.includes('git rev-parse')) {
          if (shouldSucceed) {
            return '.git';
          } else {
            throw new Error('Not a git repository');
          }
        }
        return '';
      })
    }));
  }
}

export function resetMocks() {
  if (mockExecSync) {
    mockExecSync.mockReset();
  }
}