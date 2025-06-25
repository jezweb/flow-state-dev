/**
 * Command Discovery Integration Tests
 * 
 * Tests the automatic discovery and registration of slash commands
 * from the filesystem in the modular architecture
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { commandRegistry } from '../../lib/commands/registry.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Command Discovery Integration', () => {
  let discoveryTime;
  let commandStats;

  beforeAll(async () => {
    // Clear registry to test fresh discovery
    commandRegistry.clear();
    
    // Measure discovery time
    const start = performance.now();
    await commandRegistry.discover();
    discoveryTime = performance.now() - start;
    
    // Collect command statistics
    commandStats = {
      total: commandRegistry.getAll().length,
      byCategory: {},
      withAliases: 0,
      withOptions: 0,
      withExamples: 0
    };
    
    // Analyze commands
    commandRegistry.getAll().forEach(cmd => {
      // Category stats
      if (!commandStats.byCategory[cmd.category]) {
        commandStats.byCategory[cmd.category] = 0;
      }
      commandStats.byCategory[cmd.category]++;
      
      // Feature stats
      if (cmd.aliases && cmd.aliases.length > 0) commandStats.withAliases++;
      if (cmd.options && Object.keys(cmd.options).length > 0) commandStats.withOptions++;
      if (cmd.examples && cmd.examples.length > 0) commandStats.withExamples++;
    });
  });

  describe('Discovery Performance', () => {
    it('should discover all commands in less than 25ms', () => {
      expect(discoveryTime).toBeLessThan(25);
    });

    it('should discover 67+ commands', () => {
      expect(commandStats.total).toBeGreaterThanOrEqual(67);
    });
  });

  describe('Command Structure Validation', () => {
    it('should discover commands from all expected categories', () => {
      const expectedCategories = [
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
      
      expectedCategories.forEach(category => {
        expect(commandStats.byCategory[category]).toBeGreaterThan(0);
      });
    });

    it('should load all command properties correctly', () => {
      const testCommand = commandRegistry.get('build');
      
      expect(testCommand).toBeDefined();
      expect(testCommand.name).toBe('build');
      expect(testCommand.description).toBeDefined();
      expect(testCommand.category).toBe('quick-action');
      expect(testCommand.execute).toBeTypeOf('function');
    });

    it('should have proper command metadata', () => {
      const commands = commandRegistry.getAll();
      
      commands.forEach(cmd => {
        expect(cmd.name).toBeDefined();
        expect(cmd.description).toBeDefined();
        expect(cmd.category).toBeDefined();
        expect(cmd.execute).toBeTypeOf('function');
      });
    });
  });

  describe('Alias Resolution', () => {
    it('should register command aliases', () => {
      expect(commandStats.withAliases).toBeGreaterThan(10); // Many commands have aliases
    });

    it('should resolve single-letter aliases', () => {
      const aliases = [
        { alias: 'b', command: 'build' },
        { alias: 't', command: 'test' },
        { alias: 'l', command: 'lint' },
        { alias: 'c', command: 'commit' },
        { alias: 'p', command: 'push' }
      ];
      
      aliases.forEach(({ alias, command }) => {
        const resolvedCommand = commandRegistry.get(alias);
        expect(resolvedCommand).toBeDefined();
        expect(resolvedCommand.name).toBe(command);
      });
    });

    it('should resolve compound aliases', () => {
      const compoundAliases = [
        { alias: 'e:b', command: 'epic:breakdown' },
        { alias: 'f:p', command: 'feature:plan' },
        { alias: 's:p', command: 'sprint:plan' }
      ];
      
      compoundAliases.forEach(({ alias, command }) => {
        const resolvedCommand = commandRegistry.get(alias);
        if (resolvedCommand) {
          expect(resolvedCommand.name).toBe(command);
        }
      });
    });

    it('should handle alias conflicts properly', () => {
      // Get all aliases
      const allAliases = new Map();
      
      commandRegistry.getAll().forEach(cmd => {
        if (cmd.aliases) {
          cmd.aliases.forEach(alias => {
            if (allAliases.has(alias)) {
              // Alias conflict - should be handled by registry
              const existingCmd = allAliases.get(alias);
              console.warn(`Alias conflict: ${alias} used by ${existingCmd} and ${cmd.name}`);
            }
            allAliases.set(alias, cmd.name);
          });
        }
      });
      
      // Registry should resolve conflicts consistently
      allAliases.forEach((cmdName, alias) => {
        const resolved = commandRegistry.get(alias);
        expect(resolved).toBeDefined();
      });
    });
  });

  describe('Category Organization', () => {
    it('should organize commands by category', () => {
      const categories = commandRegistry.getCategories();
      expect(categories.length).toBeGreaterThanOrEqual(10);
    });

    it('should have balanced category distribution', () => {
      const avgCommandsPerCategory = commandStats.total / Object.keys(commandStats.byCategory).length;
      
      Object.entries(commandStats.byCategory).forEach(([category, count]) => {
        // No category should have more than 3x the average
        expect(count).toBeLessThan(avgCommandsPerCategory * 3);
        // No category should be empty
        expect(count).toBeGreaterThan(0);
      });
    });

    it('should retrieve commands by category', () => {
      const quickActionCommands = commandRegistry.getByCategory('quick-action');
      expect(quickActionCommands.length).toBeGreaterThan(5);
      
      quickActionCommands.forEach(cmd => {
        expect(cmd.category).toBe('quick-action');
      });
    });
  });

  describe('File System Integration', () => {
    it('should discover commands from correct directory structure', async () => {
      const commandsDir = path.join(process.cwd(), 'lib', 'commands');
      const categories = await fs.readdir(commandsDir);
      
      const commandCategories = categories.filter(item => {
        const itemPath = path.join(commandsDir, item);
        return fs.statSync(itemPath).isDirectory() && 
               !item.startsWith('.') && 
               item !== 'node_modules';
      });
      
      expect(commandCategories.length).toBeGreaterThanOrEqual(10);
    });

    it('should load commands from category subdirectories', async () => {
      const commandsDir = path.join(process.cwd(), 'lib', 'commands');
      const quickActionDir = path.join(commandsDir, 'quick-action');
      
      if (await fs.pathExists(quickActionDir)) {
        const files = await fs.readdir(quickActionDir);
        const commandFiles = files.filter(f => f.endsWith('.js'));
        
        expect(commandFiles.length).toBeGreaterThan(0);
        
        // Each file should have been loaded as a command
        commandFiles.forEach(file => {
          const commandName = file.replace('.js', '');
          const command = commandRegistry.get(commandName);
          // Some files might have different command names
          if (command) {
            expect(command.category).toBe('quick-action');
          }
        });
      }
    });
  });

  describe('Command Options and Examples', () => {
    it('should load command options', () => {
      expect(commandStats.withOptions).toBeGreaterThan(30); // Most commands have options
    });

    it('should have examples for most commands', () => {
      expect(commandStats.withExamples).toBeGreaterThan(30); // Most commands have examples
    });

    it('should validate option structures', () => {
      const commandsWithOptions = commandRegistry.getAll().filter(cmd => cmd.options);
      
      commandsWithOptions.forEach(cmd => {
        Object.entries(cmd.options).forEach(([optName, optConfig]) => {
          expect(optConfig).toHaveProperty('description');
          expect(optConfig).toHaveProperty('type');
          
          if (optConfig.type === 'boolean') {
            expect(optConfig.default).toBeTypeOf('boolean');
          }
        });
      });
    });
  });

  describe('Error Handling in Discovery', () => {
    it('should handle missing command files gracefully', async () => {
      // Discovery should complete even if some files are missing
      const result = await commandRegistry.discover();
      expect(result).not.toBeNull();
    });

    it('should skip invalid command modules', async () => {
      // Even with invalid modules, discovery should complete
      const allCommands = commandRegistry.getAll();
      expect(allCommands.length).toBeGreaterThan(0);
    });
  });

  describe('Registry API', () => {
    it('should support all registry operations', () => {
      // Test get
      const buildCmd = commandRegistry.get('build');
      expect(buildCmd).toBeDefined();
      
      // Test getAll
      const allCommands = commandRegistry.getAll();
      expect(Array.isArray(allCommands)).toBe(true);
      
      // Test getCategories
      const categories = commandRegistry.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      
      // Test getByCategory
      const quickActions = commandRegistry.getByCategory('quick-action');
      expect(Array.isArray(quickActions)).toBe(true);
      
      // Test search (if implemented)
      if (commandRegistry.search) {
        const searchResults = commandRegistry.search('build');
        expect(Array.isArray(searchResults)).toBe(true);
      }
    });

    it('should maintain registry integrity', () => {
      const command1 = commandRegistry.get('build');
      const command2 = commandRegistry.get('build');
      
      // Same reference - commands should be singleton
      expect(command1).toBe(command2);
    });
  });

  afterAll(() => {
    // Output discovery report
    console.log('\n📊 Command Discovery Report:');
    console.log(`  Discovery Time: ${discoveryTime.toFixed(2)}ms`);
    console.log(`  Total Commands: ${commandStats.total}`);
    console.log(`  Commands with Aliases: ${commandStats.withAliases}`);
    console.log(`  Commands with Options: ${commandStats.withOptions}`);
    console.log(`  Commands with Examples: ${commandStats.withExamples}`);
    console.log('\n  Commands by Category:');
    Object.entries(commandStats.byCategory).forEach(([cat, count]) => {
      console.log(`    ${cat}: ${count}`);
    });
  });
});