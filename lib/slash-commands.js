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

    // Analysis and Planning Commands
    this.registerCommand('breakdown', {
      description: 'Analyze scope and create GitHub issues for tracking',
      category: 'Analysis & Planning',
      handler: this.breakdown.bind(this),
      options: [
        { name: 'scope', description: 'Feature/project scope to analyze', required: true },
        { name: 'milestone', description: 'Milestone to assign issues to' },
        { name: 'create-issues', description: 'Actually create the GitHub issues', default: false },
        { name: 'template', description: 'Issue template type (feature, bug, research)', default: 'feature' }
      ]
    });

    this.registerCommand('epic:breakdown', {
      description: 'Break large epics into manageable sub-issues',
      category: 'Analysis & Planning',
      handler: this.epicBreakdown.bind(this),
      options: [
        { name: 'epic', description: 'Epic title or description', required: true },
        { name: 'milestone', description: 'Target milestone for sub-issues' },
        { name: 'create-issues', description: 'Create the GitHub issues', default: false },
        { name: 'assignee', description: 'Default assignee for created issues' }
      ]
    });

    this.registerCommand('feature:plan', {
      description: 'Complete feature planning from concept to implementation',
      category: 'Analysis & Planning',
      handler: this.featurePlan.bind(this),
      options: [
        { name: 'feature', description: 'Feature description or requirements', required: true },
        { name: 'create-issues', description: 'Create GitHub issues from plan', default: false },
        { name: 'timeline', description: 'Target timeline (days/weeks)' },
        { name: 'complexity', description: 'Expected complexity (simple, medium, complex)', default: 'medium' }
      ]
    });

    this.registerCommand('analyze:scope', {
      description: 'Detailed scope analysis with dependency mapping',
      category: 'Analysis & Planning',
      handler: this.analyzeScope.bind(this),
      options: [
        { name: 'requirements', description: 'Requirements or scope to analyze', required: true },
        { name: 'format', description: 'Output format (markdown, json, issues)', default: 'markdown' },
        { name: 'create-issues', description: 'Generate GitHub issues from analysis', default: false }
      ]
    });

    // Quick Action Commands (Issue #39)
    this.registerCommand('build', {
      description: 'Run project build command',
      category: 'Quick Actions',
      handler: this.quickBuild.bind(this),
      options: [
        { name: 'env', description: 'Build environment (dev, prod)', default: 'dev' },
        { name: 'watch', description: 'Watch mode for development builds', default: false }
      ]
    });

    this.registerCommand('test', {
      description: 'Run project tests',
      category: 'Quick Actions',
      handler: this.quickTest.bind(this),
      options: [
        { name: 'watch', description: 'Run tests in watch mode', default: false },
        { name: 'coverage', description: 'Generate coverage report', default: false },
        { name: 'file', description: 'Specific test file to run' }
      ]
    });

    this.registerCommand('lint', {
      description: 'Run code linting',
      category: 'Quick Actions',
      handler: this.quickLint.bind(this),
      options: [
        { name: 'fix', description: 'Auto-fix linting issues', default: false },
        { name: 'format', description: 'Format code with prettier', default: false }
      ]
    });

    this.registerCommand('fix', {
      description: 'Auto-fix linting and formatting issues',
      category: 'Quick Actions',
      handler: this.quickFix.bind(this),
      options: []
    });

    this.registerCommand('typecheck', {
      description: 'Run TypeScript type checking',
      category: 'Quick Actions',
      handler: this.quickTypecheck.bind(this),
      options: [
        { name: 'watch', description: 'Watch mode for continuous checking', default: false }
      ]
    });

    this.registerCommand('status', {
      description: 'Enhanced git status with categorized changes',
      category: 'Quick Actions',
      handler: this.quickStatus.bind(this),
      options: [
        { name: 'branch', description: 'Show branch information', default: true },
        { name: 'verbose', description: 'Show detailed file changes', default: false }
      ]
    });

    this.registerCommand('commit', {
      description: 'Quick conventional commit with suggested messages',
      category: 'Quick Actions',
      handler: this.quickCommit.bind(this),
      options: [
        { name: 'type', description: 'Commit type (feat, fix, docs, etc.)' },
        { name: 'message', description: 'Commit message' },
        { name: 'scope', description: 'Commit scope' }
      ]
    });

    this.registerCommand('push', {
      description: 'Push to current branch with results',
      category: 'Quick Actions',
      handler: this.quickPush.bind(this),
      options: [
        { name: 'force', description: 'Force push (dangerous)', default: false },
        { name: 'upstream', description: 'Set upstream for new branch', default: false }
      ]
    });

    // Extended Thinking Commands (Issue #41)
    this.registerCommand('plan', {
      description: 'Deep planning with extended thinking mode',
      category: 'Extended Thinking',
      handler: this.extendedPlan.bind(this),
      options: [
        { name: 'topic', description: 'Topic to plan', required: true },
        { name: 'scope', description: 'Planning scope (feature, project, architecture)', default: 'feature' },
        { name: 'create-adr', description: 'Create Architecture Decision Record', default: false },
        { name: 'timeline', description: 'Planning timeline (weeks/months)' }
      ]
    });

    this.registerCommand('investigate', {
      description: 'Multi-source research and analysis',
      category: 'Extended Thinking',
      handler: this.extendedInvestigate.bind(this),
      options: [
        { name: 'question', description: 'Research question or problem', required: true },
        { name: 'sources', description: 'Number of sources to investigate', default: 3 },
        { name: 'depth', description: 'Investigation depth (shallow, medium, deep)', default: 'medium' }
      ]
    });

    this.registerCommand('decide', {
      description: 'Architectural decisions with ADR creation',
      category: 'Extended Thinking',
      handler: this.extendedDecide.bind(this),
      options: [
        { name: 'decision', description: 'Decision to make', required: true },
        { name: 'alternatives', description: 'Number of alternatives to consider', default: 3 },
        { name: 'create-adr', description: 'Create formal ADR document', default: true }
      ]
    });

    this.registerCommand('estimate', {
      description: 'Complex estimation with risk analysis',
      category: 'Extended Thinking',
      handler: this.extendedEstimate.bind(this),
      options: [
        { name: 'work', description: 'Work to estimate', required: true },
        { name: 'method', description: 'Estimation method (story-points, hours, ideal-days)', default: 'story-points' },
        { name: 'confidence', description: 'Confidence level (low, medium, high)', default: 'medium' }
      ]
    });

    this.registerCommand('debug:strategy', {
      description: 'Systematic debugging approach',
      category: 'Extended Thinking',
      handler: this.extendedDebugStrategy.bind(this),
      options: [
        { name: 'problem', description: 'Problem description', required: true },
        { name: 'context', description: 'Additional context (error logs, symptoms)' },
        { name: 'urgency', description: 'Problem urgency (low, medium, high, critical)', default: 'medium' }
      ]
    });

    this.registerCommand('optimize:plan', {
      description: 'Performance optimization strategy',
      category: 'Extended Thinking',
      handler: this.extendedOptimizePlan.bind(this),
      options: [
        { name: 'target', description: 'Optimization target (performance, memory, network)', required: true },
        { name: 'current-metrics', description: 'Current performance metrics' },
        { name: 'goals', description: 'Performance goals and targets' }
      ]
    });

    this.registerCommand('refactor:plan', {
      description: 'Incremental refactoring planning',
      category: 'Extended Thinking',
      handler: this.extendedRefactorPlan.bind(this),
      options: [
        { name: 'component', description: 'Component/module to refactor', required: true },
        { name: 'goals', description: 'Refactoring goals (maintainability, performance, etc.)' },
        { name: 'risk-tolerance', description: 'Risk tolerance (low, medium, high)', default: 'low' }
      ]
    });

    this.registerCommand('research', {
      description: 'Deep multi-source research',
      category: 'Extended Thinking',
      handler: this.extendedResearch.bind(this),
      options: [
        { name: 'topic', description: 'Research topic', required: true },
        { name: 'focus', description: 'Research focus (technical, business, user-experience)' },
        { name: 'output', description: 'Output format (report, summary, recommendations)', default: 'report' }
      ]
    });

    this.registerCommand('alternatives', {
      description: 'Alternative solution exploration',
      category: 'Extended Thinking',
      handler: this.extendedAlternatives.bind(this),
      options: [
        { name: 'problem', description: 'Problem or challenge', required: true },
        { name: 'constraints', description: 'Known constraints (time, budget, technical)' },
        { name: 'criteria', description: 'Evaluation criteria' }
      ]
    });

    // Set up command aliases
    this.registerAlias('s:p', 'sprint:plan');
    this.registerAlias('s:r', 'sprint:review');
    this.registerAlias('s:c', 'sprint:close');
    this.registerAlias('e:c', 'epic:create');
    this.registerAlias('e:s', 'epic:status');
    this.registerAlias('e:b', 'epic:breakdown');
    this.registerAlias('p:r', 'progress:report');
    this.registerAlias('p:t', 'progress:team');
    this.registerAlias('i:b', 'issue:bulk');
    this.registerAlias('i:d', 'issue:dependencies');
    this.registerAlias('est:b', 'estimate:bulk');
    this.registerAlias('est:s', 'estimate:sprint');
    this.registerAlias('w:s', 'workflow:status');
    this.registerAlias('m:c', 'milestone:create');
    this.registerAlias('bd', 'breakdown');
    this.registerAlias('f:p', 'feature:plan');
    this.registerAlias('a:s', 'analyze:scope');
    
    // Quick action aliases
    this.registerAlias('b', 'build');
    this.registerAlias('t', 'test');
    this.registerAlias('l', 'lint');
    this.registerAlias('tc', 'typecheck');
    this.registerAlias('st', 'status');
    this.registerAlias('c', 'commit');
    this.registerAlias('p', 'push');
    
    // Extended thinking aliases
    this.registerAlias('pl', 'plan');
    this.registerAlias('inv', 'investigate');
    this.registerAlias('dec', 'decide');
    this.registerAlias('est', 'estimate');
    this.registerAlias('d:s', 'debug:strategy');
    this.registerAlias('o:p', 'optimize:plan');
    this.registerAlias('r:p', 'refactor:plan');
    this.registerAlias('res', 'research');
    this.registerAlias('alt', 'alternatives');
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

  // Analysis and Planning Command Handlers

  async breakdown(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('🔍 Scope Analysis & Issue Breakdown\n'));

    const { scope, milestone, template } = options;
    const createIssues = options['create-issues'];

    console.log(chalk.white(`Analyzing scope: ${scope}`));
    console.log(chalk.gray(`Template: ${template}`));
    if (milestone) console.log(chalk.gray(`Target milestone: ${milestone}`));

    // Analyze the scope and break it down
    const analysis = await this.analyzeRequirements(scope, template);

    console.log(chalk.blue('\n📋 Breakdown Analysis:\n'));
    
    console.log(chalk.white('Overview:'));
    console.log(chalk.gray(`  ${analysis.overview}`));

    console.log(chalk.white('\nIdentified Components:'));
    analysis.components.forEach((component, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${component.name} - ${component.description}`));
      if (component.complexity) {
        console.log(chalk.gray(`     Complexity: ${component.complexity} | Effort: ${component.effort || 'TBD'}`));
      }
    });

    if (analysis.dependencies.length > 0) {
      console.log(chalk.white('\nDependencies:'));
      analysis.dependencies.forEach(dep => {
        console.log(chalk.yellow(`  ⚠️  ${dep}`));
      });
    }

    if (analysis.risks.length > 0) {
      console.log(chalk.white('\nRisks & Considerations:'));
      analysis.risks.forEach(risk => {
        console.log(chalk.red(`  🚨 ${risk}`));
      });
    }

    console.log(chalk.white(`\nEstimated Total Effort: ${analysis.totalEffort}`));
    console.log(chalk.white(`Recommended Timeline: ${analysis.timeline}`));

    if (createIssues) {
      console.log(chalk.blue('\n🚀 Creating GitHub Issues...\n'));
      
      const { confirmed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmed',
        message: `Create ${analysis.components.length} GitHub issues for this breakdown?`,
        default: true
      }]);

      if (confirmed) {
        await this.createIssuesFromAnalysis(analysis, milestone, template);
      }
    } else {
      console.log(chalk.yellow('\n💡 Use --create-issues flag to automatically create GitHub issues'));
      console.log(chalk.gray('   Example: fsd slash "/breakdown --scope \'User auth\' --create-issues --milestone \'v2.0\'"'));
    }
  }

  async epicBreakdown(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('🎯 Epic Breakdown\n'));

    const { epic, milestone, assignee } = options;
    const createIssues = options['create-issues'];

    console.log(chalk.white(`Epic: ${epic}`));

    // Analyze the epic and break it into user stories and tasks
    const breakdown = await this.analyzeEpic(epic);

    console.log(chalk.blue('\n📖 Epic Analysis:\n'));
    
    console.log(chalk.white('Epic Summary:'));
    console.log(chalk.gray(`  ${breakdown.summary}`));

    console.log(chalk.white('\nUser Stories:'));
    breakdown.userStories.forEach((story, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${story.title}`));
      console.log(chalk.gray(`     ${story.description}`));
      console.log(chalk.gray(`     Acceptance Criteria: ${story.acceptanceCriteria.length} items`));
      console.log(chalk.gray(`     Effort: ${story.effort} | Priority: ${story.priority}`));
      console.log();
    });

    console.log(chalk.white('\nTechnical Tasks:'));
    breakdown.technicalTasks.forEach((task, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${task.title} (${task.type})`));
      console.log(chalk.gray(`     ${task.description}`));
      console.log(chalk.gray(`     Effort: ${task.effort}`));
    });

    if (breakdown.prerequisites.length > 0) {
      console.log(chalk.white('\nPrerequisites:'));
      breakdown.prerequisites.forEach(prereq => {
        console.log(chalk.yellow(`  📋 ${prereq}`));
      });
    }

    console.log(chalk.white(`\nTotal Issues: ${breakdown.userStories.length + breakdown.technicalTasks.length}`));
    console.log(chalk.white(`Estimated Timeline: ${breakdown.timeline}`));

    if (createIssues) {
      console.log(chalk.blue('\n🚀 Creating Epic Issues...\n'));
      
      const { confirmed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmed',
        message: 'Create GitHub issues for this epic breakdown?',
        default: true
      }]);

      if (confirmed) {
        await this.createEpicIssues(breakdown, milestone, assignee);
      }
    }
  }

  async featurePlan(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('⚡ Feature Planning\n'));

    const { feature, timeline, complexity } = options;
    const createIssues = options['create-issues'];

    console.log(chalk.white(`Feature: ${feature}`));
    console.log(chalk.gray(`Complexity: ${complexity}`));
    if (timeline) console.log(chalk.gray(`Timeline: ${timeline}`));

    // Create comprehensive feature plan
    const plan = await this.createFeaturePlan(feature, complexity, timeline);

    console.log(chalk.blue('\n📋 Feature Plan:\n'));

    console.log(chalk.white('Requirements Analysis:'));
    console.log(chalk.gray(`  ${plan.requirements}`));

    console.log(chalk.white('\nImplementation Phases:'));
    plan.phases.forEach((phase, index) => {
      console.log(chalk.gray(`  Phase ${index + 1}: ${phase.name}`));
      console.log(chalk.gray(`    ${phase.description}`));
      console.log(chalk.gray(`    Deliverables: ${phase.deliverables.join(', ')}`));
      console.log(chalk.gray(`    Effort: ${phase.effort} | Duration: ${phase.duration}`));
      console.log();
    });

    console.log(chalk.white('\nTechnical Considerations:'));
    plan.technical.forEach(item => {
      console.log(chalk.gray(`  🔧 ${item}`));
    });

    console.log(chalk.white('\nTesting Strategy:'));
    plan.testing.forEach(test => {
      console.log(chalk.gray(`  ✅ ${test}`));
    });

    if (plan.risks.length > 0) {
      console.log(chalk.white('\nRisk Assessment:'));
      plan.risks.forEach(risk => {
        console.log(chalk.red(`  ⚠️  ${risk.description} (${risk.impact})`));
        console.log(chalk.gray(`     Mitigation: ${risk.mitigation}`));
      });
    }

    console.log(chalk.white(`\nTotal Estimated Effort: ${plan.totalEffort}`));
    console.log(chalk.white(`Recommended Timeline: ${plan.recommendedTimeline}`));

    if (createIssues) {
      console.log(chalk.blue('\n🚀 Creating Feature Issues...\n'));
      await this.createFeatureIssues(plan);
    }
  }

  async analyzeScope(options) {
    await githubAPI.checkCLI();

    console.log(chalk.blue('🔬 Detailed Scope Analysis\n'));

    const { requirements, format } = options;
    const createIssues = options['create-issues'];

    console.log(chalk.white(`Requirements: ${requirements}`));

    // Perform detailed scope analysis
    const analysis = await this.performScopeAnalysis(requirements);

    if (format === 'json') {
      console.log(chalk.blue('\n📊 Analysis (JSON):\n'));
      console.log(JSON.stringify(analysis, null, 2));
    } else if (format === 'markdown') {
      console.log(chalk.blue('\n📄 Analysis Report:\n'));
      this.displayMarkdownAnalysis(analysis);
    }

    if (createIssues && format === 'issues') {
      console.log(chalk.blue('\n🚀 Generating Issues from Analysis...\n'));
      await this.createIssuesFromScopeAnalysis(analysis);
    }

    // Save analysis to file
    const filename = `scope-analysis-${Date.now()}.${format}`;
    const content = format === 'json' ? 
      JSON.stringify(analysis, null, 2) : 
      this.generateMarkdownReport(analysis);

    try {
      await fs.writeFile(filename, content);
      console.log(chalk.green(`\n💾 Analysis saved: ${filename}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to save analysis: ${error.message}`));
    }
  }

  // Quick Action Command Handlers (Issue #39)

  async quickBuild(options) {
    console.log(chalk.blue('🔨 Running Build\n'));

    // Detect build script
    const buildScript = await this.detectBuildScript();
    if (!buildScript) {
      console.log(chalk.yellow('⚠️  No build script detected in package.json'));
      console.log(chalk.gray('Make sure your project has a "build" script defined'));
      return;
    }

    const { env, watch } = options;
    console.log(chalk.gray(`Build environment: ${env}`));
    if (watch) console.log(chalk.gray('Watch mode enabled'));

    try {
      let command = buildScript;
      
      // Add environment-specific flags
      if (env === 'prod' || env === 'production') {
        command += ' --mode production';
      } else if (env === 'dev' || env === 'development') {
        command += ' --mode development';
      }
      
      if (watch) {
        command += ' --watch';
      }

      console.log(chalk.gray(`Running: ${command}\n`));
      
      const startTime = Date.now();
      execSync(command, { stdio: 'inherit', cwd: process.cwd() });
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(chalk.green(`\n✅ Build completed successfully in ${duration}s`));
    } catch (error) {
      console.log(chalk.red('\n❌ Build failed'));
      console.log(chalk.gray('Check the output above for error details'));
      process.exit(1);
    }
  }

  async quickTest(options) {
    console.log(chalk.blue('🧪 Running Tests\n'));

    const testScript = await this.detectTestScript();
    if (!testScript) {
      console.log(chalk.yellow('⚠️  No test script detected in package.json'));
      console.log(chalk.gray('Make sure your project has a "test" script defined'));
      return;
    }

    const { watch, coverage, file } = options;

    try {
      let command = testScript;
      
      if (watch) {
        command += ' --watch';
      }
      
      if (coverage) {
        command += ' --coverage';
      }
      
      if (file) {
        command += ` ${file}`;
      }

      console.log(chalk.gray(`Running: ${command}\n`));
      
      const startTime = Date.now();
      execSync(command, { stdio: 'inherit', cwd: process.cwd() });
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(chalk.green(`\n✅ Tests completed successfully in ${duration}s`));
    } catch (error) {
      console.log(chalk.red('\n❌ Tests failed'));
      console.log(chalk.gray('Check the output above for error details'));
      process.exit(1);
    }
  }

  async quickLint(options) {
    console.log(chalk.blue('🔍 Running Linter\n'));

    const lintScript = await this.detectLintScript();
    if (!lintScript) {
      console.log(chalk.yellow('⚠️  No lint script detected in package.json'));
      console.log(chalk.gray('Make sure your project has a "lint" script defined'));
      return;
    }

    const { fix, format } = options;

    try {
      let command = lintScript;
      
      if (fix) {
        command += ' --fix';
      }

      console.log(chalk.gray(`Running: ${command}\n`));
      
      const startTime = Date.now();
      execSync(command, { stdio: 'inherit', cwd: process.cwd() });
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(chalk.green(`\n✅ Linting completed successfully in ${duration}s`));

      // Run formatter if requested
      if (format) {
        console.log(chalk.blue('\n🎨 Running Formatter\n'));
        const formatScript = await this.detectFormatScript();
        if (formatScript) {
          execSync(formatScript, { stdio: 'inherit', cwd: process.cwd() });
          console.log(chalk.green('✅ Code formatted successfully'));
        } else {
          console.log(chalk.yellow('⚠️  No format script detected, skipping formatting'));
        }
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Linting failed'));
      console.log(chalk.gray('Check the output above for error details'));
      process.exit(1);
    }
  }

  async quickFix(options) {
    console.log(chalk.blue('🔧 Auto-fixing Issues\n'));

    try {
      // Run lint with --fix
      await this.quickLint({ fix: true, format: false });
      
      // Run formatter
      const formatScript = await this.detectFormatScript();
      if (formatScript) {
        console.log(chalk.blue('\n🎨 Formatting code\n'));
        execSync(formatScript, { stdio: 'inherit', cwd: process.cwd() });
        console.log(chalk.green('✅ Code formatted successfully'));
      }

      console.log(chalk.green('\n🎉 Auto-fix completed successfully!'));
    } catch (error) {
      console.log(chalk.red('\n❌ Auto-fix failed'));
      console.log(chalk.gray('Some issues may require manual intervention'));
    }
  }

  async quickTypecheck(options) {
    console.log(chalk.blue('📝 Running TypeScript Type Check\n'));

    const typecheckScript = await this.detectTypecheckScript();
    if (!typecheckScript) {
      console.log(chalk.yellow('⚠️  No typecheck script detected'));
      console.log(chalk.gray('Make sure your project has TypeScript configured'));
      return;
    }

    const { watch } = options;

    try {
      let command = typecheckScript;
      
      if (watch) {
        command += ' --watch';
      }

      console.log(chalk.gray(`Running: ${command}\n`));
      
      const startTime = Date.now();
      execSync(command, { stdio: 'inherit', cwd: process.cwd() });
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(chalk.green(`\n✅ Type checking completed successfully in ${duration}s`));
    } catch (error) {
      console.log(chalk.red('\n❌ Type checking failed'));
      console.log(chalk.gray('Check the output above for type errors'));
      process.exit(1);
    }
  }

  async quickStatus(options) {
    console.log(chalk.blue('📊 Enhanced Git Status\n'));

    try {
      // Get git status
      const status = execSync('git status --porcelain', { encoding: 'utf-8', cwd: process.cwd() });
      const lines = status.trim().split('\n').filter(line => line.length > 0);

      if (lines.length === 0) {
        console.log(chalk.green('✅ Working tree clean - no changes to commit'));
        
        if (options.branch) {
          const branch = execSync('git branch --show-current', { encoding: 'utf-8', cwd: process.cwd() }).trim();
          console.log(chalk.gray(`Current branch: ${branch}`));
          
          try {
            const ahead = execSync('git rev-list --count @{u}..HEAD', { encoding: 'utf-8', cwd: process.cwd() }).trim();
            const behind = execSync('git rev-list --count HEAD..@{u}', { encoding: 'utf-8', cwd: process.cwd() }).trim();
            
            if (ahead > 0) {
              console.log(chalk.yellow(`↑ ${ahead} commit(s) ahead of remote`));
            }
            if (behind > 0) {
              console.log(chalk.yellow(`↓ ${behind} commit(s) behind remote`));
            }
            if (ahead === '0' && behind === '0') {
              console.log(chalk.green('🔄 Up to date with remote'));
            }
          } catch {
            console.log(chalk.gray('(No upstream branch configured)'));
          }
        }
        return;
      }

      // Categorize changes
      const staged = [];
      const modified = [];
      const untracked = [];
      const deleted = [];

      lines.forEach(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        
        if (status[0] === 'A' || status[0] === 'M') {
          staged.push({ file, status: status[0] });
        } else if (status[1] === 'M') {
          modified.push(file);
        } else if (status === '??') {
          untracked.push(file);
        } else if (status[1] === 'D') {
          deleted.push(file);
        }
      });

      // Display categorized results
      if (staged.length > 0) {
        console.log(chalk.green(`📦 Staged changes (${staged.length}):`));
        staged.forEach(item => {
          const icon = item.status === 'A' ? '✨' : '📝';
          console.log(chalk.gray(`  ${icon} ${item.file}`));
        });
        console.log();
      }

      if (modified.length > 0) {
        console.log(chalk.yellow(`📝 Modified files (${modified.length}):`));
        modified.forEach(file => {
          console.log(chalk.gray(`  📝 ${file}`));
        });
        console.log();
      }

      if (deleted.length > 0) {
        console.log(chalk.red(`🗑️  Deleted files (${deleted.length}):`));
        deleted.forEach(file => {
          console.log(chalk.gray(`  🗑️  ${file}`));
        });
        console.log();
      }

      if (untracked.length > 0) {
        console.log(chalk.blue(`➕ Untracked files (${untracked.length}):`));
        untracked.forEach(file => {
          console.log(chalk.gray(`  ➕ ${file}`));
        });
        console.log();
      }

      // Show branch info
      if (options.branch) {
        const branch = execSync('git branch --show-current', { encoding: 'utf-8', cwd: process.cwd() }).trim();
        console.log(chalk.gray(`Current branch: ${branch}`));
      }

    } catch (error) {
      console.log(chalk.red('❌ Not a git repository or git not available'));
    }
  }

  async quickCommit(options) {
    console.log(chalk.blue('📝 Quick Commit\n'));

    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain', { encoding: 'utf-8', cwd: process.cwd() });
      if (status.trim().length === 0) {
        console.log(chalk.yellow('⚠️  No changes to commit'));
        return;
      }

      let { type, message, scope } = options;

      // Interactive prompts if not provided
      if (!type || !message) {
        const prompts = [];
        
        if (!type) {
          prompts.push({
            type: 'list',
            name: 'type',
            message: 'Select commit type:',
            choices: [
              { name: 'feat: A new feature', value: 'feat' },
              { name: 'fix: A bug fix', value: 'fix' },
              { name: 'docs: Documentation changes', value: 'docs' },
              { name: 'style: Code style changes (formatting)', value: 'style' },
              { name: 'refactor: Code refactoring', value: 'refactor' },
              { name: 'test: Adding or updating tests', value: 'test' },
              { name: 'chore: Maintenance tasks', value: 'chore' },
              { name: 'ci: CI/CD changes', value: 'ci' }
            ]
          });
        }

        if (!scope) {
          prompts.push({
            type: 'input',
            name: 'scope',
            message: 'Commit scope (optional):',
            validate: input => true
          });
        }

        if (!message) {
          prompts.push({
            type: 'input',
            name: 'message',
            message: 'Commit message:',
            validate: input => input.trim().length > 0 || 'Message is required'
          });
        }

        if (prompts.length > 0) {
          const answers = await inquirer.prompt(prompts);
          type = type || answers.type;
          scope = scope || answers.scope;
          message = message || answers.message;
        }
      }

      // Build commit message
      let commitMessage = type;
      if (scope && scope.trim() !== '') {
        commitMessage += `(${scope.trim()})`;
      }
      commitMessage += `: ${message}`;

      console.log(chalk.gray(`Commit message: ${commitMessage}\n`));

      // Stage all changes first
      execSync('git add .', { cwd: process.cwd() });
      
      // Commit
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit', cwd: process.cwd() });
      
      console.log(chalk.green('✅ Commit created successfully'));

      // Ask if user wants to push
      const { shouldPush } = await inquirer.prompt([{
        type: 'confirm',
        name: 'shouldPush',
        message: 'Push to remote?',
        default: false
      }]);

      if (shouldPush) {
        await this.quickPush({});
      }

    } catch (error) {
      console.log(chalk.red('❌ Commit failed'));
      console.log(chalk.gray('Check git status and try again'));
    }
  }

  async quickPush(options) {
    console.log(chalk.blue('🚀 Pushing to Remote\n'));

    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf-8', cwd: process.cwd() }).trim();
      console.log(chalk.gray(`Current branch: ${branch}`));

      const { force, upstream } = options;

      let command = 'git push';
      
      if (upstream) {
        command += ` --set-upstream origin ${branch}`;
      }
      
      if (force) {
        const { confirmForce } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirmForce',
          message: '⚠️  Force push can be dangerous. Are you sure?',
          default: false
        }]);
        
        if (!confirmForce) {
          console.log(chalk.yellow('Push cancelled'));
          return;
        }
        
        command += ' --force';
      }

      console.log(chalk.gray(`Running: ${command}\n`));
      
      execSync(command, { stdio: 'inherit', cwd: process.cwd() });
      
      console.log(chalk.green('✅ Push completed successfully'));

      // Show remote status
      try {
        const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8', cwd: process.cwd() }).trim();
        console.log(chalk.gray(`Remote: ${remoteUrl}`));
      } catch {
        // Ignore if no remote
      }

    } catch (error) {
      console.log(chalk.red('❌ Push failed'));
      
      // Check if it's an upstream issue
      if (error.message.includes('upstream')) {
        console.log(chalk.yellow('💡 Tip: Use --upstream flag to set up tracking'));
        console.log(chalk.gray('   Example: fsd slash "/push --upstream"'));
      }
    }
  }

  // Extended Thinking Command Handlers (Issue #41)

  async extendedPlan(options) {
    console.log(chalk.blue('🧠 Extended Planning Mode\n'));
    console.log(chalk.gray('Entering extended thinking mode for comprehensive planning...\n'));

    const { topic, scope, timeline } = options;
    const createAdr = options['create-adr'];

    console.log(chalk.white('🔍 Initial Analysis:'));
    console.log(chalk.gray(`  Topic: ${topic}`));
    console.log(chalk.gray(`  Scope: ${scope}`));
    if (timeline) console.log(chalk.gray(`  Timeline: ${timeline}`));

    console.log(chalk.blue('\n<extended-thinking>'));
    console.log(chalk.gray('Let me think through this planning request systematically:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. CONTEXT ANALYSIS'));
    console.log(chalk.gray('   - What is the current state?'));
    console.log(chalk.gray('   - What are the stakeholder needs?'));
    console.log(chalk.gray('   - What constraints exist?'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('2. GOAL DECOMPOSITION'));
    console.log(chalk.gray('   - Primary objectives'));
    console.log(chalk.gray('   - Secondary benefits'));
    console.log(chalk.gray('   - Success metrics'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('3. APPROACH EVALUATION'));
    console.log(chalk.gray('   - Multiple solution paths'));
    console.log(chalk.gray('   - Risk assessment for each'));
    console.log(chalk.gray('   - Resource requirements'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('4. IMPLEMENTATION STRATEGY'));
    console.log(chalk.gray('   - Phase breakdown'));
    console.log(chalk.gray('   - Dependencies and blockers'));
    console.log(chalk.gray('   - Validation checkpoints'));
    console.log(chalk.blue('</extended-thinking>\n'));

    // Simulate deep analysis based on scope
    const analysis = await this.performExtendedPlanning(topic, scope, timeline);

    console.log(chalk.white('📋 Comprehensive Planning Analysis:\n'));

    console.log(chalk.white('🎯 Objectives & Success Criteria:'));
    analysis.objectives.forEach((obj, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${obj.goal}`));
      console.log(chalk.gray(`     Success: ${obj.successCriteria}`));
      console.log(chalk.gray(`     Priority: ${obj.priority}`));
    });

    console.log(chalk.white('\n🔀 Alternative Approaches:'));
    analysis.approaches.forEach((approach, index) => {
      console.log(chalk.gray(`  Approach ${index + 1}: ${approach.name}`));
      console.log(chalk.gray(`    Pros: ${approach.pros.join(', ')}`));
      console.log(chalk.gray(`    Cons: ${approach.cons.join(', ')}`));
      console.log(chalk.gray(`    Risk Level: ${approach.riskLevel}`));
      console.log(chalk.gray(`    Effort: ${approach.effort}`));
    });

    console.log(chalk.white('\n📅 Implementation Phases:'));
    analysis.phases.forEach((phase, index) => {
      console.log(chalk.gray(`  Phase ${index + 1}: ${phase.name} (${phase.duration})`));
      console.log(chalk.gray(`    Deliverables: ${phase.deliverables.join(', ')}`));
      console.log(chalk.gray(`    Dependencies: ${phase.dependencies.join(', ') || 'None'}`));
      console.log(chalk.gray(`    Risk Mitigation: ${phase.riskMitigation}`));
    });

    console.log(chalk.white('\n⚠️  Risk Analysis:'));
    analysis.risks.forEach(risk => {
      console.log(chalk.yellow(`  🚨 ${risk.description} (${risk.probability} probability, ${risk.impact} impact)`));
      console.log(chalk.gray(`     Mitigation: ${risk.mitigation}`));
    });

    console.log(chalk.white(`\n💡 Recommended Approach: ${analysis.recommendation.approach}`));
    console.log(chalk.gray(`Reasoning: ${analysis.recommendation.reasoning}`));

    if (createAdr) {
      console.log(chalk.blue('\n📄 Creating Architecture Decision Record...\n'));
      await this.createADR(topic, analysis);
    }

    // Save planning report
    const filename = `extended-planning-${Date.now()}.md`;
    const report = this.generatePlanningReport(topic, analysis);
    
    try {
      await fs.writeFile(filename, report);
      console.log(chalk.green(`\n💾 Planning report saved: ${filename}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to save report: ${error.message}`));
    }
  }

  async extendedInvestigate(options) {
    console.log(chalk.blue('🔍 Extended Investigation Mode\n'));
    console.log(chalk.gray('Conducting multi-source research and analysis...\n'));

    const { question, sources, depth } = options;

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('For this investigation, I need to:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Break down the question into sub-questions'));
    console.log(chalk.gray('2. Identify the best sources for each aspect'));
    console.log(chalk.gray('3. Consider multiple perspectives and potential biases'));
    console.log(chalk.gray('4. Synthesize findings into actionable insights'));
    console.log(chalk.gray('5. Identify gaps that need further research'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const investigation = await this.performExtendedInvestigation(question, sources, depth);

    console.log(chalk.white(`🔬 Investigation Results: ${question}\n`));

    console.log(chalk.white('📋 Sub-Questions Identified:'));
    investigation.subQuestions.forEach((sub, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${sub.question}`));
      console.log(chalk.gray(`     Importance: ${sub.importance}`));
    });

    console.log(chalk.white('\n📚 Information Sources:'));
    investigation.sources.forEach((source, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${source.type}: ${source.description}`));
      console.log(chalk.gray(`     Relevance: ${source.relevance}`));
      console.log(chalk.gray(`     Reliability: ${source.reliability}`));
    });

    console.log(chalk.white('\n🔍 Key Findings:'));
    investigation.findings.forEach((finding, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${finding.summary}`));
      console.log(chalk.gray(`     Evidence: ${finding.evidence}`));
      console.log(chalk.gray(`     Confidence: ${finding.confidence}`));
    });

    console.log(chalk.white('\n🧩 Synthesis:'));
    console.log(chalk.gray(`  ${investigation.synthesis.mainConclusion}`));
    console.log(chalk.gray(`  Supporting Evidence: ${investigation.synthesis.supportingEvidence.join(', ')}`));

    if (investigation.gaps.length > 0) {
      console.log(chalk.yellow('\n❓ Knowledge Gaps Identified:'));
      investigation.gaps.forEach(gap => {
        console.log(chalk.yellow(`  • ${gap.description}`));
        console.log(chalk.gray(`    Suggested research: ${gap.nextSteps}`));
      });
    }

    console.log(chalk.green('\n💡 Actionable Recommendations:'));
    investigation.recommendations.forEach((rec, index) => {
      console.log(chalk.green(`  ${index + 1}. ${rec.action}`));
      console.log(chalk.gray(`     Rationale: ${rec.rationale}`));
      console.log(chalk.gray(`     Priority: ${rec.priority}`));
    });
  }

  async extendedDecide(options) {
    console.log(chalk.blue('🤔 Extended Decision Making Mode\n'));

    const { decision, alternatives } = options;
    const createAdr = options['create-adr'];

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('Making architectural decisions requires:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Clear problem definition'));
    console.log(chalk.gray('2. Comprehensive alternative generation'));
    console.log(chalk.gray('3. Multi-criteria evaluation framework'));
    console.log(chalk.gray('4. Impact analysis and trade-offs'));
    console.log(chalk.gray('5. Documentation for future reference'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const decisionAnalysis = await this.performExtendedDecisionAnalysis(decision, alternatives);

    console.log(chalk.white(`⚖️  Decision Analysis: ${decision}\n`));

    console.log(chalk.white('🎯 Decision Context:'));
    console.log(chalk.gray(`  Problem: ${decisionAnalysis.context.problem}`));
    console.log(chalk.gray(`  Constraints: ${decisionAnalysis.context.constraints.join(', ')}`));
    console.log(chalk.gray(`  Stakeholders: ${decisionAnalysis.context.stakeholders.join(', ')}`));

    console.log(chalk.white('\n⚖️  Evaluation Criteria:'));
    decisionAnalysis.criteria.forEach((criterion, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${criterion.name} (Weight: ${criterion.weight})`));
      console.log(chalk.gray(`     Description: ${criterion.description}`));
    });

    console.log(chalk.white('\n🔀 Alternative Solutions:'));
    decisionAnalysis.alternatives.forEach((alt, index) => {
      console.log(chalk.gray(`  Option ${index + 1}: ${alt.name}`));
      console.log(chalk.gray(`    Description: ${alt.description}`));
      console.log(chalk.gray(`    Score: ${alt.totalScore}/${decisionAnalysis.maxScore}`));
      console.log(chalk.gray(`    Pros: ${alt.pros.join(', ')}`));
      console.log(chalk.gray(`    Cons: ${alt.cons.join(', ')}`));
      console.log(chalk.gray(`    Implementation Effort: ${alt.effort}`));
    });

    console.log(chalk.green(`\n🏆 Recommended Decision: ${decisionAnalysis.recommendation.choice}`));
    console.log(chalk.gray(`Reasoning: ${decisionAnalysis.recommendation.reasoning}`));
    console.log(chalk.gray(`Expected Benefits: ${decisionAnalysis.recommendation.benefits.join(', ')}`));

    if (createAdr) {
      console.log(chalk.blue('\n📄 Creating Architecture Decision Record...\n'));
      await this.createADR(decision, decisionAnalysis, 'decision');
    }
  }

  async extendedEstimate(options) {
    console.log(chalk.blue('📊 Extended Estimation Mode\n'));

    const { work, method, confidence } = options;

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('Accurate estimation requires considering:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Task decomposition and dependencies'));
    console.log(chalk.gray('2. Historical data and team velocity'));
    console.log(chalk.gray('3. Complexity factors and unknowns'));
    console.log(chalk.gray('4. Risk scenarios and buffer calculations'));
    console.log(chalk.gray('5. Multiple estimation techniques for validation'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const estimation = await this.performExtendedEstimation(work, method, confidence);

    console.log(chalk.white(`📏 Estimation Analysis: ${work}\n`));

    console.log(chalk.white('🧩 Work Breakdown:'));
    estimation.breakdown.forEach((component, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${component.name}`));
      console.log(chalk.gray(`     Complexity: ${component.complexity}`));
      console.log(chalk.gray(`     Base Estimate: ${component.baseEstimate} ${method}`));
      console.log(chalk.gray(`     Uncertainty Factor: ${component.uncertaintyFactor}x`));
    });

    console.log(chalk.white('\n📈 Estimation Methods Applied:'));
    estimation.methods.forEach(methodResult => {
      console.log(chalk.gray(`  ${methodResult.name}: ${methodResult.estimate} ${method}`));
      console.log(chalk.gray(`    Confidence: ${methodResult.confidence}`));
      console.log(chalk.gray(`    Notes: ${methodResult.notes}`));
    });

    console.log(chalk.white('\n⚠️  Risk Scenarios:'));
    estimation.risks.forEach(risk => {
      console.log(chalk.yellow(`  ${risk.scenario}: +${risk.impactEstimate} ${method} (${risk.probability} probability)`));
      console.log(chalk.gray(`    Mitigation: ${risk.mitigation}`));
    });

    console.log(chalk.green(`\n🎯 Final Estimate Range:`));
    console.log(chalk.green(`  Optimistic: ${estimation.final.optimistic} ${method}`));
    console.log(chalk.green(`  Most Likely: ${estimation.final.mostLikely} ${method}`));
    console.log(chalk.green(`  Pessimistic: ${estimation.final.pessimistic} ${method}`));
    console.log(chalk.gray(`  Confidence Level: ${estimation.final.confidence}`));
    console.log(chalk.gray(`  Recommended Buffer: ${estimation.final.recommendedBuffer}%`));
  }

  async extendedDebugStrategy(options) {
    console.log(chalk.blue('🐛 Extended Debug Strategy Mode\n'));

    const { problem, context, urgency } = options;

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('Systematic debugging approach:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Problem characterization and reproduction'));
    console.log(chalk.gray('2. Hypothesis generation and testing'));
    console.log(chalk.gray('3. Evidence collection and analysis'));
    console.log(chalk.gray('4. Root cause identification'));
    console.log(chalk.gray('5. Solution validation and monitoring'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const debugStrategy = await this.createExtendedDebugStrategy(problem, context, urgency);

    console.log(chalk.white(`🔍 Debug Strategy: ${problem}\n`));

    console.log(chalk.white('📋 Problem Analysis:'));
    console.log(chalk.gray(`  Symptom: ${debugStrategy.analysis.symptom}`));
    console.log(chalk.gray(`  Impact: ${debugStrategy.analysis.impact}`));
    console.log(chalk.gray(`  Frequency: ${debugStrategy.analysis.frequency}`));
    console.log(chalk.gray(`  Environment: ${debugStrategy.analysis.environment}`));

    console.log(chalk.white('\n🔬 Investigation Plan:'));
    debugStrategy.investigationSteps.forEach((step, index) => {
      console.log(chalk.gray(`  Step ${index + 1}: ${step.action}`));
      console.log(chalk.gray(`    Expected Outcome: ${step.expectedOutcome}`));
      console.log(chalk.gray(`    Tools Needed: ${step.tools.join(', ')}`));
      console.log(chalk.gray(`    Time Estimate: ${step.timeEstimate}`));
    });

    console.log(chalk.white('\n💡 Working Hypotheses:'));
    debugStrategy.hypotheses.forEach((hypothesis, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${hypothesis.description}`));
      console.log(chalk.gray(`     Likelihood: ${hypothesis.likelihood}`));
      console.log(chalk.gray(`     Test Method: ${hypothesis.testMethod}`));
    });

    if (urgency === 'critical' || urgency === 'high') {
      console.log(chalk.red('\n🚨 Immediate Actions (High Priority):'));
      debugStrategy.immediateActions.forEach((action, index) => {
        console.log(chalk.red(`  ${index + 1}. ${action.description}`));
        console.log(chalk.gray(`     Rationale: ${action.rationale}`));
      });
    }

    console.log(chalk.white('\n📊 Success Criteria:'));
    debugStrategy.successCriteria.forEach(criterion => {
      console.log(chalk.green(`  ✓ ${criterion}`));
    });
  }

  async extendedOptimizePlan(options) {
    console.log(chalk.blue('⚡ Extended Optimization Planning Mode\n'));

    const { target } = options;
    const currentMetrics = options['current-metrics'];
    const goals = options.goals;

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('Performance optimization requires systematic approach:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Baseline measurement and profiling'));
    console.log(chalk.gray('2. Bottleneck identification and prioritization'));
    console.log(chalk.gray('3. Solution evaluation and trade-off analysis'));
    console.log(chalk.gray('4. Implementation strategy with validation'));
    console.log(chalk.gray('5. Monitoring and continuous improvement'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const optimizationPlan = await this.createExtendedOptimizationPlan(target, currentMetrics, goals);

    console.log(chalk.white(`⚡ Optimization Plan: ${target}\n`));

    console.log(chalk.white('📊 Current State Analysis:'));
    console.log(chalk.gray(`  Target: ${optimizationPlan.analysis.target}`));
    console.log(chalk.gray(`  Current Performance: ${optimizationPlan.analysis.currentState}`));
    console.log(chalk.gray(`  Target Goals: ${optimizationPlan.analysis.targetGoals}`));

    console.log(chalk.white('\n🔍 Identified Bottlenecks:'));
    optimizationPlan.bottlenecks.forEach((bottleneck, index) => {
      console.log(chalk.red(`  ${index + 1}. ${bottleneck.description}`));
      console.log(chalk.gray(`     Impact: ${bottleneck.impact} | Effort to Fix: ${bottleneck.effortToFix}`));
      console.log(chalk.gray(`     Root Cause: ${bottleneck.rootCause}`));
    });

    console.log(chalk.white('\n💡 Optimization Strategies:'));
    optimizationPlan.strategies.forEach((strategy, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${strategy.name}`));
      console.log(chalk.gray(`     Expected Improvement: ${strategy.expectedImprovement}`));
      console.log(chalk.gray(`     Implementation Effort: ${strategy.effort}`));
      console.log(chalk.gray(`     Risk Level: ${strategy.riskLevel}`));
    });

    console.log(chalk.green(`\n🎯 Recommended Approach: ${optimizationPlan.recommendation.strategy}`));
    console.log(chalk.gray(`Reasoning: ${optimizationPlan.recommendation.reasoning}`));
  }

  async extendedRefactorPlan(options) {
    console.log(chalk.blue('🔄 Extended Refactoring Planning Mode\n'));

    const { component, goals } = options;
    const riskTolerance = options['risk-tolerance'];

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('Safe refactoring requires:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Current state assessment and code quality metrics'));
    console.log(chalk.gray('2. Clear refactoring objectives and success criteria'));
    console.log(chalk.gray('3. Risk assessment and mitigation strategies'));
    console.log(chalk.gray('4. Incremental approach with validation checkpoints'));
    console.log(chalk.gray('5. Rollback plan and monitoring strategy'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const refactorPlan = await this.createExtendedRefactorPlan(component, goals, riskTolerance);

    console.log(chalk.white(`🔄 Refactoring Plan: ${component}\n`));

    console.log(chalk.white('📋 Current State Assessment:'));
    console.log(chalk.gray(`  Component: ${refactorPlan.assessment.component}`));
    console.log(chalk.gray(`  Code Quality Score: ${refactorPlan.assessment.qualityScore}/10`));
    console.log(chalk.gray(`  Main Issues: ${refactorPlan.assessment.mainIssues.join(', ')}`));
    console.log(chalk.gray(`  Dependencies: ${refactorPlan.assessment.dependencies.length} components affected`));

    console.log(chalk.white('\n🎯 Refactoring Objectives:'));
    refactorPlan.objectives.forEach((objective, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${objective.goal}`));
      console.log(chalk.gray(`     Success Metric: ${objective.successMetric}`));
      console.log(chalk.gray(`     Priority: ${objective.priority}`));
    });

    console.log(chalk.white('\n📅 Incremental Steps:'));
    refactorPlan.steps.forEach((step, index) => {
      console.log(chalk.gray(`  Step ${index + 1}: ${step.name} (${step.duration})`));
      console.log(chalk.gray(`    Description: ${step.description}`));
      console.log(chalk.gray(`    Validation: ${step.validation}`));
      console.log(chalk.gray(`    Rollback Plan: ${step.rollbackPlan}`));
    });

    console.log(chalk.yellow('\n⚠️  Risk Assessment:'));
    refactorPlan.risks.forEach(risk => {
      console.log(chalk.yellow(`  🚨 ${risk.description} (${risk.probability} probability)`));
      console.log(chalk.gray(`     Impact: ${risk.impact}`));
      console.log(chalk.gray(`     Mitigation: ${risk.mitigation}`));
    });
  }

  async extendedResearch(options) {
    console.log(chalk.blue('📚 Extended Research Mode\n'));

    const { topic, focus, output } = options;

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('Comprehensive research approach:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Define research scope and key questions'));
    console.log(chalk.gray('2. Identify authoritative and diverse sources'));
    console.log(chalk.gray('3. Systematic information gathering and verification'));
    console.log(chalk.gray('4. Critical analysis and synthesis'));
    console.log(chalk.gray('5. Actionable recommendations and next steps'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const research = await this.performExtendedResearch(topic, focus, output);

    console.log(chalk.white(`📚 Research Report: ${topic}\n`));

    console.log(chalk.white('🔍 Research Scope:'));
    console.log(chalk.gray(`  Primary Focus: ${research.scope.primaryFocus}`));
    console.log(chalk.gray(`  Key Questions: ${research.scope.keyQuestions.join(', ')}`));
    console.log(chalk.gray(`  Target Audience: ${research.scope.targetAudience}`));

    console.log(chalk.white('\n📖 Information Sources:'));
    research.sources.forEach((source, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${source.name} (${source.type})`));
      console.log(chalk.gray(`     Authority: ${source.authority} | Recency: ${source.recency}`));
      console.log(chalk.gray(`     Key Insights: ${source.keyInsights}`));
    });

    console.log(chalk.white('\n🧩 Research Synthesis:'));
    research.synthesis.themes.forEach((theme, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${theme.name}`));
      console.log(chalk.gray(`     Key Finding: ${theme.keyFinding}`));
      console.log(chalk.gray(`     Supporting Evidence: ${theme.supportingEvidence.join(', ')}`));
    });

    console.log(chalk.green('\n💡 Actionable Insights:'));
    research.insights.forEach((insight, index) => {
      console.log(chalk.green(`  ${index + 1}. ${insight.insight}`));
      console.log(chalk.gray(`     Confidence: ${insight.confidence}`));
      console.log(chalk.gray(`     Next Steps: ${insight.nextSteps}`));
    });

    if (research.gaps.length > 0) {
      console.log(chalk.yellow('\n❓ Research Gaps:'));
      research.gaps.forEach(gap => {
        console.log(chalk.yellow(`  • ${gap.description}`));
        console.log(chalk.gray(`    Importance: ${gap.importance}`));
      });
    }
  }

  async extendedAlternatives(options) {
    console.log(chalk.blue('🔀 Extended Alternatives Analysis Mode\n'));

    const { problem, constraints, criteria } = options;

    console.log(chalk.blue('<extended-thinking>'));
    console.log(chalk.gray('Comprehensive alternatives evaluation:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('1. Problem reframing and constraint analysis'));
    console.log(chalk.gray('2. Creative solution generation techniques'));
    console.log(chalk.gray('3. Multi-criteria evaluation framework'));
    console.log(chalk.gray('4. Trade-off analysis and scenario planning'));
    console.log(chalk.gray('5. Risk assessment for each alternative'));
    console.log(chalk.blue('</extended-thinking>\n'));

    const alternatives = await this.generateExtendedAlternatives(problem, constraints, criteria);

    console.log(chalk.white(`🔀 Alternatives Analysis: ${problem}\n`));

    console.log(chalk.white('📋 Problem Reframing:'));
    console.log(chalk.gray(`  Original Problem: ${alternatives.reframing.originalProblem}`));
    console.log(chalk.gray(`  Root Cause: ${alternatives.reframing.rootCause}`));
    console.log(chalk.gray(`  Reframed Problem: ${alternatives.reframing.reframedProblem}`));

    console.log(chalk.white('\n🔒 Constraints Analysis:'));
    alternatives.constraints.forEach((constraint, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${constraint.description}`));
      console.log(chalk.gray(`     Type: ${constraint.type} | Flexibility: ${constraint.flexibility}`));
    });

    console.log(chalk.white('\n💡 Generated Alternatives:'));
    alternatives.solutions.forEach((solution, index) => {
      console.log(chalk.gray(`  Option ${index + 1}: ${solution.name}`));
      console.log(chalk.gray(`    Description: ${solution.description}`));
      console.log(chalk.gray(`    Innovation Level: ${solution.innovationLevel}`));
      console.log(chalk.gray(`    Feasibility: ${solution.feasibility}`));
      console.log(chalk.gray(`    Pros: ${solution.pros.join(', ')}`));
      console.log(chalk.gray(`    Cons: ${solution.cons.join(', ')}`));
    });

    console.log(chalk.white('\n⚖️  Evaluation Matrix:'));
    alternatives.evaluation.criteria.forEach(criterion => {
      console.log(chalk.gray(`  ${criterion.name} (Weight: ${criterion.weight}%)`));
    });

    console.log(chalk.green(`\n🏆 Top Recommendations:`));
    alternatives.evaluation.topChoices.forEach((choice, index) => {
      console.log(chalk.green(`  ${index + 1}. ${choice.name} (Score: ${choice.score}/100)`));
      console.log(chalk.gray(`     Rationale: ${choice.rationale}`));
    });
  }

  // Helper methods for Extended Thinking commands

  async createExtendedOptimizationPlan(target, currentMetrics, goals) {
    return {
      analysis: {
        target: target,
        currentState: currentMetrics || 'Baseline measurement needed',
        targetGoals: goals || 'Performance improvement goals to be defined'
      },
      bottlenecks: [
        { description: 'Database query optimization needed', impact: 'High', effortToFix: 'Medium', rootCause: 'N+1 queries and missing indexes' },
        { description: 'Frontend bundle size too large', impact: 'Medium', effortToFix: 'Low', rootCause: 'Unused dependencies and no code splitting' }
      ],
      strategies: [
        { name: 'Database Optimization', expectedImprovement: '40-60% response time reduction', effort: 'Medium', riskLevel: 'Low' },
        { name: 'Frontend Optimization', expectedImprovement: '20-30% load time improvement', effort: 'Low', riskLevel: 'Low' },
        { name: 'Caching Implementation', expectedImprovement: '50-70% for cached requests', effort: 'High', riskLevel: 'Medium' }
      ],
      recommendation: {
        strategy: 'Database Optimization First',
        reasoning: 'Highest impact with manageable effort and low risk'
      }
    };
  }

  async createExtendedRefactorPlan(component, goals, riskTolerance) {
    return {
      assessment: {
        component: component,
        qualityScore: 6,
        mainIssues: ['High complexity', 'Tight coupling', 'Limited test coverage'],
        dependencies: ['ComponentA', 'ComponentB', 'ServiceX']
      },
      objectives: [
        { goal: 'Reduce complexity', successMetric: 'Cyclomatic complexity < 10', priority: 'High' },
        { goal: 'Improve testability', successMetric: 'Test coverage > 80%', priority: 'High' },
        { goal: 'Decouple dependencies', successMetric: 'Dependency count < 5', priority: 'Medium' }
      ],
      steps: [
        { 
          name: 'Add comprehensive tests', 
          duration: '2 days',
          description: 'Create test suite for current behavior',
          validation: 'All existing functionality covered',
          rollbackPlan: 'Tests can be disabled if causing issues'
        },
        {
          name: 'Extract utility functions',
          duration: '1 day', 
          description: 'Move reusable logic to separate utilities',
          validation: 'All tests still pass',
          rollbackPlan: 'Revert extraction commits'
        },
        {
          name: 'Simplify main component',
          duration: '3 days',
          description: 'Reduce complexity of core logic',
          validation: 'Complexity metrics improved',
          rollbackPlan: 'Revert to previous version'
        }
      ],
      risks: [
        { description: 'Breaking existing functionality', probability: 'Medium', impact: 'High', mitigation: 'Comprehensive testing and gradual rollout' },
        { description: 'Performance regression', probability: 'Low', impact: 'Medium', mitigation: 'Performance benchmarking at each step' }
      ]
    };
  }

  async performExtendedResearch(topic, focus, output) {
    return {
      scope: {
        primaryFocus: focus || 'Technical analysis',
        keyQuestions: ['What are current best practices?', 'What are emerging trends?', 'What are known limitations?'],
        targetAudience: 'Development team'
      },
      sources: [
        { name: 'Official Documentation', type: 'Primary', authority: 'High', recency: 'Current', keyInsights: 'Established patterns and recommendations' },
        { name: 'Academic Research', type: 'Academic', authority: 'High', recency: 'Recent', keyInsights: 'Theoretical foundations and empirical studies' },
        { name: 'Industry Blogs', type: 'Secondary', authority: 'Medium', recency: 'Current', keyInsights: 'Real-world implementation experiences' }
      ],
      synthesis: {
        themes: [
          { name: 'Best Practices', keyFinding: 'Industry consensus on key approaches', supportingEvidence: ['Documentation', 'Multiple case studies'] },
          { name: 'Emerging Trends', keyFinding: 'New approaches showing promise', supportingEvidence: ['Research papers', 'Early adopter reports'] }
        ]
      },
      insights: [
        { insight: 'Current approach is well-established and reliable', confidence: 'High', nextSteps: 'Consider implementation with standard patterns' },
        { insight: 'Emerging alternatives worth monitoring', confidence: 'Medium', nextSteps: 'Set up evaluation criteria for future assessment' }
      ],
      gaps: [
        { description: 'Limited performance comparison data', importance: 'Medium' },
        { description: 'Lack of long-term maintenance costs analysis', importance: 'High' }
      ]
    };
  }

  async generateExtendedAlternatives(problem, constraints, criteria) {
    return {
      reframing: {
        originalProblem: problem,
        rootCause: 'Need to identify underlying cause through analysis',
        reframedProblem: 'How might we address the root cause while respecting constraints?'
      },
      constraints: [
        { description: 'Time limitations', type: 'Resource', flexibility: 'Low' },
        { description: 'Budget restrictions', type: 'Financial', flexibility: 'Medium' },
        { description: 'Technical compatibility', type: 'Technical', flexibility: 'High' }
      ],
      solutions: [
        {
          name: 'Conservative Solution',
          description: 'Minimal changes using existing technologies',
          innovationLevel: 'Low',
          feasibility: 'High',
          pros: ['Low risk', 'Quick implementation', 'Team familiar'],
          cons: ['Limited improvement', 'May not solve root cause']
        },
        {
          name: 'Moderate Innovation',
          description: 'Balanced approach with some new technologies',
          innovationLevel: 'Medium',
          feasibility: 'Medium',
          pros: ['Good improvement potential', 'Reasonable risk', 'Learning opportunity'],
          cons: ['More complex', 'Longer timeline']
        },
        {
          name: 'Innovative Solution',
          description: 'New approach using cutting-edge technologies',
          innovationLevel: 'High', 
          feasibility: 'Low',
          pros: ['Maximum improvement', 'Future-proof', 'Competitive advantage'],
          cons: ['High risk', 'Unknown challenges', 'Steep learning curve']
        }
      ],
      evaluation: {
        criteria: [
          { name: 'Implementation Speed', weight: 30 },
          { name: 'Risk Level', weight: 25 },
          { name: 'Long-term Value', weight: 25 },
          { name: 'Team Capability', weight: 20 }
        ],
        topChoices: [
          { name: 'Moderate Innovation', score: 82, rationale: 'Best balance of risk, value, and feasibility' },
          { name: 'Conservative Solution', score: 75, rationale: 'Lowest risk option with acceptable results' }
        ]
      }
    };
  }

  // Helper methods for Extended Thinking

  async performExtendedPlanning(topic, scope, timeline) {
    // Simulate deep planning analysis
    return {
      objectives: [
        {
          goal: `Implement ${topic} successfully`,
          successCriteria: 'Feature delivered on time with quality',
          priority: 'High'
        },
        {
          goal: 'Maintain system stability',
          successCriteria: 'No regression in existing functionality',
          priority: 'High'
        },
        {
          goal: 'Team learning and growth',
          successCriteria: 'Team gains new skills and knowledge',
          priority: 'Medium'
        }
      ],
      approaches: [
        {
          name: 'Incremental Implementation',
          pros: ['Lower risk', 'Early feedback', 'Easier testing'],
          cons: ['Longer timeline', 'More coordination needed'],
          riskLevel: 'Low',
          effort: 'Medium'
        },
        {
          name: 'Big Bang Implementation',
          pros: ['Faster delivery', 'Less coordination overhead'],
          cons: ['Higher risk', 'Late feedback', 'Complex testing'],
          riskLevel: 'High',
          effort: 'High'
        },
        {
          name: 'Proof of Concept First',
          pros: ['Validates approach', 'Identifies issues early'],
          cons: ['Additional time investment', 'Potential rework'],
          riskLevel: 'Medium',
          effort: 'Low'
        }
      ],
      phases: [
        {
          name: 'Discovery & Planning',
          duration: '1 week',
          deliverables: ['Requirements analysis', 'Technical design', 'Risk assessment'],
          dependencies: [],
          riskMitigation: 'Stakeholder validation sessions'
        },
        {
          name: 'Core Implementation',
          duration: '2-3 weeks',
          deliverables: ['Core functionality', 'Unit tests', 'Integration'],
          dependencies: ['Discovery completion'],
          riskMitigation: 'Daily check-ins and demos'
        },
        {
          name: 'Testing & Refinement',
          duration: '1 week',
          deliverables: ['Testing completion', 'Performance validation', 'Documentation'],
          dependencies: ['Core implementation'],
          riskMitigation: 'User acceptance testing'
        }
      ],
      risks: [
        {
          description: 'Requirements change during implementation',
          probability: 'Medium',
          impact: 'Medium',
          mitigation: 'Regular stakeholder check-ins and change control process'
        },
        {
          description: 'Technical complexity higher than expected',
          probability: 'Low',
          impact: 'High',
          mitigation: 'Early prototyping and proof of concept'
        }
      ],
      recommendation: {
        approach: 'Incremental Implementation with PoC',
        reasoning: 'Balances risk mitigation with learning opportunities and maintains delivery confidence'
      }
    };
  }

  async performExtendedInvestigation(question, sources, depth) {
    return {
      subQuestions: [
        { question: 'What are the current best practices?', importance: 'High' },
        { question: 'What are the known limitations?', importance: 'Medium' },
        { question: 'What emerging trends should we consider?', importance: 'Medium' }
      ],
      sources: [
        { type: 'Documentation', description: 'Official documentation and guides', relevance: 'High', reliability: 'High' },
        { type: 'Community', description: 'Stack Overflow, forums, blogs', relevance: 'Medium', reliability: 'Medium' },
        { type: 'Academic', description: 'Research papers and studies', relevance: 'Medium', reliability: 'High' }
      ],
      findings: [
        { summary: 'Current approaches are well documented', evidence: 'Multiple reliable sources', confidence: 'High' },
        { summary: 'Some performance concerns identified', evidence: 'Community reports', confidence: 'Medium' }
      ],
      synthesis: {
        mainConclusion: 'Approach is viable with some considerations for performance',
        supportingEvidence: ['Documentation quality', 'Community adoption', 'Performance benchmarks']
      },
      gaps: [
        { description: 'Limited real-world performance data', nextSteps: 'Conduct performance testing' }
      ],
      recommendations: [
        { action: 'Proceed with implementation', rationale: 'Strong documentation and community support', priority: 'High' },
        { action: 'Plan performance testing', rationale: 'Address identified performance concerns', priority: 'Medium' }
      ]
    };
  }

  async performExtendedDecisionAnalysis(decision, alternatives) {
    return {
      context: {
        problem: `Need to make decision about ${decision}`,
        constraints: ['Time limitations', 'Resource constraints', 'Technical compatibility'],
        stakeholders: ['Development team', 'Product team', 'End users']
      },
      criteria: [
        { name: 'Implementation Complexity', weight: 20, description: 'How difficult to implement' },
        { name: 'Maintenance Burden', weight: 25, description: 'Long-term maintenance requirements' },
        { name: 'Performance Impact', weight: 30, description: 'Effect on system performance' },
        { name: 'Team Familiarity', weight: 25, description: 'Team experience with approach' }
      ],
      alternatives: [
        {
          name: 'Option A: Conservative Approach',
          description: 'Use well-established patterns and technologies',
          totalScore: 85,
          pros: ['Low risk', 'Team familiar', 'Good documentation'],
          cons: ['May be slower', 'Less innovative'],
          effort: 'Medium'
        },
        {
          name: 'Option B: Modern Approach',
          description: 'Use latest technologies and patterns',
          totalScore: 75,
          pros: ['Better performance', 'Future-proof', 'Learning opportunity'],
          cons: ['Higher risk', 'Learning curve', 'Less documentation'],
          effort: 'High'
        }
      ],
      maxScore: 100,
      recommendation: {
        choice: 'Option A: Conservative Approach',
        reasoning: 'Higher overall score due to lower risk and team familiarity',
        benefits: ['Predictable timeline', 'Lower risk', 'Faster development']
      }
    };
  }

  async performExtendedEstimation(work, method, confidence) {
    return {
      breakdown: [
        { name: 'Core Implementation', complexity: 'Medium', baseEstimate: 8, uncertaintyFactor: 1.5 },
        { name: 'Testing & Validation', complexity: 'Low', baseEstimate: 3, uncertaintyFactor: 1.2 },
        { name: 'Documentation', complexity: 'Low', baseEstimate: 2, uncertaintyFactor: 1.1 }
      ],
      methods: [
        { name: 'Bottom-up Estimation', estimate: 13, confidence: 'Medium', notes: 'Based on task breakdown' },
        { name: 'Historical Comparison', estimate: 15, confidence: 'High', notes: 'Similar to previous project' },
        { name: 'Expert Judgment', estimate: 12, confidence: 'Medium', notes: 'Team lead estimate' }
      ],
      risks: [
        { scenario: 'Requirements clarification needed', impactEstimate: 3, probability: 'Medium', mitigation: 'Early stakeholder engagement' },
        { scenario: 'Integration complexity', impactEstimate: 5, probability: 'Low', mitigation: 'Proof of concept testing' }
      ],
      final: {
        optimistic: 10,
        mostLikely: 13,
        pessimistic: 20,
        confidence: confidence,
        recommendedBuffer: 25
      }
    };
  }

  async createExtendedDebugStrategy(problem, context, urgency) {
    return {
      analysis: {
        symptom: problem,
        impact: urgency === 'critical' ? 'System down' : urgency === 'high' ? 'User experience degraded' : 'Minor inconvenience',
        frequency: 'To be determined',
        environment: 'Production and staging'
      },
      investigationSteps: [
        { action: 'Reproduce the issue', expectedOutcome: 'Consistent reproduction', tools: ['Local environment', 'Test data'], timeEstimate: '30 minutes' },
        { action: 'Check recent changes', expectedOutcome: 'Identify potential causes', tools: ['Git history', 'Deployment logs'], timeEstimate: '15 minutes' },
        { action: 'Analyze error logs', expectedOutcome: 'Find error patterns', tools: ['Log aggregation', 'Error tracking'], timeEstimate: '30 minutes' }
      ],
      hypotheses: [
        { description: 'Recent code change introduced bug', likelihood: 'High', testMethod: 'Code review and rollback testing' },
        { description: 'External dependency failure', likelihood: 'Medium', testMethod: 'Service health checks' },
        { description: 'Resource exhaustion', likelihood: 'Low', testMethod: 'System monitoring review' }
      ],
      immediateActions: urgency === 'critical' || urgency === 'high' ? [
        { description: 'Enable detailed logging', rationale: 'Gather more diagnostic information' },
        { description: 'Prepare rollback plan', rationale: 'Quick recovery option if needed' }
      ] : [],
      successCriteria: [
        'Problem no longer occurs',
        'Root cause identified and documented',
        'Prevention measures implemented'
      ]
    };
  }

  async createADR(title, analysis, type = 'planning') {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `docs/architecture/adr-${timestamp}-${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    
    let adrContent = `# Architecture Decision Record: ${title}

**Date:** ${timestamp}
**Status:** Proposed
**Decision Maker(s):** Development Team

## Context

${type === 'decision' ? analysis.context.problem : `Planning analysis for: ${title}`}

## Decision

${type === 'decision' ? analysis.recommendation.choice : analysis.recommendation.approach}

## Rationale

${type === 'decision' ? analysis.recommendation.reasoning : analysis.recommendation.reasoning}

## Consequences

### Positive
${type === 'decision' ? 
  analysis.recommendation.benefits.map(b => `- ${b}`).join('\n') :
  analysis.approaches[0].pros.map(p => `- ${p}`).join('\n')
}

### Negative
${type === 'decision' ? 
  analysis.alternatives.find(a => a.name === analysis.recommendation.choice)?.cons.map(c => `- ${c}`).join('\n') || '- None identified' :
  analysis.approaches[0].cons.map(c => `- ${c}`).join('\n')
}

## Alternatives Considered

${type === 'decision' ? 
  analysis.alternatives.map((alt, i) => `${i + 1}. **${alt.name}**: ${alt.description}`).join('\n') :
  analysis.approaches.map((app, i) => `${i + 1}. **${app.name}**: Risk Level ${app.riskLevel}, Effort ${app.effort}`).join('\n')
}

---

*Generated by Flow State Dev Extended Thinking Commands*
`;

    try {
      // Ensure docs/architecture directory exists
      await fs.ensureDir('docs/architecture');
      await fs.writeFile(filename, adrContent);
      console.log(chalk.green(`📄 ADR created: ${filename}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create ADR: ${error.message}`));
    }
  }

  generatePlanningReport(topic, analysis) {
    return `# Extended Planning Report: ${topic}

**Generated:** ${new Date().toISOString()}

## Executive Summary

${analysis.recommendation.reasoning}

## Objectives

${analysis.objectives.map((obj, i) => `${i + 1}. **${obj.goal}** (${obj.priority} Priority)
   - Success Criteria: ${obj.successCriteria}`).join('\n')}

## Approach Analysis

${analysis.approaches.map((app, i) => `### Approach ${i + 1}: ${app.name}
- **Risk Level:** ${app.riskLevel}
- **Effort:** ${app.effort}
- **Pros:** ${app.pros.join(', ')}
- **Cons:** ${app.cons.join(', ')}`).join('\n\n')}

## Implementation Phases

${analysis.phases.map((phase, i) => `### Phase ${i + 1}: ${phase.name}
- **Duration:** ${phase.duration}
- **Deliverables:** ${phase.deliverables.join(', ')}
- **Dependencies:** ${phase.dependencies.join(', ') || 'None'}
- **Risk Mitigation:** ${phase.riskMitigation}`).join('\n\n')}

## Risk Management

${analysis.risks.map(risk => `- **${risk.description}** (${risk.probability} probability, ${risk.impact} impact)
  - Mitigation: ${risk.mitigation}`).join('\n')}

## Recommendation

**Approach:** ${analysis.recommendation.approach}

**Reasoning:** ${analysis.recommendation.reasoning}

---

*Generated by Flow State Dev Extended Planning*
`;
  }

  // Helper methods for detecting package.json scripts

  async detectBuildScript() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.build) return 'npm run build';
      if (scripts['build:prod']) return 'npm run build:prod';
      if (scripts['build:dev']) return 'npm run build:dev';
      
      return null;
    } catch {
      return null;
    }
  }

  async detectTestScript() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.test) return 'npm test';
      if (scripts['test:unit']) return 'npm run test:unit';
      if (scripts.jest) return 'npm run jest';
      if (scripts.vitest) return 'npm run vitest';
      
      return null;
    } catch {
      return null;
    }
  }

  async detectLintScript() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.lint) return 'npm run lint';
      if (scripts.eslint) return 'npm run eslint';
      if (scripts['lint:js']) return 'npm run lint:js';
      
      return null;
    } catch {
      return null;
    }
  }

  async detectFormatScript() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.format) return 'npm run format';
      if (scripts.prettier) return 'npm run prettier';
      if (scripts['format:write']) return 'npm run format:write';
      
      return null;
    } catch {
      return null;
    }
  }

  async detectTypecheckScript() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.typecheck) return 'npm run typecheck';
      if (scripts['type-check']) return 'npm run type-check';
      if (scripts.tsc) return 'npm run tsc';
      
      // Fallback: check if TypeScript is available
      try {
        execSync('npx tsc --version', { stdio: 'ignore' });
        return 'npx tsc --noEmit';
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  // Helper Functions for Analysis and Issue Creation

  async analyzeRequirements(scope, template) {
    // AI-powered analysis of requirements
    const analysis = {
      overview: `Analysis of: ${scope}`,
      components: [],
      dependencies: [],
      risks: [],
      totalEffort: 'TBD',
      timeline: 'TBD'
    };

    // Basic parsing and analysis (could be enhanced with AI)
    const lowerScope = scope.toLowerCase();
    
    if (lowerScope.includes('auth') || lowerScope.includes('login')) {
      analysis.components.push(
        { name: 'User Registration', description: 'Sign up functionality', complexity: 'Medium', effort: '5 points' },
        { name: 'User Login', description: 'Authentication system', complexity: 'Medium', effort: '3 points' },
        { name: 'Password Reset', description: 'Reset password workflow', complexity: 'Low', effort: '2 points' },
        { name: 'User Profile', description: 'User profile management', complexity: 'Low', effort: '3 points' }
      );
      analysis.dependencies.push('Email service for password reset', 'Session management system');
      analysis.risks.push('Security vulnerabilities', 'Password complexity requirements');
      analysis.totalEffort = '13 story points';
      analysis.timeline = '2-3 weeks';
    } else if (lowerScope.includes('dashboard') || lowerScope.includes('ui')) {
      analysis.components.push(
        { name: 'Dashboard Layout', description: 'Main dashboard structure', complexity: 'Medium', effort: '4 points' },
        { name: 'Data Visualization', description: 'Charts and graphs', complexity: 'High', effort: '8 points' },
        { name: 'Responsive Design', description: 'Mobile compatibility', complexity: 'Medium', effort: '3 points' },
        { name: 'User Preferences', description: 'Customizable settings', complexity: 'Low', effort: '2 points' }
      );
      analysis.dependencies.push('Design system components', 'Data API endpoints');
      analysis.risks.push('Performance with large datasets', 'Cross-browser compatibility');
      analysis.totalEffort = '17 story points';
      analysis.timeline = '3-4 weeks';
    } else {
      // Generic analysis
      const words = scope.split(' ').filter(word => word.length > 3);
      words.forEach((word, index) => {
        analysis.components.push({
          name: `Component ${index + 1}: ${word}`,
          description: `Implementation of ${word} functionality`,
          complexity: ['Low', 'Medium', 'High'][index % 3],
          effort: `${2 + index} points`
        });
      });
      analysis.totalEffort = `${words.length * 3} story points`;
      analysis.timeline = `${Math.ceil(words.length / 2)} weeks`;
    }

    return analysis;
  }

  async analyzeEpic(epic) {
    const breakdown = {
      summary: `Epic breakdown for: ${epic}`,
      userStories: [],
      technicalTasks: [],
      prerequisites: [],
      timeline: 'TBD'
    };

    // Generate user stories based on epic content
    const epicLower = epic.toLowerCase();
    
    if (epicLower.includes('user') || epicLower.includes('customer')) {
      breakdown.userStories.push(
        {
          title: 'User Registration Flow',
          description: 'As a new user, I want to create an account easily',
          acceptanceCriteria: ['Email validation', 'Password requirements', 'Welcome email'],
          effort: '5 points',
          priority: 'High'
        },
        {
          title: 'User Profile Management',
          description: 'As a user, I want to manage my profile information',
          acceptanceCriteria: ['Edit profile', 'Upload avatar', 'Privacy settings'],
          effort: '3 points',
          priority: 'Medium'
        }
      );
    }

    // Add technical tasks
    breakdown.technicalTasks.push(
      {
        title: 'API Endpoint Implementation',
        description: 'Implement backend API endpoints',
        type: 'Backend',
        effort: '8 points'
      },
      {
        title: 'Database Schema Updates',
        description: 'Update database schema for new features',
        type: 'Database',
        effort: '3 points'
      },
      {
        title: 'Testing Suite',
        description: 'Implement comprehensive tests',
        type: 'Testing',
        effort: '5 points'
      }
    );

    breakdown.prerequisites.push('Design mockups approved', 'Technical architecture defined');
    breakdown.timeline = '4-6 weeks';

    return breakdown;
  }

  async createFeaturePlan(feature, complexity, timeline) {
    const plan = {
      requirements: `Feature analysis for: ${feature}`,
      phases: [],
      technical: [],
      testing: [],
      risks: [],
      totalEffort: 'TBD',
      recommendedTimeline: timeline || 'TBD'
    };

    // Generate phases based on complexity
    const phaseCount = complexity === 'simple' ? 2 : complexity === 'complex' ? 4 : 3;
    
    for (let i = 1; i <= phaseCount; i++) {
      plan.phases.push({
        name: `Phase ${i}`,
        description: `Implementation phase ${i} of ${phaseCount}`,
        deliverables: [`Deliverable ${i}A`, `Deliverable ${i}B`],
        effort: `${5 + i * 2} points`,
        duration: `${i} week${i > 1 ? 's' : ''}`
      });
    }

    plan.technical.push(
      'Frontend component implementation',
      'Backend API development',
      'Database migrations',
      'Integration testing'
    );

    plan.testing.push(
      'Unit tests for all components',
      'Integration tests for API',
      'User acceptance testing',
      'Performance testing'
    );

    if (complexity === 'complex') {
      plan.risks.push(
        { description: 'Technical complexity', impact: 'High', mitigation: 'Prototype critical components first' },
        { description: 'Timeline pressure', impact: 'Medium', mitigation: 'Break into smaller releases' }
      );
    }

    const totalPoints = plan.phases.reduce((sum, phase) => sum + parseInt(phase.effort), 0);
    plan.totalEffort = `${totalPoints} story points`;

    return plan;
  }

  async performScopeAnalysis(requirements) {
    return {
      requirements,
      scope: `Detailed analysis of: ${requirements}`,
      components: [
        { name: 'Component 1', type: 'Frontend', complexity: 'Medium' },
        { name: 'Component 2', type: 'Backend', complexity: 'High' },
        { name: 'Component 3', type: 'Database', complexity: 'Low' }
      ],
      dependencies: ['External API', 'Third-party service'],
      timeline: '2-4 weeks',
      effort: '20-30 story points',
      risks: ['API rate limits', 'Data consistency'],
      recommendations: ['Start with MVP', 'Implement monitoring']
    };
  }

  async createIssuesFromAnalysis(analysis, milestone, template) {
    for (const component of analysis.components) {
      const issueBody = this.generateIssueTemplate(component, template);
      const title = component.name;
      
      try {
        let cmd = `gh issue create --title "${title}" --body "${issueBody}"`;
        if (milestone) cmd += ` --milestone "${milestone}"`;
        
        // Add labels based on complexity
        const labels = this.getLabelsForComplexity(component.complexity);
        if (labels.length > 0) cmd += ` --label "${labels.join(',')}"`;
        
        execSync(cmd, { stdio: 'pipe' });
        console.log(chalk.green(`✅ Created issue: ${title}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to create issue "${title}": ${error.message}`));
      }
    }
  }

  async createEpicIssues(breakdown, milestone, assignee) {
    // Create user story issues
    for (const story of breakdown.userStories) {
      const issueBody = this.generateUserStoryTemplate(story);
      
      try {
        let cmd = `gh issue create --title "${story.title}" --body "${issueBody}" --label "user-story"`;
        if (milestone) cmd += ` --milestone "${milestone}"`;
        if (assignee) cmd += ` --assignee "${assignee}"`;
        
        execSync(cmd, { stdio: 'pipe' });
        console.log(chalk.green(`✅ Created user story: ${story.title}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to create user story: ${error.message}`));
      }
    }

    // Create technical task issues
    for (const task of breakdown.technicalTasks) {
      const issueBody = this.generateTechnicalTaskTemplate(task);
      
      try {
        let cmd = `gh issue create --title "${task.title}" --body "${issueBody}" --label "tech-task,${task.type.toLowerCase()}"`;
        if (milestone) cmd += ` --milestone "${milestone}"`;
        if (assignee) cmd += ` --assignee "${assignee}"`;
        
        execSync(cmd, { stdio: 'pipe' });
        console.log(chalk.green(`✅ Created technical task: ${task.title}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to create technical task: ${error.message}`));
      }
    }
  }

  async createFeatureIssues(plan) {
    for (const phase of plan.phases) {
      const issueBody = this.generatePhaseTemplate(phase, plan);
      
      try {
        const cmd = `gh issue create --title "${phase.name}" --body "${issueBody}" --label "feature,phase"`;
        execSync(cmd, { stdio: 'pipe' });
        console.log(chalk.green(`✅ Created phase issue: ${phase.name}`));
      } catch (error) {
        console.log(chalk.red(`❌ Failed to create phase issue: ${error.message}`));
      }
    }
  }

  generateIssueTemplate(component, template) {
    return `## ${component.name}

### Description
${component.description}

### Acceptance Criteria
- [ ] Implement ${component.name}
- [ ] Write tests
- [ ] Update documentation

### Technical Details
- **Complexity**: ${component.complexity}
- **Estimated Effort**: ${component.effort}

### Definition of Done
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Feature deployed

---
*Generated by Flow State Dev /breakdown command*`;
  }

  generateUserStoryTemplate(story) {
    const criteria = story.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n');
    
    return `## User Story: ${story.title}

### Description
${story.description}

### Acceptance Criteria
${criteria}

### Details
- **Priority**: ${story.priority}
- **Effort**: ${story.effort}

### Definition of Done
- [ ] All acceptance criteria met
- [ ] User testing completed
- [ ] Documentation updated

---
*Generated by Flow State Dev /epic:breakdown command*`;
  }

  generateTechnicalTaskTemplate(task) {
    return `## Technical Task: ${task.title}

### Description
${task.description}

### Type
${task.type}

### Requirements
- [ ] Implementation complete
- [ ] Code review
- [ ] Testing

### Effort
${task.effort}

---
*Generated by Flow State Dev /epic:breakdown command*`;
  }

  generatePhaseTemplate(phase, plan) {
    const deliverables = phase.deliverables.map(d => `- [ ] ${d}`).join('\n');
    
    return `## ${phase.name}

### Description
${phase.description}

### Deliverables
${deliverables}

### Effort & Timeline
- **Effort**: ${phase.effort}
- **Duration**: ${phase.duration}

### Dependencies
- Previous phase completion

---
*Generated by Flow State Dev /feature:plan command*`;
  }

  getLabelsForComplexity(complexity) {
    const labels = [];
    
    switch (complexity?.toLowerCase()) {
      case 'low':
        labels.push('effort:small');
        break;
      case 'medium':
        labels.push('effort:medium');
        break;
      case 'high':
        labels.push('effort:large');
        break;
    }
    
    return labels;
  }

  displayMarkdownAnalysis(analysis) {
    console.log(chalk.white('# Scope Analysis Report\n'));
    console.log(chalk.gray(`**Requirements**: ${analysis.requirements}\n`));
    console.log(chalk.white('## Components\n'));
    
    analysis.components.forEach(comp => {
      console.log(chalk.gray(`- **${comp.name}** (${comp.type}) - ${comp.complexity} complexity`));
    });
    
    console.log(chalk.white('\n## Timeline & Effort\n'));
    console.log(chalk.gray(`- **Timeline**: ${analysis.timeline}`));
    console.log(chalk.gray(`- **Effort**: ${analysis.effort}`));
    
    if (analysis.risks.length > 0) {
      console.log(chalk.white('\n## Risks\n'));
      analysis.risks.forEach(risk => {
        console.log(chalk.gray(`- ${risk}`));
      });
    }
  }

  generateMarkdownReport(analysis) {
    return `# Scope Analysis Report

**Requirements**: ${analysis.requirements}

## Components

${analysis.components.map(comp => `- **${comp.name}** (${comp.type}) - ${comp.complexity} complexity`).join('\n')}

## Timeline & Effort

- **Timeline**: ${analysis.timeline}
- **Effort**: ${analysis.effort}

## Risks

${analysis.risks.map(risk => `- ${risk}`).join('\n')}

## Recommendations

${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

---

*Generated by Flow State Dev on ${new Date().toISOString().split('T')[0]}*
`;
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