/**
 * Epic Breakdown command - Break large epics into manageable sub-issues
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class EpicBreakdownCommand extends GitHubSlashCommand {
  constructor() {
    super('/epic:breakdown', 'Break large epics into manageable sub-issues', {
      aliases: ['/epic:break', '/epic:split'],
      category: 'planning',
      usage: '/epic:breakdown [epic] [options]',
      examples: [
        'fsd slash "/epic:breakdown \'User Management System\'"',
        'fsd slash "/epic:breakdown \'E-commerce Platform\' --milestone Sprint-1"',
        'fsd slash "/epic:breakdown 123 --create-issues"',
        'fsd slash "/epic:breakdown \'Mobile App\' --assignee john-doe"'
      ],
      options: [
        { name: 'epic', type: 'string', description: 'Epic title, description, or issue number', required: true },
        { name: 'milestone', type: 'string', description: 'Target milestone for sub-issues' },
        { name: 'create-issues', type: 'boolean', description: 'Create the GitHub issues' },
        { name: 'assignee', type: 'string', description: 'Default assignee for created issues' },
        { name: 'labels', type: 'string', description: 'Additional labels to apply (comma-separated)' },
        { name: 'max-story-points', type: 'number', description: 'Maximum story points per sub-issue', default: 8 }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const epic = args?.[0] || options.epic;
    
    if (!epic) {
      console.log(chalk.blue('📝 Epic Breakdown\n'));
      console.log(chalk.gray('Break down large epics into manageable, actionable sub-issues.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/epic:breakdown \'Epic title or description\'"'));
      console.log(chalk.gray('  fsd slash "/epic:breakdown 123"  # Use existing issue'));
      console.log(chalk.gray('\nExample epics:'));
      console.log(chalk.gray('  • "User Management System"'));
      console.log(chalk.gray('  • "E-commerce Checkout Flow"'));
      console.log(chalk.gray('  • "Real-time Messaging Platform"'));
      console.log(chalk.gray('  • "Content Management System"'));
      return;
    }

    console.log(chalk.blue('📝 Epic Breakdown Analysis\n'));

    try {
      // Check if epic is an issue number
      const epicData = await this.getEpicData(epic);
      
      console.log(chalk.white(`Epic: ${epicData.title}\n`));
      
      // Analyze and break down the epic
      const breakdown = await this.analyzeEpicBreakdown(epicData, options);
      
      // Display the breakdown
      this.displayEpicBreakdown(breakdown);
      
      // Create issues if requested
      if (options['create-issues']) {
        await this.createSubIssues(breakdown, options);
      } else {
        const shouldCreate = await this.confirm(
          `Create ${breakdown.subIssues.length} sub-issues from this epic breakdown?`,
          false
        );
        
        if (shouldCreate) {
          await this.createSubIssues(breakdown, options);
        } else {
          console.log(chalk.gray('\n💡 To create issues later, run with --create-issues flag'));
        }
      }
      
    } catch (error) {
      this.log(`Failed to analyze epic breakdown: ${error.message}`, 'error');
    }
  }

  async getEpicData(epic) {
    // Check if it's an issue number
    if (/^\d+$/.test(epic)) {
      try {
        const issueData = await this.exec(`gh issue view ${epic} --json title,body,labels`, { silent: true });
        const issue = JSON.parse(issueData);
        return {
          number: parseInt(epic),
          title: issue.title,
          description: issue.body || '',
          isExistingIssue: true,
          labels: issue.labels?.map(l => l.name) || []
        };
      } catch (error) {
        throw new Error(`Issue #${epic} not found`);
      }
    } else {
      // Treat as epic title/description
      return {
        title: epic,
        description: epic,
        isExistingIssue: false,
        labels: []
      };
    }
  }

  async analyzeEpicBreakdown(epicData, options) {
    console.log(chalk.gray('Analyzing epic and creating breakdown...\n'));
    
    const scope = this.analyzeEpicScope(epicData);
    const features = this.identifyFeatures(epicData);
    const userStories = this.generateUserStories(features, epicData);
    const technicalTasks = this.identifyTechnicalTasks(epicData, features);
    const subIssues = this.createSubIssues(userStories, technicalTasks, options);
    const dependencies = this.identifyDependencies(subIssues);
    const timeline = this.estimateEpicTimeline(subIssues);
    const risks = this.identifyEpicRisks(epicData, subIssues);
    
    return {
      epic: epicData,
      scope,
      features,
      userStories,
      technicalTasks,
      subIssues,
      dependencies,
      timeline,
      risks,
      metadata: {
        totalSubIssues: subIssues.length,
        totalStoryPoints: subIssues.reduce((sum, issue) => sum + issue.storyPoints, 0),
        averageStoryPoints: subIssues.length > 0 ? (subIssues.reduce((sum, issue) => sum + issue.storyPoints, 0) / subIssues.length).toFixed(1) : 0
      }
    };
  }

  analyzeEpicScope(epicData) {
    const text = `${epicData.title} ${epicData.description}`.toLowerCase();
    
    const scopeIndicators = {
      userFacing: ['user', 'interface', 'ui', 'frontend', 'form', 'page', 'dashboard'],
      backend: ['api', 'server', 'database', 'service', 'endpoint', 'logic'],
      infrastructure: ['deploy', 'infrastructure', 'cloud', 'server', 'scaling', 'performance'],
      integration: ['integration', 'external', 'third-party', 'webhook', 'sync'],
      security: ['auth', 'security', 'permission', 'access', 'encryption'],
      analytics: ['analytics', 'tracking', 'metrics', 'reporting', 'dashboard']
    };

    const identifiedScopes = [];
    for (const [scope, indicators] of Object.entries(scopeIndicators)) {
      const matches = indicators.filter(indicator => text.includes(indicator));
      if (matches.length > 0) {
        identifiedScopes.push({
          name: scope,
          confidence: matches.length / indicators.length,
          indicators: matches
        });
      }
    }

    return identifiedScopes.sort((a, b) => b.confidence - a.confidence);
  }

  identifyFeatures(epicData) {
    const text = `${epicData.title} ${epicData.description}`;
    const features = [];

    // Common feature patterns
    const featurePatterns = {
      authentication: ['login', 'register', 'auth', 'sign up', 'sign in', 'password'],
      userManagement: ['user', 'profile', 'account', 'member', 'role'],
      contentManagement: ['content', 'post', 'article', 'page', 'cms'],
      ecommerce: ['product', 'cart', 'checkout', 'payment', 'order'],
      messaging: ['message', 'chat', 'notification', 'email', 'sms'],
      analytics: ['analytics', 'report', 'dashboard', 'metrics', 'tracking'],
      search: ['search', 'filter', 'sort', 'find', 'query'],
      social: ['like', 'share', 'comment', 'follow', 'friend'],
      fileManagement: ['upload', 'download', 'file', 'document', 'media'],
      api: ['api', 'endpoint', 'integration', 'webhook', 'rest']
    };

    const lowerText = text.toLowerCase();
    
    for (const [featureName, keywords] of Object.entries(featurePatterns)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        features.push({
          name: featureName,
          keywords: keywords.filter(keyword => lowerText.includes(keyword)),
          priority: this.assessFeaturePriority(featureName, lowerText)
        });
      }
    }

    // If no specific features identified, create generic ones
    if (features.length === 0) {
      features.push(
        { name: 'core', keywords: [], priority: 'high' },
        { name: 'ui', keywords: [], priority: 'medium' },
        { name: 'testing', keywords: [], priority: 'low' }
      );
    }

    return features.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  assessFeaturePriority(featureName, text) {
    const highPriorityFeatures = ['authentication', 'userManagement', 'api'];
    const lowPriorityFeatures = ['analytics', 'social'];
    
    if (highPriorityFeatures.includes(featureName)) return 'high';
    if (lowPriorityFeatures.includes(featureName)) return 'low';
    return 'medium';
  }

  generateUserStories(features, epicData) {
    const userStories = [];
    
    const storyTemplates = {
      authentication: [
        'As a user, I want to register for an account so that I can access the platform',
        'As a user, I want to log in securely so that I can access my account',
        'As a user, I want to reset my password so that I can regain access if forgotten',
        'As a user, I want to log out so that my account remains secure'
      ],
      userManagement: [
        'As a user, I want to view my profile so that I can see my information',
        'As a user, I want to edit my profile so that I can keep my information current',
        'As an admin, I want to manage user accounts so that I can maintain the platform'
      ],
      ecommerce: [
        'As a customer, I want to browse products so that I can find what I need',
        'As a customer, I want to add items to cart so that I can purchase multiple items',
        'As a customer, I want to checkout securely so that I can complete my purchase',
        'As a customer, I want to view order history so that I can track my purchases'
      ],
      contentManagement: [
        'As an author, I want to create content so that I can share information',
        'As an author, I want to edit content so that I can keep it updated',
        'As a reader, I want to view content so that I can consume information'
      ],
      messaging: [
        'As a user, I want to send messages so that I can communicate with others',
        'As a user, I want to receive notifications so that I know about new messages',
        'As a user, I want to view message history so that I can reference past conversations'
      ],
      api: [
        'As a developer, I want to access API endpoints so that I can integrate with the system',
        'As a system, I want to authenticate API requests so that access is controlled',
        'As a developer, I want to view API documentation so that I can understand how to use it'
      ]
    };

    features.forEach(feature => {
      const templates = storyTemplates[feature.name] || [
        `As a user, I want to use ${feature.name} so that I can accomplish my goals`
      ];
      
      templates.forEach((template, index) => {
        userStories.push({
          id: userStories.length + 1,
          feature: feature.name,
          story: template,
          priority: feature.priority,
          storyPoints: this.estimateStoryPoints(template, feature),
          acceptanceCriteria: this.generateAcceptanceCriteria(template, feature)
        });
      });
    });

    return userStories;
  }

  identifyTechnicalTasks(epicData, features) {
    const tasks = [];
    const text = `${epicData.title} ${epicData.description}`.toLowerCase();

    // Core technical tasks
    tasks.push({
      id: tasks.length + 1,
      title: 'Project setup and configuration',
      category: 'Infrastructure',
      priority: 'high',
      storyPoints: 2,
      description: 'Set up project structure, dependencies, and development environment'
    });

    // Database tasks
    if (text.includes('data') || text.includes('user') || text.includes('content')) {
      tasks.push({
        id: tasks.length + 1,
        title: 'Database schema design and migration',
        category: 'Database',
        priority: 'high',
        storyPoints: 3,
        description: 'Design database schema and create migration scripts'
      });
    }

    // API tasks
    if (features.some(f => ['api', 'backend'].includes(f.name)) || text.includes('api')) {
      tasks.push({
        id: tasks.length + 1,
        title: 'API architecture and core endpoints',
        category: 'Backend',
        priority: 'high',
        storyPoints: 5,
        description: 'Design API structure and implement core endpoints'
      });
    }

    // Authentication infrastructure
    if (features.some(f => f.name === 'authentication')) {
      tasks.push({
        id: tasks.length + 1,
        title: 'Authentication infrastructure setup',
        category: 'Security',
        priority: 'high',
        storyPoints: 4,
        description: 'Set up authentication system, JWT tokens, and security middleware'
      });
    }

    // Testing infrastructure
    tasks.push({
      id: tasks.length + 1,
      title: 'Testing framework setup',
      category: 'Testing',
      priority: 'medium',
      storyPoints: 2,
      description: 'Set up unit and integration testing frameworks'
    });

    // Deployment
    tasks.push({
      id: tasks.length + 1,
      title: 'Deployment pipeline and CI/CD',
      category: 'DevOps',
      priority: 'medium',
      storyPoints: 3,
      description: 'Set up deployment pipeline and continuous integration'
    });

    // Documentation
    tasks.push({
      id: tasks.length + 1,
      title: 'Technical documentation',
      category: 'Documentation',
      priority: 'low',
      storyPoints: 2,
      description: 'Create technical documentation and API docs'
    });

    return tasks;
  }

  createSubIssues(userStories, technicalTasks, options) {
    const maxPoints = options['max-story-points'] || 8;
    const subIssues = [];

    // Add user stories as sub-issues
    userStories.forEach(story => {
      subIssues.push({
        id: subIssues.length + 1,
        title: this.extractTitleFromUserStory(story.story),
        type: 'user-story',
        description: story.story,
        category: 'Feature',
        priority: story.priority,
        storyPoints: Math.min(story.storyPoints, maxPoints),
        acceptanceCriteria: story.acceptanceCriteria,
        labels: ['user-story', story.feature],
        originalStory: story
      });
    });

    // Add technical tasks as sub-issues
    technicalTasks.forEach(task => {
      subIssues.push({
        id: subIssues.length + 1,
        title: task.title,
        type: 'technical-task',
        description: task.description,
        category: task.category,
        priority: task.priority,
        storyPoints: Math.min(task.storyPoints, maxPoints),
        labels: ['technical-task', task.category.toLowerCase()],
        originalTask: task
      });
    });

    // Split large issues if they exceed max story points
    return this.splitLargeIssues(subIssues, maxPoints);
  }

  extractTitleFromUserStory(story) {
    // Extract action from user story
    const match = story.match(/I want to (.+?) so that/);
    if (match) {
      return this.capitalizeFirst(match[1]);
    }
    return story.substring(0, 80) + (story.length > 80 ? '...' : '');
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  estimateStoryPoints(story, feature) {
    const complexityKeywords = {
      simple: ['view', 'display', 'show', 'list'],
      medium: ['create', 'edit', 'update', 'delete', 'manage'],
      complex: ['integrate', 'sync', 'calculate', 'process'],
      epic: ['system', 'platform', 'infrastructure']
    };

    const storyLower = story.toLowerCase();
    
    for (const [level, keywords] of Object.entries(complexityKeywords)) {
      if (keywords.some(keyword => storyLower.includes(keyword))) {
        const points = { simple: 1, medium: 3, complex: 5, epic: 8 }[level];
        return Math.min(points, 8);
      }
    }
    
    return 3; // Default medium complexity
  }

  generateAcceptanceCriteria(story, feature) {
    const criteria = [];
    
    if (story.includes('register')) {
      criteria.push(
        'User can enter valid email and password',
        'System validates email format and password strength',
        'User receives confirmation email',
        'Account is created successfully'
      );
    } else if (story.includes('login')) {
      criteria.push(
        'User can enter credentials',
        'System authenticates user',
        'User is redirected to dashboard on success',
        'Error message shown for invalid credentials'
      );
    } else if (story.includes('create')) {
      criteria.push(
        'User can access creation form',
        'All required fields are validated',
        'Data is saved successfully',
        'User receives confirmation'
      );
    } else {
      criteria.push(
        'Feature works as expected',
        'Error handling is implemented',
        'User feedback is provided'
      );
    }
    
    return criteria;
  }

  splitLargeIssues(subIssues, maxPoints) {
    const splitIssues = [];
    
    subIssues.forEach(issue => {
      if (issue.storyPoints <= maxPoints) {
        splitIssues.push(issue);
      } else {
        // Split large issue into smaller parts
        const parts = Math.ceil(issue.storyPoints / maxPoints);
        const pointsPerPart = Math.ceil(issue.storyPoints / parts);
        
        for (let i = 0; i < parts; i++) {
          splitIssues.push({
            ...issue,
            id: splitIssues.length + 1,
            title: `${issue.title} - Part ${i + 1}`,
            storyPoints: Math.min(pointsPerPart, maxPoints),
            description: `${issue.description}\n\n**Part ${i + 1} of ${parts}**`,
            labels: [...issue.labels, 'split-issue']
          });
        }
      }
    });
    
    return splitIssues;
  }

  identifyDependencies(subIssues) {
    const dependencies = [];
    
    // Infrastructure dependencies
    const infraIssues = subIssues.filter(issue => 
      issue.category === 'Infrastructure' || 
      issue.title.toLowerCase().includes('setup')
    );
    
    const featureIssues = subIssues.filter(issue => 
      issue.type === 'user-story' || 
      issue.category === 'Feature'
    );
    
    // Feature issues depend on infrastructure
    featureIssues.forEach(feature => {
      infraIssues.forEach(infra => {
        dependencies.push({
          dependent: feature.id,
          dependency: infra.id,
          type: 'blocks',
          reason: 'Infrastructure must be set up before feature development'
        });
      });
    });

    return dependencies;
  }

  estimateEpicTimeline(subIssues) {
    const totalStoryPoints = subIssues.reduce((sum, issue) => sum + issue.storyPoints, 0);
    const averageVelocity = 20; // Assume 20 story points per sprint
    const estimatedSprints = Math.ceil(totalStoryPoints / averageVelocity);
    
    const phases = {
      setup: subIssues.filter(i => i.category === 'Infrastructure' || i.title.includes('setup')),
      core: subIssues.filter(i => i.priority === 'high' && i.type === 'user-story'),
      features: subIssues.filter(i => i.priority === 'medium' && i.type === 'user-story'),
      polish: subIssues.filter(i => i.priority === 'low' || i.category === 'Documentation')
    };

    return {
      totalStoryPoints,
      estimatedSprints,
      estimatedWeeks: estimatedSprints * 2, // Assume 2-week sprints
      phases: Object.entries(phases)
        .filter(([, issues]) => issues.length > 0)
        .map(([name, issues]) => ({
          name,
          issues: issues.length,
          storyPoints: issues.reduce((sum, issue) => sum + issue.storyPoints, 0)
        }))
    };
  }

  identifyEpicRisks(epicData, subIssues) {
    const risks = [];
    const totalPoints = subIssues.reduce((sum, issue) => sum + issue.storyPoints, 0);
    
    // Large epic risk
    if (totalPoints > 40) {
      risks.push({
        type: 'Epic Size',
        level: 'high',
        description: 'Epic is very large and may be difficult to manage',
        mitigation: 'Consider breaking into smaller epics or phases'
      });
    }

    // Complex features risk
    const complexIssues = subIssues.filter(issue => issue.storyPoints >= 5);
    if (complexIssues.length > 3) {
      risks.push({
        type: 'Complexity',
        level: 'medium',
        description: 'Multiple complex features may cause delays',
        mitigation: 'Prototype complex features early, consider spikes'
      });
    }

    // Dependency risk
    const highDependency = subIssues.some(issue => 
      issue.category === 'Infrastructure' || 
      issue.labels?.includes('technical-task')
    );
    if (highDependency) {
      risks.push({
        type: 'Dependencies',
        level: 'medium',
        description: 'Infrastructure dependencies may block feature work',
        mitigation: 'Prioritize infrastructure tasks, parallel development where possible'
      });
    }

    return risks;
  }

  displayEpicBreakdown(breakdown) {
    const { epic, scope, subIssues, timeline, risks, metadata } = breakdown;
    
    // Epic Summary
    console.log(chalk.yellow('📊 Epic Summary:'));
    console.log(`  Sub-issues: ${chalk.cyan(metadata.totalSubIssues)}`);
    console.log(`  Total story points: ${chalk.cyan(metadata.totalStoryPoints)}`);
    console.log(`  Average per issue: ${chalk.cyan(metadata.averageStoryPoints)} points`);
    console.log(`  Estimated timeline: ${chalk.cyan(timeline.estimatedSprints)} sprints (${timeline.estimatedWeeks} weeks)`);

    // Scope Analysis
    if (scope.length > 0) {
      console.log(chalk.yellow('\n🎯 Identified Scope:'));
      scope.slice(0, 3).forEach(s => {
        const confidence = Math.round(s.confidence * 100);
        console.log(`  • ${s.name}: ${chalk.cyan(confidence + '%')} confidence`);
      });
    }

    // Sub-issues by category
    console.log(chalk.yellow('\n📋 Sub-Issues Breakdown:'));
    
    const issuesByCategory = this.groupIssuesByCategory(subIssues);
    Object.entries(issuesByCategory).forEach(([category, issues]) => {
      const totalPoints = issues.reduce((sum, issue) => sum + issue.storyPoints, 0);
      console.log(`\n  ${this.formatCategory(category)} (${issues.length} issues, ${totalPoints} pts):`);
      
      issues.slice(0, 5).forEach(issue => {
        const priority = this.formatPriority(issue.priority);
        console.log(`    ${priority} ${issue.title} (${issue.storyPoints}pts)`);
      });
      
      if (issues.length > 5) {
        console.log(chalk.gray(`    ... and ${issues.length - 5} more`));
      }
    });

    // Timeline by phase
    console.log(chalk.yellow('\n📅 Timeline by Phase:'));
    timeline.phases.forEach(phase => {
      console.log(`  • ${this.capitalizeFirst(phase.name)}: ${chalk.cyan(phase.storyPoints)} pts (${phase.issues} issues)`);
    });

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

  async createSubIssues(breakdown, options) {
    console.log(chalk.blue('\n🚀 Creating Sub-Issues...\n'));
    
    const { subIssues, epic } = breakdown;
    let created = 0;
    let failed = 0;

    for (const subIssue of subIssues) {
      try {
        const issueData = this.formatSubIssueAsGitHubIssue(subIssue, epic, options);
        await this.createGitHubIssue(issueData);
        
        console.log(chalk.green(`✅ Created: ${subIssue.title}`));
        created++;
        
        // Brief pause to avoid rate limiting
        await this.sleep(500);
      } catch (error) {
        console.log(chalk.red(`❌ Failed: ${subIssue.title} - ${error.message}`));
        failed++;
      }
    }

    console.log(chalk.green(`\n📊 Sub-Issue Creation Summary:`));
    console.log(`  Created: ${chalk.green(created)}`);
    console.log(`  Failed: ${chalk.red(failed)}`);
    console.log(`  Total: ${created + failed}`);

    // Update epic issue if it exists
    if (epic.isExistingIssue) {
      try {
        await this.updateEpicIssue(epic, breakdown, created);
        console.log(chalk.green(`✅ Updated epic issue #${epic.number} with breakdown`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not update epic issue: ${error.message}`));
      }
    }
  }

  formatSubIssueAsGitHubIssue(subIssue, epic, options) {
    const labels = [...subIssue.labels, 'epic-breakdown'];
    
    if (options.labels) {
      labels.push(...options.labels.split(',').map(l => l.trim()));
    }

    const body = this.generateSubIssueBody(subIssue, epic);

    return {
      title: subIssue.title,
      body,
      labels: labels.filter(Boolean),
      milestone: options.milestone,
      assignees: options.assignee ? [options.assignee] : []
    };
  }

  generateSubIssueBody(subIssue, epic) {
    let body = `## Description\n${subIssue.description}\n`;
    
    if (subIssue.acceptanceCriteria?.length > 0) {
      body += `\n## Acceptance Criteria\n${subIssue.acceptanceCriteria.map(criteria => `- [ ] ${criteria}`).join('\n')}\n`;
    }
    
    body += `\n## Details\n`;
    body += `- **Type**: ${subIssue.type}\n`;
    body += `- **Category**: ${subIssue.category}\n`;
    body += `- **Story Points**: ${subIssue.storyPoints}\n`;
    body += `- **Priority**: ${subIssue.priority}\n`;
    
    if (epic.isExistingIssue) {
      body += `\n## Epic\nThis issue is part of epic #${epic.number}: ${epic.title}\n`;
    } else {
      body += `\n## Epic\nThis issue is part of epic: ${epic.title}\n`;
    }
    
    body += `\n---\n*Generated by Flow State Dev epic breakdown*`;
    
    return body;
  }

  async updateEpicIssue(epic, breakdown, createdCount) {
    const epicUpdateBody = this.generateEpicUpdateBody(epic, breakdown, createdCount);
    
    const command = `gh issue edit ${epic.number} --body "${epicUpdateBody}"`;
    await this.exec(command, { silent: true });
  }

  generateEpicUpdateBody(epic, breakdown, createdCount) {
    let body = epic.description + '\n\n';
    
    body += `## Epic Breakdown\n`;
    body += `This epic has been broken down into ${createdCount} sub-issues:\n\n`;
    
    const { subIssues } = breakdown;
    const issuesByCategory = this.groupIssuesByCategory(subIssues);
    
    Object.entries(issuesByCategory).forEach(([category, issues]) => {
      body += `### ${category}\n`;
      issues.forEach(issue => {
        body += `- [ ] ${issue.title} (${issue.storyPoints} pts)\n`;
      });
      body += '\n';
    });
    
    body += `## Summary\n`;
    body += `- **Total Sub-Issues**: ${breakdown.metadata.totalSubIssues}\n`;
    body += `- **Total Story Points**: ${breakdown.metadata.totalStoryPoints}\n`;
    body += `- **Estimated Timeline**: ${breakdown.timeline.estimatedSprints} sprints\n`;
    
    body += `\n---\n*Epic breakdown generated by Flow State Dev*`;
    
    return body;
  }

  async createGitHubIssue(issueData) {
    const command = [
      'gh issue create',
      `--title "${issueData.title}"`,
      `--body "${issueData.body.replace(/"/g, '\\"')}"`,
      issueData.labels.length > 0 ? `--label "${issueData.labels.join(',')}"` : '',
      issueData.milestone ? `--milestone "${issueData.milestone}"` : '',
      issueData.assignees.length > 0 ? `--assignee "${issueData.assignees.join(',')}"` : ''
    ].filter(Boolean).join(' ');

    await this.exec(command, { silent: true });
  }

  // Helper methods
  formatCategory(category) {
    const categories = {
      Feature: '🎯 Feature',
      Infrastructure: '🏗️  Infrastructure',
      Database: '🗄️  Database',
      Backend: '⚙️  Backend',
      Security: '🔒 Security',
      Testing: '🧪 Testing',
      DevOps: '🚀 DevOps',
      Documentation: '📚 Documentation'
    };
    return categories[category] || category;
  }

  formatPriority(priority) {
    const priorities = {
      high: chalk.red('🔴'),
      medium: chalk.yellow('🟡'),
      low: chalk.green('🟢')
    };
    return priorities[priority] || chalk.gray('⚪');
  }

  groupIssuesByCategory(subIssues) {
    return subIssues.reduce((groups, issue) => {
      if (!groups[issue.category]) {
        groups[issue.category] = [];
      }
      groups[issue.category].push(issue);
      return groups;
    }, {});
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}