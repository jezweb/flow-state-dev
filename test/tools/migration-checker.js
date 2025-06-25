#!/usr/bin/env node
/**
 * Migration Checker Tool
 * Verifies 100% migration completion and validates system integrity
 */
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { commandRegistry } from '../../lib/commands/registry.js';
import { getMigrationStatus } from '../../lib/slash-commands-wrapper.js';

class MigrationChecker {
  constructor() {
    this.results = {
      migrationComplete: false,
      commandsDiscovered: 0,
      performanceTargets: {},
      structureValid: false,
      issues: [],
      warnings: []
    };
  }

  async check() {
    console.log(chalk.cyan('🔄 Flow State Dev - Migration Checker\n'));
    
    await this.checkCommandDiscovery();
    await this.checkMigrationStatus();
    await this.checkPerformance();
    await this.checkStructure();
    
    this.generateReport();
    
    return this.results;
  }
  
  async getCommandCount() {
    await commandRegistry.discover();
    return commandRegistry.getAll().length;
  }

  async checkMigrationStatus() {
    console.log(chalk.yellow('📊 Checking Migration Status...\n'));
    
    const status = getMigrationStatus();
    
    console.log(`  Total Commands (with aliases): ${status.migrated.length}`);
    console.log(`  Expected Commands: ${status.total}`);
    console.log(`  Migration Progress: ${status.percentage}%`);
    
    // Check if we have a reasonable number of commands (aliases inflate the count)
    const actualCommands = this.results.commandsDiscovered || await this.getCommandCount();
    
    if (actualCommands >= 25 && status.percentage >= 100) {
      console.log(chalk.green('  ✅ Migration Complete!\n'));
      this.results.migrationComplete = true;
    } else {
      console.log(chalk.red('  ❌ Migration Incomplete\n'));
      this.results.issues.push(`Migration: ${actualCommands} commands discovered, ${status.percentage}% progress`);
    }
    
    // Check category distribution
    console.log(chalk.gray('  Category Breakdown:'));
    Object.entries(status.byCategory).forEach(([category, count]) => {
      console.log(chalk.gray(`    ${category}: ${count} commands`));
      if (count === 0 && category !== 'total') {
        this.results.warnings.push(`Empty category: ${category}`);
      }
    });
    
    console.log();
  }

  async checkCommandDiscovery() {
    console.log(chalk.yellow('🔍 Testing Command Discovery...\n'));
    
    const discoveryStart = performance.now();
    await commandRegistry.discover();
    const discoveryTime = performance.now() - discoveryStart;
    
    const commands = commandRegistry.getAll();
    this.results.commandsDiscovered = commands.length;
    
    console.log(`  Commands Discovered: ${commands.length}`);
    console.log(`  Discovery Time: ${discoveryTime.toFixed(2)}ms`);
    
    if (discoveryTime < 50) {
      console.log(chalk.green('  ✅ Discovery Performance Good'));
    } else {
      console.log(chalk.yellow('  ⚠️  Discovery Slower Than Target'));
      this.results.warnings.push(`Slow discovery: ${discoveryTime.toFixed(2)}ms`);
    }
    
    // Check for expected minimum commands
    if (commands.length >= 25) {
      console.log(chalk.green('  ✅ Sufficient Commands Loaded'));
    } else {
      console.log(chalk.red('  ❌ Too Few Commands Loaded'));
      this.results.issues.push(`Only ${commands.length} commands discovered, expected 25+`);
    }
    
    console.log();
  }

  async checkPerformance() {
    console.log(chalk.yellow('⚡ Performance Validation...\n'));
    
    const targets = {
      'Command Retrieval': { target: 1, test: this.testCommandRetrieval.bind(this) },
      'Suggestion Generation': { target: 5, test: this.testSuggestionGeneration.bind(this) },
      'Command Parsing': { target: 1, test: this.testCommandParsing.bind(this) }
    };
    
    for (const [metric, config] of Object.entries(targets)) {
      const result = await config.test();
      this.results.performanceTargets[metric] = result;
      
      const status = result.actual <= config.target ? '✅' : '❌';
      console.log(`  ${status} ${metric}: ${result.actual.toFixed(4)}ms (target: ${config.target}ms)`);
      
      if (result.actual > config.target) {
        this.results.issues.push(`${metric} exceeds target: ${result.actual.toFixed(2)}ms > ${config.target}ms`);
      }
    }
    
    console.log();
  }

  async testCommandRetrieval() {
    const commands = ['/help', '/status', '/build', '/test', '/commit'];
    let totalTime = 0;
    
    for (const cmdName of commands) {
      const start = performance.now();
      commandRegistry.get(cmdName);
      totalTime += performance.now() - start;
    }
    
    return { actual: totalTime / commands.length, target: 1 };
  }

  async testSuggestionGeneration() {
    const partials = ['/hel', '/stat', '/buil', '/tes', '/commi'];
    let totalTime = 0;
    
    for (const partial of partials) {
      const start = performance.now();
      commandRegistry.getSuggestions(partial);
      totalTime += performance.now() - start;
    }
    
    return { actual: totalTime / partials.length, target: 5 };
  }

  async testCommandParsing() {
    const { SlashCommandExecutor } = await import('../../lib/commands/executor.js');
    const executor = new SlashCommandExecutor();
    
    const commands = [
      '/help',
      '/status --porcelain',
      '/build --watch --env production',
      '/commit "test message" --no-verify'
    ];
    
    let totalTime = 0;
    
    for (const cmd of commands) {
      const start = performance.now();
      executor.parseCommand(cmd);
      totalTime += performance.now() - start;
    }
    
    return { actual: totalTime / commands.length, target: 1 };
  }

  async checkStructure() {
    console.log(chalk.yellow('🏗️  Structure Validation...\n'));
    
    const commands = commandRegistry.getAll();
    let validCommands = 0;
    
    for (const command of commands) {
      const issues = [];
      
      if (!command.name) issues.push('Missing name');
      if (!command.description) issues.push('Missing description');
      if (typeof command.execute !== 'function') issues.push('Missing execute method');
      if (!command.name?.startsWith('/')) issues.push('Name must start with /');
      
      if (issues.length === 0) {
        validCommands++;
      } else {
        this.results.issues.push(`Invalid command ${command.name || 'unknown'}: ${issues.join(', ')}`);
      }
    }
    
    const validPercentage = ((validCommands / commands.length) * 100).toFixed(1);
    console.log(`  Valid Commands: ${validCommands}/${commands.length} (${validPercentage}%)`);
    
    if (validPercentage >= 95) {
      console.log(chalk.green('  ✅ Structure Validation Passed'));
      this.results.structureValid = true;
    } else {
      console.log(chalk.red('  ❌ Structure Validation Failed'));
      this.results.structureValid = false;
    }
    
    // Check categories
    const categories = commandRegistry.getCategories();
    console.log(`  Categories: ${categories.length}`);
    console.log(chalk.gray(`    ${categories.join(', ')}`));
    
    console.log();
  }

  generateReport() {
    console.log(chalk.cyan('📋 Migration Check Summary\n'));
    
    const overallStatus = this.results.migrationComplete && 
                         this.results.structureValid && 
                         this.results.issues.length === 0;
    
    console.log(`${overallStatus ? '✅' : '❌'} Overall Status: ${overallStatus ? 'PASSED' : 'FAILED'}`);
    console.log(`🔄 Migration: ${this.results.migrationComplete ? 'Complete' : 'Incomplete'}`);
    console.log(`🏗️  Structure: ${this.results.structureValid ? 'Valid' : 'Invalid'}`);
    console.log(`📊 Commands: ${this.results.commandsDiscovered} discovered`);
    console.log(`⚠️  Issues: ${this.results.issues.length}`);
    console.log(`🔔 Warnings: ${this.results.warnings.length}`);
    
    if (this.results.issues.length > 0) {
      console.log(chalk.red('\n❌ Issues:'));
      this.results.issues.forEach(issue => {
        console.log(chalk.red(`  • ${issue}`));
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      this.results.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }
    
    // Performance summary
    console.log(chalk.cyan('\n⚡ Performance Results:'));
    Object.entries(this.results.performanceTargets).forEach(([metric, result]) => {
      const status = result.actual <= result.target ? '✅' : '❌';
      console.log(`  ${status} ${metric}: ${result.actual.toFixed(4)}ms`);
    });
    
    if (overallStatus) {
      console.log(chalk.green('\n🎉 Migration validation completed successfully!'));
      console.log(chalk.gray('The modular slash command system is ready for production.'));
    } else {
      console.log(chalk.red('\n🚨 Migration validation failed!'));
      console.log(chalk.gray('Please fix the issues above before proceeding.'));
    }
  }
}

// Run checker if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new MigrationChecker();
  
  try {
    await checker.check();
    process.exit(checker.results.issues.length === 0 ? 0 : 1);
  } catch (error) {
    console.error(chalk.red('💥 Migration check failed:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

export { MigrationChecker };