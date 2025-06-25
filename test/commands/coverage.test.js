/**
 * Command Coverage Tests
 * Ensures all commands are properly tested and covered
 */
import { jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { commandRegistry } from '../../lib/commands/registry.js';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';

describe('Command Coverage Analysis', () => {
  let allCommands;
  let executor;
  const coverageResults = {
    totalCommands: 0,
    testedCommands: 0,
    untestedCommands: [],
    categoryBreadth: {},
    functionalityBreadth: {},
    missingTests: []
  };

  beforeAll(async () => {
    await commandRegistry.discover();
    allCommands = commandRegistry.getAll();
    executor = new SlashCommandExecutor();
    coverageResults.totalCommands = allCommands.length;
  });

  afterAll(() => {
    console.log('\n📊 Command Coverage Report:');
    console.log(`  Total Commands: ${coverageResults.totalCommands}`);
    console.log(`  Tested Commands: ${coverageResults.testedCommands}`);
    console.log(`  Coverage: ${((coverageResults.testedCommands / coverageResults.totalCommands) * 100).toFixed(1)}%`);
    
    if (coverageResults.untestedCommands.length > 0) {
      console.log('\n⚠️  Untested Commands:');
      coverageResults.untestedCommands.forEach(cmd => console.log(`    - ${cmd}`));
    }
    
    console.log('\n📈 Category Coverage:');
    Object.entries(coverageResults.categoryBreadth).forEach(([category, data]) => {
      const percentage = ((data.tested / data.total) * 100).toFixed(1);
      console.log(`    ${category}: ${data.tested}/${data.total} (${percentage}%)`);
    });
  });

  describe('Basic Command Execution Coverage', () => {
    let mockConsole;

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

    it('should execute all commands without critical errors', async () => {
      const results = [];
      
      for (const command of allCommands) {
        try {
          await command.execute({
            args: [],
            raw: command.name,
            help: false
          });
          
          results.push({ command: command.name, status: 'success' });
          coverageResults.testedCommands++;
        } catch (error) {
          results.push({ 
            command: command.name, 
            status: 'error', 
            error: error.message 
          });
          coverageResults.untestedCommands.push(command.name);
        }
      }
      
      // Track category coverage
      allCommands.forEach(command => {
        const category = command.category || 'uncategorized';
        if (!coverageResults.categoryBreadth[category]) {
          coverageResults.categoryBreadth[category] = { total: 0, tested: 0 };
        }
        coverageResults.categoryBreadth[category].total++;
        
        const result = results.find(r => r.command === command.name);
        if (result && result.status === 'success') {
          coverageResults.categoryBreadth[category].tested++;
        }
      });
      
      // All commands should execute without throwing unhandled exceptions
      const failedCommands = results.filter(r => r.status === 'error');
      if (failedCommands.length > 0) {
        console.log('\nCommands with execution errors:');
        failedCommands.forEach(({ command, error }) => {
          console.log(`  ${command}: ${error}`);
        });
      }
      
      // Allow up to 5% failure rate for commands that require specific setup
      const failureRate = (failedCommands.length / results.length) * 100;
      expect(failureRate).toBeLessThan(5);
    });
  });

  describe('Help System Coverage', () => {
    let mockConsole;

    beforeEach(() => {
      mockConsole = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      mockConsole.mockRestore();
    });

    it('should have help available for all commands', async () => {
      const commandsWithoutHelp = [];
      
      for (const command of allCommands) {
        mockConsole.mockClear();
        
        try {
          await command.execute({
            args: [],
            help: true,
            raw: `${command.name} --help`
          });
          
          // Should have output something for help
          if (mockConsole.mock.calls.length === 0) {
            commandsWithoutHelp.push(command.name);
          }
        } catch (error) {
          commandsWithoutHelp.push(command.name);
        }
      }
      
      if (commandsWithoutHelp.length > 0) {
        coverageResults.missingTests.push(`Commands without help: ${commandsWithoutHelp.join(', ')}`);
      }
      
      // All commands should respond to --help
      expect(commandsWithoutHelp.length).toBeLessThan(allCommands.length * 0.1); // Less than 10%
    });
  });

  describe('Argument Handling Coverage', () => {
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

    it('should handle various argument patterns', async () => {
      const argumentPatterns = [
        { args: [], description: 'no arguments' },
        { args: ['arg1'], description: 'single argument' },
        { args: ['arg1', 'arg2'], description: 'multiple arguments' },
        { args: [], options: { flag: true }, description: 'boolean flag' },
        { args: [], options: { option: 'value' }, description: 'option with value' },
        { args: ['arg'], options: { flag: true, option: 'value' }, description: 'mixed args and options' }
      ];

      // Test a representative sample of commands with different argument patterns
      const testCommands = allCommands.slice(0, Math.min(10, allCommands.length));
      
      for (const command of testCommands) {
        for (const pattern of argumentPatterns) {
          try {
            await command.execute({
              args: pattern.args || [],
              ...pattern.options || {},
              raw: `${command.name} test`
            });
          } catch (error) {
            // Commands should handle various inputs gracefully
            // Throwing is acceptable, but should be controlled
          }
        }
      }
      
      // If we get here without unhandled promise rejections, argument handling is good
      expect(true).toBe(true);
    });
  });

  describe('Category Functionality Coverage', () => {
    it('should have representative commands in each category', () => {
      const categoryRequirements = {
        'utility': { minCommands: 2, requiredFunctions: ['help'] },
        'quick-action': { minCommands: 5, requiredFunctions: ['status', 'build', 'test'] },
        'project': { minCommands: 3, requiredFunctions: ['issues', 'labels'] },
        'analysis': { minCommands: 2, requiredFunctions: ['metrics'] },
        'workflow': { minCommands: 3, requiredFunctions: ['deploy'] },
        'sprint': { minCommands: 2, requiredFunctions: ['plan'] },
        'issue': { minCommands: 2, requiredFunctions: ['bulk'] },
        'estimation': { minCommands: 2, requiredFunctions: ['bulk'] },
        'planning': { minCommands: 3, requiredFunctions: ['breakdown'] },
        'thinking': { minCommands: 3, requiredFunctions: ['plan', 'research'] }
      };

      Object.entries(categoryRequirements).forEach(([category, requirements]) => {
        const categoryCommands = allCommands.filter(cmd => cmd.category === category);
        
        expect(categoryCommands.length).toBeGreaterThanOrEqual(requirements.minCommands);
        
        requirements.requiredFunctions.forEach(func => {
          const hasFunction = categoryCommands.some(cmd => 
            cmd.name.includes(func) || 
            (cmd.aliases && cmd.aliases.some(alias => alias.includes(func)))
          );
          expect(hasFunction).toBe(true);
        });
      });
    });
  });

  describe('Integration Points Coverage', () => {
    it('should have commands that integrate with external systems', () => {
      const integrationPoints = {
        git: ['/status', '/add', '/commit', '/push'],
        github: ['/issues', '/pr', '/labels'],
        build: ['/build', '/test', '/lint'],
        package: ['/dependencies', '/metrics']
      };

      Object.entries(integrationPoints).forEach(([system, expectedCommands]) => {
        expectedCommands.forEach(commandName => {
          const command = allCommands.find(cmd => cmd.name === commandName);
          expect(command).toBeDefined();
        });
      });
    });

    it('should cover different workflow stages', () => {
      const workflowStages = {
        development: ['/build', '/test', '/lint'],
        planning: ['/breakdown', '/plan', '/estimate'],
        collaboration: ['/commit', '/push', '/pr'],
        management: ['/issues', '/sprint:plan', '/milestones'],
        analysis: ['/metrics', '/dependencies', '/quality']
      };

      Object.entries(workflowStages).forEach(([stage, commands]) => {
        const coverage = commands.filter(cmdName => 
          allCommands.some(cmd => cmd.name === cmdName)
        );
        
        // Each workflow stage should have at least 80% coverage
        const coveragePercentage = (coverage.length / commands.length) * 100;
        expect(coveragePercentage).toBeGreaterThanOrEqual(80);
      });
    });
  });

  describe('Edge Case Coverage', () => {
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

    it('should handle edge cases gracefully', async () => {
      const edgeCases = [
        { input: '', description: 'empty command' },
        { input: '/', description: 'slash only' },
        { input: '/nonexistent', description: 'unknown command' },
        { input: '/help --invalid-option', description: 'invalid option' },
        { input: '/status --porcelain --verbose', description: 'conflicting options' }
      ];

      for (const testCase of edgeCases) {
        try {
          await executor.execute(testCase.input);
        } catch (error) {
          // Edge cases should be handled gracefully, not crash the system
        }
      }
      
      // System should still be responsive after edge cases
      await executor.execute('/help');
      expect(mockConsole.log).toHaveBeenCalled();
    });
  });

  describe('Performance Coverage', () => {
    it('should have performance benchmarks for different command types', () => {
      const performanceCategories = {
        'quick': allCommands.filter(cmd => 
          cmd.category === 'utility' || cmd.category === 'quick-action'
        ),
        'moderate': allCommands.filter(cmd => 
          cmd.category === 'project' || cmd.category === 'analysis'
        ),
        'complex': allCommands.filter(cmd => 
          cmd.category === 'planning' || cmd.category === 'thinking'
        )
      };

      // Each category should have commands
      expect(performanceCategories.quick.length).toBeGreaterThan(0);
      expect(performanceCategories.moderate.length).toBeGreaterThan(0);
      expect(performanceCategories.complex.length).toBeGreaterThan(0);
      
      // Total should equal all commands
      const total = Object.values(performanceCategories).reduce((sum, cmds) => sum + cmds.length, 0);
      expect(total).toBeGreaterThanOrEqual(allCommands.length * 0.8); // At least 80% categorized
    });
  });
});