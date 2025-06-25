/**
 * Push command - push commits to remote repository
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class PushCommand extends GitHubSlashCommand {
  constructor() {
    super('/push', 'Push commits to remote repository', {
      aliases: ['/p'],
      category: 'quick-action',
      requiresAuth: false,
      usage: '/push [--force] [--upstream] [--tags]',
      examples: [
        'fsd slash "/push"',
        'fsd slash "/push --upstream"',
        'fsd slash "/push --force"',
        'fsd slash "/push --tags"'
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🚀 Pushing to Remote\n'));
    
    try {
      // Get current branch
      const branch = await this.exec('git branch --show-current', { silent: true });
      console.log(chalk.cyan('Current branch:'), chalk.yellow(branch));
      
      // Check if we have commits to push
      let hasUpstream = true;
      let ahead = 0;
      let behind = 0;
      
      try {
        ahead = parseInt(await this.exec('git rev-list --count @{u}..HEAD', { silent: true }));
        behind = parseInt(await this.exec('git rev-list --count HEAD..@{u}', { silent: true }));
      } catch (error) {
        if (error.message.includes('no upstream')) {
          hasUpstream = false;
        }
      }
      
      // Handle no upstream scenario
      if (!hasUpstream) {
        console.log(chalk.yellow('\n⚠️  No upstream branch configured'));
        
        const shouldSetUpstream = await this.confirm(
          `Set upstream to origin/${branch}?`,
          true
        );
        
        if (shouldSetUpstream) {
          await this.pushWithUpstream(branch, options);
          return;
        } else {
          console.log(chalk.gray('\nTo set upstream manually:'));
          console.log(chalk.cyan(`  git push --set-upstream origin ${branch}`));
          return;
        }
      }
      
      // Check if we're behind remote
      if (behind > 0) {
        console.log(chalk.yellow(`\n⚠️  Local branch is ${behind} commit(s) behind remote`));
        
        const { action } = await this.prompt([{
          type: 'list',
          name: 'action',
          message: 'How would you like to proceed?',
          choices: [
            { name: 'Pull first (recommended)', value: 'pull' },
            { name: 'Force push (overwrites remote)', value: 'force' },
            { name: 'Cancel', value: 'cancel' }
          ]
        }]);
        
        if (action === 'cancel') {
          console.log(chalk.yellow('Push cancelled'));
          return;
        } else if (action === 'pull') {
          console.log(chalk.gray('\n📥 Pulling from remote...'));
          await this.exec('git pull');
          console.log(chalk.green('✅ Pull completed'));
          
          // Re-check ahead count
          ahead = parseInt(await this.exec('git rev-list --count @{u}..HEAD', { silent: true }));
        } else if (action === 'force') {
          options.force = true;
        }
      }
      
      // Check if we have commits to push
      if (ahead === 0 && !options.tags) {
        console.log(chalk.gray('\n✨ Already up to date with remote'));
        return;
      }
      
      // Show commits to be pushed
      if (ahead > 0) {
        console.log(chalk.cyan(`\n📤 Commits to push: ${ahead}`));
        
        if (ahead <= 5) {
          const commits = await this.exec('git log --oneline @{u}..HEAD', { silent: true });
          console.log(chalk.gray('\nCommits:'));
          commits.split('\n').forEach(commit => {
            if (commit.trim()) {
              console.log(chalk.gray(`  ${commit}`));
            }
          });
        } else {
          const commits = await this.exec('git log --oneline @{u}..HEAD -5', { silent: true });
          console.log(chalk.gray('\nRecent commits:'));
          commits.split('\n').forEach(commit => {
            if (commit.trim()) {
              console.log(chalk.gray(`  ${commit}`));
            }
          });
          console.log(chalk.gray(`  ... and ${ahead - 5} more`));
        }
      }
      
      // Handle force push
      if (options.force) {
        const confirmed = await this.confirm(
          '\n⚠️  Force push will overwrite remote history. Are you sure?',
          false
        );
        
        if (!confirmed) {
          console.log(chalk.yellow('Push cancelled'));
          return;
        }
      }
      
      // Build push command
      let pushCommand = 'git push';
      if (options.force) pushCommand += ' --force-with-lease';
      if (options.tags) pushCommand += ' --tags';
      
      // Execute push
      console.log(chalk.gray(`\n🔄 Executing: ${pushCommand}...`));
      
      const result = await this.exec(pushCommand);
      
      console.log(chalk.green('\n✅ Push completed successfully!'));
      
      // Parse and display push results
      if (result.includes('->')) {
        const lines = result.split('\n').filter(line => line.includes('->'));
        if (lines.length > 0) {
          console.log(chalk.gray('\nPushed:'));
          lines.forEach(line => {
            console.log(chalk.gray(`  ${line.trim()}`));
          });
        }
      }
      
      // Show remote URL
      try {
        const remoteUrl = await this.exec('git remote get-url origin', { silent: true });
        const cleanUrl = remoteUrl.trim().replace(/\.git$/, '');
        
        if (cleanUrl.includes('github.com')) {
          const [, owner, repo] = cleanUrl.match(/github\.com[:/]([^/]+)\/(.+)/) || [];
          if (owner && repo) {
            console.log(chalk.cyan('\n🔗 Repository:'), `https://github.com/${owner}/${repo}`);
            
            // Suggest creating PR if on feature branch
            if (branch !== 'main' && branch !== 'master') {
              console.log(chalk.blue('\n💡 Ready to create a pull request?'));
              console.log(chalk.gray('  Run: fsd slash "/pr create"'));
            }
          }
        }
      } catch {
        // Ignore errors getting remote URL
      }
      
    } catch (error) {
      this.log(`Push failed: ${error.message}`, 'error');
      
      if (error.message.includes('rejected')) {
        console.log(chalk.yellow('\n💡 Push was rejected. Possible reasons:'));
        console.log(chalk.gray('  • Remote has changes you don\'t have locally'));
        console.log(chalk.gray('  • Protected branch restrictions'));
        console.log(chalk.gray('  • Pre-push hooks failed'));
        console.log(chalk.gray('\nTry: git pull --rebase'));
      }
    }
  }

  async pushWithUpstream(branch, options) {
    console.log(chalk.yellow('\n🔗 Setting upstream branch...'));
    
    let pushCommand = `git push --set-upstream origin ${branch}`;
    if (options.force) pushCommand += ' --force-with-lease';
    if (options.tags) pushCommand += ' --tags';
    
    try {
      const result = await this.exec(pushCommand);
      
      console.log(chalk.green('\n✅ Push completed successfully!'));
      console.log(chalk.gray(`  Branch '${branch}' set up to track 'origin/${branch}'`));
      
      // Show remote URL
      const remoteUrl = await this.exec('git remote get-url origin', { silent: true });
      const cleanUrl = remoteUrl.trim().replace(/\.git$/, '');
      
      if (cleanUrl.includes('github.com')) {
        console.log(chalk.cyan('\n🔗 Branch URL:'), `${cleanUrl}/tree/${branch}`);
        
        if (branch !== 'main' && branch !== 'master') {
          console.log(chalk.blue('\n💡 Ready to create a pull request?'));
          console.log(chalk.gray('  Run: fsd slash "/pr create"'));
        }
      }
      
    } catch (error) {
      this.log(`Failed to push with upstream: ${error.message}`, 'error');
    }
  }
}