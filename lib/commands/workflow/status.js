/**
 * Workflow status command - analyze CI/CD workflow performance
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class WorkflowStatusCommand extends GitHubSlashCommand {
  constructor() {
    super('/workflow:status', 'Analyze CI/CD workflow performance and health', {
      aliases: ['/w:s'],
      category: 'workflow',
      usage: '/workflow:status [options]',
      examples: [
        'fsd slash "/workflow:status"',
        'fsd slash "/workflow:status --period month"',
        'fsd slash "/workflow:status --workflow release"'
      ],
      options: [
        { name: 'period', type: 'string', description: 'Analysis period (week, month, all)' },
        { name: 'workflow', type: 'string', description: 'Specific workflow to analyze' },
        { name: 'branch', type: 'string', description: 'Branch to analyze (default: main)' }
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🔄 Workflow Status Analysis\n'));
    
    try {
      const period = options.period || 'week';
      const branch = options.branch || 'main';
      const specificWorkflow = options.workflow;
      
      // Get workflow runs
      const runs = await this.getWorkflowRuns(period, branch, specificWorkflow);
      
      if (runs.length === 0) {
        console.log(chalk.gray('No workflow runs found for the specified period.'));
        return;
      }
      
      // Analyze runs
      const analysis = this.analyzeWorkflowRuns(runs);
      
      // Display overall health
      console.log(chalk.yellow('🏥 Overall Health:'));
      this.displayHealthScore(analysis.health);
      
      // Success rates
      console.log(chalk.yellow('\n📊 Success Rates:'));
      Object.entries(analysis.byWorkflow).forEach(([workflow, stats]) => {
        const rate = ((stats.success / stats.total) * 100).toFixed(1);
        const color = rate >= 90 ? chalk.green : rate >= 70 ? chalk.yellow : chalk.red;
        console.log(`  ${workflow}: ${color(rate + '%')} (${stats.success}/${stats.total})`);
      });
      
      // Recent runs
      console.log(chalk.yellow('\n🕐 Recent Runs:'));
      runs.slice(0, 10).forEach(run => {
        const status = this.getStatusIcon(run.conclusion);
        const duration = this.formatDuration(run.duration);
        console.log(`  ${status} ${run.name} - ${chalk.gray(run.branch)} - ${duration}`);
        
        if (run.conclusion === 'failure') {
          console.log(chalk.red(`     Failed at: ${run.failedStep || 'Unknown step'}`));
        }
      });
      
      // Failure patterns
      if (analysis.failures.length > 0) {
        console.log(chalk.yellow('\n⚠️  Failure Patterns:'));
        const patterns = this.identifyFailurePatterns(analysis.failures);
        
        patterns.slice(0, 5).forEach(pattern => {
          console.log(`  • ${chalk.red(pattern.type)}: ${pattern.count} occurrences`);
          console.log(chalk.gray(`    ${pattern.description}`));
        });
      }
      
      // Performance trends
      console.log(chalk.yellow('\n⚡ Performance Trends:'));
      console.log(`  Average duration: ${chalk.cyan(this.formatDuration(analysis.avgDuration))}`);
      console.log(`  Median duration: ${chalk.cyan(this.formatDuration(analysis.medianDuration))}`);
      
      if (analysis.trend) {
        const trendIcon = analysis.trend > 0 ? '📈' : '📉';
        const trendColor = analysis.trend > 0 ? chalk.red : chalk.green;
        console.log(`  Trend: ${trendIcon} ${trendColor(Math.abs(analysis.trend) + '% ' + (analysis.trend > 0 ? 'slower' : 'faster'))}`);
      }
      
      // Recommendations
      console.log(chalk.gray('\n💡 Recommendations:'));
      this.generateWorkflowRecommendations(analysis);
      
    } catch (error) {
      this.log(`Failed to analyze workflow status: ${error.message}`, 'error');
    }
  }

  async getWorkflowRuns(period, branch, workflow) {
    try {
      // Calculate date range
      const since = this.calculateSinceDate(period);
      
      // Build query
      let query = `gh run list --branch ${branch} --json name,conclusion,createdAt,updatedAt,displayTitle,workflowName,headBranch,status`;
      
      if (workflow) {
        query += ` --workflow "${workflow}"`;
      }
      
      query += ' --limit 100';
      
      const result = await this.exec(query, { silent: true });
      const allRuns = JSON.parse(result);
      
      // Filter by date and enrich data
      const runs = allRuns
        .filter(run => new Date(run.createdAt) >= since)
        .map(run => ({
          name: run.workflowName,
          conclusion: run.conclusion || run.status,
          branch: run.headBranch,
          createdAt: new Date(run.createdAt),
          updatedAt: new Date(run.updatedAt),
          duration: new Date(run.updatedAt) - new Date(run.createdAt),
          title: run.displayTitle
        }));
      
      // Sort by creation date (newest first)
      runs.sort((a, b) => b.createdAt - a.createdAt);
      
      return runs;
    } catch (error) {
      console.log(chalk.yellow('Unable to fetch workflow runs from GitHub.'));
      return [];
    }
  }

  calculateSinceDate(period) {
    const now = new Date();
    
    switch (period) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'all':
        return new Date(0);
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }

  analyzeWorkflowRuns(runs) {
    const analysis = {
      total: runs.length,
      successful: 0,
      failed: 0,
      cancelled: 0,
      health: 0,
      byWorkflow: {},
      failures: [],
      durations: [],
      avgDuration: 0,
      medianDuration: 0,
      trend: null
    };
    
    // Analyze each run
    runs.forEach(run => {
      // Overall stats
      if (run.conclusion === 'success') {
        analysis.successful++;
      } else if (run.conclusion === 'failure') {
        analysis.failed++;
        analysis.failures.push(run);
      } else if (run.conclusion === 'cancelled') {
        analysis.cancelled++;
      }
      
      // By workflow stats
      if (!analysis.byWorkflow[run.name]) {
        analysis.byWorkflow[run.name] = {
          total: 0,
          success: 0,
          failed: 0,
          cancelled: 0
        };
      }
      
      analysis.byWorkflow[run.name].total++;
      if (run.conclusion === 'success') {
        analysis.byWorkflow[run.name].success++;
      } else if (run.conclusion === 'failure') {
        analysis.byWorkflow[run.name].failed++;
      } else if (run.conclusion === 'cancelled') {
        analysis.byWorkflow[run.name].cancelled++;
      }
      
      // Duration tracking
      if (run.duration > 0) {
        analysis.durations.push(run.duration);
      }
    });
    
    // Calculate health score (0-100)
    if (analysis.total > 0) {
      analysis.health = Math.round((analysis.successful / analysis.total) * 100);
    }
    
    // Calculate duration metrics
    if (analysis.durations.length > 0) {
      analysis.avgDuration = analysis.durations.reduce((a, b) => a + b, 0) / analysis.durations.length;
      analysis.durations.sort((a, b) => a - b);
      analysis.medianDuration = analysis.durations[Math.floor(analysis.durations.length / 2)];
      
      // Calculate trend (compare recent vs older runs)
      if (analysis.durations.length > 10) {
        const recent = analysis.durations.slice(0, 5);
        const older = analysis.durations.slice(-5);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        analysis.trend = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
      }
    }
    
    return analysis;
  }

  displayHealthScore(score) {
    const maxScore = 100;
    const percentage = score;
    const filled = Math.round((score / maxScore) * 20);
    const empty = 20 - filled;
    
    let color;
    if (score >= 90) color = chalk.green;
    else if (score >= 70) color = chalk.yellow;
    else color = chalk.red;
    
    const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    
    console.log(`  ${bar} ${color(percentage + '%')}`);
    
    if (score >= 90) {
      console.log(chalk.green('  Status: Excellent'));
    } else if (score >= 70) {
      console.log(chalk.yellow('  Status: Good, needs attention'));
    } else {
      console.log(chalk.red('  Status: Poor, immediate action needed'));
    }
  }

  getStatusIcon(conclusion) {
    switch (conclusion) {
      case 'success':
        return chalk.green('✅');
      case 'failure':
        return chalk.red('❌');
      case 'cancelled':
        return chalk.gray('⭕');
      case 'in_progress':
        return chalk.yellow('🔄');
      default:
        return chalk.gray('❓');
    }
  }

  formatDuration(ms) {
    if (!ms || ms < 0) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  identifyFailurePatterns(failures) {
    const patterns = new Map();
    
    failures.forEach(failure => {
      // Simple pattern detection based on workflow name and branch
      const key = `${failure.name}-${failure.branch}`;
      
      if (!patterns.has(key)) {
        patterns.set(key, {
          type: failure.name,
          description: `Failures in ${failure.name} on ${failure.branch}`,
          count: 0,
          examples: []
        });
      }
      
      const pattern = patterns.get(key);
      pattern.count++;
      pattern.examples.push(failure);
    });
    
    // Convert to array and sort by count
    return Array.from(patterns.values())
      .sort((a, b) => b.count - a.count);
  }

  generateWorkflowRecommendations(analysis) {
    if (analysis.health < 70) {
      console.log(chalk.gray('  • Investigate and fix failing workflows urgently'));
    }
    
    if (analysis.failures.length > 5) {
      console.log(chalk.gray('  • Consider adding retry logic for flaky tests'));
    }
    
    if (analysis.avgDuration > 600000) { // 10 minutes
      console.log(chalk.gray('  • Optimize workflow performance with caching'));
      console.log(chalk.gray('  • Consider parallelizing test execution'));
    }
    
    if (Object.keys(analysis.byWorkflow).length > 10) {
      console.log(chalk.gray('  • Consider consolidating similar workflows'));
    }
    
    console.log(chalk.gray('  • Set up workflow failure notifications'));
    console.log(chalk.gray('  • Review workflow logs for optimization opportunities'));
  }
}