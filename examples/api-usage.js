#!/usr/bin/env node

/**
 * Flow State Dev API Usage Examples
 * 
 * This file demonstrates how to use the Flow State Dev API
 * for programmatic project creation and management.
 */

import { FlowStateAPI } from '../lib/api/index.js';
import chalk from 'chalk';

// Create API instance
const api = new FlowStateAPI();

// Example 1: Basic project creation
async function createBasicProject() {
  console.log(chalk.blue('\n=== Example 1: Basic Project Creation ===\n'));
  
  try {
    // Initialize API
    await api.initialize();
    
    // Set up progress tracking
    api.on('progress', (data) => {
      console.log(chalk.gray(`  ${data.message}`));
    });
    
    // Create project
    const result = await api.createProject('example-app', {
      preset: 'vue-minimal',
      skipInstall: true
    });
    
    if (result.success) {
      console.log(chalk.green('\n✓ Project created successfully!'));
      console.log(chalk.gray(`  Path: ${result.projectPath}`));
      console.log(chalk.gray(`  Duration: ${result.duration}ms`));
    }
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
  }
}

// Example 2: Module exploration
async function exploreModules() {
  console.log(chalk.blue('\n=== Example 2: Module Exploration ===\n'));
  
  try {
    await api.initialize();
    
    // Get all UI modules
    const uiModules = await api.getModules({ category: 'ui-library' });
    console.log(chalk.yellow('UI Library Modules:'));
    uiModules.forEach(module => {
      console.log(`  - ${module.name}: ${module.description}`);
    });
    
    // Search for Vue-related modules
    console.log(chalk.yellow('\nVue-related Modules:'));
    const vueModules = await api.modules.search('vue');
    vueModules.forEach(module => {
      console.log(`  - ${module.name} (${module.category})`);
    });
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
  }
}

// Example 3: Stack validation
async function validateStack() {
  console.log(chalk.blue('\n=== Example 3: Stack Validation ===\n'));
  
  try {
    await api.initialize();
    
    // Valid stack
    console.log(chalk.yellow('Checking valid stack:'));
    const validStack = await api.project.validateStack([
      'vue-base', 'vuetify', 'supabase', 'vercel'
    ]);
    console.log(validStack.valid ? 
      chalk.green('  ✓ Stack is valid') : 
      chalk.red('  ✗ Stack has issues')
    );
    
    // Invalid stack (conflicting frameworks)
    console.log(chalk.yellow('\nChecking invalid stack:'));
    const invalidStack = await api.project.validateStack([
      'vue-base', 'react', 'supabase'
    ]);
    if (!invalidStack.valid) {
      console.log(chalk.red('  ✗ Stack has issues:'));
      invalidStack.errors.forEach(error => {
        console.log(chalk.red(`    - ${error}`));
      });
    }
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
  }
}

// Example 4: System diagnostics
async function runDiagnostics() {
  console.log(chalk.blue('\n=== Example 4: System Diagnostics ===\n'));
  
  try {
    await api.initialize();
    
    console.log(chalk.yellow('Running diagnostics...'));
    const results = await api.runDiagnostics();
    
    // Show summary
    const { summary } = results;
    const statusIcon = summary.overallStatus === 'ok' ? '✓' : 
                      summary.overallStatus === 'warning' ? '⚠' : '✗';
    const statusColor = summary.overallStatus === 'ok' ? 'green' : 
                       summary.overallStatus === 'warning' ? 'yellow' : 'red';
    
    console.log(chalk[statusColor](`\n${statusIcon} ${summary.message}`));
    console.log(chalk.gray(`  Errors: ${summary.errors}`));
    console.log(chalk.gray(`  Warnings: ${summary.warnings}`));
    
    // Show details
    console.log(chalk.yellow('\nSystem Details:'));
    console.log(`  Node.js: ${results.node.version}`);
    console.log(`  Platform: ${results.system.platform}`);
    console.log(`  Git: ${results.git.version || 'Not installed'}`);
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
  }
}

// Example 5: Preset management
async function managePresets() {
  console.log(chalk.blue('\n=== Example 5: Preset Management ===\n'));
  
  try {
    await api.initialize();
    
    // List presets
    const presets = await api.getPresets();
    console.log(chalk.yellow('Available Presets:'));
    
    presets.forEach(preset => {
      const icon = preset.recommended ? '⭐' : '  ';
      console.log(`${icon} ${chalk.green(preset.name)} - ${preset.description}`);
      console.log(chalk.gray(`     Modules: ${preset.modules.join(', ')}`));
      console.log(chalk.gray(`     Difficulty: ${preset.difficulty}\n`));
    });
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
  }
}

// Example 6: Memory file creation
async function createMemoryFile() {
  console.log(chalk.blue('\n=== Example 6: Memory File Creation ===\n'));
  
  try {
    await api.initialize();
    
    // Get available templates
    const templates = await api.memory.getTemplates();
    console.log(chalk.yellow('Memory Templates:'));
    templates.forEach(template => {
      console.log(`  - ${template.name}: ${template.description}`);
    });
    
    // Note: Actually creating a memory file would modify the filesystem
    console.log(chalk.gray('\n(Skipping actual file creation in this example)'));
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
  }
}

// Main execution
async function main() {
  console.log(chalk.blue.bold('\nFlow State Dev API Examples'));
  console.log(chalk.gray('=' .repeat(50)));
  
  // Run examples
  await createBasicProject();
  await exploreModules();
  await validateStack();
  await runDiagnostics();
  await managePresets();
  await createMemoryFile();
  
  // Cleanup
  await api.cleanup();
  
  console.log(chalk.blue('\n✨ Examples completed!\n'));
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { createBasicProject, exploreModules, validateStack, runDiagnostics };