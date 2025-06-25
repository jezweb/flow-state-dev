/**
 * Build command - run project build
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { BaseSlashCommand } from '../base.js';

export default class BuildCommand extends BaseSlashCommand {
  constructor() {
    super('/build', 'Run project build command', {
      aliases: ['/b'],
      category: 'quick-action',
      requiresAuth: false,
      requiresRepo: false,
      usage: '/build [--env <env>] [--watch]',
      examples: [
        'fsd slash "/build"',
        'fsd slash "/build --env production"',
        'fsd slash "/build --watch"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🔨 Building Project\n'));
    
    try {
      // Detect build script
      const buildScript = await this.detectBuildScript();
      
      if (!buildScript) {
        this.log('No build script detected in package.json', 'error');
        console.log(chalk.gray('\nSuggestions:'));
        console.log(chalk.gray('  • Add a "build" script to package.json'));
        console.log(chalk.gray('  • Common build commands: "vite build", "webpack", "tsc"'));
        return;
      }
      
      // Build command based on options
      let command = buildScript;
      
      // Handle environment
      if (options.env) {
        const env = options.env.toLowerCase();
        console.log(chalk.cyan('Environment:'), env);
        
        // Set NODE_ENV
        process.env.NODE_ENV = env === 'prod' || env === 'production' ? 'production' : env;
        
        // Some build tools use different env flags
        if (command.includes('vite') || command.includes('vue-cli')) {
          command = `${command} --mode ${env}`;
        } else if (command.includes('next')) {
          // Next.js uses NODE_ENV automatically
        } else if (command.includes('webpack')) {
          command = `${command} --env ${env}`;
        }
      }
      
      // Handle watch mode
      if (options.watch) {
        console.log(chalk.cyan('Mode:'), 'watch');
        
        // Add watch flag if not already present
        if (!command.includes('watch')) {
          if (command.includes('vite') || command.includes('webpack')) {
            command += ' --watch';
          } else if (command.includes('tsc')) {
            command += ' --watch';
          } else {
            // Try to use a watch script if available
            const watchScript = await this.detectScript('watch');
            if (watchScript) {
              command = watchScript;
            } else {
              console.log(chalk.yellow('⚠️  Watch mode not supported for this build tool'));
            }
          }
        }
      }
      
      // Clean build directory if requested
      if (options.clean) {
        await this.cleanBuildDirectory();
      }
      
      // Show build info
      console.log(chalk.gray(`Running: ${command}\n`));
      
      const startTime = Date.now();
      
      // Execute build
      await this.exec(command, { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(chalk.green(`\n✅ Build completed successfully in ${duration}s`));
      
      // Show build output info
      await this.showBuildInfo();
      
    } catch (error) {
      this.log('Build failed', 'error');
      console.log(chalk.gray('\nCheck the output above for error details'));
      
      if (error.message.includes('missing script')) {
        console.log(chalk.yellow('\n💡 Common build scripts:'));
        console.log(chalk.gray('  • "build": "vite build"'));
        console.log(chalk.gray('  • "build": "webpack --mode production"'));
        console.log(chalk.gray('  • "build": "tsc && vite build"'));
      }
      
      process.exit(1);
    }
  }

  async detectBuildScript() {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!await fs.pathExists(packagePath)) {
      return null;
    }
    
    try {
      const packageJson = await fs.readJson(packagePath);
      const scripts = packageJson.scripts || {};
      
      // Look for build script
      if (scripts.build) {
        return `npm run build`;
      }
      
      // Check for framework-specific build commands
      const buildScripts = ['build:prod', 'build:production', 'compile', 'dist'];
      for (const script of buildScripts) {
        if (scripts[script]) {
          return `npm run ${script}`;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  async detectScript(scriptName) {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    try {
      const packageJson = await fs.readJson(packagePath);
      const scripts = packageJson.scripts || {};
      
      if (scripts[scriptName]) {
        return `npm run ${scriptName}`;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  async cleanBuildDirectory() {
    console.log(chalk.yellow('🧹 Cleaning build directories...'));
    
    const buildDirs = ['dist', 'build', 'out', '.next', '.nuxt'];
    let cleaned = 0;
    
    for (const dir of buildDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (await fs.pathExists(dirPath)) {
        try {
          await fs.remove(dirPath);
          console.log(chalk.gray(`  ✓ Cleaned ${dir}/`));
          cleaned++;
        } catch (error) {
          console.log(chalk.red(`  ✗ Failed to clean ${dir}/`));
        }
      }
    }
    
    if (cleaned > 0) {
      console.log(chalk.green(`✅ Cleaned ${cleaned} build directories\n`));
    }
  }

  async showBuildInfo() {
    // Look for common build output directories
    const outputDirs = ['dist', 'build', 'out', '.next', '.nuxt'];
    
    for (const dir of outputDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (await fs.pathExists(dirPath)) {
        try {
          // Get directory size
          const stats = await this.getDirectoryStats(dirPath);
          
          console.log(chalk.cyan('\n📦 Build Output:'));
          console.log(chalk.gray(`  Directory: ${dir}/`));
          console.log(chalk.gray(`  Files: ${stats.fileCount}`));
          console.log(chalk.gray(`  Size: ${this.formatBytes(stats.totalSize)}`));
          
          // Show largest files
          if (stats.largestFiles.length > 0) {
            console.log(chalk.gray('\n  Largest files:'));
            stats.largestFiles.slice(0, 5).forEach(file => {
              const relativePath = path.relative(dirPath, file.path);
              console.log(chalk.gray(`    ${this.formatBytes(file.size).padEnd(10)} ${relativePath}`));
            });
          }
          
          break; // Only show first build directory found
        } catch (error) {
          // Ignore errors reading directory
        }
      }
    }
  }

  async getDirectoryStats(dirPath) {
    const stats = {
      fileCount: 0,
      totalSize: 0,
      largestFiles: []
    };
    
    const files = await this.walkDirectory(dirPath);
    
    for (const file of files) {
      const fileStat = await fs.stat(file);
      if (fileStat.isFile()) {
        stats.fileCount++;
        stats.totalSize += fileStat.size;
        
        stats.largestFiles.push({
          path: file,
          size: fileStat.size
        });
      }
    }
    
    // Sort by size and keep top 10
    stats.largestFiles.sort((a, b) => b.size - a.size);
    stats.largestFiles = stats.largestFiles.slice(0, 10);
    
    return stats;
  }

  async walkDirectory(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...await this.walkDirectory(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}