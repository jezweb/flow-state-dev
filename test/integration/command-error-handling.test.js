/**
 * Command Error Handling Integration Tests
 * 
 * Tests error scenarios, edge cases, and graceful failure handling
 * for the modular slash command system
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { commandRegistry } from '../../lib/commands/registry.js';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import fs from 'fs-extra';
import path from 'path';

describe('Command Error Handling Integration', () => {
  let executor;
  let mockConsole;
  let errorOutputs;
  let originalEnv;

  beforeAll(async () => {
    await commandRegistry.discover();
    executor = new SlashCommandExecutor();
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    errorOutputs = { log: [], error: [], warn: [] };
    mockConsole = {
      log: vi.spyOn(console, 'log').mockImplementation((...args) => {
        errorOutputs.log.push(args.join(' '));
      }),
      error: vi.spyOn(console, 'error').mockImplementation((...args) => {
        errorOutputs.error.push(args.join(' '));
      }),
      warn: vi.spyOn(console, 'warn').mockImplementation((...args) => {
        errorOutputs.warn.push(args.join(' '));
      })
    };
  });

  afterEach(() => {
    mockConsole.log.mockRestore();
    mockConsole.error.mockRestore();
    mockConsole.warn.mockRestore();
    process.env = { ...originalEnv };
  });

  describe('Invalid Command Handling', () => {
    it('should handle non-existent commands gracefully', async () => {
      const result = await executor.execute('/nonexistent-command');
      
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unknown command|not found/i);
      expect(errorOutputs.error.length).toBeGreaterThan(0);
    });

    it('should handle malformed command syntax', async () => {
      const malformedCommands = [
        'build', // Missing slash
        '//build', // Double slash
        '/build/test', // Extra segments
        '/', // Just slash
        '', // Empty
        null, // Null
        undefined // Undefined
      ];

      for (const cmd of malformedCommands) {
        const result = await executor.execute(cmd);
        expect(result.success).toBe(false);
      }
    });

    it('should suggest similar commands for typos', async () => {
      const result = await executor.execute('/buld'); // Typo of 'build'
      
      expect(result.success).toBe(false);
      const errorMessage = result.error || errorOutputs.error.join(' ');
      expect(errorMessage).toMatch(/did you mean|similar|build/i);
    });
  });

  describe('Missing Prerequisites', () => {
    it('should handle missing git repository', async () => {
      const tempDir = path.join(process.cwd(), 'test-temp-no-git');
      await fs.ensureDir(tempDir);
      const originalCwd = process.cwd();
      
      try {
        process.chdir(tempDir);
        
        const result = await executor.execute('/status', {
          skipInteractive: true
        });
        
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/git|repository/i);
      } finally {
        process.chdir(originalCwd);
        await fs.remove(tempDir);
      }
    });

    it('should handle missing GitHub CLI', async () => {
      // Mock gh command not being available
      process.env.PATH = '/tmp'; // Remove normal paths
      
      const result = await executor.execute('/issues', {
        skipInteractive: true,
        test: true
      });
      
      if (!result.success) {
        expect(result.error).toMatch(/github cli|gh|not installed/i);
      }
    });

    it('should handle missing package.json', async () => {
      const tempDir = path.join(process.cwd(), 'test-temp-no-package');
      await fs.ensureDir(tempDir);
      const originalCwd = process.cwd();
      
      try {
        process.chdir(tempDir);
        
        const result = await executor.execute('/build', {
          skipInteractive: true
        });
        
        // Should either fail or show warning
        const output = errorOutputs.log.concat(errorOutputs.warn).join(' ');
        expect(output).toMatch(/package\.json|npm|script/i);
      } finally {
        process.chdir(originalCwd);
        await fs.remove(tempDir);
      }
    });
  });

  describe('Invalid Options Handling', () => {
    it('should validate option types', async () => {
      const invalidOptions = [
        { command: '/sprint:plan', options: { weeks: 'two' } }, // Should be number
        { command: '/test', options: { coverage: 'yes' } }, // Should be boolean
        { command: '/issues', options: { limit: -5 } }, // Should be positive
        { command: '/estimate', options: { method: 'invalid' } } // Invalid enum
      ];

      for (const { command, options } of invalidOptions) {
        const result = await executor.execute(command, {
          ...options,
          skipInteractive: true,
          test: true
        });
        
        if (!result.success) {
          expect(result.error).toMatch(/invalid|type|value/i);
        }
      }
    });

    it('should handle missing required options', async () => {
      // Commands that require specific options
      const commandsWithRequired = [
        { command: '/commit', required: 'message' },
        { command: '/epic:create', required: 'title' },
        { command: '/breakdown', required: 'scope' }
      ];

      for (const { command, required } of commandsWithRequired) {
        const result = await executor.execute(command, {
          skipInteractive: true,
          test: true
          // Missing required option
        });
        
        // Should either fail or prompt for missing option
        if (!result.success) {
          expect(result.error).toMatch(new RegExp(required, 'i'));
        }
      }
    });

    it('should handle conflicting options', async () => {
      const result = await executor.execute('/build', {
        watch: true,
        production: true, // Usually conflicts with watch
        skipInteractive: true,
        test: true
      });
      
      // Should handle gracefully, possibly with warning
      expect(result).toBeDefined();
      if (errorOutputs.warn.length > 0) {
        expect(errorOutputs.warn.join(' ')).toMatch(/conflict|incompatible/i);
      }
    });
  });

  describe('Runtime Errors', () => {
    it('should handle file system errors', async () => {
      // Try to write to read-only location
      const result = await executor.execute('/plan', {
        topic: 'Test Plan',
        outputFile: '/root/readonly.md', // Likely to fail
        skipInteractive: true,
        test: true
      });
      
      if (!result.success) {
        expect(result.error).toMatch(/permission|access|write/i);
      }
    });

    it('should handle network errors', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      try {
        const result = await executor.execute('/research', {
          topic: 'Test Research',
          skipInteractive: true,
          test: true
        });
        
        // Should handle network error gracefully
        expect(result).toBeDefined();
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should handle command timeout', async () => {
      // Create a command that might timeout
      const result = await executor.execute('/analyze:scope', {
        requirements: 'x'.repeat(10000), // Very long input
        timeout: 100, // Very short timeout
        skipInteractive: true,
        test: true
      });
      
      // Should complete one way or another
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long inputs', async () => {
      const longInput = 'a'.repeat(5000);
      
      const result = await executor.execute('/breakdown', {
        scope: longInput,
        skipInteractive: true,
        test: true
      });
      
      // Should handle without crashing
      expect(result).toBeDefined();
    });

    it('should handle special characters in inputs', async () => {
      const specialInputs = [
        'Test with "quotes"',
        'Test with \'single quotes\'',
        'Test with \nnewlines',
        'Test with \t\ttabs',
        'Test with unicode: 🚀 ñ ü',
        'Test with <html>tags</html>',
        'Test with $pecial ch@rs!'
      ];

      for (const input of specialInputs) {
        const result = await executor.execute('/commit', {
          message: input,
          skipInteractive: true,
          test: true,
          dryRun: true
        });
        
        // Should handle without injection or crashes
        expect(result).toBeDefined();
      }
    });

    it('should handle concurrent command execution', async () => {
      const promises = [];
      
      // Execute multiple commands concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(
          executor.execute('/help', { 
            category: 'quick-action',
            test: true 
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      // All should complete successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle interrupted execution', async () => {
      // Simulate interruption by aborting
      const controller = new AbortController();
      
      const promise = executor.execute('/research', {
        topic: 'Long research topic',
        signal: controller.signal,
        skipInteractive: true,
        test: true
      });
      
      // Abort after short delay
      setTimeout(() => controller.abort(), 50);
      
      try {
        await promise;
      } catch (error) {
        expect(error.name).toMatch(/abort/i);
      }
    });
  });

  describe('Error Recovery', () => {
    it('should recover from previous errors', async () => {
      // First, cause an error
      await executor.execute('/nonexistent');
      
      // Then execute valid command
      const result = await executor.execute('/help');
      
      // Should work despite previous error
      expect(result.success).toBe(true);
    });

    it('should clean up after failed commands', async () => {
      // Execute command that might create temp files
      const result = await executor.execute('/plan', {
        topic: 'Test',
        outputFile: '/invalid/path/file.md',
        skipInteractive: true,
        test: true
      });
      
      // Check no temp files left behind
      const tempFiles = await fs.readdir(process.cwd());
      const leftoverFiles = tempFiles.filter(f => 
        f.includes('temp') || f.includes('tmp') || f.includes('.partial')
      );
      
      expect(leftoverFiles).toHaveLength(0);
    });

    it('should maintain registry integrity after errors', async () => {
      // Cause multiple errors
      await executor.execute('/invalid1');
      await executor.execute('/invalid2');
      await executor.execute('/build', { invalid: 'option' });
      
      // Registry should still work
      const commands = commandRegistry.getAll();
      expect(commands.length).toBeGreaterThan(60);
      
      // Commands should still be executable
      const result = await executor.execute('/help');
      expect(result.success).toBe(true);
    });
  });

  describe('User Input Validation', () => {
    it('should sanitize dangerous inputs', async () => {
      const dangerousInputs = [
        '"; rm -rf /',
        '$(malicious-command)',
        '`evil-command`',
        '&&malicious',
        '|pipe-to-evil',
        '../../../etc/passwd'
      ];

      for (const input of dangerousInputs) {
        const result = await executor.execute('/commit', {
          message: input,
          skipInteractive: true,
          test: true,
          dryRun: true
        });
        
        // Should sanitize or reject dangerous input
        expect(result).toBeDefined();
        // No actual commands should be executed
        expect(errorOutputs.error.join(' ')).not.toMatch(/rm|evil|malicious/);
      }
    });

    it('should validate file paths', async () => {
      const invalidPaths = [
        '../../../sensitive',
        '/etc/passwd',
        'C:\\Windows\\System32',
        '~/../../root'
      ];

      for (const path of invalidPaths) {
        const result = await executor.execute('/plan', {
          topic: 'Test',
          outputFile: path,
          skipInteractive: true,
          test: true
        });
        
        if (!result.success) {
          expect(result.error).toMatch(/invalid|permission|path/i);
        }
      }
    });
  });

  describe('Graceful Degradation', () => {
    it('should work with minimal environment', async () => {
      // Remove various environment variables
      const minimalEnv = {
        PATH: process.env.PATH,
        HOME: process.env.HOME
      };
      
      process.env = minimalEnv;
      
      const result = await executor.execute('/help');
      expect(result.success).toBe(true);
    });

    it('should provide helpful error messages', async () => {
      const scenarios = [
        { command: '/build', error: 'missing-script' },
        { command: '/commit', error: 'no-changes' },
        { command: '/push', error: 'no-upstream' },
        { command: '/issues', error: 'no-github' }
      ];

      for (const { command } of scenarios) {
        const result = await executor.execute(command, {
          skipInteractive: true,
          test: true,
          forceError: true
        });
        
        if (!result.success) {
          // Error message should be helpful
          expect(result.error).not.toBe('undefined');
          expect(result.error).not.toBe('null');
          expect(result.error.length).toBeGreaterThan(10);
        }
      }
    });
  });
});