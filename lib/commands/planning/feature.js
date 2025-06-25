/**
 * Feature Plan command - Complete feature planning from concept to implementation
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class FeaturePlanCommand extends GitHubSlashCommand {
  constructor() {
    super('/feature:plan', 'Complete feature planning from concept to implementation', {
      aliases: ['/feature:planning', '/plan:feature'],
      category: 'planning',
      usage: '/feature:plan [feature] [options]',
      examples: [
        'fsd slash "/feature:plan \'User authentication\'"',
        'fsd slash "/feature:plan \'Real-time notifications\' --timeline 4weeks"',
        'fsd slash "/feature:plan \'Product search\' --complexity simple --create-issues"',
        'fsd slash "/feature:plan \'Payment processing\' --complexity complex"'
      ],
      options: [
        { name: 'feature', type: 'string', description: 'Feature description or requirements', required: true },
        { name: 'create-issues', type: 'boolean', description: 'Create GitHub issues from plan' },
        { name: 'timeline', type: 'string', description: 'Target timeline (days/weeks)' },
        { name: 'complexity', type: 'string', description: 'Expected complexity (simple, medium, complex)', default: 'medium' },
        { name: 'milestone', type: 'string', description: 'Target milestone for issues' },
        { name: 'assignee', type: 'string', description: 'Default assignee for created issues' },
        { name: 'template', type: 'string', description: 'Planning template type', default: 'standard' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const feature = args?.[0] || options.feature;
    
    if (!feature) {
      console.log(chalk.blue('🎯 Feature Planning\n'));
      console.log(chalk.gray('Comprehensive feature planning from concept to implementation.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/feature:plan \'Feature description\'"'));
      console.log(chalk.gray('\nExample features:'));
      console.log(chalk.gray('  • "User authentication with social login"'));
      console.log(chalk.gray('  • "Real-time notifications system"'));
      console.log(chalk.gray('  • "Advanced product search and filtering"'));
      console.log(chalk.gray('  • "Multi-tenant dashboard"'));
      console.log(chalk.gray('\nComplexity levels:'));
      console.log(chalk.gray('  • simple: Basic CRUD, UI components'));
      console.log(chalk.gray('  • medium: APIs, integrations, moderate logic'));
      console.log(chalk.gray('  • complex: Real-time, ML, distributed systems'));
      return;
    }

    console.log(chalk.blue('🎯 Feature Planning Analysis\n'));
    console.log(chalk.white(`Feature: ${feature}\n`));

    try {
      // Perform comprehensive feature planning
      const plan = await this.createFeaturePlan(feature, options);
      
      // Display the complete plan
      this.displayFeaturePlan(plan);
      
      // Create issues if requested
      if (options['create-issues']) {
        await this.createPlanIssues(plan, options);
      } else if (plan.implementation.tasks.length > 0) {
        const shouldCreate = await this.confirm(
          `Create ${plan.implementation.tasks.length} GitHub issues from this feature plan?`,
          false
        );
        
        if (shouldCreate) {
          await this.createPlanIssues(plan, options);
        } else {
          console.log(chalk.gray('\n💡 To create issues later, run with --create-issues flag'));
        }
      }
      
    } catch (error) {
      this.log(`Failed to create feature plan: ${error.message}`, 'error');
    }
  }

  async createFeaturePlan(feature, options) {
    console.log(chalk.gray('Analyzing feature and creating comprehensive plan...\n'));
    
    const requirements = this.analyzeRequirements(feature, options);
    const architecture = this.designArchitecture(feature, requirements);
    const userExperience = this.planUserExperience(feature, requirements);
    const implementation = this.planImplementation(feature, requirements, architecture);
    const testing = this.planTesting(feature, implementation);
    const deployment = this.planDeployment(feature, requirements);
    const timeline = this.createTimeline(implementation, options);
    const risks = this.identifyFeatureRisks(feature, requirements, implementation);
    const success = this.defineSuccessMetrics(feature, requirements);
    
    return {
      feature,
      requirements,
      architecture,
      userExperience,
      implementation,
      testing,
      deployment,
      timeline,
      risks,
      success,
      options,
      metadata: {
        complexity: requirements.complexity,
        totalTasks: implementation.tasks.length,
        estimatedEffort: implementation.tasks.reduce((sum, task) => sum + task.effort, 0),
        phases: this.identifyPhases(implementation.tasks)
      }
    };
  }

  analyzeRequirements(feature, options) {
    const complexity = this.assessFeatureComplexity(feature, options.complexity);
    const functionalReqs = this.extractFunctionalRequirements(feature);
    const nonFunctionalReqs = this.extractNonFunctionalRequirements(feature, complexity);
    const constraints = this.identifyConstraints(feature);
    const assumptions = this.identifyAssumptions(feature);
    const stakeholders = this.identifyStakeholders(feature);
    
    return {
      feature,
      complexity,
      functional: functionalReqs,
      nonFunctional: nonFunctionalReqs,
      constraints,
      assumptions,
      stakeholders,
      acceptance: this.defineAcceptanceCriteria(functionalReqs)
    };
  }

  assessFeatureComplexity(feature, specifiedComplexity) {
    const featureText = feature.toLowerCase();
    
    const complexityIndicators = {
      simple: {
        keywords: ['display', 'show', 'list', 'basic', 'simple', 'static', 'form', 'button'],
        score: 1,
        description: 'Basic functionality with minimal logic'
      },
      medium: {
        keywords: ['create', 'edit', 'manage', 'filter', 'search', 'api', 'validation', 'auth'],
        score: 3,
        description: 'Moderate complexity with business logic'
      },
      complex: {
        keywords: ['real-time', 'integration', 'ai', 'ml', 'algorithm', 'distributed', 'performance', 'scale'],
        score: 5,
        description: 'High complexity with advanced features'
      }
    };

    // Use specified complexity if provided
    if (specifiedComplexity && complexityIndicators[specifiedComplexity]) {
      return {
        level: specifiedComplexity,
        ...complexityIndicators[specifiedComplexity],
        specified: true
      };
    }

    // Auto-detect complexity
    for (const [level, info] of Object.entries(complexityIndicators)) {
      if (info.keywords.some(keyword => featureText.includes(keyword))) {
        return {
          level,
          ...info,
          specified: false,
          detectedKeywords: info.keywords.filter(keyword => featureText.includes(keyword))
        };
      }
    }

    // Default to medium
    return {
      level: 'medium',
      ...complexityIndicators.medium,
      specified: false
    };
  }

  extractFunctionalRequirements(feature) {
    const requirements = [];
    const featureText = feature.toLowerCase();
    
    // Common functional requirement patterns
    const patterns = {
      authentication: {
        keywords: ['login', 'auth', 'sign in', 'register'],
        requirements: [
          'Users must be able to register with email and password',
          'Users must be able to log in with credentials',
          'Users must be able to log out securely',
          'System must validate user credentials',
          'Password reset functionality must be available'
        ]
      },
      search: {
        keywords: ['search', 'find', 'filter', 'query'],
        requirements: [
          'Users must be able to enter search terms',
          'System must return relevant results',
          'Results must be filterable and sortable',
          'Search must handle partial matches',
          'Search history should be maintained'
        ]
      },
      notifications: {
        keywords: ['notification', 'alert', 'message', 'email'],
        requirements: [
          'System must send notifications to users',
          'Users must be able to configure notification preferences',
          'Notifications must be delivered reliably',
          'Users must be able to view notification history',
          'System must handle notification failures gracefully'
        ]
      },
      payment: {
        keywords: ['payment', 'checkout', 'billing', 'transaction'],
        requirements: [
          'System must process payments securely',
          'Users must be able to select payment methods',
          'Transaction confirmations must be sent',
          'Failed payments must be handled appropriately',
          'Payment history must be maintained'
        ]
      }
    };

    // Match patterns and extract requirements
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.keywords.some(keyword => featureText.includes(keyword))) {
        requirements.push({
          category,
          requirements: pattern.requirements,
          priority: 'high'
        });
      }
    }

    // Add generic requirements if none matched
    if (requirements.length === 0) {
      requirements.push({
        category: 'core',
        requirements: [
          'Feature must function according to specifications',
          'User interface must be intuitive and responsive',
          'System must handle errors gracefully',
          'Feature must integrate with existing system'
        ],
        priority: 'high'
      });
    }

    return requirements;
  }

  extractNonFunctionalRequirements(feature, complexity) {
    const baseRequirements = [
      {
        category: 'Performance',
        requirements: [
          'Response time must be under 2 seconds',
          'System must handle concurrent users',
          'Database queries must be optimized'
        ],
        priority: complexity.score >= 3 ? 'high' : 'medium'
      },
      {
        category: 'Security',
        requirements: [
          'All data must be transmitted securely (HTTPS)',
          'User input must be validated and sanitized',
          'Authentication must be implemented properly'
        ],
        priority: 'high'
      },
      {
        category: 'Usability',
        requirements: [
          'Interface must be user-friendly',
          'Feature must be accessible (WCAG compliant)',
          'Error messages must be clear and helpful'
        ],
        priority: 'medium'
      },
      {
        category: 'Reliability',
        requirements: [
          'System must have 99.9% uptime',
          'Data integrity must be maintained',
          'System must recover gracefully from failures'
        ],
        priority: complexity.score >= 4 ? 'high' : 'medium'
      }
    ];

    const featureText = feature.toLowerCase();
    
    // Add specific requirements based on feature type
    if (featureText.includes('real-time') || featureText.includes('live')) {
      baseRequirements.push({
        category: 'Real-time',
        requirements: [
          'Updates must be delivered within 100ms',
          'System must handle connection drops gracefully',
          'WebSocket connections must be stable'
        ],
        priority: 'high'
      });
    }

    if (featureText.includes('mobile') || featureText.includes('responsive')) {
      baseRequirements.push({
        category: 'Mobile',
        requirements: [
          'Feature must work on mobile devices',
          'Touch interactions must be supported',
          'Performance must be optimized for mobile'
        ],
        priority: 'high'
      });
    }

    return baseRequirements;
  }

  identifyConstraints(feature) {
    const constraints = [];
    const featureText = feature.toLowerCase();
    
    // Technical constraints
    if (featureText.includes('legacy') || featureText.includes('existing')) {
      constraints.push({
        type: 'Technical',
        description: 'Must integrate with existing legacy systems',
        impact: 'May require additional compatibility layers'
      });
    }

    // Performance constraints
    if (featureText.includes('large') || featureText.includes('scale')) {
      constraints.push({
        type: 'Performance',
        description: 'Must handle large data volumes',
        impact: 'Requires optimization and efficient algorithms'
      });
    }

    // Security constraints
    if (featureText.includes('payment') || featureText.includes('sensitive') || featureText.includes('personal')) {
      constraints.push({
        type: 'Security',
        description: 'Must comply with security standards (PCI DSS, GDPR)',
        impact: 'Additional security measures and compliance checks required'
      });
    }

    // Default constraints
    constraints.push({
      type: 'Budget',
      description: 'Must be delivered within allocated resources',
      impact: 'May need to prioritize features for MVP'
    });

    return constraints;
  }

  identifyAssumptions(feature) {
    return [
      {
        assumption: 'Users have basic technical literacy',
        impact: 'UI design can assume familiarity with common patterns',
        validation: 'User testing and feedback'
      },
      {
        assumption: 'Required infrastructure is available',
        impact: 'Feature can be deployed without major infrastructure changes',
        validation: 'Infrastructure assessment'
      },
      {
        assumption: 'Dependencies will remain stable',
        impact: 'No major breaking changes in external services',
        validation: 'Regular dependency monitoring'
      }
    ];
  }

  identifyStakeholders(feature) {
    const featureText = feature.toLowerCase();
    const stakeholders = [
      {
        role: 'End Users',
        interest: 'Feature usability and value',
        influence: 'high',
        engagement: 'User testing and feedback'
      },
      {
        role: 'Product Manager',
        interest: 'Feature alignment with business goals',
        influence: 'high',
        engagement: 'Regular review meetings'
      },
      {
        role: 'Development Team',
        interest: 'Technical feasibility and maintainability',
        influence: 'high',
        engagement: 'Implementation planning and execution'
      }
    ];

    // Add specific stakeholders based on feature type
    if (featureText.includes('payment') || featureText.includes('security')) {
      stakeholders.push({
        role: 'Security Team',
        interest: 'Security compliance and risk management',
        influence: 'high',
        engagement: 'Security review and testing'
      });
    }

    if (featureText.includes('admin') || featureText.includes('management')) {
      stakeholders.push({
        role: 'System Administrators',
        interest: 'System maintainability and monitoring',
        influence: 'medium',
        engagement: 'Operational requirements gathering'
      });
    }

    return stakeholders;
  }

  defineAcceptanceCriteria(functionalReqs) {
    const criteria = [];
    
    functionalReqs.forEach(reqGroup => {
      reqGroup.requirements.forEach(req => {
        criteria.push({
          requirement: req,
          criteria: [
            'Feature implementation meets the requirement',
            'All edge cases are handled appropriately',
            'Error scenarios are managed gracefully',
            'Performance meets specified standards'
          ]
        });
      });
    });

    return criteria;
  }

  designArchitecture(feature, requirements) {
    const components = this.identifyComponents(feature, requirements);
    const dataFlow = this.designDataFlow(components);
    const apis = this.designAPIs(feature, components);
    const database = this.designDatabase(feature, components);
    const integration = this.identifyIntegrations(feature);
    
    return {
      components,
      dataFlow,
      apis,
      database,
      integration,
      patterns: this.selectArchitecturalPatterns(feature, requirements)
    };
  }

  identifyComponents(feature, requirements) {
    const components = [];
    const featureText = feature.toLowerCase();
    
    // Always include core components
    components.push({
      name: 'Frontend Component',
      type: 'UI',
      responsibilities: ['User interface', 'User interactions', 'Data display'],
      technology: 'React/Vue/Angular'
    });

    // Backend components based on feature
    if (featureText.includes('api') || requirements.complexity.score >= 2) {
      components.push({
        name: 'API Controller',
        type: 'Backend',
        responsibilities: ['Handle HTTP requests', 'Input validation', 'Response formatting'],
        technology: 'Node.js/Express'
      });

      components.push({
        name: 'Business Logic Service',
        type: 'Service',
        responsibilities: ['Core business logic', 'Data processing', 'Rule enforcement'],
        technology: 'Service layer'
      });
    }

    // Database components
    if (featureText.includes('data') || featureText.includes('store') || requirements.complexity.score >= 2) {
      components.push({
        name: 'Data Access Layer',
        type: 'Data',
        responsibilities: ['Database operations', 'Data mapping', 'Query optimization'],
        technology: 'ORM/Database driver'
      });
    }

    // Authentication components
    if (featureText.includes('auth') || featureText.includes('user')) {
      components.push({
        name: 'Authentication Service',
        type: 'Security',
        responsibilities: ['User authentication', 'Token management', 'Session handling'],
        technology: 'JWT/OAuth'
      });
    }

    // Real-time components
    if (featureText.includes('real-time') || featureText.includes('live')) {
      components.push({
        name: 'WebSocket Handler',
        type: 'Real-time',
        responsibilities: ['Real-time communication', 'Connection management', 'Message broadcasting'],
        technology: 'WebSocket/Socket.io'
      });
    }

    return components;
  }

  designDataFlow(components) {
    const flows = [];
    
    // Basic request-response flow
    flows.push({
      name: 'User Request Flow',
      steps: [
        'User interacts with Frontend Component',
        'Frontend sends request to API Controller',
        'API Controller validates input',
        'Business Logic Service processes request',
        'Data Access Layer retrieves/updates data',
        'Response flows back through layers',
        'Frontend updates UI'
      ],
      type: 'synchronous'
    });

    // Authentication flow if applicable
    const hasAuth = components.some(c => c.type === 'Security');
    if (hasAuth) {
      flows.push({
        name: 'Authentication Flow',
        steps: [
          'User provides credentials',
          'Authentication Service validates credentials',
          'Token is generated and returned',
          'Subsequent requests include token',
          'Token is validated on each request'
        ],
        type: 'security'
      });
    }

    // Real-time flow if applicable
    const hasRealTime = components.some(c => c.type === 'Real-time');
    if (hasRealTime) {
      flows.push({
        name: 'Real-time Update Flow',
        steps: [
          'Client establishes WebSocket connection',
          'Server sends updates when data changes',
          'Client receives and processes updates',
          'UI is updated in real-time'
        ],
        type: 'asynchronous'
      });
    }

    return flows;
  }

  designAPIs(feature, components) {
    const apis = [];
    const featureText = feature.toLowerCase();
    
    // Basic CRUD APIs
    if (components.some(c => c.type === 'Backend')) {
      const resourceName = this.extractResourceName(feature);
      
      apis.push({
        endpoint: `GET /${resourceName}`,
        method: 'GET',
        purpose: `Retrieve ${resourceName} list`,
        parameters: ['limit', 'offset', 'filter'],
        response: `Array of ${resourceName} objects`
      });

      apis.push({
        endpoint: `POST /${resourceName}`,
        method: 'POST',
        purpose: `Create new ${resourceName}`,
        parameters: ['body data'],
        response: `Created ${resourceName} object`
      });

      apis.push({
        endpoint: `PUT /${resourceName}/:id`,
        method: 'PUT',
        purpose: `Update ${resourceName}`,
        parameters: ['id', 'body data'],
        response: `Updated ${resourceName} object`
      });

      apis.push({
        endpoint: `DELETE /${resourceName}/:id`,
        method: 'DELETE',
        purpose: `Delete ${resourceName}`,
        parameters: ['id'],
        response: 'Success confirmation'
      });
    }

    // Authentication APIs
    if (featureText.includes('auth') || featureText.includes('login')) {
      apis.push({
        endpoint: 'POST /auth/login',
        method: 'POST',
        purpose: 'User authentication',
        parameters: ['email', 'password'],
        response: 'JWT token and user data'
      });

      apis.push({
        endpoint: 'POST /auth/logout',
        method: 'POST',
        purpose: 'User logout',
        parameters: ['token'],
        response: 'Success confirmation'
      });
    }

    return apis;
  }

  extractResourceName(feature) {
    const featureText = feature.toLowerCase();
    
    // Common resource patterns
    if (featureText.includes('user')) return 'users';
    if (featureText.includes('product')) return 'products';
    if (featureText.includes('order')) return 'orders';
    if (featureText.includes('message')) return 'messages';
    if (featureText.includes('notification')) return 'notifications';
    if (featureText.includes('comment')) return 'comments';
    if (featureText.includes('post')) return 'posts';
    if (featureText.includes('file')) return 'files';
    
    return 'items'; // Default generic resource
  }

  designDatabase(feature, components) {
    const hasDataLayer = components.some(c => c.type === 'Data');
    if (!hasDataLayer) {
      return { required: false };
    }

    const tables = this.identifyDatabaseTables(feature);
    const relationships = this.identifyRelationships(tables);
    const indexes = this.suggestIndexes(tables);
    
    return {
      required: true,
      type: 'relational', // Could be NoSQL based on requirements
      tables,
      relationships,
      indexes,
      migrations: this.planMigrations(tables)
    };
  }

  identifyDatabaseTables(feature) {
    const tables = [];
    const featureText = feature.toLowerCase();
    
    // User-related tables
    if (featureText.includes('user') || featureText.includes('auth')) {
      tables.push({
        name: 'users',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'] },
          { name: 'email', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'] },
          { name: 'password_hash', type: 'VARCHAR(255)', constraints: ['NOT NULL'] },
          { name: 'created_at', type: 'TIMESTAMP', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
          { name: 'updated_at', type: 'TIMESTAMP', constraints: ['DEFAULT CURRENT_TIMESTAMP'] }
        ]
      });
    }

    // Feature-specific main table
    const resourceName = this.extractResourceName(feature);
    if (resourceName !== 'users') {
      tables.push({
        name: resourceName,
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'] },
          { name: 'title', type: 'VARCHAR(255)', constraints: ['NOT NULL'] },
          { name: 'description', type: 'TEXT', constraints: [] },
          { name: 'status', type: 'VARCHAR(50)', constraints: ['DEFAULT \'active\''] },
          { name: 'created_at', type: 'TIMESTAMP', constraints: ['DEFAULT CURRENT_TIMESTAMP'] },
          { name: 'updated_at', type: 'TIMESTAMP', constraints: ['DEFAULT CURRENT_TIMESTAMP'] }
        ]
      });

      // Add user reference if users table exists
      if (tables.some(t => t.name === 'users')) {
        tables[tables.length - 1].columns.splice(-2, 0, {
          name: 'user_id', 
          type: 'UUID', 
          constraints: ['FOREIGN KEY REFERENCES users(id)']
        });
      }
    }

    return tables;
  }

  identifyRelationships(tables) {
    const relationships = [];
    
    // Find foreign key relationships
    tables.forEach(table => {
      table.columns.forEach(column => {
        if (column.constraints.some(c => c.includes('FOREIGN KEY'))) {
          const match = column.constraints.find(c => c.includes('REFERENCES'));
          if (match) {
            const referencedTable = match.match(/REFERENCES (\w+)/)?.[1];
            if (referencedTable) {
              relationships.push({
                from: table.name,
                to: referencedTable,
                type: 'many-to-one',
                foreignKey: column.name
              });
            }
          }
        }
      });
    });

    return relationships;
  }

  suggestIndexes(tables) {
    const indexes = [];
    
    tables.forEach(table => {
      // Add indexes for foreign keys
      table.columns.forEach(column => {
        if (column.name.endsWith('_id') && column.name !== 'id') {
          indexes.push({
            table: table.name,
            columns: [column.name],
            type: 'standard',
            purpose: 'Foreign key lookup performance'
          });
        }
      });

      // Add common indexes
      if (table.columns.some(c => c.name === 'email')) {
        indexes.push({
          table: table.name,
          columns: ['email'],
          type: 'unique',
          purpose: 'Email lookup and uniqueness'
        });
      }

      if (table.columns.some(c => c.name === 'created_at')) {
        indexes.push({
          table: table.name,
          columns: ['created_at'],
          type: 'standard',
          purpose: 'Chronological sorting'
        });
      }
    });

    return indexes;
  }

  planMigrations(tables) {
    return tables.map((table, index) => ({
      version: `001_create_${table.name}`,
      description: `Create ${table.name} table`,
      order: index + 1,
      dependencies: index > 0 ? [`001_create_${tables[0].name}`] : []
    }));
  }

  identifyIntegrations(feature) {
    const integrations = [];
    const featureText = feature.toLowerCase();
    
    // Payment integrations
    if (featureText.includes('payment') || featureText.includes('checkout')) {
      integrations.push({
        service: 'Payment Gateway (Stripe/PayPal)',
        purpose: 'Process payments',
        type: 'external API',
        considerations: ['PCI compliance', 'Webhook handling', 'Error recovery']
      });
    }

    // Email integrations
    if (featureText.includes('email') || featureText.includes('notification')) {
      integrations.push({
        service: 'Email Service (SendGrid/Mailgun)',
        purpose: 'Send email notifications',
        type: 'external API',
        considerations: ['Delivery tracking', 'Template management', 'Rate limiting']
      });
    }

    // Authentication integrations
    if (featureText.includes('social') || featureText.includes('oauth')) {
      integrations.push({
        service: 'OAuth Providers (Google/Facebook)',
        purpose: 'Social authentication',
        type: 'OAuth',
        considerations: ['Token management', 'User data mapping', 'Privacy compliance']
      });
    }

    return integrations;
  }

  selectArchitecturalPatterns(feature, requirements) {
    const patterns = [];
    
    // Always suggest basic patterns
    patterns.push({
      pattern: 'MVC (Model-View-Controller)',
      reason: 'Separation of concerns and maintainability',
      applicability: 'Core application structure'
    });

    patterns.push({
      pattern: 'Repository Pattern',
      reason: 'Data access abstraction',
      applicability: 'Database operations'
    });

    // Add patterns based on complexity
    if (requirements.complexity.score >= 3) {
      patterns.push({
        pattern: 'Service Layer',
        reason: 'Business logic encapsulation',
        applicability: 'Complex business rules'
      });
    }

    if (requirements.complexity.score >= 4) {
      patterns.push({
        pattern: 'CQRS (Command Query Responsibility Segregation)',
        reason: 'Scalability and performance optimization',
        applicability: 'High-load operations'
      });
    }

    const featureText = feature.toLowerCase();
    
    // Real-time patterns
    if (featureText.includes('real-time')) {
      patterns.push({
        pattern: 'Observer Pattern',
        reason: 'Real-time updates and notifications',
        applicability: 'Event-driven updates'
      });
    }

    // Authentication patterns
    if (featureText.includes('auth')) {
      patterns.push({
        pattern: 'Strategy Pattern',
        reason: 'Multiple authentication methods',
        applicability: 'Authentication providers'
      });
    }

    return patterns;
  }

  planUserExperience(feature, requirements) {
    const userFlows = this.designUserFlows(feature);
    const wireframes = this.suggestWireframes(feature);
    const interactions = this.planInteractions(feature);
    const accessibility = this.planAccessibility();
    
    return {
      userFlows,
      wireframes,
      interactions,
      accessibility,
      designPrinciples: this.defineDesignPrinciples(feature)
    };
  }

  designUserFlows(feature) {
    const flows = [];
    const featureText = feature.toLowerCase();
    
    // Authentication flow
    if (featureText.includes('auth') || featureText.includes('login')) {
      flows.push({
        name: 'User Authentication Flow',
        steps: [
          { step: 'User visits login page', action: 'Navigate', screen: 'Login Page' },
          { step: 'User enters credentials', action: 'Input', screen: 'Login Form' },
          { step: 'System validates credentials', action: 'Process', screen: 'Loading State' },
          { step: 'User is redirected to dashboard', action: 'Navigate', screen: 'Dashboard' }
        ],
        alternative: [
          { step: 'Invalid credentials', action: 'Error', screen: 'Login Page with Error' },
          { step: 'Forgot password flow', action: 'Navigate', screen: 'Password Reset' }
        ]
      });
    }

    // Generic feature flow
    flows.push({
      name: 'Main Feature Flow',
      steps: [
        { step: 'User accesses feature', action: 'Navigate', screen: 'Feature Landing' },
        { step: 'User interacts with feature', action: 'Interact', screen: 'Feature Interface' },
        { step: 'System processes action', action: 'Process', screen: 'Loading/Progress' },
        { step: 'User sees result', action: 'View', screen: 'Result Display' }
      ],
      alternative: [
        { step: 'Error occurs', action: 'Error', screen: 'Error State' },
        { step: 'User cancels action', action: 'Cancel', screen: 'Previous State' }
      ]
    });

    return flows;
  }

  suggestWireframes(feature) {
    const wireframes = [];
    const featureText = feature.toLowerCase();
    
    // Main feature interface
    wireframes.push({
      name: 'Main Interface',
      description: 'Primary interface for the feature',
      components: [
        'Header with navigation',
        'Main content area',
        'Action buttons/controls',
        'Status/feedback area',
        'Footer with additional options'
      ],
      responsive: true
    });

    // Form interface (if applicable)
    if (featureText.includes('form') || featureText.includes('create') || featureText.includes('edit')) {
      wireframes.push({
        name: 'Form Interface',
        description: 'Data input and editing interface',
        components: [
          'Form title and description',
          'Input fields with labels',
          'Validation messages',
          'Save/Cancel buttons',
          'Progress indicator (for multi-step)'
        ],
        responsive: true
      });
    }

    // List/Dashboard interface
    if (featureText.includes('list') || featureText.includes('dashboard') || featureText.includes('manage')) {
      wireframes.push({
        name: 'List/Dashboard',
        description: 'Overview and management interface',
        components: [
          'Search and filter controls',
          'Data table or card layout',
          'Pagination controls',
          'Bulk action buttons',
          'Summary statistics'
        ],
        responsive: true
      });
    }

    return wireframes;
  }

  planInteractions(feature) {
    const interactions = [];
    
    // Basic interactions
    interactions.push({
      trigger: 'Click/Tap',
      action: 'Primary actions (submit, save, create)',
      feedback: 'Button state changes, loading indicators',
      accessibility: 'Keyboard accessible, screen reader support'
    });

    interactions.push({
      trigger: 'Form Input',
      action: 'Data entry and validation',
      feedback: 'Real-time validation, error messages',
      accessibility: 'Proper labels, ARIA attributes'
    });

    interactions.push({
      trigger: 'Navigation',
      action: 'Moving between screens/states',
      feedback: 'Page transitions, breadcrumbs',
      accessibility: 'Focus management, skip links'
    });

    const featureText = feature.toLowerCase();
    
    // Real-time interactions
    if (featureText.includes('real-time')) {
      interactions.push({
        trigger: 'Live Updates',
        action: 'Automatic content updates',
        feedback: 'Smooth animations, update notifications',
        accessibility: 'Announced changes, user control over updates'
      });
    }

    // Search interactions
    if (featureText.includes('search')) {
      interactions.push({
        trigger: 'Search Input',
        action: 'Query entry and suggestions',
        feedback: 'Autocomplete, search suggestions',
        accessibility: 'ARIA live regions, keyboard navigation'
      });
    }

    return interactions;
  }

  planAccessibility() {
    return {
      guidelines: 'WCAG 2.1 AA compliance',
      keyFeatures: [
        'Keyboard navigation support',
        'Screen reader compatibility',
        'High contrast color schemes',
        'Scalable text and UI elements',
        'Alternative text for images',
        'Proper heading structure',
        'Focus indicators',
        'Error identification and description'
      ],
      testing: [
        'Automated accessibility testing',
        'Manual keyboard testing',
        'Screen reader testing',
        'Color contrast validation',
        'User testing with disabled users'
      ]
    };
  }

  defineDesignPrinciples(feature) {
    return [
      {
        principle: 'User-Centered Design',
        description: 'Prioritize user needs and goals in all design decisions',
        application: 'User research, usability testing, iterative design'
      },
      {
        principle: 'Consistency',
        description: 'Maintain consistent patterns and behaviors across the feature',
        application: 'Design system usage, pattern libraries, style guides'
      },
      {
        principle: 'Simplicity',
        description: 'Keep the interface clean and focused on essential tasks',
        application: 'Progressive disclosure, minimal cognitive load'
      },
      {
        principle: 'Feedback',
        description: 'Provide clear feedback for all user actions',
        application: 'Loading states, success messages, error handling'
      },
      {
        principle: 'Accessibility',
        description: 'Ensure the feature is usable by people with disabilities',
        application: 'WCAG compliance, inclusive design practices'
      }
    ];
  }

  planImplementation(feature, requirements, architecture) {
    const phases = this.defineImplementationPhases(feature, requirements);
    const tasks = this.createImplementationTasks(feature, architecture, phases);
    const dependencies = this.identifyTaskDependencies(tasks);
    const resources = this.estimateResources(tasks, requirements);
    
    return {
      phases,
      tasks,
      dependencies,
      resources,
      milestones: this.defineMilestones(phases, tasks)
    };
  }

  defineImplementationPhases(feature, requirements) {
    const phases = [
      {
        name: 'Foundation',
        description: 'Set up infrastructure and core components',
        priority: 'high',
        duration: 'weeks 1-2'
      },
      {
        name: 'Core Development',
        description: 'Implement main feature functionality',
        priority: 'high',
        duration: 'weeks 2-4'
      },
      {
        name: 'Integration',
        description: 'Connect components and test integrations',
        priority: 'high',
        duration: 'weeks 4-5'
      },
      {
        name: 'Polish & Testing',
        description: 'UI polish, testing, and bug fixes',
        priority: 'medium',
        duration: 'weeks 5-6'
      }
    ];

    // Add additional phases for complex features
    if (requirements.complexity.score >= 4) {
      phases.splice(1, 0, {
        name: 'Architecture',
        description: 'Detailed architecture and design',
        priority: 'high',
        duration: 'week 1'
      });

      phases.push({
        name: 'Performance',
        description: 'Performance optimization and scaling',
        priority: 'medium',
        duration: 'week 6-7'
      });
    }

    return phases;
  }

  createImplementationTasks(feature, architecture, phases) {
    const tasks = [];
    const featureText = feature.toLowerCase();
    
    // Foundation tasks
    tasks.push({
      id: tasks.length + 1,
      title: 'Project setup and configuration',
      description: 'Initialize project structure, dependencies, and development environment',
      phase: 'Foundation',
      category: 'Infrastructure',
      effort: 2,
      priority: 'high',
      skills: ['DevOps', 'Configuration'],
      deliverables: ['Project structure', 'Package configuration', 'Environment setup']
    });

    // Database tasks
    if (architecture.database.required) {
      tasks.push({
        id: tasks.length + 1,
        title: 'Database schema design and migration',
        description: 'Design database schema and create migration scripts',
        phase: 'Foundation',
        category: 'Database',
        effort: 3,
        priority: 'high',
        skills: ['Database Design', 'SQL'],
        deliverables: ['Database schema', 'Migration scripts', 'Seed data']
      });
    }

    // API development
    if (architecture.apis.length > 0) {
      tasks.push({
        id: tasks.length + 1,
        title: 'API development and documentation',
        description: 'Implement REST APIs and create documentation',
        phase: 'Core Development',
        category: 'Backend',
        effort: 5,
        priority: 'high',
        skills: ['Backend Development', 'API Design'],
        deliverables: ['API endpoints', 'API documentation', 'Error handling']
      });
    }

    // Frontend development
    tasks.push({
      id: tasks.length + 1,
      title: 'Frontend component development',
      description: 'Build user interface components and interactions',
      phase: 'Core Development',
      category: 'Frontend',
      effort: 4,
      priority: 'high',
      skills: ['Frontend Development', 'UI/UX'],
      deliverables: ['UI components', 'User interactions', 'Responsive design']
    });

    // Authentication (if needed)
    if (featureText.includes('auth') || featureText.includes('user')) {
      tasks.push({
        id: tasks.length + 1,
        title: 'Authentication implementation',
        description: 'Implement user authentication and authorization',
        phase: 'Core Development',
        category: 'Security',
        effort: 4,
        priority: 'high',
        skills: ['Security', 'Authentication'],
        deliverables: ['Auth system', 'User management', 'Session handling']
      });
    }

    // Integration tasks
    if (architecture.integration.length > 0) {
      tasks.push({
        id: tasks.length + 1,
        title: 'Third-party integrations',
        description: 'Implement external service integrations',
        phase: 'Integration',
        category: 'Integration',
        effort: 3,
        priority: 'medium',
        skills: ['Integration', 'API'],
        deliverables: ['Service integrations', 'Error handling', 'Monitoring']
      });
    }

    // Testing tasks
    tasks.push({
      id: tasks.length + 1,
      title: 'Testing implementation',
      description: 'Write unit, integration, and end-to-end tests',
      phase: 'Polish & Testing',
      category: 'Testing',
      effort: 3,
      priority: 'medium',
      skills: ['Testing', 'QA'],
      deliverables: ['Test suites', 'Test coverage', 'Test documentation']
    });

    // Documentation
    tasks.push({
      id: tasks.length + 1,
      title: 'Documentation',
      description: 'Create user and technical documentation',
      phase: 'Polish & Testing',
      category: 'Documentation',
      effort: 2,
      priority: 'low',
      skills: ['Technical Writing'],
      deliverables: ['User guides', 'Technical docs', 'API documentation']
    });

    // Deployment
    tasks.push({
      id: tasks.length + 1,
      title: 'Deployment and monitoring',
      description: 'Deploy to production and set up monitoring',
      phase: 'Polish & Testing',
      category: 'DevOps',
      effort: 2,
      priority: 'medium',
      skills: ['DevOps', 'Monitoring'],
      deliverables: ['Production deployment', 'Monitoring setup', 'Documentation']
    });

    return tasks;
  }

  identifyTaskDependencies(tasks) {
    const dependencies = [];
    
    // Foundation tasks block core development
    const foundationTasks = tasks.filter(t => t.phase === 'Foundation');
    const coreTasks = tasks.filter(t => t.phase === 'Core Development');
    
    coreTasks.forEach(coreTask => {
      foundationTasks.forEach(foundationTask => {
        dependencies.push({
          dependent: coreTask.id,
          dependency: foundationTask.id,
          type: 'blocks',
          reason: 'Infrastructure must be set up before feature development'
        });
      });
    });

    // Core development blocks integration
    const integrationTasks = tasks.filter(t => t.phase === 'Integration');
    
    integrationTasks.forEach(integrationTask => {
      coreTasks.forEach(coreTask => {
        dependencies.push({
          dependent: integrationTask.id,
          dependency: coreTask.id,
          type: 'blocks',
          reason: 'Core functionality must exist before integration'
        });
      });
    });

    // Database task blocks API development
    const dbTask = tasks.find(t => t.category === 'Database');
    const apiTask = tasks.find(t => t.category === 'Backend');
    
    if (dbTask && apiTask) {
      dependencies.push({
        dependent: apiTask.id,
        dependency: dbTask.id,
        type: 'blocks',
        reason: 'Database schema must exist before API development'
      });
    }

    return dependencies;
  }

  estimateResources(tasks, requirements) {
    const totalEffort = tasks.reduce((sum, task) => sum + task.effort, 0);
    const skillsNeeded = [...new Set(tasks.flatMap(task => task.skills))];
    
    // Estimate team size based on complexity
    const teamSize = requirements.complexity.score >= 4 ? 3 : 
                    requirements.complexity.score >= 3 ? 2 : 1;
    
    return {
      totalEffort,
      estimatedWeeks: Math.ceil(totalEffort / teamSize),
      teamSize,
      skillsRequired: skillsNeeded,
      roles: this.mapSkillsToRoles(skillsNeeded),
      budget: {
        development: totalEffort * 8 * 100, // 8 hours per point, $100/hour
        infrastructure: 1000, // Monthly infrastructure costs
        tools: 500 // Development tools and services
      }
    };
  }

  mapSkillsToRoles(skills) {
    const roleMapping = {
      'Frontend Development': 'Frontend Developer',
      'Backend Development': 'Backend Developer',
      'UI/UX': 'UI/UX Designer',
      'Database Design': 'Database Developer',
      'DevOps': 'DevOps Engineer',
      'Security': 'Security Engineer',
      'Testing': 'QA Engineer',
      'Technical Writing': 'Technical Writer'
    };

    return skills.map(skill => roleMapping[skill] || 'Software Developer');
  }

  defineMilestones(phases, tasks) {
    return phases.map(phase => {
      const phaseTasks = tasks.filter(t => t.phase === phase.name);
      const effort = phaseTasks.reduce((sum, task) => sum + task.effort, 0);
      
      return {
        name: `${phase.name} Complete`,
        description: phase.description,
        deliverables: phaseTasks.flatMap(t => t.deliverables),
        effort,
        tasks: phaseTasks.length,
        successCriteria: [
          'All phase tasks completed',
          'Deliverables reviewed and approved',
          'Quality gates passed',
          'Documentation updated'
        ]
      };
    });
  }

  planTesting(feature, implementation) {
    const strategies = this.defineTestingStrategies(feature);
    const types = this.defineTestTypes(implementation);
    const coverage = this.defineTestCoverage();
    const automation = this.planTestAutomation();
    
    return {
      strategies,
      types,
      coverage,
      automation,
      tools: this.suggestTestingTools(feature)
    };
  }

  defineTestingStrategies(feature) {
    return [
      {
        strategy: 'Test-Driven Development (TDD)',
        description: 'Write tests before implementation',
        benefits: ['Better design', 'Higher coverage', 'Fewer bugs'],
        applicability: 'Core business logic'
      },
      {
        strategy: 'Behavior-Driven Development (BDD)',
        description: 'Define behavior through scenarios',
        benefits: ['Clear requirements', 'Better communication', 'User-focused'],
        applicability: 'User-facing features'
      },
      {
        strategy: 'Risk-Based Testing',
        description: 'Focus testing on high-risk areas',
        benefits: ['Efficient resource use', 'Critical path coverage'],
        applicability: 'Complex integrations'
      }
    ];
  }

  defineTestTypes(implementation) {
    const types = [
      {
        type: 'Unit Tests',
        description: 'Test individual components/functions',
        coverage: '80%+',
        tools: ['Jest', 'Mocha', 'Vitest'],
        responsibility: 'Developers'
      },
      {
        type: 'Integration Tests',
        description: 'Test component interactions',
        coverage: '60%+',
        tools: ['Supertest', 'Testcontainers'],
        responsibility: 'Developers'
      },
      {
        type: 'End-to-End Tests',
        description: 'Test complete user workflows',
        coverage: 'Critical paths',
        tools: ['Playwright', 'Cypress'],
        responsibility: 'QA Engineers'
      }
    ];

    // Add specific test types based on implementation
    if (implementation.tasks.some(t => t.category === 'Backend')) {
      types.push({
        type: 'API Tests',
        description: 'Test API endpoints and responses',
        coverage: '100% of endpoints',
        tools: ['Postman', 'Newman', 'REST Assured'],
        responsibility: 'Developers'
      });
    }

    if (implementation.tasks.some(t => t.category === 'Security')) {
      types.push({
        type: 'Security Tests',
        description: 'Test for security vulnerabilities',
        coverage: 'All security features',
        tools: ['OWASP ZAP', 'SonarQube'],
        responsibility: 'Security Engineers'
      });
    }

    return types;
  }

  defineTestCoverage() {
    return {
      targets: {
        unit: '80%',
        integration: '60%',
        e2e: 'Critical user paths'
      },
      metrics: [
        'Line coverage',
        'Branch coverage',
        'Function coverage',
        'Statement coverage'
      ],
      reporting: [
        'Coverage reports',
        'Trend analysis',
        'Quality gates'
      ]
    };
  }

  planTestAutomation() {
    return {
      pipeline: [
        'Pre-commit hooks (unit tests)',
        'Pull request validation (all tests)',
        'Deployment validation (smoke tests)',
        'Production monitoring (health checks)'
      ],
      tools: [
        'GitHub Actions / GitLab CI',
        'Test reporting tools',
        'Coverage tracking',
        'Quality gates'
      ],
      schedule: [
        'Unit tests: On every commit',
        'Integration tests: On pull request',
        'E2E tests: Nightly and pre-deployment',
        'Performance tests: Weekly'
      ]
    };
  }

  suggestTestingTools(feature) {
    const baseTools = [
      { name: 'Jest', purpose: 'Unit testing framework', category: 'Unit Testing' },
      { name: 'Playwright', purpose: 'End-to-end testing', category: 'E2E Testing' },
      { name: 'MSW', purpose: 'API mocking', category: 'Mocking' },
      { name: 'Testing Library', purpose: 'Component testing', category: 'Frontend Testing' }
    ];

    const featureText = feature.toLowerCase();
    
    if (featureText.includes('api') || featureText.includes('backend')) {
      baseTools.push(
        { name: 'Supertest', purpose: 'API testing', category: 'API Testing' },
        { name: 'Postman', purpose: 'API validation', category: 'API Testing' }
      );
    }

    if (featureText.includes('real-time')) {
      baseTools.push(
        { name: 'Socket.io Client', purpose: 'WebSocket testing', category: 'Real-time Testing' }
      );
    }

    return baseTools;
  }

  planDeployment(feature, requirements) {
    const strategy = this.selectDeploymentStrategy(requirements);
    const environments = this.defineEnvironments();
    const pipeline = this.designDeploymentPipeline();
    const monitoring = this.planMonitoring(feature);
    
    return {
      strategy,
      environments,
      pipeline,
      monitoring,
      rollback: this.planRollbackStrategy()
    };
  }

  selectDeploymentStrategy(requirements) {
    const strategies = [
      {
        name: 'Blue-Green Deployment',
        description: 'Two identical production environments',
        pros: ['Zero downtime', 'Easy rollback', 'Full testing'],
        cons: ['Double resources', 'Complex setup'],
        suitable: requirements.complexity.score >= 4
      },
      {
        name: 'Rolling Deployment',
        description: 'Gradual instance replacement',
        pros: ['Minimal resource overhead', 'Gradual rollout'],
        cons: ['Potential downtime', 'Version mixing'],
        suitable: requirements.complexity.score >= 2
      },
      {
        name: 'Feature Flags',
        description: 'Toggle features without deployment',
        pros: ['Risk mitigation', 'A/B testing', 'Easy rollback'],
        cons: ['Code complexity', 'Technical debt'],
        suitable: true
      }
    ];

    return strategies.filter(s => s.suitable);
  }

  defineEnvironments() {
    return [
      {
        name: 'Development',
        purpose: 'Active development and testing',
        characteristics: ['Latest code', 'Debug mode', 'Test data'],
        access: 'Development team'
      },
      {
        name: 'Staging',
        purpose: 'Pre-production testing',
        characteristics: ['Production-like', 'Real integrations', 'Performance testing'],
        access: 'QA team, stakeholders'
      },
      {
        name: 'Production',
        purpose: 'Live user environment',
        characteristics: ['Stable code', 'Monitoring', 'Real data'],
        access: 'End users, support team'
      }
    ];
  }

  designDeploymentPipeline() {
    return {
      stages: [
        {
          stage: 'Build',
          actions: ['Code compilation', 'Dependency resolution', 'Artifact creation'],
          triggers: ['Code push', 'Pull request'],
          gates: ['Build success', 'Security scan']
        },
        {
          stage: 'Test',
          actions: ['Unit tests', 'Integration tests', 'Security tests'],
          triggers: ['Build completion'],
          gates: ['All tests pass', 'Coverage threshold']
        },
        {
          stage: 'Deploy to Staging',
          actions: ['Environment preparation', 'Application deployment', 'Smoke tests'],
          triggers: ['Test completion'],
          gates: ['Health checks pass']
        },
        {
          stage: 'Deploy to Production',
          actions: ['Blue-green switch', 'Monitoring setup', 'User notification'],
          triggers: ['Manual approval', 'Staging validation'],
          gates: ['Performance metrics', 'Error rates']
        }
      ],
      tools: [
        'GitHub Actions / GitLab CI',
        'Docker / Kubernetes',
        'Infrastructure as Code (Terraform)',
        'Monitoring tools (DataDog, New Relic)'
      ]
    };
  }

  planMonitoring(feature) {
    const featureText = feature.toLowerCase();
    
    const metrics = [
      { name: 'Response Time', threshold: '< 2s', alert: 'Medium' },
      { name: 'Error Rate', threshold: '< 1%', alert: 'High' },
      { name: 'Throughput', threshold: 'Baseline +/- 20%', alert: 'Medium' },
      { name: 'CPU Usage', threshold: '< 80%', alert: 'Medium' },
      { name: 'Memory Usage', threshold: '< 85%', alert: 'High' }
    ];

    // Add feature-specific metrics
    if (featureText.includes('auth')) {
      metrics.push(
        { name: 'Login Success Rate', threshold: '> 95%', alert: 'High' },
        { name: 'Auth Token Validation', threshold: '< 100ms', alert: 'Medium' }
      );
    }

    if (featureText.includes('payment')) {
      metrics.push(
        { name: 'Payment Success Rate', threshold: '> 99%', alert: 'Critical' },
        { name: 'Payment Processing Time', threshold: '< 5s', alert: 'High' }
      );
    }

    return {
      metrics,
      logging: [
        'Application logs',
        'Error tracking',
        'Performance logs',
        'User activity logs'
      ],
      alerting: [
        'Real-time notifications',
        'Escalation procedures',
        'On-call rotation',
        'Incident response'
      ],
      dashboards: [
        'System health overview',
        'Feature usage metrics',
        'Performance trends',
        'Error analysis'
      ]
    };
  }

  planRollbackStrategy() {
    return {
      triggers: [
        'Error rate spike (> 5%)',
        'Performance degradation (> 50% slower)',
        'Critical functionality failure',
        'Security vulnerability discovered'
      ],
      procedures: [
        'Immediate traffic routing to previous version',
        'Database rollback (if schema changes)',
        'Feature flag disabling',
        'User communication',
        'Post-incident review'
      ],
      automation: [
        'Automated health checks',
        'Automatic rollback triggers',
        'Monitoring integration',
        'Alert notifications'
      ],
      testing: [
        'Regular rollback drills',
        'Rollback procedure validation',
        'Recovery time testing',
        'Data integrity verification'
      ]
    };
  }

  createTimeline(implementation, options) {
    const specifiedTimeline = options.timeline;
    const tasks = implementation.tasks;
    const totalEffort = tasks.reduce((sum, task) => sum + task.effort, 0);
    
    // Parse specified timeline
    let targetWeeks = null;
    if (specifiedTimeline) {
      const match = specifiedTimeline.match(/(\d+)\s*(week|day)/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        targetWeeks = unit === 'week' ? value : Math.ceil(value / 7);
      }
    }

    // Calculate timeline based on effort and team size
    const teamSize = implementation.resources.teamSize || 2;
    const calculatedWeeks = Math.ceil(totalEffort / teamSize);
    
    const estimatedWeeks = targetWeeks || calculatedWeeks;
    const isAggressive = targetWeeks && targetWeeks < calculatedWeeks * 0.8;
    const isConservative = targetWeeks && targetWeeks > calculatedWeeks * 1.2;

    return {
      estimatedWeeks,
      targetWeeks,
      calculatedWeeks,
      totalEffort,
      teamSize,
      isAggressive,
      isConservative,
      phases: this.distributeTasksToTimeline(tasks, estimatedWeeks),
      risks: isAggressive ? ['Timeline may be too aggressive', 'Quality may be compromised'] : 
             isConservative ? ['Timeline may be too conservative', 'Resource underutilization'] : [],
      recommendations: this.getTimelineRecommendations(isAggressive, isConservative, totalEffort)
    };
  }

  distributeTasksToTimeline(tasks, totalWeeks) {
    const phases = [];
    const tasksPerWeek = Math.ceil(tasks.length / totalWeeks);
    
    for (let week = 1; week <= totalWeeks; week++) {
      const weekTasks = tasks.slice((week - 1) * tasksPerWeek, week * tasksPerWeek);
      if (weekTasks.length > 0) {
        phases.push({
          week,
          tasks: weekTasks.length,
          effort: weekTasks.reduce((sum, task) => sum + task.effort, 0),
          focus: this.determineWeekFocus(weekTasks),
          deliverables: weekTasks.flatMap(task => task.deliverables)
        });
      }
    }

    return phases;
  }

  determineWeekFocus(tasks) {
    const categories = tasks.map(task => task.category);
    const categoryCount = categories.reduce((count, cat) => {
      count[cat] = (count[cat] || 0) + 1;
      return count;
    }, {});
    
    const primaryCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    return primaryCategory || 'Mixed';
  }

  getTimelineRecommendations(isAggressive, isConservative, totalEffort) {
    const recommendations = [];
    
    if (isAggressive) {
      recommendations.push(
        'Consider adding more team members to meet timeline',
        'Identify features that can be moved to future phases',
        'Increase testing and quality assurance efforts',
        'Plan for potential overtime or extended hours'
      );
    } else if (isConservative) {
      recommendations.push(
        'Consider adding additional features or improvements',
        'Allocate extra time for thorough testing and documentation',
        'Plan for knowledge transfer and training',
        'Use extra time for code review and refactoring'
      );
    } else {
      recommendations.push(
        'Timeline appears realistic for the scope',
        'Maintain buffer time for unexpected issues',
        'Regular progress reviews and adjustments',
        'Focus on quality and maintainability'
      );
    }

    if (totalEffort > 30) {
      recommendations.push(
        'Consider breaking into smaller phases or releases',
        'Implement feature flags for gradual rollout'
      );
    }

    return recommendations;
  }

  identifyFeatureRisks(feature, requirements, implementation) {
    const risks = [];
    const featureText = feature.toLowerCase();
    
    // Technical complexity risks
    if (requirements.complexity.score >= 4) {
      risks.push({
        type: 'Technical Complexity',
        level: 'high',
        probability: 'medium',
        impact: 'Schedule delays, potential redesign needed',
        mitigation: 'Early prototyping, technical spikes, expert consultation',
        owner: 'Technical Lead'
      });
    }

    // Integration risks
    if (implementation.tasks.some(t => t.category === 'Integration')) {
      risks.push({
        type: 'Third-party Integration',
        level: 'medium',
        probability: 'medium',
        impact: 'Feature delays, potential service limitations',
        mitigation: 'Early integration testing, fallback plans, service SLA review',
        owner: 'Integration Lead'
      });
    }

    // Security risks
    if (featureText.includes('auth') || featureText.includes('payment') || featureText.includes('personal')) {
      risks.push({
        type: 'Security Compliance',
        level: 'high',
        probability: 'low',
        impact: 'Regulatory violations, security breaches',
        mitigation: 'Security review, penetration testing, compliance audit',
        owner: 'Security Team'
      });
    }

    // Performance risks
    if (featureText.includes('real-time') || featureText.includes('large') || featureText.includes('scale')) {
      risks.push({
        type: 'Performance Requirements',
        level: 'medium',
        probability: 'medium',
        impact: 'Poor user experience, system instability',
        mitigation: 'Load testing, performance monitoring, optimization plan',
        owner: 'Performance Engineer'
      });
    }

    // Scope creep risk
    if (implementation.tasks.length > 8) {
      risks.push({
        type: 'Scope Creep',
        level: 'medium',
        probability: 'high',
        impact: 'Timeline delays, budget overrun',
        mitigation: 'Clear requirements, change control process, stakeholder communication',
        owner: 'Product Manager'
      });
    }

    // User adoption risk
    risks.push({
      type: 'User Adoption',
      level: 'medium',
      probability: 'medium',
      impact: 'Low feature usage, wasted development effort',
      mitigation: 'User research, early feedback, iterative design',
      owner: 'Product Manager'
    });

    return risks;
  }

  defineSuccessMetrics(feature, requirements) {
    const featureText = feature.toLowerCase();
    
    const metrics = {
      business: [],
      technical: [],
      user: []
    };

    // Business metrics
    metrics.business.push(
      { metric: 'Feature Adoption Rate', target: '> 70% of active users', measurement: 'Monthly active users using feature' },
      { metric: 'Time to Value', target: '< 24 hours', measurement: 'Time from feature access to first successful use' },
      { metric: 'User Satisfaction', target: '> 4.0/5.0', measurement: 'User feedback and ratings' }
    );

    // Feature-specific business metrics
    if (featureText.includes('auth')) {
      metrics.business.push(
        { metric: 'Registration Completion Rate', target: '> 85%', measurement: 'Successful registrations / registration attempts' },
        { metric: 'Login Success Rate', target: '> 95%', measurement: 'Successful logins / login attempts' }
      );
    }

    if (featureText.includes('search')) {
      metrics.business.push(
        { metric: 'Search Success Rate', target: '> 80%', measurement: 'Searches with clicks / total searches' },
        { metric: 'Search Engagement', target: '> 60%', measurement: 'Users who interact with search results' }
      );
    }

    if (featureText.includes('payment')) {
      metrics.business.push(
        { metric: 'Payment Completion Rate', target: '> 95%', measurement: 'Successful payments / payment attempts' },
        { metric: 'Payment Processing Time', target: '< 5 seconds', measurement: 'Average time from initiation to confirmation' }
      );
    }

    // Technical metrics
    metrics.technical.push(
      { metric: 'System Uptime', target: '> 99.9%', measurement: 'Uptime monitoring' },
      { metric: 'Response Time', target: '< 2 seconds', measurement: '95th percentile response time' },
      { metric: 'Error Rate', target: '< 1%', measurement: 'Errors / total requests' },
      { metric: 'Code Coverage', target: '> 80%', measurement: 'Test coverage percentage' }
    );

    // Performance-specific technical metrics
    if (requirements.complexity.score >= 3) {
      metrics.technical.push(
        { metric: 'Scalability', target: 'Handle 10x current load', measurement: 'Load testing results' },
        { metric: 'Database Performance', target: '< 100ms query time', measurement: 'Average database query response time' }
      );
    }

    // User experience metrics
    metrics.user.push(
      { metric: 'Task Completion Rate', target: '> 90%', measurement: 'Successful task completions / attempts' },
      { metric: 'User Efficiency', target: '< 3 clicks to goal', measurement: 'Average clicks to complete primary task' },
      { metric: 'Error Recovery', target: '< 30 seconds', measurement: 'Time to recover from user errors' },
      { metric: 'Accessibility Compliance', target: 'WCAG 2.1 AA', measurement: 'Accessibility audit results' }
    );

    return {
      ...metrics,
      kpis: this.identifyKeyKPIs(metrics),
      measurement: {
        frequency: 'Weekly for first month, then monthly',
        tools: ['Google Analytics', 'Application monitoring', 'User feedback surveys'],
        reporting: 'Monthly dashboard with trend analysis'
      }
    };
  }

  identifyKeyKPIs(metrics) {
    return [
      {
        kpi: 'Feature Success Score',
        description: 'Composite score of adoption, satisfaction, and performance',
        calculation: '(Adoption Rate × 0.4) + (User Satisfaction × 0.3) + (Technical Performance × 0.3)',
        target: '> 80%'
      },
      {
        kpi: 'User Value Delivered',
        description: 'Measure of value provided to users',
        calculation: 'Task completion rate × User satisfaction × Adoption rate',
        target: '> 70%'
      },
      {
        kpi: 'Technical Health',
        description: 'Overall technical performance and reliability',
        calculation: '(Uptime × Error Rate × Performance) weighted average',
        target: '> 95%'
      }
    ];
  }

  identifyPhases(tasks) {
    const phases = {};
    tasks.forEach(task => {
      if (!phases[task.phase]) {
        phases[task.phase] = {
          name: task.phase,
          tasks: 0,
          effort: 0
        };
      }
      phases[task.phase].tasks++;
      phases[task.phase].effort += task.effort;
    });
    return Object.values(phases);
  }

  displayFeaturePlan(plan) {
    const { feature, requirements, architecture, implementation, timeline, success, metadata } = plan;
    
    // Feature Overview
    console.log(chalk.yellow('📋 Feature Plan Summary:'));
    console.log(`  Complexity: ${this.formatComplexity(requirements.complexity.level)} (${requirements.complexity.score}/5)`);
    console.log(`  Total tasks: ${chalk.cyan(metadata.totalTasks)}`);
    console.log(`  Estimated effort: ${chalk.cyan(metadata.estimatedEffort)} story points`);
    console.log(`  Timeline: ${chalk.cyan(timeline.estimatedWeeks)} weeks`);

    // Requirements Summary
    console.log(chalk.yellow('\n📝 Requirements Summary:'));
    console.log(`  Functional requirements: ${chalk.cyan(requirements.functional.length)} categories`);
    console.log(`  Non-functional requirements: ${chalk.cyan(requirements.nonFunctional.length)} categories`);
    console.log(`  Constraints: ${chalk.cyan(requirements.constraints.length)}`);
    console.log(`  Stakeholders: ${chalk.cyan(requirements.stakeholders.length)}`);

    // Architecture Overview
    console.log(chalk.yellow('\n🏗️  Architecture Overview:'));
    console.log(`  Components: ${chalk.cyan(architecture.components.length)}`);
    architecture.components.slice(0, 3).forEach(comp => {
      console.log(`    • ${comp.name} (${comp.type})`);
    });
    
    if (architecture.apis.length > 0) {
      console.log(`  API endpoints: ${chalk.cyan(architecture.apis.length)}`);
    }
    
    if (architecture.database.required) {
      console.log(`  Database tables: ${chalk.cyan(architecture.database.tables?.length || 'TBD')}`);
    }

    // Implementation Phases
    console.log(chalk.yellow('\n⚙️  Implementation Phases:'));
    metadata.phases.forEach(phase => {
      console.log(`  • ${phase.name}: ${chalk.cyan(phase.tasks)} tasks (${phase.effort} pts)`);
    });

    // Timeline
    console.log(chalk.yellow('\n📅 Timeline:'));
    if (timeline.targetWeeks && timeline.targetWeeks !== timeline.calculatedWeeks) {
      console.log(`  Target timeline: ${chalk.cyan(timeline.targetWeeks)} weeks`);
      console.log(`  Calculated timeline: ${chalk.cyan(timeline.calculatedWeeks)} weeks`);
      
      if (timeline.isAggressive) {
        console.log(chalk.yellow('  ⚠️  Timeline may be aggressive'));
      } else if (timeline.isConservative) {
        console.log(chalk.green('  ✅ Timeline has buffer time'));
      }
    } else {
      console.log(`  Estimated timeline: ${chalk.cyan(timeline.estimatedWeeks)} weeks`);
    }

    // Implementation Tasks Preview
    console.log(chalk.yellow('\n📋 Key Implementation Tasks:'));
    implementation.tasks.slice(0, 5).forEach(task => {
      const priority = this.formatPriority(task.priority);
      console.log(`  ${priority} ${task.title} (${task.effort}pts)`);
    });
    
    if (implementation.tasks.length > 5) {
      console.log(chalk.gray(`  ... and ${implementation.tasks.length - 5} more tasks`));
    }

    // Success Metrics
    console.log(chalk.yellow('\n🎯 Success Metrics:'));
    success.kpis.slice(0, 2).forEach(kpi => {
      console.log(`  • ${kpi.kpi}: ${chalk.cyan(kpi.target)}`);
    });

    // Risks
    if (plan.risks.length > 0) {
      console.log(chalk.yellow('\n⚠️  Key Risks:'));
      plan.risks.slice(0, 3).forEach(risk => {
        const level = risk.level === 'high' ? chalk.red(risk.level) : 
                    risk.level === 'medium' ? chalk.yellow(risk.level) : 
                    chalk.gray(risk.level);
        console.log(`  ${level.toUpperCase()} - ${risk.type}`);
      });
    }

    // Timeline Recommendations
    if (timeline.recommendations.length > 0) {
      console.log(chalk.gray('\n💡 Timeline Recommendations:'));
      timeline.recommendations.slice(0, 3).forEach(rec => {
        console.log(chalk.gray(`  • ${rec}`));
      });
    }
  }

  async createPlanIssues(plan, options) {
    console.log(chalk.blue('\n🚀 Creating Implementation Issues...\n'));
    
    const { implementation } = plan;
    let created = 0;
    let failed = 0;

    for (const task of implementation.tasks) {
      try {
        const issueData = this.formatTaskAsGitHubIssue(task, plan, options);
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

  formatTaskAsGitHubIssue(task, plan, options) {
    const labels = [
      'feature-plan',
      task.category.toLowerCase(),
      task.priority,
      task.phase.toLowerCase().replace(' ', '-')
    ];

    if (options.labels) {
      labels.push(...options.labels.split(',').map(l => l.trim()));
    }

    const body = this.generateTaskIssueBody(task, plan);

    return {
      title: task.title,
      body,
      labels: labels.filter(Boolean),
      milestone: options.milestone,
      assignees: options.assignee ? [options.assignee] : []
    };
  }

  generateTaskIssueBody(task, plan) {
    let body = `## Description\n${task.description}\n`;
    
    body += `\n## Task Details\n`;
    body += `- **Phase**: ${task.phase}\n`;
    body += `- **Category**: ${task.category}\n`;
    body += `- **Effort**: ${task.effort} story points\n`;
    body += `- **Priority**: ${task.priority}\n`;
    body += `- **Skills Required**: ${task.skills.join(', ')}\n`;
    
    if (task.deliverables?.length > 0) {
      body += `\n## Deliverables\n${task.deliverables.map(d => `- [ ] ${d}`).join('\n')}\n`;
    }

    body += `\n## Acceptance Criteria\n`;
    body += `- [ ] Task implementation meets requirements\n`;
    body += `- [ ] Code follows project standards\n`;
    body += `- [ ] Appropriate tests are written\n`;
    body += `- [ ] Documentation is updated\n`;
    body += `- [ ] Code review is completed\n`;
    
    body += `\n## Feature Context\n`;
    body += `This task is part of the feature: ${plan.feature}\n`;
    body += `Complexity: ${plan.requirements.complexity.level}\n`;
    
    body += `\n---\n*Generated by Flow State Dev feature planning*`;
    
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
  formatComplexity(level) {
    const colors = {
      simple: chalk.green,
      medium: chalk.yellow,
      complex: chalk.red
    };
    return colors[level] ? colors[level](level) : chalk.gray(level);
  }

  formatPriority(priority) {
    const priorities = {
      high: chalk.red('🔴'),
      medium: chalk.yellow('🟡'),
      low: chalk.green('🟢')
    };
    return priorities[priority] || chalk.gray('⚪');
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}