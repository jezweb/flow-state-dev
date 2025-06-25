/**
 * Status command - Enhanced git status with categorization
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class StatusCommand extends GitHubSlashCommand {
  constructor() {
    super('/status', 'Enhanced git status with file categorization', {
      aliases: ['/s'],
      category: 'quick-action',
      usage: '/status',
      examples: [
        'fsd slash "/status"',
        'fsd slash "/s"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('📊 Repository Status\n'));
    
    // Get branch info
    const branch = await this.getCurrentBranch();
    const upstream = await this.getUpstream(branch);
    
    // Display branch info
    console.log(chalk.cyan('Branch:'), chalk.yellow(branch));
    if (upstream) {
      console.log(chalk.cyan('Tracking:'), upstream);
    }
    
    // Get last commit
    const lastCommit = await this.getLastCommit();
    if (lastCommit) {
      console.log(chalk.cyan('Last commit:'), lastCommit);
    }
    
    console.log(''); // Empty line
    
    // Get file status
    const status = await this.getStatus();
    
    if (status.clean) {
      console.log(chalk.green('✨ Working tree clean'));
      return;
    }
    
    // Display categorized files
    if (status.staged.length > 0) {
      console.log(chalk.green('Staged changes:'));
      for (const file of status.staged) {
        console.log(chalk.green(`  ✓ ${file.path}`), chalk.gray(`(${file.status})`));
      }
      console.log('');
    }
    
    if (status.modified.length > 0) {
      console.log(chalk.yellow('Modified files:'));
      for (const file of status.modified) {
        console.log(chalk.yellow(`  ● ${file}`));
      }
      console.log('');
    }
    
    if (status.untracked.length > 0) {
      console.log(chalk.red('Untracked files:'));
      for (const file of status.untracked) {
        console.log(chalk.red(`  ? ${file}`));
      }
      console.log('');
    }
    
    if (status.deleted.length > 0) {
      console.log(chalk.red('Deleted files:'));
      for (const file of status.deleted) {
        console.log(chalk.red(`  ✗ ${file}`));
      }
      console.log('');
    }
    
    // Summary
    const totalChanges = status.staged.length + status.modified.length + 
                        status.untracked.length + status.deleted.length;
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.blue(`Total: ${totalChanges} changes`));
  }

  async getCurrentBranch() {
    try {
      return await this.exec('git branch --show-current', { silent: true });
    } catch (error) {
      return 'unknown';
    }
  }

  async getUpstream(branch) {
    try {
      return await this.exec(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { 
        silent: true,
        ignoreError: true 
      });
    } catch (error) {
      return null;
    }
  }

  async getLastCommit() {
    try {
      const hash = await this.exec('git log -1 --format=%h', { silent: true });
      const message = await this.exec('git log -1 --format=%s', { silent: true });
      const author = await this.exec('git log -1 --format=%an', { silent: true });
      const date = await this.exec('git log -1 --format=%ar', { silent: true });
      
      return `${hash} - ${message} (${author}, ${date})`;
    } catch (error) {
      return null;
    }
  }

  async getStatus() {
    const status = {
      clean: false,
      staged: [],
      modified: [],
      untracked: [],
      deleted: []
    };
    
    try {
      // Get porcelain status
      const output = await this.exec('git status --porcelain', { silent: true });
      
      if (!output || output.trim() === '') {
        status.clean = true;
        return status;
      }
      
      const lines = output.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const statusCode = line.substring(0, 2);
        const file = line.substring(3);
        
        // Staged files
        if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
          status.staged.push({
            path: file,
            status: this.getStatusDescription(statusCode[0])
          });
        }
        
        // Modified files (not staged)
        if (statusCode[1] === 'M') {
          status.modified.push(file);
        }
        
        // Deleted files (not staged)
        if (statusCode[1] === 'D') {
          status.deleted.push(file);
        }
        
        // Untracked files
        if (statusCode === '??') {
          status.untracked.push(file);
        }
      }
      
    } catch (error) {
      this.log('Failed to get git status', 'error');
    }
    
    return status;
  }

  getStatusDescription(code) {
    const descriptions = {
      'M': 'modified',
      'A': 'added',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied',
      'U': 'updated'
    };
    
    return descriptions[code] || 'changed';
  }
}