/**
 * Tests for SlashCommandExecutor
 */
import { jest } from '@jest/globals';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import { commandRegistry } from '../../lib/commands/registry.js';
import { BaseSlashCommand } from '../../lib/commands/base.js';

describe('SlashCommandExecutor', () => {
  let executor;
  let mockCommand;
  let executeSpy;

  beforeEach(() => {
    executor = new SlashCommandExecutor();
    
    // Create a mock command
    executeSpy = jest.fn();
    class MockCommand extends BaseSlashCommand {
      async execute(options) {
        executeSpy(options);
      }
    }
    
    mockCommand = new MockCommand('/test', 'Test command', {
      aliases: ['/t'],
      requiresAuth: false,
      requiresRepo: false
    });
    
    // Mock registry
    jest.spyOn(commandRegistry, 'discover').mockResolvedValue();
    jest.spyOn(commandRegistry, 'get').mockReturnValue(mockCommand);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseCommand', () => {
    it('should parse basic command', () => {
      const parsed = executor.parseCommand('/test');
      expect(parsed.name).toBe('/test');
      expect(parsed.args).toEqual([]);
      expect(parsed.options).toEqual({});
    });

    it('should parse command with arguments', () => {
      const parsed = executor.parseCommand('/test arg1 arg2');
      expect(parsed.name).toBe('/test');
      expect(parsed.args).toEqual(['arg1', 'arg2']);
    });

    it('should parse command with options', () => {
      const parsed = executor.parseCommand('/test --flag --option value');
      expect(parsed.name).toBe('/test');
      expect(parsed.options).toEqual({ flag: true, option: 'value' });
    });

    it('should handle quoted arguments', () => {
      const parsed = executor.parseCommand('/test "arg with spaces" --option "value with spaces"');
      expect(parsed.args).toEqual(['arg with spaces']);
      expect(parsed.options.option).toBe('value with spaces');
    });

    it('should strip surrounding quotes', () => {
      const parsed = executor.parseCommand('"/test --option value"');
      expect(parsed.name).toBe('/test');
      expect(parsed.options.option).toBe('value');
    });

    it('should add leading slash if missing', () => {
      const parsed = executor.parseCommand('test');
      expect(parsed.name).toBe('/test');
    });
  });

  describe('splitCommandString', () => {
    it('should split respecting single quotes', () => {
      const parts = executor.splitCommandString("/test 'arg with spaces' normal");
      expect(parts).toEqual(['/test', 'arg with spaces', 'normal']);
    });

    it('should split respecting double quotes', () => {
      const parts = executor.splitCommandString('/test "arg with spaces" normal');
      expect(parts).toEqual(['/test', 'arg with spaces', 'normal']);
    });

    it('should handle mixed quotes', () => {
      const parts = executor.splitCommandString('/test "double" \'single\'');
      expect(parts).toEqual(['/test', 'double', 'single']);
    });
  });

  describe('parseArgs', () => {
    it('should separate options and positional args', () => {
      const { options, positional } = executor.parseArgs(['arg1', '--flag', '--key', 'value', 'arg2']);
      expect(positional).toEqual(['arg1', 'arg2']);
      expect(options).toEqual({ flag: true, key: 'value' });
    });

    it('should handle boolean flags', () => {
      const { options } = executor.parseArgs(['--flag1', '--flag2']);
      expect(options).toEqual({ flag1: true, flag2: true });
    });
  });

  describe('execute', () => {
    it('should initialize on first execution', async () => {
      await executor.execute('/test');
      expect(commandRegistry.discover).toHaveBeenCalled();
    });

    it('should execute found command', async () => {
      await executor.execute('/test --option value');
      
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [],
          option: 'value',
          raw: '/test --option value'
        })
      );
    });

    it('should handle unknown command', async () => {
      commandRegistry.get.mockReturnValue(null);
      jest.spyOn(commandRegistry, 'getSuggestions').mockReturnValue([]);
      
      // Mock console.error to prevent output
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();
      
      await executor.execute('/unknown');
      
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Unknown command: /unknown'));
      
      consoleError.mockRestore();
      consoleLog.mockRestore();
    });

    it('should show suggestions for unknown command', async () => {
      commandRegistry.get.mockReturnValue(null);
      
      const suggestions = [
        { name: '/test', command: mockCommand, exact: true }
      ];
      jest.spyOn(commandRegistry, 'getSuggestions').mockReturnValue(suggestions);
      
      // Mock console to capture output
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();
      
      await executor.execute('/tes');
      
      expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('Did you mean:'));
      expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('/test'));
      
      consoleError.mockRestore();
      consoleLog.mockRestore();
    });
  });

  describe('getCompletions', () => {
    it('should return command completions', () => {
      const suggestions = [
        { name: '/test', command: mockCommand, exact: true },
        { name: '/t', command: mockCommand, exact: true, isAlias: true }
      ];
      jest.spyOn(commandRegistry, 'getSuggestions').mockReturnValue(suggestions);
      
      const completions = executor.getCompletions('/t');
      
      expect(completions).toHaveLength(2);
      expect(completions[0]).toEqual({
        name: '/test',
        description: 'Test command',
        isAlias: undefined
      });
      expect(completions[1].isAlias).toBe(true);
    });
  });
});