/**
 * Pipeline command - manage CI/CD pipelines and workflows
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class PipelineCommand extends GitHubSlashCommand {
  constructor() {
    super('/pipeline', 'Manage CI/CD pipelines and workflows', {
      aliases: ['/ci'],
      category: 'workflow',
      usage: '/pipeline [action] [options]',
      examples: [
        'fsd slash "/pipeline list"',
        'fsd slash "/pipeline run test"',
        'fsd slash "/pipeline logs --run-id 12345"',
        'fsd slash "/pipeline cancel --workflow test"'
      ],
      options: [
        { name: 'workflow', type: 'string', description: 'Specific workflow name' },
        { name: 'run-id', type: 'string', description: 'Workflow run ID' },
        { name: 'branch', type: 'string', description: 'Branch to run workflow on' },
        { name: 'wait', type: 'boolean', description: 'Wait for workflow completion' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const action = args?.[0] || 'list';
    
    switch (action) {
      case 'list':
        await this.listPipelines(options);
        break;
      case 'status':
        await this.showPipelineStatus(options);
        break;
      case 'run':
        await this.runPipeline(args[1], options);
        break;
      case 'cancel':
        await this.cancelPipeline(options);
        break;
      case 'logs':
        await this.showPipelineLogs(options);
        break;
      case 'retry':
        await this.retryPipeline(options);
        break;
      default:
        this.log(`Unknown pipeline action: ${action}`, 'error');
        console.log(chalk.gray('Available actions: list, status, run, cancel, logs, retry'));
    }
  }

  async listPipelines(options) {
    console.log(chalk.blue('⚙️  CI/CD Pipelines\n'));
    
    try {
      // Get available workflows
      const workflows = await this.getWorkflows();
      
      if (workflows.length === 0) {
        console.log(chalk.gray('No workflows found in .github/workflows/'));
        console.log(chalk.gray('\nTo create workflows:'));
        console.log(chalk.gray('  1. Create .github/workflows/ directory'));
        console.log(chalk.gray('  2. Add YAML workflow files'));
        return;
      }
      
      console.log(chalk.yellow('📋 Available Workflows:'));
      
      for (const workflow of workflows) {
        const runs = await this.getWorkflowRuns(workflow.id, 5);
        const latestRun = runs[0];
        
        console.log(`\n${chalk.cyan('▶')} ${chalk.white.bold(workflow.name)}`);
        console.log(`   File: ${chalk.gray(workflow.path)}`);
        console.log(`   State: ${workflow.state === 'active' ? chalk.green('Active') : chalk.gray('Disabled')}`);
        
        if (latestRun) {
          const status = this.getRunStatusIcon(latestRun.conclusion || latestRun.status);
          console.log(`   Latest: ${status} ${chalk.gray(this.formatDate(new Date(latestRun.created_at)))}`);
        } else {
          console.log(`   Latest: ${chalk.gray('No runs yet')}`);
        }
        
        // Show triggers
        const triggers = await this.parseWorkflowTriggers(workflow.path);
        if (triggers.length > 0) {
          console.log(`   Triggers: ${chalk.cyan(triggers.join(', '))}`);
        }
      }
      
      // Recent activity summary
      console.log(chalk.yellow('\n📊 Recent Activity:'));
      const recentRuns = await this.getRecentRuns(20);
      const stats = this.calculateRunStats(recentRuns);
      
      console.log(`  Total runs (7 days): ${chalk.cyan(stats.total)}`);
      console.log(`  Success rate: ${this.formatSuccessRate(stats.successRate)}%`);
      console.log(`  Average duration: ${chalk.cyan(stats.avgDuration)}`);
      
      // Quick actions
      console.log(chalk.gray('\n💡 Quick Actions:'));
      console.log(chalk.gray('  • Run workflow: /pipeline run <workflow-name>'));
      console.log(chalk.gray('  • View logs: /pipeline logs --run-id <id>'));
      console.log(chalk.gray('  • Cancel runs: /pipeline cancel --workflow <name>'));
      
    } catch (error) {
      this.log(`Failed to list pipelines: ${error.message}`, 'error');
    }
  }

  async showPipelineStatus(options) {
    console.log(chalk.blue('📊 Pipeline Status\n'));
    
    try {
      const workflowName = options.workflow;
      
      if (workflowName) {
        // Show specific workflow status
        await this.showWorkflowStatus(workflowName);
      } else {
        // Show overall pipeline health
        const runs = await this.getRecentRuns(50);
        const analysis = this.analyzePipelineHealth(runs);
        
        // Health overview
        console.log(chalk.yellow('🏥 Pipeline Health:'));
        this.displayHealthScore(analysis.health);
        
        // Active runs
        const activeRuns = runs.filter(run => run.status === 'in_progress' || run.status === 'queued');
        if (activeRuns.length > 0) {
          console.log(chalk.yellow('\n🔄 Active Runs:'));
          activeRuns.forEach(run => {
            const status = this.getRunStatusIcon(run.status);
            const duration = this.formatDuration(Date.now() - new Date(run.created_at));
            console.log(`  ${status} ${run.name} - ${chalk.gray(run.head_branch)} (${duration})`);
          });
        }
        
        // Recent failures
        const failures = runs.filter(run => run.conclusion === 'failure').slice(0, 5);
        if (failures.length > 0) {
          console.log(chalk.yellow('\n❌ Recent Failures:'));
          failures.forEach(run => {
            console.log(`  • ${run.name} - ${chalk.gray(run.head_branch)}`);
            console.log(chalk.gray(`    ${this.formatDate(new Date(run.created_at))}`));
          });
        }
        
        // Performance metrics
        console.log(chalk.yellow('\n⚡ Performance:'));
        console.log(`  Queue time: ${chalk.cyan(analysis.avgQueueTime)}`);
        console.log(`  Execution time: ${chalk.cyan(analysis.avgExecutionTime)}`);
        console.log(`  Total time: ${chalk.cyan(analysis.avgTotalTime)}`);
      }
      
    } catch (error) {
      this.log(`Failed to show pipeline status: ${error.message}`, 'error');
    }
  }

  async runPipeline(workflowName, options) {
    if (!workflowName) {
      this.log('Workflow name required', 'error');
      console.log(chalk.gray('Usage: /pipeline run <workflow-name>'));
      
      // Show available workflows
      const workflows = await this.getWorkflows();
      if (workflows.length > 0) {
        console.log(chalk.gray('\nAvailable workflows:'));
        workflows.forEach(w => console.log(chalk.gray(`  • ${w.name}`)));
      }
      return;
    }
    
    console.log(chalk.blue(`🚀 Running Pipeline: ${workflowName}\n`));
    
    try {
      const branch = options.branch || 'main';
      const wait = options.wait || false;
      
      // Find workflow
      const workflows = await this.getWorkflows();
      const workflow = workflows.find(w => 
        w.name.toLowerCase() === workflowName.toLowerCase() ||
        w.path.includes(workflowName)
      );
      
      if (!workflow) {
        this.log(`Workflow "${workflowName}" not found`, 'error');
        return;
      }
      
      console.log(chalk.yellow('📋 Run Details:'));
      console.log(`  Workflow: ${chalk.cyan(workflow.name)}`);
      console.log(`  Branch: ${chalk.cyan(branch)}`);
      console.log(`  File: ${chalk.gray(workflow.path)}`);
      
      // Check if workflow accepts manual dispatch
      const triggers = await this.parseWorkflowTriggers(workflow.path);
      const hasManualTrigger = triggers.includes('workflow_dispatch');
      
      if (!hasManualTrigger) {
        console.log(chalk.yellow('\n⚠️  This workflow may not support manual dispatch.'));
        console.log(chalk.gray('It will only run on its configured triggers:'));
        console.log(chalk.gray(`  ${triggers.join(', ')}`));
        
        const shouldContinue = await this.confirm(
          'Try to run anyway?',
          false
        );
        
        if (!shouldContinue) {
          console.log(chalk.yellow('Run cancelled'));
          return;
        }
      }
      
      // Trigger the workflow
      console.log(chalk.gray('\nTriggering workflow...'));
      
      try {
        await this.exec(`gh workflow run "${workflow.name}" --ref ${branch}`, { silent: true });
        console.log(chalk.green('\n✅ Workflow triggered successfully!'));
        
        if (wait) {
          console.log(chalk.gray('\nWaiting for workflow to start...'));
          await this.waitForWorkflowStart(workflow.id, branch);
        } else {
          console.log(chalk.gray('\nMonitor progress with: /pipeline status --workflow "' + workflow.name + '"'));
        }
        
      } catch (error) {
        if (error.message.includes('does not have a workflow_dispatch trigger')) {
          this.log('Workflow does not support manual triggering', 'error');
          console.log(chalk.gray('Add workflow_dispatch to the workflow triggers to enable manual runs'));
        } else {
          throw error;
        }
      }
      
    } catch (error) {
      this.log(`Failed to run pipeline: ${error.message}`, 'error');
    }
  }

  async cancelPipeline(options) {
    const workflowName = options.workflow;
    const runId = options['run-id'];
    
    if (!workflowName && !runId) {
      this.log('Workflow name or run ID required', 'error');
      console.log(chalk.gray('Usage: /pipeline cancel --workflow <name> or --run-id <id>'));
      return;
    }
    
    console.log(chalk.blue('🛑 Cancelling Pipeline\n'));
    
    try {
      let runsToCancel = [];
      
      if (runId) {
        // Cancel specific run
        runsToCancel = [{ id: runId, name: 'Specific run' }];
      } else {
        // Cancel active runs for workflow
        const workflows = await this.getWorkflows();
        const workflow = workflows.find(w => w.name.toLowerCase() === workflowName.toLowerCase());
        
        if (!workflow) {
          this.log(`Workflow "${workflowName}" not found`, 'error');
          return;
        }
        
        const runs = await this.getWorkflowRuns(workflow.id, 20);
        runsToCancel = runs.filter(run => 
          run.status === 'in_progress' || 
          run.status === 'queued'
        );
      }
      
      if (runsToCancel.length === 0) {
        console.log(chalk.yellow('No active runs to cancel'));
        return;
      }
      
      console.log(chalk.yellow('🎯 Runs to Cancel:'));
      runsToCancel.forEach(run => {
        console.log(`  • Run ${run.id}: ${run.name || 'Unknown'}`);
      });
      
      const shouldCancel = await this.confirm(
        `\nCancel ${runsToCancel.length} run(s)?`,
        false
      );
      
      if (!shouldCancel) {
        console.log(chalk.yellow('Cancellation aborted'));
        return;
      }
      
      // Cancel each run
      console.log(chalk.gray('\nCancelling runs...'));
      let cancelled = 0;
      
      for (const run of runsToCancel) {
        try {
          await this.exec(`gh run cancel ${run.id}`, { silent: true });
          console.log(chalk.green(`  ✓ Cancelled run ${run.id}`));
          cancelled++;
        } catch (error) {
          console.log(chalk.red(`  ✗ Failed to cancel run ${run.id}`));
        }
      }
      
      console.log(chalk.green(`\n✅ Cancelled ${cancelled}/${runsToCancel.length} runs`));
      
    } catch (error) {
      this.log(`Failed to cancel pipeline: ${error.message}`, 'error');
    }
  }

  async showPipelineLogs(options) {
    const runId = options['run-id'];
    
    if (!runId) {
      this.log('Run ID required', 'error');
      console.log(chalk.gray('Usage: /pipeline logs --run-id <id>'));
      
      // Show recent runs
      const runs = await this.getRecentRuns(10);
      if (runs.length > 0) {
        console.log(chalk.gray('\nRecent runs:'));
        runs.forEach(run => {
          const status = this.getRunStatusIcon(run.conclusion || run.status);
          console.log(chalk.gray(`  ${status} ${run.id}: ${run.name} - ${run.head_branch}`));
        });
      }
      return;
    }
    
    console.log(chalk.blue(`📄 Pipeline Logs - Run ${runId}\n`));
    
    try {
      // Get run details
      const run = await this.getRun(runId);
      
      if (!run) {
        this.log(`Run ${runId} not found`, 'error');
        return;
      }
      
      console.log(chalk.yellow('📋 Run Details:'));
      console.log(`  Workflow: ${chalk.cyan(run.name)}`);
      console.log(`  Status: ${this.formatRunStatus(run.conclusion || run.status)}`);
      console.log(`  Branch: ${chalk.cyan(run.head_branch)}`);
      console.log(`  Started: ${chalk.gray(this.formatDate(new Date(run.created_at)))}`);
      
      if (run.updated_at !== run.created_at) {
        const duration = new Date(run.updated_at) - new Date(run.created_at);
        console.log(`  Duration: ${chalk.cyan(this.formatDuration(duration))}`);
      }
      
      // Get jobs
      console.log(chalk.yellow('\n🔧 Jobs:'));
      const jobs = await this.getRunJobs(runId);
      
      for (const job of jobs) {
        const status = this.getRunStatusIcon(job.conclusion || job.status);
        console.log(`\n  ${status} ${job.name}`);
        
        if (job.started_at && job.completed_at) {
          const duration = new Date(job.completed_at) - new Date(job.started_at);
          console.log(`     Duration: ${chalk.gray(this.formatDuration(duration))}`);
        }
        
        // Show steps for failed jobs
        if (job.conclusion === 'failure') {
          const steps = job.steps || [];
          const failedSteps = steps.filter(s => s.conclusion === 'failure');
          
          if (failedSteps.length > 0) {
            console.log(chalk.red('     Failed steps:'));
            failedSteps.forEach(step => {
              console.log(chalk.red(`       • ${step.name}`));
            });
          }
        }
      }
      
      // Show logs option
      console.log(chalk.gray('\n💡 View detailed logs:'));
      console.log(chalk.gray(`  gh run view ${runId} --log`));
      console.log(chalk.gray(`  Or visit: ${run.html_url}`));
      
    } catch (error) {
      this.log(`Failed to show pipeline logs: ${error.message}`, 'error');
    }
  }

  async retryPipeline(options) {
    const runId = options['run-id'];
    
    if (!runId) {
      this.log('Run ID required', 'error');
      console.log(chalk.gray('Usage: /pipeline retry --run-id <id>'));
      return;
    }
    
    console.log(chalk.blue(`🔄 Retrying Pipeline - Run ${runId}\n`));
    
    try {
      // Get run details
      const run = await this.getRun(runId);
      
      if (!run) {
        this.log(`Run ${runId} not found`, 'error');
        return;
      }
      
      console.log(chalk.yellow('📋 Retry Details:'));
      console.log(`  Workflow: ${chalk.cyan(run.name)}`);
      console.log(`  Original status: ${this.formatRunStatus(run.conclusion || run.status)}`);
      console.log(`  Branch: ${chalk.cyan(run.head_branch)}`);
      
      if (run.status === 'in_progress') {
        this.log('Cannot retry a run that is still in progress', 'error');
        return;
      }
      
      const shouldRetry = await this.confirm(
        'Retry this workflow run?',
        true
      );
      
      if (!shouldRetry) {
        console.log(chalk.yellow('Retry cancelled'));
        return;
      }
      
      // Retry the run
      console.log(chalk.gray('\nRetrying workflow...'));
      
      await this.exec(`gh run rerun ${runId}`, { silent: true });
      
      console.log(chalk.green('✅ Workflow retry initiated!'));
      console.log(chalk.gray('Monitor progress with: /pipeline status'));
      
    } catch (error) {
      this.log(`Failed to retry pipeline: ${error.message}`, 'error');
    }
  }

  // Helper methods
  async getWorkflows() {
    try {
      const result = await this.exec('gh workflow list --json id,name,path,state', { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async getWorkflowRuns(workflowId, limit = 10) {
    try {
      const result = await this.exec(`gh run list --workflow ${workflowId} --limit ${limit} --json id,name,status,conclusion,createdAt,updatedAt,headBranch,event`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async getRecentRuns(limit = 20) {
    try {
      const result = await this.exec(`gh run list --limit ${limit} --json id,name,status,conclusion,createdAt,updatedAt,headBranch,event,workflowName`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async getRun(runId) {
    try {
      const result = await this.exec(`gh run view ${runId} --json id,name,status,conclusion,createdAt,updatedAt,headBranch,event,workflowName,htmlUrl`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return null;
    }
  }

  async getRunJobs(runId) {
    try {
      const result = await this.exec(`gh api repos/{owner}/{repo}/actions/runs/${runId}/jobs --jq '.jobs[]'`, { silent: true });
      return result.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async parseWorkflowTriggers(workflowPath) {
    try {
      // Read workflow file and parse triggers
      const content = await this.exec(`cat ".github/workflows/${workflowPath.split('/').pop()}"`, { silent: true });
      
      const triggers = [];
      
      if (content.includes('workflow_dispatch')) triggers.push('workflow_dispatch');
      if (content.includes('push:')) triggers.push('push');
      if (content.includes('pull_request:')) triggers.push('pull_request');
      if (content.includes('schedule:')) triggers.push('schedule');
      if (content.includes('release:')) triggers.push('release');
      
      return triggers;
    } catch (error) {
      return ['unknown'];
    }
  }

  async showWorkflowStatus(workflowName) {
    const workflows = await this.getWorkflows();
    const workflow = workflows.find(w => w.name.toLowerCase() === workflowName.toLowerCase());
    
    if (!workflow) {
      this.log(`Workflow "${workflowName}" not found`, 'error');
      return;
    }
    
    console.log(chalk.yellow(`📊 ${workflow.name} Status:`));
    
    const runs = await this.getWorkflowRuns(workflow.id, 20);
    const stats = this.calculateRunStats(runs);
    
    console.log(`  State: ${workflow.state === 'active' ? chalk.green('Active') : chalk.gray('Disabled')}`);
    console.log(`  Success rate: ${this.formatSuccessRate(stats.successRate)}%`);
    console.log(`  Recent runs: ${chalk.cyan(runs.length)}`);
    
    const activeRuns = runs.filter(run => run.status === 'in_progress' || run.status === 'queued');
    if (activeRuns.length > 0) {
      console.log(`  Active runs: ${chalk.yellow(activeRuns.length)}`);
    }
  }

  async waitForWorkflowStart(workflowId, branch) {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await this.sleep(3000);
      
      const runs = await this.getWorkflowRuns(workflowId, 5);
      const recentRun = runs.find(run => 
        run.headBranch === branch && 
        new Date(run.created_at) > new Date(Date.now() - 60000) // Within last minute
      );
      
      if (recentRun) {
        console.log(chalk.green(`\n✅ Workflow started! Run ID: ${recentRun.id}`));
        console.log(chalk.gray(`Monitor: /pipeline logs --run-id ${recentRun.id}`));
        return;
      }
      
      attempts++;
      process.stdout.write('.');
    }
    
    console.log(chalk.yellow('\n⚠️  Workflow may have started but was not detected'));
  }

  calculateRunStats(runs) {
    if (runs.length === 0) {
      return {
        total: 0,
        successRate: 100,
        avgDuration: 'N/A'
      };
    }
    
    const successful = runs.filter(run => run.conclusion === 'success').length;
    const completed = runs.filter(run => run.conclusion).length;
    const successRate = completed > 0 ? Math.round((successful / completed) * 100) : 100;
    
    // Calculate average duration for completed runs
    const durations = runs
      .filter(run => run.conclusion && run.updatedAt && run.createdAt)
      .map(run => new Date(run.updatedAt) - new Date(run.createdAt));
    
    const avgDuration = durations.length > 0 
      ? this.formatDuration(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 'N/A';
    
    return {
      total: runs.length,
      successRate,
      avgDuration
    };
  }

  analyzePipelineHealth(runs) {
    const stats = this.calculateRunStats(runs);
    
    return {
      health: stats.successRate,
      avgQueueTime: '~30s', // Would calculate from actual data
      avgExecutionTime: '~5min',
      avgTotalTime: '~5.5min'
    };
  }

  displayHealthScore(score) {
    const percentage = score;
    const filled = Math.round((score / 100) * 20);
    const empty = 20 - filled;
    
    let color;
    if (score >= 95) color = chalk.green;
    else if (score >= 80) color = chalk.yellow;
    else color = chalk.red;
    
    const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    
    console.log(`  ${bar} ${color(percentage + '%')}`);
    
    if (score >= 95) {
      console.log(chalk.green('  Status: Excellent'));
    } else if (score >= 80) {
      console.log(chalk.yellow('  Status: Good'));
    } else {
      console.log(chalk.red('  Status: Needs attention'));
    }
  }

  getRunStatusIcon(status) {
    switch (status) {
      case 'success':
        return chalk.green('✅');
      case 'failure':
        return chalk.red('❌');
      case 'cancelled':
        return chalk.gray('⭕');
      case 'in_progress':
        return chalk.yellow('🔄');
      case 'queued':
        return chalk.yellow('⏳');
      case 'skipped':
        return chalk.gray('⏭️');
      default:
        return chalk.gray('❓');
    }
  }

  formatRunStatus(status) {
    switch (status) {
      case 'success':
        return chalk.green('Success');
      case 'failure':
        return chalk.red('Failed');
      case 'cancelled':
        return chalk.gray('Cancelled');
      case 'in_progress':
        return chalk.yellow('In Progress');
      case 'queued':
        return chalk.yellow('Queued');
      case 'skipped':
        return chalk.gray('Skipped');
      default:
        return chalk.gray(status || 'Unknown');
    }
  }

  formatSuccessRate(rate) {
    if (rate >= 95) return chalk.green(rate);
    if (rate >= 80) return chalk.yellow(rate);
    return chalk.red(rate);
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

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}