/**
 * Issue Dependencies command - Map and analyze issue dependencies
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class IssueDependenciesCommand extends GitHubSlashCommand {
  constructor() {
    super('/issue:dependencies', 'Map and analyze issue dependencies', {
      aliases: ['/i:deps', '/i:dependencies'],
      category: 'issue',
      usage: '/issue:dependencies [issue] [options]',
      examples: [
        'fsd slash "/issue:dependencies 123"',
        'fsd slash "/issue:dependencies --format graph"',
        'fsd slash "/issue:dependencies --all"',
        'fsd slash "/issue:dependencies --milestone Sprint-1"'
      ],
      options: [
        { name: 'issue', type: 'string', description: 'Issue number to analyze' },
        { name: 'format', type: 'string', description: 'Output format: tree, graph, json', default: 'tree' },
        { name: 'all', type: 'boolean', description: 'Analyze all issues for dependencies' },
        { name: 'milestone', type: 'string', description: 'Analyze issues in specific milestone' },
        { name: 'depth', type: 'number', description: 'Maximum dependency depth to analyze', default: 3 },
        { name: 'include-closed', type: 'boolean', description: 'Include closed issues in analysis' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    
    console.log(chalk.blue('🔗 Issue Dependencies Analysis\n'));
    
    try {
      if (options.all) {
        await this.analyzeAllDependencies(options);
      } else if (options.milestone) {
        await this.analyzeMilestoneDependencies(options.milestone, options);
      } else {
        const issueNumber = args?.[0] || options.issue;
        if (!issueNumber) {
          await this.showInteractiveSelection(options);
        } else {
          await this.analyzeSingleIssue(issueNumber, options);
        }
      }
    } catch (error) {
      this.log(`Failed to analyze dependencies: ${error.message}`, 'error');
    }
  }

  async showInteractiveSelection(options) {
    const { analysisType } = await this.prompt([{
      type: 'list',
      name: 'analysisType',
      message: 'Select analysis type:',
      choices: [
        { name: 'Analyze specific issue', value: 'single' },
        { name: 'Analyze milestone dependencies', value: 'milestone' },
        { name: 'Analyze all open issues', value: 'all' },
        { name: 'Find blocking issues', value: 'blockers' }
      ]
    }]);

    switch (analysisType) {
      case 'single':
        const { issueNumber } = await this.prompt([{
          type: 'input',
          name: 'issueNumber',
          message: 'Issue number to analyze:',
          validate: input => /^\d+$/.test(input) || 'Please enter a valid issue number'
        }]);
        await this.analyzeSingleIssue(issueNumber, options);
        break;
        
      case 'milestone':
        const milestones = await this.getMilestones();
        if (milestones.length === 0) {
          console.log(chalk.yellow('No milestones found'));
          return;
        }
        
        const { selectedMilestone } = await this.prompt([{
          type: 'list',
          name: 'selectedMilestone',
          message: 'Select milestone:',
          choices: milestones.map(m => ({ name: m.title, value: m.title }))
        }]);
        await this.analyzeMilestoneDependencies(selectedMilestone, options);
        break;
        
      case 'all':
        await this.analyzeAllDependencies(options);
        break;
        
      case 'blockers':
        await this.findBlockingIssues(options);
        break;
    }
  }

  async analyzeSingleIssue(issueNumber, options) {
    console.log(chalk.white(`🎯 Analyzing Issue #${issueNumber}\n`));
    
    try {
      // Get issue details
      const issue = await this.getIssueDetails(issueNumber);
      if (!issue) {
        this.log(`Issue #${issueNumber} not found`, 'error');
        return;
      }

      // Show issue summary
      console.log(`${chalk.cyan('#' + issue.number)} ${chalk.white(issue.title)}`);
      console.log(`${chalk.gray('State:')} ${this.formatIssueState(issue.state)}`);
      console.log(`${chalk.gray('Author:')} ${issue.user.login}`);
      
      if (issue.assignees?.length > 0) {
        console.log(`${chalk.gray('Assignees:')} ${issue.assignees.map(a => a.login).join(', ')}`);
      }
      
      if (issue.milestone) {
        console.log(`${chalk.gray('Milestone:')} ${issue.milestone.title}`);
      }

      // Analyze dependencies
      const analysis = await this.analyzeDependencies(issue, options);
      
      // Display results based on format
      if (options.format === 'json') {
        console.log('\n' + JSON.stringify(analysis, null, 2));
      } else if (options.format === 'graph') {
        this.displayGraphFormat(analysis);
      } else {
        this.displayTreeFormat(analysis);
      }

      // Show summary
      this.showDependencySummary(analysis);

    } catch (error) {
      this.log(`Failed to analyze issue: ${error.message}`, 'error');
    }
  }

  async analyzeMilestoneDependencies(milestoneName, options) {
    console.log(chalk.white(`🎯 Analyzing Milestone: ${milestoneName}\n`));
    
    try {
      // Get issues in milestone
      const issues = await this.getMilestoneIssues(milestoneName, options['include-closed']);
      
      if (issues.length === 0) {
        console.log(chalk.yellow(`No issues found in milestone "${milestoneName}"`));
        return;
      }

      console.log(chalk.gray(`Found ${issues.length} issues in milestone\n`));

      // Analyze dependencies for each issue
      const dependencyMap = new Map();
      const blockers = [];

      for (const issue of issues) {
        const analysis = await this.analyzeDependencies(issue, options);
        dependencyMap.set(issue.number, analysis);
        
        if (analysis.isBlocked) {
          blockers.push(issue);
        }
      }

      // Show milestone dependency overview
      this.displayMilestoneOverview(issues, dependencyMap, blockers);

      // Show critical path if any blockers exist
      if (blockers.length > 0) {
        this.displayCriticalPath(blockers, dependencyMap);
      }

    } catch (error) {
      this.log(`Failed to analyze milestone dependencies: ${error.message}`, 'error');
    }
  }

  async analyzeAllDependencies(options) {
    console.log(chalk.white('🔍 Analyzing All Issue Dependencies\n'));
    
    try {
      // Get all open issues
      const issues = await this.getAllIssues(options['include-closed']);
      
      if (issues.length === 0) {
        console.log(chalk.yellow('No issues found'));
        return;
      }

      console.log(chalk.gray(`Analyzing ${issues.length} issues...\n`));

      // Find issues with dependencies
      const issuesWithDeps = [];
      const blockedIssues = [];

      for (const issue of issues) {
        const deps = this.extractDependencies(issue);
        if (deps.length > 0) {
          issuesWithDeps.push({ issue, dependencies: deps });
        }
        
        const blockers = await this.findBlockersForIssue(issue.number);
        if (blockers.length > 0) {
          blockedIssues.push({ issue, blockers });
        }
      }

      // Display overview
      console.log(chalk.yellow('📊 Dependency Overview:'));
      console.log(`  Total issues: ${chalk.cyan(issues.length)}`);
      console.log(`  Issues with dependencies: ${chalk.cyan(issuesWithDeps.length)}`);
      console.log(`  Currently blocked issues: ${chalk.red(blockedIssues.length)}`);

      // Show blocked issues
      if (blockedIssues.length > 0) {
        console.log(chalk.red('\n🚫 Blocked Issues:'));
        blockedIssues.forEach(({ issue, blockers }) => {
          console.log(`  ${chalk.red('🚨')} #${issue.number} ${issue.title}`);
          console.log(`     Blocked by: ${blockers.map(b => `#${b}`).join(', ')}`);
        });
      }

      // Show dependency chains
      if (issuesWithDeps.length > 0) {
        console.log(chalk.yellow('\n🔗 Dependency Chains:'));
        issuesWithDeps.slice(0, 10).forEach(({ issue, dependencies }) => {
          console.log(`  ${chalk.cyan('➡️')} #${issue.number} ${issue.title}`);
          console.log(`     Depends on: ${dependencies.join(', ')}`);
        });
        
        if (issuesWithDeps.length > 10) {
          console.log(chalk.gray(`     ... and ${issuesWithDeps.length - 10} more`));
        }
      }

    } catch (error) {
      this.log(`Failed to analyze all dependencies: ${error.message}`, 'error');
    }
  }

  async findBlockingIssues(options) {
    console.log(chalk.white('🚫 Finding Blocking Issues\n'));
    
    try {
      const issues = await this.getAllIssues(false); // Only open issues
      const blockers = [];

      for (const issue of issues) {
        const blockingCount = await this.countIssuesBlockedBy(issue.number);
        if (blockingCount > 0) {
          blockers.push({ issue, blockingCount });
        }
      }

      if (blockers.length === 0) {
        console.log(chalk.green('✅ No blocking issues found!'));
        return;
      }

      // Sort by number of issues blocked
      blockers.sort((a, b) => b.blockingCount - a.blockingCount);

      console.log(chalk.red(`🚨 Found ${blockers.length} blocking issues:\n`));

      blockers.forEach(({ issue, blockingCount }) => {
        console.log(`${chalk.red('🚫')} #${issue.number} ${issue.title}`);
        console.log(`   ${chalk.gray('Blocking:')} ${chalk.yellow(blockingCount)} issue(s)`);
        console.log(`   ${chalk.gray('State:')} ${this.formatIssueState(issue.state)}`);
        
        if (issue.assignees?.length > 0) {
          console.log(`   ${chalk.gray('Assignee:')} ${issue.assignees[0].login}`);
        } else {
          console.log(`   ${chalk.yellow('⚠️  Unassigned')}`);
        }
        console.log('');
      });

      console.log(chalk.gray('💡 Recommendations:'));
      console.log(chalk.gray('  • Prioritize resolving blocking issues'));
      console.log(chalk.gray('  • Assign blockers to team members'));
      console.log(chalk.gray('  • Break down large blocking issues'));

    } catch (error) {
      this.log(`Failed to find blocking issues: ${error.message}`, 'error');
    }
  }

  async analyzeDependencies(issue, options) {
    const dependencies = this.extractDependencies(issue);
    const blockers = await this.findBlockersForIssue(issue.number);
    
    // Get dependency details
    const dependencyDetails = [];
    for (const depNumber of dependencies) {
      const depIssue = await this.getIssueDetails(depNumber);
      if (depIssue) {
        dependencyDetails.push(depIssue);
      }
    }

    return {
      issue,
      dependencies: dependencyDetails,
      dependencyNumbers: dependencies,
      blockers,
      isBlocked: blockers.length > 0,
      dependencyChain: await this.buildDependencyChain(issue.number, options.depth || 3)
    };
  }

  extractDependencies(issue) {
    const dependencies = [];
    const text = `${issue.title} ${issue.body || ''}`;
    
    // Common dependency patterns
    const patterns = [
      /depends on #(\d+)/gi,
      /blocked by #(\d+)/gi,
      /requires #(\d+)/gi,
      /needs #(\d+)/gi,
      /waiting for #(\d+)/gi,
      /dependency: #(\d+)/gi,
      /prerequisite: #(\d+)/gi
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const issueNumber = parseInt(match[1]);
        if (!dependencies.includes(issueNumber)) {
          dependencies.push(issueNumber);
        }
      }
    }

    return dependencies;
  }

  async findBlockersForIssue(issueNumber) {
    try {
      const dependencies = await this.getIssueDependencies(issueNumber);
      const blockers = [];

      for (const depNumber of dependencies) {
        const depIssue = await this.getIssueDetails(depNumber);
        if (depIssue && depIssue.state === 'open') {
          blockers.push(depNumber);
        }
      }

      return blockers;
    } catch (error) {
      return [];
    }
  }

  async buildDependencyChain(issueNumber, maxDepth) {
    const chain = [];
    const visited = new Set();
    
    const buildChain = async (currentIssue, depth) => {
      if (depth >= maxDepth || visited.has(currentIssue)) {
        return;
      }
      
      visited.add(currentIssue);
      const dependencies = await this.getIssueDependencies(currentIssue);
      
      if (dependencies.length > 0) {
        chain.push({ issue: currentIssue, dependencies, depth });
        
        for (const dep of dependencies) {
          await buildChain(dep, depth + 1);
        }
      }
    };

    await buildChain(issueNumber, 0);
    return chain;
  }

  displayTreeFormat(analysis) {
    console.log(chalk.yellow('\n🌳 Dependency Tree:'));

    if (analysis.dependencies.length === 0) {
      console.log(chalk.green('  ✅ No dependencies found'));
      return;
    }

    analysis.dependencies.forEach((dep, index) => {
      const isLast = index === analysis.dependencies.length - 1;
      const prefix = isLast ? '└──' : '├──';
      const status = this.formatIssueState(dep.state);
      
      console.log(`  ${prefix} ${status} #${dep.number} ${dep.title}`);
      
      if (dep.assignees?.length > 0) {
        console.log(`  ${isLast ? '   ' : '│  '} ${chalk.gray('Assignee:')} ${dep.assignees[0].login}`);
      }
    });
  }

  displayGraphFormat(analysis) {
    console.log(chalk.yellow('\n📊 Dependency Graph:'));
    
    console.log(`\n  Issue #${analysis.issue.number}: ${analysis.issue.title}`);
    
    if (analysis.dependencies.length === 0) {
      console.log(chalk.green('    └── ✅ No dependencies'));
      return;
    }

    console.log('    │');
    analysis.dependencies.forEach((dep, index) => {
      const isLast = index === analysis.dependencies.length - 1;
      const connector = isLast ? '└──' : '├──';
      const status = this.formatIssueState(dep.state);
      
      console.log(`    ${connector} ${status} #${dep.number} ${dep.title}`);
    });
  }

  displayMilestoneOverview(issues, dependencyMap, blockers) {
    console.log(chalk.yellow('📊 Milestone Dependency Overview:\n'));
    
    const totalDeps = Array.from(dependencyMap.values())
      .reduce((sum, analysis) => sum + analysis.dependencies.length, 0);
    
    console.log(`  Total issues: ${chalk.cyan(issues.length)}`);
    console.log(`  Issues with dependencies: ${chalk.cyan(totalDeps)}`);
    console.log(`  Blocked issues: ${chalk.red(blockers.length)}`);

    if (blockers.length > 0) {
      console.log(chalk.red('\n🚫 Blocked Issues in Milestone:'));
      blockers.forEach(issue => {
        const analysis = dependencyMap.get(issue.number);
        console.log(`  🚨 #${issue.number} ${issue.title}`);
        console.log(`     Blocked by: ${analysis.blockers.map(b => `#${b}`).join(', ')}`);
      });
    }
  }

  displayCriticalPath(blockers, dependencyMap) {
    console.log(chalk.red('\n🎯 Critical Path (Blocking Issues):'));
    
    blockers.forEach(issue => {
      const analysis = dependencyMap.get(issue.number);
      console.log(`\n  Priority: ${chalk.red('HIGH')} - #${issue.number} ${issue.title}`);
      console.log(`  Dependencies: ${analysis.dependencies.length}`);
      console.log(`  Blockers: ${analysis.blockers.length}`);
      
      if (issue.assignees?.length > 0) {
        console.log(`  Assignee: ${issue.assignees[0].login}`);
      } else {
        console.log(`  ${chalk.yellow('⚠️  Unassigned - needs immediate attention!')}`);
      }
    });
  }

  showDependencySummary(analysis) {
    console.log(chalk.yellow('\n📋 Summary:'));
    
    if (analysis.isBlocked) {
      console.log(`  Status: ${chalk.red('🚫 BLOCKED')}`);
      console.log(`  Blocking issues: ${analysis.blockers.map(b => `#${b}`).join(', ')}`);
    } else if (analysis.dependencies.length > 0) {
      const openDeps = analysis.dependencies.filter(d => d.state === 'open').length;
      if (openDeps > 0) {
        console.log(`  Status: ${chalk.yellow('⏳ HAS DEPENDENCIES')}`);
        console.log(`  Open dependencies: ${openDeps}/${analysis.dependencies.length}`);
      } else {
        console.log(`  Status: ${chalk.green('✅ READY')}`);
        console.log(`  All dependencies completed`);
      }
    } else {
      console.log(`  Status: ${chalk.green('✅ NO DEPENDENCIES')}`);
    }

    console.log(`  Total dependencies: ${analysis.dependencies.length}`);
    
    if (analysis.dependencyChain.length > 0) {
      console.log(`  Dependency chain depth: ${Math.max(...analysis.dependencyChain.map(c => c.depth)) + 1}`);
    }
  }

  async getIssueDetails(issueNumber) {
    try {
      const result = await this.exec(`gh issue view ${issueNumber} --json number,title,state,body,user,assignees,milestone`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return null;
    }
  }

  async getIssueDependencies(issueNumber) {
    const issue = await this.getIssueDetails(issueNumber);
    if (!issue) return [];
    
    return this.extractDependencies(issue);
  }

  async getMilestoneIssues(milestoneName, includeClosed = false) {
    try {
      const state = includeClosed ? 'all' : 'open';
      const result = await this.exec(`gh issue list --milestone "${milestoneName}" --state ${state} --json number,title,state,body,user,assignees`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async getAllIssues(includeClosed = false) {
    try {
      const state = includeClosed ? 'all' : 'open';
      const result = await this.exec(`gh issue list --state ${state} --limit 100 --json number,title,state,body,user,assignees`, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async getMilestones() {
    try {
      const result = await this.exec('gh api repos/{owner}/{repo}/milestones --jq \'.[] | {title: .title, state: .state}\'', { silent: true });
      return result.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  async countIssuesBlockedBy(issueNumber) {
    try {
      // Search for issues that mention this issue as a dependency
      const searchPatterns = [
        `depends on #${issueNumber}`,
        `blocked by #${issueNumber}`,
        `requires #${issueNumber}`,
        `waiting for #${issueNumber}`
      ];
      
      let count = 0;
      for (const pattern of searchPatterns) {
        try {
          const result = await this.exec(`gh issue list --search "${pattern}" --json number`, { silent: true });
          const issues = JSON.parse(result);
          count += issues.length;
        } catch (error) {
          // Continue with other patterns
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  formatIssueState(state) {
    switch (state) {
      case 'open':
        return chalk.yellow('⏳ Open');
      case 'closed':
        return chalk.green('✅ Closed');
      default:
        return chalk.gray(`❓ ${state}`);
    }
  }
}