/**
 * Tests for SlashCommandRegistry
 */
import { jest } from '@jest/globals';
import { SlashCommandRegistry } from '../../lib/commands/registry.js';
import { BaseSlashCommand } from '../../lib/commands/base.js';
import fs from 'fs-extra';

describe('SlashCommandRegistry', () => {
  let registry;
  let mockCommand;

  beforeEach(() => {
    registry = new SlashCommandRegistry();
    
    // Create a mock command
    class MockCommand extends BaseSlashCommand {
      async execute() {
        return true;
      }
    }
    
    mockCommand = new MockCommand('/test', 'Test command', {
      aliases: ['/t'],
      category: 'testing'
    });
  });

  describe('register', () => {
    it('should register a command', () => {
      registry.register(mockCommand);
      
      expect(registry.commands.has('/test')).toBe(true);
      expect(registry.get('/test')).toBe(mockCommand);
    });

    it('should register aliases', () => {
      registry.register(mockCommand);
      
      expect(registry.aliases.has('/t')).toBe(true);
      expect(registry.get('/t')).toBe(mockCommand);
    });

    it('should organize by category', () => {
      registry.register(mockCommand);
      
      const testingCommands = registry.getByCategory('testing');
      expect(testingCommands).toContain(mockCommand);
    });

    it('should reject non-BaseSlashCommand instances', () => {
      const invalidCommand = { name: 'invalid' };
      
      expect(() => registry.register(invalidCommand)).toThrow('Command must extend BaseSlashCommand');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      registry.register(mockCommand);
    });

    it('should get command by name', () => {
      expect(registry.get('/test')).toBe(mockCommand);
    });

    it('should get command by alias', () => {
      expect(registry.get('/t')).toBe(mockCommand);
    });

    it('should return null for unknown command', () => {
      expect(registry.get('/unknown')).toBe(null);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      registry.register(mockCommand);
      
      // Add more test commands
      registry.register(new (class extends BaseSlashCommand {
        async execute() {}
      })('/build', 'Build the project', { aliases: ['/b'] }));
      
      registry.register(new (class extends BaseSlashCommand {
        async execute() {}
      })('/test:unit', 'Run unit tests', { aliases: ['/tu'] }));
    });

    it('should search by name', () => {
      const results = registry.search('test');
      expect(results.length).toBe(2);
      expect(results.map(r => r.name)).toContain('/test');
      expect(results.map(r => r.name)).toContain('/test:unit');
    });

    it('should search by description', () => {
      const results = registry.search('project');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('/build');
    });

    it('should search by alias', () => {
      const results = registry.search('/b');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('/build');
    });
  });

  describe('getSuggestions', () => {
    beforeEach(() => {
      registry.register(mockCommand);
      registry.register(new (class extends BaseSlashCommand {
        async execute() {}
      })('/test:unit', 'Run unit tests', { aliases: ['/tu'] }));
    });

    it('should suggest commands starting with partial', () => {
      const suggestions = registry.getSuggestions('/te');
      expect(suggestions.length).toBe(2);
      expect(suggestions[0].exact).toBe(true);
    });

    it('should suggest aliases', () => {
      const suggestions = registry.getSuggestions('/t');
      expect(suggestions.some(s => s.isAlias)).toBe(true);
    });

    it('should fall back to fuzzy matching', () => {
      const suggestions = registry.getSuggestions('unit');
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].exact).toBe(false);
    });
  });

  describe('exportData', () => {
    beforeEach(() => {
      registry.register(mockCommand);
    });

    it('should export registry data', () => {
      const data = registry.exportData();
      
      expect(data.totalCommands).toBe(1);
      expect(data.totalAliases).toBe(1);
      expect(data.commands).toHaveLength(1);
      expect(data.commands[0].name).toBe('/test');
      expect(data.categories.testing).toContain('/test');
    });
  });

  describe('loadCommand', () => {
    it('should handle invalid module exports gracefully', async () => {
      // Mock fs to simulate a bad module
      jest.spyOn(fs, 'pathExists').mockResolvedValue(true);
      jest.spyOn(fs, 'readdir').mockResolvedValue(['bad.js']);
      
      // Mock dynamic import to return invalid module
      const originalImport = registry.loadCommand;
      registry.loadCommand = jest.fn().mockResolvedValue(undefined);
      
      await registry.loadCommandsFromDirectory('/fake/path');
      
      // Should not throw, just warn
      expect(registry.commands.size).toBe(0);
    });
  });
});