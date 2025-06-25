/**
 * Clean command - clean up repository and dependencies
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { BaseSlashCommand } from '../base.js';

export default class CleanCommand extends BaseSlashCommand {
  constructor() {
    super('/clean', 'Clean up build artifacts and dependencies', {
      category: 'utility',
      requiresRepo: true,
      requiresAuth: false,
      usage: '/clean [--deps] [--cache] [--all]',
      examples: [
        'fsd slash "/clean"',
        'fsd slash "/clean --deps"',
        'fsd slash "/clean --all"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🧹 Cleaning Project\n'));
    
    const tasks = [];
    
    // Default: clean build artifacts
    if (!options.deps && !options.cache && !options.all) {
      tasks.push(this.cleanBuildArtifacts());
    }
    
    // Clean dependencies
    if (options.deps || options.all) {
      tasks.push(this.cleanDependencies());
    }
    
    // Clean cache
    if (options.cache || options.all) {
      tasks.push(this.cleanCache());
    }
    
    // Clean all
    if (options.all) {
      tasks.push(this.cleanBuildArtifacts());
      tasks.push(this.cleanGitIgnored());
    }
    
    // Execute all cleaning tasks
    for (const task of tasks) {
      await task;
    }
    
    console.log(chalk.green('\n✅ Cleaning completed successfully'));
  }

  async cleanBuildArtifacts() {
    console.log(chalk.yellow('🗑️  Cleaning build artifacts...'));
    
    const artifactDirs = [
      'dist',
      'build',
      'out',
      '.next',
      '.nuxt',
      'coverage',
      '.nyc_output',
      '.cache',
      '.parcel-cache',
      'tmp',
      'temp'
    ];
    
    let cleaned = 0;
    
    for (const dir of artifactDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (await fs.pathExists(dirPath)) {
        try {
          await fs.remove(dirPath);
          console.log(chalk.gray(`  ✓ Removed ${dir}/`));
          cleaned++;
        } catch (error) {
          console.log(chalk.red(`  ✗ Failed to remove ${dir}/: ${error.message}`));
        }
      }
    }
    
    // Clean common artifact files
    const artifactFiles = [
      '*.log',
      '*.pid',
      '*.seed',
      '*.pid.lock',
      '.DS_Store',
      'Thumbs.db'
    ];
    
    for (const pattern of artifactFiles) {
      try {
        await this.exec(`find . -name "${pattern}" -type f -delete`, { silent: true });
        console.log(chalk.gray(`  ✓ Removed ${pattern} files`));
        cleaned++;
      } catch (error) {
        // Ignore errors for patterns that don't match
      }
    }
    
    if (cleaned === 0) {
      console.log(chalk.gray('  No build artifacts found'));
    }
  }

  async cleanDependencies() {
    console.log(chalk.yellow('\n📦 Cleaning dependencies...'));
    
    const depDirs = ['node_modules', 'bower_components'];
    const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    
    let cleaned = 0;
    
    // Remove dependency directories
    for (const dir of depDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (await fs.pathExists(dirPath)) {
        const shouldClean = await this.confirm(
          `Remove ${dir}/ directory?`,
          false
        );
        
        if (shouldClean) {
          try {
            await fs.remove(dirPath);
            console.log(chalk.gray(`  ✓ Removed ${dir}/`));
            cleaned++;
          } catch (error) {
            console.log(chalk.red(`  ✗ Failed to remove ${dir}/: ${error.message}`));
          }
        }
      }
    }
    
    // Optionally remove lock files
    const shouldCleanLocks = await this.confirm(
      'Remove lock files (package-lock.json, etc.)?',
      false
    );
    
    if (shouldCleanLocks) {
      for (const file of lockFiles) {
        const filePath = path.join(process.cwd(), file);
        if (await fs.pathExists(filePath)) {
          try {
            await fs.remove(filePath);
            console.log(chalk.gray(`  ✓ Removed ${file}`));
            cleaned++;
          } catch (error) {
            console.log(chalk.red(`  ✗ Failed to remove ${file}: ${error.message}`));
          }
        }
      }
    }
    
    if (cleaned > 0) {
      console.log(chalk.yellow('\n💡 Run "npm install" or "yarn" to reinstall dependencies'));
    }
  }

  async cleanCache() {
    console.log(chalk.yellow('\n💾 Cleaning caches...'));
    
    const cacheCommands = [
      { name: 'npm', command: 'npm cache clean --force' },
      { name: 'yarn', command: 'yarn cache clean' },
      { name: 'pnpm', command: 'pnpm store prune' }
    ];
    
    for (const cache of cacheCommands) {
      try {
        // Check if the package manager exists
        await this.exec(`which ${cache.name}`, { silent: true });
        
        console.log(chalk.gray(`  Cleaning ${cache.name} cache...`));
        await this.exec(cache.command, { silent: true });
        console.log(chalk.gray(`  ✓ ${cache.name} cache cleaned`));
      } catch (error) {
        // Package manager not installed, skip
      }
    }
  }

  async cleanGitIgnored() {
    console.log(chalk.yellow('\n🔍 Cleaning git-ignored files...'));
    
    const shouldClean = await this.confirm(
      '⚠️  This will remove ALL untracked files. Are you sure?',
      false
    );
    
    if (!shouldClean) {
      console.log(chalk.gray('  Skipped cleaning git-ignored files'));
      return;
    }
    
    try {
      // Dry run first to show what will be deleted
      const dryRun = await this.exec('git clean -fdn', { silent: true });
      
      if (dryRun.trim()) {
        console.log(chalk.gray('\n  Files to be removed:'));
        dryRun.split('\n').forEach(line => {
          if (line.trim()) {
            console.log(chalk.gray(`    ${line}`));
          }
        });
        
        const confirmDelete = await this.confirm(
          '\n  Proceed with deletion?',
          false
        );
        
        if (confirmDelete) {
          await this.exec('git clean -fd');
          console.log(chalk.gray('  ✓ Removed git-ignored files'));
        }
      } else {
        console.log(chalk.gray('  No git-ignored files to clean'));
      }
    } catch (error) {
      console.log(chalk.red(`  ✗ Failed to clean git-ignored files: ${error.message}`));
    }
  }
}