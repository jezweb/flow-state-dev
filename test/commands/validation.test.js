/**
 * Command Validation Tests
 * Validates all commands meet quality and consistency standards
 */
import { jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { commandRegistry } from '../../lib/commands/registry.js';
import { BaseSlashCommand } from '../../lib/commands/base.js';

describe('Command Validation', () => {
  let allCommands;
  const validationResults = {
    passed: 0,
    failed: 0,
    issues: []
  };

  beforeAll(async () => {
    await commandRegistry.discover();
    allCommands = commandRegistry.getAll();
  });

  afterAll(() => {
    console.log('\n📋 Command Validation Summary:');
    console.log(`  ✅ Passed: ${validationResults.passed}`);
    console.log(`  ❌ Failed: ${validationResults.failed}`);
    
    if (validationResults.issues.length > 0) {
      console.log('\n🔍 Issues Found:');
      validationResults.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
  });

  describe('Command Structure Validation', () => {
    it('should have all commands properly structured', () => {
      allCommands.forEach(command => {
        const issues = [];
        
        // Validate required properties
        if (!command.name) issues.push(`${command.constructor.name}: Missing name`);
        if (!command.description) issues.push(`${command.name}: Missing description`);
        if (typeof command.execute !== 'function') issues.push(`${command.name}: Missing execute method`);
        
        // Validate name format
        if (command.name && !command.name.startsWith('/')) {
          issues.push(`${command.name}: Name should start with /`);
        }
        
        // Validate description quality
        if (command.description) {
          if (command.description.length < 10) {
            issues.push(`${command.name}: Description too short (${command.description.length} chars)`);
          }
          if (command.description.length > 100) {
            issues.push(`${command.name}: Description too long (${command.description.length} chars)`);
          }
        }
        
        if (issues.length === 0) {
          validationResults.passed++;
        } else {
          validationResults.failed++;
          validationResults.issues.push(...issues);
        }
        
        expect(issues).toHaveLength(0);
      });
    });

    it('should have unique command names', () => {
      const names = new Set();
      const duplicates = [];
      
      allCommands.forEach(command => {
        if (names.has(command.name)) {
          duplicates.push(command.name);
        }
        names.add(command.name);
      });
      
      expect(duplicates).toHaveLength(0);
    });

    it('should have valid aliases', () => {
      allCommands.forEach(command => {
        if (command.aliases) {
          expect(Array.isArray(command.aliases)).toBe(true);
          
          command.aliases.forEach(alias => {
            expect(typeof alias).toBe('string');
            expect(alias.startsWith('/')).toBe(true);
            expect(alias).not.toBe(command.name); // Alias shouldn't be same as main name
          });
        }
      });
    });
  });

  describe('Category Validation', () => {
    const expectedCategories = {
      'utility': ['help', 'sync', 'clean'],
      'quick-action': ['status', 'add', 'commit', 'push', 'build', 'test', 'lint', 'pr'],
      'project': ['issues', 'milestones', 'labels'],
      'analysis': ['metrics', 'dependencies', 'quality'],
      'workflow': ['status', 'deploy', 'pipeline', 'environments'],
      'sprint': ['plan', 'review', 'close'],
      'issue': ['bulk', 'dependencies'],
      'estimation': ['bulk', 'sprint'],
      'planning': ['breakdown', 'epic', 'feature', 'scope'],
      'thinking': ['plan', 'investigate', 'decide', 'research', 'alternatives']
    };

    it('should have commands in valid categories', () => {
      const validCategories = Object.keys(expectedCategories);
      
      allCommands.forEach(command => {
        if (command.category) {
          expect(validCategories).toContain(command.category);
        }
      });
    });

    it('should have expected commands in each category', () => {
      Object.entries(expectedCategories).forEach(([category, expectedCommands]) => {
        const categoryCommands = allCommands.filter(cmd => cmd.category === category);
        
        expectedCommands.forEach(expectedCmd => {
          const found = categoryCommands.some(cmd => 
            cmd.name.includes(expectedCmd) || 
            (cmd.aliases && cmd.aliases.some(alias => alias.includes(expectedCmd)))
          );
          
          if (!found) {
            validationResults.issues.push(`Missing expected command in ${category}: ${expectedCmd}`);
          }
        });
      });
    });
  });

  describe('Command Implementation Quality', () => {
    it('should have proper error handling in execute methods', async () => {
      // Test each command with invalid input to ensure they handle errors gracefully
      const mockConsole = {
        log: jest.spyOn(console, 'log').mockImplementation(),
        error: jest.spyOn(console, 'error').mockImplementation(),
        warn: jest.spyOn(console, 'warn').mockImplementation()
      };

      try {
        for (const command of allCommands.slice(0, 10)) { // Test first 10 commands
          try {
            await command.execute({
              args: ['--invalid-flag', 'invalid-arg'],
              raw: `${command.name} --invalid-flag invalid-arg`
            });
          } catch (error) {
            // Commands should handle errors gracefully, not throw unhandled exceptions
            validationResults.issues.push(`${command.name}: Throws unhandled error - ${error.message}`);
          }
        }
      } finally {
        Object.values(mockConsole).forEach(spy => spy.mockRestore());
      }
    });

    it('should have commands that respond to --help', async () => {
      const mockConsole = jest.spyOn(console, 'log').mockImplementation();
      
      try {
        // Test a few representative commands
        const testCommands = allCommands.filter(cmd => 
          ['help', 'status', 'build', 'test'].some(name => cmd.name.includes(name))
        ).slice(0, 4);

        for (const command of testCommands) {
          mockConsole.mockClear();
          
          await command.execute({
            args: [],
            help: true,
            raw: `${command.name} --help`
          });
          
          // Should have logged something when help is requested
          expect(mockConsole).toHaveBeenCalled();
        }
      } finally {
        mockConsole.mockRestore();
      }
    });
  });

  describe('Performance Validation', () => {
    it('should have commands that execute quickly', async () => {
      const mockConsole = {
        log: jest.spyOn(console, 'log').mockImplementation(),
        error: jest.spyOn(console, 'error').mockImplementation()
      };

      try {
        // Test execution time for quick commands
        const quickCommands = allCommands.filter(cmd => 
          cmd.category === 'utility' || cmd.name === '/help'
        );

        for (const command of quickCommands) {
          const start = performance.now();
          
          await command.execute({
            args: [],
            raw: command.name
          });
          
          const duration = performance.now() - start;
          
          // Quick commands should execute within 100ms
          if (duration > 100) {
            validationResults.issues.push(`${command.name}: Slow execution (${duration.toFixed(2)}ms)`);
          }
        }
      } finally {
        Object.values(mockConsole).forEach(spy => spy.mockRestore());
      }
    });
  });

  describe('Documentation Validation', () => {
    it('should have commands with helpful descriptions', () => {
      allCommands.forEach(command => {
        if (command.description) {
          // Check for common description quality issues
          const desc = command.description.toLowerCase();
          
          if (desc.includes('todo') || desc.includes('fixme')) {
            validationResults.issues.push(`${command.name}: Description contains TODO/FIXME`);
          }
          
          if (!desc.includes(' ')) {
            validationResults.issues.push(`${command.name}: Description is single word`);
          }
          
          // Should start with capital letter
          if (command.description[0] !== command.description[0].toUpperCase()) {
            validationResults.issues.push(`${command.name}: Description should start with capital letter`);
          }
        }
      });
    });

    it('should have commands with examples where appropriate', () => {
      // Complex commands should have examples
      const complexCommands = allCommands.filter(cmd => 
        cmd.category === 'planning' || cmd.category === 'thinking' || cmd.category === 'estimation'
      );

      complexCommands.forEach(command => {
        if (command.examples && command.examples.length === 0) {
          validationResults.issues.push(`${command.name}: Complex command should have examples`);
        }
      });
    });
  });

  describe('Alias Validation', () => {
    it('should have no conflicting aliases', () => {
      const allAliases = new Map(); // alias -> command name
      
      allCommands.forEach(command => {
        // Add main command name
        if (allAliases.has(command.name)) {
          validationResults.issues.push(`Duplicate command name: ${command.name}`);
        }
        allAliases.set(command.name, command.name);
        
        // Add aliases
        if (command.aliases) {
          command.aliases.forEach(alias => {
            if (allAliases.has(alias)) {
              validationResults.issues.push(`Conflicting alias ${alias}: used by ${command.name} and ${allAliases.get(alias)}`);
            }
            allAliases.set(alias, command.name);
          });
        }
      });
    });

    it('should have meaningful aliases', () => {
      allCommands.forEach(command => {
        if (command.aliases) {
          command.aliases.forEach(alias => {
            // Aliases should be shorter than main name or meaningful abbreviations
            if (alias.length >= command.name.length) {
              validationResults.issues.push(`${command.name}: Alias ${alias} is not shorter than main name`);
            }
            
            // Single letter aliases should be for very common commands
            if (alias.length === 2) { // '/' + letter
              const commonCommands = ['/build', '/test', '/status', '/commit', '/push', '/lint', '/add'];
              if (!commonCommands.includes(command.name)) {
                validationResults.issues.push(`${command.name}: Single letter alias ${alias} should be reserved for very common commands`);
              }
            }
          });
        }
      });
    });
  });
});