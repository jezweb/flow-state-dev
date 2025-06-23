/**
 * Slash Commands Framework
 * Provides project management commands for GitHub integration
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { githubAPI } from './github-api.js';

export class SlashCommandFramework {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.initializeCommands();
  }

  /**
   * Initialize all slash commands
   */
  initializeCommands() {
    // Sprint Management Commands
    this.registerCommand('sprint:plan', {
      description: 'Plan next sprint, show backlog, estimate capacity',
      category: 'Sprint Management',
      handler: this.sprintPlan.bind(this),
      options: [
        { name: 'weeks', description: 'Sprint duration in weeks', default: 2 },
        { name: 'capacity', description: 'Team capacity (story points)', default: 40 }
      ]
    });

    this.registerCommand('sprint:review', {
      description: 'Review current sprint, calculate velocity',
      category: 'Sprint Management',
      handler: this.sprintReview.bind(this),
      options: [
        { name: 'milestone', description: 'Milestone name to review' }
      ]
    });

    this.registerCommand('sprint:close', {
      description: 'Close sprint, move issues, create retrospective',
      category: 'Sprint Management',
      handler: this.sprintClose.bind(this),
      options: [
        { name: 'milestone', description: 'Milestone name to close' },
        { name: 'next-milestone', description: 'Next milestone for moved issues' }
      ]
    });

    // Epic Management Commands
    this.registerCommand('epic:create', {
      description: 'Generate epic template, create sub-issues',
      category: 'Epic Management',
      handler: this.epicCreate.bind(this),
      options: [
        { name: 'title', description: 'Epic title', required: true },
        { name: 'template', description: 'Epic template type', default: 'feature' }
      ]
    });

    this.registerCommand('epic:status', {
      description: 'Display epic progress, show blockers',
      category: 'Epic Management',
      handler: this.epicStatus.bind(this),
      options: [
        { name: 'epic', description: 'Epic number or title' }
      ]
    });

    // Progress Reporting Commands
    this.registerCommand('progress:report', {
      description: 'Generate progress reports for different periods',
      category: 'Progress Reporting',
      handler: this.progressReport.bind(this),
      options: [
        { name: 'period', description: 'Report period (week, month, quarter)', default: 'week' },
        { name: 'format', description: 'Output format (markdown, json)', default: 'markdown' }
      ]
    });

    this.registerCommand('progress:team', {
      description: 'Overview of team performance and capacity',
      category: 'Progress Reporting',
      handler: this.progressTeam.bind(this),
      options: [
        { name: 'members', description: 'Filter by team members' }
      ]
    });

    // Issue Operations Commands
    this.registerCommand('issue:bulk', {
      description: 'Perform bulk operations on issues',
      category: 'Issue Operations',
      handler: this.issueBulk.bind(this),
      options: [
        { name: 'action', description: 'Bulk action (label, milestone, assign, close)', required: true },
        { name: 'filter', description: 'Issue filter query' }
      ]
    });

    this.registerCommand('issue:dependencies', {
      description: 'Map and analyze issue dependencies',
      category: 'Issue Operations',
      handler: this.issueDependencies.bind(this),
      options: [
        { name: 'issue', description: 'Issue number to analyze' },
        { name: 'format', description: 'Output format (tree, graph)', default: 'tree' }
      ]
    });

    // Estimation Commands
    this.registerCommand('estimate:bulk', {
      description: 'Analyze issue complexity and suggest estimates',
      category: 'Estimation',
      handler: this.estimateBulk.bind(this),
      options: [
        { name: 'filter', description: 'Filter issues to estimate' },
        { name: 'scale', description: 'Estimation scale (fibonacci, linear)', default: 'fibonacci' }
      ]
    });

    this.registerCommand('estimate:sprint', {
      description: 'Calculate sprint capacity and velocity',
      category: 'Estimation',
      handler: this.estimateSprint.bind(this),
      options: [
        { name: 'milestone', description: 'Sprint milestone name' },
        { name: 'history', description: 'Number of past sprints to analyze', default: 3 }
      ]
    });

    // Workflow Helper Commands
    this.registerCommand('workflow:status', {
      description: 'Analyze workflow state and metrics',
      category: 'Workflow',
      handler: this.workflowStatus.bind(this),
      options: [
        { name: 'period', description: 'Analysis period (week, month)', default: 'week' }
      ]
    });

    this.registerCommand('milestone:create', {
      description: 'Set up project milestones',
      category: 'Workflow',
      handler: this.milestoneCreate.bind(this),
      options: [
        { name: 'title', description: 'Milestone title', required: true },
        { name: 'due', description: 'Due date (YYYY-MM-DD)' },
        { name: 'description', description: 'Milestone description' }
      ]
    });

    // Set up command aliases
    this.registerAlias('s:p', 'sprint:plan');
    this.registerAlias('s:r', 'sprint:review');
    this.registerAlias('s:c', 'sprint:close');
    this.registerAlias('e:c', 'epic:create');
    this.registerAlias('e:s', 'epic:status');
    this.registerAlias('p:r', 'progress:report');
    this.registerAlias('p:t', 'progress:team');
    this.registerAlias('i:b', 'issue:bulk');
    this.registerAlias('i:d', 'issue:dependencies');
    this.registerAlias('est:b', 'estimate:bulk');
    this.registerAlias('est:s', 'estimate:sprint');
    this.registerAlias('w:s', 'workflow:status');
    this.registerAlias('m:c', 'milestone:create');
  }

  /**
   * Register a slash command
   */
  registerCommand(name, config) {
    this.commands.set(name, {
      name,
      ...config
    });
  }

  /**
   * Register a command alias
   */
  registerAlias(alias, commandName) {
    this.aliases.set(alias, commandName);
  }

  /**
   * Parse and execute a slash command
   */
  async execute(input) {
    const parts = input.trim().split(/\s+/);
    const commandName = parts[0].replace(/^\//, '');
    const args = parts.slice(1);

    // Resolve aliases
    const resolvedCommand = this.aliases.get(commandName) || commandName;
    const command = this.commands.get(resolvedCommand);

    if (!command) {
      throw new Error(`Unknown command: /${commandName}. Use /help to see available commands.`);
    }

    // Parse command arguments
    const options = this.parseArguments(args, command.options);

    // Validate required options
    this.validateOptions(options, command.options);

    console.log(chalk.blue(`\n🔄 Executing: /${command.name}\n`));

    try {
      await command.handler(options);
    } catch (error) {
      console.error(chalk.red(`❌ Command failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Parse command line arguments into options
   */
  parseArguments(args, optionDefinitions = []) {
    const options = {};
    
    // Set defaults
    optionDefinitions.forEach(opt => {
      if (opt.default !== undefined) {
        options[opt.name] = opt.default;
      }
    });

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.substring(2);
        const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
        options[key] = value;
        if (value !== true) i++; // Skip next arg if it was a value
      } else if (arg.startsWith('-')) {
        const key = arg.substring(1);
        const value = args[i + 1] && !args[i + 1].startsWith('-') ? args[i + 1] : true;
        options[key] = value;
        if (value !== true) i++; // Skip next arg if it was a value
      }
    }

    return options;
  }

  /**
   * Validate required options
   */
  validateOptions(options, optionDefinitions = []) {
    const required = optionDefinitions.filter(opt => opt.required);
    
    for (const opt of required) {
      if (options[opt.name] === undefined || options[opt.name] === '') {
        throw new Error(`Required option --${opt.name} is missing`);
      }
    }
  }

  /**
   * Show help for all commands or a specific command
   */
  showHelp(commandName = null) {
    console.log(chalk.cyan('\n📋 Flow State Dev - Slash Commands\n'));

    if (commandName) {
      const command = this.commands.get(commandName);
      if (!command) {
        console.log(chalk.red(`Unknown command: ${commandName}`));
        return;
      }

      console.log(chalk.blue(`/${command.name}`));
      console.log(chalk.gray(command.description));
      
      if (command.options && command.options.length > 0) {
        console.log(chalk.white('\nOptions:'));
        command.options.forEach(opt => {
          const required = opt.required ? chalk.red('*') : '';
          const defaultValue = opt.default ? chalk.gray(` (default: ${opt.default})`) : '';
          console.log(chalk.gray(`  --${opt.name}${required} - ${opt.description}${defaultValue}`));
        });
      }
      return;
    }

    // Group commands by category
    const categories = {};
    this.commands.forEach(command => {
      const category = command.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(command);
    });

    // Display commands by category
    Object.entries(categories).forEach(([category, commands]) => {
      console.log(chalk.white(`${category}:`));
      commands.forEach(command => {
        console.log(chalk.gray(`  /${command.name} - ${command.description}`));
      });
      console.log();
    });

    console.log(chalk.white('Usage:'));
    console.log(chalk.gray('  fsd slash "/command --option value"'));
    console.log(chalk.gray('  fsd slash "/help command-name" for detailed help'));
    console.log();

    console.log(chalk.white('Aliases:'));
    this.aliases.forEach((commandName, alias) => {
      console.log(chalk.gray(`  /${alias} → /${commandName}`));
    });
  }

  /**
   * Check if GitHub CLI is available and authenticated
   */
  async checkGitHubCLI() {
    try {
      execSync('gh --version', { stdio: 'ignore' });
      execSync('gh auth status', { stdio: 'ignore' });
      return true;
    } catch {
      console.log(chalk.yellow('⚠️  GitHub CLI is required for slash commands'));
      console.log(chalk.gray('Install: https://cli.github.com/'));
      console.log(chalk.gray('Authenticate: gh auth login'));
      return false;
    }
  }

  /**
   * Get repository information
   */
  async getRepoInfo() {
    try {
      const repoInfo = JSON.parse(
        execSync('gh repo view --json owner,name,url', { encoding: 'utf-8' })
      );
      return repoInfo;
    } catch (error) {
      throw new Error('Not in a GitHub repository or GitHub CLI not authenticated');
    }
  }

  // Command Handlers
  async sprintPlan(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('📅 Sprint Planning\n'));
    
    const repoInfo = await githubAPI.getRepoInfo();
    console.log(chalk.gray(`Repository: ${repoInfo.owner.login}/${repoInfo.name}`));
    
    // Get open issues without milestones (backlog)
    const allIssues = await githubAPI.getIssues({ state: 'open' });
    const backlogIssues = allIssues.filter(issue => !issue.milestone);
    
    console.log(chalk.white(`\n📋 Backlog: ${backlogIssues.length} issues`));
    console.log(chalk.gray(`Sprint capacity: ${options.capacity} story points`));
    console.log(chalk.gray(`Sprint duration: ${options.weeks} weeks\n`));

    if (backlogIssues.length === 0) {
      console.log(chalk.yellow('No backlog issues found'));
      return;
    }

    // Show top issues for planning with story points
    console.log(chalk.white('Top backlog issues:'));
    backlogIssues.slice(0, 10).forEach((issue, index) => {
      const labels = issue.labels.map(l => l.name).join(', ');
      const storyPoints = githubAPI.calculateStoryPoints([issue]);
      console.log(chalk.gray(`  ${index + 1}. #${issue.number} ${issue.title} (${storyPoints} pts)`));
      if (labels) console.log(chalk.gray(`     Labels: ${labels}`));
    });

    const { createSprint } = await inquirer.prompt([{
      type: 'confirm',
      name: 'createSprint',
      message: 'Create a new sprint milestone?',
      default: true
    }]);

    if (createSprint) {
      const { milestoneTitle, milestoneDescription } = await inquirer.prompt([
        {
          type: 'input',
          name: 'milestoneTitle',
          message: 'Sprint milestone title:',
          default: `Sprint ${new Date().toISOString().slice(0, 10)}`
        },
        {
          type: 'input',
          name: 'milestoneDescription',
          message: 'Sprint description (optional):',
          default: `${options.weeks}-week sprint with ${options.capacity} story point capacity`
        }
      ]);

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (options.weeks * 7));

      try {
        await githubAPI.createMilestone(
          milestoneTitle, 
          milestoneDescription, 
          dueDate.toISOString()
        );
        console.log(chalk.green(`✅ Created milestone: ${milestoneTitle}`));
        
        // Ask to assign issues to sprint
        const { assignIssues } = await inquirer.prompt([{
          type: 'confirm',
          name: 'assignIssues',
          message: 'Would you like to assign issues to this sprint now?',
          default: true
        }]);

        if (assignIssues) {
          await this.assignIssuesToSprint(backlogIssues, milestoneTitle, options.capacity);
        }
      } catch (error) {
        console.log(chalk.red(`❌ Failed to create milestone: ${error.message}`));
      }
    }
  }

  async assignIssuesToSprint(backlogIssues, milestone, capacity) {
    let currentPoints = 0;
    const selectedIssues = [];

    console.log(chalk.blue('\n🎯 Issue Assignment\n'));
    
    for (const issue of backlogIssues) {
      if (currentPoints >= capacity) {
        console.log(chalk.yellow(`\nReached capacity (${capacity} points)`));
        break;
      }

      const issuePoints = githubAPI.calculateStoryPoints([issue]);
      const potentialTotal = currentPoints + issuePoints;
      
      console.log(chalk.white(`\nIssue #${issue.number}: ${issue.title}`));
      console.log(chalk.gray(`Story points: ${issuePoints}`));
      console.log(chalk.gray(`Current total: ${currentPoints}/${capacity} points`));
      console.log(chalk.gray(`New total would be: ${potentialTotal}/${capacity} points`));
      
      if (potentialTotal > capacity) {
        console.log(chalk.yellow('⚠️  Adding this issue would exceed capacity'));
      }

      const { addToSprint } = await inquirer.prompt([{
        type: 'confirm',
        name: 'addToSprint',
        message: 'Add this issue to the sprint?',
        default: potentialTotal <= capacity
      }]);

      if (addToSprint) {
        try {
          await githubAPI.updateIssue(issue.number, { milestone });
          selectedIssues.push(issue);
          currentPoints += issuePoints;
          console.log(chalk.green(`✅ Added to sprint (${currentPoints}/${capacity} points)`));
        } catch (error) {
          console.log(chalk.red(`❌ Failed to assign issue: ${error.message}`));
        }
      }
    }

    console.log(chalk.green(`\n🎉 Sprint planning complete!`));
    console.log(chalk.white(`Assigned ${selectedIssues.length} issues (${currentPoints} story points)`));
  }

  async sprintReview(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('📊 Sprint Review\n'));

    // Get milestones
    const milestones = await githubAPI.getMilestones('all');

    if (milestones.length === 0) {
      console.log(chalk.yellow('No milestones found'));
      return;
    }

    let milestone = options.milestone;
    if (!milestone) {
      const { selectedMilestone } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedMilestone',
        message: 'Select milestone to review:',
        choices: milestones.map(m => ({ name: `${m.title} (${m.state})`, value: m.title }))
      }]);
      milestone = selectedMilestone;
    }

    // Get issues for the milestone
    const issues = await githubAPI.getIssues({ 
      state: 'all', 
      milestone: milestone 
    });

    const completed = issues.filter(i => i.state === 'closed').length;
    const total = issues.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate story points
    const completedPoints = githubAPI.calculateStoryPoints(issues.filter(i => i.state === 'closed'));
    const totalPoints = githubAPI.calculateStoryPoints(issues);

    console.log(chalk.white(`Sprint: ${milestone}`));
    console.log(chalk.white(`Progress: ${completed}/${total} issues (${progress}%)`));
    console.log(chalk.white(`Story Points: ${completedPoints}/${totalPoints} completed`));
    
    if (completed > 0) {
      console.log(chalk.green(`✅ Completed: ${completed} issues (${completedPoints} pts)`));
    }
    
    if (total - completed > 0) {
      const remainingPoints = totalPoints - completedPoints;
      console.log(chalk.yellow(`⏳ Remaining: ${total - completed} issues (${remainingPoints} pts)`));
    }

    // Sprint velocity calculation
    const velocityData = await githubAPI.calculateVelocity([{ title: milestone }]);
    if (velocityData.length > 0) {
      const velocity = velocityData[0];
      console.log(chalk.blue(`\n📈 Sprint Metrics:`));
      console.log(chalk.gray(`  Completion Rate: ${velocity.completionRate.toFixed(1)}%`));
      console.log(chalk.gray(`  Story Points Delivered: ${velocity.storyPoints}`));
    }

    console.log(chalk.white('\nIssue breakdown:'));
    issues.forEach(issue => {
      const status = issue.state === 'closed' ? '✅' : '⏳';
      const points = githubAPI.calculateStoryPoints([issue]);
      console.log(chalk.gray(`  ${status} #${issue.number} ${issue.title} (${points} pts)`));
    });

    // Show blockers (open issues with dependencies)
    const openIssues = issues.filter(i => i.state === 'open');
    if (openIssues.length > 0) {
      console.log(chalk.red('\n🚫 Potential Blockers:'));
      for (const issue of openIssues.slice(0, 3)) {
        try {
          const deps = await githubAPI.analyzeDependencies(issue.number);
          if (deps.blockedBy.length > 0) {
            console.log(chalk.yellow(`  #${issue.number} blocked by: ${deps.blockedBy.map(d => `#${d.number}`).join(', ')}`));
          }
        } catch {
          // Skip dependency analysis if it fails
        }
      }
    }
  }

  async sprintClose(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('🏁 Sprint Close\n'));

    // Implementation for closing sprint
    console.log(chalk.yellow('Sprint close functionality - Coming soon!'));
    console.log(chalk.gray('This will move incomplete issues to next sprint'));
  }

  async epicCreate(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('🎯 Epic Creation\n'));

    const epicTemplate = `## Epic: ${options.title}

### Overview
Brief description of the epic and its goals.

### User Stories
- [ ] As a user, I want...
- [ ] As a user, I need...

### Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

### Technical Requirements
- [ ] Technical requirement 1
- [ ] Technical requirement 2

### Definition of Done
- [ ] All user stories completed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and merged

### Dependencies
- Issue #: Description

### Notes
Additional implementation notes or considerations.`;

    try {
      execSync(`gh issue create --title "${options.title}" --body "${epicTemplate}" --label "epic"`, 
        { stdio: 'inherit' });
      console.log(chalk.green(`✅ Created epic: ${options.title}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create epic: ${error.message}`));
    }
  }

  async epicStatus(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('📈 Epic Status\n'));
    console.log(chalk.yellow('Epic status tracking - Coming soon!'));
  }

  async progressReport(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('📊 Progress Report\n'));

    const report = await githubAPI.generateProgressReport(options.period);

    console.log(chalk.white(`Repository: ${report.repository}`));
    console.log(chalk.gray(`Period: ${report.period} (${report.startDate} to ${report.endDate})`));

    console.log(chalk.blue('\n📋 Issues:'));
    console.log(chalk.gray(`  Total updated: ${report.issues.total}`));
    console.log(chalk.green(`  Opened: ${report.issues.opened}`));
    console.log(chalk.green(`  Closed: ${report.issues.closed}`));

    console.log(chalk.blue('\n🔄 Pull Requests:'));
    console.log(chalk.gray(`  Total: ${report.pullRequests.total}`));
    console.log(chalk.green(`  Merged: ${report.pullRequests.merged}`));
    console.log(chalk.yellow(`  Open: ${report.pullRequests.open}`));

    console.log(chalk.blue('\n⚙️  Workflows:'));
    console.log(chalk.gray(`  Total runs: ${report.workflows.total}`));
    console.log(chalk.green(`  Successful: ${report.workflows.successful}`));
    console.log(chalk.red(`  Failed: ${report.workflows.failed}`));
    console.log(chalk.blue(`  Success rate: ${report.workflows.successRate}%`));

    // Generate markdown report if requested
    if (options.format === 'markdown') {
      const markdownReport = this.generateMarkdownReport(report);
      const filename = `progress-report-${report.period}-${report.endDate}.md`;
      
      try {
        await fs.writeFile(filename, markdownReport);
        console.log(chalk.green(`\n📄 Markdown report saved: ${filename}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to save report: ${error.message}`));
      }
    }
  }

  generateMarkdownReport(report) {
    return `# Progress Report - ${report.period}

**Repository:** ${report.repository}  
**Period:** ${report.startDate} to ${report.endDate}

## Summary

### Issues
- **Total updated:** ${report.issues.total}
- **Opened:** ${report.issues.opened}
- **Closed:** ${report.issues.closed}

### Pull Requests
- **Total:** ${report.pullRequests.total}
- **Merged:** ${report.pullRequests.merged}
- **Open:** ${report.pullRequests.open}

### Workflows
- **Total runs:** ${report.workflows.total}
- **Successful:** ${report.workflows.successful} (${report.workflows.successRate}%)
- **Failed:** ${report.workflows.failed}

---

*Generated by Flow State Dev on ${new Date().toISOString().split('T')[0]}*
`;
  }

  async progressTeam(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('👥 Team Progress\n'));
    console.log(chalk.yellow('Team progress tracking - Coming soon!'));
  }

  async issueBulk(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('🔄 Bulk Issue Operations\n'));

    const { action, filter } = options;
    
    // Get issues based on filter
    let issues;
    if (filter) {
      // Parse filter (basic implementation)
      const filterParts = filter.split(':');
      const filterOptions = {};
      
      if (filterParts[0] === 'label') {
        filterOptions.labels = filterParts[1];
      } else if (filterParts[0] === 'assignee') {
        filterOptions.assignee = filterParts[1];
      } else if (filterParts[0] === 'state') {
        filterOptions.state = filterParts[1];
      }
      
      issues = await githubAPI.getIssues(filterOptions);
    } else {
      issues = await githubAPI.getIssues({ state: 'open' });
    }

    if (issues.length === 0) {
      console.log(chalk.yellow('No issues found matching the filter'));
      return;
    }

    console.log(chalk.white(`Found ${issues.length} issues`));
    
    // Show preview of issues
    console.log(chalk.gray('\nIssues to be updated:'));
    issues.slice(0, 5).forEach(issue => {
      console.log(chalk.gray(`  #${issue.number} ${issue.title}`));
    });
    if (issues.length > 5) {
      console.log(chalk.gray(`  ... and ${issues.length - 5} more`));
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Perform ${action} on ${issues.length} issues?`,
      default: false
    }]);

    if (!confirm) {
      console.log(chalk.yellow('Operation cancelled'));
      return;
    }

    // Perform bulk action
    const issueNumbers = issues.map(i => i.number);
    let updates = {};

    switch (action) {
      case 'label':
        const { labelName } = await inquirer.prompt([{
          type: 'input',
          name: 'labelName',
          message: 'Label to add:',
          validate: input => input.trim() !== '' || 'Label name is required'
        }]);
        updates.labels = [labelName];
        break;

      case 'milestone':
        const milestones = await githubAPI.getMilestones();
        const { selectedMilestone } = await inquirer.prompt([{
          type: 'list',
          name: 'selectedMilestone',
          message: 'Select milestone:',
          choices: milestones.map(m => m.title)
        }]);
        updates.milestone = selectedMilestone;
        break;

      case 'assign':
        const { assigneeUsername } = await inquirer.prompt([{
          type: 'input',
          name: 'assigneeUsername',
          message: 'GitHub username to assign:',
          validate: input => input.trim() !== '' || 'Username is required'
        }]);
        updates.assignees = [assigneeUsername];
        break;

      case 'close':
        const { closeReason } = await inquirer.prompt([{
          type: 'list',
          name: 'closeReason',
          message: 'Reason for closing:',
          choices: ['completed', 'not_planned']
        }]);
        
        // Close issues individually
        for (const number of issueNumbers) {
          try {
            await githubAPI.closeIssue(number, closeReason);
            console.log(chalk.green(`✅ Closed issue #${number}`));
          } catch (error) {
            console.log(chalk.red(`❌ Failed to close issue #${number}: ${error.message}`));
          }
        }
        return;

      default:
        console.log(chalk.red(`Unknown action: ${action}`));
        return;
    }

    // Perform bulk update
    const results = await githubAPI.bulkUpdateIssues(issueNumbers, updates);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(chalk.green(`\n✅ Bulk operation complete: ${successful} successful, ${failed} failed`));
  }

  async issueDependencies(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('🔗 Issue Dependencies\n'));

    let issueNumber = options.issue;
    
    if (!issueNumber) {
      const { inputIssue } = await inquirer.prompt([{
        type: 'input',
        name: 'inputIssue',
        message: 'Issue number to analyze:',
        validate: input => /^\d+$/.test(input) || 'Please enter a valid issue number'
      }]);
      issueNumber = inputIssue;
    }

    try {
      const analysis = await githubAPI.analyzeDependencies(issueNumber);
      
      console.log(chalk.white(`Issue #${analysis.issue.number}: ${analysis.issue.title}`));
      console.log(chalk.gray(`State: ${analysis.issue.state}`));

      if (analysis.dependencies.length === 0) {
        console.log(chalk.green('\n✅ No dependencies found'));
        return;
      }

      console.log(chalk.blue(`\n🔗 Dependencies (${analysis.dependencies.length}):`));
      
      if (options.format === 'tree') {
        analysis.dependencies.forEach(dep => {
          const status = dep.state === 'closed' ? '✅' : 
                        dep.state === 'open' ? '⏳' : '❓';
          console.log(chalk.gray(`  ${status} #${dep.number} ${dep.title}`));
        });
      } else {
        // Graph format - simple ASCII representation
        console.log(chalk.gray(`\n  #${analysis.issue.number} depends on:`));
        analysis.dependencies.forEach(dep => {
          const status = dep.state === 'closed' ? '✅' : 
                        dep.state === 'open' ? '⏳' : '❓';
          console.log(chalk.gray(`    └── ${status} #${dep.number} ${dep.title}`));
        });
      }

      if (analysis.blockedBy.length > 0) {
        console.log(chalk.red(`\n🚫 Blocked by ${analysis.blockedBy.length} open issues:`));
        analysis.blockedBy.forEach(blocker => {
          console.log(chalk.yellow(`  ⏳ #${blocker.number} ${blocker.title}`));
        });
      } else if (analysis.dependencies.length > 0) {
        console.log(chalk.green('\n✅ No blocking dependencies'));
      }

    } catch (error) {
      console.log(chalk.red(`❌ Failed to analyze dependencies: ${error.message}`));
    }
  }

  async estimateBulk(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('🎯 Bulk Estimation\n'));
    console.log(chalk.yellow('Bulk estimation - Coming soon!'));
  }

  async estimateSprint(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('📊 Sprint Estimation\n'));
    console.log(chalk.yellow('Sprint capacity calculation - Coming soon!'));
  }

  async workflowStatus(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('🔄 Workflow Status\n'));
    
    const repoInfo = await this.getRepoInfo();
    console.log(chalk.gray(`Repository: ${repoInfo.owner.login}/${repoInfo.name}`));

    // Get workflow runs
    try {
      const workflows = JSON.parse(
        execSync('gh run list --limit 10 --json status,conclusion,workflowName,createdAt', 
          { encoding: 'utf-8' })
      );

      if (workflows.length === 0) {
        console.log(chalk.yellow('No workflow runs found'));
        return;
      }

      console.log(chalk.white('\nRecent workflow runs:'));
      workflows.forEach(run => {
        const status = run.conclusion === 'success' ? '✅' : 
                      run.conclusion === 'failure' ? '❌' : 
                      run.status === 'in_progress' ? '🔄' : '⏳';
        const date = new Date(run.createdAt).toLocaleDateString();
        console.log(chalk.gray(`  ${status} ${run.workflowName} - ${date}`));
      });

      const successful = workflows.filter(r => r.conclusion === 'success').length;
      const failed = workflows.filter(r => r.conclusion === 'failure').length;
      const successRate = workflows.length > 0 ? Math.round((successful / workflows.length) * 100) : 0;

      console.log(chalk.white(`\nSuccess rate: ${successRate}% (${successful}/${workflows.length})`));

    } catch (error) {
      console.log(chalk.yellow('No workflows found or insufficient permissions'));
    }
  }

  async milestoneCreate(options) {
    if (!(await this.checkGitHubCLI())) return;

    console.log(chalk.blue('🎯 Milestone Creation\n'));

    let dueDate = options.due;
    if (!dueDate) {
      const { inputDate } = await inquirer.prompt([{
        type: 'input',
        name: 'inputDate',
        message: 'Due date (YYYY-MM-DD, optional):',
        validate: (input) => {
          if (!input) return true;
          return /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Date must be in YYYY-MM-DD format';
        }
      }]);
      dueDate = inputDate;
    }

    const description = options.description || '';
    
    try {
      let cmd = `gh api repos/:owner/:repo/milestones -f title="${options.title}"`;
      if (description) cmd += ` -f description="${description}"`;
      if (dueDate) cmd += ` -f due_on="${dueDate}T23:59:59Z"`;
      
      execSync(cmd, { stdio: 'inherit' });
      console.log(chalk.green(`✅ Created milestone: ${options.title}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create milestone: ${error.message}`));
    }
  }
}

/**
 * Execute a slash command
 */
export async function executeSlashCommand(commandString) {
  const framework = new SlashCommandFramework();
  
  if (commandString === '/help' || commandString === 'help') {
    framework.showHelp();
    return;
  }
  
  if (commandString.startsWith('/help ')) {
    const commandName = commandString.substring(6);
    framework.showHelp(commandName);
    return;
  }
  
  await framework.execute(commandString);
}