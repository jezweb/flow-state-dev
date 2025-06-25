/**
 * Lazy Loading Command Registry
 * 
 * Extends the standard registry with lazy loading capabilities
 */
import { SlashCommandRegistry } from './registry.js';
import { performance } from 'perf_hooks';
import { performanceMonitor } from '../performance/monitor.js';
import { lazyLoad } from '../performance/utils.js';
import chalk from 'chalk';

export class LazySlashCommandRegistry extends SlashCommandRegistry {
  constructor() {
    super();
    this.commandLoaders = new Map(); // Store loaders instead of loaded commands
    this.loadedCommands = new Set(); // Track which commands are loaded
  }

  /**
   * Register a lazy-loaded command
   */
  registerLazy(name, loader, metadata) {
    // Store the loader function
    this.commandLoaders.set(name, {
      loader: lazyLoad(loader),
      metadata
    });
    
    // Register in categories for discovery
    if (metadata.category) {
      if (!this.categories.has(metadata.category)) {
        this.categories.set(metadata.category, []);
      }
      this.categories.get(metadata.category).push(name);
    }
    
    // Register aliases
    if (metadata.aliases) {
      for (const alias of metadata.aliases) {
        this.aliases.set(alias, name);
      }
    }
  }

  /**
   * Override loadCommand to support lazy loading
   */
  async loadCommand(filePath) {
    try {
      // Create a lazy loader for this command
      const loader = async () => {
        const module = await import(filePath);
        
        // Find the command class
        let CommandClass = null;
        for (const key of Object.keys(module)) {
          const exported = module[key];
          if (typeof exported === 'function' && 
              exported.prototype && 
              exported.prototype.constructor === exported &&
              key.endsWith('Command')) {
            CommandClass = exported;
            break;
          }
        }
        
        if (!CommandClass) {
          throw new Error(`No command class found in ${filePath}`);
        }
        
        // Create instance
        const instance = new CommandClass();
        
        // Validate it's a proper command
        if (!instance.name || !instance.description || typeof instance.execute !== 'function') {
          throw new Error(`Invalid command in ${filePath}: missing required properties`);
        }
        
        return instance;
      };
      
      // Pre-load metadata without loading the full command
      const tempModule = await import(filePath);
      let tempInstance = null;
      
      for (const key of Object.keys(tempModule)) {
        const exported = tempModule[key];
        if (typeof exported === 'function' && key.endsWith('Command')) {
          tempInstance = new exported();
          break;
        }
      }
      
      if (tempInstance) {
        const metadata = {
          name: tempInstance.name,
          description: tempInstance.description,
          category: tempInstance.category || 'utility',
          aliases: tempInstance.aliases || []
        };
        
        // Register as lazy-loaded
        this.registerLazy(tempInstance.name, loader, metadata);
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not lazy-load command from ${filePath}:`), error.message);
    }
  }

  /**
   * Get a command (loading it if necessary)
   */
  async get(name) {
    // Check if it's an alias
    if (this.aliases.has(name)) {
      name = this.aliases.get(name);
    }
    
    // If already loaded, return it
    if (this.commands.has(name)) {
      return this.commands.get(name);
    }
    
    // If we have a lazy loader, load it
    if (this.commandLoaders.has(name)) {
      const { loader, metadata } = this.commandLoaders.get(name);
      
      const start = performance.now();
      try {
        const command = await loader();
        const duration = performance.now() - start;
        
        // Track lazy load performance
        performanceMonitor.trackCommandExecution(`lazy-load:${name}`, duration);
        
        // Store the loaded command
        this.commands.set(name, command);
        this.loadedCommands.add(name);
        this.commandLoaders.delete(name); // Remove loader
        
        if (duration > 50) {
          console.log(chalk.gray(`Lazy loaded ${name} in ${duration.toFixed(2)}ms`));
        }
        
        return command;
      } catch (error) {
        console.error(chalk.red(`Failed to lazy load ${name}:`), error.message);
        return null;
      }
    }
    
    return null;
  }

  /**
   * Get command metadata without loading
   */
  getMetadata(name) {
    if (this.aliases.has(name)) {
      name = this.aliases.get(name);
    }
    
    // If loaded, get from command
    if (this.commands.has(name)) {
      const cmd = this.commands.get(name);
      return {
        name: cmd.name,
        description: cmd.description,
        category: cmd.category,
        loaded: true
      };
    }
    
    // If lazy, get from metadata
    if (this.commandLoaders.has(name)) {
      return {
        ...this.commandLoaders.get(name).metadata,
        loaded: false
      };
    }
    
    return null;
  }

  /**
   * Export data including lazy-loaded commands
   */
  exportData() {
    const categories = {};
    
    // Add loaded commands
    for (const [name, command] of this.commands) {
      const category = command.category || 'utility';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        name: command.name,
        description: command.description,
        aliases: command.aliases || [],
        loaded: true
      });
    }
    
    // Add lazy commands
    for (const [name, { metadata }] of this.commandLoaders) {
      const category = metadata.category || 'utility';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        name: metadata.name,
        description: metadata.description,
        aliases: metadata.aliases || [],
        loaded: false
      });
    }
    
    return categories;
  }

  /**
   * Get statistics about lazy loading
   */
  getStats() {
    return {
      total: this.commands.size + this.commandLoaders.size,
      loaded: this.loadedCommands.size,
      lazy: this.commandLoaders.size,
      loadedPercentage: (this.loadedCommands.size / (this.commands.size + this.commandLoaders.size) * 100).toFixed(1)
    };
  }
}

// Export singleton instance
export const lazyCommandRegistry = new LazySlashCommandRegistry();