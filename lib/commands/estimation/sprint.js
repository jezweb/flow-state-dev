/**
 * Estimation Sprint command - Calculate sprint capacity and velocity
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class EstimationSprintCommand extends GitHubSlashCommand {
  constructor() {
    super('/estimate:sprint', 'Calculate sprint capacity and velocity', {
      aliases: ['/est:sprint', '/est:s'],
      category: 'estimation',
      usage: '/estimate:sprint [options]',
      examples: [
        'fsd slash "/estimate:sprint"',
        'fsd slash "/estimate:sprint --milestone Sprint-1"',
        'fsd slash "/estimate:sprint --history 5"',
        'fsd slash "/estimate:sprint --capacity 40 --team-size 4"'
      ],
      options: [
        { name: 'milestone', type: 'string', description: 'Current sprint milestone name' },
        { name: 'history', type: 'number', description: 'Number of past sprints to analyze', default: 3 },
        { name: 'capacity', type: 'number', description: 'Planned sprint capacity (story points)' },
        { name: 'team-size', type: 'number', description: 'Team size for capacity calculation' },
        { name: 'velocity-only', type: 'boolean', description: 'Only show velocity analysis' },
        { name: 'forecast', type: 'boolean', description: 'Include forecasting for future sprints' }
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('📊 Sprint Capacity & Velocity Analysis\n'));
    
    try {
      // Get milestones (sprints)
      const milestones = await this.getMilestones();
      
      if (milestones.length === 0) {
        console.log(chalk.yellow('No milestones found for sprint analysis'));
        console.log(chalk.gray('\nTo use sprint estimation:'));
        console.log(chalk.gray('  1. Create sprint milestones in GitHub'));
        console.log(chalk.gray('  2. Assign issues to milestones'));
        console.log(chalk.gray('  3. Use story point labels (e.g., "points:3")'));
        return;
      }

      // Determine current sprint
      const currentSprint = await this.getCurrentSprint(options.milestone, milestones);
      
      if (!currentSprint) {
        console.log(chalk.yellow('No current sprint specified'));
        await this.showSprintSelection(milestones, options);
        return;
      }

      // Analyze sprint data
      const sprintAnalysis = await this.analyzeSprintData(currentSprint, milestones, options);
      
      // Display results
      if (!options['velocity-only']) {
        await this.displayCurrentSprintAnalysis(sprintAnalysis.current, options);
      }
      
      await this.displayVelocityAnalysis(sprintAnalysis.velocity, options);
      
      if (options.forecast) {
        await this.displayForecast(sprintAnalysis, options);
      }
      
      // Provide recommendations
      this.provideSprintRecommendations(sprintAnalysis, options);

    } catch (error) {
      this.log(`Failed to analyze sprint capacity: ${error.message}`, 'error');
    }
  }

  async getMilestones() {
    try {
      const result = await this.exec('gh api repos/{owner}/{repo}/milestones --jq \'.[] | {title: .title, state: .state, due_on: .due_on, open_issues: .open_issues, closed_issues: .closed_issues, created_at: .created_at, updated_at: .updated_at, number: .number}\'', { silent: true });
      
      return result.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Most recent first
    } catch (error) {
      return [];
    }
  }

  async getCurrentSprint(specifiedMilestone, milestones) {
    if (specifiedMilestone) {
      return milestones.find(m => m.title === specifiedMilestone);
    }
    
    // Find the most recent open milestone or the most recently updated one
    const openMilestones = milestones.filter(m => m.state === 'open');
    if (openMilestones.length > 0) {
      return openMilestones[0]; // Most recent open milestone
    }
    
    // If no open milestones, return the most recently updated one
    return milestones[0];
  }

  async showSprintSelection(milestones, options) {
    console.log(chalk.yellow('📋 Available Milestones:'));
    milestones.slice(0, 10).forEach((m, index) => {
      const totalIssues = m.open_issues + m.closed_issues;
      const status = m.state === 'open' ? chalk.green('Open') : chalk.gray('Closed');
      console.log(`  ${index + 1}. ${chalk.cyan(m.title)} - ${status} (${totalIssues} issues)`);
    });

    const { selectedMilestone } = await this.prompt([{
      type: 'list',
      name: 'selectedMilestone',
      message: 'Select milestone to analyze:',
      choices: milestones.slice(0, 10).map(m => ({
        name: `${m.title} (${m.state}) - ${m.open_issues + m.closed_issues} issues`,
        value: m.title
      }))
    }]);

    // Re-run analysis with selected milestone
    options.milestone = selectedMilestone;
    await this.execute(options);
  }

  async analyzeSprintData(currentSprint, allMilestones, options) {
    const historyCount = options.history || 3;
    
    // Get completed milestones for velocity calculation
    const completedMilestones = allMilestones
      .filter(m => m.state === 'closed')
      .slice(0, historyCount);

    // Analyze current sprint
    const currentAnalysis = await this.analyzeCurrentSprint(currentSprint, options);
    
    // Analyze velocity from historical data
    const velocityAnalysis = await this.analyzeVelocityTrends(completedMilestones);
    
    // Calculate team capacity if team size provided
    const capacityAnalysis = this.analyzeTeamCapacity(options);

    return {
      current: currentAnalysis,
      velocity: velocityAnalysis,
      capacity: capacityAnalysis,
      milestones: { current: currentSprint, completed: completedMilestones }
    };
  }

  async analyzeCurrentSprint(sprint, options) {
    // Get issues for current sprint
    const issues = await this.getSprintIssues(sprint.title);
    
    // Calculate story points
    const completedIssues = issues.filter(i => i.state === 'closed');
    const openIssues = issues.filter(i => i.state === 'open');
    
    const completedPoints = this.calculateTotalStoryPoints(completedIssues);
    const openPoints = this.calculateTotalStoryPoints(openIssues);
    const totalPoints = completedPoints + openPoints;
    
    // Calculate progress
    const progressPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;
    
    // Calculate burn rate if sprint has due date
    let burnRate = null;
    let projectedCompletion = null;
    
    if (sprint.due_on && sprint.created_at) {
      const sprintStart = new Date(sprint.created_at);
      const sprintEnd = new Date(sprint.due_on);
      const now = new Date();
      
      const totalDuration = sprintEnd - sprintStart;
      const elapsed = now - sprintStart;
      const remaining = sprintEnd - now;
      
      const elapsedPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
      
      if (elapsedPercentage > 0) {
        burnRate = completedPoints / (elapsedPercentage / 100);
        
        if (openPoints > 0 && burnRate > 0) {
          const remainingDays = openPoints / (burnRate / (totalDuration / (1000 * 60 * 60 * 24)));
          projectedCompletion = new Date(now.getTime() + (remainingDays * 24 * 60 * 60 * 1000));
        }
      }
    }

    return {
      sprint,
      issues: { total: issues.length, completed: completedIssues.length, open: openIssues.length },
      storyPoints: { total: totalPoints, completed: completedPoints, open: openPoints },
      progress: progressPercentage,
      burnRate,
      projectedCompletion,
      timeline: this.calculateSprintTimeline(sprint)
    };
  }

  async analyzeVelocityTrends(completedMilestones) {
    if (completedMilestones.length === 0) {
      return {
        sprints: [],
        averageVelocity: 0,
        trend: 'insufficient-data',
        stability: 'unknown'
      };
    }

    const sprintVelocities = [];
    
    for (const milestone of completedMilestones) {
      const issues = await this.getSprintIssues(milestone.title, true); // Include closed issues
      const completedIssues = issues.filter(i => i.state === 'closed');
      const velocity = this.calculateTotalStoryPoints(completedIssues);
      
      sprintVelocities.push({
        sprint: milestone.title,
        velocity,
        issueCount: completedIssues.length,
        duration: this.calculateSprintDuration(milestone)
      });
    }

    // Calculate metrics
    const velocities = sprintVelocities.map(s => s.velocity);
    const averageVelocity = velocities.length > 0 ? velocities.reduce((sum, v) => sum + v, 0) / velocities.length : 0;
    
    // Calculate trend
    let trend = 'stable';
    if (velocities.length >= 2) {
      const recent = velocities.slice(0, Math.ceil(velocities.length / 2));
      const older = velocities.slice(Math.ceil(velocities.length / 2));
      
      const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
      const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
      
      const trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
      
      if (trendPercentage > 10) trend = 'improving';
      else if (trendPercentage < -10) trend = 'declining';
    }

    // Calculate stability (coefficient of variation)
    const stdDev = this.calculateStandardDeviation(velocities);
    const stability = averageVelocity > 0 ? (stdDev / averageVelocity) : 1;
    const stabilityLevel = stability < 0.2 ? 'high' : stability < 0.4 ? 'medium' : 'low';

    return {
      sprints: sprintVelocities,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
      trend,
      stability: stabilityLevel,
      stabilityScore: Math.round(stability * 100) / 100
    };
  }

  analyzeTeamCapacity(options) {
    if (!options['team-size']) {
      return null;
    }

    const teamSize = options['team-size'];
    const targetCapacity = options.capacity;
    
    // Calculate capacity per person (assuming typical sprint)
    const typicalCapacityPerPerson = 10; // Story points per person per sprint
    const calculatedCapacity = teamSize * typicalCapacityPerPerson;
    
    return {
      teamSize,
      calculatedCapacity,
      targetCapacity,
      capacityPerPerson: calculatedCapacity / teamSize,
      utilizationTarget: targetCapacity ? (targetCapacity / calculatedCapacity) * 100 : null
    };
  }

  async displayCurrentSprintAnalysis(analysis, options) {
    const { sprint, issues, storyPoints, progress, timeline } = analysis;
    
    console.log(chalk.white(`🎯 Current Sprint: ${sprint.title}`));
    console.log(chalk.gray(`   State: ${sprint.state} | Created: ${this.formatDate(new Date(sprint.created_at))}`));
    
    if (sprint.due_on) {
      const dueDate = new Date(sprint.due_on);
      const isOverdue = dueDate < new Date();
      console.log(chalk.gray(`   Due: ${this.formatDate(dueDate)} ${isOverdue ? chalk.red('(OVERDUE)') : ''}`));
    }

    console.log(chalk.yellow('\n📊 Sprint Progress:'));
    
    // Progress bar
    const progressBar = this.createProgressBar(progress, 20);
    console.log(`  Progress: ${progressBar} ${progress}%`);
    
    console.log(`  Issues: ${chalk.green(issues.completed)}/${issues.total} completed`);
    console.log(`  Story Points: ${chalk.green(storyPoints.completed)}/${storyPoints.total} completed`);
    
    if (storyPoints.open > 0) {
      console.log(`  Remaining: ${chalk.yellow(storyPoints.open)} story points`);
    }

    // Timeline analysis
    if (timeline.daysElapsed !== null) {
      console.log(chalk.yellow('\n⏰ Timeline:'));
      console.log(`  Days elapsed: ${chalk.cyan(timeline.daysElapsed)}/${timeline.totalDays}`);
      console.log(`  Days remaining: ${chalk.cyan(timeline.daysRemaining)}`);
      
      if (timeline.daysRemaining < 0) {
        console.log(chalk.red(`  ⚠️  Sprint is ${Math.abs(timeline.daysRemaining)} days overdue`));
      }
    }

    // Burn rate and projection
    if (analysis.burnRate) {
      console.log(chalk.yellow('\n🔥 Burn Rate:'));
      console.log(`  Current velocity: ${chalk.cyan(analysis.burnRate.toFixed(1))} pts/sprint`);
      
      if (analysis.projectedCompletion) {
        const projectionDate = analysis.projectedCompletion;
        const isLate = projectionDate > new Date(sprint.due_on);
        console.log(`  Projected completion: ${this.formatDate(projectionDate)} ${isLate ? chalk.red('(LATE)') : chalk.green('(ON TIME)')}`);
      }
    }
  }

  async displayVelocityAnalysis(analysis, options) {
    console.log(chalk.yellow('\n📈 Velocity Analysis:'));
    
    if (analysis.sprints.length === 0) {
      console.log(chalk.gray('  No completed sprints available for velocity analysis'));
      console.log(chalk.gray('  Complete at least one sprint to see velocity trends'));
      return;
    }

    console.log(`  Average velocity: ${chalk.cyan(analysis.averageVelocity)} story points`);
    console.log(`  Velocity trend: ${this.formatTrend(analysis.trend)}`);
    console.log(`  Consistency: ${this.formatStability(analysis.stability)} (${analysis.stabilityScore})`);
    
    console.log(chalk.yellow('\n📋 Recent Sprint History:'));
    analysis.sprints.forEach((sprint, index) => {
      const trendIcon = index === 0 ? '📍' : 
                       sprint.velocity > analysis.averageVelocity ? '📈' : 
                       sprint.velocity < analysis.averageVelocity ? '📉' : '➡️';
      
      console.log(`  ${trendIcon} ${sprint.sprint}: ${chalk.cyan(sprint.velocity)} pts (${sprint.issueCount} issues)`);
    });

    // Velocity range analysis
    const velocities = analysis.sprints.map(s => s.velocity);
    const minVelocity = Math.min(...velocities);
    const maxVelocity = Math.max(...velocities);
    
    console.log(chalk.yellow('\n📊 Velocity Range:'));
    console.log(`  Range: ${chalk.cyan(minVelocity)} - ${chalk.cyan(maxVelocity)} story points`);
    console.log(`  Typical range: ${chalk.cyan(Math.round(analysis.averageVelocity * 0.8))} - ${chalk.cyan(Math.round(analysis.averageVelocity * 1.2))} story points`);
  }

  async displayForecast(sprintAnalysis, options) {
    const { velocity, current } = sprintAnalysis;
    
    if (velocity.averageVelocity === 0) {
      console.log(chalk.gray('\n🔮 Cannot provide forecast without velocity history'));
      return;
    }

    console.log(chalk.yellow('\n🔮 Sprint Forecast:'));
    
    // Forecast next few sprints based on current backlog
    const backlogIssues = await this.getBacklogIssues();
    const backlogPoints = this.calculateTotalStoryPoints(backlogIssues);
    
    console.log(`  Backlog size: ${chalk.cyan(backlogPoints)} story points`);
    console.log(`  Average velocity: ${chalk.cyan(velocity.averageVelocity)} pts/sprint`);
    
    if (backlogPoints > 0) {
      const estimatedSprints = Math.ceil(backlogPoints / velocity.averageVelocity);
      console.log(`  Estimated sprints to clear backlog: ${chalk.cyan(estimatedSprints)}`);
      
      // Show confidence based on velocity stability
      const confidence = velocity.stability === 'high' ? 'High' : 
                        velocity.stability === 'medium' ? 'Medium' : 'Low';
      console.log(`  Forecast confidence: ${this.formatStability(velocity.stability)} (${confidence})`);
    }

    // Capacity planning
    if (options.capacity || sprintAnalysis.capacity) {
      console.log(chalk.yellow('\n🎯 Capacity Planning:'));
      
      const targetCapacity = options.capacity || sprintAnalysis.capacity?.targetCapacity;
      if (targetCapacity) {
        const capacityVsVelocity = (targetCapacity / velocity.averageVelocity) * 100;
        console.log(`  Target capacity: ${chalk.cyan(targetCapacity)} story points`);
        console.log(`  vs Average velocity: ${this.formatCapacityComparison(capacityVsVelocity)}%`);
        
        if (capacityVsVelocity > 120) {
          console.log(chalk.red('  ⚠️  Target capacity may be too ambitious'));
        } else if (capacityVsVelocity < 80) {
          console.log(chalk.yellow('  💡 Target capacity is conservative'));
        } else {
          console.log(chalk.green('  ✅ Target capacity aligns with historical performance'));
        }
      }
    }
  }

  provideSprintRecommendations(sprintAnalysis, options) {
    console.log(chalk.gray('\n💡 Recommendations:'));
    
    const { current, velocity } = sprintAnalysis;
    
    // Current sprint recommendations
    if (current.progress < 30 && current.timeline.daysRemaining < 3) {
      console.log(chalk.gray('  • Consider moving some issues to next sprint'));
    }
    
    if (current.burnRate && current.projectedCompletion) {
      const isLate = current.projectedCompletion > new Date(current.sprint.due_on);
      if (isLate) {
        console.log(chalk.gray('  • Focus on completing highest priority issues'));
        console.log(chalk.gray('  • Consider reducing scope for current sprint'));
      }
    }
    
    // Velocity recommendations
    if (velocity.trend === 'declining') {
      console.log(chalk.gray('  • Investigate causes of declining velocity'));
      console.log(chalk.gray('  • Review team capacity and blockers'));
    } else if (velocity.trend === 'improving') {
      console.log(chalk.gray('  • Great progress! Consider gradually increasing capacity'));
    }
    
    if (velocity.stability === 'low') {
      console.log(chalk.gray('  • Work on making sprint commitments more predictable'));
      console.log(chalk.gray('  • Improve story point estimation accuracy'));
    }
    
    // General recommendations
    console.log(chalk.gray('  • Track velocity over time for better planning'));
    console.log(chalk.gray('  • Use story points consistently across all issues'));
    console.log(chalk.gray('  • Hold regular retrospectives to improve process'));
  }

  async getSprintIssues(milestoneTitle, includeAll = false) {
    try {
      const state = includeAll ? 'all' : 'open';
      const result = await this.exec(`gh issue list --milestone "${milestoneTitle}" --state ${state} --json number,title,state,labels,closedAt`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async getBacklogIssues() {
    try {
      const result = await this.exec('gh issue list --state open --json number,title,labels,milestone', { silent: true });
      const allIssues = JSON.parse(result);
      
      // Filter issues without milestones (backlog)
      return allIssues.filter(issue => !issue.milestone);
    } catch (error) {
      return [];
    }
  }

  calculateTotalStoryPoints(issues) {
    return issues.reduce((total, issue) => {
      const points = this.extractStoryPoints(issue);
      return total + (points || 0);
    }, 0);
  }

  extractStoryPoints(issue) {
    const labels = issue.labels?.map(l => l.name) || [];
    
    for (const label of labels) {
      const patterns = [
        /^(\d+)\s*points?$/i,
        /^points?:?\s*(\d+)$/i,
        /^sp[-:]?(\d+)$/i,
        /^size:(\d+)$/i,
        /^(\d+)[-_]?pts?$/i
      ];
      
      for (const pattern of patterns) {
        const match = label.match(pattern);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }
    
    return null;
  }

  calculateSprintTimeline(sprint) {
    if (!sprint.created_at || !sprint.due_on) {
      return { daysElapsed: null, totalDays: null, daysRemaining: null };
    }
    
    const start = new Date(sprint.created_at);
    const end = new Date(sprint.due_on);
    const now = new Date();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    const remaining = end - now;
    
    return {
      daysElapsed: Math.max(0, Math.ceil(elapsed / (1000 * 60 * 60 * 24))),
      totalDays: Math.ceil(totalDuration / (1000 * 60 * 60 * 24)),
      daysRemaining: Math.ceil(remaining / (1000 * 60 * 60 * 24))
    };
  }

  calculateSprintDuration(milestone) {
    if (!milestone.created_at || !milestone.updated_at) {
      return null;
    }
    
    const start = new Date(milestone.created_at);
    const end = new Date(milestone.updated_at);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  createProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    let color = chalk.red;
    if (percentage >= 80) color = chalk.green;
    else if (percentage >= 60) color = chalk.yellow;
    
    return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  formatTrend(trend) {
    switch (trend) {
      case 'improving':
        return chalk.green('📈 Improving');
      case 'declining':
        return chalk.red('📉 Declining');
      case 'stable':
        return chalk.yellow('➡️ Stable');
      default:
        return chalk.gray('❓ Unknown');
    }
  }

  formatStability(stability) {
    switch (stability) {
      case 'high':
        return chalk.green('High');
      case 'medium':
        return chalk.yellow('Medium');
      case 'low':
        return chalk.red('Low');
      default:
        return chalk.gray('Unknown');
    }
  }

  formatCapacityComparison(percentage) {
    if (percentage > 120) return chalk.red(percentage.toFixed(0));
    if (percentage < 80) return chalk.yellow(percentage.toFixed(0));
    return chalk.green(percentage.toFixed(0));
  }
}