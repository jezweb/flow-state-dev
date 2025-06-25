/**
 * PR command - create and manage pull requests
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class PRCommand extends GitHubSlashCommand {
  constructor() {
    super('/pr', 'Create or manage pull requests', {
      aliases: ['/pull-request'],
      category: 'quick-action',
      usage: '/pr [create|list|view|merge] [options]',
      examples: [
        'fsd slash "/pr create"',
        'fsd slash "/pr list"',
        'fsd slash "/pr view 123"',
        'fsd slash "/pr merge 123"'
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const subcommand = args?.[0] || 'create';
    
    switch (subcommand) {
      case 'create':
        await this.createPR(options);
        break;
      case 'list':
        await this.listPRs(options);
        break;
      case 'view':
        await this.viewPR(args[1]);
        break;
      case 'merge':
        await this.mergePR(args[1], options);
        break;
      default:
        this.log(`Unknown subcommand: ${subcommand}`, 'error');
        console.log(chalk.gray('Use /pr create, list, view, or merge'));
    }
  }

  async createPR(options) {
    console.log(chalk.blue('📝 Creating Pull Request\n'));
    
    try {
      // Check current branch
      const branch = await this.exec('git branch --show-current', { silent: true });
      
      if (branch === 'main' || branch === 'master') {
        this.log('Cannot create PR from main/master branch', 'error');
        console.log(chalk.gray('Create a feature branch first with: git checkout -b feature-name'));
        return;
      }
      
      console.log(chalk.cyan('Current branch:'), chalk.yellow(branch));
      
      // Check for uncommitted changes
      const status = await this.exec('git status --porcelain', { silent: true });
      if (status.trim()) {
        this.log('Uncommitted changes detected', 'warning');
        const shouldContinue = await this.confirm('Create PR with uncommitted changes?', false);
        if (!shouldContinue) return;
      }
      
      // Push branch if needed
      try {
        await this.exec(`git rev-parse --abbrev-ref ${branch}@{upstream}`, { silent: true });
      } catch {
        console.log(chalk.yellow('\n⬆️  Pushing branch to remote...'));
        await this.exec(`git push -u origin ${branch}`);
        console.log(chalk.green('✅ Branch pushed'));
      }
      
      // Get PR details
      let title = options.title;
      let body = options.body;
      
      if (!title) {
        // Generate title from recent commits
        const commits = await this.exec('git log --oneline -5 --reverse origin/main..HEAD', { 
          silent: true,
          ignoreError: true 
        });
        
        if (commits) {
          console.log(chalk.gray('\nRecent commits:'));
          commits.split('\n').forEach(commit => {
            if (commit.trim()) console.log(chalk.gray(`  ${commit}`));
          });
        }
        
        // Interactive mode
        const { prTitle } = await this.prompt([{
          type: 'input',
          name: 'prTitle',
          message: 'PR title:',
          validate: input => input.trim().length > 0 || 'Title is required'
        }]);
        title = prTitle;
      }
      
      if (!body) {
        const { prBody } = await this.prompt([{
          type: 'editor',
          name: 'prBody',
          message: 'PR description (optional):'
        }]);
        body = prBody;
      }
      
      // Create PR
      console.log(chalk.gray('\n🔄 Creating pull request...'));
      
      let command = `gh pr create --title "${title}"`;
      if (body) command += ` --body "${body}"`;
      if (options.draft) command += ' --draft';
      if (options.base) command += ` --base ${options.base}`;
      
      const result = await this.exec(command);
      
      // Extract PR URL
      const prUrl = result.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
      
      console.log(chalk.green('\n✅ Pull request created successfully!'));
      if (prUrl) {
        console.log(chalk.cyan('PR URL:'), prUrl);
        
        // Optionally open in browser
        if (options.open !== false) {
          await this.exec(`gh pr view --web`, { silent: true });
        }
      }
      
    } catch (error) {
      this.log(`Failed to create PR: ${error.message}`, 'error');
    }
  }

  async listPRs(options) {
    console.log(chalk.blue('📋 Pull Requests\n'));
    
    try {
      let command = 'gh pr list';
      
      if (options.state) command += ` --state ${options.state}`;
      if (options.limit) command += ` --limit ${options.limit}`;
      if (options.author) command += ` --author ${options.author}`;
      if (options.assignee) command += ` --assignee ${options.assignee}`;
      
      const result = await this.exec(command);
      
      if (!result.trim()) {
        console.log(chalk.gray('No pull requests found'));
        return;
      }
      
      // Parse and display PRs
      const lines = result.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          const [number, title, branch] = parts;
          const status = parts[3] || '';
          
          let statusIcon = '📝';
          if (status.includes('MERGED')) statusIcon = '✅';
          else if (status.includes('CLOSED')) statusIcon = '❌';
          else if (status.includes('DRAFT')) statusIcon = '📋';
          
          console.log(`${statusIcon} #${number} ${chalk.white(title)}`);
          console.log(chalk.gray(`   Branch: ${branch} ${status ? `| ${status}` : ''}`));
        }
      });
      
    } catch (error) {
      this.log(`Failed to list PRs: ${error.message}`, 'error');
    }
  }

  async viewPR(prNumber) {
    if (!prNumber) {
      this.log('PR number required', 'error');
      console.log(chalk.gray('Usage: /pr view <number>'));
      return;
    }
    
    console.log(chalk.blue(`📄 Pull Request #${prNumber}\n`));
    
    try {
      const pr = await this.exec(`gh pr view ${prNumber} --json title,body,author,state,reviews,checks`, { 
        silent: true 
      });
      
      const data = JSON.parse(pr);
      
      // Display PR info
      console.log(chalk.cyan('Title:'), data.title);
      console.log(chalk.cyan('Author:'), data.author.login);
      console.log(chalk.cyan('State:'), this.getPRStateColor(data.state));
      
      if (data.body) {
        console.log(chalk.cyan('\nDescription:'));
        console.log(chalk.gray(data.body));
      }
      
      // Display checks
      if (data.checks && data.checks.length > 0) {
        console.log(chalk.cyan('\n🔍 Checks:'));
        data.checks.forEach(check => {
          const icon = check.conclusion === 'SUCCESS' ? '✅' : 
                       check.conclusion === 'FAILURE' ? '❌' : '⏳';
          console.log(`  ${icon} ${check.name}`);
        });
      }
      
      // Display reviews
      if (data.reviews && data.reviews.length > 0) {
        console.log(chalk.cyan('\n👥 Reviews:'));
        data.reviews.forEach(review => {
          const icon = review.state === 'APPROVED' ? '✅' :
                       review.state === 'CHANGES_REQUESTED' ? '🔄' : '💬';
          console.log(`  ${icon} ${review.author.login}: ${review.state}`);
        });
      }
      
      // Show URL
      const prUrl = await this.exec(`gh pr view ${prNumber} --json url -q .url`, { silent: true });
      console.log(chalk.cyan('\nURL:'), prUrl.trim());
      
    } catch (error) {
      this.log(`Failed to view PR: ${error.message}`, 'error');
    }
  }

  async mergePR(prNumber, options) {
    if (!prNumber) {
      this.log('PR number required', 'error');
      console.log(chalk.gray('Usage: /pr merge <number>'));
      return;
    }
    
    console.log(chalk.blue(`🔀 Merging Pull Request #${prNumber}\n`));
    
    try {
      // Get PR details
      const pr = await this.exec(`gh pr view ${prNumber} --json title,mergeable,reviews`, { 
        silent: true 
      });
      const data = JSON.parse(pr);
      
      console.log(chalk.cyan('Title:'), data.title);
      
      // Check if mergeable
      if (data.mergeable === 'CONFLICTING') {
        this.log('PR has merge conflicts', 'error');
        console.log(chalk.gray('Resolve conflicts before merging'));
        return;
      }
      
      // Confirm merge
      const shouldMerge = await this.confirm(
        `Merge PR #${prNumber}?`,
        true
      );
      
      if (!shouldMerge) {
        console.log(chalk.yellow('Merge cancelled'));
        return;
      }
      
      // Determine merge method
      let mergeMethod = options.squash ? '--squash' :
                       options.rebase ? '--rebase' : '--merge';
      
      if (!options.squash && !options.rebase && !options.merge) {
        const { method } = await this.prompt([{
          type: 'list',
          name: 'method',
          message: 'Merge method:',
          choices: [
            { name: 'Create a merge commit', value: '--merge' },
            { name: 'Squash and merge', value: '--squash' },
            { name: 'Rebase and merge', value: '--rebase' }
          ],
          default: '--squash'
        }]);
        mergeMethod = method;
      }
      
      // Merge PR
      console.log(chalk.gray('\n🔄 Merging...'));
      await this.exec(`gh pr merge ${prNumber} ${mergeMethod} --delete-branch`);
      
      console.log(chalk.green(`\n✅ PR #${prNumber} merged successfully!`));
      
      // Update local repository
      const { updateLocal } = await this.prompt([{
        type: 'confirm',
        name: 'updateLocal',
        message: 'Update local repository?',
        default: true
      }]);
      
      if (updateLocal) {
        await this.exec('git checkout main || git checkout master');
        await this.exec('git pull');
        console.log(chalk.green('✅ Local repository updated'));
      }
      
    } catch (error) {
      this.log(`Failed to merge PR: ${error.message}`, 'error');
    }
  }

  getPRStateColor(state) {
    switch (state) {
      case 'OPEN': return chalk.green(state);
      case 'CLOSED': return chalk.red(state);
      case 'MERGED': return chalk.magenta(state);
      default: return state;
    }
  }
}