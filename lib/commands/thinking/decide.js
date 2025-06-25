/**
 * Decide command - Architectural decisions with ADR creation
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';

export default class DecideCommand extends BaseSlashCommand {
  constructor() {
    super('/decide', 'Architectural decisions with ADR creation', {
      category: 'thinking',
      usage: '/decide [decision] [options]',
      examples: [
        'fsd slash "/decide \'Choose between REST and GraphQL\'"',
        'fsd slash "/decide \'Database selection\' --alternatives 5"',
        'fsd slash "/decide \'Frontend framework\' --create-adr false"',
        'fsd slash "/decide \'Deployment strategy\' --criteria performance,cost,security"'
      ],
      options: [
        { name: 'decision', type: 'string', description: 'Decision to make', required: true },
        { name: 'alternatives', type: 'number', description: 'Number of alternatives to consider', default: 3 },
        { name: 'create-adr', type: 'boolean', description: 'Create formal ADR document', default: true },
        { name: 'criteria', type: 'string', description: 'Custom evaluation criteria (comma-separated)' },
        { name: 'context', type: 'string', description: 'Additional context for decision' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const decision = args?.[0] || options.decision;
    
    if (!decision) {
      console.log(chalk.blue('🤔 Decision Making Assistant\n'));
      console.log(chalk.gray('Make architectural decisions with comprehensive analysis and documentation.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/decide \'Decision to make\'"'));
      console.log(chalk.gray('\nExample decisions:'));
      console.log(chalk.gray('  • "Choose between REST and GraphQL for API"'));
      console.log(chalk.gray('  • "Select database: PostgreSQL vs MongoDB"'));
      console.log(chalk.gray('  • "Frontend framework: React vs Vue vs Angular"'));
      console.log(chalk.gray('  • "Deployment: Kubernetes vs Docker Swarm"'));
      console.log(chalk.gray('\nFeatures:'));
      console.log(chalk.gray('  • Multi-criteria evaluation'));
      console.log(chalk.gray('  • Pros/cons analysis'));
      console.log(chalk.gray('  • Trade-off comparison'));
      console.log(chalk.gray('  • ADR document generation'));
      return;
    }

    console.log(chalk.blue('🤔 Extended Decision Making Mode\n'));
    
    // Extended thinking visualization
    console.log(chalk.blue('<extended-thinking>'));
    await this.displayDecisionThinking();
    console.log(chalk.blue('</extended-thinking>\n'));

    // Perform decision analysis
    const analysis = await this.performExtendedDecisionAnalysis(decision, options);
    
    // Display results
    await this.displayDecisionAnalysis(analysis);
    
    // Create ADR if requested
    if (options['create-adr']) {
      await this.createDecisionADR(decision, analysis);
    }
  }

  async displayDecisionThinking() {
    const thinkingSteps = [
      'Making architectural decisions requires:',
      '',
      '1. Clear problem definition',
      '2. Comprehensive alternative generation',
      '3. Multi-criteria evaluation framework',
      '4. Impact analysis and trade-offs',
      '5. Documentation for future reference',
      '',
      'Decision methodology:',
      '- Identify all viable alternatives',
      '- Define evaluation criteria and weights',
      '- Score each alternative objectively',
      '- Consider risks and mitigations',
      '- Document rationale for future reference'
    ];

    for (const step of thinkingSteps) {
      console.log(chalk.gray(step));
      await this.sleep(50);
    }
  }

  async performExtendedDecisionAnalysis(decision, options) {
    console.log(chalk.gray('Analyzing decision space and evaluating alternatives...\n'));
    
    const context = this.analyzeDecisionContext(decision, options);
    const criteria = this.defineEvaluationCriteria(decision, options);
    const alternatives = this.generateAlternatives(decision, options);
    const evaluation = this.evaluateAlternatives(alternatives, criteria);
    const recommendation = this.generateRecommendation(evaluation, context);
    const risks = this.assessRisks(alternatives, recommendation);
    const implementation = this.createImplementationPlan(recommendation, context);
    
    return {
      decision,
      timestamp: new Date().toISOString(),
      context,
      criteria,
      alternatives,
      evaluation,
      recommendation,
      risks,
      implementation,
      maxScore: criteria.reduce((sum, c) => sum + c.weight, 0) * 5 // 5-point scale
    };
  }

  analyzeDecisionContext(decision, options) {
    const decisionLower = decision.toLowerCase();
    
    // Extract problem statement
    const problem = this.extractProblemStatement(decision);
    
    // Identify constraints
    const constraints = this.identifyConstraints(decision, options);
    
    // Identify stakeholders
    const stakeholders = this.identifyStakeholders(decision);
    
    // Determine decision type
    const decisionType = this.categorizeDecision(decision);
    
    // Timeline considerations
    const timeline = this.assessTimeline(decision, options);
    
    return {
      problem,
      constraints,
      stakeholders,
      decisionType,
      timeline,
      additionalContext: options.context || ''
    };
  }

  extractProblemStatement(decision) {
    // Simplified extraction - could be enhanced with NLP
    if (decision.includes('between')) {
      return `Need to choose the best option among alternatives for ${decision.split('between')[0].trim()}`;
    } else if (decision.includes('vs')) {
      return `Need to select the most suitable option for the given requirements`;
    } else {
      return `Need to make a strategic decision about ${decision}`;
    }
  }

  identifyConstraints(decision, options) {
    const constraints = [];
    const decisionLower = decision.toLowerCase();
    
    // Common constraints
    constraints.push('Budget limitations');
    constraints.push('Timeline requirements');
    constraints.push('Team expertise');
    
    // Decision-specific constraints
    if (decisionLower.includes('api') || decisionLower.includes('backend')) {
      constraints.push('Performance requirements');
      constraints.push('Scalability needs');
    }
    
    if (decisionLower.includes('database')) {
      constraints.push('Data consistency requirements');
      constraints.push('Query performance needs');
    }
    
    if (decisionLower.includes('frontend') || decisionLower.includes('framework')) {
      constraints.push('Browser compatibility');
      constraints.push('Developer experience');
    }
    
    // Custom constraints
    if (options.constraints) {
      constraints.push(...options.constraints.split(',').map(c => c.trim()));
    }
    
    return [...new Set(constraints)]; // Remove duplicates
  }

  identifyStakeholders(decision) {
    const stakeholders = ['Development Team'];
    const decisionLower = decision.toLowerCase();
    
    if (decisionLower.includes('architecture') || decisionLower.includes('framework')) {
      stakeholders.push('Technical Leadership', 'Architecture Team');
    }
    
    if (decisionLower.includes('ui') || decisionLower.includes('frontend')) {
      stakeholders.push('UX/UI Team', 'Product Team');
    }
    
    if (decisionLower.includes('api') || decisionLower.includes('integration')) {
      stakeholders.push('External Partners', 'API Consumers');
    }
    
    if (decisionLower.includes('database') || decisionLower.includes('infrastructure')) {
      stakeholders.push('Operations Team', 'DBAs');
    }
    
    return [...new Set(stakeholders)];
  }

  categorizeDecision(decision) {
    const decisionLower = decision.toLowerCase();
    
    if (decisionLower.includes('architecture') || decisionLower.includes('pattern')) {
      return 'Architectural';
    } else if (decisionLower.includes('framework') || decisionLower.includes('library')) {
      return 'Technology Selection';
    } else if (decisionLower.includes('database') || decisionLower.includes('storage')) {
      return 'Data Management';
    } else if (decisionLower.includes('deployment') || decisionLower.includes('infrastructure')) {
      return 'Infrastructure';
    } else if (decisionLower.includes('api') || decisionLower.includes('integration')) {
      return 'Integration';
    } else {
      return 'Technical';
    }
  }

  assessTimeline(decision, options) {
    return {
      decisionBy: 'Within 1 week',
      implementationStart: 'Immediately after decision',
      estimatedDuration: 'Varies by alternative'
    };
  }

  defineEvaluationCriteria(decision, options) {
    const criteria = [];
    
    // Custom criteria if provided
    if (options.criteria) {
      const customCriteria = options.criteria.split(',').map(c => c.trim());
      customCriteria.forEach((criterion, index) => {
        criteria.push({
          name: criterion,
          description: `Custom criterion: ${criterion}`,
          weight: 3,
          category: 'custom'
        });
      });
    }
    
    // Default criteria based on decision type
    const decisionLower = decision.toLowerCase();
    
    // Universal criteria
    criteria.push({
      name: 'Implementation Complexity',
      description: 'How difficult is it to implement and maintain',
      weight: 4,
      category: 'technical'
    });
    
    criteria.push({
      name: 'Performance',
      description: 'Speed, efficiency, and resource usage',
      weight: 4,
      category: 'technical'
    });
    
    criteria.push({
      name: 'Scalability',
      description: 'Ability to handle growth and increased load',
      weight: 3,
      category: 'technical'
    });
    
    criteria.push({
      name: 'Developer Experience',
      description: 'Ease of use, documentation, community support',
      weight: 3,
      category: 'team'
    });
    
    criteria.push({
      name: 'Cost',
      description: 'Total cost of ownership including licenses and operations',
      weight: 3,
      category: 'business'
    });
    
    // Context-specific criteria
    if (decisionLower.includes('security') || decisionLower.includes('auth')) {
      criteria.push({
        name: 'Security',
        description: 'Security features and vulnerability management',
        weight: 5,
        category: 'security'
      });
    }
    
    if (decisionLower.includes('api') || decisionLower.includes('integration')) {
      criteria.push({
        name: 'Interoperability',
        description: 'Ease of integration with other systems',
        weight: 4,
        category: 'integration'
      });
    }
    
    if (decisionLower.includes('frontend') || decisionLower.includes('ui')) {
      criteria.push({
        name: 'User Experience',
        description: 'Impact on end-user experience and satisfaction',
        weight: 4,
        category: 'ux'
      });
    }
    
    return criteria;
  }

  generateAlternatives(decision, options) {
    const alternatives = [];
    const decisionLower = decision.toLowerCase();
    const numAlternatives = options.alternatives || 3;
    
    // Extract mentioned alternatives from decision text
    const mentionedAlternatives = this.extractMentionedAlternatives(decision);
    
    // Add mentioned alternatives
    mentionedAlternatives.forEach((alt, index) => {
      alternatives.push(this.createAlternative(alt, decision, index + 1));
    });
    
    // Generate additional alternatives based on context
    if (alternatives.length < numAlternatives) {
      const contextualAlternatives = this.generateContextualAlternatives(decision, numAlternatives - alternatives.length);
      contextualAlternatives.forEach((alt, index) => {
        alternatives.push(this.createAlternative(alt, decision, alternatives.length + index + 1));
      });
    }
    
    // Always include a "do nothing" alternative
    if (!alternatives.some(a => a.name.toLowerCase().includes('current') || a.name.toLowerCase().includes('nothing'))) {
      alternatives.push({
        name: 'Maintain Status Quo',
        description: 'Keep current solution/approach unchanged',
        pros: ['No migration effort', 'No risk of breaking changes', 'Team already familiar'],
        cons: ['Miss improvements', 'Technical debt accumulation', 'Potential obsolescence'],
        effort: 'None',
        risk: 'Low',
        maturity: 'N/A'
      });
    }
    
    return alternatives.slice(0, numAlternatives);
  }

  extractMentionedAlternatives(decision) {
    const alternatives = [];
    
    // Pattern: "between X and Y"
    const betweenMatch = decision.match(/between\s+(\w+)\s+and\s+(\w+)/i);
    if (betweenMatch) {
      alternatives.push(betweenMatch[1], betweenMatch[2]);
    }
    
    // Pattern: "X vs Y"
    const vsMatch = decision.match(/(\w+)\s+vs\.?\s+(\w+)/i);
    if (vsMatch) {
      alternatives.push(vsMatch[1], vsMatch[2]);
    }
    
    // Pattern: "X, Y, or Z"
    const orMatch = decision.match(/(\w+),\s*(\w+),?\s*or\s+(\w+)/i);
    if (orMatch) {
      alternatives.push(orMatch[1], orMatch[2], orMatch[3]);
    }
    
    // Pattern: "X or Y"
    const simpleOrMatch = decision.match(/(\w+)\s+or\s+(\w+)/i);
    if (simpleOrMatch && alternatives.length === 0) {
      alternatives.push(simpleOrMatch[1], simpleOrMatch[2]);
    }
    
    return alternatives;
  }

  generateContextualAlternatives(decision, count) {
    const decisionLower = decision.toLowerCase();
    const alternatives = [];
    
    // Technology-specific alternatives
    if (decisionLower.includes('database')) {
      alternatives.push('PostgreSQL', 'MongoDB', 'MySQL', 'DynamoDB', 'Redis');
    } else if (decisionLower.includes('frontend') || decisionLower.includes('framework')) {
      alternatives.push('React', 'Vue.js', 'Angular', 'Svelte', 'Next.js');
    } else if (decisionLower.includes('api')) {
      alternatives.push('REST', 'GraphQL', 'gRPC', 'WebSocket', 'Server-Sent Events');
    } else if (decisionLower.includes('deployment') || decisionLower.includes('hosting')) {
      alternatives.push('Kubernetes', 'Docker Swarm', 'AWS ECS', 'Serverless', 'Traditional VMs');
    } else if (decisionLower.includes('authentication')) {
      alternatives.push('JWT', 'OAuth 2.0', 'Session-based', 'API Keys', 'SAML');
    } else {
      // Generic alternatives
      alternatives.push('Build Custom', 'Use Open Source', 'Buy Commercial', 'Hybrid Approach', 'Outsource');
    }
    
    return alternatives.slice(0, count);
  }

  createAlternative(name, decision, index) {
    const alt = {
      name: name,
      description: this.generateAlternativeDescription(name, decision),
      pros: this.generatePros(name, decision),
      cons: this.generateCons(name, decision),
      effort: this.assessEffort(name, decision),
      risk: this.assessRisk(name, decision),
      maturity: this.assessMaturity(name)
    };
    
    return alt;
  }

  generateAlternativeDescription(name, decision) {
    const nameLower = name.toLowerCase();
    
    // Known technology descriptions
    const descriptions = {
      'postgresql': 'Robust relational database with ACID compliance and advanced features',
      'mongodb': 'Document-oriented NoSQL database with flexible schema',
      'react': 'Component-based JavaScript library for building user interfaces',
      'vue': 'Progressive JavaScript framework with gentle learning curve',
      'angular': 'Full-featured TypeScript-based framework by Google',
      'rest': 'Representational State Transfer API architecture',
      'graphql': 'Query language and runtime for flexible API development',
      'kubernetes': 'Container orchestration platform for automated deployment',
      'jwt': 'JSON Web Tokens for stateless authentication',
      'oauth': 'Industry-standard protocol for authorization'
    };
    
    // Check for exact or partial matches
    for (const [key, desc] of Object.entries(descriptions)) {
      if (nameLower.includes(key)) {
        return desc;
      }
    }
    
    // Generic description
    return `${name} as a solution for ${decision}`;
  }

  generatePros(name, decision) {
    const pros = [];
    const nameLower = name.toLowerCase();
    const decisionLower = decision.toLowerCase();
    
    // Technology-specific pros
    if (nameLower.includes('postgresql') || nameLower.includes('mysql')) {
      pros.push('ACID compliance', 'Mature ecosystem', 'Strong consistency', 'SQL support');
    } else if (nameLower.includes('mongodb') || nameLower.includes('nosql')) {
      pros.push('Flexible schema', 'Horizontal scaling', 'Fast writes', 'Document model');
    } else if (nameLower.includes('react')) {
      pros.push('Large ecosystem', 'Virtual DOM', 'Component reusability', 'Strong community');
    } else if (nameLower.includes('vue')) {
      pros.push('Gentle learning curve', 'Great documentation', 'Reactive system', 'Small size');
    } else if (nameLower.includes('graphql')) {
      pros.push('Precise data fetching', 'Strong typing', 'Single endpoint', 'Real-time subscriptions');
    } else if (nameLower.includes('rest')) {
      pros.push('Simple and standard', 'Wide support', 'Cacheable', 'Stateless');
    } else if (nameLower.includes('kubernetes')) {
      pros.push('Auto-scaling', 'Self-healing', 'Rolling updates', 'Multi-cloud support');
    } else {
      // Generic pros
      pros.push('Proven solution', 'Good documentation', 'Active community', 'Regular updates');
    }
    
    // Limit to 4 pros
    return pros.slice(0, 4);
  }

  generateCons(name, decision) {
    const cons = [];
    const nameLower = name.toLowerCase();
    
    // Technology-specific cons
    if (nameLower.includes('postgresql') || nameLower.includes('mysql')) {
      cons.push('Vertical scaling limits', 'Schema rigidity', 'Complex replication', 'Storage overhead');
    } else if (nameLower.includes('mongodb') || nameLower.includes('nosql')) {
      cons.push('Eventual consistency', 'No ACID by default', 'Query limitations', 'Memory usage');
    } else if (nameLower.includes('react')) {
      cons.push('Just a library', 'JSX learning curve', 'Boilerplate code', 'Fast-moving ecosystem');
    } else if (nameLower.includes('vue')) {
      cons.push('Smaller ecosystem', 'Less enterprise adoption', 'Fewer job opportunities', 'Chinese origin concerns');
    } else if (nameLower.includes('graphql')) {
      cons.push('Query complexity', 'Caching challenges', 'N+1 problems', 'Learning curve');
    } else if (nameLower.includes('rest')) {
      cons.push('Over/under fetching', 'Multiple endpoints', 'No real-time', 'Versioning complexity');
    } else if (nameLower.includes('kubernetes')) {
      cons.push('High complexity', 'Resource overhead', 'Steep learning curve', 'Operational burden');
    } else {
      // Generic cons
      cons.push('Implementation effort', 'Training required', 'Migration complexity', 'Potential risks');
    }
    
    // Limit to 4 cons
    return cons.slice(0, 4);
  }

  assessEffort(name, decision) {
    const nameLower = name.toLowerCase();
    
    // Known effort levels
    if (nameLower.includes('current') || nameLower.includes('status quo')) {
      return 'None';
    } else if (nameLower.includes('kubernetes') || nameLower.includes('microservice')) {
      return 'Very High';
    } else if (nameLower.includes('graphql') || nameLower.includes('migration')) {
      return 'High';
    } else if (nameLower.includes('react') || nameLower.includes('vue')) {
      return 'Medium';
    } else if (nameLower.includes('rest') || nameLower.includes('jwt')) {
      return 'Low';
    }
    
    return 'Medium';
  }

  assessRisk(name, decision) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('current') || nameLower.includes('status quo')) {
      return 'Low';
    } else if (nameLower.includes('experimental') || nameLower.includes('beta')) {
      return 'Very High';
    } else if (nameLower.includes('migration') || nameLower.includes('rewrite')) {
      return 'High';
    } else if (nameLower.includes('proven') || nameLower.includes('mature')) {
      return 'Low';
    }
    
    return 'Medium';
  }

  assessMaturity(name) {
    const nameLower = name.toLowerCase();
    
    // Known maturity levels
    const matureTools = ['postgresql', 'mysql', 'react', 'angular', 'rest', 'oauth', 'redis'];
    const emergingTools = ['svelte', 'deno', 'bun', 'webgpu'];
    
    if (matureTools.some(tool => nameLower.includes(tool))) {
      return 'Mature';
    } else if (emergingTools.some(tool => nameLower.includes(tool))) {
      return 'Emerging';
    }
    
    return 'Stable';
  }

  evaluateAlternatives(alternatives, criteria) {
    return alternatives.map(alt => {
      const scores = {};
      let totalScore = 0;
      
      criteria.forEach(criterion => {
        const score = this.scoreAlternative(alt, criterion);
        scores[criterion.name] = score;
        totalScore += score * criterion.weight;
      });
      
      return {
        ...alt,
        scores,
        totalScore,
        normalizedScore: totalScore // Will normalize after all are calculated
      };
    });
  }

  scoreAlternative(alternative, criterion) {
    // Scoring logic based on alternative properties and criterion
    // This is a simplified scoring - in reality would be more sophisticated
    
    const scores = {
      'Implementation Complexity': {
        'None': 5,
        'Low': 4,
        'Medium': 3,
        'High': 2,
        'Very High': 1
      },
      'Cost': {
        'None': 5,
        'Low': 4,
        'Medium': 3,
        'High': 2,
        'Very High': 1
      }
    };
    
    // Use predefined scores if available
    if (scores[criterion.name] && scores[criterion.name][alternative.effort]) {
      return scores[criterion.name][alternative.effort];
    }
    
    // Generic scoring based on pros/cons
    if (criterion.name === 'Performance' && alternative.pros.some(p => p.toLowerCase().includes('performance'))) {
      return 4;
    }
    
    if (criterion.name === 'Security' && alternative.pros.some(p => p.toLowerCase().includes('security'))) {
      return 4;
    }
    
    if (criterion.name === 'Developer Experience' && alternative.pros.some(p => p.toLowerCase().includes('documentation'))) {
      return 4;
    }
    
    // Default middle score
    return 3;
  }

  generateRecommendation(evaluation, context) {
    // Find highest scoring alternative
    const sortedAlternatives = [...evaluation].sort((a, b) => b.totalScore - a.totalScore);
    const recommended = sortedAlternatives[0];
    const runnerUp = sortedAlternatives[1];
    
    // Generate reasoning
    const reasoning = this.generateRecommendationReasoning(recommended, runnerUp, context);
    
    // Expected benefits
    const benefits = recommended.pros.slice(0, 3);
    
    // Implementation considerations
    const considerations = this.generateImplementationConsiderations(recommended, context);
    
    return {
      choice: recommended.name,
      score: recommended.totalScore,
      reasoning,
      benefits,
      considerations,
      runnerUp: runnerUp ? runnerUp.name : null,
      confidence: this.calculateConfidence(recommended, runnerUp)
    };
  }

  generateRecommendationReasoning(recommended, runnerUp, context) {
    const scoreDiff = recommended.totalScore - (runnerUp?.totalScore || 0);
    const percentDiff = runnerUp ? Math.round((scoreDiff / runnerUp.totalScore) * 100) : 100;
    
    if (percentDiff > 20) {
      return `${recommended.name} significantly outperforms alternatives with ${percentDiff}% higher score. ` +
             `It best addresses the key requirements while minimizing risks.`;
    } else if (percentDiff > 10) {
      return `${recommended.name} edges out ${runnerUp.name} with moderately better scores across criteria. ` +
             `The decision is clear but not overwhelming.`;
    } else {
      return `${recommended.name} narrowly leads, but ${runnerUp.name} is a close alternative. ` +
             `Consider team preferences and specific context for final decision.`;
    }
  }

  generateImplementationConsiderations(alternative, context) {
    const considerations = [];
    
    // Effort-based considerations
    if (alternative.effort === 'High' || alternative.effort === 'Very High') {
      considerations.push('Plan for extended implementation timeline');
      considerations.push('Ensure adequate resources and expertise');
    }
    
    // Risk-based considerations
    if (alternative.risk === 'High' || alternative.risk === 'Very High') {
      considerations.push('Develop comprehensive testing strategy');
      considerations.push('Create rollback plan');
    }
    
    // Stakeholder considerations
    if (context.stakeholders.includes('External Partners')) {
      considerations.push('Coordinate with external stakeholders');
    }
    
    // Generic considerations
    considerations.push('Document decision rationale');
    considerations.push('Set up monitoring and success metrics');
    
    return considerations.slice(0, 4);
  }

  calculateConfidence(recommended, runnerUp) {
    if (!runnerUp) return 'Very High';
    
    const scoreDiff = recommended.totalScore - runnerUp.totalScore;
    const percentDiff = Math.round((scoreDiff / runnerUp.totalScore) * 100);
    
    if (percentDiff > 30) return 'Very High';
    if (percentDiff > 20) return 'High';
    if (percentDiff > 10) return 'Medium';
    return 'Low';
  }

  assessRisks(alternatives, recommendation) {
    const risks = [];
    const recommended = alternatives.find(a => a.name === recommendation.choice);
    
    // Risk from chosen alternative
    if (recommended.risk === 'High' || recommended.risk === 'Very High') {
      risks.push({
        type: 'Implementation Risk',
        description: `${recommended.name} has ${recommended.risk.toLowerCase()} implementation risk`,
        impact: 'High',
        mitigation: 'Phased rollout with careful monitoring'
      });
    }
    
    // Risk from cons
    if (recommended.cons.some(con => con.toLowerCase().includes('complex'))) {
      risks.push({
        type: 'Complexity Risk',
        description: 'Solution complexity may impact maintainability',
        impact: 'Medium',
        mitigation: 'Invest in training and documentation'
      });
    }
    
    // Risk from not choosing runner-up
    if (recommendation.runnerUp && recommendation.confidence !== 'Very High') {
      risks.push({
        type: 'Decision Risk',
        description: `Close scoring with ${recommendation.runnerUp} suggests decision uncertainty`,
        impact: 'Low',
        mitigation: 'Prototype both solutions if time permits'
      });
    }
    
    // Generic risks
    risks.push({
      type: 'Change Management',
      description: 'Team adaptation to new technology/approach',
      impact: 'Medium',
      mitigation: 'Gradual transition with training plan'
    });
    
    return risks;
  }

  createImplementationPlan(recommendation, context) {
    const plan = {
      phases: [],
      timeline: '',
      successMetrics: [],
      prerequisites: []
    };
    
    // Phase 1: Preparation
    plan.phases.push({
      name: 'Preparation',
      duration: '1-2 weeks',
      activities: [
        'Finalize technical specifications',
        'Set up development environment',
        'Team training if needed',
        'Create proof of concept'
      ]
    });
    
    // Phase 2: Implementation
    plan.phases.push({
      name: 'Implementation',
      duration: '2-6 weeks',
      activities: [
        'Core implementation',
        'Integration with existing systems',
        'Unit and integration testing',
        'Documentation'
      ]
    });
    
    // Phase 3: Validation
    plan.phases.push({
      name: 'Validation',
      duration: '1-2 weeks',
      activities: [
        'Performance testing',
        'Security review',
        'User acceptance testing',
        'Final adjustments'
      ]
    });
    
    // Phase 4: Rollout
    plan.phases.push({
      name: 'Rollout',
      duration: '1 week',
      activities: [
        'Production deployment',
        'Monitoring setup',
        'Team handover',
        'Post-implementation review'
      ]
    });
    
    // Timeline
    plan.timeline = '5-11 weeks total';
    
    // Success metrics
    plan.successMetrics = [
      'Successful implementation without critical issues',
      'Performance meets or exceeds requirements',
      'Team successfully adopts new solution',
      'Positive stakeholder feedback'
    ];
    
    // Prerequisites
    plan.prerequisites = [
      'Decision approval from stakeholders',
      'Resource allocation',
      'Environment access',
      'Training materials prepared'
    ];
    
    return plan;
  }

  async displayDecisionAnalysis(analysis) {
    console.log(chalk.white(`⚖️  Decision Analysis: ${analysis.decision}\n`));

    // Context
    console.log(chalk.yellow('🎯 Decision Context:'));
    console.log(`  Problem: ${chalk.gray(analysis.context.problem)}`);
    console.log(`  Type: ${chalk.cyan(analysis.context.decisionType)}`);
    console.log(`  Constraints: ${analysis.context.constraints.slice(0, 3).join(', ')}`);
    console.log(`  Stakeholders: ${analysis.context.stakeholders.join(', ')}`);

    // Evaluation criteria
    console.log(chalk.yellow('\n⚖️  Evaluation Criteria:'));
    analysis.criteria.slice(0, 6).forEach((criterion, index) => {
      console.log(`  ${index + 1}. ${criterion.name} (Weight: ${chalk.cyan(criterion.weight)})`);
      console.log(chalk.gray(`     ${criterion.description}`));
    });

    // Alternatives
    console.log(chalk.yellow('\n🔀 Alternative Solutions:'));
    analysis.evaluation.forEach((alt, index) => {
      const scorePercent = Math.round((alt.totalScore / analysis.maxScore) * 100);
      console.log(`\n  Option ${index + 1}: ${chalk.cyan(alt.name)}`);
      console.log(chalk.gray(`    ${alt.description}`));
      console.log(`    Score: ${chalk.cyan(alt.totalScore)}/${analysis.maxScore} (${scorePercent}%)`);
      console.log(chalk.green(`    Pros: ${alt.pros.slice(0, 3).join(', ')}`));
      console.log(chalk.red(`    Cons: ${alt.cons.slice(0, 3).join(', ')}`));
      console.log(`    Implementation Effort: ${this.colorizeEffort(alt.effort)}`);
      console.log(`    Risk Level: ${this.colorizeRisk(alt.risk)}`);
    });

    // Recommendation
    console.log(chalk.green(`\n🏆 Recommended Decision: ${analysis.recommendation.choice}`));
    console.log(chalk.gray(`Confidence: ${this.colorizeConfidence(analysis.recommendation.confidence)}`));
    console.log(chalk.gray(`\nReasoning: ${analysis.recommendation.reasoning}`));
    console.log(chalk.gray(`\nExpected Benefits:`));
    analysis.recommendation.benefits.forEach(benefit => {
      console.log(chalk.gray(`  • ${benefit}`));
    });

    // Risks
    if (analysis.risks.length > 0) {
      console.log(chalk.yellow('\n⚠️  Risk Assessment:'));
      analysis.risks.slice(0, 3).forEach(risk => {
        console.log(`\n  ${risk.type} (${this.colorizeRisk(risk.impact)} impact)`);
        console.log(chalk.gray(`  ${risk.description}`));
        console.log(chalk.cyan(`  Mitigation: ${risk.mitigation}`));
      });
    }

    // Implementation plan
    console.log(chalk.yellow('\n📋 Implementation Plan:'));
    console.log(`  Timeline: ${chalk.cyan(analysis.implementation.timeline)}`);
    console.log(`  Phases:`);
    analysis.implementation.phases.forEach(phase => {
      console.log(`    • ${phase.name} (${phase.duration})`);
    });

    // Next steps
    console.log(chalk.green('\n✅ Next Steps:'));
    console.log('  1. Review decision with all stakeholders');
    console.log('  2. Approve or refine based on feedback');
    console.log('  3. Create detailed implementation plan');
    console.log('  4. Begin preparation phase');
  }

  colorizeEffort(effort) {
    const colors = {
      'None': chalk.green,
      'Low': chalk.green,
      'Medium': chalk.yellow,
      'High': chalk.red,
      'Very High': chalk.red
    };
    return (colors[effort] || chalk.gray)(effort);
  }

  colorizeRisk(risk) {
    const colors = {
      'Low': chalk.green,
      'Medium': chalk.yellow,
      'High': chalk.red,
      'Very High': chalk.red
    };
    return (colors[risk] || chalk.gray)(risk);
  }

  colorizeConfidence(confidence) {
    const colors = {
      'Very High': chalk.green,
      'High': chalk.green,
      'Medium': chalk.yellow,
      'Low': chalk.red
    };
    return (colors[confidence] || chalk.gray)(confidence);
  }

  async createDecisionADR(decision, analysis) {
    console.log(chalk.blue('\n📄 Creating Architecture Decision Record...\n'));
    
    const adrContent = this.generateADRContent(decision, analysis);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `adr-${timestamp}-${decision.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}.md`;
    
    try {
      const adrDir = './docs/adr';
      await this.exec(`mkdir -p ${adrDir}`, { silent: true });
      
      const filepath = `${adrDir}/${filename}`;
      await this.writeFile(filepath, adrContent);
      
      console.log(chalk.green(`✅ Created ADR: ${filepath}`));
      
      // Ask if should create GitHub issue
      const shouldCreateIssue = await this.confirm(
        'Create GitHub issue to track this decision?',
        false
      );
      
      if (shouldCreateIssue) {
        await this.createDecisionIssue(decision, analysis, filepath);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create ADR: ${error.message}`));
    }
  }

  generateADRContent(decision, analysis) {
    const date = new Date().toISOString().slice(0, 10);
    const { recommendation, evaluation, context, risks } = analysis;
    
    return `# Architecture Decision Record: ${decision}

## Status
Proposed

## Date
${date}

## Context
${context.problem}

**Decision Type**: ${context.decisionType}  
**Stakeholders**: ${context.stakeholders.join(', ')}

### Constraints
${context.constraints.map(c => `- ${c}`).join('\n')}

## Decision
We will adopt **${recommendation.choice}** based on comprehensive evaluation against defined criteria.

**Confidence Level**: ${recommendation.confidence}

## Rationale
${recommendation.reasoning}

### Evaluation Summary
${evaluation.map(alt => {
  const percent = Math.round((alt.totalScore / analysis.maxScore) * 100);
  return `- **${alt.name}**: ${alt.totalScore} points (${percent}%)`;
}).join('\n')}

### Why ${recommendation.choice}?
${recommendation.benefits.map(b => `- ${b}`).join('\n')}

## Alternatives Considered

${evaluation.map(alt => `### ${alt.name}
${alt.description}

**Pros**: ${alt.pros.join(', ')}  
**Cons**: ${alt.cons.join(', ')}  
**Effort**: ${alt.effort} | **Risk**: ${alt.risk}
`).join('\n')}

## Risks and Mitigation
${risks.map(risk => `### ${risk.type}
- **Description**: ${risk.description}
- **Impact**: ${risk.impact}
- **Mitigation**: ${risk.mitigation}
`).join('\n')}

## Implementation Plan
**Timeline**: ${analysis.implementation.timeline}

### Phases
${analysis.implementation.phases.map(phase => 
`- **${phase.name}** (${phase.duration}): ${phase.activities[0]}`
).join('\n')}

### Success Metrics
${analysis.implementation.successMetrics.map(m => `- ${m}`).join('\n')}

### Prerequisites
${analysis.implementation.prerequisites.map(p => `- ${p}`).join('\n')}

## Consequences

### Positive
- ${recommendation.benefits.join('\n- ')}
- Clear path forward with defined implementation plan

### Negative
- ${evaluation.find(e => e.name === recommendation.choice).cons.slice(0, 2).join('\n- ')}
- Implementation effort required

### Neutral
- Team will need to adapt to new approach
- Documentation and knowledge transfer required

## References
- Decision analysis completed on ${date}
- Generated by Flow State Dev decision system
`;
  }

  async createDecisionIssue(decision, analysis, filepath) {
    try {
      const issueTitle = `Decision: ${decision}`;
      const issueBody = `## Architecture Decision

A decision has been made regarding: **${decision}**

### Decision Summary
- **Chosen Solution**: ${analysis.recommendation.choice}
- **Confidence**: ${analysis.recommendation.confidence}
- **Timeline**: ${analysis.implementation.timeline}

### Rationale
${analysis.recommendation.reasoning}

### Key Benefits
${analysis.recommendation.benefits.map(b => `- ${b}`).join('\n')}

### ADR Location
\`${filepath}\`

### Next Steps
- [ ] Review decision with stakeholders
- [ ] Approve ADR
- [ ] Create implementation tasks
- [ ] Assign team members
- [ ] Begin preparation phase

---
*Generated by Flow State Dev decision system*`;

      await this.exec(`gh issue create --title "${issueTitle}" --body "${issueBody}" --label "decision,adr"`, { silent: true });
      console.log(chalk.green('✅ Created GitHub issue for decision'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not create GitHub issue:', error.message));
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async writeFile(filepath, content) {
    const fs = await import('fs-extra');
    await fs.writeFile(filepath, content, 'utf8');
  }
}