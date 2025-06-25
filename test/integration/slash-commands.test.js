/**
 * Comprehensive Integration Tests for Modular Slash Commands
 * 
 * This test suite ensures all migrated slash commands work correctly
 * in the new modular architecture with no regression from v1.x
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { commandRegistry } from '../../lib/commands/registry.js';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Slash Commands Integration Tests', () => {
  let executor;
  let originalCwd;
  let testProjectDir;
  let mockConsole;
  
  // Performance tracking
  const performanceMetrics = {
    commandDiscovery: 0,
    registryInit: 0,
    firstExecution: 0,
    commandExecutions: {}
  };

  beforeAll(async () => {
    // Track command discovery time
    const discoveryStart = performance.now();
    await commandRegistry.discover();
    performanceMetrics.commandDiscovery = performance.now() - discoveryStart;
    
    // Track registry initialization
    const registryStart = performance.now();
    executor = new SlashCommandExecutor();
    performanceMetrics.registryInit = performance.now() - registryStart;
    
    // Create test project directory
    originalCwd = process.cwd();
    testProjectDir = path.join(__dirname, '..', 'temp', 'slash-commands-test');
    await fs.ensureDir(testProjectDir);
    
    // Initialize git repo for git-related commands
    process.chdir(testProjectDir);
    execSync('git init', { stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { stdio: 'ignore' });
    execSync('git config user.name "Test User"', { stdio: 'ignore' });
    
    // Create basic project structure
    await fs.writeJSON('package.json', {
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        build: 'echo "Building..."',
        test: 'echo "Testing..."',
        lint: 'echo "Linting..."',
        typecheck: 'echo "Type checking..."'
      }
    });
    
    // Mock console methods
    mockConsole = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {})
    };
  });

  afterAll(async () => {
    // Restore console
    mockConsole.log.mockRestore();
    mockConsole.error.mockRestore();
    mockConsole.warn.mockRestore();
    
    // Cleanup
    process.chdir(originalCwd);
    await fs.remove(path.join(__dirname, '..', 'temp'));
    
    // Output performance report
    console.log('\n📊 Performance Metrics:');
    console.log(`  Command Discovery: ${performanceMetrics.commandDiscovery.toFixed(2)}ms`);
    console.log(`  Registry Init: ${performanceMetrics.registryInit.toFixed(2)}ms`);
    console.log(`  First Execution: ${performanceMetrics.firstExecution.toFixed(2)}ms`);
    
    if (Object.keys(performanceMetrics.commandExecutions).length > 0) {
      console.log('\n  Average Execution Times by Category:');
      const categoryTimes = {};
      Object.entries(performanceMetrics.commandExecutions).forEach(([command, time]) => {
        const category = commandRegistry.get(command)?.category || 'unknown';
        if (!categoryTimes[category]) categoryTimes[category] = [];
        categoryTimes[category].push(time);
      });
      
      Object.entries(categoryTimes).forEach(([category, times]) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`    ${category}: ${avg.toFixed(2)}ms`);
      });
    }
  });

  beforeEach(() => {
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
    mockConsole.warn.mockClear();
  });

  describe('Command Discovery Tests', () => {
    it('should discover all commands', () => {
      const commands = commandRegistry.getAll();
      expect(commands.length).toBeGreaterThan(60); // We have 67+ commands
    });

    it('should auto-discover commands from filesystem', () => {
      const commandsDir = path.join(process.cwd(), 'lib', 'commands');
      const categories = fs.readdirSync(commandsDir)
        .filter(item => fs.statSync(path.join(commandsDir, item)).isDirectory());
      
      expect(categories.length).toBeGreaterThan(5); // We have 10 categories
    });

    it('should populate command registry correctly', () => {
      const buildCommand = commandRegistry.get('build');
      expect(buildCommand).toBeDefined();
      expect(buildCommand.name).toBe('build');
      expect(buildCommand.category).toBe('quick-action');
      expect(buildCommand.aliases).toContain('b');
    });

    it('should resolve aliases correctly', () => {
      const buildByAlias = commandRegistry.get('b');
      const buildByName = commandRegistry.get('build');
      expect(buildByAlias).toBe(buildByName);
    });

    it('should group commands by category', () => {
      const categories = commandRegistry.getCategories();
      expect(categories).toContain('quick-action');
      expect(categories).toContain('extended-thinking');
      expect(categories).toContain('sprint');
      expect(categories).toContain('epic');
      expect(categories.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Command Execution Tests', () => {
    describe('Quick Action Commands', () => {
      it('should execute /build command', async () => {
        const start = performance.now();
        const result = await executor.execute('/build');
        const duration = performance.now() - start;
        
        if (!performanceMetrics.firstExecution) {
          performanceMetrics.firstExecution = duration;
        }
        performanceMetrics.commandExecutions.build = duration;
        
        expect(result.success).toBe(true);
        expect(mockConsole.log).toHaveBeenCalled();
      });

      it('should execute /test command with options', async () => {
        const result = await executor.execute('/test', { coverage: true });
        expect(result.success).toBe(true);
      });

      it('should execute /lint command with fix option', async () => {
        const result = await executor.execute('/lint', { fix: true });
        expect(result.success).toBe(true);
      });

      it('should execute /status command', async () => {
        // Create a test file for git status
        await fs.writeFile('test.txt', 'test content');
        
        const result = await executor.execute('/status');
        expect(result.success).toBe(true);
      });

      it('should handle command aliases', async () => {
        const result = await executor.execute('/b'); // alias for build
        expect(result.success).toBe(true);
      });
    });

    describe('Extended Thinking Commands', () => {
      it('should execute /plan command', async () => {
        const result = await executor.execute('/plan', { 
          topic: 'Test architecture',
          skipInteractive: true 
        });
        performanceMetrics.commandExecutions.plan = result.duration || 0;
        expect(result.success).toBe(true);
      });

      it('should execute /research command', async () => {
        const result = await executor.execute('/research', { 
          topic: 'Testing strategies',
          skipInteractive: true 
        });
        expect(result.success).toBe(true);
      });

      it('should show extended thinking format', async () => {
        const result = await executor.execute('/decide', { 
          decision: 'Testing framework: Jest vs Vitest',
          skipInteractive: true 
        });
        expect(result.success).toBe(true);
        // Check if extended thinking markers are present
        const output = mockConsole.log.mock.calls.join('\n');
        expect(output).toContain('<extended-thinking>');
      });
    });

    describe('Sprint Management Commands', () => {
      it('should execute /sprint:plan command', async () => {
        const result = await executor.execute('/sprint:plan', {
          weeks: 2,
          capacity: 40,
          skipInteractive: true
        });
        expect(result.success).toBe(true);
      });

      it('should execute /sprint:review command', async () => {
        const result = await executor.execute('/sprint:review', {
          milestone: 'Sprint 1',
          skipInteractive: true
        });
        expect(result.success).toBe(true);
      });
    });

    describe('Epic Management Commands', () => {
      it('should execute /epic:create command', async () => {
        const result = await executor.execute('/epic:create', {
          title: 'Test Epic',
          description: 'Epic for testing',
          skipInteractive: true
        });
        expect(result.success).toBe(true);
      });

      it('should execute /epic:breakdown command', async () => {
        const result = await executor.execute('/epic:breakdown', {
          epic: 'Test feature implementation',
          skipInteractive: true
        });
        expect(result.success).toBe(true);
      });
    });

    describe('Analysis & Planning Commands', () => {
      it('should execute /breakdown command', async () => {
        const result = await executor.execute('/breakdown', {
          scope: 'User authentication system',
          skipInteractive: true
        });
        expect(result.success).toBe(true);
      });

      it('should execute /analyze:scope command', async () => {
        const result = await executor.execute('/analyze:scope', {
          requirements: 'API rate limiting',
          skipInteractive: true
        });
        expect(result.success).toBe(true);
      });
    });

    describe('Utility Commands', () => {
      it('should execute /help command', async () => {
        const result = await executor.execute('/help');
        expect(result.success).toBe(true);
        const output = mockConsole.log.mock.calls.join('\n');
        expect(output).toContain('Available Commands');
      });

      it('should show category-specific help', async () => {
        const result = await executor.execute('/help', { category: 'quick-action' });
        expect(result.success).toBe(true);
        const output = mockConsole.log.mock.calls.join('\n');
        expect(output).toContain('Quick Action Commands');
      });
    });
  });

  describe('Cross-Command Integration Tests', () => {
    it('should handle commands that depend on git', async () => {
      // Create and stage a file
      await fs.writeFile('feature.js', 'console.log("feature");');
      execSync('git add feature.js', { stdio: 'ignore' });
      
      const statusResult = await executor.execute('/status');
      expect(statusResult.success).toBe(true);
      
      const commitResult = await executor.execute('/commit', {
        message: 'test: Add feature',
        skipInteractive: true
      });
      expect(commitResult.success).toBe(true);
    });

    it('should handle commands that use GitHub CLI', async () => {
      // Mock gh command availability
      const ghAvailable = commandRegistry.get('issues')?.checkPrerequisites?.() ?? false;
      
      if (ghAvailable) {
        const result = await executor.execute('/issues', { skipInteractive: true });
        expect(result.success).toBe(true);
      } else {
        // Test that it fails gracefully
        const result = await executor.execute('/issues', { skipInteractive: true });
        expect(result.success).toBe(false);
        expect(result.error).toContain('GitHub CLI');
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid command names', async () => {
      const result = await executor.execute('/nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown command');
    });

    it('should handle missing required options', async () => {
      // Most commands should handle missing options gracefully
      const result = await executor.execute('/estimate');
      // Should either prompt or show help
      expect(result).toBeDefined();
    });

    it('should handle execution errors gracefully', async () => {
      // Test with a command that might fail
      const result = await executor.execute('/test', { 
        file: 'nonexistent.test.js',
        skipInteractive: true 
      });
      // Should handle error without crashing
      expect(result).toBeDefined();
    });

    it('should validate command options', async () => {
      const result = await executor.execute('/sprint:plan', {
        weeks: -1, // Invalid value
        skipInteractive: true
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should discover commands quickly', () => {
      expect(performanceMetrics.commandDiscovery).toBeLessThan(100); // < 100ms
    });

    it('should initialize registry quickly', () => {
      expect(performanceMetrics.registryInit).toBeLessThan(50); // < 50ms
    });

    it('should execute first command quickly', () => {
      expect(performanceMetrics.firstExecution).toBeLessThan(200); // < 200ms
    });

    it('should maintain consistent performance across executions', async () => {
      const times = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        await executor.execute('/help');
        times.push(performance.now() - start);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);
      
      expect(stdDev).toBeLessThan(avgTime * 0.5); // Low variance
    });

    it('should not leak memory with repeated executions', async () => {
      if (!global.gc) {
        console.warn('Skipping memory test - run with --expose-gc flag');
        return;
      }
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Execute many commands
      for (let i = 0; i < 50; i++) {
        await executor.execute('/help');
      }
      
      global.gc();
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not increase by more than 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Command Category Coverage', () => {
    const categories = [
      'quick-action',
      'extended-thinking', 
      'sprint',
      'epic',
      'progress',
      'issue',
      'estimation',
      'workflow',
      'analysis',
      'utility'
    ];

    categories.forEach(category => {
      it(`should have commands in ${category} category`, () => {
        const commands = commandRegistry.getByCategory(category);
        expect(commands.length).toBeGreaterThan(0);
      });

      it(`should execute at least one command from ${category} category`, async () => {
        const commands = commandRegistry.getByCategory(category);
        const command = commands[0];
        
        if (command) {
          const result = await executor.execute(`/${command.name}`, {
            skipInteractive: true,
            test: true
          });
          expect(result).toBeDefined();
        }
      });
    });
  });
});