/**
 * Sprint Plan command - Plan next sprint, show backlog, estimate capacity
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class SprintPlanCommand extends GitHubSlashCommand {
  constructor() {
    super('/sprint:plan', 'Plan next sprint, show backlog, estimate capacity', {
      aliases: ['/sp:plan'],
      category: 'sprint',
      usage: '/sprint:plan [options]',
      examples: [
        'fsd slash "/sprint:plan"',
        'fsd slash "/sprint:plan --weeks 3"',
        'fsd slash "/sprint:plan --capacity 60"'
      ],
      options: [
        { name: 'weeks', type: 'number', description: 'Sprint duration in weeks', default: 2 },
        { name: 'capacity', type: 'number', description: 'Team capacity (story points)', default: 40 },
        { name: 'auto-assign', type: 'boolean', description: 'Automatically assign issues based on capacity' }
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('📅 Sprint Planning\n'));
    
    try {
      // Get repository information
      const repoInfo = await this.getRepoInfo();
      console.log(chalk.gray(`Repository: ${repoInfo.owner.login}/${repoInfo.name}`));
      
      // Configuration
      const weeks = options.weeks || 2;
      const capacity = options.capacity || 40;
      const autoAssign = options['auto-assign'] || false;
      
      // Get backlog issues (open issues without milestones)
      const backlog = await this.getBacklogIssues();
      
      console.log(chalk.white(`\n📋 Backlog: ${backlog.length} issues`));
      console.log(chalk.gray(`Sprint capacity: ${capacity} story points`));
      console.log(chalk.gray(`Sprint duration: ${weeks} weeks\n`));

      if (backlog.length === 0) {
        console.log(chalk.yellow('No backlog issues found'));
        console.log(chalk.gray('Create some issues first or remove milestone assignments'));
        return;
      }

      // Show top backlog issues
      await this.showBacklogSummary(backlog);
      
      // Create sprint milestone
      const milestone = await this.createSprintMilestone(weeks, capacity);
      
      if (milestone) {
        // Assign issues to sprint
        if (autoAssign) {
          await this.autoAssignIssues(backlog, milestone, capacity);
        } else {
          const shouldAssign = await this.confirm(
            'Would you like to assign issues to this sprint now?',
            true
          );
          
          if (shouldAssign) {
            await this.interactiveAssignIssues(backlog, milestone, capacity);
          }
        }
      }
      
    } catch (error) {
      this.log(`Failed to plan sprint: ${error.message}`, 'error');
    }
  }

  async getBacklogIssues() {
    try {
      const result = await this.exec('gh issue list --state open --json number,title,labels,milestone', { silent: true });
      const allIssues = JSON.parse(result);
      
      // Filter issues without milestones (backlog)
      return allIssues.filter(issue => !issue.milestone);
    } catch (error) {
      this.log('Failed to fetch backlog issues', 'error');
      return [];
    }
  }

  async showBacklogSummary(backlog) {
    console.log(chalk.white('📊 Top Backlog Issues:'));
    
    backlog.slice(0, 10).forEach((issue, index) => {
      const labels = issue.labels?.map(l => l.name).join(', ') || '';
      const storyPoints = this.calculateStoryPoints(issue);
      
      console.log(`${chalk.cyan(`  ${index + 1}.`)} #${issue.number} ${chalk.white(issue.title)}`);
      console.log(`     ${chalk.gray(`Story points: ${storyPoints}`)}`);
      
      if (labels) {
        console.log(`     ${chalk.gray(`Labels: ${labels}`)}`);
      }
      console.log('');
    });
  }

  async createSprintMilestone(weeks, capacity) {
    const createSprint = await this.confirm(
      'Create a new sprint milestone?',
      true
    );

    if (!createSprint) {
      return null;
    }

    // Get milestone details
    const defaultTitle = `Sprint ${new Date().toISOString().slice(0, 10)}`;
    const defaultDescription = `${weeks}-week sprint with ${capacity} story point capacity`;

    const { milestoneTitle } = await this.prompt([{
      type: 'input',
      name: 'milestoneTitle',
      message: 'Sprint milestone title:',
      default: defaultTitle
    }]);

    const { milestoneDescription } = await this.prompt([{
      type: 'input', 
      name: 'milestoneDescription',
      message: 'Sprint description (optional):',
      default: defaultDescription
    }]);

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (weeks * 7));
    const dueDateStr = dueDate.toISOString().split('T')[0];

    try {
      console.log(chalk.gray('\nCreating sprint milestone...'));
      
      await this.exec(
        `gh api repos/{owner}/{repo}/milestones --method POST --field title="${milestoneTitle}" --field description="${milestoneDescription}" --field due_on="${dueDateStr}T23:59:59Z"`,
        { silent: true }
      );
      
      console.log(chalk.green(`✅ Created milestone: ${milestoneTitle}`));
      return milestoneTitle;
    } catch (error) {
      this.log(`Failed to create milestone: ${error.message}`, 'error');
      return null;
    }
  }

  async interactiveAssignIssues(backlog, milestone, capacity) {
    let currentPoints = 0;
    const selectedIssues = [];

    console.log(chalk.blue('\n🎯 Interactive Issue Assignment\n'));
    console.log(chalk.gray('Select issues to add to the sprint based on capacity\n'));

    for (const issue of backlog) {
      if (currentPoints >= capacity) {
        console.log(chalk.yellow(`\n🎯 Reached sprint capacity (${capacity} points)`));
        break;
      }

      const issuePoints = this.calculateStoryPoints(issue);
      const potentialTotal = currentPoints + issuePoints;

      console.log(chalk.white(`\nIssue #${issue.number}: ${issue.title}`));
      console.log(chalk.gray(`  Story points: ${issuePoints}`));
      console.log(chalk.gray(`  Current total: ${currentPoints}/${capacity} points`));
      console.log(chalk.gray(`  New total would be: ${potentialTotal}/${capacity} points`));

      if (potentialTotal > capacity) {
        console.log(chalk.yellow('  ⚠️  Adding this issue would exceed capacity'));
      }

      const addToSprint = await this.confirm(
        'Add this issue to the sprint?',
        potentialTotal <= capacity
      );

      if (addToSprint) {
        try {
          await this.exec(
            `gh issue edit ${issue.number} --milestone "${milestone}"`,
            { silent: true }
          );
          
          selectedIssues.push(issue);
          currentPoints += issuePoints;
          console.log(chalk.green(`  ✅ Added to sprint (${currentPoints}/${capacity} points)`));
        } catch (error) {
          console.log(chalk.red(`  ❌ Failed to assign issue: ${error.message}`));
        }
      }
    }

    console.log(chalk.green(`\n🎉 Sprint planning complete!`));
    console.log(chalk.white(`Assigned ${selectedIssues.length} issues (${currentPoints} story points)`));
    
    // Summary
    if (selectedIssues.length > 0) {
      console.log(chalk.yellow('\n📋 Sprint Summary:'));
      selectedIssues.forEach(issue => {
        const points = this.calculateStoryPoints(issue);
        console.log(chalk.gray(`  • #${issue.number} ${issue.title} (${points} pts)`));
      });
    }
  }

  async autoAssignIssues(backlog, milestone, capacity) {
    console.log(chalk.blue('\n🤖 Auto-assigning Issues\n'));
    
    let currentPoints = 0;
    const selectedIssues = [];
    
    // Sort issues by story points (smallest first for better packing)
    const sortedBacklog = backlog
      .map(issue => ({
        ...issue,
        points: this.calculateStoryPoints(issue)
      }))
      .sort((a, b) => a.points - b.points);

    for (const issue of sortedBacklog) {
      const potentialTotal = currentPoints + issue.points;
      
      if (potentialTotal <= capacity) {
        try {
          await this.exec(
            `gh issue edit ${issue.number} --milestone "${milestone}"`,
            { silent: true }
          );
          
          selectedIssues.push(issue);
          currentPoints += issue.points;
          
          console.log(chalk.green(`✅ #${issue.number} (${issue.points} pts) - Total: ${currentPoints}/${capacity}`));
        } catch (error) {
          console.log(chalk.red(`❌ Failed to assign #${issue.number}: ${error.message}`));
        }
      }
    }

    console.log(chalk.green(`\n🎉 Auto-assignment complete!`));
    console.log(chalk.white(`Assigned ${selectedIssues.length} issues (${currentPoints}/${capacity} story points)`));
    
    const efficiency = Math.round((currentPoints / capacity) * 100);
    console.log(chalk.cyan(`Sprint utilization: ${efficiency}%`));
  }

  calculateStoryPoints(issue) {
    // Extract story points from labels (e.g., "size:3", "points:5", "3 points")
    const labels = issue.labels || [];
    
    for (const label of labels) {
      const name = label.name || label;
      
      // Check for common story point label patterns
      const patterns = [
        /^size:(\d+)$/i,
        /^points?:(\d+)$/i,
        /^(\d+)\s*pts?$/i,
        /^(\d+)\s*points?$/i,
        /^story:(\d+)$/i
      ];
      
      for (const pattern of patterns) {
        const match = name.match(pattern);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }
    
    // Default story points based on issue complexity heuristics
    const title = issue.title?.toLowerCase() || '';
    const hasComplexityIndicators = [
      'refactor', 'architecture', 'design', 'research', 
      'investigation', 'spike', 'complex', 'major'
    ].some(keyword => title.includes(keyword));
    
    if (hasComplexityIndicators) {
      return 8; // High complexity
    } else if (title.includes('fix') || title.includes('bug')) {
      return 3; // Medium complexity
    } else {
      return 5; // Default complexity
    }
  }

  async getRepoInfo() {
    try {
      const result = await this.exec('gh repo view --json owner,name', { silent: true });
      return JSON.parse(result);
    } catch (error) {
      throw new Error('Failed to get repository information');
    }
  }
}