/**
 * Slash Command Executor
 * Handles parsing and execution of slash commands using the modular system
 */
import chalk from 'chalk';
import { commandRegistry } from './registry.js';
import { performance } from 'perf_hooks';
import { performanceMonitor } from '../performance/monitor.js';

export class SlashCommandExecutor {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the command system
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      await commandRegistry.discover();
      this.initialized = true;
    } catch (error) {
      console.error(chalk.red('Failed to initialize slash commands:'), error.message);
      throw error;
    }
  }

  /**
   * Parse a slash command string
   */
  parseCommand(commandString) {
    // Remove quotes if wrapped
    let cleaned = commandString.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }
    
    // Ensure it starts with /
    if (!cleaned.startsWith('/')) {
      cleaned = '/' + cleaned;
    }
    
    // Split into parts, respecting quotes
    const parts = this.splitCommandString(cleaned);
    const commandName = parts[0];
    const args = parts.slice(1);
    
    // Parse options from args
    const { options, positional } = this.parseArgs(args);
    
    return {
      name: commandName,
      args: positional,
      options,
      raw: commandString
    };
  }

  /**
   * Split command string respecting quotes
   */
  splitCommandString(str) {
    const parts = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = null;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
      } else if (!inQuotes && char === ' ') {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      parts.push(current);
    }
    
    return parts;
  }

  /**
   * Parse arguments into options and positional args
   */
  parseArgs(args) {
    const options = {};
    const positional = [];
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        // Look ahead for value
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options[key] = args[i + 1];
          i++; // Skip next arg
        } else {
          options[key] = true;
        }
      } else {
        positional.push(arg);
      }
    }
    
    return { options, positional };
  }

  /**
   * Execute a slash command
   */
  async execute(commandString) {
    const startTime = performance.now();
    
    // Ensure initialized
    await this.initialize();
    
    // Parse the command
    const parsed = this.parseCommand(commandString);
    
    // Find the command
    const command = commandRegistry.get(parsed.name);
    
    if (!command) {
      await this.handleUnknownCommand(parsed.name);
      return;
    }
    
    // Execute the command with performance tracking
    const executionStart = performance.now();
    try {
      await command.run({
        args: parsed.args,
        ...parsed.options,
        raw: parsed.raw
      });
      
      const executionDuration = performance.now() - executionStart;
      performanceMonitor.trackCommandExecution(parsed.name, executionDuration, {
        args: parsed.args.length,
        options: Object.keys(parsed.options).length
      });
    } catch (error) {
      const executionDuration = performance.now() - executionStart;
      performanceMonitor.trackCommandExecution(parsed.name, executionDuration, {
        error: true,
        errorType: error.constructor.name
      });
      throw error;
    }
  }

  /**
   * Handle unknown commands with suggestions
   */
  async handleUnknownCommand(commandName) {
    console.error(chalk.red(`❌ Unknown command: ${commandName}`));
    
    // Get suggestions
    const suggestions = commandRegistry.getSuggestions(commandName);
    
    if (suggestions.length > 0) {
      console.log(chalk.yellow('\nDid you mean:'));
      
      for (const suggestion of suggestions.slice(0, 5)) {
        let name = suggestion.name;
        if (suggestion.isAlias) {
          name += ` (alias for ${suggestion.command.name})`;
        }
        console.log(chalk.cyan(`  ${name}`));
        console.log(chalk.gray(`    ${suggestion.command.description}`));
      }
    }
    
    console.log(chalk.gray('\nUse /help to see all available commands'));
  }

  /**
   * Get command for tab completion
   */
  getCompletions(partial) {
    const suggestions = commandRegistry.getSuggestions(partial);
    return suggestions.map(s => ({
      name: s.name,
      description: s.command.description,
      isAlias: s.isAlias
    }));
  }

  /**
   * Export command data for documentation
   */
  exportCommands() {
    return commandRegistry.exportData();
  }
}

// Singleton instance
export const slashCommandExecutor = new SlashCommandExecutor();