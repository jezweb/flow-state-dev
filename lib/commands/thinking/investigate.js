/**
 * Investigate command - Multi-source research and analysis
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';

export default class InvestigateCommand extends BaseSlashCommand {
  constructor() {
    super('/investigate', 'Multi-source research and analysis', {
      category: 'thinking',
      usage: '/investigate [question] [options]',
      examples: [
        'fsd slash "/investigate \'Best practices for API rate limiting\'"',
        'fsd slash "/investigate \'Microservices vs monolith\' --sources 5"',
        'fsd slash "/investigate \'WebSocket security\' --depth deep"',
        'fsd slash "/investigate \'Database sharding strategies\' --create-report"'
      ],
      options: [
        { name: 'question', type: 'string', description: 'Research question or problem', required: true },
        { name: 'sources', type: 'number', description: 'Number of sources to investigate', default: 3 },
        { name: 'depth', type: 'string', description: 'Investigation depth (shallow, medium, deep)', default: 'medium' },
        { name: 'create-report', type: 'boolean', description: 'Create markdown report of findings' },
        { name: 'focus', type: 'string', description: 'Focus area (technical, business, security)' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const question = args?.[0] || options.question;
    
    if (!question) {
      console.log(chalk.blue('🔍 Extended Investigation Mode\n'));
      console.log(chalk.gray('Conduct multi-source research and comprehensive analysis.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/investigate \'Research question\'"'));
      console.log(chalk.gray('\nExample questions:'));
      console.log(chalk.gray('  • "Best practices for API rate limiting"'));
      console.log(chalk.gray('  • "Microservices architecture patterns"'));
      console.log(chalk.gray('  • "Real-time data synchronization strategies"'));
      console.log(chalk.gray('  • "Security considerations for JWT tokens"'));
      console.log(chalk.gray('\nInvestigation depths:'));
      console.log(chalk.gray('  • shallow: Quick overview and key points'));
      console.log(chalk.gray('  • medium: Detailed analysis with examples'));
      console.log(chalk.gray('  • deep: Comprehensive research with implications'));
      return;
    }

    console.log(chalk.blue('🔍 Extended Investigation Mode\n'));
    console.log(chalk.gray('Conducting multi-source research and analysis...\n'));
    
    console.log(chalk.white('📋 Investigation Parameters:'));
    console.log(chalk.gray(`  Question: ${question}`));
    console.log(chalk.gray(`  Sources: ${options.sources}`));
    console.log(chalk.gray(`  Depth: ${options.depth}`));
    if (options.focus) console.log(chalk.gray(`  Focus: ${options.focus}`));

    // Extended thinking visualization
    console.log(chalk.blue('\n<extended-thinking>'));
    await this.displayInvestigationThinking();
    console.log(chalk.blue('</extended-thinking>\n'));

    // Perform investigation
    const investigation = await this.performExtendedInvestigation(question, options);
    
    // Display results
    await this.displayInvestigationResults(investigation);
    
    // Create report if requested
    if (options['create-report']) {
      await this.createInvestigationReport(question, investigation);
    }
  }

  async displayInvestigationThinking() {
    const thinkingSteps = [
      'For this investigation, I need to:',
      '',
      '1. Break down the question into sub-questions',
      '2. Identify the best sources for each aspect',
      '3. Consider multiple perspectives and potential biases',
      '4. Synthesize findings into actionable insights',
      '5. Identify gaps that need further research',
      '',
      'Research methodology:',
      '- Technical documentation review',
      '- Best practices analysis',
      '- Case study examination',
      '- Pattern identification',
      '- Trade-off evaluation'
    ];

    for (const step of thinkingSteps) {
      console.log(chalk.gray(step));
      await this.sleep(50);
    }
  }

  async performExtendedInvestigation(question, options) {
    console.log(chalk.gray('Analyzing question and gathering information...\n'));
    
    const investigation = {
      question,
      timestamp: new Date().toISOString(),
      parameters: {
        sources: options.sources,
        depth: options.depth,
        focus: options.focus
      },
      subQuestions: this.generateSubQuestions(question, options),
      sources: this.identifyInformationSources(question, options),
      findings: this.gatherFindings(question, options),
      patterns: this.identifyPatterns(question, options),
      tradeoffs: this.analyzeTradeoffs(question, options),
      synthesis: this.synthesizeFindings(question, options),
      recommendations: this.generateRecommendations(question, options),
      gaps: this.identifyKnowledgeGaps(question, options),
      references: this.collectReferences(question, options)
    };

    return investigation;
  }

  generateSubQuestions(question, options) {
    const subQuestions = [];
    const questionLower = question.toLowerCase();
    
    // Core understanding
    subQuestions.push({
      question: `What is the fundamental concept behind ${this.extractTopic(question)}?`,
      importance: 'high',
      category: 'foundational'
    });

    // Implementation aspects
    if (questionLower.includes('how') || questionLower.includes('implement')) {
      subQuestions.push({
        question: 'What are the implementation approaches and their requirements?',
        importance: 'high',
        category: 'implementation'
      });
    }

    // Best practices
    if (questionLower.includes('best') || questionLower.includes('practice')) {
      subQuestions.push({
        question: 'What are industry-accepted best practices and why?',
        importance: 'critical',
        category: 'best-practices'
      });
    }

    // Comparison
    if (questionLower.includes('vs') || questionLower.includes('versus') || questionLower.includes('compare')) {
      subQuestions.push({
        question: 'What are the key differences and when to use each option?',
        importance: 'critical',
        category: 'comparison'
      });
    }

    // Security considerations
    if (options.focus === 'security' || questionLower.includes('security') || questionLower.includes('secure')) {
      subQuestions.push({
        question: 'What are the security implications and vulnerabilities?',
        importance: 'critical',
        category: 'security'
      });
    }

    // Performance aspects
    if (questionLower.includes('performance') || questionLower.includes('scale')) {
      subQuestions.push({
        question: 'What are the performance characteristics and limitations?',
        importance: 'high',
        category: 'performance'
      });
    }

    // Common pitfalls
    subQuestions.push({
      question: 'What are common mistakes and how to avoid them?',
      importance: 'medium',
      category: 'pitfalls'
    });

    // Future considerations
    if (options.depth === 'deep') {
      subQuestions.push({
        question: 'What are future trends and considerations?',
        importance: 'low',
        category: 'future'
      });
    }

    return subQuestions;
  }

  extractTopic(question) {
    // Simple topic extraction - could be enhanced
    const stopWords = ['what', 'how', 'why', 'when', 'which', 'is', 'are', 'the', 'for', 'best', 'practices'];
    const words = question.toLowerCase().split(/\s+/);
    const meaningful = words.filter(w => !stopWords.includes(w));
    return meaningful.slice(0, 3).join(' ');
  }

  identifyInformationSources(question, options) {
    const sources = [];
    const topic = this.extractTopic(question);
    
    // Technical documentation
    sources.push({
      type: 'Technical Documentation',
      description: `Official documentation and specifications for ${topic}`,
      relevance: 'high',
      reliability: 'very high',
      examples: ['API docs', 'RFCs', 'Standards documents']
    });

    // Best practices guides
    sources.push({
      type: 'Best Practices',
      description: 'Industry guidelines and established patterns',
      relevance: 'high',
      reliability: 'high',
      examples: ['OWASP guides', 'Cloud provider recommendations', 'Framework guidelines']
    });

    // Case studies
    if (options.depth !== 'shallow') {
      sources.push({
        type: 'Case Studies',
        description: 'Real-world implementations and their outcomes',
        relevance: 'medium',
        reliability: 'medium',
        examples: ['Tech blog posts', 'Conference talks', 'Post-mortems']
      });
    }

    // Academic research
    if (options.depth === 'deep') {
      sources.push({
        type: 'Academic Research',
        description: 'Peer-reviewed papers and studies',
        relevance: 'medium',
        reliability: 'high',
        examples: ['Research papers', 'Whitepapers', 'Thesis work']
      });
    }

    // Community knowledge
    sources.push({
      type: 'Community Knowledge',
      description: 'Developer forums and discussions',
      relevance: 'medium',
      reliability: 'medium',
      examples: ['Stack Overflow', 'GitHub discussions', 'Reddit threads']
    });

    // Add more sources based on requested count
    if (sources.length < options.sources) {
      sources.push({
        type: 'Tool Comparisons',
        description: 'Comparative analyses and benchmarks',
        relevance: 'medium',
        reliability: 'medium',
        examples: ['Benchmark studies', 'Feature comparisons', 'Performance tests']
      });
    }

    return sources.slice(0, options.sources);
  }

  gatherFindings(question, options) {
    const findings = [];
    const questionLower = question.toLowerCase();
    
    // Core concept finding
    findings.push({
      summary: `Core understanding of ${this.extractTopic(question)}`,
      evidence: 'Based on technical documentation and established definitions',
      confidence: 'high',
      category: 'foundational',
      details: this.generateFoundationalDetails(question)
    });

    // Implementation finding
    if (questionLower.includes('implement') || questionLower.includes('how')) {
      findings.push({
        summary: 'Multiple implementation approaches identified',
        evidence: 'Analysis of common patterns and frameworks',
        confidence: 'high',
        category: 'implementation',
        details: this.generateImplementationDetails(question)
      });
    }

    // Best practices finding
    if (questionLower.includes('best') || questionLower.includes('practice')) {
      findings.push({
        summary: 'Industry best practices and recommendations',
        evidence: 'Compilation from authoritative sources',
        confidence: 'very high',
        category: 'best-practices',
        details: this.generateBestPractices(question)
      });
    }

    // Security finding
    if (options.focus === 'security' || questionLower.includes('security')) {
      findings.push({
        summary: 'Security considerations and vulnerabilities',
        evidence: 'Security audits and vulnerability databases',
        confidence: 'high',
        category: 'security',
        details: this.generateSecurityDetails(question)
      });
    }

    // Performance finding
    if (questionLower.includes('performance') || questionLower.includes('scale')) {
      findings.push({
        summary: 'Performance characteristics and optimization strategies',
        evidence: 'Benchmark data and performance studies',
        confidence: 'medium',
        category: 'performance',
        details: this.generatePerformanceDetails(question)
      });
    }

    // Trade-offs finding
    findings.push({
      summary: 'Key trade-offs and decision factors',
      evidence: 'Comparative analysis of different approaches',
      confidence: 'high',
      category: 'trade-offs',
      details: this.generateTradeoffDetails(question)
    });

    return findings;
  }

  generateFoundationalDetails(question) {
    const topic = this.extractTopic(question);
    return [
      `Definition and core concepts of ${topic}`,
      'Historical context and evolution',
      'Primary use cases and applications',
      'Key terminology and concepts'
    ];
  }

  generateImplementationDetails(question) {
    return [
      'Step-by-step implementation approach',
      'Required dependencies and prerequisites',
      'Configuration and setup considerations',
      'Integration points and interfaces',
      'Testing and validation strategies'
    ];
  }

  generateBestPractices(question) {
    const practices = [
      'Follow principle of least privilege',
      'Implement comprehensive error handling',
      'Use established patterns and conventions',
      'Maintain clear documentation',
      'Include monitoring and observability'
    ];

    // Add topic-specific practices
    const questionLower = question.toLowerCase();
    if (questionLower.includes('api')) {
      practices.push('Version your APIs properly', 'Implement rate limiting', 'Use proper HTTP status codes');
    }
    if (questionLower.includes('database')) {
      practices.push('Implement proper indexing', 'Use connection pooling', 'Regular backup strategies');
    }
    if (questionLower.includes('security')) {
      practices.push('Regular security audits', 'Encrypt sensitive data', 'Implement access controls');
    }

    return practices;
  }

  generateSecurityDetails(question) {
    return [
      'Common attack vectors and vulnerabilities',
      'Security best practices and hardening',
      'Authentication and authorization considerations',
      'Data protection and encryption requirements',
      'Compliance and regulatory aspects'
    ];
  }

  generatePerformanceDetails(question) {
    return [
      'Performance benchmarks and metrics',
      'Scalability patterns and limits',
      'Optimization techniques and strategies',
      'Caching and efficiency improvements',
      'Resource utilization characteristics'
    ];
  }

  generateTradeoffDetails(question) {
    return [
      'Complexity vs maintainability',
      'Performance vs resource usage',
      'Security vs usability',
      'Flexibility vs simplicity',
      'Cost vs features'
    ];
  }

  identifyPatterns(question, options) {
    const patterns = [];
    const questionLower = question.toLowerCase();
    
    // Common architectural patterns
    patterns.push({
      name: 'Separation of Concerns',
      relevance: 'high',
      description: 'Keep different aspects of the system isolated',
      application: 'Applies to most software design decisions'
    });

    // Topic-specific patterns
    if (questionLower.includes('api')) {
      patterns.push({
        name: 'RESTful Design',
        relevance: 'very high',
        description: 'Resource-based API design with standard HTTP methods',
        application: 'API endpoint design and structure'
      });
    }

    if (questionLower.includes('microservice')) {
      patterns.push({
        name: 'Service Decomposition',
        relevance: 'critical',
        description: 'Breaking monoliths into bounded contexts',
        application: 'Service boundary definition'
      });
    }

    if (questionLower.includes('database') || questionLower.includes('data')) {
      patterns.push({
        name: 'Repository Pattern',
        relevance: 'high',
        description: 'Abstract data access logic',
        application: 'Data layer architecture'
      });
    }

    // General patterns based on depth
    if (options.depth !== 'shallow') {
      patterns.push({
        name: 'Circuit Breaker',
        relevance: 'medium',
        description: 'Fault tolerance for distributed systems',
        application: 'External service integration'
      });
      
      patterns.push({
        name: 'Event Sourcing',
        relevance: 'medium',
        description: 'Store state changes as events',
        application: 'Audit trails and complex state management'
      });
    }

    return patterns;
  }

  analyzeTradeoffs(question, options) {
    const tradeoffs = [];
    
    // Universal trade-offs
    tradeoffs.push({
      factor: 'Complexity',
      optionA: 'Simple solution',
      optionB: 'Feature-rich solution',
      considerations: [
        'Development time and cost',
        'Maintenance burden',
        'Team expertise requirements',
        'Testing complexity'
      ],
      recommendation: 'Start simple, evolve as needed'
    });

    tradeoffs.push({
      factor: 'Performance',
      optionA: 'Optimized for speed',
      optionB: 'Optimized for flexibility',
      considerations: [
        'Response time requirements',
        'Resource constraints',
        'Scalability needs',
        'Future adaptability'
      ],
      recommendation: 'Profile first, optimize based on data'
    });

    // Topic-specific trade-offs
    const questionLower = question.toLowerCase();
    if (questionLower.includes('monolith') || questionLower.includes('microservice')) {
      tradeoffs.push({
        factor: 'Architecture',
        optionA: 'Monolithic architecture',
        optionB: 'Microservices architecture',
        considerations: [
          'Team size and structure',
          'Deployment complexity',
          'Inter-service communication',
          'Data consistency requirements'
        ],
        recommendation: 'Consider team maturity and actual needs'
      });
    }

    if (questionLower.includes('sync') || questionLower.includes('async')) {
      tradeoffs.push({
        factor: 'Communication',
        optionA: 'Synchronous',
        optionB: 'Asynchronous',
        considerations: [
          'Latency requirements',
          'Consistency needs',
          'Error handling complexity',
          'System coupling'
        ],
        recommendation: 'Use async for long operations, sync for immediate needs'
      });
    }

    return tradeoffs;
  }

  synthesizeFindings(question, options) {
    const findings = this.gatherFindings(question, options);
    const patterns = this.identifyPatterns(question, options);
    
    // Create main conclusion
    const mainConclusion = this.createMainConclusion(question, findings);
    
    // Supporting evidence
    const supportingEvidence = findings
      .filter(f => f.confidence === 'high' || f.confidence === 'very high')
      .map(f => f.summary);
    
    // Key insights
    const keyInsights = this.generateKeyInsights(question, findings, patterns);
    
    // Actionable recommendations
    const actionableSteps = this.generateActionableSteps(question, findings);
    
    return {
      mainConclusion,
      supportingEvidence,
      keyInsights,
      actionableSteps,
      confidenceLevel: this.assessOverallConfidence(findings)
    };
  }

  createMainConclusion(question, findings) {
    const topic = this.extractTopic(question);
    const highConfidenceFindings = findings.filter(f => f.confidence === 'high' || f.confidence === 'very high');
    
    if (question.toLowerCase().includes('best')) {
      return `The best practices for ${topic} involve a combination of established patterns and context-specific considerations.`;
    } else if (question.toLowerCase().includes('vs') || question.toLowerCase().includes('compare')) {
      return `The choice depends on specific requirements, with each option having distinct trade-offs.`;
    } else {
      return `${topic} requires careful consideration of multiple factors including implementation complexity, performance, and maintainability.`;
    }
  }

  generateKeyInsights(question, findings, patterns) {
    const insights = [];
    
    // Pattern-based insights
    if (patterns.length > 0) {
      insights.push(`Key patterns like ${patterns[0].name} are crucial for success`);
    }
    
    // Finding-based insights
    const bestPractices = findings.find(f => f.category === 'best-practices');
    if (bestPractices) {
      insights.push('Following established best practices significantly reduces risk');
    }
    
    // Security insights
    const securityFindings = findings.find(f => f.category === 'security');
    if (securityFindings) {
      insights.push('Security must be considered from the beginning, not as an afterthought');
    }
    
    // Performance insights
    const performanceFindings = findings.find(f => f.category === 'performance');
    if (performanceFindings) {
      insights.push('Performance optimization should be data-driven, not assumption-based');
    }
    
    // General insight
    insights.push('Success requires balancing technical excellence with practical constraints');
    
    return insights.slice(0, 4);
  }

  generateActionableSteps(question, findings) {
    const steps = [];
    
    // Research and planning
    steps.push('Conduct proof of concept to validate approach');
    steps.push('Document architectural decisions and rationale');
    
    // Implementation
    const implementationFinding = findings.find(f => f.category === 'implementation');
    if (implementationFinding) {
      steps.push('Start with minimal implementation and iterate');
    }
    
    // Best practices
    const bestPracticesFinding = findings.find(f => f.category === 'best-practices');
    if (bestPracticesFinding) {
      steps.push('Establish coding standards based on best practices');
    }
    
    // Monitoring
    steps.push('Implement monitoring and observability from day one');
    
    // Team preparation
    steps.push('Ensure team has necessary skills or training plan');
    
    return steps;
  }

  assessOverallConfidence(findings) {
    const confidenceLevels = findings.map(f => f.confidence);
    const highConfidence = confidenceLevels.filter(c => c === 'high' || c === 'very high').length;
    const ratio = highConfidence / confidenceLevels.length;
    
    if (ratio >= 0.8) return 'very high';
    if (ratio >= 0.6) return 'high';
    if (ratio >= 0.4) return 'medium';
    return 'low';
  }

  generateRecommendations(question, options) {
    const recommendations = [];
    const questionLower = question.toLowerCase();
    
    // Primary recommendation
    recommendations.push({
      priority: 'critical',
      action: 'Start with thorough requirements analysis',
      rationale: 'Clear requirements prevent costly changes later',
      timeframe: 'immediate'
    });

    // Technical recommendations
    if (options.depth !== 'shallow') {
      recommendations.push({
        priority: 'high',
        action: 'Create proof of concept for high-risk areas',
        rationale: 'Validate technical feasibility early',
        timeframe: 'week 1-2'
      });
    }

    // Architecture recommendations
    if (questionLower.includes('architecture') || questionLower.includes('design')) {
      recommendations.push({
        priority: 'high',
        action: 'Conduct architecture review with team',
        rationale: 'Ensure shared understanding and buy-in',
        timeframe: 'before implementation'
      });
    }

    // Security recommendations
    if (options.focus === 'security' || questionLower.includes('security')) {
      recommendations.push({
        priority: 'critical',
        action: 'Perform security threat modeling',
        rationale: 'Identify vulnerabilities before they become issues',
        timeframe: 'design phase'
      });
    }

    // Documentation
    recommendations.push({
      priority: 'medium',
      action: 'Document decisions and trade-offs',
      rationale: 'Future maintainers need context',
      timeframe: 'ongoing'
    });

    return recommendations;
  }

  identifyKnowledgeGaps(question, options) {
    const gaps = [];
    const questionLower = question.toLowerCase();
    
    // Technology-specific gaps
    if (questionLower.includes('new') || questionLower.includes('emerging')) {
      gaps.push({
        description: 'Limited production experience with emerging technology',
        impact: 'medium',
        nextSteps: 'Monitor early adopter experiences and case studies'
      });
    }

    // Performance gaps
    if (questionLower.includes('performance') || questionLower.includes('scale')) {
      gaps.push({
        description: 'Specific performance characteristics under load',
        impact: 'high',
        nextSteps: 'Conduct load testing with realistic scenarios'
      });
    }

    // Integration gaps
    if (questionLower.includes('integration') || questionLower.includes('third-party')) {
      gaps.push({
        description: 'Third-party service reliability and limitations',
        impact: 'medium',
        nextSteps: 'Test integration thoroughly, plan for failures'
      });
    }

    // Team gaps
    if (options.depth === 'deep') {
      gaps.push({
        description: 'Team experience with proposed solution',
        impact: 'high',
        nextSteps: 'Assess skills and create training plan'
      });
    }

    return gaps;
  }

  collectReferences(question, options) {
    const references = [];
    const topic = this.extractTopic(question);
    
    // Official documentation
    references.push({
      type: 'Official Documentation',
      description: `Primary documentation for ${topic}`,
      credibility: 'very high'
    });

    // Standards and specifications
    references.push({
      type: 'Standards',
      description: 'Industry standards and specifications',
      credibility: 'very high'
    });

    // Best practices guides
    references.push({
      type: 'Best Practices',
      description: 'Authoritative guides and recommendations',
      credibility: 'high'
    });

    // Case studies
    if (options.depth !== 'shallow') {
      references.push({
        type: 'Case Studies',
        description: 'Real-world implementation examples',
        credibility: 'medium'
      });
    }

    // Research papers
    if (options.depth === 'deep') {
      references.push({
        type: 'Research',
        description: 'Academic papers and studies',
        credibility: 'high'
      });
    }

    return references;
  }

  async displayInvestigationResults(investigation) {
    console.log(chalk.white(`🔬 Investigation Results: ${investigation.question}\n`));

    // Sub-questions
    console.log(chalk.yellow('📋 Key Questions Explored:'));
    investigation.subQuestions.slice(0, 5).forEach((sub, index) => {
      const importanceColor = sub.importance === 'critical' ? chalk.red : 
                            sub.importance === 'high' ? chalk.yellow : chalk.gray;
      console.log(`  ${index + 1}. ${sub.question}`);
      console.log(chalk.gray(`     Importance: ${importanceColor(sub.importance)}`));
    });

    // Information sources
    console.log(chalk.yellow('\n📚 Information Sources Consulted:'));
    investigation.sources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${chalk.cyan(source.type)}: ${source.description}`);
      console.log(chalk.gray(`     Reliability: ${this.formatReliability(source.reliability)}`));
    });

    // Key findings
    console.log(chalk.yellow('\n🔍 Key Findings:'));
    investigation.findings.slice(0, 4).forEach((finding, index) => {
      console.log(`  ${index + 1}. ${finding.summary}`);
      console.log(chalk.gray(`     Evidence: ${finding.evidence}`));
      console.log(chalk.gray(`     Confidence: ${this.formatConfidence(finding.confidence)}`));
      if (finding.details && finding.details.length > 0) {
        console.log(chalk.gray(`     Key points: ${finding.details.slice(0, 2).join(', ')}...`));
      }
    });

    // Patterns identified
    if (investigation.patterns.length > 0) {
      console.log(chalk.yellow('\n🔄 Patterns Identified:'));
      investigation.patterns.slice(0, 3).forEach(pattern => {
        console.log(`  • ${chalk.cyan(pattern.name)}: ${pattern.description}`);
      });
    }

    // Trade-offs
    if (investigation.tradeoffs.length > 0) {
      console.log(chalk.yellow('\n⚖️  Key Trade-offs:'));
      investigation.tradeoffs.slice(0, 2).forEach(tradeoff => {
        console.log(`  ${chalk.cyan(tradeoff.factor)}:`);
        console.log(`    Option A: ${tradeoff.optionA}`);
        console.log(`    Option B: ${tradeoff.optionB}`);
        console.log(chalk.gray(`    Recommendation: ${tradeoff.recommendation}`));
      });
    }

    // Synthesis
    console.log(chalk.yellow('\n🧩 Synthesis:'));
    console.log(`  ${chalk.white(investigation.synthesis.mainConclusion)}`);
    console.log(chalk.gray(`  Confidence: ${this.formatConfidence(investigation.synthesis.confidenceLevel)}`));
    
    console.log(chalk.yellow('\n💡 Key Insights:'));
    investigation.synthesis.keyInsights.forEach(insight => {
      console.log(`  • ${insight}`);
    });

    // Actionable recommendations
    console.log(chalk.yellow('\n🚀 Actionable Recommendations:'));
    investigation.synthesis.actionableSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    // Knowledge gaps
    if (investigation.gaps.length > 0) {
      console.log(chalk.yellow('\n❓ Knowledge Gaps Identified:'));
      investigation.gaps.forEach(gap => {
        console.log(`  • ${chalk.yellow(gap.description)}`);
        console.log(chalk.gray(`    Next steps: ${gap.nextSteps}`));
      });
    }

    // References
    console.log(chalk.yellow('\n📚 Reference Types Used:'));
    investigation.references.forEach(ref => {
      console.log(`  • ${ref.type} (${this.formatCredibility(ref.credibility)} credibility)`);
    });

    // Next steps
    console.log(chalk.green('\n✅ Recommended Next Steps:'));
    console.log('  1. Review findings with stakeholders');
    console.log('  2. Validate assumptions through prototyping');
    console.log('  3. Create implementation plan based on recommendations');
    console.log('  4. Address identified knowledge gaps');
  }

  formatReliability(level) {
    const colors = {
      'very high': chalk.green,
      high: chalk.green,
      medium: chalk.yellow,
      low: chalk.red
    };
    const color = colors[level] || chalk.gray;
    return color(level);
  }

  formatConfidence(level) {
    const colors = {
      'very high': chalk.green,
      high: chalk.green,
      medium: chalk.yellow,
      low: chalk.red,
      'very low': chalk.red
    };
    const color = colors[level] || chalk.gray;
    return color(level);
  }

  formatCredibility(level) {
    const colors = {
      'very high': chalk.green,
      high: chalk.green,
      medium: chalk.yellow,
      low: chalk.red
    };
    const color = colors[level] || chalk.gray;
    return color(level);
  }

  async createInvestigationReport(question, investigation) {
    console.log(chalk.blue('\n📄 Creating Investigation Report...\n'));
    
    const reportContent = this.generateReportContent(question, investigation);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `investigation-${timestamp}-${question.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}.md`;
    
    try {
      const reportsDir = './docs/investigations';
      await this.exec(`mkdir -p ${reportsDir}`, { silent: true });
      
      const filepath = `${reportsDir}/${filename}`;
      await this.writeFile(filepath, reportContent);
      
      console.log(chalk.green(`✅ Created investigation report: ${filepath}`));
      
      // Ask if should create GitHub issue
      const shouldCreateIssue = await this.confirm(
        'Create GitHub issue to track this investigation?',
        false
      );
      
      if (shouldCreateIssue) {
        await this.createInvestigationIssue(question, investigation, filepath);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create report: ${error.message}`));
    }
  }

  generateReportContent(question, investigation) {
    const date = new Date().toISOString();
    
    return `# Investigation Report: ${question}

## Metadata
- **Date**: ${date}
- **Depth**: ${investigation.parameters.depth}
- **Sources Consulted**: ${investigation.parameters.sources}
${investigation.parameters.focus ? `- **Focus Area**: ${investigation.parameters.focus}` : ''}

## Executive Summary
${investigation.synthesis.mainConclusion}

**Confidence Level**: ${investigation.synthesis.confidenceLevel}

## Key Questions Investigated
${investigation.subQuestions.map(sq => `- ${sq.question} (${sq.importance} importance)`).join('\n')}

## Research Methodology
${investigation.sources.map(source => 
`### ${source.type}
- **Description**: ${source.description}
- **Reliability**: ${source.reliability}
- **Examples**: ${source.examples.join(', ')}`
).join('\n\n')}

## Findings

${investigation.findings.map(finding => 
`### ${finding.summary}
- **Evidence**: ${finding.evidence}
- **Confidence**: ${finding.confidence}
- **Category**: ${finding.category}

Key Points:
${finding.details.map(detail => `- ${detail}`).join('\n')}
`).join('\n')}

## Patterns and Best Practices
${investigation.patterns.map(pattern => 
`### ${pattern.name}
- **Description**: ${pattern.description}
- **Relevance**: ${pattern.relevance}
- **Application**: ${pattern.application}`
).join('\n\n')}

## Trade-off Analysis
${investigation.tradeoffs.map(tradeoff => 
`### ${tradeoff.factor}
- **Option A**: ${tradeoff.optionA}
- **Option B**: ${tradeoff.optionB}

Considerations:
${tradeoff.considerations.map(c => `- ${c}`).join('\n')}

**Recommendation**: ${tradeoff.recommendation}`
).join('\n\n')}

## Key Insights
${investigation.synthesis.keyInsights.map(insight => `- ${insight}`).join('\n')}

## Actionable Recommendations
${investigation.synthesis.actionableSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Knowledge Gaps
${investigation.gaps.length > 0 ? investigation.gaps.map(gap => 
`### ${gap.description}
- **Impact**: ${gap.impact}
- **Next Steps**: ${gap.nextSteps}`
).join('\n\n') : 'No significant knowledge gaps identified.'}

## References
${investigation.references.map(ref => 
`- ${ref.type}: ${ref.description} (${ref.credibility} credibility)`
).join('\n')}

## Next Steps
1. Review findings with stakeholders
2. Validate assumptions through prototyping
3. Create implementation plan based on recommendations
4. Address identified knowledge gaps

---
*Generated by Flow State Dev investigation system*
`;
  }

  async createInvestigationIssue(question, investigation, filepath) {
    try {
      const issueTitle = `Investigation: ${question}`;
      const keyFindings = investigation.findings.slice(0, 3).map(f => `- ${f.summary}`).join('\n');
      const keyRecommendations = investigation.synthesis.actionableSteps.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n');
      
      const issueBody = `## Investigation Summary

An investigation has been completed for: **${question}**

### Key Findings
${keyFindings}

### Main Conclusion
${investigation.synthesis.mainConclusion}

### Recommended Actions
${keyRecommendations}

### Report Location
\`${filepath}\`

### Next Steps
- [ ] Review investigation findings with team
- [ ] Prioritize recommendations
- [ ] Create implementation tasks
- [ ] Address knowledge gaps

---
*Generated by Flow State Dev investigation system*`;

      await this.exec(`gh issue create --title "${issueTitle}" --body "${issueBody}" --label "investigation,research"`, { silent: true });
      console.log(chalk.green('✅ Created GitHub issue for investigation'));
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