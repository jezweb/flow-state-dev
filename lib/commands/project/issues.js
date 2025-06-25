/**
 * Issues command - manage GitHub issues
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class IssuesCommand extends GitHubSlashCommand {
  constructor() {
    super('/issues', 'List and manage GitHub issues', {
      aliases: ['/i'],
      category: 'project',
      usage: '/issues [list|create|view|close] [options]',
      examples: [
        'fsd slash "/issues"',
        'fsd slash "/issues list --state open"',
        'fsd slash "/issues create"',
        'fsd slash "/issues view 123"',
        'fsd slash "/issues close 123"'
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const subcommand = args?.[0] || 'list';
    
    switch (subcommand) {
      case 'list':
        await this.listIssues(options);
        break;
      case 'create':
        await this.createIssue(options);
        break;
      case 'view':
        await this.viewIssue(args[1]);
        break;
      case 'close':
        await this.closeIssue(args[1], options);
        break;
      default:
        // If first arg is a number, view that issue
        if (/^\d+$/.test(subcommand)) {
          await this.viewIssue(subcommand);
        } else {
          this.log(`Unknown subcommand: ${subcommand}`, 'error');
          console.log(chalk.gray('Use /issues list, create, view, or close'));
        }
    }
  }

  async listIssues(options) {
    console.log(chalk.blue('📋 GitHub Issues\n'));
    
    try {
      let command = 'gh issue list';
      
      // Add filters
      if (options.state) command += ` --state ${options.state}`;
      if (options.label) command += ` --label "${options.label}"`;
      if (options.assignee) command += ` --assignee ${options.assignee}`;
      if (options.author) command += ` --author ${options.author}`;
      if (options.milestone) command += ` --milestone "${options.milestone}"`;
      if (options.limit) command += ` --limit ${options.limit}`;
      else command += ' --limit 20';
      
      const result = await this.exec(command);
      
      if (!result || !result.trim()) {
        console.log(chalk.gray('No issues found'));
        return;
      }
      
      // Parse and display issues
      const lines = result.split('\n').filter(line => line.trim());
      const issues = [];
      
      lines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const [number, state, title, ...rest] = parts;
          const labels = rest.length > 0 && rest[0] ? rest[0] : '';
          const updatedAt = rest.length > 1 ? rest[1] : '';
          
          issues.push({ number, title, labels, state, updatedAt });
        }
      });
      
      // Group by state if showing all
      if (!options.state || options.state === 'all') {
        const open = issues.filter(i => i.state === 'OPEN');
        const closed = issues.filter(i => i.state === 'CLOSED');
        
        if (open.length > 0) {
          console.log(chalk.green('📂 Open Issues:'));
          this.displayIssueList(open);
        }
        
        if (closed.length > 0) {
          console.log(chalk.gray('\n📁 Closed Issues:'));
          this.displayIssueList(closed);
        }
      } else {
        this.displayIssueList(issues);
      }
      
      // Show summary
      console.log(chalk.gray(`\n─`.repeat(50)));
      console.log(chalk.blue(`Total: ${issues.length} issue(s)`));
      
      // Show tips
      console.log(chalk.gray('\n💡 Tips:'));
      console.log(chalk.gray('  • View details: /issues view <number>'));
      console.log(chalk.gray('  • Create new: /issues create'));
      console.log(chalk.gray('  • Filter by label: /issues --label bug'));
      
    } catch (error) {
      this.log(`Failed to list issues: ${error.message}`, 'error');
      console.error(error.stack);
    }
  }

  displayIssueList(issues) {
    issues.forEach(issue => {
      let icon = '🟢';
      if (issue.state === 'CLOSED') icon = '⚫';
      
      console.log(`\n${icon} #${issue.number} ${chalk.white(issue.title)}`);
      
      if (issue.labels && typeof issue.labels === 'string' && issue.labels.trim()) {
        const labels = issue.labels.split(', ');
        const labelStr = labels.map(l => chalk.bgGray.white(` ${l} `)).join(' ');
        console.log(`   ${labelStr}`);
      }
      
      if (issue.updatedAt) {
        console.log(chalk.gray(`   Updated: ${issue.updatedAt}`));
      }
    });
  }

  async createIssue(options) {
    console.log(chalk.blue('✨ Create New Issue\n'));
    
    try {
      let title = options.title;
      let body = options.body;
      
      // Interactive mode if not provided
      if (!title) {
        const { issueTitle } = await this.prompt([{
          type: 'input',
          name: 'issueTitle',
          message: 'Issue title:',
          validate: input => input.trim().length > 0 || 'Title is required'
        }]);
        title = issueTitle;
      }
      
      if (!body) {
        const { issueBody } = await this.prompt([{
          type: 'editor',
          name: 'issueBody',
          message: 'Issue description (optional):'
        }]);
        body = issueBody;
      }
      
      // Build command
      let command = `gh issue create --title "${title}"`;
      if (body) command += ` --body "${body}"`;
      
      // Add optional fields
      if (options.label) {
        const labels = Array.isArray(options.label) ? options.label.join(',') : options.label;
        command += ` --label "${labels}"`;
      }
      
      if (options.assignee) {
        command += ` --assignee ${options.assignee}`;
      }
      
      if (options.milestone) {
        command += ` --milestone "${options.milestone}"`;
      }
      
      if (options.project) {
        command += ` --project "${options.project}"`;
      }
      
      // Create issue
      console.log(chalk.gray('Creating issue...'));
      const result = await this.exec(command);
      
      // Extract issue number and URL
      const issueUrl = result.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
      const issueNumber = result.match(/#(\d+)/)?.[1];
      
      console.log(chalk.green('\n✅ Issue created successfully!'));
      if (issueNumber) {
        console.log(chalk.cyan('Issue:'), `#${issueNumber}`);
      }
      if (issueUrl) {
        console.log(chalk.cyan('URL:'), issueUrl);
      }
      
      // Ask to open in browser
      if (options.open !== false && issueUrl) {
        const { shouldOpen } = await this.prompt([{
          type: 'confirm',
          name: 'shouldOpen',
          message: 'Open in browser?',
          default: true
        }]);
        
        if (shouldOpen) {
          await this.exec(`gh issue view ${issueNumber} --web`, { silent: true });
        }
      }
      
    } catch (error) {
      this.log(`Failed to create issue: ${error.message}`, 'error');
    }
  }

  async viewIssue(issueNumber) {
    if (!issueNumber) {
      this.log('Issue number required', 'error');
      console.log(chalk.gray('Usage: /issues view <number>'));
      return;
    }
    
    console.log(chalk.blue(`📄 Issue #${issueNumber}\n`));
    
    try {
      // Get issue details
      const issue = await this.exec(
        `gh issue view ${issueNumber} --json number,title,author,state,body,labels,assignees,milestone,projectCards,comments,createdAt,updatedAt,closedAt`,
        { silent: true }
      );
      
      const data = JSON.parse(issue);
      
      // Display header
      console.log(chalk.white.bold(data.title));
      console.log(chalk.gray(`─`.repeat(data.title.length)));
      
      // Metadata
      console.log(chalk.cyan('State:'), this.getIssueStateColor(data.state));
      console.log(chalk.cyan('Author:'), data.author.login);
      console.log(chalk.cyan('Created:'), this.formatDate(new Date(data.createdAt)));
      
      if (data.closedAt) {
        console.log(chalk.cyan('Closed:'), this.formatDate(new Date(data.closedAt)));
      }
      
      // Labels
      if (data.labels && data.labels.length > 0) {
        const labels = data.labels.map(l => chalk.bgGray.white(` ${l.name} `)).join(' ');
        console.log(chalk.cyan('Labels:'), labels);
      }
      
      // Assignees
      if (data.assignees && data.assignees.length > 0) {
        const assignees = data.assignees.map(a => a.login).join(', ');
        console.log(chalk.cyan('Assignees:'), assignees);
      }
      
      // Milestone
      if (data.milestone) {
        console.log(chalk.cyan('Milestone:'), data.milestone.title);
      }
      
      // Body
      if (data.body) {
        console.log(chalk.cyan('\nDescription:'));
        console.log(chalk.gray(data.body));
      }
      
      // Comments
      if (data.comments && data.comments.length > 0) {
        console.log(chalk.cyan(`\n💬 Comments (${data.comments.length}):`));
        
        data.comments.slice(-3).forEach(comment => {
          console.log(chalk.gray(`\n─`.repeat(30)));
          console.log(chalk.yellow(`@${comment.author.login}`), chalk.gray(this.formatDate(new Date(comment.createdAt))));
          console.log(comment.body);
        });
        
        if (data.comments.length > 3) {
          console.log(chalk.gray(`\n... and ${data.comments.length - 3} more comments`));
        }
      }
      
      // URL
      const issueUrl = await this.exec(`gh issue view ${issueNumber} --json url -q .url`, { silent: true });
      console.log(chalk.cyan('\nURL:'), issueUrl.trim());
      
    } catch (error) {
      this.log(`Failed to view issue: ${error.message}`, 'error');
    }
  }

  async closeIssue(issueNumber, options) {
    if (!issueNumber) {
      this.log('Issue number required', 'error');
      console.log(chalk.gray('Usage: /issues close <number>'));
      return;
    }
    
    console.log(chalk.blue(`🔒 Closing Issue #${issueNumber}\n`));
    
    try {
      // Get issue title for confirmation
      const issue = await this.exec(`gh issue view ${issueNumber} --json title`, { silent: true });
      const { title } = JSON.parse(issue);
      
      console.log(chalk.cyan('Title:'), title);
      
      // Get close reason
      let reason = options.reason || 'completed';
      
      if (!options.reason) {
        const { closeReason } = await this.prompt([{
          type: 'list',
          name: 'closeReason',
          message: 'Close reason:',
          choices: [
            { name: '✅ Completed', value: 'completed' },
            { name: '❌ Not planned', value: 'not_planned' },
            { name: '🔁 Duplicate', value: 'duplicate' }
          ]
        }]);
        reason = closeReason;
      }
      
      // Add comment if provided
      if (options.comment) {
        console.log(chalk.gray('Adding comment...'));
        await this.exec(`gh issue comment ${issueNumber} --body "${options.comment}"`);
      }
      
      // Close issue
      console.log(chalk.gray('Closing issue...'));
      
      let closeCommand = `gh issue close ${issueNumber}`;
      if (reason === 'not_planned') {
        closeCommand += ' --reason "not planned"';
      } else if (reason === 'duplicate' && options.duplicate) {
        closeCommand += ` --comment "Duplicate of #${options.duplicate}"`;
      }
      
      await this.exec(closeCommand);
      
      console.log(chalk.green(`\n✅ Issue #${issueNumber} closed successfully!`));
      
    } catch (error) {
      this.log(`Failed to close issue: ${error.message}`, 'error');
    }
  }

  getIssueStateColor(state) {
    return state === 'OPEN' ? chalk.green(state) : chalk.red(state);
  }
}