#!/usr/bin/env node

/**
 * Test environment detector functionality
 */
import chalk from 'chalk';
import { environmentDetector } from '../lib/environment-detector.js';

console.log(chalk.blue('🔍 Testing Environment Detector\n'));

async function runTest() {
  try {
    // Run detection
    console.log(chalk.yellow('Running detection...\n'));
    const results = await environmentDetector.detect({ silent: false });
    
    // Display formatted results
    console.log(chalk.green('\n✅ Detection complete!\n'));
    console.log(environmentDetector.formatResults(results));
    
    // Show suggested tech stack
    console.log(chalk.white('\n💡 Suggested Tech Stack:'));
    const suggestedStack = environmentDetector.getSuggestedTechStack(results);
    console.log(suggestedStack.map(tech => `  • ${tech}`).join('\n'));
    
    // Show raw results for debugging
    console.log(chalk.gray('\n📊 Raw Results:'));
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

runTest();