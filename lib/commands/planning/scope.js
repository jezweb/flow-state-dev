/**
 * Analyze Scope command - Detailed scope analysis with dependency mapping
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class AnalyzeScopeCommand extends GitHubSlashCommand {
  constructor() {
    super('/analyze:scope', 'Detailed scope analysis with dependency mapping', {
      aliases: ['/scope:analyze', '/scope:analysis'],
      category: 'planning',
      usage: '/analyze:scope [requirements] [options]',
      examples: [
        'fsd slash "/analyze:scope \'E-commerce platform with user management\'"',
        'fsd slash "/analyze:scope \'Real-time chat system\' --format json"',
        'fsd slash "/analyze:scope \'API gateway\' --create-issues"',
        'fsd slash "/analyze:scope \'Mobile app backend\' --format markdown"'
      ],
      options: [
        { name: 'requirements', type: 'string', description: 'Requirements or scope to analyze', required: true },
        { name: 'format', type: 'string', description: 'Output format (markdown, json, issues)', default: 'markdown' },
        { name: 'create-issues', type: 'boolean', description: 'Generate GitHub issues from analysis' },
        { name: 'milestone', type: 'string', description: 'Target milestone for generated issues' },
        { name: 'assignee', type: 'string', description: 'Default assignee for generated issues' },
        { name: 'depth', type: 'string', description: 'Analysis depth (shallow, medium, deep)', default: 'medium' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const requirements = args?.[0] || options.requirements;
    
    if (!requirements) {
      console.log(chalk.blue('🔍 Scope Analysis\n'));
      console.log(chalk.gray('Perform detailed analysis of project scope with dependency mapping.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/analyze:scope \'Project requirements\'"'));
      console.log(chalk.gray('\nExample scopes to analyze:'));
      console.log(chalk.gray('  • "E-commerce platform with user management"'));
      console.log(chalk.gray('  • "Real-time collaboration tool"'));
      console.log(chalk.gray('  • "Content management system"'));
      console.log(chalk.gray('  • "API gateway with authentication"'));
      console.log(chalk.gray('\nAnalysis depths:'));
      console.log(chalk.gray('  • shallow: Basic scope identification'));
      console.log(chalk.gray('  • medium: Detailed component analysis'));
      console.log(chalk.gray('  • deep: Comprehensive dependency mapping'));
      console.log(chalk.gray('\nOutput formats:'));
      console.log(chalk.gray('  • markdown: Formatted documentation'));
      console.log(chalk.gray('  • json: Structured data'));
      console.log(chalk.gray('  • issues: GitHub issues creation'));
      return;
    }

    console.log(chalk.blue('🔍 Scope Analysis\n'));
    console.log(chalk.white(`Analyzing: ${requirements}\n`));

    try {
      // Perform comprehensive scope analysis
      const analysis = await this.performScopeAnalysis(requirements, options);
      
      // Output in requested format
      await this.outputAnalysis(analysis, options);
      
      // Create issues if requested
      if (options['create-issues']) {
        await this.createAnalysisIssues(analysis, options);
      } else if (options.format !== 'issues') {
        const shouldCreate = await this.confirm(
          `Create GitHub issues from this scope analysis?`,
          false
        );
        
        if (shouldCreate) {
          await this.createAnalysisIssues(analysis, options);
        }
      }
      
    } catch (error) {
      this.log(`Failed to perform scope analysis: ${error.message}`, 'error');
    }
  }

  async performScopeAnalysis(requirements, options) {
    const depth = options.depth || 'medium';
    
    console.log(chalk.gray(`Performing ${depth} analysis...\n`));
    
    // Core analysis components
    const scopeIdentification = this.identifyScope(requirements);
    const functionalDecomposition = this.decomposeFunctionalRequirements(requirements, depth);
    const technicalArchitecture = this.analyzeTechnicalArchitecture(requirements, depth);
    const dependencyMapping = this.mapDependencies(functionalDecomposition, technicalArchitecture, depth);
    const riskAssessment = this.assessRisks(requirements, dependencyMapping);
    const effortEstimation = this.estimateEffort(functionalDecomposition, technicalArchitecture, depth);
    const timeline = this.createProjectTimeline(functionalDecomposition, effortEstimation);
    const recommendations = this.generateRecommendations(requirements, dependencyMapping, riskAssessment);
    
    return {
      requirements,
      depth,
      scopeIdentification,
      functionalDecomposition,
      technicalArchitecture,
      dependencyMapping,
      riskAssessment,
      effortEstimation,
      timeline,
      recommendations,
      metadata: {
        analysisDate: new Date().toISOString(),
        totalComponents: functionalDecomposition.components.length + technicalArchitecture.components.length,
        complexityScore: this.calculateComplexityScore(functionalDecomposition, technicalArchitecture),
        criticalPath: this.findCriticalPath(dependencyMapping)
      }
    };
  }

  identifyScope(requirements) {
    const scopeText = requirements.toLowerCase();
    
    // Identify project type
    const projectTypes = {
      'E-commerce': ['shop', 'store', 'product', 'cart', 'checkout', 'payment', 'order'],
      'Social Platform': ['social', 'feed', 'follow', 'friend', 'post', 'share', 'like'],
      'Content Management': ['cms', 'content', 'article', 'blog', 'publish', 'editor'],
      'Real-time Communication': ['chat', 'message', 'real-time', 'websocket', 'notification'],
      'API Platform': ['api', 'microservice', 'gateway', 'endpoint', 'integration'],
      'Authentication System': ['auth', 'login', 'user', 'account', 'permission', 'role'],
      'Analytics Platform': ['analytics', 'dashboard', 'report', 'metrics', 'data'],
      'File Management': ['file', 'upload', 'download', 'storage', 'document', 'media'],
      'Workflow Management': ['workflow', 'process', 'task', 'automation', 'approval'],
      'IoT Platform': ['iot', 'device', 'sensor', 'telemetry', 'monitoring']
    };

    let identifiedType = 'General Application';
    let maxMatches = 0;
    let matchedKeywords = [];

    for (const [type, keywords] of Object.entries(projectTypes)) {
      const matches = keywords.filter(keyword => scopeText.includes(keyword));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        identifiedType = type;
        matchedKeywords = matches;
      }
    }

    // Identify business domains
    const businessDomains = this.identifyBusinessDomains(scopeText);
    
    // Identify scale indicators
    const scaleIndicators = this.identifyScaleIndicators(scopeText);
    
    // Identify technology preferences
    const techPreferences = this.identifyTechnologyPreferences(scopeText);

    return {
      projectType: identifiedType,
      confidence: Math.min(maxMatches / 3, 1.0), // Normalize confidence
      matchedKeywords,
      businessDomains,
      scaleIndicators,
      techPreferences,
      description: this.generateScopeDescription(identifiedType, businessDomains, scaleIndicators)
    };
  }

  identifyBusinessDomains(scopeText) {
    const domains = [];
    
    const domainKeywords = {
      'User Management': ['user', 'account', 'profile', 'member', 'customer'],
      'Financial': ['payment', 'billing', 'invoice', 'transaction', 'finance'],
      'Content': ['content', 'article', 'post', 'media', 'document'],
      'Communication': ['message', 'email', 'notification', 'chat', 'communication'],
      'Analytics': ['analytics', 'report', 'dashboard', 'metrics', 'tracking'],
      'Security': ['security', 'auth', 'permission', 'access', 'encryption'],
      'Integration': ['integration', 'api', 'webhook', 'sync', 'external'],
      'Workflow': ['workflow', 'process', 'approval', 'automation', 'task']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const matches = keywords.filter(keyword => scopeText.includes(keyword));
      if (matches.length > 0) {
        domains.push({
          domain,
          relevance: matches.length / keywords.length,
          keywords: matches
        });
      }
    }

    return domains.sort((a, b) => b.relevance - a.relevance);
  }

  identifyScaleIndicators(scopeText) {
    const indicators = {
      userBase: this.extractUserBaseSize(scopeText),
      dataVolume: this.extractDataVolumeIndicators(scopeText),
      concurrency: this.extractConcurrencyRequirements(scopeText),
      availability: this.extractAvailabilityRequirements(scopeText),
      performance: this.extractPerformanceRequirements(scopeText)
    };

    const overallScale = this.determineOverallScale(indicators);

    return {
      ...indicators,
      overallScale,
      scaleChallenges: this.identifyScaleChallenges(indicators, overallScale)
    };
  }

  extractUserBaseSize(scopeText) {
    const sizeIndicators = {
      'Small': ['small', 'startup', 'team', 'internal'],
      'Medium': ['medium', 'company', 'organization', 'department'],
      'Large': ['large', 'enterprise', 'global', 'massive'],
      'Scale': ['million', 'thousand', 'scale', 'concurrent']
    };

    for (const [size, keywords] of Object.entries(sizeIndicators)) {
      if (keywords.some(keyword => scopeText.includes(keyword))) {
        return { size, confidence: 'medium' };
      }
    }

    // Look for numeric indicators
    const numberMatch = scopeText.match(/(\d+)\s*(k|thousand|million|m)/i);
    if (numberMatch) {
      const value = parseInt(numberMatch[1]);
      const unit = numberMatch[2].toLowerCase();
      const multiplier = unit.startsWith('m') ? 1000000 : 1000;
      const totalUsers = value * multiplier;
      
      if (totalUsers > 1000000) return { size: 'Large', confidence: 'high', estimate: totalUsers };
      if (totalUsers > 10000) return { size: 'Medium', confidence: 'high', estimate: totalUsers };
      return { size: 'Small', confidence: 'high', estimate: totalUsers };
    }

    return { size: 'Medium', confidence: 'low' }; // Default assumption
  }

  extractDataVolumeIndicators(scopeText) {
    const volumeKeywords = {
      'Low': ['simple', 'basic', 'minimal'],
      'Medium': ['moderate', 'standard', 'typical'],
      'High': ['large', 'big data', 'massive', 'terabyte', 'petabyte'],
      'Real-time': ['real-time', 'streaming', 'live', 'instant']
    };

    for (const [volume, keywords] of Object.entries(volumeKeywords)) {
      if (keywords.some(keyword => scopeText.includes(keyword))) {
        return { volume, confidence: 'medium' };
      }
    }

    return { volume: 'Medium', confidence: 'low' };
  }

  extractConcurrencyRequirements(scopeText) {
    if (scopeText.includes('concurrent') || scopeText.includes('simultaneous')) {
      const numberMatch = scopeText.match(/(\d+)\s*(concurrent|simultaneous)/i);
      if (numberMatch) {
        return { level: 'High', confidence: 'high', estimate: parseInt(numberMatch[1]) };
      }
      return { level: 'High', confidence: 'medium' };
    }

    if (scopeText.includes('real-time') || scopeText.includes('live')) {
      return { level: 'Medium', confidence: 'medium' };
    }

    return { level: 'Low', confidence: 'low' };
  }

  extractAvailabilityRequirements(scopeText) {
    const availabilityPatterns = [
      { pattern: /99\.9+%/, level: 'High' },
      { pattern: /24\/7/, level: 'High' },
      { pattern: /high availability/i, level: 'High' },
      { pattern: /uptime/i, level: 'Medium' }
    ];

    for (const { pattern, level } of availabilityPatterns) {
      if (pattern.test(scopeText)) {
        return { level, confidence: 'high' };
      }
    }

    return { level: 'Medium', confidence: 'low' };
  }

  extractPerformanceRequirements(scopeText) {
    const performanceKeywords = {
      'High': ['fast', 'performance', 'speed', 'optimize', 'millisecond'],
      'Medium': ['responsive', 'efficient', 'smooth'],
      'Low': ['basic', 'simple']
    };

    for (const [level, keywords] of Object.entries(performanceKeywords)) {
      if (keywords.some(keyword => scopeText.includes(keyword))) {
        return { level, confidence: 'medium' };
      }
    }

    return { level: 'Medium', confidence: 'low' };
  }

  determineOverallScale(indicators) {
    const scores = {
      userBase: { 'Large': 3, 'Medium': 2, 'Small': 1 }[indicators.userBase.size] || 2,
      dataVolume: { 'High': 3, 'Real-time': 3, 'Medium': 2, 'Low': 1 }[indicators.dataVolume.volume] || 2,
      concurrency: { 'High': 3, 'Medium': 2, 'Low': 1 }[indicators.concurrency.level] || 1,
      availability: { 'High': 3, 'Medium': 2, 'Low': 1 }[indicators.availability.level] || 2,
      performance: { 'High': 3, 'Medium': 2, 'Low': 1 }[indicators.performance.level] || 2
    };

    const averageScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    if (averageScore >= 2.5) return 'Enterprise';
    if (averageScore >= 2) return 'Medium';
    return 'Small';
  }

  identifyScaleChallenges(indicators, overallScale) {
    const challenges = [];

    if (indicators.userBase.size === 'Large') {
      challenges.push({
        challenge: 'User Scalability',
        description: 'Handle large user base with consistent performance',
        mitigation: 'Load balancing, caching, database optimization'
      });
    }

    if (indicators.dataVolume.volume === 'High' || indicators.dataVolume.volume === 'Real-time') {
      challenges.push({
        challenge: 'Data Processing',
        description: 'Process and store large volumes of data efficiently',
        mitigation: 'Data partitioning, streaming processing, NoSQL databases'
      });
    }

    if (indicators.concurrency.level === 'High') {
      challenges.push({
        challenge: 'Concurrency Management',
        description: 'Handle many simultaneous users and operations',
        mitigation: 'Connection pooling, async processing, queue systems'
      });
    }

    if (indicators.availability.level === 'High') {
      challenges.push({
        challenge: 'High Availability',
        description: 'Maintain system availability with minimal downtime',
        mitigation: 'Redundancy, failover systems, monitoring'
      });
    }

    return challenges;
  }

  identifyTechnologyPreferences(scopeText) {
    const techKeywords = {
      'Frontend': {
        'React': ['react', 'jsx'],
        'Vue': ['vue', 'vuejs'],
        'Angular': ['angular', 'typescript'],
        'Svelte': ['svelte'],
        'Mobile': ['mobile', 'ios', 'android', 'react native', 'flutter']
      },
      'Backend': {
        'Node.js': ['node', 'nodejs', 'javascript'],
        'Python': ['python', 'django', 'flask', 'fastapi'],
        'Java': ['java', 'spring', 'spring boot'],
        'Go': ['go', 'golang'],
        'Ruby': ['ruby', 'rails'],
        'PHP': ['php', 'laravel'],
        '.NET': ['dotnet', 'c#', 'asp.net']
      },
      'Database': {
        'PostgreSQL': ['postgres', 'postgresql'],
        'MySQL': ['mysql'],
        'MongoDB': ['mongo', 'mongodb'],
        'Redis': ['redis', 'cache'],
        'ElasticSearch': ['elastic', 'elasticsearch', 'search']
      },
      'Cloud': {
        'AWS': ['aws', 'amazon'],
        'Azure': ['azure', 'microsoft'],
        'GCP': ['gcp', 'google cloud'],
        'Docker': ['docker', 'container'],
        'Kubernetes': ['kubernetes', 'k8s']
      }
    };

    const preferences = {};

    for (const [category, technologies] of Object.entries(techKeywords)) {
      preferences[category] = [];
      for (const [tech, keywords] of Object.entries(technologies)) {
        if (keywords.some(keyword => scopeText.includes(keyword))) {
          preferences[category].push(tech);
        }
      }
    }

    return preferences;
  }

  generateScopeDescription(projectType, businessDomains, scaleIndicators) {
    const domainList = businessDomains.slice(0, 3).map(d => d.domain).join(', ');
    const scale = scaleIndicators.overallScale;
    
    return `${scale}-scale ${projectType} focusing on ${domainList}`;
  }

  decomposeFunctionalRequirements(requirements, depth) {
    const scopeText = requirements.toLowerCase();
    
    // Identify core functional areas
    const functionalAreas = this.identifyFunctionalAreas(scopeText);
    
    // Generate functional components for each area
    const components = [];
    functionalAreas.forEach(area => {
      const areaComponents = this.generateFunctionalComponents(area, depth);
      components.push(...areaComponents);
    });

    // Identify user roles and personas
    const userRoles = this.identifyUserRoles(scopeText);
    
    // Generate user stories
    const userStories = this.generateUserStories(components, userRoles, depth);
    
    // Identify business rules
    const businessRules = this.identifyBusinessRules(scopeText, components);

    return {
      functionalAreas,
      components,
      userRoles,
      userStories,
      businessRules,
      metrics: {
        totalAreas: functionalAreas.length,
        totalComponents: components.length,
        totalUserStories: userStories.length,
        averageComplexity: this.calculateAverageComplexity(components)
      }
    };
  }

  identifyFunctionalAreas(scopeText) {
    const standardAreas = [
      {
        name: 'User Management',
        keywords: ['user', 'account', 'profile', 'registration', 'auth'],
        priority: 'high',
        complexity: 'medium'
      },
      {
        name: 'Content Management',
        keywords: ['content', 'post', 'article', 'media', 'document'],
        priority: 'medium',
        complexity: 'medium'
      },
      {
        name: 'Search & Discovery',
        keywords: ['search', 'filter', 'find', 'discover', 'browse'],
        priority: 'medium',
        complexity: 'medium'
      },
      {
        name: 'Communication',
        keywords: ['message', 'chat', 'notification', 'email', 'alert'],
        priority: 'medium',
        complexity: 'high'
      },
      {
        name: 'Analytics & Reporting',
        keywords: ['analytics', 'report', 'dashboard', 'metrics', 'tracking'],
        priority: 'low',
        complexity: 'medium'
      },
      {
        name: 'Payment Processing',
        keywords: ['payment', 'billing', 'checkout', 'transaction', 'invoice'],
        priority: 'high',
        complexity: 'high'
      },
      {
        name: 'File Management',
        keywords: ['file', 'upload', 'download', 'storage', 'attachment'],
        priority: 'medium',
        complexity: 'medium'
      },
      {
        name: 'API & Integration',
        keywords: ['api', 'integration', 'webhook', 'sync', 'external'],
        priority: 'medium',
        complexity: 'high'
      }
    ];

    const identifiedAreas = standardAreas.filter(area => {
      const matches = area.keywords.filter(keyword => scopeText.includes(keyword));
      return matches.length > 0;
    }).map(area => ({
      ...area,
      relevance: area.keywords.filter(keyword => scopeText.includes(keyword)).length / area.keywords.length
    }));

    // Add custom areas based on specific project type
    const customAreas = this.identifyCustomFunctionalAreas(scopeText);
    identifiedAreas.push(...customAreas);

    return identifiedAreas.sort((a, b) => b.relevance - a.relevance);
  }

  identifyCustomFunctionalAreas(scopeText) {
    const customAreas = [];

    // E-commerce specific areas
    if (scopeText.includes('ecommerce') || scopeText.includes('shop') || scopeText.includes('store')) {
      customAreas.push(
        {
          name: 'Product Catalog',
          keywords: ['product', 'catalog', 'inventory'],
          priority: 'high',
          complexity: 'medium',
          relevance: 1.0
        },
        {
          name: 'Shopping Cart',
          keywords: ['cart', 'basket', 'checkout'],
          priority: 'high',
          complexity: 'medium',
          relevance: 1.0
        },
        {
          name: 'Order Management',
          keywords: ['order', 'fulfillment', 'shipping'],
          priority: 'high',
          complexity: 'high',
          relevance: 1.0
        }
      );
    }

    // Social platform specific areas
    if (scopeText.includes('social') || scopeText.includes('community')) {
      customAreas.push(
        {
          name: 'Social Features',
          keywords: ['follow', 'friend', 'like', 'share'],
          priority: 'high',
          complexity: 'medium',
          relevance: 1.0
        },
        {
          name: 'Content Feed',
          keywords: ['feed', 'timeline', 'stream'],
          priority: 'high',
          complexity: 'high',
          relevance: 1.0
        }
      );
    }

    // Real-time specific areas
    if (scopeText.includes('real-time') || scopeText.includes('live')) {
      customAreas.push({
        name: 'Real-time Communication',
        keywords: ['real-time', 'live', 'websocket'],
        priority: 'high',
        complexity: 'high',
        relevance: 1.0
      });
    }

    return customAreas;
  }

  generateFunctionalComponents(area, depth) {
    const baseComponents = this.getBaseComponentsForArea(area);
    
    if (depth === 'shallow') {
      return baseComponents.slice(0, 2); // Only basic components
    } else if (depth === 'medium') {
      return baseComponents; // All standard components
    } else { // deep
      const detailedComponents = this.getDetailedComponentsForArea(area);
      return [...baseComponents, ...detailedComponents];
    }
  }

  getBaseComponentsForArea(area) {
    const componentTemplates = {
      'User Management': [
        {
          name: 'User Registration',
          description: 'Allow users to create new accounts',
          complexity: 'medium',
          priority: 'high',
          dependencies: [],
          type: 'feature'
        },
        {
          name: 'User Authentication',
          description: 'Authenticate user credentials and manage sessions',
          complexity: 'medium',
          priority: 'high',
          dependencies: ['User Registration'],
          type: 'feature'
        },
        {
          name: 'User Profile Management',
          description: 'Allow users to view and edit their profiles',
          complexity: 'low',
          priority: 'medium',
          dependencies: ['User Authentication'],
          type: 'feature'
        }
      ],
      'Content Management': [
        {
          name: 'Content Creation',
          description: 'Allow users to create and publish content',
          complexity: 'medium',
          priority: 'high',
          dependencies: ['User Authentication'],
          type: 'feature'
        },
        {
          name: 'Content Editing',
          description: 'Allow users to edit existing content',
          complexity: 'medium',
          priority: 'medium',
          dependencies: ['Content Creation'],
          type: 'feature'
        },
        {
          name: 'Content Organization',
          description: 'Categorize and organize content',
          complexity: 'low',
          priority: 'medium',
          dependencies: ['Content Creation'],
          type: 'feature'
        }
      ],
      'Payment Processing': [
        {
          name: 'Payment Gateway Integration',
          description: 'Integrate with external payment processors',
          complexity: 'high',
          priority: 'high',
          dependencies: ['User Authentication'],
          type: 'integration'
        },
        {
          name: 'Transaction Management',
          description: 'Handle payment transactions and status tracking',
          complexity: 'high',
          priority: 'high',
          dependencies: ['Payment Gateway Integration'],
          type: 'feature'
        }
      ]
    };

    return componentTemplates[area.name] || [
      {
        name: `${area.name} Core Functionality`,
        description: `Core features for ${area.name.toLowerCase()}`,
        complexity: area.complexity,
        priority: area.priority,
        dependencies: [],
        type: 'feature'
      }
    ];
  }

  getDetailedComponentsForArea(area) {
    const detailedTemplates = {
      'User Management': [
        {
          name: 'Password Reset',
          description: 'Allow users to reset forgotten passwords',
          complexity: 'medium',
          priority: 'medium',
          dependencies: ['User Authentication'],
          type: 'feature'
        },
        {
          name: 'Two-Factor Authentication',
          description: 'Enhanced security with 2FA',
          complexity: 'high',
          priority: 'low',
          dependencies: ['User Authentication'],
          type: 'feature'
        },
        {
          name: 'User Role Management',
          description: 'Manage user roles and permissions',
          complexity: 'high',
          priority: 'medium',
          dependencies: ['User Authentication'],
          type: 'feature'
        }
      ],
      'Content Management': [
        {
          name: 'Content Versioning',
          description: 'Track and manage content versions',
          complexity: 'high',
          priority: 'low',
          dependencies: ['Content Editing'],
          type: 'feature'
        },
        {
          name: 'Content Approval Workflow',
          description: 'Review and approval process for content',
          complexity: 'high',
          priority: 'medium',
          dependencies: ['Content Creation', 'User Role Management'],
          type: 'feature'
        }
      ]
    };

    return detailedTemplates[area.name] || [];
  }

  identifyUserRoles(scopeText) {
    const standardRoles = [
      {
        role: 'End User',
        description: 'Primary user of the application',
        permissions: ['view', 'create', 'edit own content'],
        priority: 'high'
      },
      {
        role: 'Administrator',
        description: 'System administrator with full access',
        permissions: ['all permissions', 'user management', 'system configuration'],
        priority: 'high'
      }
    ];

    // Add domain-specific roles
    if (scopeText.includes('ecommerce') || scopeText.includes('shop')) {
      standardRoles.push(
        {
          role: 'Customer',
          description: 'User who purchases products',
          permissions: ['browse products', 'make purchases', 'view orders'],
          priority: 'high'
        },
        {
          role: 'Vendor',
          description: 'User who sells products',
          permissions: ['manage products', 'view sales', 'fulfill orders'],
          priority: 'medium'
        }
      );
    }

    if (scopeText.includes('content') || scopeText.includes('blog')) {
      standardRoles.push(
        {
          role: 'Author',
          description: 'User who creates content',
          permissions: ['create content', 'edit own content', 'publish'],
          priority: 'high'
        },
        {
          role: 'Editor',
          description: 'User who reviews and approves content',
          permissions: ['edit all content', 'approve content', 'manage authors'],
          priority: 'medium'
        }
      );
    }

    if (scopeText.includes('api') || scopeText.includes('developer')) {
      standardRoles.push({
        role: 'API Consumer',
        description: 'External system or developer using the API',
        permissions: ['API access', 'read data', 'limited write access'],
        priority: 'medium'
      });
    }

    return standardRoles;
  }

  generateUserStories(components, userRoles, depth) {
    const stories = [];
    const storyTemplates = {
      'simple': (role, component) => `As a ${role.role}, I want to ${this.getSimpleAction(component)} so that I can ${this.getSimpleBenefit(component)}`,
      'detailed': (role, component) => {
        const action = this.getDetailedAction(component);
        const benefit = this.getDetailedBenefit(component);
        const context = this.getStoryContext(component);
        return `As a ${role.role}, I want to ${action} so that I can ${benefit}. ${context}`;
      }
    };

    const storyTemplate = depth === 'shallow' ? storyTemplates.simple : storyTemplates.detailed;

    components.forEach(component => {
      userRoles.forEach(role => {
        if (this.isComponentRelevantToRole(component, role)) {
          stories.push({
            id: stories.length + 1,
            story: storyTemplate(role, component),
            component: component.name,
            role: role.role,
            priority: this.calculateStoryPriority(component.priority, role.priority),
            complexity: component.complexity,
            acceptanceCriteria: this.generateAcceptanceCriteria(component, role)
          });
        }
      });
    });

    return stories;
  }

  getSimpleAction(component) {
    const actionMap = {
      'User Registration': 'create an account',
      'User Authentication': 'log into my account',
      'Content Creation': 'create new content',
      'Payment Processing': 'make payments',
      'Search': 'search for information'
    };
    return actionMap[component.name] || `use ${component.name.toLowerCase()}`;
  }

  getSimpleBenefit(component) {
    const benefitMap = {
      'User Registration': 'access the platform',
      'User Authentication': 'access my personal information',
      'Content Creation': 'share my ideas',
      'Payment Processing': 'complete transactions',
      'Search': 'find what I need quickly'
    };
    return benefitMap[component.name] || 'accomplish my goals';
  }

  getDetailedAction(component) {
    const detailedActions = {
      'User Registration': 'register for an account with my email and create a secure password',
      'User Authentication': 'securely log into my account using my credentials',
      'Content Creation': 'create, format, and publish high-quality content',
      'Payment Processing': 'securely process payments using multiple payment methods'
    };
    return detailedActions[component.name] || this.getSimpleAction(component);
  }

  getDetailedBenefit(component) {
    const detailedBenefits = {
      'User Registration': 'gain access to personalized features and save my preferences',
      'User Authentication': 'access my personal data and maintain account security',
      'Content Creation': 'effectively communicate with my audience and build engagement',
      'Payment Processing': 'complete purchases safely and efficiently'
    };
    return detailedBenefits[component.name] || this.getSimpleBenefit(component);
  }

  getStoryContext(component) {
    const contexts = {
      'User Registration': 'The registration process should be simple and secure.',
      'User Authentication': 'Authentication should be fast and reliable.',
      'Content Creation': 'The content editor should be intuitive and feature-rich.',
      'Payment Processing': 'Payment processing must be secure and compliant with industry standards.'
    };
    return contexts[component.name] || '';
  }

  isComponentRelevantToRole(component, role) {
    // Admin role is relevant to all components
    if (role.role === 'Administrator') return true;
    
    // Map components to relevant roles
    const componentRoleMap = {
      'User Registration': ['End User', 'Customer', 'Author', 'Vendor'],
      'User Authentication': ['End User', 'Customer', 'Author', 'Vendor'],
      'Content Creation': ['Author', 'End User'],
      'Content Editing': ['Author', 'Editor'],
      'Payment Processing': ['Customer'],
      'Product Management': ['Vendor', 'Administrator']
    };

    const relevantRoles = componentRoleMap[component.name];
    return !relevantRoles || relevantRoles.includes(role.role);
  }

  calculateStoryPriority(componentPriority, rolePriority) {
    const priorityScores = { high: 3, medium: 2, low: 1 };
    const avgScore = (priorityScores[componentPriority] + priorityScores[rolePriority]) / 2;
    
    if (avgScore >= 2.5) return 'high';
    if (avgScore >= 1.5) return 'medium';
    return 'low';
  }

  generateAcceptanceCriteria(component, role) {
    const baseCriteria = [
      'Feature functions according to specifications',
      'User interface is intuitive and responsive',
      'Error handling provides clear feedback',
      'Security requirements are met'
    ];

    const specificCriteria = {
      'User Registration': [
        'User can enter valid email and password',
        'System validates email format and password strength',
        'Confirmation email is sent successfully',
        'Account is created and activated'
      ],
      'User Authentication': [
        'User can log in with valid credentials',
        'Invalid credentials show appropriate error',
        'Session is maintained securely',
        'User can log out successfully'
      ],
      'Content Creation': [
        'User can create and format content',
        'Content can be saved as draft',
        'Content can be published successfully',
        'Content appears correctly to other users'
      ]
    };

    return specificCriteria[component.name] || baseCriteria;
  }

  identifyBusinessRules(scopeText, components) {
    const rules = [];

    // Authentication rules
    if (components.some(c => c.name.includes('Authentication'))) {
      rules.push({
        domain: 'Authentication',
        rule: 'Users must authenticate before accessing protected features',
        type: 'security',
        priority: 'high'
      });
    }

    // Authorization rules
    if (components.some(c => c.name.includes('Role'))) {
      rules.push({
        domain: 'Authorization',
        rule: 'Users can only access features permitted by their role',
        type: 'security',
        priority: 'high'
      });
    }

    // Payment rules
    if (scopeText.includes('payment') || scopeText.includes('billing')) {
      rules.push(
        {
          domain: 'Payment',
          rule: 'All payments must be processed securely and logged',
          type: 'business',
          priority: 'high'
        },
        {
          domain: 'Payment',
          rule: 'Failed payments must trigger appropriate notifications',
          type: 'business',
          priority: 'medium'
        }
      );
    }

    // Content rules
    if (components.some(c => c.name.includes('Content'))) {
      rules.push({
        domain: 'Content',
        rule: 'Content must be approved before publication',
        type: 'business',
        priority: 'medium'
      });
    }

    // Data privacy rules
    rules.push({
      domain: 'Privacy',
      rule: 'Personal data must be handled according to privacy regulations',
      type: 'compliance',
      priority: 'high'
    });

    return rules;
  }

  calculateAverageComplexity(components) {
    const complexityScores = { low: 1, medium: 2, high: 3 };
    const totalScore = components.reduce((sum, comp) => sum + complexityScores[comp.complexity], 0);
    return (totalScore / components.length).toFixed(1);
  }

  analyzeTechnicalArchitecture(requirements, depth) {
    const scopeText = requirements.toLowerCase();
    
    // Identify architectural patterns
    const patterns = this.identifyArchitecturalPatterns(scopeText, depth);
    
    // Identify technical components
    const components = this.identifyTechnicalComponents(scopeText, depth);
    
    // Identify technology stack
    const technologyStack = this.identifyTechnologyStack(scopeText);
    
    // Identify infrastructure requirements
    const infrastructure = this.identifyInfrastructureRequirements(scopeText, depth);
    
    // Identify data architecture
    const dataArchitecture = this.identifyDataArchitecture(scopeText, components, depth);
    
    // Identify security architecture
    const securityArchitecture = this.identifySecurityArchitecture(scopeText, depth);

    return {
      patterns,
      components,
      technologyStack,
      infrastructure,
      dataArchitecture,
      securityArchitecture,
      metrics: {
        totalComponents: components.length,
        architecturalComplexity: this.calculateArchitecturalComplexity(patterns, components),
        technologyDiversity: this.calculateTechnologyDiversity(technologyStack)
      }
    };
  }

  identifyArchitecturalPatterns(scopeText, depth) {
    const patterns = [];

    // Microservices vs Monolith
    if (scopeText.includes('microservice') || scopeText.includes('distributed') || scopeText.includes('scale')) {
      patterns.push({
        pattern: 'Microservices Architecture',
        description: 'Distributed system with loosely coupled services',
        benefits: ['Scalability', 'Technology diversity', 'Team autonomy'],
        challenges: ['Complexity', 'Network latency', 'Data consistency'],
        suitability: 'high'
      });
    } else {
      patterns.push({
        pattern: 'Monolithic Architecture',
        description: 'Single deployable unit with all functionality',
        benefits: ['Simplicity', 'Easy testing', 'Single deployment'],
        challenges: ['Scaling limitations', 'Technology lock-in'],
        suitability: 'medium'
      });
    }

    // Event-driven patterns
    if (scopeText.includes('real-time') || scopeText.includes('event') || scopeText.includes('notification')) {
      patterns.push({
        pattern: 'Event-Driven Architecture',
        description: 'Components communicate through events',
        benefits: ['Loose coupling', 'Scalability', 'Real-time processing'],
        challenges: ['Eventual consistency', 'Debugging complexity'],
        suitability: 'high'
      });
    }

    // API-first patterns
    if (scopeText.includes('api') || scopeText.includes('mobile') || scopeText.includes('integration')) {
      patterns.push({
        pattern: 'API-First Architecture',
        description: 'APIs as the primary interface for all functionality',
        benefits: ['Multiple client support', 'Reusability', 'Integration-friendly'],
        challenges: ['Versioning', 'API design complexity'],
        suitability: 'high'
      });
    }

    // Serverless patterns
    if (scopeText.includes('serverless') || scopeText.includes('lambda') || scopeText.includes('function')) {
      patterns.push({
        pattern: 'Serverless Architecture',
        description: 'Function-as-a-Service with managed infrastructure',
        benefits: ['Cost efficiency', 'Auto-scaling', 'No server management'],
        challenges: ['Cold starts', 'Vendor lock-in', 'Monitoring complexity'],
        suitability: 'medium'
      });
    }

    return patterns;
  }

  identifyTechnicalComponents(scopeText, depth) {
    const components = [];

    // Core application components
    components.push(
      {
        name: 'Application Server',
        type: 'Runtime',
        responsibility: 'Host and execute application logic',
        technology: 'Node.js/Python/Java',
        complexity: 'medium',
        scaling: 'horizontal'
      },
      {
        name: 'Database',
        type: 'Data Storage',
        responsibility: 'Persist and manage application data',
        technology: 'PostgreSQL/MongoDB',
        complexity: 'medium',
        scaling: 'vertical'
      }
    );

    // Web server / Load balancer
    if (scopeText.includes('web') || scopeText.includes('http') || scopeText.includes('scale')) {
      components.push({
        name: 'Load Balancer',
        type: 'Infrastructure',
        responsibility: 'Distribute traffic across application instances',
        technology: 'Nginx/HAProxy/ALB',
        complexity: 'low',
        scaling: 'managed'
      });
    }

    // Caching components
    if (scopeText.includes('performance') || scopeText.includes('scale') || scopeText.includes('cache')) {
      components.push({
        name: 'Cache Layer',
        type: 'Performance',
        responsibility: 'Store frequently accessed data for fast retrieval',
        technology: 'Redis/Memcached',
        complexity: 'low',
        scaling: 'horizontal'
      });
    }

    // Message queue
    if (scopeText.includes('queue') || scopeText.includes('async') || scopeText.includes('background')) {
      components.push({
        name: 'Message Queue',
        type: 'Communication',
        responsibility: 'Handle asynchronous message processing',
        technology: 'RabbitMQ/Apache Kafka',
        complexity: 'medium',
        scaling: 'horizontal'
      });
    }

    // Search engine
    if (scopeText.includes('search') || scopeText.includes('index')) {
      components.push({
        name: 'Search Engine',
        type: 'Search',
        responsibility: 'Provide fast and relevant search capabilities',
        technology: 'Elasticsearch/Solr',
        complexity: 'medium',
        scaling: 'horizontal'
      });
    }

    // Real-time components
    if (scopeText.includes('real-time') || scopeText.includes('websocket') || scopeText.includes('live')) {
      components.push({
        name: 'WebSocket Server',
        type: 'Real-time',
        responsibility: 'Handle real-time bidirectional communication',
        technology: 'Socket.io/WebSocket',
        complexity: 'medium',
        scaling: 'horizontal'
      });
    }

    // File storage
    if (scopeText.includes('file') || scopeText.includes('upload') || scopeText.includes('media')) {
      components.push({
        name: 'File Storage',
        type: 'Storage',
        responsibility: 'Store and serve static files and media',
        technology: 'AWS S3/CDN',
        complexity: 'low',
        scaling: 'managed'
      });
    }

    // Monitoring and logging (for deeper analysis)
    if (depth === 'deep') {
      components.push(
        {
          name: 'Monitoring System',
          type: 'Observability',
          responsibility: 'Monitor application performance and health',
          technology: 'Prometheus/DataDog',
          complexity: 'medium',
          scaling: 'managed'
        },
        {
          name: 'Logging System',
          type: 'Observability',
          responsibility: 'Collect and analyze application logs',
          technology: 'ELK Stack/Splunk',
          complexity: 'medium',
          scaling: 'horizontal'
        }
      );
    }

    return components;
  }

  identifyTechnologyStack(scopeText) {
    const stack = {
      frontend: [],
      backend: [],
      database: [],
      infrastructure: [],
      monitoring: []
    };

    // Frontend technologies
    const frontendTech = {
      'React': ['react', 'jsx'],
      'Vue.js': ['vue', 'vuejs'],
      'Angular': ['angular'],
      'Svelte': ['svelte'],
      'Next.js': ['next', 'nextjs'],
      'TypeScript': ['typescript', 'ts']
    };

    // Backend technologies
    const backendTech = {
      'Node.js': ['node', 'nodejs', 'express'],
      'Python': ['python', 'django', 'flask', 'fastapi'],
      'Java': ['java', 'spring'],
      'Go': ['golang', 'go'],
      'Ruby': ['ruby', 'rails'],
      'PHP': ['php', 'laravel']
    };

    // Database technologies
    const dbTech = {
      'PostgreSQL': ['postgres', 'postgresql'],
      'MySQL': ['mysql'],
      'MongoDB': ['mongo', 'mongodb'],
      'Redis': ['redis'],
      'Elasticsearch': ['elasticsearch', 'elastic']
    };

    // Infrastructure technologies
    const infraTech = {
      'Docker': ['docker', 'container'],
      'Kubernetes': ['kubernetes', 'k8s'],
      'AWS': ['aws', 'amazon'],
      'Azure': ['azure'],
      'Google Cloud': ['gcp', 'google cloud']
    };

    // Identify technologies mentioned in requirements
    [
      [frontendTech, 'frontend'],
      [backendTech, 'backend'],
      [dbTech, 'database'],
      [infraTech, 'infrastructure']
    ].forEach(([technologies, category]) => {
      Object.entries(technologies).forEach(([tech, keywords]) => {
        if (keywords.some(keyword => scopeText.includes(keyword))) {
          stack[category].push({
            name: tech,
            confidence: 'high',
            reason: 'Explicitly mentioned in requirements'
          });
        }
      });
    });

    // Add recommended technologies based on project characteristics
    if (stack.backend.length === 0) {
      stack.backend.push({
        name: 'Node.js',
        confidence: 'medium',
        reason: 'Popular choice for web applications'
      });
    }

    if (stack.database.length === 0) {
      if (scopeText.includes('nosql') || scopeText.includes('scale')) {
        stack.database.push({
          name: 'MongoDB',
          confidence: 'medium',
          reason: 'NoSQL suitable for scalable applications'
        });
      } else {
        stack.database.push({
          name: 'PostgreSQL',
          confidence: 'medium',
          reason: 'Reliable relational database'
        });
      }
    }

    return stack;
  }

  identifyInfrastructureRequirements(scopeText, depth) {
    const requirements = {
      hosting: this.identifyHostingRequirements(scopeText),
      scaling: this.identifyScalingRequirements(scopeText),
      availability: this.identifyAvailabilityRequirements(scopeText),
      security: this.identifySecurityRequirements(scopeText),
      performance: this.identifyPerformanceRequirements(scopeText)
    };

    if (depth === 'deep') {
      requirements.networking = this.identifyNetworkingRequirements(scopeText);
      requirements.backup = this.identifyBackupRequirements(scopeText);
      requirements.compliance = this.identifyComplianceRequirements(scopeText);
    }

    return requirements;
  }

  identifyHostingRequirements(scopeText) {
    const hosting = {
      type: 'cloud', // Default assumption
      provider: 'aws', // Default
      regions: ['us-east-1'], // Default
      multiRegion: false
    };

    // Detect cloud preferences
    if (scopeText.includes('aws')) hosting.provider = 'aws';
    else if (scopeText.includes('azure')) hosting.provider = 'azure';
    else if (scopeText.includes('gcp') || scopeText.includes('google cloud')) hosting.provider = 'gcp';

    // Detect global requirements
    if (scopeText.includes('global') || scopeText.includes('worldwide')) {
      hosting.multiRegion = true;
      hosting.regions = ['us-east-1', 'eu-west-1', 'ap-southeast-1'];
    }

    // Detect on-premise requirements
    if (scopeText.includes('on-premise') || scopeText.includes('private')) {
      hosting.type = 'on-premise';
    }

    return hosting;
  }

  identifyScalingRequirements(scopeText) {
    let strategy = 'horizontal'; // Default
    let autoScaling = false;
    let anticipated = 'medium';

    if (scopeText.includes('scale') || scopeText.includes('load')) {
      autoScaling = true;
      
      if (scopeText.includes('massive') || scopeText.includes('million')) {
        anticipated = 'high';
      } else if (scopeText.includes('small') || scopeText.includes('startup')) {
        anticipated = 'low';
      }
    }

    return { strategy, autoScaling, anticipated };
  }

  identifyAvailabilityRequirements(scopeText) {
    let target = '99.9%'; // Default
    let maintenance = 'scheduled';

    if (scopeText.includes('99.99') || scopeText.includes('four nines')) {
      target = '99.99%';
      maintenance = 'rolling';
    } else if (scopeText.includes('24/7') || scopeText.includes('always on')) {
      target = '99.9%';
      maintenance = 'scheduled';
    }

    return { target, maintenance };
  }

  identifySecurityRequirements(scopeText) {
    const requirements = [];

    if (scopeText.includes('auth') || scopeText.includes('login')) {
      requirements.push('Authentication');
    }
    if (scopeText.includes('payment') || scopeText.includes('sensitive')) {
      requirements.push('Data Encryption');
      requirements.push('PCI Compliance');
    }
    if (scopeText.includes('personal') || scopeText.includes('privacy')) {
      requirements.push('GDPR Compliance');
      requirements.push('Data Privacy');
    }
    if (scopeText.includes('api')) {
      requirements.push('API Security');
    }

    return requirements;
  }

  identifyPerformanceRequirements(scopeText) {
    const requirements = {
      responseTime: '< 2 seconds',
      throughput: 'medium',
      concurrency: 'medium'
    };

    if (scopeText.includes('fast') || scopeText.includes('performance')) {
      requirements.responseTime = '< 1 second';
      requirements.throughput = 'high';
    }

    if (scopeText.includes('real-time')) {
      requirements.responseTime = '< 100ms';
      requirements.concurrency = 'high';
    }

    return requirements;
  }

  identifyNetworkingRequirements(scopeText) {
    return {
      cdn: scopeText.includes('global') || scopeText.includes('media'),
      vpc: scopeText.includes('private') || scopeText.includes('secure'),
      ssl: true, // Always required
      domainName: scopeText.includes('domain') || scopeText.includes('custom')
    };
  }

  identifyBackupRequirements(scopeText) {
    return {
      frequency: scopeText.includes('critical') ? 'continuous' : 'daily',
      retention: scopeText.includes('compliance') ? '7 years' : '30 days',
      crossRegion: scopeText.includes('disaster') || scopeText.includes('critical')
    };
  }

  identifyComplianceRequirements(scopeText) {
    const requirements = [];

    if (scopeText.includes('gdpr') || scopeText.includes('privacy')) {
      requirements.push('GDPR');
    }
    if (scopeText.includes('pci') || scopeText.includes('payment')) {
      requirements.push('PCI DSS');
    }
    if (scopeText.includes('hipaa') || scopeText.includes('healthcare')) {
      requirements.push('HIPAA');
    }
    if (scopeText.includes('sox') || scopeText.includes('financial')) {
      requirements.push('SOX');
    }

    return requirements;
  }

  identifyDataArchitecture(scopeText, components, depth) {
    const architecture = {
      strategy: this.identifyDataStrategy(scopeText),
      storage: this.identifyStorageStrategy(scopeText, components),
      processing: this.identifyDataProcessing(scopeText),
      integration: this.identifyDataIntegration(scopeText)
    };

    if (depth === 'deep') {
      architecture.governance = this.identifyDataGovernance(scopeText);
      architecture.migration = this.identifyDataMigration(scopeText);
    }

    return architecture;
  }

  identifyDataStrategy(scopeText) {
    if (scopeText.includes('lake') || scopeText.includes('warehouse')) {
      return 'Data Lake/Warehouse';
    } else if (scopeText.includes('nosql') || scopeText.includes('document')) {
      return 'Document-based';
    } else if (scopeText.includes('graph') || scopeText.includes('relationship')) {
      return 'Graph-based';
    } else {
      return 'Relational';
    }
  }

  identifyStorageStrategy(scopeText, components) {
    const strategies = [];

    // Primary database
    strategies.push({
      type: 'Primary Database',
      technology: scopeText.includes('nosql') ? 'MongoDB' : 'PostgreSQL',
      purpose: 'Application data storage'
    });

    // Cache layer
    if (scopeText.includes('performance') || scopeText.includes('cache')) {
      strategies.push({
        type: 'Cache',
        technology: 'Redis',
        purpose: 'Performance optimization'
      });
    }

    // File storage
    if (scopeText.includes('file') || scopeText.includes('media')) {
      strategies.push({
        type: 'File Storage',
        technology: 'S3/CDN',
        purpose: 'Static file and media storage'
      });
    }

    return strategies;
  }

  identifyDataProcessing(scopeText) {
    const processing = {
      realTime: scopeText.includes('real-time') || scopeText.includes('stream'),
      batch: scopeText.includes('analytics') || scopeText.includes('report'),
      etl: scopeText.includes('integration') || scopeText.includes('sync')
    };

    return processing;
  }

  identifyDataIntegration(scopeText) {
    const integration = [];

    if (scopeText.includes('api') || scopeText.includes('integration')) {
      integration.push({
        type: 'API Integration',
        direction: 'bidirectional',
        format: 'REST/JSON'
      });
    }

    if (scopeText.includes('webhook')) {
      integration.push({
        type: 'Webhook',
        direction: 'inbound',
        format: 'HTTP/JSON'
      });
    }

    if (scopeText.includes('sync') || scopeText.includes('import')) {
      integration.push({
        type: 'Data Synchronization',
        direction: 'bidirectional',
        format: 'Various'
      });
    }

    return integration;
  }

  identifyDataGovernance(scopeText) {
    return {
      privacy: scopeText.includes('privacy') || scopeText.includes('gdpr'),
      retention: scopeText.includes('compliance') || scopeText.includes('audit'),
      access: scopeText.includes('permission') || scopeText.includes('role'),
      quality: scopeText.includes('validation') || scopeText.includes('quality')
    };
  }

  identifyDataMigration(scopeText) {
    return {
      required: scopeText.includes('migration') || scopeText.includes('legacy'),
      strategy: scopeText.includes('big bang') ? 'Big Bang' : 'Incremental',
      downtime: scopeText.includes('zero downtime') ? 'None' : 'Minimal'
    };
  }

  identifySecurityArchitecture(scopeText, depth) {
    const architecture = {
      authentication: this.identifyAuthenticationStrategy(scopeText),
      authorization: this.identifyAuthorizationStrategy(scopeText),
      dataProtection: this.identifyDataProtection(scopeText),
      networkSecurity: this.identifyNetworkSecurity(scopeText)
    };

    if (depth === 'deep') {
      architecture.monitoring = this.identifySecurityMonitoring(scopeText);
      architecture.compliance = this.identifySecurityCompliance(scopeText);
    }

    return architecture;
  }

  identifyAuthenticationStrategy(scopeText) {
    const strategies = [];

    if (scopeText.includes('oauth') || scopeText.includes('social')) {
      strategies.push('OAuth 2.0');
    }
    if (scopeText.includes('saml') || scopeText.includes('sso')) {
      strategies.push('SAML/SSO');
    }
    if (scopeText.includes('jwt') || scopeText.includes('token')) {
      strategies.push('JWT');
    }
    if (scopeText.includes('2fa') || scopeText.includes('mfa')) {
      strategies.push('Multi-Factor Authentication');
    }

    // Default if none specified
    if (strategies.length === 0) {
      strategies.push('Username/Password with JWT');
    }

    return strategies;
  }

  identifyAuthorizationStrategy(scopeText) {
    if (scopeText.includes('rbac') || scopeText.includes('role')) {
      return 'Role-Based Access Control (RBAC)';
    } else if (scopeText.includes('abac') || scopeText.includes('attribute')) {
      return 'Attribute-Based Access Control (ABAC)';
    } else {
      return 'Simple Permission-Based';
    }
  }

  identifyDataProtection(scopeText) {
    const protection = {
      encryption: {
        atRest: true, // Always recommended
        inTransit: true, // Always required
        algorithm: 'AES-256'
      },
      hashing: {
        passwords: true,
        algorithm: 'bcrypt'
      }
    };

    if (scopeText.includes('sensitive') || scopeText.includes('personal')) {
      protection.encryption.fieldLevel = true;
      protection.keyManagement = 'HSM/KMS';
    }

    return protection;
  }

  identifyNetworkSecurity(scopeText) {
    return {
      https: true, // Always required
      waf: scopeText.includes('security') || scopeText.includes('enterprise'),
      ddos: scopeText.includes('protection') || scopeText.includes('enterprise'),
      vpc: scopeText.includes('private') || scopeText.includes('enterprise')
    };
  }

  identifySecurityMonitoring(scopeText) {
    return {
      siem: scopeText.includes('enterprise') || scopeText.includes('security'),
      logging: true, // Always required
      alerting: true, // Always required
      penetrationTesting: scopeText.includes('security') || scopeText.includes('compliance')
    };
  }

  identifySecurityCompliance(scopeText) {
    const frameworks = [];

    if (scopeText.includes('iso')) frameworks.push('ISO 27001');
    if (scopeText.includes('nist')) frameworks.push('NIST');
    if (scopeText.includes('gdpr')) frameworks.push('GDPR');
    if (scopeText.includes('pci')) frameworks.push('PCI DSS');

    return frameworks;
  }

  calculateArchitecturalComplexity(patterns, components) {
    const patternComplexity = patterns.reduce((sum, pattern) => {
      const scores = { 'Monolithic': 1, 'Microservices': 3, 'Event-Driven': 2, 'Serverless': 2 };
      return sum + (scores[pattern.pattern.split(' ')[0]] || 1);
    }, 0);

    const componentComplexity = components.reduce((sum, component) => {
      const scores = { low: 1, medium: 2, high: 3 };
      return sum + scores[component.complexity];
    }, 0);

    return Math.round((patternComplexity + componentComplexity) / (patterns.length + components.length) * 10) / 10;
  }

  calculateTechnologyDiversity(stack) {
    const totalTech = Object.values(stack).reduce((sum, category) => sum + category.length, 0);
    return Math.min(totalTech / 10, 1.0); // Normalize to 0-1 scale
  }

  mapDependencies(functionalDecomposition, technicalArchitecture, depth) {
    const dependencies = {
      functional: this.mapFunctionalDependencies(functionalDecomposition),
      technical: this.mapTechnicalDependencies(technicalArchitecture),
      crossCutting: this.mapCrossCuttingDependencies(functionalDecomposition, technicalArchitecture)
    };

    if (depth === 'deep') {
      dependencies.external = this.mapExternalDependencies(functionalDecomposition, technicalArchitecture);
      dependencies.data = this.mapDataDependencies(functionalDecomposition, technicalArchitecture);
    }

    return dependencies;
  }

  mapFunctionalDependencies(functionalDecomposition) {
    const dependencies = [];
    const { components } = functionalDecomposition;

    components.forEach(component => {
      component.dependencies.forEach(depName => {
        const depComponent = components.find(c => c.name === depName);
        if (depComponent) {
          dependencies.push({
            from: component.name,
            to: depComponent.name,
            type: 'functional',
            relationship: 'depends_on',
            criticality: this.calculateDependencyCriticality(component, depComponent),
            description: `${component.name} requires ${depComponent.name} to function`
          });
        }
      });
    });

    return dependencies;
  }

  mapTechnicalDependencies(technicalArchitecture) {
    const dependencies = [];
    const { components } = technicalArchitecture;

    // Common technical dependencies
    const appServer = components.find(c => c.name === 'Application Server');
    const database = components.find(c => c.name === 'Database');

    if (appServer && database) {
      dependencies.push({
        from: appServer.name,
        to: database.name,
        type: 'technical',
        relationship: 'connects_to',
        criticality: 'high',
        description: 'Application server requires database connectivity'
      });
    }

    // Load balancer dependencies
    const loadBalancer = components.find(c => c.name === 'Load Balancer');
    if (loadBalancer && appServer) {
      dependencies.push({
        from: loadBalancer.name,
        to: appServer.name,
        type: 'technical',
        relationship: 'routes_to',
        criticality: 'high',
        description: 'Load balancer routes traffic to application servers'
      });
    }

    // Cache dependencies
    const cache = components.find(c => c.name === 'Cache Layer');
    if (cache && appServer) {
      dependencies.push({
        from: appServer.name,
        to: cache.name,
        type: 'technical',
        relationship: 'uses',
        criticality: 'medium',
        description: 'Application server uses cache for performance'
      });
    }

    return dependencies;
  }

  mapCrossCuttingDependencies(functionalDecomposition, technicalArchitecture) {
    const dependencies = [];
    const functionalComponents = functionalDecomposition.components;
    const technicalComponents = technicalArchitecture.components;

    // Map functional components to technical components
    functionalComponents.forEach(funcComp => {
      if (funcComp.name.includes('Authentication')) {
        const appServer = technicalComponents.find(c => c.name === 'Application Server');
        if (appServer) {
          dependencies.push({
            from: funcComp.name,
            to: appServer.name,
            type: 'cross_cutting',
            relationship: 'implemented_by',
            criticality: 'high',
            description: `${funcComp.name} is implemented by ${appServer.name}`
          });
        }
      }

      if (funcComp.name.includes('Search')) {
        const searchEngine = technicalComponents.find(c => c.name === 'Search Engine');
        if (searchEngine) {
          dependencies.push({
            from: funcComp.name,
            to: searchEngine.name,
            type: 'cross_cutting',
            relationship: 'implemented_by',
            criticality: 'medium',
            description: `${funcComp.name} is implemented by ${searchEngine.name}`
          });
        }
      }
    });

    return dependencies;
  }

  mapExternalDependencies(functionalDecomposition, technicalArchitecture) {
    const dependencies = [];

    // Payment gateway dependencies
    if (functionalDecomposition.components.some(c => c.name.includes('Payment'))) {
      dependencies.push({
        from: 'Payment Processing',
        to: 'Payment Gateway (Stripe/PayPal)',
        type: 'external',
        relationship: 'integrates_with',
        criticality: 'high',
        description: 'Payment processing requires external payment gateway'
      });
    }

    // Email service dependencies
    if (functionalDecomposition.components.some(c => c.name.includes('Notification'))) {
      dependencies.push({
        from: 'Notification System',
        to: 'Email Service (SendGrid)',
        type: 'external',
        relationship: 'uses',
        criticality: 'medium',
        description: 'Notifications require external email service'
      });
    }

    // Cloud infrastructure dependencies
    if (technicalArchitecture.infrastructure.hosting.type === 'cloud') {
      dependencies.push({
        from: 'Application Infrastructure',
        to: `${technicalArchitecture.infrastructure.hosting.provider.toUpperCase()} Cloud Services`,
        type: 'external',
        relationship: 'hosted_on',
        criticality: 'high',
        description: 'Application depends on cloud infrastructure'
      });
    }

    return dependencies;
  }

  mapDataDependencies(functionalDecomposition, technicalArchitecture) {
    const dependencies = [];
    const dataComponents = technicalArchitecture.dataArchitecture.storage;

    functionalDecomposition.components.forEach(funcComp => {
      // Most functional components depend on primary database
      const primaryDb = dataComponents.find(storage => storage.type === 'Primary Database');
      if (primaryDb) {
        dependencies.push({
          from: funcComp.name,
          to: primaryDb.type,
          type: 'data',
          relationship: 'reads_writes',
          criticality: 'high',
          description: `${funcComp.name} reads and writes data to primary database`
        });
      }

      // Search components depend on search engine
      if (funcComp.name.includes('Search')) {
        const searchStorage = dataComponents.find(storage => storage.purpose.includes('search'));
        if (searchStorage) {
          dependencies.push({
            from: funcComp.name,
            to: searchStorage.type,
            type: 'data',
            relationship: 'queries',
            criticality: 'high',
            description: `${funcComp.name} queries search engine for data`
          });
        }
      }
    });

    return dependencies;
  }

  calculateDependencyCriticality(fromComponent, toComponent) {
    const priorityScores = { high: 3, medium: 2, low: 1 };
    const fromScore = priorityScores[fromComponent.priority] || 2;
    const toScore = priorityScores[toComponent.priority] || 2;
    
    const avgScore = (fromScore + toScore) / 2;
    
    if (avgScore >= 2.5) return 'high';
    if (avgScore >= 1.5) return 'medium';
    return 'low';
  }

  assessRisks(requirements, dependencyMapping) {
    const risks = [];
    
    // Technical complexity risks
    const technicalComplexity = this.assessTechnicalComplexityRisk(requirements);
    if (technicalComplexity.level !== 'low') {
      risks.push(technicalComplexity);
    }

    // Dependency risks
    const dependencyRisks = this.assessDependencyRisks(dependencyMapping);
    risks.push(...dependencyRisks);

    // External integration risks
    const externalRisks = this.assessExternalIntegrationRisks(dependencyMapping);
    risks.push(...externalRisks);

    // Scale and performance risks
    const scaleRisks = this.assessScaleRisks(requirements);
    if (scaleRisks.level !== 'low') {
      risks.push(scaleRisks);
    }

    // Security risks
    const securityRisks = this.assessSecurityRisks(requirements);
    risks.push(...securityRisks);

    // Timeline and resource risks
    const resourceRisks = this.assessResourceRisks(requirements);
    if (resourceRisks.level !== 'low') {
      risks.push(resourceRisks);
    }

    return {
      risks,
      summary: {
        total: risks.length,
        high: risks.filter(r => r.level === 'high').length,
        medium: risks.filter(r => r.level === 'medium').length,
        low: risks.filter(r => r.level === 'low').length
      },
      overallRiskLevel: this.calculateOverallRiskLevel(risks)
    };
  }

  assessTechnicalComplexityRisk(requirements) {
    const scopeText = requirements.toLowerCase();
    
    let complexityScore = 0;
    const complexityFactors = [];

    if (scopeText.includes('microservice') || scopeText.includes('distributed')) {
      complexityScore += 3;
      complexityFactors.push('Distributed architecture');
    }
    if (scopeText.includes('real-time') || scopeText.includes('websocket')) {
      complexityScore += 2;
      complexityFactors.push('Real-time communication');
    }
    if (scopeText.includes('ai') || scopeText.includes('machine learning')) {
      complexityScore += 3;
      complexityFactors.push('AI/ML components');
    }
    if (scopeText.includes('blockchain') || scopeText.includes('crypto')) {
      complexityScore += 3;
      complexityFactors.push('Blockchain technology');
    }

    let level = 'low';
    if (complexityScore >= 5) level = 'high';
    else if (complexityScore >= 3) level = 'medium';

    return {
      type: 'Technical Complexity',
      level,
      probability: 'medium',
      impact: level === 'high' ? 'Significant development delays and technical debt' : 'Moderate development challenges',
      factors: complexityFactors,
      mitigation: 'Prototype complex components early, invest in team training, consider phased implementation'
    };
  }

  assessDependencyRisks(dependencyMapping) {
    const risks = [];
    const allDependencies = [
      ...dependencyMapping.functional,
      ...dependencyMapping.technical,
      ...dependencyMapping.crossCutting
    ];

    // Check for circular dependencies
    const circularDeps = this.findCircularDependencies(allDependencies);
    if (circularDeps.length > 0) {
      risks.push({
        type: 'Circular Dependencies',
        level: 'high',
        probability: 'high',
        impact: 'System design issues, difficult testing and deployment',
        factors: circularDeps,
        mitigation: 'Redesign architecture to eliminate circular dependencies'
      });
    }

    // Check for single points of failure
    const criticalDependencies = allDependencies.filter(dep => dep.criticality === 'high');
    if (criticalDependencies.length > 5) {
      risks.push({
        type: 'High Dependency Coupling',
        level: 'medium',
        probability: 'medium',
        impact: 'Changes in one component affect many others',
        factors: [`${criticalDependencies.length} high-criticality dependencies`],
        mitigation: 'Reduce coupling, implement proper interfaces and abstractions'
      });
    }

    return risks;
  }

  findCircularDependencies(dependencies) {
    const graph = new Map();
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    // Build dependency graph
    dependencies.forEach(dep => {
      if (!graph.has(dep.from)) graph.set(dep.from, []);
      graph.get(dep.from).push(dep.to);
    });

    // DFS to find cycles
    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat(node));
        }
        return;
      }
      
      if (visited.has(node)) return;
      
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const neighbors = graph.get(node) || [];
      neighbors.forEach(neighbor => dfs(neighbor, [...path]));
      
      recursionStack.delete(node);
    };

    graph.keys().forEach(node => dfs(node));
    
    return cycles;
  }

  assessExternalIntegrationRisks(dependencyMapping) {
    const risks = [];
    const externalDeps = dependencyMapping.external || [];

    if (externalDeps.length === 0) return risks;

    // High number of external dependencies
    if (externalDeps.length > 3) {
      risks.push({
        type: 'Multiple External Dependencies',
        level: 'medium',
        probability: 'medium',
        impact: 'Increased maintenance overhead and potential service disruptions',
        factors: [`${externalDeps.length} external dependencies`],
        mitigation: 'Implement circuit breakers, fallback mechanisms, and SLA monitoring'
      });
    }

    // Critical external dependencies
    const criticalExternalDeps = externalDeps.filter(dep => dep.criticality === 'high');
    if (criticalExternalDeps.length > 0) {
      risks.push({
        type: 'Critical External Dependencies',
        level: 'high',
        probability: 'low',
        impact: 'Service outages if external dependencies fail',
        factors: criticalExternalDeps.map(dep => dep.to),
        mitigation: 'Implement redundancy, caching, and graceful degradation'
      });
    }

    return risks;
  }

  assessScaleRisks(requirements) {
    const scopeText = requirements.toLowerCase();
    
    let scaleScore = 0;
    const scaleFactors = [];

    if (scopeText.includes('million') || scopeText.includes('massive')) {
      scaleScore += 3;
      scaleFactors.push('Large user base expected');
    }
    if (scopeText.includes('global') || scopeText.includes('worldwide')) {
      scaleScore += 2;
      scaleFactors.push('Global distribution required');
    }
    if (scopeText.includes('real-time') && scopeText.includes('concurrent')) {
      scaleScore += 2;
      scaleFactors.push('High concurrency with real-time requirements');
    }

    let level = 'low';
    if (scaleScore >= 4) level = 'high';
    else if (scaleScore >= 2) level = 'medium';

    return {
      type: 'Scalability Challenges',
      level,
      probability: 'medium',
      impact: level === 'high' ? 'Performance degradation and system instability' : 'Performance issues under load',
      factors: scaleFactors,
      mitigation: 'Load testing, horizontal scaling architecture, performance monitoring'
    };
  }

  assessSecurityRisks(requirements) {
    const risks = [];
    const scopeText = requirements.toLowerCase();

    // Authentication and authorization risks
    if (scopeText.includes('auth') || scopeText.includes('user')) {
      risks.push({
        type: 'Authentication Security',
        level: 'medium',
        probability: 'medium',
        impact: 'Unauthorized access to user accounts',
        factors: ['User authentication system'],
        mitigation: 'Implement strong password policies, MFA, and secure session management'
      });
    }

    // Payment processing risks
    if (scopeText.includes('payment') || scopeText.includes('billing')) {
      risks.push({
        type: 'Payment Security',
        level: 'high',
        probability: 'low',
        impact: 'Financial data breach and regulatory violations',
        factors: ['Payment processing functionality'],
        mitigation: 'PCI DSS compliance, tokenization, and secure payment gateway integration'
      });
    }

    // Personal data risks
    if (scopeText.includes('personal') || scopeText.includes('profile')) {
      risks.push({
        type: 'Data Privacy',
        level: 'medium',
        probability: 'medium',
        impact: 'Privacy violations and regulatory fines',
        factors: ['Personal data processing'],
        mitigation: 'GDPR compliance, data encryption, and privacy by design'
      });
    }

    // API security risks
    if (scopeText.includes('api') || scopeText.includes('integration')) {
      risks.push({
        type: 'API Security',
        level: 'medium',
        probability: 'medium',
        impact: 'Unauthorized data access through API vulnerabilities',
        factors: ['Public API endpoints'],
        mitigation: 'API authentication, rate limiting, and input validation'
      });
    }

    return risks;
  }

  assessResourceRisks(requirements) {
    const scopeText = requirements.toLowerCase();
    
    let riskScore = 0;
    const riskFactors = [];

    // Check for ambitious timelines
    if (scopeText.includes('urgent') || scopeText.includes('asap')) {
      riskScore += 2;
      riskFactors.push('Urgent timeline requirements');
    }

    // Check for complex technologies
    if (scopeText.includes('ai') || scopeText.includes('blockchain') || scopeText.includes('microservice')) {
      riskScore += 2;
      riskFactors.push('Complex technologies requiring specialized skills');
    }

    // Check for integration complexity
    if (scopeText.includes('legacy') || scopeText.includes('migration')) {
      riskScore += 1;
      riskFactors.push('Legacy system integration challenges');
    }

    let level = 'low';
    if (riskScore >= 3) level = 'high';
    else if (riskScore >= 2) level = 'medium';

    return {
      type: 'Resource and Timeline',
      level,
      probability: 'medium',
      impact: level === 'high' ? 'Project delays and budget overruns' : 'Minor delays and resource constraints',
      factors: riskFactors,
      mitigation: 'Realistic timeline planning, team skill development, and phased delivery approach'
    };
  }

  calculateOverallRiskLevel(risks) {
    const riskScores = { low: 1, medium: 2, high: 3 };
    const totalScore = risks.reduce((sum, risk) => sum + riskScores[risk.level], 0);
    const averageScore = totalScore / risks.length;

    if (averageScore >= 2.5) return 'high';
    if (averageScore >= 1.5) return 'medium';
    return 'low';
  }

  estimateEffort(functionalDecomposition, technicalArchitecture, depth) {
    const functional = this.estimateFunctionalEffort(functionalDecomposition);
    const technical = this.estimateTechnicalEffort(technicalArchitecture);
    const integration = this.estimateIntegrationEffort(functionalDecomposition, technicalArchitecture);
    const testing = this.estimateTestingEffort(functional, technical, depth);
    const deployment = this.estimateDeploymentEffort(technicalArchitecture, depth);

    const total = functional.total + technical.total + integration.total + testing.total + deployment.total;

    return {
      functional,
      technical,
      integration,
      testing,
      deployment,
      total,
      confidence: this.calculateEffortConfidence(depth, functionalDecomposition, technicalArchitecture),
      breakdown: this.createEffortBreakdown(functional, technical, integration, testing, deployment)
    };
  }

  estimateFunctionalEffort(functionalDecomposition) {
    const { components, userStories } = functionalDecomposition;
    
    const componentEffort = components.reduce((sum, component) => {
      const complexityMultipliers = { low: 2, medium: 5, high: 8 };
      return sum + complexityMultipliers[component.complexity];
    }, 0);

    const storyEffort = userStories.reduce((sum, story) => {
      const complexityMultipliers = { low: 1, medium: 3, high: 5 };
      return sum + complexityMultipliers[story.complexity];
    }, 0);

    return {
      components: componentEffort,
      stories: storyEffort,
      total: componentEffort + Math.ceil(storyEffort * 0.3), // Stories overlap with components
      breakdown: {
        core: Math.ceil(componentEffort * 0.6),
        features: Math.ceil(componentEffort * 0.4),
        userExperience: storyEffort
      }
    };
  }

  estimateTechnicalEffort(technicalArchitecture) {
    const { components, infrastructure } = technicalArchitecture;
    
    const componentEffort = components.reduce((sum, component) => {
      const complexityMultipliers = { low: 1, medium: 3, high: 5 };
      return sum + complexityMultipliers[component.complexity];
    }, 0);

    const infrastructureEffort = this.estimateInfrastructureEffort(infrastructure);

    return {
      components: componentEffort,
      infrastructure: infrastructureEffort,
      total: componentEffort + infrastructureEffort,
      breakdown: {
        backend: Math.ceil(componentEffort * 0.4),
        database: Math.ceil(componentEffort * 0.2),
        infrastructure: infrastructureEffort,
        devops: Math.ceil(componentEffort * 0.2)
      }
    };
  }

  estimateInfrastructureEffort(infrastructure) {
    let effort = 5; // Base infrastructure setup

    // Scaling complexity
    if (infrastructure.scaling?.autoScaling) effort += 2;
    if (infrastructure.scaling?.anticipated === 'high') effort += 3;

    // Availability requirements
    if (infrastructure.availability?.target === '99.99%') effort += 3;
    else if (infrastructure.availability?.target === '99.9%') effort += 1;

    // Security requirements
    effort += infrastructure.security?.length || 2;

    // Multi-region complexity
    if (infrastructure.hosting?.multiRegion) effort += 3;

    return effort;
  }

  estimateIntegrationEffort(functionalDecomposition, technicalArchitecture) {
    const functionalComponents = functionalDecomposition.components;
    const technicalComponents = technicalArchitecture.components;
    
    // API integrations
    let apiEffort = 0;
    if (functionalComponents.some(c => c.type === 'integration')) {
      apiEffort = functionalComponents.filter(c => c.type === 'integration').length * 3;
    }

    // Internal component integration
    const internalIntegrations = functionalComponents.length * technicalComponents.length * 0.1;
    
    // External service integrations
    const externalIntegrations = technicalArchitecture.infrastructure?.security?.length || 0;

    return {
      api: apiEffort,
      internal: Math.ceil(internalIntegrations),
      external: externalIntegrations * 2,
      total: apiEffort + Math.ceil(internalIntegrations) + (externalIntegrations * 2)
    };
  }

  estimateTestingEffort(functional, technical, depth) {
    const baseEffort = (functional.total + technical.total) * 0.3; // 30% of development effort
    
    let multiplier = 1;
    if (depth === 'deep') multiplier = 1.2;
    else if (depth === 'shallow') multiplier = 0.8;

    return {
      unit: Math.ceil(baseEffort * 0.4 * multiplier),
      integration: Math.ceil(baseEffort * 0.3 * multiplier),
      e2e: Math.ceil(baseEffort * 0.2 * multiplier),
      performance: Math.ceil(baseEffort * 0.1 * multiplier),
      total: Math.ceil(baseEffort * multiplier)
    };
  }

  estimateDeploymentEffort(technicalArchitecture, depth) {
    let baseEffort = 3; // Basic deployment setup

    // Infrastructure complexity
    if (technicalArchitecture.components.length > 5) baseEffort += 2;
    if (technicalArchitecture.infrastructure.hosting?.multiRegion) baseEffort += 3;

    // CI/CD complexity
    if (depth === 'deep') baseEffort += 2;

    return {
      cicd: Math.ceil(baseEffort * 0.5),
      infrastructure: Math.ceil(baseEffort * 0.3),
      monitoring: Math.ceil(baseEffort * 0.2),
      total: baseEffort
    };
  }

  calculateEffortConfidence(depth, functionalDecomposition, technicalArchitecture) {
    let confidence = 0.7; // Base confidence

    // Adjust based on analysis depth
    if (depth === 'deep') confidence += 0.2;
    else if (depth === 'shallow') confidence -= 0.2;

    // Adjust based on complexity
    const totalComponents = functionalDecomposition.components.length + technicalArchitecture.components.length;
    if (totalComponents < 10) confidence += 0.1;
    else if (totalComponents > 20) confidence -= 0.1;

    // Adjust based on technology familiarity
    const hasComplexTech = technicalArchitecture.components.some(c => c.complexity === 'high');
    if (hasComplexTech) confidence -= 0.1;

    return Math.max(0.3, Math.min(0.9, confidence)); // Keep between 30% and 90%
  }

  createEffortBreakdown(functional, technical, integration, testing, deployment) {
    const total = functional.total + technical.total + integration.total + testing.total + deployment.total;
    
    return {
      phases: [
        { phase: 'Functional Development', effort: functional.total, percentage: Math.round((functional.total / total) * 100) },
        { phase: 'Technical Implementation', effort: technical.total, percentage: Math.round((technical.total / total) * 100) },
        { phase: 'Integration', effort: integration.total, percentage: Math.round((integration.total / total) * 100) },
        { phase: 'Testing', effort: testing.total, percentage: Math.round((testing.total / total) * 100) },
        { phase: 'Deployment', effort: deployment.total, percentage: Math.round((deployment.total / total) * 100) }
      ],
      categories: [
        { category: 'Frontend', effort: functional.breakdown.userExperience, percentage: Math.round((functional.breakdown.userExperience / total) * 100) },
        { category: 'Backend', effort: technical.breakdown.backend, percentage: Math.round((technical.breakdown.backend / total) * 100) },
        { category: 'Database', effort: technical.breakdown.database, percentage: Math.round((technical.breakdown.database / total) * 100) },
        { category: 'DevOps', effort: deployment.total, percentage: Math.round((deployment.total / total) * 100) }
      ]
    };
  }

  createProjectTimeline(functionalDecomposition, effortEstimation) {
    const totalEffort = effortEstimation.total;
    const teamSize = this.estimateTeamSize(functionalDecomposition, effortEstimation);
    const workingDaysPerWeek = 5;
    const hoursPerDay = 6; // Accounting for meetings, planning, etc.
    const pointsPerDay = 1; // Assuming 1 story point = 1 day

    const estimatedDays = Math.ceil(totalEffort / (teamSize * pointsPerDay));
    const estimatedWeeks = Math.ceil(estimatedDays / workingDaysPerWeek);

    const phases = this.createTimelinePhases(effortEstimation, estimatedWeeks);
    const milestones = this.createTimelineMilestones(phases);

    return {
      totalEffort,
      teamSize,
      estimatedDays,
      estimatedWeeks,
      phases,
      milestones,
      assumptions: {
        teamSize: `${teamSize} developers working full-time`,
        productivity: '1 story point per developer per day',
        workingDays: `${workingDaysPerWeek} days per week`,
        overhead: 'Includes 20% overhead for meetings and planning'
      },
      risks: this.identifyTimelineRisks(estimatedWeeks, totalEffort)
    };
  }

  estimateTeamSize(functionalDecomposition, effortEstimation) {
    const totalEffort = effortEstimation.total;
    const complexity = functionalDecomposition.metrics.averageComplexity;

    // Base team size calculation
    let teamSize = 2; // Minimum team size

    if (totalEffort > 100) teamSize = 5;
    else if (totalEffort > 50) teamSize = 4;
    else if (totalEffort > 20) teamSize = 3;

    // Adjust for complexity
    if (complexity >= 2.5) teamSize += 1;

    return Math.min(teamSize, 8); // Cap at 8 to avoid communication overhead
  }

  createTimelinePhases(effortEstimation, totalWeeks) {
    const phases = [
      {
        name: 'Planning & Setup',
        weeks: Math.max(1, Math.ceil(totalWeeks * 0.1)),
        effort: effortEstimation.deployment.total * 0.3,
        deliverables: ['Project setup', 'Architecture design', 'Development environment']
      },
      {
        name: 'Core Development',
        weeks: Math.ceil(totalWeeks * 0.5),
        effort: effortEstimation.functional.total + effortEstimation.technical.total * 0.7,
        deliverables: ['Core functionality', 'API implementation', 'Database setup']
      },
      {
        name: 'Integration',
        weeks: Math.ceil(totalWeeks * 0.2),
        effort: effortEstimation.integration.total,
        deliverables: ['Component integration', 'External service integration', 'End-to-end functionality']
      },
      {
        name: 'Testing & Polish',
        weeks: Math.ceil(totalWeeks * 0.15),
        effort: effortEstimation.testing.total,
        deliverables: ['Comprehensive testing', 'Bug fixes', 'Performance optimization']
      },
      {
        name: 'Deployment',
        weeks: Math.max(1, Math.ceil(totalWeeks * 0.05)),
        effort: effortEstimation.deployment.total * 0.7,
        deliverables: ['Production deployment', 'Monitoring setup', 'Documentation']
      }
    ];

    // Adjust weeks to match total
    const totalPhaseWeeks = phases.reduce((sum, phase) => sum + phase.weeks, 0);
    if (totalPhaseWeeks !== totalWeeks) {
      const adjustment = totalWeeks - totalPhaseWeeks;
      phases[1].weeks += adjustment; // Adjust core development phase
    }

    return phases;
  }

  createTimelineMilestones(phases) {
    const milestones = [];
    let currentWeek = 0;

    phases.forEach(phase => {
      currentWeek += phase.weeks;
      milestones.push({
        name: `${phase.name} Complete`,
        week: currentWeek,
        deliverables: phase.deliverables,
        criteria: [
          'All phase deliverables completed',
          'Quality gates passed',
          'Stakeholder review completed'
        ]
      });
    });

    return milestones;
  }

  identifyTimelineRisks(estimatedWeeks, totalEffort) {
    const risks = [];

    if (estimatedWeeks > 26) { // More than 6 months
      risks.push({
        risk: 'Long Timeline',
        impact: 'Increased risk of scope creep and changing requirements',
        mitigation: 'Break project into smaller phases with regular deliveries'
      });
    }

    if (totalEffort > 100) { // Large project
      risks.push({
        risk: 'Large Scope',
        impact: 'Complexity may lead to underestimation and delays',
        mitigation: 'Add 20-30% buffer time and conduct regular scope reviews'
      });
    }

    if (estimatedWeeks < 8) { // Less than 2 months
      risks.push({
        risk: 'Aggressive Timeline',
        impact: 'Quality may be compromised to meet deadlines',
        mitigation: 'Prioritize features and consider MVP approach'
      });
    }

    return risks;
  }

  generateRecommendations(requirements, dependencyMapping, riskAssessment) {
    const recommendations = {
      architectural: this.generateArchitecturalRecommendations(requirements, dependencyMapping),
      technical: this.generateTechnicalRecommendations(requirements, riskAssessment),
      project: this.generateProjectRecommendations(requirements, riskAssessment),
      risk: this.generateRiskMitigationRecommendations(riskAssessment)
    };

    return {
      ...recommendations,
      prioritized: this.prioritizeRecommendations(recommendations),
      actionPlan: this.createActionPlan(recommendations)
    };
  }

  generateArchitecturalRecommendations(requirements, dependencyMapping) {
    const recommendations = [];
    const scopeText = requirements.toLowerCase();

    // Microservices vs Monolith
    if (scopeText.includes('scale') || scopeText.includes('team')) {
      recommendations.push({
        category: 'Architecture Pattern',
        recommendation: 'Consider microservices architecture for better scalability',
        reasoning: 'Large scale or multiple teams benefit from service separation',
        priority: 'medium',
        impact: 'Improved scalability and team autonomy'
      });
    } else {
      recommendations.push({
        category: 'Architecture Pattern',
        recommendation: 'Start with monolithic architecture for simplicity',
        reasoning: 'Simpler to develop, test, and deploy initially',
        priority: 'high',
        impact: 'Faster initial development and easier maintenance'
      });
    }

    // API-first approach
    if (scopeText.includes('mobile') || scopeText.includes('integration')) {
      recommendations.push({
        category: 'API Strategy',
        recommendation: 'Adopt API-first development approach',
        reasoning: 'Multiple clients and integrations require well-designed APIs',
        priority: 'high',
        impact: 'Better client support and integration capabilities'
      });
    }

    // Event-driven architecture
    if (scopeText.includes('real-time') || scopeText.includes('notification')) {
      recommendations.push({
        category: 'Communication Pattern',
        recommendation: 'Implement event-driven architecture for real-time features',
        reasoning: 'Real-time requirements benefit from asynchronous event processing',
        priority: 'medium',
        impact: 'Better real-time performance and system responsiveness'
      });
    }

    // Dependency reduction
    const highCouplingRisk = dependencyMapping.functional?.filter(dep => dep.criticality === 'high').length > 5;
    if (highCouplingRisk) {
      recommendations.push({
        category: 'Dependency Management',
        recommendation: 'Reduce component coupling through interface abstraction',
        reasoning: 'High number of critical dependencies increases maintenance complexity',
        priority: 'medium',
        impact: 'Improved maintainability and flexibility'
      });
    }

    return recommendations;
  }

  generateTechnicalRecommendations(requirements, riskAssessment) {
    const recommendations = [];
    const scopeText = requirements.toLowerCase();

    // Technology stack recommendations
    if (scopeText.includes('javascript') || scopeText.includes('node')) {
      recommendations.push({
        category: 'Technology Stack',
        recommendation: 'Use TypeScript instead of JavaScript for better maintainability',
        reasoning: 'Type safety reduces bugs and improves developer experience',
        priority: 'medium',
        impact: 'Reduced bugs and improved code quality'
      });
    }

    // Database recommendations
    if (scopeText.includes('scale') || scopeText.includes('performance')) {
      recommendations.push({
        category: 'Database Strategy',
        recommendation: 'Implement caching layer (Redis) for performance optimization',
        reasoning: 'High performance requirements benefit from caching',
        priority: 'medium',
        impact: 'Significant performance improvement'
      });
    }

    // Security recommendations
    const hasSecurityRisks = riskAssessment.risks.some(risk => risk.type.includes('Security'));
    if (hasSecurityRisks) {
      recommendations.push({
        category: 'Security',
        recommendation: 'Implement security-first development practices',
        reasoning: 'Security risks identified in analysis',
        priority: 'high',
        impact: 'Reduced security vulnerabilities'
      });
    }

    // Monitoring and observability
    recommendations.push({
      category: 'Observability',
      recommendation: 'Implement comprehensive monitoring and logging from day one',
      reasoning: 'Early visibility into system behavior prevents issues',
      priority: 'medium',
      impact: 'Better system reliability and debugging capabilities'
    });

    return recommendations;
  }

  generateProjectRecommendations(requirements, riskAssessment) {
    const recommendations = [];

    // Agile methodology
    recommendations.push({
      category: 'Methodology',
      recommendation: 'Use Agile development methodology with 2-week sprints',
      reasoning: 'Iterative development allows for regular feedback and adjustments',
      priority: 'high',
      impact: 'Better stakeholder alignment and risk management'
    });

    // MVP approach
    const highComplexity = riskAssessment.risks.some(risk => risk.type === 'Technical Complexity' && risk.level === 'high');
    if (highComplexity) {
      recommendations.push({
        category: 'Delivery Strategy',
        recommendation: 'Define and deliver Minimum Viable Product (MVP) first',
        reasoning: 'High complexity benefits from iterative approach',
        priority: 'high',
        impact: 'Faster time to market and reduced risk'
      });
    }

    // Documentation
    recommendations.push({
      category: 'Documentation',
      recommendation: 'Maintain comprehensive documentation throughout development',
      reasoning: 'Complex systems require good documentation for maintenance',
      priority: 'medium',
      impact: 'Improved team collaboration and knowledge transfer'
    });

    // Testing strategy
    recommendations.push({
      category: 'Quality Assurance',
      recommendation: 'Implement test-driven development (TDD) for critical components',
      reasoning: 'TDD improves code quality and reduces bugs',
      priority: 'medium',
      impact: 'Higher code quality and fewer production issues'
    });

    return recommendations;
  }

  generateRiskMitigationRecommendations(riskAssessment) {
    const recommendations = [];

    riskAssessment.risks.forEach(risk => {
      if (risk.level === 'high') {
        recommendations.push({
          category: 'Risk Mitigation',
          recommendation: `Address ${risk.type} risk: ${risk.mitigation}`,
          reasoning: `High-level risk with potential for ${risk.impact}`,
          priority: 'high',
          impact: 'Significant risk reduction'
        });
      }
    });

    // General risk management
    if (riskAssessment.summary.total > 5) {
      recommendations.push({
        category: 'Risk Management',
        recommendation: 'Establish regular risk review meetings',
        reasoning: 'Multiple risks identified requiring ongoing monitoring',
        priority: 'medium',
        impact: 'Proactive risk management'
      });
    }

    return recommendations;
  }

  prioritizeRecommendations(recommendations) {
    const allRecommendations = [
      ...recommendations.architectural,
      ...recommendations.technical,
      ...recommendations.project,
      ...recommendations.risk
    ];

    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return allRecommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 10); // Top 10 recommendations
  }

  createActionPlan(recommendations) {
    const prioritized = this.prioritizeRecommendations(recommendations);
    
    const phases = {
      immediate: prioritized.filter(r => r.priority === 'high').slice(0, 3),
      shortTerm: prioritized.filter(r => r.priority === 'medium').slice(0, 4),
      longTerm: prioritized.filter(r => r.priority === 'low' || r.priority === 'medium').slice(4, 7)
    };

    return {
      phases,
      timeline: {
        immediate: 'Weeks 1-2',
        shortTerm: 'Weeks 3-8',
        longTerm: 'Weeks 9+'
      },
      successMetrics: [
        'All high-priority recommendations implemented',
        'Risk levels reduced to acceptable levels',
        'Architecture decisions documented and approved',
        'Development practices established and followed'
      ]
    };
  }

  calculateComplexityScore(functionalDecomposition, technicalArchitecture) {
    const functionalScore = functionalDecomposition.metrics.averageComplexity * functionalDecomposition.components.length;
    const technicalScore = technicalArchitecture.metrics.architecturalComplexity * technicalArchitecture.components.length;
    
    return Math.round((functionalScore + technicalScore) / 10);
  }

  findCriticalPath(dependencyMapping) {
    const allDependencies = [
      ...dependencyMapping.functional,
      ...dependencyMapping.technical,
      ...dependencyMapping.crossCutting
    ];

    // Build dependency graph
    const graph = new Map();
    const inDegree = new Map();

    allDependencies.forEach(dep => {
      if (!graph.has(dep.from)) graph.set(dep.from, []);
      graph.get(dep.from).push(dep.to);
      
      inDegree.set(dep.to, (inDegree.get(dep.to) || 0) + 1);
      if (!inDegree.has(dep.from)) inDegree.set(dep.from, 0);
    });

    // Find nodes with no dependencies (starting points)
    const startNodes = Array.from(inDegree.entries())
      .filter(([node, degree]) => degree === 0)
      .map(([node]) => node);

    // Calculate longest path from each start node
    const paths = [];
    startNodes.forEach(startNode => {
      const path = this.findLongestPath(graph, startNode);
      if (path.length > 0) paths.push(path);
    });

    // Return longest path as critical path
    return paths.reduce((longest, current) => 
      current.length > longest.length ? current : longest, []);
  }

  findLongestPath(graph, startNode, visited = new Set(), path = []) {
    if (visited.has(startNode)) return path;
    
    visited.add(startNode);
    path.push(startNode);
    
    const neighbors = graph.get(startNode) || [];
    let longestPath = [...path];
    
    neighbors.forEach(neighbor => {
      const currentPath = this.findLongestPath(graph, neighbor, new Set(visited), [...path]);
      if (currentPath.length > longestPath.length) {
        longestPath = currentPath;
      }
    });
    
    return longestPath;
  }

  async outputAnalysis(analysis, options) {
    const format = options.format || 'markdown';
    
    switch (format) {
      case 'json':
        await this.outputJSON(analysis);
        break;
      case 'issues':
        // Issues will be created separately
        await this.outputMarkdown(analysis);
        break;
      case 'markdown':
      default:
        await this.outputMarkdown(analysis);
    }
  }

  async outputJSON(analysis) {
    console.log(chalk.yellow('\n📄 Analysis Output (JSON):\n'));
    console.log(JSON.stringify(analysis, null, 2));
  }

  async outputMarkdown(analysis) {
    console.log(chalk.yellow('\n📄 Scope Analysis Report:\n'));
    
    // Executive Summary
    console.log(chalk.white('## Executive Summary'));
    console.log(`**Project Type:** ${analysis.scopeIdentification.projectType}`);
    console.log(`**Complexity Score:** ${analysis.metadata.complexityScore}/10`);
    console.log(`**Total Components:** ${analysis.metadata.totalComponents}`);
    console.log(`**Overall Risk Level:** ${analysis.riskAssessment.overallRiskLevel.toUpperCase()}`);
    console.log(`**Estimated Effort:** ${analysis.effortEstimation.total} story points`);
    console.log(`**Timeline:** ${analysis.timeline.estimatedWeeks} weeks`);

    // Scope Identification
    console.log(chalk.white('\n## Scope Identification'));
    console.log(`**Description:** ${analysis.scopeIdentification.description}`);
    console.log(`**Business Domains:** ${analysis.scopeIdentification.businessDomains.slice(0, 3).map(d => d.domain).join(', ')}`);
    console.log(`**Scale:** ${analysis.scopeIdentification.scaleIndicators.overallScale}`);

    // Functional Overview
    console.log(chalk.white('\n## Functional Overview'));
    console.log(`**Functional Areas:** ${analysis.functionalDecomposition.functionalAreas.length}`);
    console.log(`**Components:** ${analysis.functionalDecomposition.components.length}`);
    console.log(`**User Stories:** ${analysis.functionalDecomposition.userStories.length}`);
    console.log(`**Average Complexity:** ${analysis.functionalDecomposition.metrics.averageComplexity}/3`);

    // Technical Architecture
    console.log(chalk.white('\n## Technical Architecture'));
    console.log(`**Components:** ${analysis.technicalArchitecture.components.length}`);
    console.log(`**Architectural Patterns:** ${analysis.technicalArchitecture.patterns.length}`);
    console.log(`**Data Strategy:** ${analysis.technicalArchitecture.dataArchitecture.strategy}`);

    // Risk Assessment
    console.log(chalk.white('\n## Risk Assessment'));
    console.log(`**Total Risks:** ${analysis.riskAssessment.summary.total}`);
    console.log(`**High Priority:** ${analysis.riskAssessment.summary.high}`);
    console.log(`**Medium Priority:** ${analysis.riskAssessment.summary.medium}`);
    
    if (analysis.riskAssessment.risks.length > 0) {
      console.log(chalk.white('\n### Top Risks:'));
      analysis.riskAssessment.risks.slice(0, 3).forEach(risk => {
        console.log(`- **${risk.type}** (${risk.level}): ${risk.impact}`);
      });
    }

    // Effort Estimation
    console.log(chalk.white('\n## Effort Estimation'));
    analysis.effortEstimation.breakdown.phases.forEach(phase => {
      console.log(`- **${phase.phase}:** ${phase.effort} points (${phase.percentage}%)`);
    });

    // Timeline
    console.log(chalk.white('\n## Timeline'));
    console.log(`**Team Size:** ${analysis.timeline.teamSize} developers`);
    console.log(`**Duration:** ${analysis.timeline.estimatedWeeks} weeks (${analysis.timeline.estimatedDays} days)`);
    
    console.log(chalk.white('\n### Phases:'));
    analysis.timeline.phases.forEach(phase => {
      console.log(`- **${phase.name}:** ${phase.weeks} weeks`);
    });

    // Top Recommendations
    console.log(chalk.white('\n## Key Recommendations'));
    analysis.recommendations.prioritized.slice(0, 5).forEach(rec => {
      console.log(`- **${rec.category}:** ${rec.recommendation}`);
    });

    // Critical Path
    if (analysis.metadata.criticalPath.length > 0) {
      console.log(chalk.white('\n## Critical Path'));
      console.log(`**Components:** ${analysis.metadata.criticalPath.join(' → ')}`);
    }

    console.log(chalk.gray('\n---'));
    console.log(chalk.gray(`*Analysis generated on ${new Date(analysis.metadata.analysisDate).toLocaleDateString()}*`));
    console.log(chalk.gray('*Powered by Flow State Dev Scope Analysis*'));
  }

  async createAnalysisIssues(analysis, options) {
    console.log(chalk.blue('\n🚀 Creating GitHub Issues from Analysis...\n'));
    
    let created = 0;
    let failed = 0;

    // Create epic issue for overall scope
    try {
      const epicIssue = this.createEpicIssueFromAnalysis(analysis, options);
      await this.createGitHubIssue(epicIssue);
      console.log(chalk.green(`✅ Created Epic: Scope Analysis - ${analysis.requirements}`));
      created++;
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create Epic: ${error.message}`));
      failed++;
    }

    // Create issues for functional components
    for (const component of analysis.functionalDecomposition.components) {
      try {
        const issueData = this.createComponentIssue(component, analysis, options);
        await this.createGitHubIssue(issueData);
        console.log(chalk.green(`✅ Created: ${component.name}`));
        created++;
        await this.sleep(300); // Rate limiting
      } catch (error) {
        console.log(chalk.red(`❌ Failed: ${component.name} - ${error.message}`));
        failed++;
      }
    }

    // Create issues for high-priority risks
    const highRisks = analysis.riskAssessment.risks.filter(risk => risk.level === 'high');
    for (const risk of highRisks) {
      try {
        const issueData = this.createRiskIssue(risk, analysis, options);
        await this.createGitHubIssue(issueData);
        console.log(chalk.green(`✅ Created Risk Issue: ${risk.type}`));
        created++;
        await this.sleep(300);
      } catch (error) {
        console.log(chalk.red(`❌ Failed Risk Issue: ${risk.type} - ${error.message}`));
        failed++;
      }
    }

    console.log(chalk.green(`\n📊 Issue Creation Summary:`));
    console.log(`  Created: ${chalk.green(created)}`);
    console.log(`  Failed: ${chalk.red(failed)}`);
    console.log(`  Total: ${created + failed}`);
  }

  createEpicIssueFromAnalysis(analysis, options) {
    const labels = ['epic', 'scope-analysis', 'planning'];
    if (options.labels) {
      labels.push(...options.labels.split(',').map(l => l.trim()));
    }

    const body = `# Scope Analysis Epic

## Overview
${analysis.scopeIdentification.description}

## Key Metrics
- **Complexity Score:** ${analysis.metadata.complexityScore}/10
- **Total Components:** ${analysis.metadata.totalComponents}
- **Estimated Effort:** ${analysis.effortEstimation.total} story points
- **Timeline:** ${analysis.timeline.estimatedWeeks} weeks
- **Risk Level:** ${analysis.riskAssessment.overallRiskLevel}

## Functional Areas
${analysis.functionalDecomposition.functionalAreas.map(area => `- ${area.name} (${area.priority} priority)`).join('\n')}

## Technical Components
${analysis.technicalArchitecture.components.map(comp => `- ${comp.name} (${comp.type})`).join('\n')}

## Key Risks
${analysis.riskAssessment.risks.slice(0, 3).map(risk => `- **${risk.type}** (${risk.level}): ${risk.impact}`).join('\n')}

## Critical Path
${analysis.metadata.criticalPath.join(' → ')}

---
*Generated by Flow State Dev scope analysis*`;

    return {
      title: `Epic: ${analysis.requirements}`,
      body,
      labels,
      milestone: options.milestone,
      assignees: options.assignee ? [options.assignee] : []
    };
  }

  createComponentIssue(component, analysis, options) {
    const labels = [
      'component',
      component.type || 'feature',
      component.priority,
      component.complexity
    ];

    if (options.labels) {
      labels.push(...options.labels.split(',').map(l => l.trim()));
    }

    const body = `## Description
${component.description}

## Component Details
- **Type:** ${component.type}
- **Complexity:** ${component.complexity}
- **Priority:** ${component.priority}

## Dependencies
${component.dependencies.length > 0 ? component.dependencies.map(dep => `- ${dep}`).join('\n') : 'None'}

## Acceptance Criteria
- [ ] Component implementation meets requirements
- [ ] Integration with dependent components works correctly
- [ ] Error handling is implemented
- [ ] Unit tests are written and passing
- [ ] Code review is completed

## Context
This component is part of the scope analysis for: ${analysis.requirements}

---
*Generated by Flow State Dev scope analysis*`;

    return {
      title: component.name,
      body,
      labels: labels.filter(Boolean),
      milestone: options.milestone,
      assignees: options.assignee ? [options.assignee] : []
    };
  }

  createRiskIssue(risk, analysis, options) {
    const labels = ['risk', risk.level, 'scope-analysis'];
    if (options.labels) {
      labels.push(...options.labels.split(',').map(l => l.trim()));
    }

    const body = `## Risk Description
${risk.impact}

## Risk Details
- **Type:** ${risk.type}
- **Level:** ${risk.level}
- **Probability:** ${risk.probability}

## Risk Factors
${risk.factors ? risk.factors.map(factor => `- ${factor}`).join('\n') : 'Not specified'}

## Mitigation Strategy
${risk.mitigation}

## Action Items
- [ ] Assess current risk exposure
- [ ] Implement primary mitigation measures
- [ ] Establish monitoring and early warning systems
- [ ] Document contingency plans
- [ ] Regular risk review meetings

## Context
This risk was identified during scope analysis for: ${analysis.requirements}

---
*Generated by Flow State Dev scope analysis*`;

    return {
      title: `Risk: ${risk.type}`,
      body,
      labels: labels.filter(Boolean),
      milestone: options.milestone,
      assignees: options.assignee ? [options.assignee] : []
    };
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

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}