/**
 * Test command - run project tests
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { BaseSlashCommand } from '../base.js';

export default class TestCommand extends BaseSlashCommand {
  constructor() {
    super('/test', 'Run project tests', {
      aliases: ['/t'],
      category: 'quick-action',
      requiresAuth: false,
      requiresRepo: false,
      usage: '/test [pattern] [--watch] [--coverage]',
      examples: [
        'fsd slash "/test"',
        'fsd slash "/test user.test.js"',
        'fsd slash "/test --watch"',
        'fsd slash "/test --coverage"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🧪 Running Tests\n'));
    
    try {
      // Detect test runner
      const testRunner = await this.detectTestRunner();
      
      if (!testRunner) {
        this.log('No test script detected in package.json', 'error');
        console.log(chalk.gray('\nSuggestions:'));
        console.log(chalk.gray('  • Add a "test" script to package.json'));
        console.log(chalk.gray('  • Common test commands: "jest", "vitest", "mocha"'));
        return;
      }
      
      console.log(chalk.cyan('Test runner:'), testRunner.name);
      
      // Build test command
      let command = testRunner.command;
      const { args } = options;
      const pattern = args?.[0];
      
      // Add pattern if provided
      if (pattern) {
        console.log(chalk.cyan('Pattern:'), pattern);
        command += ` ${pattern}`;
      }
      
      // Add watch mode
      if (options.watch) {
        console.log(chalk.cyan('Mode:'), 'watch');
        
        if (testRunner.name === 'jest') {
          command += ' --watch';
        } else if (testRunner.name === 'vitest') {
          command += ' --watch';
        } else if (testRunner.name === 'mocha') {
          command += ' --watch';
        } else {
          // Try generic watch
          command += ' --watch';
        }
      }
      
      // Add coverage
      if (options.coverage) {
        console.log(chalk.cyan('Coverage:'), 'enabled');
        
        if (testRunner.name === 'jest') {
          command += ' --coverage';
        } else if (testRunner.name === 'vitest') {
          command += ' --coverage';
        } else if (testRunner.name === 'mocha') {
          // Mocha needs nyc for coverage
          if (await this.hasPackage('nyc')) {
            command = command.replace('mocha', 'nyc mocha');
          } else {
            console.log(chalk.yellow('⚠️  Coverage requires nyc for mocha'));
            console.log(chalk.gray('  Install with: npm install --save-dev nyc'));
          }
        }
      }
      
      // Add common flags
      if (options.verbose) {
        command += ' --verbose';
      }
      
      if (options.silent) {
        command += ' --silent';
      }
      
      if (options.bail) {
        command += ' --bail';
      }
      
      // Show test command
      console.log(chalk.gray(`\nRunning: ${command}\n`));
      
      const startTime = Date.now();
      
      // Execute tests
      await this.exec(command, { 
        stdio: 'inherit',
        env: { 
          ...process.env,
          NODE_ENV: 'test'
        }
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(chalk.green(`\n✅ Tests completed in ${duration}s`));
      
      // Show coverage summary if generated
      if (options.coverage) {
        await this.showCoverageSummary();
      }
      
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(chalk.red(`\n❌ Tests failed in ${duration}s`));
      console.log(chalk.gray('Check the output above for failing tests'));
      
      // Parse test results if possible
      await this.parseTestResults(error.stdout || '');
      
      process.exit(1);
    }
  }

  async detectTestRunner() {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!await fs.pathExists(packagePath)) {
      return null;
    }
    
    try {
      const packageJson = await fs.readJson(packagePath);
      const scripts = packageJson.scripts || {};
      const devDeps = packageJson.devDependencies || {};
      const deps = packageJson.dependencies || {};
      
      // Check test script
      if (scripts.test && scripts.test !== 'echo "Error: no test specified" && exit 1') {
        // Determine test runner from script
        const testScript = scripts.test;
        
        if (testScript.includes('jest')) {
          return { name: 'jest', command: 'npm test' };
        } else if (testScript.includes('vitest')) {
          return { name: 'vitest', command: 'npm test' };
        } else if (testScript.includes('mocha')) {
          return { name: 'mocha', command: 'npm test' };
        } else if (testScript.includes('ava')) {
          return { name: 'ava', command: 'npm test' };
        } else if (testScript.includes('tap')) {
          return { name: 'tap', command: 'npm test' };
        } else {
          return { name: 'unknown', command: 'npm test' };
        }
      }
      
      // Check installed test runners
      const allDeps = { ...devDeps, ...deps };
      
      if (allDeps.jest) {
        return { name: 'jest', command: 'npm run jest' };
      } else if (allDeps.vitest) {
        return { name: 'vitest', command: 'npm run vitest' };
      } else if (allDeps.mocha) {
        return { name: 'mocha', command: 'npm run mocha' };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  async hasPackage(packageName) {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    try {
      const packageJson = await fs.readJson(packagePath);
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      
      return packageName in allDeps;
    } catch {
      return false;
    }
  }

  async showCoverageSummary() {
    // Look for coverage report
    const coverageFiles = [
      'coverage/coverage-summary.json',
      'coverage/lcov-report/index.html',
      '.nyc_output/coverage-summary.json'
    ];
    
    for (const file of coverageFiles) {
      const filePath = path.join(process.cwd(), file);
      if (await fs.pathExists(filePath)) {
        console.log(chalk.cyan('\n📊 Coverage Report:'));
        
        if (file.endsWith('.json')) {
          try {
            const summary = await fs.readJson(filePath);
            const total = summary.total;
            
            if (total) {
              console.log(chalk.gray(`  Statements: ${this.formatPercentage(total.statements.pct)}%`));
              console.log(chalk.gray(`  Branches:   ${this.formatPercentage(total.branches.pct)}%`));
              console.log(chalk.gray(`  Functions:  ${this.formatPercentage(total.functions.pct)}%`));
              console.log(chalk.gray(`  Lines:      ${this.formatPercentage(total.lines.pct)}%`));
            }
          } catch {
            // Ignore parsing errors
          }
        }
        
        if (file.endsWith('.html')) {
          console.log(chalk.gray(`  Report: ${file}`));
          console.log(chalk.gray('  Open in browser to view detailed coverage'));
        }
        
        break;
      }
    }
  }

  formatPercentage(pct) {
    const rounded = Math.round(pct * 10) / 10;
    
    if (rounded >= 80) {
      return chalk.green(rounded);
    } else if (rounded >= 60) {
      return chalk.yellow(rounded);
    } else {
      return chalk.red(rounded);
    }
  }

  async parseTestResults(output) {
    // Try to extract test summary from common formats
    const patterns = [
      // Jest
      /Tests:\s+(\d+)\s+failed.*?(\d+)\s+passed.*?(\d+)\s+total/,
      // Mocha
      /(\d+)\s+passing.*?(\d+)\s+failing/,
      // Vitest
      /Tests\s+(\d+)\s+passed.*?(\d+)\s+failed/
    ];
    
    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) {
        console.log(chalk.cyan('\n📈 Test Summary:'));
        
        if (pattern.source.includes('Jest')) {
          console.log(chalk.red(`  Failed: ${match[1]}`));
          console.log(chalk.green(`  Passed: ${match[2]}`));
          console.log(chalk.gray(`  Total: ${match[3]}`));
        } else if (pattern.source.includes('Mocha')) {
          console.log(chalk.green(`  Passed: ${match[1]}`));
          console.log(chalk.red(`  Failed: ${match[2]}`));
        }
        
        break;
      }
    }
  }
}