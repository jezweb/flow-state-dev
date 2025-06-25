/**
 * Module Management CLI Commands
 * 
 * Provides CLI commands for interacting with the module registry
 */
import { enhancedRegistry } from '../modules/enhanced-registry.js';
import { searchEngine } from '../modules/search-engine.js';
import { cacheManager } from '../modules/cache-manager.js';
import chalk from 'chalk';
import Table from 'cli-table3';

export class ModuleCommands {
  constructor(program) {
    this.program = program;
    this.setupCommands();
  }

  setupCommands() {
    // Main modules command
    const modulesCmd = this.program
      .command('modules')
      .description('Manage and explore stack modules')
      .action(() => {
        console.log('Use "fsd modules --help" to see available subcommands');
      });

    // List modules
    modulesCmd
      .command('list')
      .description('List all available modules')
      .option('-t, --type <type>', 'Filter by module type')
      .option('-c, --category <category>', 'Filter by category')
      .option('--json', 'Output as JSON')
      .action(async (options) => {
        await this.listModules(options);
      });

    // Search modules
    modulesCmd
      .command('search <query>')
      .description('Search for modules')
      .option('-t, --type <type>', 'Filter by module type')
      .option('-l, --limit <number>', 'Limit results', '10')
      .option('--json', 'Output as JSON')
      .action(async (query, options) => {
        await this.searchModules(query, options);
      });

    // Get module info
    modulesCmd
      .command('info <module>')
      .description('Show detailed information about a module')
      .option('-v, --verbose', 'Show detailed information')
      .option('--json', 'Output as JSON')
      .action(async (moduleName, options) => {
        await this.showModuleInfo(moduleName, options);
      });

    // Check compatibility
    modulesCmd
      .command('check-compat <moduleA> <moduleB>')
      .description('Check if two modules are compatible')
      .action(async (moduleA, moduleB) => {
        await this.checkCompatibility(moduleA, moduleB);
      });

    // Show registry stats
    modulesCmd
      .command('stats')
      .description('Show module registry statistics')
      .action(async () => {
        await this.showStats();
      });

    // Clear cache
    modulesCmd
      .command('cache-clear')
      .description('Clear module cache')
      .action(async () => {
        await this.clearCache();
      });
  }

  async ensureRegistry() {
    if (!enhancedRegistry.modules || enhancedRegistry.modules.size === 0) {
      console.log(chalk.gray('Initializing module registry...'));
      await enhancedRegistry.initialize();
      
      // Build search index
      const modules = Array.from(enhancedRegistry.modules.values())
        .map(versions => Array.from(versions.values())[0].module);
      searchEngine.buildIndex(modules);
    }
  }

  async listModules(options) {
    await this.ensureRegistry();

    let modules;
    if (options.type) {
      modules = enhancedRegistry.getModulesByType(options.type);
    } else if (options.category) {
      modules = enhancedRegistry.getModulesByCategory(options.category);
    } else {
      modules = Array.from(enhancedRegistry.modules.values())
        .map(versions => {
          const latestVersion = enhancedRegistry.getLatestVersion(
            Array.from(versions.values())[0].module.name
          );
          return versions.get(latestVersion).module;
        });
    }

    if (options.json) {
      console.log(JSON.stringify(modules.map(m => ({
        name: m.name,
        displayName: m.displayName,
        version: m.version,
        type: m.moduleType,
        category: m.category,
        description: m.description
      })), null, 2));
      return;
    }

    console.log(chalk.bold(`\n📦 Available Modules (${modules.length})\n`));

    const table = new Table({
      head: ['Name', 'Type', 'Category', 'Version', 'Description'],
      colWidths: [20, 20, 15, 10, 45],
      wordWrap: true
    });

    modules.forEach(module => {
      table.push([
        chalk.cyan(module.name),
        module.moduleType,
        module.category,
        module.version || '1.0.0',
        module.description || ''
      ]);
    });

    console.log(table.toString());
  }

  async searchModules(query, options) {
    await this.ensureRegistry();

    const results = searchEngine.search(query, {
      type: options.type,
      limit: parseInt(options.limit)
    });

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log(chalk.bold(`\n🔍 Search Results for "${query}" (${results.total} found)\n`));

    if (results.results.length === 0) {
      console.log(chalk.yellow('No modules found matching your search.'));
      
      // Show suggestions
      const suggestions = searchEngine.getSuggestions(query.substring(0, 3));
      if (suggestions.length > 0) {
        console.log(chalk.gray('\nDid you mean:'));
        suggestions.forEach(s => console.log(chalk.gray(`  - ${s.text}`)));
      }
      return;
    }

    const table = new Table({
      head: ['Name', 'Type', 'Score', 'Description'],
      colWidths: [20, 20, 10, 50],
      wordWrap: true
    });

    results.results.forEach(result => {
      const module = result.module;
      table.push([
        chalk.cyan(module.name),
        module.moduleType,
        chalk.green((result.score * 100).toFixed(0) + '%'),
        module.description || ''
      ]);
    });

    console.log(table.toString());
  }

  async showModuleInfo(moduleName, options) {
    await this.ensureRegistry();

    const module = enhancedRegistry.getModule(moduleName);
    if (!module) {
      console.log(chalk.red(`Module "${moduleName}" not found.`));
      
      // Show similar modules
      const similar = await enhancedRegistry.searchModules(moduleName, { limit: 3 });
      if (similar.length > 0) {
        console.log(chalk.gray('\nSimilar modules:'));
        similar.forEach(m => console.log(chalk.gray(`  - ${m.name}`)));
      }
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(module, null, 2));
      return;
    }

    console.log(chalk.bold.cyan(`\n📦 ${module.displayName || module.name}\n`));
    
    console.log(chalk.gray('Basic Information:'));
    console.log(`  Name: ${module.name}`);
    console.log(`  Version: ${module.version || '1.0.0'}`);
    console.log(`  Type: ${module.moduleType}`);
    console.log(`  Category: ${module.category}`);
    console.log(`  Description: ${module.description || 'No description'}`);

    if (module.provides && module.provides.length > 0) {
      console.log(chalk.gray('\nProvides:'));
      module.provides.forEach(p => console.log(`  • ${p}`));
    }

    if (module.requires && module.requires.length > 0) {
      console.log(chalk.gray('\nRequires:'));
      module.requires.forEach(r => console.log(`  • ${r}`));
    }

    if (module.compatibleWith && module.compatibleWith.length > 0) {
      console.log(chalk.gray('\nCompatible with:'));
      module.compatibleWith.forEach(c => console.log(`  • ${c}`));
    }

    if (module.incompatibleWith && module.incompatibleWith.length > 0) {
      console.log(chalk.gray('\nIncompatible with:'));
      module.incompatibleWith.forEach(i => console.log(`  • ${chalk.red(i)}`));
    }

    if (options.verbose) {
      console.log(chalk.gray('\nAdditional Details:'));
      
      if (module.tags && module.tags.length > 0) {
        console.log(`  Tags: ${module.tags.join(', ')}`);
      }
      
      if (module.author) {
        console.log(`  Author: ${module.author}`);
      }
      
      if (module.defaultConfig) {
        console.log(chalk.gray('\nDefault Configuration:'));
        console.log(JSON.stringify(module.defaultConfig, null, 2));
      }
    }
  }

  async checkCompatibility(moduleAName, moduleBName) {
    await this.ensureRegistry();

    const moduleA = enhancedRegistry.getModule(moduleAName);
    const moduleB = enhancedRegistry.getModule(moduleBName);

    if (!moduleA) {
      console.log(chalk.red(`Module "${moduleAName}" not found.`));
      return;
    }

    if (!moduleB) {
      console.log(chalk.red(`Module "${moduleBName}" not found.`));
      return;
    }

    const compatible = moduleA.isCompatibleWith(moduleB);

    console.log(chalk.bold('\n🔍 Compatibility Check\n'));
    console.log(`Module A: ${chalk.cyan(moduleA.displayName || moduleA.name)}`);
    console.log(`Module B: ${chalk.cyan(moduleB.displayName || moduleB.name)}`);
    console.log();

    if (compatible) {
      console.log(chalk.green('✅ These modules are compatible!'));
    } else {
      console.log(chalk.red('❌ These modules are not compatible.'));
      
      // Show reason
      if (moduleA.incompatibleWith?.includes(moduleBName)) {
        console.log(chalk.gray(`\nReason: ${moduleA.name} explicitly lists ${moduleB.name} as incompatible.`));
      } else if (moduleA.moduleType === moduleB.moduleType) {
        console.log(chalk.gray(`\nReason: Both modules are of type "${moduleA.moduleType}" - only one can be used.`));
      }
    }

    // Show alternatives
    if (!compatible && moduleB.moduleType) {
      const alternatives = enhancedRegistry.getCompatibleModules(moduleB.moduleType, {
        modules: [moduleAName]
      });
      
      if (alternatives.length > 0) {
        console.log(chalk.gray('\nCompatible alternatives:'));
        alternatives.slice(0, 3).forEach(alt => {
          console.log(chalk.gray(`  • ${alt.displayName || alt.name}`));
        });
      }
    }
  }

  async showStats() {
    await this.ensureRegistry();

    const stats = enhancedRegistry.getStats();
    const cacheStats = cacheManager.getStats();

    console.log(chalk.bold('\n📊 Module Registry Statistics\n'));

    console.log(chalk.gray('Registry:'));
    console.log(`  Total Modules: ${stats.totalModules}`);
    console.log(`  Total Versions: ${stats.totalVersions}`);
    
    console.log(chalk.gray('\nBy Type:'));
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log(chalk.gray('\nBy Category:'));
    Object.entries(stats.byCategory).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    console.log(chalk.gray('\nCache Performance:'));
    console.log(`  Hit Rate: ${cacheStats.hitRate}`);
    console.log(`  Memory Used: ${cacheStats.memoryUsed}`);
    console.log(`  Entries in Memory: ${cacheStats.entriesInMemory}`);

    if (Object.keys(stats.loadTimes).length > 0) {
      console.log(chalk.gray('\nTop Load Times:'));
      const sorted = Object.entries(stats.loadTimes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      sorted.forEach(([module, time]) => {
        console.log(`  ${module}: ${time.toFixed(2)}ms`);
      });
    }
  }

  async clearCache() {
    console.log(chalk.gray('Clearing module cache...'));
    
    await cacheManager.clear();
    
    console.log(chalk.green('✅ Cache cleared successfully!'));
    
    const stats = cacheManager.getStats();
    console.log(chalk.gray(`\nCache is now empty: ${stats.entriesInMemory} entries`));
  }
}

export function setupModuleCommands(program) {
  new ModuleCommands(program);
}