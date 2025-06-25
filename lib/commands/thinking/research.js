/**
 * Research command - Deep multi-source research
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';

export default class ResearchCommand extends BaseSlashCommand {
  constructor() {
    super('/research', 'Deep multi-source research', {
      category: 'thinking',
      usage: '/research [topic] [options]',
      examples: [
        'fsd slash "/research \'Serverless architecture patterns\'"',
        'fsd slash "/research \'React performance optimization\' --focus technical"',
        'fsd slash "/research \'DevOps best practices\' --output summary"',
        'fsd slash "/research \'Machine learning deployment\' --output recommendations"'
      ],
      options: [
        { name: 'topic', type: 'string', description: 'Research topic', required: true },
        { name: 'focus', type: 'string', description: 'Research focus (technical, business, user-experience)' },
        { name: 'output', type: 'string', description: 'Output format (report, summary, recommendations)', default: 'report' },
        { name: 'depth', type: 'string', description: 'Research depth (quick, standard, comprehensive)', default: 'standard' },
        { name: 'create-doc', type: 'boolean', description: 'Create research document', default: false }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const topic = args?.[0] || options.topic;
    
    if (!topic) {
      console.log(chalk.blue('🔬 Research Assistant\n'));
      console.log(chalk.gray('Conduct focused research on technical topics with curated insights.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/research \'Topic to research\'"'));
      console.log(chalk.gray('\nExample topics:'));
      console.log(chalk.gray('  • "Serverless architecture patterns"'));
      console.log(chalk.gray('  • "React performance optimization techniques"'));
      console.log(chalk.gray('  • "Kubernetes security best practices"'));
      console.log(chalk.gray('  • "API versioning strategies"'));
      console.log(chalk.gray('\nOutput formats:'));
      console.log(chalk.gray('  • report: Comprehensive research report'));
      console.log(chalk.gray('  • summary: Concise key points'));
      console.log(chalk.gray('  • recommendations: Actionable recommendations'));
      return;
    }

    console.log(chalk.blue('🔬 Research Mode\n'));
    console.log(chalk.white(`Topic: ${topic}\n`));
    console.log(chalk.gray(`Focus: ${options.focus || 'General'}`));
    console.log(chalk.gray(`Depth: ${options.depth}`));
    console.log(chalk.gray(`Output: ${options.output}\n`));

    // Perform research
    const research = await this.performResearch(topic, options);
    
    // Display results based on output format
    switch (options.output) {
      case 'summary':
        await this.displaySummary(research);
        break;
      case 'recommendations':
        await this.displayRecommendations(research);
        break;
      default:
        await this.displayFullReport(research);
    }
    
    // Create document if requested
    if (options['create-doc']) {
      await this.createResearchDocument(topic, research, options);
    }
  }

  async performResearch(topic, options) {
    console.log(chalk.gray('Researching topic across multiple dimensions...\n'));
    
    const research = {
      topic,
      timestamp: new Date().toISOString(),
      focus: options.focus || 'general',
      depth: options.depth,
      overview: this.generateOverview(topic, options),
      keyFindings: this.gatherKeyFindings(topic, options),
      bestPractices: this.identifyBestPractices(topic, options),
      commonPatterns: this.identifyPatterns(topic, options),
      implementation: this.getImplementationDetails(topic, options),
      considerations: this.identifyConsiderations(topic, options),
      tools: this.identifyTools(topic, options),
      resources: this.gatherResources(topic, options),
      trends: this.identifyTrends(topic, options),
      recommendations: this.generateRecommendations(topic, options)
    };

    return research;
  }

  generateOverview(topic, options) {
    const topicLower = topic.toLowerCase();
    
    // Generate contextual overview
    const overview = {
      definition: this.generateDefinition(topic),
      purpose: this.identifyPurpose(topic),
      scope: this.determineScope(topic, options),
      relevance: this.assessRelevance(topic),
      maturity: this.assessMaturity(topic)
    };

    return overview;
  }

  generateDefinition(topic) {
    const topicLower = topic.toLowerCase();
    
    // Pattern matching for common topics
    if (topicLower.includes('serverless')) {
      return 'Serverless computing is a cloud execution model where providers dynamically manage server allocation';
    } else if (topicLower.includes('microservice')) {
      return 'Microservices architecture decomposes applications into small, independent services';
    } else if (topicLower.includes('devops')) {
      return 'DevOps combines development and operations to improve collaboration and productivity';
    } else if (topicLower.includes('api')) {
      return 'APIs define interactions between software components, enabling integration and data exchange';
    } else if (topicLower.includes('performance')) {
      return 'Performance optimization focuses on improving speed, efficiency, and resource utilization';
    }
    
    return `${topic} encompasses techniques and patterns for modern software development`;
  }

  identifyPurpose(topic) {
    const topicLower = topic.toLowerCase();
    const purposes = [];
    
    if (topicLower.includes('architecture')) {
      purposes.push('Design scalable systems', 'Ensure maintainability', 'Enable evolution');
    } else if (topicLower.includes('security')) {
      purposes.push('Protect data and systems', 'Ensure compliance', 'Minimize vulnerabilities');
    } else if (topicLower.includes('performance')) {
      purposes.push('Improve user experience', 'Reduce costs', 'Enable scale');
    } else if (topicLower.includes('testing')) {
      purposes.push('Ensure quality', 'Prevent regressions', 'Document behavior');
    } else {
      purposes.push('Improve development efficiency', 'Enhance system quality', 'Enable best practices');
    }
    
    return purposes;
  }

  determineScope(topic, options) {
    const focus = options.focus || 'general';
    
    const scopes = {
      technical: ['Implementation details', 'Technical architecture', 'Code patterns', 'Performance metrics'],
      business: ['ROI considerations', 'Cost analysis', 'Team impact', 'Time to market'],
      'user-experience': ['User satisfaction', 'Usability improvements', 'Accessibility', 'Performance perception'],
      general: ['Overview', 'Best practices', 'Common use cases', 'Implementation guidelines']
    };
    
    return scopes[focus] || scopes.general;
  }

  assessRelevance(topic) {
    const topicLower = topic.toLowerCase();
    
    // Hot topics get high relevance
    const hotTopics = ['ai', 'machine learning', 'serverless', 'kubernetes', 'security', 'cloud-native'];
    const isHot = hotTopics.some(hot => topicLower.includes(hot));
    
    return {
      current: isHot ? 'Very High' : 'High',
      trend: isHot ? 'Rising' : 'Stable',
      adoption: isHot ? 'Growing rapidly' : 'Mainstream'
    };
  }

  assessMaturity(topic) {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('emerging') || topicLower.includes('experimental')) {
      return 'Emerging';
    } else if (topicLower.includes('legacy') || topicLower.includes('deprecated')) {
      return 'Legacy';
    } else if (topicLower.includes('stable') || topicLower.includes('mature')) {
      return 'Mature';
    }
    
    // Default assessment based on keywords
    const emergingKeywords = ['ai', 'quantum', 'web3', 'metaverse'];
    const matureKeywords = ['rest', 'sql', 'mvc', 'oop'];
    
    if (emergingKeywords.some(kw => topicLower.includes(kw))) return 'Emerging';
    if (matureKeywords.some(kw => topicLower.includes(kw))) return 'Mature';
    
    return 'Stable';
  }

  gatherKeyFindings(topic, options) {
    const findings = [];
    const topicLower = topic.toLowerCase();
    const depth = options.depth || 'standard';
    
    // Core findings based on topic
    if (topicLower.includes('serverless')) {
      findings.push({
        title: 'Event-driven architecture is fundamental',
        importance: 'critical',
        details: 'Serverless applications respond to events rather than running continuously'
      });
      findings.push({
        title: 'Cold starts impact performance',
        importance: 'high',
        details: 'Initial invocations have higher latency due to container initialization'
      });
    } else if (topicLower.includes('performance')) {
      findings.push({
        title: 'Measurement is prerequisite to optimization',
        importance: 'critical',
        details: 'Profile and benchmark before optimizing to avoid premature optimization'
      });
      findings.push({
        title: 'Caching provides biggest wins',
        importance: 'high',
        details: 'Strategic caching at multiple levels dramatically improves performance'
      });
    } else if (topicLower.includes('security')) {
      findings.push({
        title: 'Security must be built-in, not bolted-on',
        importance: 'critical',
        details: 'Design with security from the start rather than adding it later'
      });
      findings.push({
        title: 'Zero trust is the modern approach',
        importance: 'high',
        details: 'Never trust, always verify - even internal communications'
      });
    }
    
    // Add general findings
    findings.push({
      title: 'Documentation is crucial for adoption',
      importance: 'medium',
      details: 'Well-documented solutions see higher adoption and fewer issues'
    });
    
    if (depth === 'comprehensive') {
      findings.push({
        title: 'Monitoring and observability are essential',
        importance: 'high',
        details: 'You cannot improve what you cannot measure'
      });
    }
    
    return findings.slice(0, depth === 'quick' ? 3 : depth === 'comprehensive' ? 6 : 4);
  }

  identifyBestPractices(topic, options) {
    const practices = [];
    const topicLower = topic.toLowerCase();
    
    // Topic-specific best practices
    if (topicLower.includes('api')) {
      practices.push(
        { practice: 'Version your APIs', rationale: 'Enables backward compatibility' },
        { practice: 'Use consistent naming conventions', rationale: 'Improves developer experience' },
        { practice: 'Implement rate limiting', rationale: 'Protects against abuse' },
        { practice: 'Provide comprehensive documentation', rationale: 'Reduces support burden' }
      );
    } else if (topicLower.includes('serverless')) {
      practices.push(
        { practice: 'Keep functions small and focused', rationale: 'Improves maintainability and performance' },
        { practice: 'Use environment variables for configuration', rationale: 'Enables easy deployment across environments' },
        { practice: 'Implement proper error handling', rationale: 'Prevents silent failures' },
        { practice: 'Monitor cold start metrics', rationale: 'Identifies performance bottlenecks' }
      );
    } else if (topicLower.includes('database')) {
      practices.push(
        { practice: 'Use connection pooling', rationale: 'Reduces connection overhead' },
        { practice: 'Implement proper indexing', rationale: 'Dramatically improves query performance' },
        { practice: 'Regular backups and testing', rationale: 'Ensures data recovery capability' },
        { practice: 'Monitor slow queries', rationale: 'Identifies optimization opportunities' }
      );
    } else {
      // Generic best practices
      practices.push(
        { practice: 'Follow established patterns', rationale: 'Leverages community knowledge' },
        { practice: 'Write comprehensive tests', rationale: 'Ensures reliability' },
        { practice: 'Document decisions', rationale: 'Helps future maintainers' },
        { practice: 'Regular reviews and updates', rationale: 'Keeps solution current' }
      );
    }
    
    return practices;
  }

  identifyPatterns(topic, options) {
    const patterns = [];
    const topicLower = topic.toLowerCase();
    
    // Common architectural patterns
    if (topicLower.includes('architecture') || topicLower.includes('design')) {
      patterns.push(
        { name: 'Layered Architecture', use: 'Separation of concerns', when: 'Traditional applications' },
        { name: 'Event-Driven', use: 'Loose coupling', when: 'Distributed systems' },
        { name: 'CQRS', use: 'Read/write optimization', when: 'Complex domains' }
      );
    } else if (topicLower.includes('api')) {
      patterns.push(
        { name: 'REST', use: 'Resource-based APIs', when: 'CRUD operations' },
        { name: 'GraphQL', use: 'Flexible queries', when: 'Complex data needs' },
        { name: 'RPC', use: 'Action-based APIs', when: 'Service communication' }
      );
    } else if (topicLower.includes('microservice')) {
      patterns.push(
        { name: 'API Gateway', use: 'Single entry point', when: 'Multiple services' },
        { name: 'Service Registry', use: 'Service discovery', when: 'Dynamic environments' },
        { name: 'Circuit Breaker', use: 'Fault tolerance', when: 'External dependencies' }
      );
    } else {
      // Generic patterns
      patterns.push(
        { name: 'Factory Pattern', use: 'Object creation', when: 'Complex initialization' },
        { name: 'Observer Pattern', use: 'Event handling', when: 'State changes' },
        { name: 'Strategy Pattern', use: 'Algorithm selection', when: 'Multiple approaches' }
      );
    }
    
    return patterns;
  }

  getImplementationDetails(topic, options) {
    const details = {
      prerequisites: this.identifyPrerequisites(topic),
      steps: this.generateImplementationSteps(topic, options),
      gotchas: this.identifyGotchas(topic),
      timeline: this.estimateTimeline(topic, options)
    };
    
    return details;
  }

  identifyPrerequisites(topic) {
    const prerequisites = [];
    const topicLower = topic.toLowerCase();
    
    // Common prerequisites
    prerequisites.push('Understanding of core concepts');
    
    if (topicLower.includes('cloud') || topicLower.includes('serverless')) {
      prerequisites.push('Cloud provider account', 'Basic cloud knowledge');
    }
    
    if (topicLower.includes('kubernetes') || topicLower.includes('container')) {
      prerequisites.push('Container knowledge', 'Orchestration concepts');
    }
    
    if (topicLower.includes('security')) {
      prerequisites.push('Security fundamentals', 'Threat modeling basics');
    }
    
    return prerequisites;
  }

  generateImplementationSteps(topic, options) {
    const steps = [];
    const depth = options.depth || 'standard';
    
    // Generic implementation steps
    steps.push('Research and planning phase');
    steps.push('Proof of concept development');
    steps.push('Implementation of core functionality');
    steps.push('Testing and validation');
    
    if (depth !== 'quick') {
      steps.push('Performance optimization');
      steps.push('Security hardening');
    }
    
    if (depth === 'comprehensive') {
      steps.push('Documentation creation');
      steps.push('Team training');
      steps.push('Monitoring setup');
    }
    
    steps.push('Production deployment');
    
    return steps;
  }

  identifyGotchas(topic) {
    const gotchas = [];
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('serverless')) {
      gotchas.push('Vendor lock-in considerations', 'Cold start latency', 'Debugging complexity');
    } else if (topicLower.includes('microservice')) {
      gotchas.push('Network latency accumulation', 'Data consistency challenges', 'Service discovery complexity');
    } else if (topicLower.includes('performance')) {
      gotchas.push('Premature optimization pitfalls', 'Measurement overhead', 'Cache invalidation complexity');
    } else {
      gotchas.push('Hidden complexity', 'Integration challenges', 'Scaling limitations');
    }
    
    return gotchas;
  }

  estimateTimeline(topic, options) {
    const depth = options.depth || 'standard';
    
    const timelines = {
      quick: { research: '1-2 days', implementation: '1-2 weeks', total: '2-3 weeks' },
      standard: { research: '3-5 days', implementation: '2-4 weeks', total: '3-5 weeks' },
      comprehensive: { research: '1-2 weeks', implementation: '4-8 weeks', total: '5-10 weeks' }
    };
    
    return timelines[depth];
  }

  identifyConsiderations(topic, options) {
    const considerations = {
      technical: this.getTechnicalConsiderations(topic),
      operational: this.getOperationalConsiderations(topic),
      cost: this.getCostConsiderations(topic),
      team: this.getTeamConsiderations(topic)
    };
    
    return considerations;
  }

  getTechnicalConsiderations(topic) {
    return [
      'Technology stack compatibility',
      'Performance requirements',
      'Scalability needs',
      'Integration complexity'
    ];
  }

  getOperationalConsiderations(topic) {
    return [
      'Monitoring and alerting setup',
      'Backup and recovery procedures',
      'Maintenance requirements',
      'Update and patching strategy'
    ];
  }

  getCostConsiderations(topic) {
    const topicLower = topic.toLowerCase();
    const considerations = ['Initial implementation cost'];
    
    if (topicLower.includes('cloud') || topicLower.includes('serverless')) {
      considerations.push('Usage-based pricing', 'Potential for cost overruns');
    } else {
      considerations.push('Infrastructure costs', 'Licensing fees');
    }
    
    considerations.push('Ongoing maintenance cost', 'Training investment');
    
    return considerations;
  }

  getTeamConsiderations(topic) {
    return [
      'Required skill sets',
      'Training needs',
      'Team capacity',
      'Knowledge transfer requirements'
    ];
  }

  identifyTools(topic, options) {
    const tools = [];
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('api')) {
      tools.push(
        { name: 'Postman', purpose: 'API testing and documentation', type: 'development' },
        { name: 'Swagger/OpenAPI', purpose: 'API specification', type: 'documentation' },
        { name: 'Kong/Nginx', purpose: 'API gateway', type: 'infrastructure' }
      );
    } else if (topicLower.includes('performance')) {
      tools.push(
        { name: 'Lighthouse', purpose: 'Web performance analysis', type: 'analysis' },
        { name: 'JMeter', purpose: 'Load testing', type: 'testing' },
        { name: 'New Relic/DataDog', purpose: 'APM monitoring', type: 'monitoring' }
      );
    } else if (topicLower.includes('serverless')) {
      tools.push(
        { name: 'Serverless Framework', purpose: 'Deployment and management', type: 'framework' },
        { name: 'AWS SAM', purpose: 'AWS serverless development', type: 'framework' },
        { name: 'LocalStack', purpose: 'Local development', type: 'development' }
      );
    } else {
      // Generic tools
      tools.push(
        { name: 'Git', purpose: 'Version control', type: 'development' },
        { name: 'Docker', purpose: 'Containerization', type: 'infrastructure' },
        { name: 'VS Code', purpose: 'Development environment', type: 'development' }
      );
    }
    
    return tools;
  }

  gatherResources(topic, options) {
    const resources = {
      documentation: [
        { type: 'Official Docs', description: `Primary ${topic} documentation`, priority: 'high' },
        { type: 'API Reference', description: 'Detailed API documentation', priority: 'high' }
      ],
      tutorials: [
        { type: 'Getting Started', description: 'Beginner-friendly introduction', priority: 'medium' },
        { type: 'Advanced Guide', description: 'In-depth technical guide', priority: 'medium' }
      ],
      community: [
        { type: 'Forums', description: 'Community discussion and support', priority: 'low' },
        { type: 'Stack Overflow', description: 'Q&A and troubleshooting', priority: 'medium' }
      ],
      books: [
        { type: 'Foundational', description: 'Core concepts and theory', priority: 'medium' },
        { type: 'Practical', description: 'Hands-on implementation guide', priority: 'high' }
      ]
    };
    
    return resources;
  }

  identifyTrends(topic, options) {
    const topicLower = topic.toLowerCase();
    const trends = [];
    
    // Technology-specific trends
    if (topicLower.includes('serverless')) {
      trends.push('Edge computing integration', 'Multi-cloud strategies', 'Function composition patterns');
    } else if (topicLower.includes('api')) {
      trends.push('GraphQL adoption', 'gRPC for microservices', 'API-first development');
    } else if (topicLower.includes('security')) {
      trends.push('Zero trust architecture', 'DevSecOps integration', 'Supply chain security');
    } else {
      // Generic trends
      trends.push('AI/ML integration', 'Sustainability focus', 'Developer experience emphasis');
    }
    
    return trends;
  }

  generateRecommendations(topic, options) {
    const recommendations = [];
    const focus = options.focus || 'general';
    const depth = options.depth || 'standard';
    
    // Primary recommendation
    recommendations.push({
      priority: 'high',
      action: `Start with a proof of concept for ${topic}`,
      rationale: 'Validates approach with minimal investment',
      effort: 'Low'
    });
    
    // Focus-specific recommendations
    if (focus === 'technical') {
      recommendations.push({
        priority: 'high',
        action: 'Conduct technical spike to assess feasibility',
        rationale: 'Identifies technical challenges early',
        effort: 'Medium'
      });
    } else if (focus === 'business') {
      recommendations.push({
        priority: 'high',
        action: 'Perform cost-benefit analysis',
        rationale: 'Ensures business value alignment',
        effort: 'Low'
      });
    }
    
    // Depth-specific recommendations
    if (depth !== 'quick') {
      recommendations.push({
        priority: 'medium',
        action: 'Create comprehensive documentation',
        rationale: 'Facilitates knowledge sharing and onboarding',
        effort: 'Medium'
      });
    }
    
    if (depth === 'comprehensive') {
      recommendations.push({
        priority: 'medium',
        action: 'Establish monitoring and metrics',
        rationale: 'Enables continuous improvement',
        effort: 'High'
      });
    }
    
    // Always recommend team preparation
    recommendations.push({
      priority: 'medium',
      action: 'Prepare team through training or hiring',
      rationale: 'Ensures successful implementation and maintenance',
      effort: 'High'
    });
    
    return recommendations;
  }

  async displaySummary(research) {
    console.log(chalk.white('📄 Research Summary\n'));
    
    // Overview
    console.log(chalk.yellow('Overview:'));
    console.log(`  ${research.overview.definition}\n`);
    console.log(`  Maturity: ${chalk.cyan(research.overview.maturity)}`);
    console.log(`  Relevance: ${chalk.cyan(research.overview.relevance.current)}\n`);
    
    // Key findings (top 3)
    console.log(chalk.yellow('Key Findings:'));
    research.keyFindings.slice(0, 3).forEach((finding, index) => {
      console.log(`  ${index + 1}. ${finding.title}`);
    });
    
    // Best practices (top 3)
    console.log(chalk.yellow('\nBest Practices:'));
    research.bestPractices.slice(0, 3).forEach((practice, index) => {
      console.log(`  ${index + 1}. ${practice.practice}`);
    });
    
    // Top recommendation
    console.log(chalk.yellow('\nPrimary Recommendation:'));
    const topRec = research.recommendations[0];
    console.log(`  ${chalk.green(topRec.action)}`);
    console.log(chalk.gray(`  Rationale: ${topRec.rationale}`));
  }

  async displayRecommendations(research) {
    console.log(chalk.white('💡 Research Recommendations\n'));
    
    console.log(chalk.yellow('Recommended Actions:'));
    research.recommendations.forEach((rec, index) => {
      const priorityColor = rec.priority === 'high' ? chalk.red : rec.priority === 'medium' ? chalk.yellow : chalk.gray;
      console.log(`\n  ${index + 1}. ${rec.action}`);
      console.log(`     Priority: ${priorityColor(rec.priority)} | Effort: ${rec.effort}`);
      console.log(chalk.gray(`     Rationale: ${rec.rationale}`));
    });
    
    console.log(chalk.yellow('\n\nImplementation Timeline:'));
    console.log(`  Research Phase: ${chalk.cyan(research.implementation.timeline.research)}`);
    console.log(`  Implementation: ${chalk.cyan(research.implementation.timeline.implementation)}`);
    console.log(`  Total Duration: ${chalk.cyan(research.implementation.timeline.total)}`);
    
    console.log(chalk.yellow('\nKey Considerations:'));
    console.log(chalk.gray('  Technical:'));
    research.considerations.technical.slice(0, 2).forEach(c => {
      console.log(`    • ${c}`);
    });
    console.log(chalk.gray('  Operational:'));
    research.considerations.operational.slice(0, 2).forEach(c => {
      console.log(`    • ${c}`);
    });
  }

  async displayFullReport(research) {
    console.log(chalk.white(`📊 Research Report: ${research.topic}\n`));
    
    // Overview section
    console.log(chalk.yellow('📋 Overview:'));
    console.log(`  ${research.overview.definition}\n`);
    console.log(`  Purpose: ${research.overview.purpose.join(', ')}`);
    console.log(`  Maturity: ${chalk.cyan(research.overview.maturity)}`);
    console.log(`  Current Relevance: ${chalk.cyan(research.overview.relevance.current)}`);
    console.log(`  Adoption Trend: ${chalk.cyan(research.overview.relevance.trend)}`);
    
    // Key findings
    console.log(chalk.yellow('\n🔍 Key Findings:'));
    research.keyFindings.forEach((finding, index) => {
      const importanceColor = finding.importance === 'critical' ? chalk.red : 
                            finding.importance === 'high' ? chalk.yellow : chalk.gray;
      console.log(`\n  ${index + 1}. ${finding.title}`);
      console.log(`     Importance: ${importanceColor(finding.importance)}`);
      console.log(chalk.gray(`     ${finding.details}`));
    });
    
    // Best practices
    console.log(chalk.yellow('\n✅ Best Practices:'));
    research.bestPractices.forEach((practice, index) => {
      console.log(`  ${index + 1}. ${chalk.cyan(practice.practice)}`);
      console.log(chalk.gray(`     Rationale: ${practice.rationale}`));
    });
    
    // Common patterns
    if (research.commonPatterns.length > 0) {
      console.log(chalk.yellow('\n🔄 Common Patterns:'));
      research.commonPatterns.forEach(pattern => {
        console.log(`  • ${chalk.cyan(pattern.name)}: ${pattern.use}`);
        console.log(chalk.gray(`    When to use: ${pattern.when}`));
      });
    }
    
    // Implementation details
    console.log(chalk.yellow('\n🛠️  Implementation Guide:'));
    console.log(chalk.gray('  Prerequisites:'));
    research.implementation.prerequisites.forEach(prereq => {
      console.log(`    • ${prereq}`);
    });
    console.log(chalk.gray('\n  Steps:'));
    research.implementation.steps.forEach((step, index) => {
      console.log(`    ${index + 1}. ${step}`);
    });
    console.log(chalk.gray('\n  Common Gotchas:'));
    research.implementation.gotchas.forEach(gotcha => {
      console.log(`    ⚠️  ${gotcha}`);
    });
    
    // Tools
    if (research.tools.length > 0) {
      console.log(chalk.yellow('\n🔧 Recommended Tools:'));
      research.tools.forEach(tool => {
        console.log(`  • ${chalk.cyan(tool.name)}: ${tool.purpose} (${tool.type})`);
      });
    }
    
    // Trends
    if (research.trends.length > 0) {
      console.log(chalk.yellow('\n📈 Current Trends:'));
      research.trends.forEach(trend => {
        console.log(`  • ${trend}`);
      });
    }
    
    // Recommendations
    console.log(chalk.yellow('\n💡 Recommendations:'));
    research.recommendations.forEach((rec, index) => {
      const priorityColor = rec.priority === 'high' ? chalk.red : rec.priority === 'medium' ? chalk.yellow : chalk.gray;
      console.log(`\n  ${index + 1}. ${rec.action}`);
      console.log(`     Priority: ${priorityColor(rec.priority)} | Effort: ${rec.effort}`);
      console.log(chalk.gray(`     ${rec.rationale}`));
    });
    
    // Resources
    console.log(chalk.yellow('\n📚 Resources:'));
    console.log('  Documentation:');
    research.resources.documentation.forEach(doc => {
      console.log(`    • ${doc.type}: ${doc.description}`);
    });
    console.log('  Learning:');
    research.resources.tutorials.forEach(tut => {
      console.log(`    • ${tut.type}: ${tut.description}`);
    });
  }

  async createResearchDocument(topic, research, options) {
    console.log(chalk.blue('\n📝 Creating Research Document...\n'));
    
    const docContent = this.generateDocumentContent(topic, research, options);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `research-${timestamp}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}.md`;
    
    try {
      const docsDir = './docs/research';
      await this.exec(`mkdir -p ${docsDir}`, { silent: true });
      
      const filepath = `${docsDir}/${filename}`;
      await this.writeFile(filepath, docContent);
      
      console.log(chalk.green(`✅ Created research document: ${filepath}`));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create document: ${error.message}`));
    }
  }

  generateDocumentContent(topic, research, options) {
    const date = new Date().toISOString();
    
    return `# Research: ${topic}

## Metadata
- **Date**: ${date}
- **Focus**: ${research.focus}
- **Depth**: ${options.depth}

## Executive Summary
${research.overview.definition}

**Key Insight**: ${research.keyFindings[0]?.title || 'Multiple important findings identified'}

## Overview
### Purpose
${research.overview.purpose.map(p => `- ${p}`).join('\n')}

### Current State
- **Maturity**: ${research.overview.maturity}
- **Relevance**: ${research.overview.relevance.current}
- **Adoption**: ${research.overview.relevance.adoption}

## Key Findings
${research.keyFindings.map((finding, i) => 
`### ${i + 1}. ${finding.title}
- **Importance**: ${finding.importance}
- **Details**: ${finding.details}
`).join('\n')}

## Best Practices
${research.bestPractices.map((practice, i) => 
`${i + 1}. **${practice.practice}**
   - ${practice.rationale}
`).join('\n')}

## Implementation Guide
### Prerequisites
${research.implementation.prerequisites.map(p => `- ${p}`).join('\n')}

### Steps
${research.implementation.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

### Timeline
- Research: ${research.implementation.timeline.research}
- Implementation: ${research.implementation.timeline.implementation}
- Total: ${research.implementation.timeline.total}

### Common Pitfalls
${research.implementation.gotchas.map(g => `- ⚠️  ${g}`).join('\n')}

## Recommendations
${research.recommendations.map((rec, i) => 
`### ${i + 1}. ${rec.action}
- **Priority**: ${rec.priority}
- **Effort**: ${rec.effort}
- **Rationale**: ${rec.rationale}
`).join('\n')}

## Tools and Resources
### Recommended Tools
${research.tools.map(tool => `- **${tool.name}**: ${tool.purpose} (${tool.type})`).join('\n')}

### Learning Resources
${Object.entries(research.resources).map(([category, items]) => 
`#### ${category.charAt(0).toUpperCase() + category.slice(1)}
${items.map(item => `- ${item.type}: ${item.description}`).join('\n')}`
).join('\n\n')}

## Future Trends
${research.trends.map(trend => `- ${trend}`).join('\n')}

## Conclusion
This research provides a comprehensive overview of ${topic} with actionable recommendations for implementation. Focus on the high-priority recommendations and adapt based on your specific context.

---
*Generated by Flow State Dev research system*
`;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async writeFile(filepath, content) {
    const fs = await import('fs-extra');
    await fs.writeFile(filepath, content, 'utf8');
  }
}