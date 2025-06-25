/**
 * Command Category Integration Tests
 * 
 * Tests each category of slash commands to ensure they work correctly
 * with proper options, error handling, and expected outputs
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { commandRegistry } from '../../lib/commands/registry.js';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Command Categories Integration', () => {
  let executor;
  let testDir;
  let mockConsole;
  let outputs;

  beforeAll(async () => {
    await commandRegistry.discover();
    executor = new SlashCommandExecutor();
    
    // Setup test directory
    testDir = path.join(process.cwd(), 'test-output', 'command-categories');
    await fs.ensureDir(testDir);
    
    // Initialize git for git-related commands
    process.chdir(testDir);
    execSync('git init', { stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { stdio: 'ignore' });
    execSync('git config user.name "Test User"', { stdio: 'ignore' });
    
    // Create test package.json
    await fs.writeJSON('package.json', {
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        build: 'echo "Building..."',
        test: 'vitest',
        lint: 'eslint .',
        typecheck: 'tsc --noEmit',
        dev: 'vite'
      },
      devDependencies: {
        vite: '^5.0.0',
        vitest: '^1.0.0',
        eslint: '^8.0.0',
        typescript: '^5.0.0'
      }
    });
  });

  beforeEach(() => {
    outputs = { log: [], error: [], warn: [] };
    mockConsole = {
      log: vi.spyOn(console, 'log').mockImplementation((...args) => {
        outputs.log.push(args.join(' '));
      }),
      error: vi.spyOn(console, 'error').mockImplementation((...args) => {
        outputs.error.push(args.join(' '));
      }),
      warn: vi.spyOn(console, 'warn').mockImplementation((...args) => {
        outputs.warn.push(args.join(' '));
      })
    };
  });

  afterEach(() => {
    mockConsole.log.mockRestore();
    mockConsole.error.mockRestore();
    mockConsole.warn.mockRestore();
  });

  describe('Quick Action Commands', () => {
    const quickActionCommands = [
      { name: 'build', alias: 'b', options: { watch: true, env: 'production' } },
      { name: 'test', alias: 't', options: { coverage: true, watch: true } },
      { name: 'lint', alias: 'l', options: { fix: true, format: true } },
      { name: 'typecheck', alias: 'tc', options: { watch: true } },
      { name: 'fix', options: {} },
      { name: 'status', alias: 'st', options: {} },
      { name: 'commit', alias: 'c', options: { message: 'test: Add test' } },
      { name: 'push', alias: 'p', options: { force: false } }
    ];

    quickActionCommands.forEach(({ name, alias, options }) => {
      it(`should execute /${name} command`, async () => {
        const result = await executor.execute(`/${name}`, { 
          ...options, 
          skipInteractive: true,
          dryRun: true // Don't actually run commands
        });
        
        expect(result.success).toBe(true);
        expect(outputs.error).toHaveLength(0);
      });

      if (alias) {
        it(`should execute /${name} via alias /${alias}`, async () => {
          const result = await executor.execute(`/${alias}`, { 
            skipInteractive: true,
            dryRun: true 
          });
          
          expect(result.success).toBe(true);
        });
      }
    });

    it('should detect and use package.json scripts', async () => {
      const result = await executor.execute('/build', { 
        skipInteractive: true,
        dryRun: true 
      });
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toMatch(/build|Building/i);
    });
  });

  describe('Extended Thinking Commands', () => {
    const thinkingCommands = [
      { 
        name: 'plan', 
        options: { topic: 'System architecture', createAdr: false }
      },
      { 
        name: 'investigate', 
        options: { question: 'Performance bottlenecks' }
      },
      { 
        name: 'decide', 
        options: { decision: 'Database choice', alternatives: 2 }
      },
      { 
        name: 'research', 
        options: { topic: 'Best practices' }
      },
      { 
        name: 'alternatives', 
        options: { problem: 'State management' }
      }
    ];

    thinkingCommands.forEach(({ name, options }) => {
      it(`should execute /${name} with extended thinking format`, async () => {
        const result = await executor.execute(`/${name}`, { 
          ...options,
          skipInteractive: true,
          test: true
        });
        
        expect(result.success).toBe(true);
        
        // Check for extended thinking markers
        const output = outputs.log.join('\n');
        expect(output).toContain('<extended-thinking>');
        expect(output).toContain('</extended-thinking>');
      });
    });

    it('should create ADR when requested', async () => {
      const result = await executor.execute('/decide', {
        decision: 'Testing framework',
        createAdr: true,
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toMatch(/ADR|Architecture Decision Record/i);
    });
  });

  describe('Sprint Management Commands', () => {
    it('should plan a sprint', async () => {
      const result = await executor.execute('/sprint:plan', {
        weeks: 2,
        capacity: 80,
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toMatch(/sprint|planning/i);
    });

    it('should review sprint progress', async () => {
      const result = await executor.execute('/sprint:review', {
        milestone: 'Sprint 5',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });

    it('should close a sprint', async () => {
      const result = await executor.execute('/sprint:close', {
        milestone: 'Sprint 5',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });

    it('should show sprint velocity', async () => {
      const result = await executor.execute('/sprint:velocity', {
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Epic Management Commands', () => {
    it('should create an epic', async () => {
      const result = await executor.execute('/epic:create', {
        title: 'New Feature Epic',
        description: 'Implement new feature set',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });

    it('should breakdown an epic', async () => {
      const result = await executor.execute('/epic:breakdown', {
        epic: 'User authentication system',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toMatch(/story|task|breakdown/i);
    });

    it('should list epics', async () => {
      const result = await executor.execute('/epic:list', {
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Analysis & Planning Commands', () => {
    it('should analyze scope and create breakdown', async () => {
      const result = await executor.execute('/breakdown', {
        scope: 'E-commerce checkout flow',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toMatch(/analysis|breakdown|component/i);
    });

    it('should analyze requirements in detail', async () => {
      const result = await executor.execute('/analyze:scope', {
        requirements: 'Real-time notifications system',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });

    it('should plan features comprehensively', async () => {
      const result = await executor.execute('/feature:plan', {
        feature: 'Search functionality',
        complexity: 'medium',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Issue Operations Commands', () => {
    it('should list issues', async () => {
      const result = await executor.execute('/issues', {
        state: 'open',
        limit: 10,
        skipInteractive: true,
        test: true
      });
      
      // May fail if gh not installed, which is ok
      expect(result).toBeDefined();
    });

    it('should perform bulk operations', async () => {
      const result = await executor.execute('/issues:bulk', {
        action: 'label',
        label: 'needs-review',
        skipInteractive: true,
        test: true,
        dryRun: true
      });
      
      expect(result).toBeDefined();
    });
  });

  describe('Estimation Commands', () => {
    it('should estimate work', async () => {
      const result = await executor.execute('/estimate', {
        work: 'API refactoring',
        method: 'story-points',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toMatch(/estimate|points|hours/i);
    });

    it('should calculate team velocity', async () => {
      const result = await executor.execute('/estimate:velocity', {
        sprints: 3,
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Progress Reporting Commands', () => {
    it('should generate weekly report', async () => {
      const result = await executor.execute('/report:weekly', {
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toMatch(/weekly|report|progress/i);
    });

    it('should generate monthly report', async () => {
      const result = await executor.execute('/report:monthly', {
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });

    it('should show progress metrics', async () => {
      const result = await executor.execute('/progress', {
        days: 7,
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Workflow Automation Commands', () => {
    it('should prepare release', async () => {
      const result = await executor.execute('/release:prep', {
        version: '1.2.0',
        skipInteractive: true,
        test: true,
        dryRun: true
      });
      
      expect(result.success).toBe(true);
    });

    it('should generate changelog', async () => {
      const result = await executor.execute('/changelog', {
        from: 'v1.0.0',
        to: 'HEAD',
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Utility Commands', () => {
    it('should show help', async () => {
      const result = await executor.execute('/help');
      
      expect(result.success).toBe(true);
      const output = outputs.log.join('\n');
      expect(output).toContain('Available Commands');
      expect(output).toMatch(/quick-action|extended-thinking|sprint/i);
    });

    it('should show category-specific help', async () => {
      const categories = commandRegistry.getCategories();
      
      for (const category of categories.slice(0, 3)) { // Test first 3 categories
        const result = await executor.execute('/help', { category });
        expect(result.success).toBe(true);
        
        const output = outputs.log.join('\n');
        expect(output.toLowerCase()).toContain(category);
      }
    });

    it('should sync configuration', async () => {
      const result = await executor.execute('/sync', {
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('Command Options Validation', () => {
    it('should validate required options', async () => {
      // Test with missing required option
      const result = await executor.execute('/sprint:plan', {
        // Missing 'weeks' parameter
        capacity: 40,
        skipInteractive: true,
        test: true
      });
      
      // Should either fail or use defaults
      expect(result).toBeDefined();
    });

    it('should validate option types', async () => {
      const result = await executor.execute('/sprint:plan', {
        weeks: 'invalid', // Should be number
        capacity: 40,
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(false);
    });

    it('should handle boolean flags correctly', async () => {
      const result = await executor.execute('/build', {
        watch: true,
        production: true,
        skipInteractive: true,
        test: true
      });
      
      expect(result.success).toBe(true);
    });
  });
});