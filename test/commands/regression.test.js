/**
 * Regression Tests for Slash Commands
 * Ensures migration maintains exact functionality of legacy system
 */
import { jest } from '@jest/globals';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import { getMigrationStatus } from '../../lib/slash-commands-wrapper.js';

describe('Migration Regression Tests', () => {
  let executor;
  let mockConsole;

  beforeAll(() => {
    executor = new SlashCommandExecutor();
  });

  beforeEach(() => {
    mockConsole = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation()
    };
  });

  afterEach(() => {
    Object.values(mockConsole).forEach(spy => spy.mockRestore());
  });

  describe('Migration Completeness', () => {
    it('should have 100% migration completion', () => {
      const status = getMigrationStatus();
      expect(status.percentage).toBe(100);
      expect(status.total).toBe(67);
      expect(status.migrated.length).toBe(67);
    });

    it('should have all expected command categories', () => {
      const status = getMigrationStatus();
      const categories = status.byCategory;
      
      expect(categories.utility).toBe(3);
      expect(categories.quickAction).toBe(14);
      expect(categories.project).toBe(5);
      expect(categories.analysis).toBe(5);
      expect(categories.workflow).toBe(8);
      expect(categories.sprint).toBe(6);
      expect(categories.issue).toBe(5);
      expect(categories.estimation).toBe(6);
      expect(categories.planning).toBe(10);
      expect(categories.thinking).toBe(5);
      expect(categories.total).toBe(67);
    });
  });

  describe('Legacy Command Compatibility', () => {
    const legacyCommands = [
      // Utility commands
      '/help',
      '/sync', 
      '/clean',
      
      // Quick action commands
      '/status', '/s',
      '/add', '/a',
      '/commit', '/c', 
      '/push', '/p',
      '/pr', '/pull-request',
      '/build', '/b',
      '/test', '/t',
      '/lint', '/l',
      
      // Project management
      '/issues', '/i',
      '/milestones', '/m',
      '/labels',
      
      // Analysis commands
      '/metrics',
      '/dependencies', '/deps',
      '/quality', '/qa',
      
      // Workflow commands
      '/workflow:status', '/w:s',
      '/deploy', '/release',
      '/pipeline', '/ci',
      '/environments', '/envs',
      
      // Sprint management
      '/sprint:plan', '/sp:plan',
      '/sprint:review', '/sp:review', 
      '/sprint:close', '/sp:close',
      
      // Issue operations
      '/issue:bulk', '/i:bulk',
      '/issue:dependencies', '/i:deps', '/i:dependencies',
      
      // Estimation
      '/estimate:bulk', '/est:bulk', '/est:b',
      '/estimate:sprint', '/est:sprint', '/est:s',
      
      // Planning commands
      '/breakdown',
      '/epic:breakdown', '/epic:break', '/epic:split',
      '/feature:plan', '/feature:planning', '/plan:feature',
      '/analyze:scope', '/scope:analyze', '/scope:analysis',
      
      // Extended thinking
      '/plan',
      '/investigate', 
      '/decide',
      '/research',
      '/alternatives'
    ];

    it('should execute all legacy commands without errors', async () => {
      const failedCommands = [];
      
      for (const command of legacyCommands) {
        try {
          await executor.execute(command);
        } catch (error) {
          failedCommands.push({ command, error: error.message });
        }
      }
      
      if (failedCommands.length > 0) {
        console.log('Failed commands:');
        failedCommands.forEach(({ command, error }) => {
          console.log(`  ${command}: ${error}`);
        });
      }
      
      expect(failedCommands).toHaveLength(0);
    });

    it('should handle all legacy command aliases', async () => {
      const aliasTests = [
        ['/s', '/status'],
        ['/a', '/add'], 
        ['/c', '/commit'],
        ['/p', '/push'],
        ['/b', '/build'],
        ['/t', '/test'],
        ['/l', '/lint'],
        ['/i', '/issues'],
        ['/m', '/milestones'],
        ['/deps', '/dependencies'],
        ['/qa', '/quality'],
        ['/w:s', '/workflow:status'],
        ['/ci', '/pipeline'],
        ['/envs', '/environments']
      ];

      for (const [alias, fullCommand] of aliasTests) {
        // Both should execute without throwing
        await expect(executor.execute(alias)).resolves.not.toThrow();
        await expect(executor.execute(fullCommand)).resolves.not.toThrow();
      }
    });
  });

  describe('Argument Parsing Regression', () => {
    it('should parse arguments identically to legacy system', () => {
      const testCases = [
        {
          input: '/test --flag --option value',
          expected: { name: '/test', args: [], options: { flag: true, option: 'value' } }
        },
        {
          input: '/build arg1 arg2 --watch',
          expected: { name: '/build', args: ['arg1', 'arg2'], options: { watch: true } }
        },
        {
          input: '/commit "message with spaces" --no-verify',
          expected: { name: '/commit', args: ['message with spaces'], options: { 'no-verify': true } }
        },
        {
          input: '"/status --porcelain"',
          expected: { name: '/status', args: [], options: { porcelain: true } }
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const parsed = executor.parseCommand(input);
        expect(parsed.name).toBe(expected.name);
        expect(parsed.args).toEqual(expected.args);
        expect(parsed.options).toEqual(expected.options);
      });
    });

    it('should handle edge cases in argument parsing', () => {
      const edgeCases = [
        '',                           // Empty string
        '   ',                       // Whitespace only
        '/test',                     // Command only
        'test',                      // Missing leading slash
        '/test --',                  // Double dash
        '/test --flag=""',           // Empty value
        '/test "unclosed quote',     // Unclosed quote
        '/test --flag "value with \\"quotes\\""'  // Escaped quotes
      ];

      edgeCases.forEach(input => {
        expect(() => executor.parseCommand(input)).not.toThrow();
      });
    });
  });

  describe('Error Handling Regression', () => {
    it('should handle unknown commands like legacy system', async () => {
      await executor.execute('/nonexistent-command-12345');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown command: /nonexistent-command-12345')
      );
    });

    it('should provide suggestions for typos', async () => {
      const typoTests = [
        '/hel',      // Should suggest /help
        '/stat',     // Should suggest /status  
        '/buil',     // Should suggest /build
        '/tes',      // Should suggest /test
        '/commi'     // Should suggest /commit
      ];

      for (const typo of typoTests) {
        mockConsole.log.mockClear();
        await executor.execute(typo);
        
        expect(mockConsole.log).toHaveBeenCalledWith(
          expect.stringContaining('Did you mean:')
        );
      }
    });

    it('should maintain consistent error message format', async () => {
      await executor.execute('/xyz123');
      
      const errorCall = mockConsole.error.mock.calls.find(call => 
        call[0].includes('Unknown command:')
      );
      
      expect(errorCall).toBeDefined();
      expect(errorCall[0]).toMatch(/^Unknown command: \/xyz123/);
    });
  });

  describe('Output Format Regression', () => {
    it('should maintain consistent help output format', async () => {
      await executor.execute('/help');
      
      // Should show Flow State Dev header
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Flow State Dev - Slash Commands')
      );
      
      // Should show command categories
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Available Commands:')
      );
    });

    it('should show command categories in help', async () => {
      await executor.execute('/help');
      
      const expectedCategories = [
        'Quick Action Commands',
        'Project Management', 
        'Analysis & Planning',
        'Extended Thinking',
        'Utility Commands'
      ];

      expectedCategories.forEach(category => {
        expect(mockConsole.log).toHaveBeenCalledWith(
          expect.stringContaining(category)
        );
      });
    });
  });

  describe('Command Execution Behavior', () => {
    it('should maintain execution order and timing', async () => {
      const executionOrder = [];
      const originalLog = console.log;
      
      // Override console.log to track execution
      mockConsole.log.mockImplementation((...args) => {
        executionOrder.push(args.join(' '));
        originalLog(...args);
      });

      await executor.execute('/help');
      
      // Should start with header
      expect(executionOrder[0]).toContain('Flow State Dev - Slash Commands');
      
      // Should not have any execution errors in the flow
      const errorMessages = executionOrder.filter(msg => 
        msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed')
      );
      expect(errorMessages).toHaveLength(0);
    });

    it('should handle rapid successive command execution', async () => {
      const commands = ['/help', '/status', '/help', '/status'];
      const results = [];
      
      for (const command of commands) {
        try {
          await executor.execute(command);
          results.push('success');
        } catch (error) {
          results.push('error');
        }
      }
      
      expect(results).toEqual(['success', 'success', 'success', 'success']);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not leak memory during repeated execution', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Execute commands multiple times
      for (let i = 0; i < 50; i++) {
        await executor.execute('/help');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Should not increase memory by more than 5MB
      expect(memoryIncrease).toBeLessThan(5);
    });

    it('should clean up resources after command execution', async () => {
      const initialHandles = process._getActiveHandles ? process._getActiveHandles().length : 0;
      
      await executor.execute('/help');
      
      const finalHandles = process._getActiveHandles ? process._getActiveHandles().length : 0;
      
      // Should not leave hanging handles (within tolerance)
      expect(finalHandles - initialHandles).toBeLessThanOrEqual(2);
    });
  });
});