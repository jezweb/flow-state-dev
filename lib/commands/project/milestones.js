/**
 * Milestones command - manage GitHub milestones
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class MilestonesCommand extends GitHubSlashCommand {
  constructor() {
    super('/milestones', 'Manage GitHub milestones', {
      aliases: ['/m'],
      category: 'project',
      usage: '/milestones [list|create|view|close] [options]',
      examples: [
        'fsd slash "/milestones"',
        'fsd slash "/milestones create --title \'v1.0\' --due 2024-03-01"',
        'fsd slash "/milestones view 1"',
        'fsd slash "/milestones close 1"'
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const subcommand = args?.[0] || 'list';
    
    switch (subcommand) {
      case 'list':
        await this.listMilestones(options);
        break;
      case 'create':
        await this.createMilestone(options);
        break;
      case 'view':
        await this.viewMilestone(args[1]);
        break;
      case 'close':
        await this.closeMilestone(args[1]);
        break;
      case 'edit':
        await this.editMilestone(args[1], options);
        break;
      default:
        // If first arg is a number, view that milestone
        if (/^\d+$/.test(subcommand)) {
          await this.viewMilestone(subcommand);
        } else {
          this.log(`Unknown subcommand: ${subcommand}`, 'error');
          console.log(chalk.gray('Use /milestones list, create, view, edit, or close'));
        }
    }
  }

  async listMilestones(options) {
    console.log(chalk.blue('📊 GitHub Milestones\n'));
    
    try {
      let command = 'gh api repos/{owner}/{repo}/milestones';
      
      // Add parameters
      const params = [];
      if (options.state) params.push(`state=${options.state}`);
      else params.push('state=open');
      
      if (options.sort) params.push(`sort=${options.sort}`);
      if (options.direction) params.push(`direction=${options.direction}`);
      
      if (params.length > 0) {
        command += '?' + params.join('&');
      }
      
      const result = await this.exec(command, { silent: true });
      const milestones = JSON.parse(result);
      
      if (!milestones || milestones.length === 0) {
        console.log(chalk.gray('No milestones found'));
        console.log(chalk.gray('\nCreate one with: /milestones create'));
        return;
      }
      
      // Group by state
      const open = milestones.filter(m => m.state === 'open');
      const closed = milestones.filter(m => m.state === 'closed');
      
      if (open.length > 0) {
        console.log(chalk.green('📂 Open Milestones:'));
        this.displayMilestoneList(open);
      }
      
      if (closed.length > 0 && (!options.state || options.state === 'all')) {
        console.log(chalk.gray('\n📁 Closed Milestones:'));
        this.displayMilestoneList(closed);
      }
      
      // Show summary
      console.log(chalk.gray(`\n─`.repeat(50)));
      console.log(chalk.blue(`Total: ${milestones.length} milestone(s)`));
      
    } catch (error) {
      this.log(`Failed to list milestones: ${error.message}`, 'error');
    }
  }

  displayMilestoneList(milestones) {
    milestones.forEach(milestone => {
      const progress = this.calculateProgress(milestone);
      const progressBar = this.createProgressBar(progress);
      
      console.log(`\n📍 ${chalk.white.bold(milestone.title)} (#${milestone.number})`);
      
      if (milestone.description) {
        console.log(chalk.gray(`   ${milestone.description}`));
      }
      
      // Progress
      console.log(`   ${progressBar} ${progress}%`);
      console.log(chalk.gray(`   ${milestone.open_issues} open, ${milestone.closed_issues} closed`));
      
      // Due date
      if (milestone.due_on) {
        const dueDate = new Date(milestone.due_on);
        const isOverdue = dueDate < new Date() && milestone.state === 'open';
        const dateStr = this.formatDate(dueDate);
        
        if (isOverdue) {
          console.log(chalk.red(`   ⚠️  Due: ${dateStr} (overdue)`));
        } else {
          console.log(chalk.gray(`   📅 Due: ${dateStr}`));
        }
      }
    });
  }

  calculateProgress(milestone) {
    const total = milestone.open_issues + milestone.closed_issues;
    if (total === 0) return 0;
    return Math.round((milestone.closed_issues / total) * 100);
  }

  createProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledChar = '█';
    const emptyChar = '░';
    
    const bar = chalk.green(filledChar.repeat(filled)) + chalk.gray(emptyChar.repeat(empty));
    
    return `[${bar}]`;
  }

  async createMilestone(options) {
    console.log(chalk.blue('✨ Create New Milestone\n'));
    
    try {
      let title = options.title;
      let description = options.description;
      let dueDate = options.due;
      
      // Interactive mode if not provided
      if (!title) {
        const { milestoneTitle } = await this.prompt([{
          type: 'input',
          name: 'milestoneTitle',
          message: 'Milestone title:',
          validate: input => input.trim().length > 0 || 'Title is required'
        }]);
        title = milestoneTitle;
      }
      
      if (!description) {
        const { milestoneDesc } = await this.prompt([{
          type: 'input',
          name: 'milestoneDesc',
          message: 'Description (optional):'
        }]);
        description = milestoneDesc;
      }
      
      if (!dueDate) {
        const { milestoneDue } = await this.prompt([{
          type: 'input',
          name: 'milestoneDue',
          message: 'Due date (YYYY-MM-DD, optional):',
          validate: input => {
            if (!input) return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Use format: YYYY-MM-DD';
          }
        }]);
        dueDate = milestoneDue;
      }
      
      // Build API payload
      const payload = { title };
      if (description) payload.description = description;
      if (dueDate) payload.due_on = `${dueDate}T00:00:00Z`;
      
      // Create milestone
      console.log(chalk.gray('Creating milestone...'));
      
      const result = await this.exec(
        `gh api repos/{owner}/{repo}/milestones --method POST --field title="${title}" ${description ? `--field description="${description}"` : ''} ${dueDate ? `--field due_on="${dueDate}T00:00:00Z"` : ''}`,
        { silent: true }
      );
      
      const milestone = JSON.parse(result);
      
      console.log(chalk.green('\n✅ Milestone created successfully!'));
      console.log(chalk.cyan('Number:'), `#${milestone.number}`);
      console.log(chalk.cyan('Title:'), milestone.title);
      if (milestone.html_url) {
        console.log(chalk.cyan('URL:'), milestone.html_url);
      }
      
      // Ask to assign issues
      const { assignIssues } = await this.prompt([{
        type: 'confirm',
        name: 'assignIssues',
        message: 'Assign issues to this milestone?',
        default: false
      }]);
      
      if (assignIssues) {
        await this.assignIssuesToMilestone(milestone.number);
      }
      
    } catch (error) {
      this.log(`Failed to create milestone: ${error.message}`, 'error');
    }
  }

  async viewMilestone(milestoneNumber) {
    if (!milestoneNumber) {
      this.log('Milestone number required', 'error');
      console.log(chalk.gray('Usage: /milestones view <number>'));
      return;
    }
    
    console.log(chalk.blue(`📊 Milestone #${milestoneNumber}\n`));
    
    try {
      // Get milestone details
      const result = await this.exec(
        `gh api repos/{owner}/{repo}/milestones/${milestoneNumber}`,
        { silent: true }
      );
      
      const milestone = JSON.parse(result);
      
      // Display header
      console.log(chalk.white.bold(milestone.title));
      console.log(chalk.gray(`─`.repeat(milestone.title.length)));
      
      // Metadata
      console.log(chalk.cyan('State:'), milestone.state === 'open' ? chalk.green('OPEN') : chalk.red('CLOSED'));
      console.log(chalk.cyan('Created:'), this.formatDate(new Date(milestone.created_at)));
      
      if (milestone.due_on) {
        const dueDate = new Date(milestone.due_on);
        const isOverdue = dueDate < new Date() && milestone.state === 'open';
        console.log(
          chalk.cyan('Due:'), 
          isOverdue ? chalk.red(`${this.formatDate(dueDate)} (overdue)`) : this.formatDate(dueDate)
        );
      }
      
      if (milestone.closed_at) {
        console.log(chalk.cyan('Closed:'), this.formatDate(new Date(milestone.closed_at)));
      }
      
      // Description
      if (milestone.description) {
        console.log(chalk.cyan('\nDescription:'));
        console.log(chalk.gray(milestone.description));
      }
      
      // Progress
      const progress = this.calculateProgress(milestone);
      const progressBar = this.createProgressBar(progress, 30);
      
      console.log(chalk.cyan('\n📈 Progress:'));
      console.log(`${progressBar} ${progress}%`);
      console.log(chalk.gray(`${milestone.closed_issues} completed, ${milestone.open_issues} remaining`));
      
      // List issues if any
      if (milestone.open_issues > 0 || milestone.closed_issues > 0) {
        console.log(chalk.cyan('\n📋 Issues:'));
        
        // Get issues for this milestone
        const issuesResult = await this.exec(
          `gh issue list --milestone "${milestone.title}" --limit 100`,
          { silent: true }
        );
        
        if (issuesResult.trim()) {
          const lines = issuesResult.split('\n').filter(line => line.trim());
          const openIssues = [];
          const closedIssues = [];
          
          lines.forEach(line => {
            const parts = line.split('\t');
            if (parts.length >= 3) {
              const [number, title] = parts;
              const state = parts[3] || 'OPEN';
              
              if (state === 'OPEN') {
                openIssues.push({ number, title });
              } else {
                closedIssues.push({ number, title });
              }
            }
          });
          
          if (openIssues.length > 0) {
            console.log(chalk.yellow('\n  Open:'));
            openIssues.slice(0, 10).forEach(issue => {
              console.log(chalk.gray(`    • #${issue.number} ${issue.title}`));
            });
            if (openIssues.length > 10) {
              console.log(chalk.gray(`    ... and ${openIssues.length - 10} more`));
            }
          }
          
          if (closedIssues.length > 0) {
            console.log(chalk.green('\n  Completed:'));
            closedIssues.slice(0, 5).forEach(issue => {
              console.log(chalk.gray(`    ✓ #${issue.number} ${issue.title}`));
            });
            if (closedIssues.length > 5) {
              console.log(chalk.gray(`    ... and ${closedIssues.length - 5} more`));
            }
          }
        }
      }
      
      // URL
      if (milestone.html_url) {
        console.log(chalk.cyan('\nURL:'), milestone.html_url);
      }
      
    } catch (error) {
      this.log(`Failed to view milestone: ${error.message}`, 'error');
    }
  }

  async closeMilestone(milestoneNumber) {
    if (!milestoneNumber) {
      this.log('Milestone number required', 'error');
      console.log(chalk.gray('Usage: /milestones close <number>'));
      return;
    }
    
    console.log(chalk.blue(`🔒 Closing Milestone #${milestoneNumber}\n`));
    
    try {
      // Get milestone details
      const result = await this.exec(
        `gh api repos/{owner}/{repo}/milestones/${milestoneNumber}`,
        { silent: true }
      );
      
      const milestone = JSON.parse(result);
      
      console.log(chalk.cyan('Title:'), milestone.title);
      console.log(chalk.cyan('Progress:'), `${milestone.closed_issues}/${milestone.open_issues + milestone.closed_issues} issues completed`);
      
      if (milestone.open_issues > 0) {
        console.log(chalk.yellow(`\n⚠️  Warning: ${milestone.open_issues} open issue(s) remaining`));
      }
      
      // Confirm
      const shouldClose = await this.confirm(
        'Close this milestone?',
        true
      );
      
      if (!shouldClose) {
        console.log(chalk.yellow('Milestone close cancelled'));
        return;
      }
      
      // Close milestone
      console.log(chalk.gray('\nClosing milestone...'));
      
      await this.exec(
        `gh api repos/{owner}/{repo}/milestones/${milestoneNumber} --method PATCH --field state=closed`,
        { silent: true }
      );
      
      console.log(chalk.green(`\n✅ Milestone #${milestoneNumber} closed successfully!`));
      
    } catch (error) {
      this.log(`Failed to close milestone: ${error.message}`, 'error');
    }
  }

  async editMilestone(milestoneNumber, options) {
    if (!milestoneNumber) {
      this.log('Milestone number required', 'error');
      console.log(chalk.gray('Usage: /milestones edit <number> [options]'));
      return;
    }
    
    console.log(chalk.blue(`✏️  Editing Milestone #${milestoneNumber}\n`));
    
    try {
      // Get current milestone
      const result = await this.exec(
        `gh api repos/{owner}/{repo}/milestones/${milestoneNumber}`,
        { silent: true }
      );
      
      const milestone = JSON.parse(result);
      
      console.log(chalk.cyan('Current title:'), milestone.title);
      
      // Build update fields
      const updates = [];
      
      if (options.title) {
        updates.push(`--field title="${options.title}"`);
      }
      
      if (options.description !== undefined) {
        updates.push(`--field description="${options.description}"`);
      }
      
      if (options.due) {
        updates.push(`--field due_on="${options.due}T00:00:00Z"`);
      }
      
      if (updates.length === 0) {
        this.log('No updates specified', 'error');
        console.log(chalk.gray('Use --title, --description, or --due to update'));
        return;
      }
      
      // Update milestone
      console.log(chalk.gray('\nUpdating milestone...'));
      
      await this.exec(
        `gh api repos/{owner}/{repo}/milestones/${milestoneNumber} --method PATCH ${updates.join(' ')}`,
        { silent: true }
      );
      
      console.log(chalk.green(`\n✅ Milestone #${milestoneNumber} updated successfully!`));
      
    } catch (error) {
      this.log(`Failed to edit milestone: ${error.message}`, 'error');
    }
  }

  async assignIssuesToMilestone(milestoneNumber) {
    console.log(chalk.blue('\n🔗 Assign Issues to Milestone\n'));
    
    try {
      // Get open issues without milestone
      const result = await this.exec(
        'gh issue list --state open --limit 100 --json number,title,milestone',
        { silent: true }
      );
      
      const allIssues = JSON.parse(result);
      const unassignedIssues = allIssues.filter(issue => !issue.milestone);
      
      if (unassignedIssues.length === 0) {
        console.log(chalk.gray('No unassigned issues found'));
        return;
      }
      
      // Build choices
      const choices = unassignedIssues.map(issue => ({
        name: `#${issue.number} ${issue.title}`,
        value: issue.number
      }));
      
      const { selectedIssues } = await this.prompt([{
        type: 'checkbox',
        name: 'selectedIssues',
        message: 'Select issues to assign:',
        choices,
        pageSize: 15
      }]);
      
      if (selectedIssues.length === 0) {
        console.log(chalk.yellow('No issues selected'));
        return;
      }
      
      // Assign issues
      console.log(chalk.gray('\nAssigning issues...'));
      let assigned = 0;
      
      for (const issueNumber of selectedIssues) {
        try {
          await this.exec(
            `gh issue edit ${issueNumber} --milestone ${milestoneNumber}`,
            { silent: true }
          );
          console.log(chalk.green(`  ✓ Assigned #${issueNumber}`));
          assigned++;
        } catch (error) {
          console.log(chalk.red(`  ✗ Failed to assign #${issueNumber}`));
        }
      }
      
      console.log(chalk.green(`\n✅ Assigned ${assigned} issue(s) to milestone`));
      
    } catch (error) {
      this.log(`Failed to assign issues: ${error.message}`, 'error');
    }
  }
}