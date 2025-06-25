/**
 * Infrastructure Tests for Slash Commands System
 * Tests core infrastructure components and performance benchmarks
 */
import { jest } from '@jest/globals';
import { performance } from 'perf_hooks';
import fs from 'fs-extra';
import path from 'path';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import { commandRegistry } from '../../lib/commands/registry.js';
import { BaseSlashCommand } from '../../lib/commands/base.js';

// Set test environment
process.env.NODE_ENV = 'test';

describe('Slash Commands Infrastructure', () => {
  let executor;
  const performanceResults = {};

  beforeAll(() => {
    // Initialize executor for performance tests
    executor = new SlashCommandExecutor();
  });

  afterAll(() => {
    // Output performance results
    console.log('\n📊 Performance Benchmark Results:');
    Object.entries(performanceResults).forEach(([metric, value]) => {
      const target = getPerformanceTarget(metric);
      const status = value <= target ? '✅' : '❌';
      console.log(`  ${status} ${metric}: ${value.toFixed(2)}ms (target: ${target}ms)`);
    });
  });

  describe('Command Discovery Performance', () => {
    it('should discover all commands within 50ms', async () => {
      const start = performance.now();
      await commandRegistry.discover();
      const duration = performance.now() - start;
      
      performanceResults['Command Discovery'] = duration;
      expect(duration).toBeLessThan(50);
    });

    it('should cache discovery results for fast subsequent calls', async () => {
      // First call (already cached from previous test)
      const start = performance.now();
      await commandRegistry.discover();
      const duration = performance.now() - start;
      
      performanceResults['Cached Discovery'] = duration;
      expect(duration).toBeLessThan(5); // Should be nearly instant when cached
    });
  });

  describe('Command Registry Performance', () => {
    beforeAll(async () => {
      await commandRegistry.discover();
    });

    it('should retrieve commands within 1ms', () => {
      const commands = ['/help', '/status', '/build', '/test', '/commit'];
      
      for (const commandName of commands) {
        const start = performance.now();
        const command = commandRegistry.get(commandName);
        const duration = performance.now() - start;
        
        expect(command).toBeTruthy();
        expect(duration).toBeLessThan(1);
      }
    });

    it('should generate suggestions within 5ms', () => {
      const testCases = [
        '/hel',     // Should suggest /help
        '/stat',    // Should suggest /status
        '/buil',    // Should suggest /build
        '/tes',     // Should suggest /test
        '/commi'    // Should suggest /commit
      ];

      for (const partial of testCases) {
        const start = performance.now();
        const suggestions = commandRegistry.getSuggestions(partial);
        const duration = performance.now() - start;
        
        expect(suggestions.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(5);
      }
    });
  });

  describe('Command Execution Performance', () => {
    let mockConsole;

    beforeEach(() => {
      // Mock console to prevent output during performance tests
      mockConsole = {
        log: jest.spyOn(console, 'log').mockImplementation(),
        error: jest.spyOn(console, 'error').mockImplementation(),
        warn: jest.spyOn(console, 'warn').mockImplementation()
      };
    });

    afterEach(() => {
      Object.values(mockConsole).forEach(spy => spy.mockRestore());
    });

    it('should execute help command within 100ms (first execution)', async () => {
      const start = performance.now();
      try {
        await executor.execute('/help');
      } catch (error) {
        // Ignore process.exit calls in tests
        if (!error.message.includes('process.exit')) {
          throw error;
        }
      }
      const duration = performance.now() - start;
      
      performanceResults['First Execution'] = duration;
      expect(duration).toBeLessThan(100);
    });

    it('should execute commands within 20ms (warm execution)', async () => {
      // Warm up
      try {
        await executor.execute('/help');
      } catch (error) {
        // Ignore process.exit in tests
      }
      
      const commands = ['/help', '/status', '/build'];
      let totalDuration = 0;
      
      for (const command of commands) {
        const start = performance.now();
        try {
          await executor.execute(command);
        } catch (error) {
          // Ignore process.exit in tests
        }
        const duration = performance.now() - start;
        totalDuration += duration;
      }
      
      const avgDuration = totalDuration / commands.length;
      performanceResults['Warm Execution'] = avgDuration;
      expect(avgDuration).toBeLessThan(20);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory overhead', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Load and execute multiple commands
      await commandRegistry.discover();
      try {
        await executor.execute('/help');
        await executor.execute('/status');
        await executor.execute('/build');
      } catch (error) {
        // Ignore process.exit in tests
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const overhead = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB
      
      performanceResults['Memory Overhead'] = overhead;
      expect(overhead).toBeLessThan(10); // Less than 10MB overhead
    });
  });

  describe('Command Structure Validation', () => {
    let allCommands;

    beforeAll(async () => {
      await commandRegistry.discover();
      allCommands = commandRegistry.getAll();
    });

    it('should have discovered all 67 expected commands', () => {
      expect(allCommands.length).toBeGreaterThanOrEqual(67);
    });

    it('should have all commands extend BaseSlashCommand', () => {
      allCommands.forEach(command => {
        expect(command).toBeInstanceOf(BaseSlashCommand);
      });
    });

    it('should have all commands with required properties', () => {
      allCommands.forEach(command => {
        expect(command.name).toBeDefined();
        expect(command.description).toBeDefined();
        expect(typeof command.execute).toBe('function');
      });
    });

    it('should have consistent command categories', () => {
      const categories = new Set();
      allCommands.forEach(command => {
        if (command.category) {
          categories.add(command.category);
        }
      });

      const expectedCategories = [
        'utility', 'quick-action', 'project', 'analysis', 
        'workflow', 'sprint', 'issue', 'estimation', 
        'planning', 'thinking'
      ];

      expectedCategories.forEach(category => {
        expect(categories.has(category)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    let mockConsole;

    beforeEach(() => {
      mockConsole = {
        log: jest.spyOn(console, 'log').mockImplementation(),
        error: jest.spyOn(console, 'error').mockImplementation()
      };
    });

    afterEach(() => {
      Object.values(mockConsole).forEach(spy => spy.mockRestore());
    });

    it('should handle unknown commands gracefully', async () => {
      await executor.execute('/nonexistent-command');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Unknown command: /nonexistent-command')
      );
    });

    it('should provide suggestions for typos', async () => {
      await executor.execute('/hel'); // Typo for /help
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Did you mean:')
      );
    });

    it('should handle malformed command strings', async () => {
      const malformedCommands = [
        '',           // Empty command
        '   ',        // Whitespace only
        '//',         // Double slash
        '/test "unclosed quote'  // Unclosed quote
      ];

      for (const command of malformedCommands) {
        await expect(executor.execute(command)).resolves.not.toThrow();
      }
    });
  });

  describe('File System Structure', () => {
    const commandsDir = path.join(process.cwd(), 'lib', 'commands');

    it('should have organized command files by category', async () => {
      const categories = await fs.readdir(commandsDir);
      const expectedDirs = [
        'analysis', 'epic', 'estimation', 'extended-thinking', 
        'issue', 'planning', 'progress', 'project', 'quick-action',
        'sprint', 'thinking', 'utility', 'workflow'
      ];

      expectedDirs.forEach(dir => {
        expect(categories).toContain(dir);
      });
    });

    it('should have all command files follow naming convention', async () => {
      const checkDirectory = async (dirPath) => {
        const items = await fs.readdir(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = await fs.stat(itemPath);
          
          if (stats.isDirectory()) {
            await checkDirectory(itemPath);
          } else if (item.endsWith('.js') && !['base.js', 'executor.js', 'registry.js'].includes(item)) {
            // Command files should use kebab-case
            expect(item).toMatch(/^[a-z-]+\.js$/);
          }
        }
      };

      await checkDirectory(commandsDir);
    });
  });

  describe('Command Loading', () => {
    it('should load all commands without syntax errors', async () => {
      const commandsDir = path.join(process.cwd(), 'lib', 'commands');
      
      const loadDirectory = async (dirPath) => {
        const items = await fs.readdir(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = await fs.stat(itemPath);
          
          if (stats.isDirectory()) {
            await loadDirectory(itemPath);
          } else if (item.endsWith('.js') && !['base.js', 'executor.js', 'registry.js'].includes(item)) {
            // Attempt to import each command file
            const relativePath = path.relative(process.cwd(), itemPath);
            await expect(import(`./${relativePath}`)).resolves.toBeDefined();
          }
        }
      };

      await loadDirectory(commandsDir);
    });
  });
});

/**
 * Get performance target for a given metric
 */
function getPerformanceTarget(metric) {
  const targets = {
    'Command Discovery': 50,
    'Cached Discovery': 5,
    'First Execution': 100,
    'Warm Execution': 20,
    'Memory Overhead': 10
  };
  
  return targets[metric] || 100;
}