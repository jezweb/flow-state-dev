/**
 * Commit command - create commits with conventional format
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class CommitCommand extends GitHubSlashCommand {
  constructor() {
    super('/commit', 'Create a commit with conventional format', {
      aliases: ['/c'],
      category: 'quick-action',
      requiresAuth: false,
      usage: '/commit [--type <type>] [--scope <scope>] [--message <message>]',
      examples: [
        'fsd slash "/commit"',
        'fsd slash "/commit --type feat --message \'Add new feature\'"',
        'fsd slash "/commit --type fix --scope auth --message \'Fix login issue\'"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('💾 Creating Commit\n'));
    
    try {
      // Check for staged changes
      const staged = await this.exec('git diff --cached --name-only', { silent: true });
      
      if (!staged.trim()) {
        this.log('No staged changes to commit', 'error');
        console.log(chalk.gray('\nSuggestions:'));
        console.log(chalk.gray('  • Use /add to stage files'));
        console.log(chalk.gray('  • Use "git add ." to stage all changes'));
        return;
      }
      
      // Show staged files summary
      const stagedFiles = staged.split('\n').filter(f => f.trim());
      console.log(chalk.cyan('Staged files:'), `${stagedFiles.length} file(s)`);
      
      if (stagedFiles.length <= 5) {
        stagedFiles.forEach(file => {
          console.log(chalk.gray(`  • ${file}`));
        });
      } else {
        stagedFiles.slice(0, 3).forEach(file => {
          console.log(chalk.gray(`  • ${file}`));
        });
        console.log(chalk.gray(`  ... and ${stagedFiles.length - 3} more`));
      }
      
      console.log();
      
      // Get commit details
      let { type, scope, message } = options;
      
      // Interactive mode if details not provided
      if (!type || !message) {
        const details = await this.promptCommitDetails({ type, scope, message });
        type = details.type;
        scope = details.scope;
        message = details.message;
      }
      
      // Build conventional commit message
      let commitMessage = type;
      if (scope && scope.trim()) {
        commitMessage += `(${scope.trim()})`;
      }
      commitMessage += `: ${message}`;
      
      // Add breaking change or additional details if needed
      if (options.breaking) {
        commitMessage += '\n\nBREAKING CHANGE: ';
        const { breakingDetails } = await this.prompt([{
          type: 'input',
          name: 'breakingDetails',
          message: 'Describe the breaking change:'
        }]);
        commitMessage += breakingDetails;
      }
      
      // Show commit preview
      console.log(chalk.yellow('\n📝 Commit message:'));
      console.log(chalk.white(commitMessage));
      
      // Confirm commit
      const shouldCommit = await this.confirm('\nCreate this commit?', true);
      
      if (!shouldCommit) {
        console.log(chalk.yellow('Commit cancelled'));
        return;
      }
      
      // Create commit
      await this.exec(`git commit -m "${commitMessage}"`);
      
      console.log(chalk.green('\n✅ Commit created successfully!'));
      
      // Show commit info
      const commitInfo = await this.exec('git log -1 --oneline', { silent: true });
      console.log(chalk.gray(`\nCreated: ${commitInfo}`));
      
      // Ask about push
      const { shouldPush } = await this.prompt([{
        type: 'confirm',
        name: 'shouldPush',
        message: 'Push to remote?',
        default: false
      }]);
      
      if (shouldPush) {
        await this.exec('git push');
        console.log(chalk.green('✅ Pushed to remote'));
      }
      
    } catch (error) {
      this.log(`Commit failed: ${error.message}`, 'error');
    }
  }

  async promptCommitDetails({ type, scope, message }) {
    const prompts = [];
    
    if (!type) {
      prompts.push({
        type: 'list',
        name: 'type',
        message: 'Select commit type:',
        choices: [
          { name: '✨ feat     - A new feature', value: 'feat' },
          { name: '🐛 fix      - A bug fix', value: 'fix' },
          { name: '📚 docs     - Documentation changes', value: 'docs' },
          { name: '💎 style    - Code style changes (formatting)', value: 'style' },
          { name: '📦 refactor - Code refactoring', value: 'refactor' },
          { name: '🚀 perf     - Performance improvements', value: 'perf' },
          { name: '✅ test     - Adding or updating tests', value: 'test' },
          { name: '📁 build    - Build system changes', value: 'build' },
          { name: '🔧 ci       - CI/CD changes', value: 'ci' },
          { name: '🔨 chore    - Other changes', value: 'chore' },
          { name: '⏪ revert   - Revert a previous commit', value: 'revert' }
        ],
        pageSize: 11
      });
    }
    
    if (!scope) {
      prompts.push({
        type: 'input',
        name: 'scope',
        message: 'Commit scope (optional, e.g., api, ui, auth):',
        when: () => {
          // Suggest scopes based on changed files
          const suggestions = this.suggestScopes();
          if (suggestions.length > 0) {
            console.log(chalk.gray(`  Suggestions: ${suggestions.join(', ')}`));
          }
          return true;
        }
      });
    }
    
    if (!message) {
      prompts.push({
        type: 'input',
        name: 'message',
        message: 'Commit message (imperative mood, e.g., "add feature"):',
        validate: input => {
          if (!input.trim()) return 'Message is required';
          if (input.length > 72) return 'Message should be under 72 characters';
          if (input.endsWith('.')) return 'Message should not end with a period';
          return true;
        }
      });
    }
    
    const answers = await this.prompt(prompts);
    
    return {
      type: type || answers.type,
      scope: scope || answers.scope,
      message: message || answers.message
    };
  }

  async suggestScopes() {
    try {
      const files = await this.exec('git diff --cached --name-only', { silent: true });
      const suggestions = new Set();
      
      files.split('\n').forEach(file => {
        if (!file.trim()) return;
        
        // Extract potential scopes from file paths
        const parts = file.split('/');
        
        // Common patterns
        if (file.includes('src/components/')) suggestions.add('ui');
        if (file.includes('src/api/') || file.includes('api/')) suggestions.add('api');
        if (file.includes('test/') || file.includes('spec/')) suggestions.add('test');
        if (file.includes('docs/')) suggestions.add('docs');
        if (file.includes('.github/')) suggestions.add('ci');
        if (file.includes('package.json')) suggestions.add('deps');
        if (file.includes('auth')) suggestions.add('auth');
        if (file.includes('db') || file.includes('database')) suggestions.add('db');
        
        // Use top-level directory as scope
        if (parts.length > 1 && !parts[0].includes('.')) {
          suggestions.add(parts[0]);
        }
      });
      
      return Array.from(suggestions).slice(0, 5);
    } catch {
      return [];
    }
  }
}