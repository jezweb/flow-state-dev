/**
 * Breakdown command - Analyze scope and create GitHub issues for tracking
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class BreakdownCommand extends GitHubSlashCommand {
  constructor() {
    super('/breakdown', 'Analyze scope and create GitHub issues for tracking', {
      category: 'planning',
      usage: '/breakdown [scope] [options]',
      examples: [
        'fsd slash "/breakdown \'User authentication system\'"',
        'fsd slash "/breakdown \'E-commerce checkout flow\' --milestone Sprint-1"',
        'fsd slash "/breakdown \'API rate limiting\' --create-issues"',
        'fsd slash "/breakdown \'Mobile app redesign\' --template feature"'
      ],
      options: [
        { name: 'scope', type: 'string', description: 'Feature/project scope to analyze', required: true },
        { name: 'milestone', type: 'string', description: 'Milestone to assign issues to' },
        { name: 'create-issues', type: 'boolean', description: 'Actually create the GitHub issues' },
        { name: 'template', type: 'string', description: 'Issue template type (feature, bug, research)', default: 'feature' },
        { name: 'assignee', type: 'string', description: 'Default assignee for created issues' },
        { name: 'labels', type: 'string', description: 'Default labels to apply (comma-separated)' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const scope = args?.[0] || options.scope;
    
    if (!scope) {
      console.log(chalk.blue('🔍 Project Scope Breakdown\n'));
      console.log(chalk.gray('Analyze and break down project scope into actionable GitHub issues.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/breakdown \'Feature description\'"'));
      console.log(chalk.gray('\nExample scopes:'));
      console.log(chalk.gray('  • "User authentication system"'));
      console.log(chalk.gray('  • "E-commerce checkout flow"'));
      console.log(chalk.gray('  • "Real-time chat feature"'));
      console.log(chalk.gray('  • "API documentation portal"'));
      return;
    }

    console.log(chalk.blue('🔍 Scope Breakdown Analysis\n'));
    console.log(chalk.white(`Analyzing: ${scope}\n`));

    try {
      // Analyze the scope and break it down
      const analysis = await this.analyzeScopeBreakdown(scope, options);
      
      // Display the breakdown
      this.displayBreakdownAnalysis(analysis);
      
      // Create issues if requested
      if (options['create-issues']) {
        await this.createIssuesFromBreakdown(analysis, options);
      } else {
        const shouldCreate = await this.confirm(
          `Create ${analysis.tasks.length} GitHub issues from this breakdown?`,
          false
        );
        
        if (shouldCreate) {
          await this.createIssuesFromBreakdown(analysis, options);
        } else {
          console.log(chalk.gray('\n💡 To create issues later, run with --create-issues flag'));
        }
      }
      
    } catch (error) {
      this.log(`Failed to analyze scope breakdown: ${error.message}`, 'error');
    }
  }

  async analyzeScopeBreakdown(scope, options) {
    console.log(chalk.gray('Analyzing scope and identifying tasks...\n'));
    
    // Analyze the scope and break it down into components
    const complexity = this.assessComplexity(scope);
    const domains = this.identifyDomains(scope);
    const dependencies = this.identifyDependencies(scope);
    const tasks = this.breakdownIntoTasks(scope, complexity);
    const timeline = this.estimateTimeline(tasks);
    const risks = this.identifyRisks(scope, tasks);
    
    return {
      scope,
      complexity,
      domains,
      dependencies,
      tasks,
      timeline,
      risks,
      metadata: {
        totalTasks: tasks.length,
        estimatedEffort: tasks.reduce((sum, task) => sum + task.effort, 0),
        criticalPath: this.findCriticalPath(tasks)
      }
    };
  }

  assessComplexity(scope) {
    const indicators = {
      simple: ['button', 'form', 'page', 'style', 'text', 'display'],
      medium: ['authentication', 'validation', 'api', 'database', 'integration'],
      complex: ['real-time', 'machine learning', 'distributed', 'scalability', 'security', 'architecture'],
      epic: ['system', 'platform', 'infrastructure', 'migration', 'redesign', 'framework']
    };
    
    const lowerScope = scope.toLowerCase();
    
    for (const [level, words] of Object.entries(indicators)) {
      if (words.some(word => lowerScope.includes(word))) {
        return {
          level,
          score: { simple: 1, medium: 3, complex: 5, epic: 8 }[level],
          indicators: words.filter(word => lowerScope.includes(word))
        };
      }
    }
    
    return { level: 'medium', score: 3, indicators: [] };
  }

  identifyDomains(scope) {
    const domainKeywords = {
      'Frontend': ['ui', 'interface', 'component', 'page', 'form', 'display', 'view'],
      'Backend': ['api', 'server', 'database', 'service', 'endpoint', 'logic'],
      'Authentication': ['auth', 'login', 'user', 'permission', 'access', 'security'],
      'Database': ['database', 'model', 'schema', 'migration', 'data'],
      'Integration': ['integration', 'external', 'third-party', 'webhook', 'sync'],
      'Testing': ['test', 'testing', 'validation', 'qa', 'quality'],
      'Documentation': ['docs', 'documentation', 'guide', 'readme', 'manual'],
      'DevOps': ['deploy', 'deployment', 'infrastructure', 'ci/cd', 'pipeline']
    };
    
    const lowerScope = scope.toLowerCase();
    const identifiedDomains = [];
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => lowerScope.includes(keyword))) {
        identifiedDomains.push({
          name: domain,
          confidence: keywords.filter(keyword => lowerScope.includes(keyword)).length / keywords.length,
          matchedKeywords: keywords.filter(keyword => lowerScope.includes(keyword))
        });
      }
    }
    
    // Default to Frontend if no specific domain identified
    if (identifiedDomains.length === 0) {
      identifiedDomains.push({ name: 'General', confidence: 0.5, matchedKeywords: [] });
    }
    
    return identifiedDomains.sort((a, b) => b.confidence - a.confidence);
  }

  identifyDependencies(scope) {
    const dependencies = [];
    const lowerScope = scope.toLowerCase();
    
    // Common dependency patterns
    if (lowerScope.includes('auth') || lowerScope.includes('user')) {
      dependencies.push({ type: 'Authentication System', reason: 'User management required' });
    }
    if (lowerScope.includes('database') || lowerScope.includes('data')) {
      dependencies.push({ type: 'Database Schema', reason: 'Data persistence required' });
    }
    if (lowerScope.includes('api') || lowerScope.includes('integration')) {
      dependencies.push({ type: 'API Infrastructure', reason: 'External communication required' });
    }
    if (lowerScope.includes('real-time') || lowerScope.includes('websocket')) {
      dependencies.push({ type: 'WebSocket Infrastructure', reason: 'Real-time communication required' });
    }
    if (lowerScope.includes('payment') || lowerScope.includes('checkout')) {
      dependencies.push({ type: 'Payment Gateway', reason: 'Payment processing required' });
    }
    
    return dependencies;
  }

  breakdownIntoTasks(scope, complexity) {
    const tasks = [];
    const lowerScope = scope.toLowerCase();
    
    // Research and Planning Phase
    tasks.push({
      id: 1,
      title: `Research and analysis for ${scope}`,
      description: 'Investigate requirements, research solutions, and create technical specifications',
      category: 'Research',
      effort: Math.max(1, Math.ceil(complexity.score * 0.5)),
      priority: 'high',
      phase: 'planning',
      dependencies: []
    });

    // Design Phase
    if (lowerScope.includes('ui') || lowerScope.includes('interface') || lowerScope.includes('design')) {
      tasks.push({
        id: 2,
        title: `Design mockups and wireframes for ${scope}`,
        description: 'Create user interface designs, wireframes, and user experience flows',
        category: 'Design',
        effort: 2,
        priority: 'high',
        phase: 'design',
        dependencies: [1]
      });
    }

    // Backend Development
    if (lowerScope.includes('api') || lowerScope.includes('backend') || lowerScope.includes('server')) {
      tasks.push({
        id: tasks.length + 1,
        title: `Implement backend API for ${scope}`,
        description: 'Develop server-side logic, API endpoints, and data processing',
        category: 'Backend',
        effort: complexity.score,
        priority: 'high',
        phase: 'development',
        dependencies: [1]
      });
    }

    // Database Work
    if (lowerScope.includes('database') || lowerScope.includes('data') || lowerScope.includes('model')) {
      tasks.push({
        id: tasks.length + 1,
        title: `Database schema and migrations for ${scope}`,
        description: 'Design database schema, create migrations, and implement data models',
        category: 'Database',
        effort: Math.max(1, Math.ceil(complexity.score * 0.7)),
        priority: 'high',
        phase: 'development',
        dependencies: [1]
      });
    }

    // Frontend Development
    tasks.push({
      id: tasks.length + 1,
      title: `Implement frontend components for ${scope}`,
      description: 'Build user interface components, forms, and user interactions',
      category: 'Frontend',
      effort: complexity.score,
      priority: 'medium',
      phase: 'development',
      dependencies: tasks.filter(t => t.category === 'Design').map(t => t.id)
    });

    // Integration
    if (lowerScope.includes('integration') || lowerScope.includes('external')) {
      tasks.push({
        id: tasks.length + 1,
        title: `Third-party integrations for ${scope}`,
        description: 'Implement external service integrations and API connections',
        category: 'Integration',
        effort: Math.max(2, complexity.score),
        priority: 'medium',
        phase: 'development',
        dependencies: tasks.filter(t => t.category === 'Backend').map(t => t.id)
      });
    }

    // Testing
    tasks.push({
      id: tasks.length + 1,
      title: `Testing for ${scope}`,
      description: 'Write unit tests, integration tests, and end-to-end tests',
      category: 'Testing',
      effort: Math.max(1, Math.ceil(complexity.score * 0.6)),
      priority: 'medium',
      phase: 'testing',
      dependencies: tasks.filter(t => t.phase === 'development').map(t => t.id)
    });

    // Documentation
    tasks.push({
      id: tasks.length + 1,
      title: `Documentation for ${scope}`,
      description: 'Create user guides, API documentation, and technical documentation',
      category: 'Documentation',
      effort: 1,
      priority: 'low',
      phase: 'documentation',
      dependencies: tasks.filter(t => t.phase === 'development').map(t => t.id)
    });

    // Deployment
    tasks.push({
      id: tasks.length + 1,
      title: `Deployment and release for ${scope}`,
      description: 'Deploy to production, configure monitoring, and handle release',
      category: 'Deployment',
      effort: 1,
      priority: 'medium',
      phase: 'deployment',
      dependencies: tasks.filter(t => t.phase === 'testing').map(t => t.id)
    });

    return tasks;
  }

  estimateTimeline(tasks) {
    const phases = {
      planning: { tasks: [], effort: 0 },
      design: { tasks: [], effort: 0 },
      development: { tasks: [], effort: 0 },
      testing: { tasks: [], effort: 0 },
      documentation: { tasks: [], effort: 0 },
      deployment: { tasks: [], effort: 0 }
    };

    tasks.forEach(task => {
      phases[task.phase].tasks.push(task);
      phases[task.phase].effort += task.effort;
    });

    const totalEffort = tasks.reduce((sum, task) => sum + task.effort, 0);
    const estimatedDays = totalEffort * 1.5; // Assuming 1.5 days per effort point
    const estimatedWeeks = Math.ceil(estimatedDays / 5);

    return {
      totalEffort,
      estimatedDays,
      estimatedWeeks,
      phases: Object.entries(phases)
        .filter(([, phase]) => phase.tasks.length > 0)
        .map(([name, phase]) => ({
          name,
          tasks: phase.tasks.length,
          effort: phase.effort,
          estimatedDays: Math.ceil(phase.effort * 1.5)
        }))
    };
  }

  identifyRisks(scope, tasks) {
    const risks = [];
    const lowerScope = scope.toLowerCase();
    
    // Technical complexity risks
    if (lowerScope.includes('real-time') || lowerScope.includes('distributed')) {
      risks.push({
        type: 'Technical Complexity',
        level: 'high',
        description: 'Real-time features may require complex infrastructure',
        mitigation: 'Prototype early, consider existing solutions'
      });
    }

    // Integration risks
    if (lowerScope.includes('external') || lowerScope.includes('third-party')) {
      risks.push({
        type: 'External Dependencies',
        level: 'medium',
        description: 'Reliance on external services may cause delays',
        mitigation: 'Have fallback plans, test integrations early'
      });
    }

    // Security risks
    if (lowerScope.includes('auth') || lowerScope.includes('security') || lowerScope.includes('payment')) {
      risks.push({
        type: 'Security Requirements',
        level: 'high',
        description: 'Security-critical features require careful implementation',
        mitigation: 'Security review, penetration testing, compliance checks'
      });
    }

    // Scope creep risk
    if (tasks.length > 8) {
      risks.push({
        type: 'Scope Creep',
        level: 'medium',
        description: 'Large number of tasks may lead to expanding requirements',
        mitigation: 'Define clear boundaries, regular scope reviews'
      });
    }

    return risks;
  }

  findCriticalPath(tasks) {
    // Simple critical path - tasks with most dependencies
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    const calculateDepth = (taskId, visited = new Set()) => {
      if (visited.has(taskId)) return 0;
      visited.add(taskId);
      
      const task = taskMap.get(taskId);
      if (!task || task.dependencies.length === 0) return 1;
      
      const maxDepth = Math.max(...task.dependencies.map(depId => calculateDepth(depId, new Set(visited))));
      return maxDepth + 1;
    };

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      depth: calculateDepth(task.id)
    })).sort((a, b) => b.depth - a.depth);
  }

  displayBreakdownAnalysis(analysis) {
    const { scope, complexity, domains, tasks, timeline, risks, metadata } = analysis;
    
    // Scope Summary
    console.log(chalk.yellow('📊 Scope Analysis:'));
    console.log(`  Complexity: ${this.formatComplexity(complexity.level)} (${complexity.score}/8)`);
    console.log(`  Total tasks: ${chalk.cyan(metadata.totalTasks)}`);
    console.log(`  Estimated effort: ${chalk.cyan(metadata.estimatedEffort)} story points`);
    console.log(`  Timeline: ${chalk.cyan(timeline.estimatedWeeks)} weeks (${timeline.estimatedDays} days)`);

    // Domains
    console.log(chalk.yellow('\n🎯 Domain Analysis:'));
    domains.slice(0, 3).forEach(domain => {
      const confidence = Math.round(domain.confidence * 100);
      console.log(`  • ${domain.name}: ${chalk.cyan(confidence + '%')} confidence`);
    });

    // Dependencies
    if (analysis.dependencies.length > 0) {
      console.log(chalk.yellow('\n🔗 Dependencies:'));
      analysis.dependencies.forEach(dep => {
        console.log(`  • ${dep.type}: ${chalk.gray(dep.reason)}`);
      });
    }

    // Task Breakdown
    console.log(chalk.yellow('\n📋 Task Breakdown:'));
    
    const tasksByPhase = this.groupTasksByPhase(tasks);
    Object.entries(tasksByPhase).forEach(([phase, phaseTasks]) => {
      if (phaseTasks.length > 0) {
        console.log(`\n  ${this.formatPhase(phase)}:`);
        phaseTasks.forEach(task => {
          const priority = this.formatPriority(task.priority);
          console.log(`    ${priority} ${task.title} (${task.effort}pts)`);
        });
      }
    });

    // Timeline
    console.log(chalk.yellow('\n📅 Timeline by Phase:'));
    timeline.phases.forEach(phase => {
      console.log(`  • ${this.formatPhase(phase.name)}: ${chalk.cyan(phase.estimatedDays)} days (${phase.tasks} tasks)`);
    });

    // Critical Path
    if (metadata.criticalPath.length > 0) {
      console.log(chalk.yellow('\n🎯 Critical Path:'));
      metadata.criticalPath.slice(0, 3).forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.title} (depth: ${item.depth})`);
      });
    }

    // Risks
    if (risks.length > 0) {
      console.log(chalk.yellow('\n⚠️  Identified Risks:'));
      risks.forEach(risk => {
        const level = risk.level === 'high' ? chalk.red(risk.level) : 
                    risk.level === 'medium' ? chalk.yellow(risk.level) : 
                    chalk.gray(risk.level);
        console.log(`\n  ${level.toUpperCase()} - ${risk.type}`);
        console.log(`  Issue: ${risk.description}`);
        console.log(`  Mitigation: ${chalk.cyan(risk.mitigation)}`);
      });
    }
  }

  async createIssuesFromBreakdown(analysis, options) {
    console.log(chalk.blue('\n🚀 Creating GitHub Issues...\n'));
    
    const { tasks } = analysis;
    let created = 0;
    let failed = 0;

    for (const task of tasks) {
      try {
        const issueData = this.formatTaskAsIssue(task, analysis, options);
        await this.createGitHubIssue(issueData);
        
        console.log(chalk.green(`✅ Created: ${task.title}`));
        created++;
        
        // Brief pause to avoid rate limiting
        await this.sleep(500);
      } catch (error) {
        console.log(chalk.red(`❌ Failed: ${task.title} - ${error.message}`));
        failed++;
      }
    }

    console.log(chalk.green(`\n📊 Issue Creation Summary:`));
    console.log(`  Created: ${chalk.green(created)}`);
    console.log(`  Failed: ${chalk.red(failed)}`);
    console.log(`  Total: ${created + failed}`);
  }

  formatTaskAsIssue(task, analysis, options) {
    const labels = [
      task.category.toLowerCase(),
      task.priority,
      'breakdown'
    ];

    if (options.labels) {
      labels.push(...options.labels.split(',').map(l => l.trim()));
    }

    const body = this.generateIssueBody(task, analysis);

    return {
      title: task.title,
      body,
      labels: labels.filter(Boolean),
      milestone: options.milestone,
      assignees: options.assignee ? [options.assignee] : []
    };
  }

  generateIssueBody(task, analysis) {
    const dependencies = task.dependencies.length > 0 
      ? `\n\n## Dependencies\nThis task depends on:\n${task.dependencies.map(id => `- Task #${id}`).join('\n')}`
      : '';

    return `## Description
${task.description}

## Category
${task.category}

## Effort Estimate
${task.effort} story points

## Phase
${task.phase}

## Priority
${task.priority}${dependencies}

## Original Scope
${analysis.scope}

---
*Generated by Flow State Dev breakdown analysis*`;
  }

  async createGitHubIssue(issueData) {
    const command = [
      'gh issue create',
      `--title "${issueData.title}"`,
      `--body "${issueData.body}"`,
      issueData.labels.length > 0 ? `--label "${issueData.labels.join(',')}"` : '',
      issueData.milestone ? `--milestone "${issueData.milestone}"` : '',
      issueData.assignees.length > 0 ? `--assignee "${issueData.assignees.join(',')}"` : ''
    ].filter(Boolean).join(' ');

    await this.exec(command, { silent: true });
  }

  // Helper methods
  formatComplexity(level) {
    const colors = {
      simple: chalk.green,
      medium: chalk.yellow,
      complex: chalk.orange,
      epic: chalk.red
    };
    return colors[level] ? colors[level](level) : chalk.gray(level);
  }

  formatPhase(phase) {
    const phases = {
      planning: '🔍 Planning',
      design: '🎨 Design',
      development: '💻 Development',
      testing: '🧪 Testing',
      documentation: '📚 Documentation',
      deployment: '🚀 Deployment'
    };
    return phases[phase] || phase;
  }

  formatPriority(priority) {
    const priorities = {
      high: chalk.red('🔴'),
      medium: chalk.yellow('🟡'),
      low: chalk.green('🟢')
    };
    return priorities[priority] || chalk.gray('⚪');
  }

  groupTasksByPhase(tasks) {
    return tasks.reduce((groups, task) => {
      if (!groups[task.phase]) {
        groups[task.phase] = [];
      }
      groups[task.phase].push(task);
      return groups;
    }, {});
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}