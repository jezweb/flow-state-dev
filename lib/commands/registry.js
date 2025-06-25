/**
 * Command Registry for discovering and managing slash commands
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { BaseSlashCommand } from './base.js';
import { performance } from 'perf_hooks';
import { performanceMonitor } from '../performance/monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SlashCommandRegistry {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.categories = new Map();
    this.discoveryPaths = [
      path.join(__dirname, 'quick-action'),
      path.join(__dirname, 'extended-thinking'),
      path.join(__dirname, 'sprint'),
      path.join(__dirname, 'epic'),
      path.join(__dirname, 'progress'),
      path.join(__dirname, 'issue'),
      path.join(__dirname, 'estimation'),
      path.join(__dirname, 'workflow'),
      path.join(__dirname, 'analysis'),
      path.join(__dirname, 'utility'),
      path.join(__dirname, 'project')
    ];
  }

  /**
   * Discover and load all commands from the filesystem
   */
  async discover() {
    const startTime = performance.now();
    console.log(chalk.gray('Discovering slash commands...'));
    
    for (const dirPath of this.discoveryPaths) {
      if (await fs.pathExists(dirPath)) {
        await this.loadCommandsFromDirectory(dirPath);
      }
    }
    
    const duration = performance.now() - startTime;
    performanceMonitor.trackCommandDiscovery(duration, this.commands.size);
    
    console.log(chalk.gray(`Loaded ${this.commands.size} commands in ${duration.toFixed(2)}ms`));
  }

  /**
   * Load commands from a directory
   */
  async loadCommandsFromDirectory(dirPath) {
    try {
      // console.log(chalk.gray(`Scanning directory: ${dirPath}`));
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          // console.log(chalk.gray(`Found subdirectory: ${item.name}`));
          // Recursively load from subdirectories
          await this.loadCommandsFromDirectory(fullPath);
        } else if (item.name.endsWith('.js') && !item.name.startsWith('_')) {
          // Load command file
          await this.loadCommand(fullPath);
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not load commands from ${dirPath}:`), error.message);
    }
  }

  /**
   * Load a single command from a file
   */
  async loadCommand(filePath) {
    try {
      // console.log(chalk.gray(`Loading command from ${filePath}...`));
      const module = await import(filePath);
      
      // Find the command class (exported as default or named export)
      let CommandClass = module.default;
      
      if (!CommandClass) {
        // Try to find a named export that extends BaseSlashCommand
        for (const exportedItem of Object.values(module)) {
          if (exportedItem.prototype instanceof BaseSlashCommand) {
            CommandClass = exportedItem;
            break;
          }
        }
      }
      
      if (!CommandClass) {
        console.warn(chalk.yellow(`Warning: ${filePath} does not export a default command class`));
        return;
      }
      
      if (typeof CommandClass !== 'function') {
        console.warn(chalk.yellow(`Warning: ${filePath} default export is not a class/function`));
        return;
      }
      
      if (!(CommandClass.prototype instanceof BaseSlashCommand)) {
        console.warn(chalk.yellow(`Warning: ${filePath} does not extend BaseSlashCommand`));
        return;
      }
      
      // Instantiate the command
      const command = new CommandClass();
      
      // Register the command
      this.register(command);
      
    } catch (error) {
      console.error(chalk.red(`Error loading command from ${filePath}:`), error.message);
      console.error(error.stack);
    }
  }

  /**
   * Register a command
   */
  register(command) {
    if (!(command instanceof BaseSlashCommand)) {
      throw new Error('Command must extend BaseSlashCommand');
    }
    
    // Register main command
    this.commands.set(command.name, command);
    
    // Register aliases
    for (const alias of command.aliases) {
      this.aliases.set(alias, command.name);
    }
    
    // Track by category
    if (!this.categories.has(command.category)) {
      this.categories.set(command.category, []);
    }
    this.categories.get(command.category).push(command);
  }

  /**
   * Get a command by name or alias
   */
  get(nameOrAlias) {
    // Direct command lookup
    if (this.commands.has(nameOrAlias)) {
      return this.commands.get(nameOrAlias);
    }
    
    // Alias lookup
    if (this.aliases.has(nameOrAlias)) {
      const commandName = this.aliases.get(nameOrAlias);
      return this.commands.get(commandName);
    }
    
    return null;
  }

  /**
   * Get all commands
   */
  getAll() {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getByCategory(category) {
    return this.categories.get(category) || [];
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.keys()).sort();
  }

  /**
   * Search for commands
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    for (const command of this.commands.values()) {
      if (
        command.name.toLowerCase().includes(lowerQuery) ||
        command.description.toLowerCase().includes(lowerQuery) ||
        command.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))
      ) {
        results.push(command);
      }
    }
    
    return results;
  }

  /**
   * Get command suggestions for a partial input
   */
  getSuggestions(partial) {
    const lowerPartial = partial.toLowerCase();
    const suggestions = [];
    
    // Check exact matches first
    for (const [name, command] of this.commands) {
      if (name.toLowerCase().startsWith(lowerPartial)) {
        suggestions.push({ name, command, exact: true });
      }
    }
    
    // Check aliases
    for (const [alias, commandName] of this.aliases) {
      if (alias.toLowerCase().startsWith(lowerPartial)) {
        const command = this.commands.get(commandName);
        suggestions.push({ name: alias, command, exact: true, isAlias: true });
      }
    }
    
    // If no exact matches, try fuzzy matching
    if (suggestions.length === 0) {
      for (const [name, command] of this.commands) {
        if (name.toLowerCase().includes(lowerPartial)) {
          suggestions.push({ name, command, exact: false });
        }
      }
    }
    
    return suggestions;
  }

  /**
   * Export registry data for documentation
   */
  exportData() {
    const data = {
      commands: [],
      categories: {},
      totalCommands: this.commands.size,
      totalAliases: this.aliases.size
    };
    
    // Export commands
    for (const command of this.commands.values()) {
      data.commands.push({
        name: command.name,
        description: command.description,
        category: command.category,
        aliases: command.aliases,
        usage: command.usage,
        examples: command.examples,
        options: command.options,
        requiresAuth: command.requiresAuth,
        requiresRepo: command.requiresRepo
      });
    }
    
    // Export categories
    for (const [category, commands] of this.categories) {
      data.categories[category] = commands.map(cmd => cmd.name);
    }
    
    return data;
  }
}

// Singleton instance
export const commandRegistry = new SlashCommandRegistry();