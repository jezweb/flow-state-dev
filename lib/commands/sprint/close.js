/**
 * Sprint Close command - Close sprint, move issues, create retrospective
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class SprintCloseCommand extends GitHubSlashCommand {
  constructor() {
    super('/sprint:close', 'Close sprint, move issues, create retrospective', {
      aliases: ['/sp:close'],
      category: 'sprint',
      usage: '/sprint:close [options]',
      examples: [
        'fsd slash "/sprint:close"',
        'fsd slash "/sprint:close --milestone Sprint-2024-01"',
        'fsd slash "/sprint:close --next-milestone Sprint-2024-02"',
        'fsd slash "/sprint:close --retrospective"'
      ],
      options: [
        { name: 'milestone', type: 'string', description: 'Milestone name to close' },
        { name: 'next-milestone', type: 'string', description: 'Next milestone for moved issues' },
        { name: 'retrospective', type: 'boolean', description: 'Create retrospective document' },
        { name: 'force', type: 'boolean', description: 'Force close even with open issues' }
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🏁 Sprint Close\n'));
    
    try {
      // Get milestones
      const milestones = await this.getMilestones();
      
      if (milestones.length === 0) {
        console.log(chalk.yellow('No milestones found'));
        return;
      }

      // Select milestone to close
      const milestone = await this.selectMilestone(options.milestone, milestones);
      if (!milestone) return;

      // Get milestone issues
      const issues = await this.getMilestoneIssues(milestone.title);
      const analysis = this.analyzeSprintCompletion(issues);

      // Display sprint summary
      await this.displaySprintSummary(milestone, analysis);

      // Check if sprint can be closed
      const canClose = await this.validateSprintClosure(analysis, options.force);
      if (!canClose) return;

      // Handle incomplete issues
      if (analysis.openIssues.length > 0) {
        await this.handleIncompleteIssues(analysis.openIssues, options['next-milestone']);
      }

      // Close the milestone
      await this.closeMilestone(milestone.title);

      // Create retrospective if requested
      if (options.retrospective) {
        await this.createRetrospective(milestone, analysis);
      }

      // Show completion summary
      await this.showCompletionSummary(milestone, analysis);

    } catch (error) {
      this.log(`Failed to close sprint: ${error.message}`, 'error');
    }
  }

  async getMilestones() {
    try {
      const result = await this.exec('gh api repos/{owner}/{repo}/milestones --jq \'.[] | {title: .title, state: .state, due_on: .due_on, open_issues: .open_issues, closed_issues: .closed_issues, created_at: .created_at, description: .description, number: .number}\'', { silent: true });
      
      return result.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async selectMilestone(providedMilestone, milestones) {
    // Filter to open milestones only
    const openMilestones = milestones.filter(m => m.state === 'open');
    
    if (openMilestones.length === 0) {
      console.log(chalk.yellow('No open milestones found to close'));
      return null;
    }

    if (providedMilestone) {
      const milestone = openMilestones.find(m => m.title === providedMilestone);
      if (!milestone) {
        this.log(`Open milestone "${providedMilestone}" not found`, 'error');
        return null;
      }
      return milestone;
    }

    console.log(chalk.yellow('📋 Open Milestones:'));
    openMilestones.forEach((m, index) => {
      const totalIssues = m.open_issues + m.closed_issues;
      const progress = totalIssues > 0 ? Math.round((m.closed_issues / totalIssues) * 100) : 0;
      console.log(`  ${index + 1}. ${chalk.cyan(m.title)} - ${progress}% complete (${m.closed_issues}/${totalIssues} issues)`);
    });

    const { selectedIndex } = await this.prompt([{
      type: 'list',
      name: 'selectedIndex',
      message: 'Select milestone to close:',
      choices: openMilestones.map((m, index) => {
        const totalIssues = m.open_issues + m.closed_issues;
        const progress = totalIssues > 0 ? Math.round((m.closed_issues / totalIssues) * 100) : 0;
        return {
          name: `${m.title} (${progress}% complete - ${m.open_issues} open issues)`,
          value: index
        };
      })
    }]);

    return openMilestones[selectedIndex];
  }

  async getMilestoneIssues(milestoneTitle) {
    try {
      const result = await this.exec(`gh issue list --milestone "${milestoneTitle}" --state all --json number,title,state,labels,createdAt,closedAt,assignees`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      this.log('Failed to fetch milestone issues', 'error');
      return [];
    }
  }

  analyzeSprintCompletion(issues) {
    const completed = issues.filter(i => i.state === 'closed');
    const open = issues.filter(i => i.state === 'open');
    
    const completedPoints = completed.reduce((sum, issue) => sum + this.calculateStoryPoints(issue), 0);
    const openPoints = open.reduce((sum, issue) => sum + this.calculateStoryPoints(issue), 0);
    const totalPoints = completedPoints + openPoints;

    const completionRate = issues.length > 0 ? Math.round((completed.length / issues.length) * 100) : 0;
    const pointsCompletionRate = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    return {
      totalIssues: issues.length,
      completedIssues: completed,
      openIssues: open,
      completedCount: completed.length,
      openCount: open.length,
      completedPoints,
      openPoints,
      totalPoints,
      completionRate,
      pointsCompletionRate
    };
  }

  async displaySprintSummary(milestone, analysis) {
    console.log(chalk.white(`🎯 Sprint: ${milestone.title}`));
    
    if (milestone.description) {
      console.log(chalk.gray(`   ${milestone.description}`));
    }

    console.log(chalk.yellow('\n📊 Sprint Summary:'));
    console.log(`  Total issues: ${chalk.cyan(analysis.totalIssues)}`);
    console.log(`  Completed: ${chalk.green(analysis.completedCount)} (${analysis.completionRate}%)`);
    console.log(`  Remaining: ${chalk.yellow(analysis.openCount)}`);
    
    console.log(`  Story points completed: ${chalk.green(analysis.completedPoints)}/${analysis.totalPoints} (${analysis.pointsCompletionRate}%)`);
    
    if (analysis.openCount > 0) {
      console.log(`  Story points remaining: ${chalk.yellow(analysis.openPoints)}`);
    }

    // Due date check
    if (milestone.due_on) {
      const dueDate = new Date(milestone.due_on);
      const now = new Date();
      if (now > dueDate) {
        const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        console.log(chalk.red(`  ⚠️  ${daysOverdue} days overdue`));
      } else {
        console.log(chalk.green(`  ✅ Completed before due date`));
      }
    }
  }

  async validateSprintClosure(analysis, force) {
    if (analysis.openCount === 0) {
      console.log(chalk.green('\n✅ All issues completed - ready to close sprint'));
      return true;
    }

    if (force) {
      console.log(chalk.yellow(`\n⚠️  Forcing sprint closure with ${analysis.openCount} open issues`));
      return true;
    }

    console.log(chalk.yellow(`\n⚠️  Sprint has ${analysis.openCount} open issues:`));
    analysis.openIssues.slice(0, 5).forEach(issue => {
      const points = this.calculateStoryPoints(issue);
      console.log(chalk.gray(`  • #${issue.number} ${issue.title} (${points} pts)`));
    });

    if (analysis.openCount > 5) {
      console.log(chalk.gray(`  ... and ${analysis.openCount - 5} more`));
    }

    const shouldContinue = await this.confirm(
      '\nDo you want to proceed with closing the sprint?',
      false
    );

    return shouldContinue;
  }

  async handleIncompleteIssues(openIssues, nextMilestone) {
    console.log(chalk.blue(`\n📋 Handling ${openIssues.length} incomplete issues\n`));

    let targetMilestone = nextMilestone;

    if (!targetMilestone) {
      const { action } = await this.prompt([{
        type: 'list',
        name: 'action',
        message: 'How would you like to handle incomplete issues?',
        choices: [
          { name: 'Move to next sprint milestone', value: 'move' },
          { name: 'Remove milestone (return to backlog)', value: 'backlog' },
          { name: 'Create new milestone for remaining issues', value: 'create' },
          { name: 'Leave as-is (manual handling later)', value: 'skip' }
        ]
      }]);

      if (action === 'skip') {
        console.log(chalk.gray('Skipping issue handling - issues will remain in current milestone'));
        return;
      }

      if (action === 'backlog') {
        await this.moveIssuesToBacklog(openIssues);
        return;
      }

      if (action === 'create') {
        targetMilestone = await this.createNextSprintMilestone(openIssues);
        if (!targetMilestone) return;
      }

      if (action === 'move' || (action === 'create' && targetMilestone)) {
        if (!targetMilestone) {
          targetMilestone = await this.selectNextMilestone();
          if (!targetMilestone) return;
        }
      }
    }

    if (targetMilestone) {
      await this.moveIssuesToMilestone(openIssues, targetMilestone);
    }
  }

  async moveIssuesToBacklog(issues) {
    console.log(chalk.gray('Moving issues to backlog...'));

    let moved = 0;
    for (const issue of issues) {
      try {
        await this.exec(`gh issue edit ${issue.number} --remove-milestone`, { silent: true });
        moved++;
      } catch (error) {
        console.log(chalk.red(`❌ Failed to move #${issue.number}: ${error.message}`));
      }
    }

    console.log(chalk.green(`✅ Moved ${moved}/${issues.length} issues to backlog`));
  }

  async moveIssuesToMilestone(issues, milestone) {
    console.log(chalk.gray(`Moving issues to milestone: ${milestone}...`));

    let moved = 0;
    for (const issue of issues) {
      try {
        await this.exec(`gh issue edit ${issue.number} --milestone "${milestone}"`, { silent: true });
        moved++;
      } catch (error) {
        console.log(chalk.red(`❌ Failed to move #${issue.number}: ${error.message}`));
      }
    }

    console.log(chalk.green(`✅ Moved ${moved}/${issues.length} issues to ${milestone}`));
  }

  async createNextSprintMilestone(remainingIssues) {
    const remainingPoints = remainingIssues.reduce((sum, issue) => sum + this.calculateStoryPoints(issue), 0);
    
    const defaultTitle = `Sprint ${new Date().toISOString().slice(0, 10)} (Continuation)`;
    const defaultDescription = `Continuation sprint with ${remainingIssues.length} carried-over issues (${remainingPoints} story points)`;

    const { milestoneTitle } = await this.prompt([{
      type: 'input',
      name: 'milestoneTitle',
      message: 'New milestone title:',
      default: defaultTitle
    }]);

    const { milestoneDescription } = await this.prompt([{
      type: 'input',
      name: 'milestoneDescription',
      message: 'Milestone description:',
      default: defaultDescription
    }]);

    // Due date (2 weeks from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    try {
      await this.exec(
        `gh api repos/{owner}/{repo}/milestones --method POST --field title="${milestoneTitle}" --field description="${milestoneDescription}" --field due_on="${dueDateStr}T23:59:59Z"`,
        { silent: true }
      );
      
      console.log(chalk.green(`✅ Created new milestone: ${milestoneTitle}`));
      return milestoneTitle;
    } catch (error) {
      this.log(`Failed to create milestone: ${error.message}`, 'error');
      return null;
    }
  }

  async selectNextMilestone() {
    const milestones = await this.getMilestones();
    const openMilestones = milestones.filter(m => m.state === 'open');

    if (openMilestones.length === 0) {
      console.log(chalk.yellow('No open milestones available for moving issues'));
      return null;
    }

    const { selectedMilestone } = await this.prompt([{
      type: 'list',
      name: 'selectedMilestone',
      message: 'Select target milestone:',
      choices: openMilestones.map(m => ({
        name: `${m.title} (${m.open_issues + m.closed_issues} issues)`,
        value: m.title
      }))
    }]);

    return selectedMilestone;
  }

  async closeMilestone(milestoneTitle) {
    console.log(chalk.gray('\nClosing milestone...'));

    try {
      // Get milestone number first
      const milestone = await this.exec(`gh api repos/{owner}/{repo}/milestones --jq '.[] | select(.title == "${milestoneTitle}") | .number'`, { silent: true });
      const milestoneNumber = milestone.trim();

      if (!milestoneNumber) {
        throw new Error('Milestone not found');
      }

      await this.exec(
        `gh api repos/{owner}/{repo}/milestones/${milestoneNumber} --method PATCH --field state=closed`,
        { silent: true }
      );

      console.log(chalk.green(`✅ Milestone "${milestoneTitle}" closed successfully`));
    } catch (error) {
      this.log(`Failed to close milestone: ${error.message}`, 'error');
    }
  }

  async createRetrospective(milestone, analysis) {
    console.log(chalk.blue('\n📝 Creating Sprint Retrospective\n'));

    const retrospectiveContent = this.generateRetrospectiveContent(milestone, analysis);
    const filename = `sprint-retrospective-${milestone.title.replace(/\s+/g, '-').toLowerCase()}.md`;

    try {
      // Create retrospective file
      await this.exec(`echo '${retrospectiveContent.replace(/'/g, "'\\''")}' > ${filename}`, { silent: true });
      
      console.log(chalk.green(`✅ Retrospective created: ${filename}`));
      
      // Ask if they want to create an issue for the retrospective
      const createIssue = await this.confirm(
        'Create a GitHub issue for the retrospective?',
        true
      );

      if (createIssue) {
        await this.createRetrospectiveIssue(milestone, filename);
      }

    } catch (error) {
      this.log(`Failed to create retrospective: ${error.message}`, 'error');
    }
  }

  generateRetrospectiveContent(milestone, analysis) {
    const date = new Date().toISOString().split('T')[0];
    
    return `# Sprint Retrospective: ${milestone.title}

**Date:** ${date}
**Sprint Duration:** ${milestone.created_at ? this.formatDate(new Date(milestone.created_at)) : 'Unknown'} - ${date}

## Sprint Summary

- **Total Issues:** ${analysis.totalIssues}
- **Completed:** ${analysis.completedCount} issues (${analysis.completionRate}%)
- **Story Points Completed:** ${analysis.completedPoints}/${analysis.totalPoints} (${analysis.pointsCompletionRate}%)

## What Went Well ✅

- [ ] Add team feedback on what worked well
- [ ] Successful implementations
- [ ] Process improvements
- [ ] Team collaboration highlights

## What Could Be Improved 🔧

- [ ] Challenges faced during the sprint
- [ ] Process bottlenecks
- [ ] Technical debt identified
- [ ] Communication issues

## Action Items 🎯

- [ ] Specific improvements for next sprint
- [ ] Process changes to implement
- [ ] Technical tasks to prioritize
- [ ] Team development needs

## Metrics & Insights 📊

### Velocity
- Sprint velocity: ${analysis.completedPoints} story points
- Completion rate: ${analysis.completionRate}%

### Issues Breakdown
${analysis.completedIssues.map(issue => `- ✅ #${issue.number} ${issue.title}`).join('\n')}

${analysis.openIssues.length > 0 ? `\n### Incomplete Issues\n${analysis.openIssues.map(issue => `- ⏳ #${issue.number} ${issue.title}`).join('\n')}` : ''}

## Next Sprint Planning 📅

- [ ] Review backlog priorities
- [ ] Update story point estimates based on learnings
- [ ] Plan capacity for next sprint
- [ ] Address technical debt items

---
*Generated automatically by Flow State Dev*`;
  }

  async createRetrospectiveIssue(milestone, filename) {
    const title = `Sprint Retrospective: ${milestone.title}`;
    const body = `Sprint retrospective meeting and documentation.

📝 **Retrospective Document:** \`${filename}\`

**Agenda:**
1. Review sprint metrics
2. Discuss what went well
3. Identify improvement areas  
4. Define action items for next sprint

**Attendees:** @team

**Meeting Notes:** Add notes from retrospective meeting below.`;

    try {
      await this.exec(
        `gh issue create --title "${title}" --body "${body}" --label "retrospective,sprint"`,
        { silent: true }
      );
      
      console.log(chalk.green('✅ Retrospective issue created'));
    } catch (error) {
      this.log(`Failed to create retrospective issue: ${error.message}`, 'error');
    }
  }

  async showCompletionSummary(milestone, analysis) {
    console.log(chalk.green('\n🎉 Sprint Closure Complete!\n'));
    
    console.log(chalk.white('📊 Final Summary:'));
    console.log(`  Sprint: ${chalk.cyan(milestone.title)}`);
    console.log(`  Completed: ${chalk.green(analysis.completedCount)} issues (${analysis.completedPoints} pts)`);
    console.log(`  Success Rate: ${chalk.cyan(analysis.completionRate + '%')}`);
    
    if (analysis.openCount > 0) {
      console.log(`  Moved/Handled: ${chalk.yellow(analysis.openCount)} remaining issues`);
    }

    console.log(chalk.gray('\n💡 Next Steps:'));
    console.log(chalk.gray('  • Review retrospective notes with the team'));
    console.log(chalk.gray('  • Plan next sprint with lessons learned'));
    console.log(chalk.gray('  • Update team velocity metrics'));
    console.log(chalk.gray('  • Use /sprint:plan to start next sprint'));
  }

  calculateStoryPoints(issue) {
    // Same logic as other sprint commands
    const labels = issue.labels || [];
    
    for (const label of labels) {
      const name = label.name || label;
      
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
    
    const title = issue.title?.toLowerCase() || '';
    const hasComplexityIndicators = [
      'refactor', 'architecture', 'design', 'research', 
      'investigation', 'spike', 'complex', 'major'
    ].some(keyword => title.includes(keyword));
    
    if (hasComplexityIndicators) {
      return 8;
    } else if (title.includes('fix') || title.includes('bug')) {
      return 3;
    } else {
      return 5;
    }
  }
}