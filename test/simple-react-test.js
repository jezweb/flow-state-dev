#!/usr/bin/env node
/**
 * Simple React module test
 */
import { ModuleRegistry } from '../lib/modules/registry.js';
import chalk from 'chalk';

async function testReactModule() {
  console.log(chalk.blue('\n🧪 Simple React Module Test\n'));
  
  try {
    // Initialize registry
    const registry = new ModuleRegistry();
    await registry.discover();
    
    // Check if React module was loaded
    const reactModule = registry.getModule('react');
    
    if (!reactModule) {
      console.error(chalk.red('❌ React module not found in registry'));
      return false;
    }
    
    console.log(chalk.green('✓ React module loaded successfully'));
    console.log(chalk.gray(`  - Name: ${reactModule.name}`));
    console.log(chalk.gray(`  - Version: ${reactModule.version}`));
    console.log(chalk.gray(`  - Category: ${reactModule.category}`));
    console.log(chalk.gray(`  - Module Type: ${reactModule.moduleType}`));
    console.log(chalk.gray(`  - Provides: ${reactModule.provides.join(', ')}`));
    
    // Test dependencies
    const deps = reactModule.getDependencies({});
    console.log(chalk.blue('\n📦 Dependencies:'));
    Object.entries(deps).forEach(([name, version]) => {
      console.log(chalk.gray(`  ${name}: ${version}`));
    });
    
    const devDeps = reactModule.getDevDependencies({});
    console.log(chalk.blue('\n🔧 Dev Dependencies:'));
    Object.entries(devDeps).forEach(([name, version]) => {
      console.log(chalk.gray(`  ${name}: ${version}`));
    });
    
    console.log(chalk.green('\n✅ React module test passed!'));
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error);
    return false;
  }
}

// Run test
testReactModule().then(success => {
  process.exit(success ? 0 : 1);
});