/**
 * Sync command - synchronize local repository with remote
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class SyncCommand extends GitHubSlashCommand {
  constructor() {
    super('/sync', 'Sync local repository with remote (pull + push)', {
      category: 'utility',
      requiresRepo: true,
      requiresAuth: false,
      usage: '/sync [--rebase] [--force]',
      examples: [
        'fsd slash "/sync"',
        'fsd slash "/sync --rebase"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🔄 Syncing with Remote Repository\n'));
    
    try {
      // Get current branch
      const branch = await this.exec('git branch --show-current', { silent: true });
      console.log(chalk.cyan('Current branch:'), chalk.yellow(branch));
      
      // Check for uncommitted changes
      const status = await this.exec('git status --porcelain', { silent: true });
      if (status.trim()) {
        this.log('Uncommitted changes detected. Please commit or stash them first.', 'error');
        console.log(chalk.gray('\nSuggestions:'));
        console.log(chalk.gray('  • Use /commit to commit changes'));
        console.log(chalk.gray('  • Use "git stash" to temporarily save changes'));
        return;
      }
      
      // Pull from remote
      console.log(chalk.gray('\n📥 Pulling from remote...'));
      const pullCommand = options.rebase ? 'git pull --rebase' : 'git pull';
      
      try {
        const pullResult = await this.exec(pullCommand);
        console.log(chalk.green('✅ Pull successful'));
        
        if (pullResult.includes('Already up to date')) {
          console.log(chalk.gray('  Already up to date with remote'));
        } else {
          console.log(chalk.gray('  Changes pulled from remote'));
        }
      } catch (error) {
        if (error.message.includes('no tracking information')) {
          this.log('No upstream branch configured', 'error');
          console.log(chalk.gray('\nTo set upstream branch:'));
          console.log(chalk.cyan(`  git branch --set-upstream-to=origin/${branch} ${branch}`));
          return;
        }
        throw error;
      }
      
      // Check if there are local commits to push
      const ahead = await this.exec('git rev-list --count @{u}..HEAD', { 
        silent: true, 
        ignoreError: true 
      });
      
      if (ahead && parseInt(ahead) > 0) {
        console.log(chalk.gray('\n📤 Pushing to remote...'));
        
        if (options.force) {
          const shouldForce = await this.confirm(
            '⚠️  Force push will overwrite remote history. Are you sure?',
            false
          );
          
          if (!shouldForce) {
            console.log(chalk.yellow('Push cancelled'));
            return;
          }
          
          await this.exec('git push --force');
          console.log(chalk.yellow('⚠️  Force pushed to remote'));
        } else {
          await this.exec('git push');
          console.log(chalk.green('✅ Push successful'));
        }
        
        console.log(chalk.gray(`  Pushed ${ahead} commit(s) to remote`));
      } else {
        console.log(chalk.gray('\n✨ No local commits to push'));
      }
      
      // Show final status
      console.log(chalk.green('\n✅ Sync completed successfully'));
      
      // Get latest commit info
      const lastCommit = await this.exec('git log -1 --oneline', { silent: true });
      console.log(chalk.gray(`\nLatest commit: ${lastCommit}`));
      
    } catch (error) {
      this.log(`Sync failed: ${error.message}`, 'error');
      
      if (error.message.includes('merge conflict')) {
        console.log(chalk.yellow('\n💡 Merge conflicts detected!'));
        console.log(chalk.gray('Resolve conflicts and then:'));
        console.log(chalk.cyan('  git add <resolved-files>'));
        console.log(chalk.cyan('  git commit'));
        console.log(chalk.cyan('  git push'));
      }
    }
  }
}