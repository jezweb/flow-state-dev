/**
 * Sprint Review command - Review current sprint, calculate velocity
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class SprintReviewCommand extends GitHubSlashCommand {
  constructor() {
    super('/sprint:review', 'Review current sprint, calculate velocity', {
      aliases: ['/sp:review'],
      category: 'sprint',
      usage: '/sprint:review [options]',
      examples: [
        'fsd slash "/sprint:review"',
        'fsd slash "/sprint:review --milestone Sprint-2024-01"',
        'fsd slash "/sprint:review --detailed"'
      ],
      options: [
        { name: 'milestone', type: 'string', description: 'Milestone name to review' },
        { name: 'detailed', type: 'boolean', description: 'Show detailed issue breakdown' },
        { name: 'compare', type: 'boolean', description: 'Compare with previous sprints' }
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('📊 Sprint Review\n'));
    
    try {
      // Get milestones
      const milestones = await this.getMilestones();
      
      if (milestones.length === 0) {
        console.log(chalk.yellow('No milestones found'));
        console.log(chalk.gray('Create a sprint milestone first with: /sprint:plan'));
        return;
      }

      // Select milestone to review
      const milestone = await this.selectMilestone(options.milestone, milestones);
      if (!milestone) return;

      // Get issues for the milestone
      const issues = await this.getMilestoneIssues(milestone.title);
      
      // Analyze sprint performance
      const analysis = this.analyzeSprintPerformance(issues, milestone);
      
      // Display sprint overview
      await this.displaySprintOverview(milestone, analysis);
      
      // Show detailed breakdown if requested
      if (options.detailed) {
        await this.displayDetailedBreakdown(issues, analysis);
      }
      
      // Show velocity metrics
      await this.displayVelocityMetrics(milestone, analysis);
      
      // Identify blockers and risks
      await this.identifyBlockersAndRisks(issues);
      
      // Compare with previous sprints if requested
      if (options.compare) {
        await this.comparePreviousSprints(milestones, analysis);
      }
      
      // Provide recommendations
      this.provideRecommendations(analysis);
      
    } catch (error) {
      this.log(`Failed to review sprint: ${error.message}`, 'error');
    }
  }

  async getMilestones() {
    try {
      const result = await this.exec('gh api repos/{owner}/{repo}/milestones --jq \'.[] | {title: .title, state: .state, due_on: .due_on, open_issues: .open_issues, closed_issues: .closed_issues, created_at: .created_at, updated_at: .updated_at, description: .description}\'', { silent: true });
      
      return result.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async selectMilestone(providedMilestone, milestones) {
    if (providedMilestone) {
      const milestone = milestones.find(m => m.title === providedMilestone);
      if (!milestone) {
        this.log(`Milestone "${providedMilestone}" not found`, 'error');
        return null;
      }
      return milestone;
    }

    // Show available milestones
    console.log(chalk.yellow('📋 Available Milestones:'));
    milestones.forEach((m, index) => {
      const status = m.state === 'open' ? chalk.green('Open') : chalk.gray('Closed');
      const issues = `${m.closed_issues + m.open_issues} issues`;
      console.log(`  ${index + 1}. ${chalk.cyan(m.title)} - ${status} (${issues})`);
    });

    const { selectedIndex } = await this.prompt([{
      type: 'list',
      name: 'selectedIndex',
      message: 'Select milestone to review:',
      choices: milestones.map((m, index) => ({
        name: `${m.title} (${m.state}) - ${m.closed_issues + m.open_issues} issues`,
        value: index
      }))
    }]);

    return milestones[selectedIndex];
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

  analyzeSprintPerformance(issues, milestone) {
    const completed = issues.filter(i => i.state === 'closed');
    const open = issues.filter(i => i.state === 'open');
    const total = issues.length;

    // Calculate story points
    const completedPoints = completed.reduce((sum, issue) => sum + this.calculateStoryPoints(issue), 0);
    const totalPoints = issues.reduce((sum, issue) => sum + this.calculateStoryPoints(issue), 0);
    const remainingPoints = totalPoints - completedPoints;

    // Calculate progress percentage
    const progressPercentage = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    const pointsPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    // Calculate sprint duration
    const startDate = new Date(milestone.created_at);
    const dueDate = milestone.due_on ? new Date(milestone.due_on) : new Date();
    const currentDate = new Date();
    
    const totalDuration = dueDate - startDate;
    const elapsedDuration = currentDate - startDate;
    const remainingDuration = Math.max(0, dueDate - currentDate);
    
    const daysTotal = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil(elapsedDuration / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil(remainingDuration / (1000 * 60 * 60 * 24));

    return {
      issues: { completed: completed.length, open: open.length, total },
      storyPoints: { completed: completedPoints, total: totalPoints, remaining: remainingPoints },
      progress: { issues: progressPercentage, points: pointsPercentage },
      timeline: { total: daysTotal, elapsed: daysElapsed, remaining: daysRemaining },
      isOverdue: daysRemaining < 0,
      completedIssues: completed,
      openIssues: open
    };
  }

  async displaySprintOverview(milestone, analysis) {
    console.log(chalk.white(`🎯 Sprint: ${milestone.title}`));
    
    if (milestone.description) {
      console.log(chalk.gray(`   ${milestone.description}`));
    }
    
    console.log(chalk.white(`📅 Timeline: ${analysis.timeline.elapsed}/${analysis.timeline.total} days`));
    
    if (analysis.isOverdue) {
      console.log(chalk.red(`⚠️  Sprint is ${Math.abs(analysis.timeline.remaining)} days overdue`));
    } else if (analysis.timeline.remaining > 0) {
      console.log(chalk.gray(`   ${analysis.timeline.remaining} days remaining`));
    } else {
      console.log(chalk.green(`✅ Sprint completed on time`));
    }

    // Progress bars
    console.log(chalk.yellow('\n📊 Progress Overview:'));
    
    // Issues progress
    const issuesBar = this.createProgressBar(analysis.progress.issues, 20);
    console.log(`  Issues: ${issuesBar} ${analysis.progress.issues}% (${analysis.issues.completed}/${analysis.issues.total})`);
    
    // Story points progress  
    const pointsBar = this.createProgressBar(analysis.progress.points, 20);
    console.log(`  Points: ${pointsBar} ${analysis.progress.points}% (${analysis.storyPoints.completed}/${analysis.storyPoints.total})`);

    // Sprint state
    if (milestone.state === 'closed') {
      console.log(chalk.green('\n🎉 Sprint Status: Completed'));
    } else if (analysis.isOverdue) {
      console.log(chalk.red('\n⚠️  Sprint Status: Overdue'));
    } else {
      console.log(chalk.yellow('\n🔄 Sprint Status: In Progress'));
    }
  }

  async displayDetailedBreakdown(issues, analysis) {
    console.log(chalk.yellow('\n📋 Detailed Issue Breakdown:'));

    // Completed issues
    if (analysis.completedIssues.length > 0) {
      console.log(chalk.green('\n✅ Completed Issues:'));
      analysis.completedIssues.forEach(issue => {
        const points = this.calculateStoryPoints(issue);
        const closedDate = issue.closedAt ? this.formatDate(new Date(issue.closedAt)) : 'Unknown';
        console.log(chalk.gray(`  • #${issue.number} ${issue.title} (${points} pts) - ${closedDate}`));
      });
    }

    // Open issues
    if (analysis.openIssues.length > 0) {
      console.log(chalk.yellow('\n⏳ Remaining Issues:'));
      analysis.openIssues.forEach(issue => {
        const points = this.calculateStoryPoints(issue);
        const assignees = issue.assignees?.map(a => a.login).join(', ') || 'Unassigned';
        console.log(chalk.gray(`  • #${issue.number} ${issue.title} (${points} pts) - ${assignees}`));
      });
    }
  }

  async displayVelocityMetrics(milestone, analysis) {
    console.log(chalk.yellow('\n📈 Velocity Metrics:'));
    
    // Current sprint velocity
    const sprintVelocity = analysis.storyPoints.completed;
    console.log(`  Current sprint velocity: ${chalk.cyan(sprintVelocity)} story points`);
    
    // Velocity per day
    const dailyVelocity = analysis.timeline.elapsed > 0 ? 
      (sprintVelocity / analysis.timeline.elapsed).toFixed(1) : 0;
    console.log(`  Daily velocity: ${chalk.cyan(dailyVelocity)} points/day`);
    
    // Projected completion
    if (analysis.storyPoints.remaining > 0 && dailyVelocity > 0) {
      const projectedDays = Math.ceil(analysis.storyPoints.remaining / dailyVelocity);
      console.log(`  Projected completion: ${chalk.cyan(projectedDays)} more days`);
      
      if (projectedDays > analysis.timeline.remaining) {
        console.log(chalk.red(`  ⚠️  Risk: May need ${projectedDays - analysis.timeline.remaining} extra days`));
      }
    }

    // Completion rate
    const completionRate = analysis.issues.total > 0 ? 
      (analysis.issues.completed / analysis.timeline.elapsed).toFixed(1) : 0;
    console.log(`  Issue completion rate: ${chalk.cyan(completionRate)} issues/day`);
  }

  async identifyBlockersAndRisks(issues) {
    const openIssues = issues.filter(i => i.state === 'open');
    
    if (openIssues.length === 0) return;

    // Identify potential blockers
    const blockers = [];
    const oldIssues = [];
    
    openIssues.forEach(issue => {
      const createdDate = new Date(issue.createdAt);
      const daysSinceCreated = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
      
      // Issues created more than 7 days ago might be blockers
      if (daysSinceCreated > 7) {
        oldIssues.push({ ...issue, daysOld: daysSinceCreated });
      }
      
      // Check for blocker labels
      const hasBlockerLabel = issue.labels?.some(label => 
        ['blocker', 'blocked', 'dependency', 'waiting'].includes(label.name.toLowerCase())
      );
      
      if (hasBlockerLabel) {
        blockers.push(issue);
      }
    });

    if (blockers.length > 0 || oldIssues.length > 0) {
      console.log(chalk.red('\n🚫 Potential Blockers & Risks:'));
      
      blockers.forEach(issue => {
        console.log(chalk.red(`  🚨 #${issue.number} ${issue.title} (labeled as blocker)`));
      });
      
      oldIssues.forEach(issue => {
        console.log(chalk.yellow(`  ⏰ #${issue.number} ${issue.title} (${issue.daysOld} days old)`));
      });
    }
  }

  async comparePreviousSprints(milestones, currentAnalysis) {
    // Get completed milestones for comparison
    const completedMilestones = milestones.filter(m => m.state === 'closed').slice(0, 3);
    
    if (completedMilestones.length === 0) {
      console.log(chalk.gray('\n📊 No previous sprints to compare'));
      return;
    }

    console.log(chalk.yellow('\n📊 Sprint Comparison:'));
    
    // Compare velocity with previous sprints
    const previousVelocities = [];
    
    for (const milestone of completedMilestones) {
      const issues = await this.getMilestoneIssues(milestone.title);
      const completedPoints = issues
        .filter(i => i.state === 'closed')
        .reduce((sum, issue) => sum + this.calculateStoryPoints(issue), 0);
      
      previousVelocities.push({
        sprint: milestone.title,
        velocity: completedPoints
      });
    }

    // Display comparison
    previousVelocities.forEach(sprint => {
      const comparison = currentAnalysis.storyPoints.completed - sprint.velocity;
      const trend = comparison > 0 ? chalk.green(`+${comparison}`) : 
                   comparison < 0 ? chalk.red(`${comparison}`) : chalk.gray('=');
      
      console.log(`  ${sprint.sprint}: ${chalk.cyan(sprint.velocity)} pts ${trend}`);
    });

    // Calculate average
    const avgVelocity = previousVelocities.length > 0 ? 
      (previousVelocities.reduce((sum, s) => sum + s.velocity, 0) / previousVelocities.length).toFixed(1) : 0;
    
    console.log(chalk.gray(`  Average velocity: ${avgVelocity} pts`));
    
    const currentVelocity = currentAnalysis.storyPoints.completed;
    if (currentVelocity > avgVelocity) {
      console.log(chalk.green(`  📈 Current sprint is ${(currentVelocity - avgVelocity).toFixed(1)} pts above average`));
    } else if (currentVelocity < avgVelocity) {
      console.log(chalk.yellow(`  📉 Current sprint is ${(avgVelocity - currentVelocity).toFixed(1)} pts below average`));
    }
  }

  provideRecommendations(analysis) {
    console.log(chalk.gray('\n💡 Recommendations:'));

    // Completion rate recommendations
    if (analysis.progress.issues < 50 && analysis.timeline.remaining < 2) {
      console.log(chalk.gray('  • Consider moving some issues to next sprint'));
    }
    
    if (analysis.progress.points > analysis.progress.issues) {
      console.log(chalk.gray('  • Team is completing larger stories efficiently'));
    }
    
    if (analysis.openIssues.length > 0) {
      const unassigned = analysis.openIssues.filter(i => !i.assignees || i.assignees.length === 0);
      if (unassigned.length > 0) {
        console.log(chalk.gray(`  • Assign ${unassigned.length} unassigned issues`));
      }
    }
    
    if (analysis.isOverdue) {
      console.log(chalk.gray('  • Review sprint planning process for better estimation'));
    }
    
    // General recommendations
    console.log(chalk.gray('  • Review and update issue statuses regularly'));
    console.log(chalk.gray('  • Consider holding daily standups to identify blockers early'));
    
    if (analysis.progress.issues >= 80) {
      console.log(chalk.gray('  • Great progress! Consider planning next sprint'));
    }
  }

  createProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    let color = chalk.red;
    if (percentage >= 80) color = chalk.green;
    else if (percentage >= 60) color = chalk.yellow;
    
    return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  calculateStoryPoints(issue) {
    // Extract story points from labels (same logic as plan command)
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
    
    // Default estimation
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