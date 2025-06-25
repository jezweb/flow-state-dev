/**
 * Lint command - run code linting
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { BaseSlashCommand } from '../base.js';

export default class LintCommand extends BaseSlashCommand {
  constructor() {
    super('/lint', 'Run code linting and formatting', {
      aliases: ['/l'],
      category: 'quick-action',
      requiresAuth: false,
      requiresRepo: false,
      usage: '/lint [path] [--fix] [--format]',
      examples: [
        'fsd slash "/lint"',
        'fsd slash "/lint src/"',
        'fsd slash "/lint --fix"',
        'fsd slash "/lint --fix --format"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🔍 Running Linter\n'));
    
    try {
      // Detect linter
      const linter = await this.detectLinter();
      
      if (!linter) {
        this.log('No linter detected in project', 'error');
        console.log(chalk.gray('\nSuggestions:'));
        console.log(chalk.gray('  • Add ESLint: npm install --save-dev eslint'));
        console.log(chalk.gray('  • Add a "lint" script to package.json'));
        console.log(chalk.gray('  • Initialize ESLint: npx eslint --init'));
        return;
      }
      
      console.log(chalk.cyan('Linter:'), linter.name);
      
      // Build lint command
      let command = linter.command;
      const { args } = options;
      const targetPath = args?.[0];
      
      // Add target path if provided
      if (targetPath) {
        console.log(chalk.cyan('Target:'), targetPath);
        command += ` ${targetPath}`;
      } else if (linter.defaultTarget) {
        // Use default target if no path specified
        command += ` ${linter.defaultTarget}`;
      }
      
      // Add fix flag
      if (options.fix) {
        console.log(chalk.cyan('Mode:'), 'fix');
        
        if (linter.name === 'eslint') {
          command += ' --fix';
        } else if (linter.name === 'standard') {
          command += ' --fix';
        } else if (linter.name === 'xo') {
          command += ' --fix';
        } else if (linter.name === 'tslint') {
          command += ' --fix';
        } else {
          console.log(chalk.yellow('⚠️  Auto-fix not supported for this linter'));
        }
      }
      
      // Add cache flag for performance
      if (linter.supportsCache && !options.noCache) {
        command += ' --cache';
      }
      
      // Show lint command
      console.log(chalk.gray(`\nRunning: ${command}\n`));
      
      const startTime = Date.now();
      let lintFailed = false;
      
      try {
        const result = await this.exec(command, { 
          stdio: 'inherit',
          env: { ...process.env }
        });
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(chalk.green(`\n✅ Linting passed in ${duration}s`));
        
      } catch (error) {
        lintFailed = true;
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (options.fix) {
          console.log(chalk.yellow(`\n⚠️  Linting completed with issues in ${duration}s`));
          console.log(chalk.gray('Some issues could not be automatically fixed'));
        } else {
          console.log(chalk.red(`\n❌ Linting failed in ${duration}s`));
          console.log(chalk.gray('Run with --fix to auto-fix some issues'));
        }
      }
      
      // Run formatter if requested
      if (options.format && !lintFailed) {
        await this.runFormatter();
      } else if (options.format && lintFailed && options.fix) {
        // Still run formatter after fixing
        await this.runFormatter();
      }
      
      // Show suggestions
      if (lintFailed && !options.fix) {
        console.log(chalk.blue('\n💡 Quick fixes:'));
        console.log(chalk.gray('  • Auto-fix issues: fsd slash "/lint --fix"'));
        console.log(chalk.gray('  • Fix and format: fsd slash "/lint --fix --format"'));
        console.log(chalk.gray('  • Run on specific files: fsd slash "/lint src/specific-file.js"'));
      }
      
      if (lintFailed) {
        process.exit(1);
      }
      
    } catch (error) {
      this.log(`Linting error: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async detectLinter() {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!await fs.pathExists(packagePath)) {
      return null;
    }
    
    try {
      const packageJson = await fs.readJson(packagePath);
      const scripts = packageJson.scripts || {};
      const devDeps = packageJson.devDependencies || {};
      const deps = packageJson.dependencies || {};
      const allDeps = { ...deps, ...devDeps };
      
      // Check for lint script
      if (scripts.lint) {
        // Determine linter from script
        const lintScript = scripts.lint;
        
        if (lintScript.includes('eslint')) {
          return { 
            name: 'eslint', 
            command: 'npm run lint',
            supportsCache: true,
            defaultTarget: this.getDefaultLintTarget(lintScript)
          };
        } else if (lintScript.includes('standard')) {
          return { 
            name: 'standard', 
            command: 'npm run lint',
            defaultTarget: '.'
          };
        } else if (lintScript.includes('xo')) {
          return { 
            name: 'xo', 
            command: 'npm run lint',
            defaultTarget: '.'
          };
        } else if (lintScript.includes('tslint')) {
          return { 
            name: 'tslint', 
            command: 'npm run lint',
            defaultTarget: 'src/**/*.ts'
          };
        } else {
          return { 
            name: 'unknown', 
            command: 'npm run lint',
            defaultTarget: '.'
          };
        }
      }
      
      // Check for installed linters
      if (allDeps.eslint) {
        // Check for ESLint config
        const hasConfig = await this.hasESLintConfig();
        if (hasConfig) {
          return { 
            name: 'eslint',
            command: 'npx eslint',
            supportsCache: true,
            defaultTarget: '.'
          };
        }
      }
      
      if (allDeps.standard) {
        return { 
          name: 'standard',
          command: 'npx standard',
          defaultTarget: '.'
        };
      }
      
      if (allDeps.xo) {
        return { 
          name: 'xo',
          command: 'npx xo',
          defaultTarget: '.'
        };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  getDefaultLintTarget(lintScript) {
    // Extract target from lint script
    const match = lintScript.match(/eslint\s+([^\s-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Common defaults
    if (lintScript.includes('src')) return 'src';
    if (lintScript.includes('lib')) return 'lib';
    if (lintScript.includes('*.js')) return '.';
    
    return '.';
  }

  async hasESLintConfig() {
    const configFiles = [
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      '.eslintrc.yml',
      '.eslintrc.yaml',
      'eslint.config.js'
    ];
    
    for (const file of configFiles) {
      if (await fs.pathExists(path.join(process.cwd(), file))) {
        return true;
      }
    }
    
    // Check package.json for eslintConfig
    try {
      const packageJson = await fs.readJson(path.join(process.cwd(), 'package.json'));
      if (packageJson.eslintConfig) {
        return true;
      }
    } catch {
      // Ignore
    }
    
    return false;
  }

  async runFormatter() {
    console.log(chalk.blue('\n🎨 Running Formatter\n'));
    
    const formatter = await this.detectFormatter();
    
    if (!formatter) {
      console.log(chalk.yellow('⚠️  No formatter detected'));
      console.log(chalk.gray('\nSuggestions:'));
      console.log(chalk.gray('  • Add Prettier: npm install --save-dev prettier'));
      console.log(chalk.gray('  • Add a "format" script to package.json'));
      return;
    }
    
    console.log(chalk.cyan('Formatter:'), formatter.name);
    console.log(chalk.gray(`Running: ${formatter.command}\n`));
    
    try {
      await this.exec(formatter.command, { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      
      console.log(chalk.green('✅ Formatting completed'));
      
    } catch (error) {
      console.log(chalk.yellow('⚠️  Formatting failed'));
      console.log(chalk.gray('Some files may have been formatted'));
    }
  }

  async detectFormatter() {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    try {
      const packageJson = await fs.readJson(packagePath);
      const scripts = packageJson.scripts || {};
      const devDeps = packageJson.devDependencies || {};
      const deps = packageJson.dependencies || {};
      const allDeps = { ...deps, ...devDeps };
      
      // Check for format script
      if (scripts.format) {
        const formatScript = scripts.format;
        
        if (formatScript.includes('prettier')) {
          return { name: 'prettier', command: 'npm run format' };
        } else if (formatScript.includes('standard')) {
          return { name: 'standard', command: 'npm run format' };
        } else {
          return { name: 'unknown', command: 'npm run format' };
        }
      }
      
      // Check for installed formatters
      if (allDeps.prettier) {
        return { 
          name: 'prettier',
          command: 'npx prettier --write .'
        };
      }
      
      return null;
    } catch {
      return null;
    }
  }
}