#!/usr/bin/env node

/**
 * Run all slash command integration tests with summary report
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

const tests = [
  {
    name: 'Command Discovery',
    file: 'command-discovery.test.js',
    description: 'Tests automatic command discovery and registration'
  },
  {
    name: 'Command Categories',
    file: 'command-categories.test.js',
    description: 'Tests each category of commands'
  },
  {
    name: 'Error Handling',
    file: 'command-error-handling.test.js',
    description: 'Tests error scenarios and edge cases'
  },
  {
    name: 'Performance',
    file: 'command-performance.test.js',
    description: 'Tests performance metrics and benchmarks'
  },
  {
    name: 'Full Integration',
    file: 'slash-commands.test.js',
    description: 'Comprehensive integration test suite'
  }
];

async function runTest(testFile) {
  return new Promise((resolve) => {
    const child = spawn('npm', ['test', '--', join(__dirname, testFile)], {
      stdio: 'pipe',
      env: { ...process.env, NODE_OPTIONS: '--expose-gc' }
    });
    
    let output = '';
    let passed = false;
    let testCount = 0;
    let failCount = 0;
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      const lines = data.toString().split('\n');
      
      lines.forEach(line => {
        if (line.includes('✓')) testCount++;
        if (line.includes('✗') || line.includes('failed')) failCount++;
        if (line.includes('All tests passed')) passed = true;
      });
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        passed,
        output,
        testCount,
        failCount
      });
    });
  });
}

async function main() {
  console.log(chalk.bold.blue('\n🧪 Running Slash Command Integration Tests\n'));
  
  const results = [];
  const startTime = Date.now();
  
  for (const test of tests) {
    console.log(chalk.yellow(`\n📋 ${test.name}`));
    console.log(chalk.gray(`   ${test.description}`));
    console.log(chalk.gray(`   Running ${test.file}...\n`));
    
    const result = await runTest(test.file);
    results.push({ ...test, ...result });
    
    if (result.success) {
      console.log(chalk.green(`   ✅ PASSED (${result.testCount} tests)`));
    } else {
      console.log(chalk.red(`   ❌ FAILED (${result.failCount} failures)`));
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log(chalk.bold.blue('\n\n📊 Test Summary\n'));
  console.log(chalk.gray('─'.repeat(50)));
  
  const totalTests = results.reduce((sum, r) => sum + r.testCount, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failCount, 0);
  const failedSuites = results.filter(r => !r.success);
  
  results.forEach(result => {
    const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    console.log(`${status} ${result.name.padEnd(20)} ${result.testCount} tests`);
  });
  
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`\nTotal Tests: ${totalTests}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Duration: ${duration}s`);
  
  if (failedSuites.length > 0) {
    console.log(chalk.red(`\n❌ ${failedSuites.length} test suite(s) failed`));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All integration tests passed!'));
  }
}

main().catch(console.error);