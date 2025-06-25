#!/usr/bin/env node
/**
 * Command Validator Tool
 * Validates all slash commands meet quality standards
 */
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { commandRegistry } from '../../lib/commands/registry.js';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';

class CommandValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [],
      performance: {}
    };
  }

  async validate() {
    console.log(chalk.cyan('🔍 Flow State Dev - Command Validator\n'));
    
    // Discover commands
    console.log(chalk.gray('Discovering commands...'));
    const discoveryStart = performance.now();
    await commandRegistry.discover();
    const discoveryTime = performance.now() - discoveryStart;
    
    const commands = commandRegistry.getAll();
    this.results.total = commands.length;
    this.results.performance.discovery = discoveryTime;
    
    console.log(chalk.green(`✅ Discovered ${commands.length} commands in ${discoveryTime.toFixed(2)}ms\n`));
    
    // Validate each command
    console.log(chalk.yellow('📋 Validating commands...\n'));
    
    for (const command of commands) {
      await this.validateCommand(command);
    }
    
    // Performance validation
    await this.validatePerformance();
    
    // Migration validation
    await this.validateMigration();
    
    // Generate report
    this.generateReport();
    
    return this.results;
  }

  async validateCommand(command) {
    const issues = [];
    const warnings = [];
    
    try {
      // Structure validation
      if (!command.name) issues.push('Missing name');
      if (!command.description) issues.push('Missing description');
      if (typeof command.execute !== 'function') issues.push('Missing execute method');
      
      // Name validation
      if (command.name && !command.name.startsWith('/')) {
        issues.push('Name must start with /');
      }
      
      // Description quality
      if (command.description) {
        if (command.description.length < 10) {
          warnings.push(`Description too short: ${command.description.length} chars`);
        }
        if (command.description.length > 100) {
          warnings.push(`Description too long: ${command.description.length} chars`);
        }
        if (command.description.toLowerCase().includes('todo')) {
          warnings.push('Description contains TODO');
        }
      }
      
      // Alias validation
      if (command.aliases) {
        if (!Array.isArray(command.aliases)) {
          issues.push('Aliases must be array');
        } else {
          command.aliases.forEach(alias => {
            if (!alias.startsWith('/')) {
              issues.push(`Alias ${alias} must start with /`);
            }
            if (alias === command.name) {
              issues.push(`Alias ${alias} same as command name`);
            }
          });
        }
      }
      
      // Category validation
      const validCategories = [
        'utility', 'quick-action', 'project', 'analysis', 
        'workflow', 'sprint', 'issue', 'estimation', 
        'planning', 'thinking', 'progress', 'epic'
      ];
      
      if (command.category && !validCategories.includes(command.category)) {
        warnings.push(`Unknown category: ${command.category}`);
      }
      
      // Test execution (basic)
      try {
        const start = performance.now();
        await command.execute({ args: [], help: true, raw: `${command.name} --help` });
        const duration = performance.now() - start;
        
        if (duration > 100) {
          warnings.push(`Slow execution: ${duration.toFixed(2)}ms`);
        }
      } catch (error) {
        if (!error.message.includes('process.exit')) {
          warnings.push(`Execution error: ${error.message}`);
        }
      }
      
      // Update results
      if (issues.length === 0) {
        this.results.passed++;
        console.log(chalk.green(`  ✅ ${command.name}`));
      } else {
        this.results.failed++;
        console.log(chalk.red(`  ❌ ${command.name}`));
        this.results.issues.push({ command: command.name, issues, warnings });
      }
      
      if (warnings.length > 0) {
        this.results.warnings += warnings.length;
        console.log(chalk.yellow(`  ⚠️  ${command.name}: ${warnings.length} warnings`));
      }
      
    } catch (error) {
      this.results.failed++;
      console.log(chalk.red(`  💥 ${command.name}: ${error.message}`));
      this.results.issues.push({ 
        command: command.name, 
        issues: [`Validation error: ${error.message}`], 
        warnings: [] 
      });
    }
  }

  async validatePerformance() {
    console.log(chalk.yellow('\n⚡ Performance Validation...\n'));
    
    const executor = new SlashCommandExecutor();
    const targets = {
      discovery: { target: 50, actual: this.results.performance.discovery },
      commandRetrieval: { target: 1, actual: 0 },
      parsing: { target: 1, actual: 0 },
      suggestions: { target: 5, actual: 0 }
    };
    
    // Test command retrieval
    const commands = ['/help', '/status', '/build', '/test'];
    let totalRetrieval = 0;
    
    for (const cmdName of commands) {
      const start = performance.now();
      commandRegistry.get(cmdName);
      totalRetrieval += performance.now() - start;
    }
    targets.commandRetrieval.actual = totalRetrieval / commands.length;
    
    // Test parsing
    const parseTests = ['/help', '/status --flag', '/build --env prod'];
    let totalParsing = 0;
    
    for (const cmd of parseTests) {
      const start = performance.now();
      executor.parseCommand(cmd);
      totalParsing += performance.now() - start;
    }
    targets.parsing.actual = totalParsing / parseTests.length;
    
    // Test suggestions
    const suggestionTests = ['/hel', '/stat', '/buil'];
    let totalSuggestions = 0;
    
    for (const partial of suggestionTests) {
      const start = performance.now();
      commandRegistry.getSuggestions(partial);
      totalSuggestions += performance.now() - start;
    }
    targets.suggestions.actual = totalSuggestions / suggestionTests.length;
    
    // Report performance
    Object.entries(targets).forEach(([metric, data]) => {
      const status = data.actual <= data.target ? '✅' : '❌';
      console.log(`  ${status} ${metric}: ${data.actual.toFixed(2)}ms (target: ${data.target}ms)`);
      
      if (data.actual > data.target) {
        this.results.issues.push({
          command: 'PERFORMANCE',
          issues: [`${metric} exceeds target: ${data.actual.toFixed(2)}ms > ${data.target}ms`],
          warnings: []
        });
        this.results.failed++;
      }
    });
    
    this.results.performance = { ...this.results.performance, ...targets };
  }

  async validateMigration() {
    console.log(chalk.yellow('\n🔄 Migration Validation...\n'));
    
    // Import migration status
    const { getMigrationStatus } = await import('../../lib/slash-commands-wrapper.js');
    const status = getMigrationStatus();
    
    console.log(`  📊 Migration Progress: ${status.percentage}%`);
    console.log(`  📈 Commands Migrated: ${status.migrated.length}/${status.total}`);
    
    if (status.percentage !== 100) {
      this.results.issues.push({
        command: 'MIGRATION',
        issues: [`Migration incomplete: ${status.percentage}%`],
        warnings: []
      });
      this.results.failed++;
      console.log(chalk.red('  ❌ Migration incomplete'));
    } else {
      console.log(chalk.green('  ✅ Migration complete'));
    }
    
    // Check category distribution
    Object.entries(status.byCategory).forEach(([category, count]) => {
      if (count === 0) {
        this.results.issues.push({
          command: 'MIGRATION',
          issues: [],
          warnings: [`Empty category: ${category}`]
        });
        this.results.warnings++;
      }
    });
  }

  generateReport() {
    console.log(chalk.cyan('\n📊 Validation Report\n'));
    
    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    const status = this.results.failed === 0 ? '✅' : '❌';
    
    console.log(`${status} Overall Status: ${passRate}% pass rate`);
    console.log(`📊 Commands: ${this.results.passed} passed, ${this.results.failed} failed, ${this.results.total} total`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    if (this.results.issues.length > 0) {
      console.log(chalk.yellow('\n🔍 Issues Found:\n'));
      
      this.results.issues.forEach(({ command, issues, warnings }) => {
        if (issues.length > 0) {
          console.log(chalk.red(`❌ ${command}:`));
          issues.forEach(issue => console.log(`  - ${issue}`));
        }
        if (warnings.length > 0) {
          console.log(chalk.yellow(`⚠️  ${command}:`));
          warnings.forEach(warning => console.log(`  - ${warning}`));
        }
      });
    }
    
    // Performance summary
    console.log(chalk.cyan('\n⚡ Performance Summary:\n'));
    console.log(`  Command Discovery: ${this.results.performance.discovery?.toFixed(2)}ms`);
    if (this.results.performance.commandRetrieval) {
      console.log(`  Command Retrieval: ${this.results.performance.commandRetrieval.actual.toFixed(4)}ms`);
    }
    
    // Recommendations
    console.log(chalk.cyan('\n💡 Recommendations:\n'));
    
    if (this.results.failed > 0) {
      console.log('  🔧 Fix validation issues before deployment');
    }
    if (this.results.warnings > 5) {
      console.log('  ⚠️  Review warnings to improve code quality');
    }
    if (passRate < 95) {
      console.log('  📈 Aim for 95%+ pass rate');
    } else {
      console.log('  🎉 Excellent validation results!');
    }
  }
}

// Run validator if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new CommandValidator();
  
  try {
    await validator.validate();
    process.exit(validator.results.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('💥 Validator failed:'), error.message);
    process.exit(1);
  }
}

export { CommandValidator };