/**
 * Tests for BaseSlashCommand
 */
import { jest } from '@jest/globals';
import { BaseSlashCommand, GitHubSlashCommand } from '../../lib/commands/base.js';

describe('BaseSlashCommand', () => {
  let mockCommand;

  beforeEach(() => {
    // Create a test command
    class TestCommand extends BaseSlashCommand {
      async execute(options) {
        return { executed: true, options };
      }
    }

    mockCommand = new TestCommand('test', 'Test command', {
      aliases: ['t'],
      category: 'testing',
      usage: 'test [options]',
      examples: ['test --flag'],
      requiresAuth: false,
      requiresRepo: false
    });
  });

  describe('constructor', () => {
    it('should initialize command with basic properties', () => {
      expect(mockCommand.name).toBe('test');
      expect(mockCommand.description).toBe('Test command');
      expect(mockCommand.aliases).toEqual(['t']);
      expect(mockCommand.category).toBe('testing');
    });

    it('should set default values', () => {
      const cmd = new (class extends BaseSlashCommand {
        async execute() {}
      })('cmd', 'description');
      
      expect(cmd.aliases).toEqual([]);
      expect(cmd.category).toBe('general');
      expect(cmd.requiresAuth).toBe(true);
      expect(cmd.requiresRepo).toBe(true);
    });
  });

  describe('validate', () => {
    it('should pass validation when requirements are disabled', async () => {
      const result = await mockCommand.validate();
      expect(result.valid).toBe(true);
    });

    it('should handle missing GitHub CLI auth', async () => {
      const cmd = new (class extends BaseSlashCommand {
        async execute() {}
      })('cmd', 'description', { requiresAuth: true });

      // Mock the dynamic import of child_process
      const mockExecSync = jest.fn().mockImplementation(() => {
        throw new Error('not authenticated');
      });
      
      jest.doMock('child_process', () => ({
        execSync: mockExecSync
      }));
      
      const result = await cmd.validate();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('GitHub CLI not authenticated');
    });
  });

  describe('getHelp', () => {
    it('should generate help text', () => {
      const help = mockCommand.getHelp();
      expect(help).toContain('test');
      expect(help).toContain('Test command');
      expect(help).toContain('aliases: t');
      expect(help).toContain('Usage: test [options]');
      expect(help).toContain('test --flag');
    });
  });

  describe('utilities', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = mockCommand.formatDate(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    it('should format durations correctly', () => {
      expect(mockCommand.formatDuration(45000)).toBe('45s');
      expect(mockCommand.formatDuration(125000)).toBe('2m 5s');
      expect(mockCommand.formatDuration(3725000)).toBe('1h 2m');
    });
  });
});

describe('GitHubSlashCommand', () => {
  let mockCommand;

  beforeEach(() => {
    class TestGitHubCommand extends GitHubSlashCommand {
      async execute(options) {
        return { executed: true };
      }
    }

    mockCommand = new TestGitHubCommand('gh-test', 'GitHub test command');
  });

  it('should require auth and repo by default', () => {
    expect(mockCommand.requiresAuth).toBe(true);
    expect(mockCommand.requiresRepo).toBe(true);
  });

  describe('parseIssueReferences', () => {
    it('should extract issue numbers from text', () => {
      const text = 'This fixes #123 and depends on #456. See also #789.';
      const refs = mockCommand.parseIssueReferences(text);
      expect(refs).toEqual([123, 456, 789]);
    });

    it('should handle various reference formats', () => {
      const text = 'blocked by #10, blocks #20, related to #30';
      const refs = mockCommand.parseIssueReferences(text);
      expect(refs).toEqual([10, 20, 30]);
    });

    it('should avoid duplicates', () => {
      const text = '#100 depends on #100';
      const refs = mockCommand.parseIssueReferences(text);
      expect(refs).toEqual([100]);
    });
  });

  describe('extractStoryPoints', () => {
    it('should extract story points from various label formats', () => {
      expect(mockCommand.extractStoryPoints(['5 points'])).toBe(5);
      expect(mockCommand.extractStoryPoints(['points: 8'])).toBe(8);
      expect(mockCommand.extractStoryPoints(['sp-13'])).toBe(13);
      expect(mockCommand.extractStoryPoints(['story-points-21'])).toBe(21);
      expect(mockCommand.extractStoryPoints(['estimate: 3'])).toBe(3);
    });

    it('should return null for no matching labels', () => {
      expect(mockCommand.extractStoryPoints(['bug', 'priority-high'])).toBe(null);
    });
  });
});