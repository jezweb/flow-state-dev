/**
 * Add command - stage files for commit
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class AddCommand extends GitHubSlashCommand {
  constructor() {
    super('/add', 'Stage files for commit with smart selection', {
      aliases: ['/a'],
      category: 'quick-action',
      requiresAuth: false,
      usage: '/add [pattern] [--all] [--patch]',
      examples: [
        'fsd slash "/add"',
        'fsd slash "/add src/"',
        'fsd slash "/add *.js"',
        'fsd slash "/add --all"',
        'fsd slash "/add --patch"'
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const pattern = args?.[0];
    
    console.log(chalk.blue('📦 Staging Files\n'));
    
    try {
      // Get current status
      const status = await this.exec('git status --porcelain', { silent: true });
      
      if (!status.trim()) {
        console.log(chalk.gray('No changes to stage'));
        return;
      }
      
      // Parse status into categories
      const files = this.parseGitStatus(status);
      
      if (options.all) {
        // Stage all changes
        await this.stageAll();
      } else if (options.patch) {
        // Interactive patch mode
        await this.stagePatch(pattern);
      } else if (pattern) {
        // Stage by pattern
        await this.stagePattern(pattern);
      } else {
        // Interactive selection
        await this.stageInteractive(files);
      }
      
      // Show final status
      await this.showStagedFiles();
      
    } catch (error) {
      this.log(`Failed to stage files: ${error.message}`, 'error');
    }
  }

  parseGitStatus(status) {
    const files = {
      modified: [],
      untracked: [],
      deleted: [],
      renamed: [],
      staged: []
    };
    
    status.split('\n').forEach(line => {
      if (!line.trim()) return;
      
      const statusCode = line.substring(0, 2);
      const fileName = line.substring(3);
      
      // Already staged
      if (statusCode[0] !== ' ' && statusCode[0] !== '?') {
        files.staged.push({ code: statusCode[0], file: fileName });
      }
      
      // Modified (not staged)
      if (statusCode[1] === 'M') {
        files.modified.push(fileName);
      }
      // Deleted (not staged)
      else if (statusCode[1] === 'D') {
        files.deleted.push(fileName);
      }
      // Renamed
      else if (statusCode[0] === 'R') {
        files.renamed.push(fileName);
      }
      // Untracked
      else if (statusCode === '??') {
        files.untracked.push(fileName);
      }
    });
    
    return files;
  }

  async stageAll() {
    console.log(chalk.yellow('Staging all changes...'));
    
    await this.exec('git add -A');
    console.log(chalk.green('✅ All changes staged'));
  }

  async stagePatch(pattern) {
    console.log(chalk.yellow('Interactive patch mode...'));
    console.log(chalk.gray('Use y/n to stage/skip hunks, q to quit\n'));
    
    const command = pattern ? `git add -p ${pattern}` : 'git add -p';
    
    try {
      await this.exec(command, { interactive: true });
      console.log(chalk.green('\n✅ Patch staging completed'));
    } catch (error) {
      if (error.message.includes('No changes')) {
        console.log(chalk.gray('No changes to stage'));
      } else {
        throw error;
      }
    }
  }

  async stagePattern(pattern) {
    console.log(chalk.yellow(`Staging files matching: ${pattern}`));
    
    try {
      await this.exec(`git add ${pattern}`);
      console.log(chalk.green('✅ Files staged successfully'));
    } catch (error) {
      if (error.message.includes('did not match')) {
        this.log(`No files matched pattern: ${pattern}`, 'error');
        console.log(chalk.gray('\nTip: Use quotes for patterns with spaces'));
      } else {
        throw error;
      }
    }
  }

  async stageInteractive(files) {
    const choices = [];
    
    // Build choices list
    if (files.modified.length > 0) {
      choices.push({ type: 'separator', line: chalk.yellow('Modified Files:') });
      files.modified.forEach(file => {
        choices.push({
          name: `  📝 ${file}`,
          value: file,
          checked: true
        });
      });
    }
    
    if (files.untracked.length > 0) {
      choices.push({ type: 'separator', line: chalk.yellow('\nUntracked Files:') });
      files.untracked.forEach(file => {
        choices.push({
          name: `  ✨ ${file}`,
          value: file,
          checked: false
        });
      });
    }
    
    if (files.deleted.length > 0) {
      choices.push({ type: 'separator', line: chalk.yellow('\nDeleted Files:') });
      files.deleted.forEach(file => {
        choices.push({
          name: `  ❌ ${file}`,
          value: file,
          checked: true
        });
      });
    }
    
    if (choices.length === 0) {
      console.log(chalk.gray('No unstaged changes found'));
      return;
    }
    
    // Add convenience options
    choices.unshift(
      { name: chalk.cyan('📦 Stage all changes'), value: '__all__' },
      { name: chalk.cyan('📝 Stage all modified files'), value: '__modified__' },
      { name: chalk.cyan('✨ Stage all untracked files'), value: '__untracked__' },
      { type: 'separator', line: chalk.gray('─'.repeat(50)) }
    );
    
    const { selected } = await this.prompt([{
      type: 'checkbox',
      name: 'selected',
      message: 'Select files to stage:',
      choices: choices.filter(c => c.type !== 'separator'),
      pageSize: 15
    }]);
    
    if (selected.length === 0) {
      console.log(chalk.yellow('No files selected'));
      return;
    }
    
    // Process selections
    let filesToStage = [];
    
    if (selected.includes('__all__')) {
      await this.stageAll();
      return;
    }
    
    if (selected.includes('__modified__')) {
      filesToStage.push(...files.modified);
    }
    
    if (selected.includes('__untracked__')) {
      filesToStage.push(...files.untracked);
    }
    
    // Add individually selected files
    selected.forEach(file => {
      if (!file.startsWith('__') && !filesToStage.includes(file)) {
        filesToStage.push(file);
      }
    });
    
    // Stage selected files
    if (filesToStage.length > 0) {
      console.log(chalk.yellow('\nStaging selected files...'));
      
      for (const file of filesToStage) {
        try {
          await this.exec(`git add "${file}"`, { silent: true });
          console.log(chalk.gray(`  ✓ ${file}`));
        } catch (error) {
          console.log(chalk.red(`  ✗ ${file}: ${error.message}`));
        }
      }
      
      console.log(chalk.green('\n✅ Files staged successfully'));
    }
  }

  async showStagedFiles() {
    const staged = await this.exec('git diff --cached --name-status', { silent: true });
    
    if (staged.trim()) {
      console.log(chalk.cyan('\n📋 Staged files:'));
      staged.split('\n').forEach(line => {
        if (!line.trim()) return;
        
        const [status, ...fileParts] = line.split('\t');
        const file = fileParts.join('\t');
        
        let icon = '📝';
        if (status === 'A') icon = '✨';
        else if (status === 'D') icon = '❌';
        else if (status === 'R') icon = '🔄';
        
        console.log(chalk.gray(`  ${icon} ${file}`));
      });
      
      // Show stats
      const stats = await this.exec('git diff --cached --stat', { silent: true });
      const summary = stats.split('\n').pop();
      if (summary && summary.includes('changed')) {
        console.log(chalk.gray(`\n  ${summary}`));
      }
    }
  }
}