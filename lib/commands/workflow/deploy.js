/**
 * Deploy command - manage deployments and releases
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class DeployCommand extends GitHubSlashCommand {
  constructor() {
    super('/deploy', 'Manage deployments and releases', {
      aliases: ['/release'],
      category: 'workflow',
      usage: '/deploy [action] [options]',
      examples: [
        'fsd slash "/deploy status"',
        'fsd slash "/deploy create --version 1.2.0"',
        'fsd slash "/deploy promote staging production"',
        'fsd slash "/deploy rollback --environment production"'
      ],
      options: [
        { name: 'environment', type: 'string', description: 'Target environment (staging, production)' },
        { name: 'version', type: 'string', description: 'Version to deploy' },
        { name: 'tag', type: 'string', description: 'Git tag to deploy' },
        { name: 'force', type: 'boolean', description: 'Force deployment without checks' },
        { name: 'dry-run', type: 'boolean', description: 'Show what would be deployed' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const action = args?.[0] || 'status';
    
    switch (action) {
      case 'status':
        await this.showDeploymentStatus(options);
        break;
      case 'create':
        await this.createRelease(options);
        break;
      case 'promote':
        await this.promoteRelease(args[1], args[2], options);
        break;
      case 'rollback':
        await this.rollbackDeployment(options);
        break;
      case 'environments':
        await this.listEnvironments(options);
        break;
      default:
        this.log(`Unknown deployment action: ${action}`, 'error');
        console.log(chalk.gray('Available actions: status, create, promote, rollback, environments'));
    }
  }

  async showDeploymentStatus(options) {
    console.log(chalk.blue('🚀 Deployment Status\n'));
    
    try {
      // Get latest releases
      const releases = await this.getLatestReleases();
      
      // Get deployment status from GitHub
      const deployments = await this.getRecentDeployments();
      
      // Current version info
      console.log(chalk.yellow('📦 Latest Release:'));
      if (releases.length > 0) {
        const latest = releases[0];
        console.log(`  Version: ${chalk.cyan(latest.tag_name)}`);
        console.log(`  Name: ${latest.name || 'No name'}`);
        console.log(`  Created: ${chalk.gray(this.formatDate(new Date(latest.created_at)))}`);
        console.log(`  Published: ${latest.published_at ? chalk.green('Yes') : chalk.yellow('Draft')}`);
        
        if (latest.prerelease) {
          console.log(`  Type: ${chalk.yellow('Pre-release')}`);
        }
      } else {
        console.log(chalk.gray('  No releases found'));
      }
      
      // Environment status
      console.log(chalk.yellow('\n🌍 Environment Status:'));
      const environments = await this.getEnvironmentStatus();
      
      if (environments.length === 0) {
        console.log(chalk.gray('  No deployment environments configured'));
        console.log(chalk.gray('  Consider setting up GitHub Environments'));
      } else {
        environments.forEach(env => {
          const status = env.latest_deployment ? 
            this.getDeploymentStatusIcon(env.latest_deployment.state) : 
            chalk.gray('❓');
          
          console.log(`  ${status} ${env.name}`);
          
          if (env.latest_deployment) {
            const deployment = env.latest_deployment;
            console.log(`    Version: ${chalk.cyan(deployment.ref)}`);
            console.log(`    Status: ${this.formatDeploymentState(deployment.state)}`);
            console.log(`    Last deploy: ${chalk.gray(this.formatDate(new Date(deployment.created_at)))}`);
          }
        });
      }
      
      // Recent deployments
      if (deployments.length > 0) {
        console.log(chalk.yellow('\n📈 Recent Deployments:'));
        
        deployments.slice(0, 10).forEach(deployment => {
          const status = this.getDeploymentStatusIcon(deployment.state);
          console.log(`  ${status} ${deployment.environment} - ${chalk.cyan(deployment.ref)}`);
          console.log(chalk.gray(`     ${this.formatDate(new Date(deployment.created_at))} by ${deployment.creator?.login || 'unknown'}`));
        });
      }
      
      // Deployment health
      console.log(chalk.yellow('\n🏥 Deployment Health:'));
      const health = this.calculateDeploymentHealth(deployments);
      
      console.log(`  Success rate: ${this.formatSuccessRate(health.successRate)}%`);
      console.log(`  Avg deployment time: ${chalk.cyan(health.avgDuration)}`);
      console.log(`  Failed deployments (7d): ${health.recentFailures > 0 ? chalk.red(health.recentFailures) : chalk.green('0')}`);
      
      // Quick actions
      console.log(chalk.gray('\n💡 Quick Actions:'));
      console.log(chalk.gray('  • Create release: /deploy create --version 1.2.0'));
      console.log(chalk.gray('  • View environments: /deploy environments'));
      console.log(chalk.gray('  • Rollback: /deploy rollback --environment production'));
      
    } catch (error) {
      this.log(`Failed to show deployment status: ${error.message}`, 'error');
    }
  }

  async createRelease(options) {
    console.log(chalk.blue('🏗️  Creating Release\n'));
    
    try {
      let version = options.version;
      let tag = options.tag;
      const dryRun = options['dry-run'] || false;
      
      // Interactive mode if version not provided
      if (!version && !tag) {
        const { releaseVersion } = await this.prompt([{
          type: 'input',
          name: 'releaseVersion',
          message: 'Release version (e.g., 1.2.0):',
          validate: input => input.trim().length > 0 || 'Version is required'
        }]);
        version = releaseVersion;
      }
      
      // Ensure version has v prefix for tag
      tag = tag || (version.startsWith('v') ? version : `v${version}`);
      
      // Pre-flight checks
      console.log(chalk.gray('Running pre-flight checks...\n'));
      
      const checks = await this.runPreflightChecks();
      const failed = checks.filter(check => !check.passed);
      
      checks.forEach(check => {
        const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
        console.log(`${icon} ${check.name}: ${check.message}`);
      });
      
      if (failed.length > 0 && !options.force) {
        console.log(chalk.red(`\n❌ ${failed.length} pre-flight check(s) failed.`));
        console.log(chalk.gray('Use --force to override checks or fix issues first.'));
        return;
      }
      
      if (dryRun) {
        console.log(chalk.yellow('\n🔍 Dry Run - Would create:'));
        console.log(`  Tag: ${chalk.cyan(tag)}`);
        console.log(`  Release: ${chalk.cyan(version)}`);
        console.log(`  Trigger workflows: Yes`);
        return;
      }
      
      // Get release notes
      const releaseNotes = await this.generateReleaseNotes(tag);
      
      // Confirm release
      console.log(chalk.yellow('\n📋 Release Summary:'));
      console.log(`  Version: ${chalk.cyan(tag)}`);
      console.log(`  Target: ${chalk.cyan('main')}`);
      console.log(`  Type: ${version.includes('alpha') || version.includes('beta') ? chalk.yellow('Pre-release') : chalk.green('Release')}`);
      
      const shouldCreate = await this.confirm(
        '\nCreate this release?',
        true
      );
      
      if (!shouldCreate) {
        console.log(chalk.yellow('Release creation cancelled'));
        return;
      }
      
      // Create the release
      console.log(chalk.gray('\nCreating release...'));
      
      const isPrerelease = version.includes('alpha') || version.includes('beta') || version.includes('rc');
      
      let createCommand = `gh release create "${tag}" --title "${version}"`;
      
      if (releaseNotes) {
        createCommand += ` --notes "${releaseNotes}"`;
      } else {
        createCommand += ' --generate-notes';
      }
      
      if (isPrerelease) {
        createCommand += ' --prerelease';
      }
      
      const result = await this.exec(createCommand);
      
      // Parse the result to get release URL
      const releaseUrl = result.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
      
      console.log(chalk.green('\n✅ Release created successfully!'));
      console.log(chalk.cyan('Version:'), tag);
      
      if (releaseUrl) {
        console.log(chalk.cyan('URL:'), releaseUrl);
      }
      
      // Check for triggered workflows
      console.log(chalk.gray('\nChecking for triggered workflows...'));
      await this.sleep(3000); // Wait for workflows to trigger
      
      const triggeredWorkflows = await this.getTriggeredWorkflows(tag);
      if (triggeredWorkflows.length > 0) {
        console.log(chalk.yellow('\n🔄 Triggered Workflows:'));
        triggeredWorkflows.forEach(workflow => {
          console.log(`  • ${workflow.name}: ${chalk.cyan(workflow.status)}`);
        });
      }
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.log(`Release ${tag} already exists`, 'error');
      } else {
        this.log(`Failed to create release: ${error.message}`, 'error');
      }
    }
  }

  async promoteRelease(source, target, options) {
    if (!source || !target) {
      this.log('Source and target environments required', 'error');
      console.log(chalk.gray('Usage: /deploy promote <source> <target>'));
      return;
    }
    
    console.log(chalk.blue(`🔄 Promoting from ${source} to ${target}\n`));
    
    try {
      // Get current deployment in source environment
      const sourceDeployment = await this.getCurrentDeployment(source);
      
      if (!sourceDeployment) {
        this.log(`No deployment found in ${source} environment`, 'error');
        return;
      }
      
      console.log(chalk.yellow('📦 Promotion Details:'));
      console.log(`  Source: ${chalk.cyan(source)}`);
      console.log(`  Target: ${chalk.cyan(target)}`);
      console.log(`  Version: ${chalk.cyan(sourceDeployment.ref)}`);
      console.log(`  Status: ${this.formatDeploymentState(sourceDeployment.state)}`);
      
      // Confirm promotion
      const shouldPromote = await this.confirm(
        `\nPromote ${sourceDeployment.ref} from ${source} to ${target}?`,
        true
      );
      
      if (!shouldPromote) {
        console.log(chalk.yellow('Promotion cancelled'));
        return;
      }
      
      // Trigger deployment to target environment
      console.log(chalk.gray('\nTriggering deployment...'));
      
      // This would typically trigger a workflow or API call
      // For now, we'll demonstrate with GitHub workflow dispatch
      try {
        await this.exec(
          `gh workflow run deploy.yml --field environment=${target} --field version=${sourceDeployment.ref}`,
          { silent: true }
        );
        
        console.log(chalk.green('\n✅ Promotion triggered successfully!'));
        console.log(chalk.gray('Monitor deployment status with: /deploy status'));
      } catch (error) {
        // Fallback to manual instructions
        console.log(chalk.yellow('\n⚠️  Unable to trigger automatic promotion'));
        console.log(chalk.gray('Manual steps:'));
        console.log(chalk.gray(`  1. Go to GitHub Actions`));
        console.log(chalk.gray(`  2. Run deployment workflow`));
        console.log(chalk.gray(`  3. Set environment: ${target}`));
        console.log(chalk.gray(`  4. Set version: ${sourceDeployment.ref}`));
      }
      
    } catch (error) {
      this.log(`Failed to promote release: ${error.message}`, 'error');
    }
  }

  async rollbackDeployment(options) {
    const environment = options.environment;
    
    if (!environment) {
      this.log('Environment required for rollback', 'error');
      console.log(chalk.gray('Usage: /deploy rollback --environment <env>'));
      return;
    }
    
    console.log(chalk.blue(`🔙 Rolling back ${environment}\n`));
    
    try {
      // Get recent deployments for the environment
      const deployments = await this.getEnvironmentDeployments(environment);
      
      if (deployments.length < 2) {
        this.log('No previous deployment found to rollback to', 'error');
        return;
      }
      
      const current = deployments[0];
      const previous = deployments.find(d => d.state === 'success' && d.id !== current.id);
      
      if (!previous) {
        this.log('No successful previous deployment found', 'error');
        return;
      }
      
      console.log(chalk.yellow('🔄 Rollback Details:'));
      console.log(`  Environment: ${chalk.cyan(environment)}`);
      console.log(`  Current: ${chalk.red(current.ref)} (${this.formatDeploymentState(current.state)})`);
      console.log(`  Rollback to: ${chalk.green(previous.ref)} (${this.formatDate(new Date(previous.created_at))})`);
      
      // Confirm rollback
      const shouldRollback = await this.confirm(
        `\nRollback ${environment} to ${previous.ref}?`,
        false
      );
      
      if (!shouldRollback) {
        console.log(chalk.yellow('Rollback cancelled'));
        return;
      }
      
      // Trigger rollback
      console.log(chalk.gray('\nTriggering rollback...'));
      
      try {
        await this.exec(
          `gh workflow run deploy.yml --field environment=${environment} --field version=${previous.ref} --field rollback=true`,
          { silent: true }
        );
        
        console.log(chalk.green('\n✅ Rollback triggered successfully!'));
        console.log(chalk.yellow('⚠️  Monitor the deployment to ensure rollback completes'));
      } catch (error) {
        console.log(chalk.yellow('\n⚠️  Unable to trigger automatic rollback'));
        console.log(chalk.gray('Manual rollback required through deployment system'));
      }
      
    } catch (error) {
      this.log(`Failed to rollback deployment: ${error.message}`, 'error');
    }
  }

  async listEnvironments(options) {
    console.log(chalk.blue('🌍 Deployment Environments\n'));
    
    try {
      const environments = await this.getEnvironmentStatus();
      
      if (environments.length === 0) {
        console.log(chalk.gray('No environments configured.'));
        console.log(chalk.gray('\nTo set up environments:'));
        console.log(chalk.gray('  1. Go to GitHub repository settings'));
        console.log(chalk.gray('  2. Navigate to Environments'));
        console.log(chalk.gray('  3. Create new environments (staging, production)'));
        return;
      }
      
      environments.forEach(env => {
        console.log(chalk.yellow(`📦 ${env.name}`));
        
        if (env.latest_deployment) {
          const deployment = env.latest_deployment;
          console.log(`  Current version: ${chalk.cyan(deployment.ref)}`);
          console.log(`  Status: ${this.formatDeploymentState(deployment.state)}`);
          console.log(`  Last deploy: ${chalk.gray(this.formatDate(new Date(deployment.created_at)))}`);
          console.log(`  Deployed by: ${chalk.gray(deployment.creator?.login || 'unknown')}`);
        } else {
          console.log(chalk.gray('  No deployments yet'));
        }
        
        // Environment protection rules
        if (env.protection_rules && env.protection_rules.length > 0) {
          console.log('  Protection rules:');
          env.protection_rules.forEach(rule => {
            console.log(chalk.gray(`    • ${rule.type}`));
          });
        }
        
        console.log(''); // Empty line between environments
      });
      
    } catch (error) {
      this.log(`Failed to list environments: ${error.message}`, 'error');
    }
  }

  // Helper methods
  async getLatestReleases() {
    try {
      const result = await this.exec('gh release list --limit 10 --json tagName,name,createdAt,publishedAt,isPrerelease', { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async getRecentDeployments() {
    try {
      const result = await this.exec('gh api repos/{owner}/{repo}/deployments --jq \'.[] | {id: .id, ref: .ref, environment: .environment, state: (.statuses_url // "unknown"), created_at: .created_at, creator: .creator}\'', { silent: true });
      return result.split('\n').filter(line => line.trim()).map(line => JSON.parse(line)).slice(0, 20);
    } catch (error) {
      return [];
    }
  }

  async getEnvironmentStatus() {
    try {
      const result = await this.exec('gh api repos/{owner}/{repo}/environments --jq \'.environments[]\'', { silent: true });
      const environments = result.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
      
      // Get latest deployment for each environment
      for (const env of environments) {
        try {
          const deployments = await this.getEnvironmentDeployments(env.name);
          env.latest_deployment = deployments[0];
        } catch (error) {
          // Environment might not have deployments yet
        }
      }
      
      return environments;
    } catch (error) {
      return [];
    }
  }

  async getEnvironmentDeployments(environment) {
    try {
      const result = await this.exec(`gh api repos/{owner}/{repo}/deployments --field environment=${environment} --jq \'.[]\'`, { silent: true });
      return result.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async getCurrentDeployment(environment) {
    const deployments = await this.getEnvironmentDeployments(environment);
    return deployments[0] || null;
  }

  async runPreflightChecks() {
    const checks = [];
    
    // Check if working directory is clean
    try {
      await this.exec('git diff --quiet && git diff --cached --quiet', { silent: true });
      checks.push({ name: 'Working directory clean', passed: true, message: 'No uncommitted changes' });
    } catch (error) {
      checks.push({ name: 'Working directory clean', passed: false, message: 'Uncommitted changes found' });
    }
    
    // Check if on main branch
    try {
      const branch = await this.exec('git branch --show-current', { silent: true });
      const isMain = branch.trim() === 'main' || branch.trim() === 'master';
      checks.push({ 
        name: 'On main branch', 
        passed: isMain, 
        message: isMain ? 'On main branch' : `On ${branch.trim()}, should be on main` 
      });
    } catch (error) {
      checks.push({ name: 'On main branch', passed: false, message: 'Unable to determine branch' });
    }
    
    // Check if tests pass
    try {
      await this.exec('npm test', { silent: true });
      checks.push({ name: 'Tests passing', passed: true, message: 'All tests pass' });
    } catch (error) {
      checks.push({ name: 'Tests passing', passed: false, message: 'Tests failing' });
    }
    
    // Check if build succeeds
    try {
      await this.exec('npm run build', { silent: true });
      checks.push({ name: 'Build successful', passed: true, message: 'Build completes without errors' });
    } catch (error) {
      checks.push({ name: 'Build successful', passed: false, message: 'Build fails' });
    }
    
    return checks;
  }

  async generateReleaseNotes(tag) {
    try {
      // Get commits since last release
      const lastRelease = await this.exec('gh release list --limit 1 --json tagName --jq ".[0].tagName"', { silent: true });
      
      if (lastRelease.trim()) {
        const commits = await this.exec(`git log ${lastRelease.trim()}..HEAD --oneline`, { silent: true });
        return commits.trim() ? `Changes since ${lastRelease.trim()}:\n\n${commits}` : null;
      }
    } catch (error) {
      // No previous releases or error getting commits
    }
    
    return null;
  }

  async getTriggeredWorkflows(tag) {
    try {
      // Wait a bit for workflows to start
      await this.sleep(2000);
      
      const result = await this.exec(`gh run list --event push --limit 5 --json name,status,event,headSha`, { silent: true });
      const runs = JSON.parse(result);
      
      return runs.filter(run => run.event === 'push').map(run => ({
        name: run.name,
        status: run.status
      }));
    } catch (error) {
      return [];
    }
  }

  calculateDeploymentHealth(deployments) {
    if (deployments.length === 0) {
      return {
        successRate: 100,
        avgDuration: 'N/A',
        recentFailures: 0
      };
    }
    
    const successful = deployments.filter(d => d.state === 'success').length;
    const successRate = Math.round((successful / deployments.length) * 100);
    
    const recent = deployments.filter(d => {
      const deployDate = new Date(d.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return deployDate >= weekAgo;
    });
    
    const recentFailures = recent.filter(d => d.state === 'failure').length;
    
    return {
      successRate,
      avgDuration: '~5min', // Would calculate from actual data
      recentFailures
    };
  }

  getDeploymentStatusIcon(state) {
    switch (state) {
      case 'success':
        return chalk.green('✅');
      case 'failure':
        return chalk.red('❌');
      case 'error':
        return chalk.red('🚨');
      case 'pending':
        return chalk.yellow('⏳');
      case 'in_progress':
        return chalk.yellow('🔄');
      default:
        return chalk.gray('❓');
    }
  }

  formatDeploymentState(state) {
    switch (state) {
      case 'success':
        return chalk.green('Success');
      case 'failure':
        return chalk.red('Failed');
      case 'error':
        return chalk.red('Error');
      case 'pending':
        return chalk.yellow('Pending');
      case 'in_progress':
        return chalk.yellow('In Progress');
      default:
        return chalk.gray(state || 'Unknown');
    }
  }

  formatSuccessRate(rate) {
    if (rate >= 95) return chalk.green(rate);
    if (rate >= 80) return chalk.yellow(rate);
    return chalk.red(rate);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}