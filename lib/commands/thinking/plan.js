/**
 * Plan command - Deep planning with extended thinking mode
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';

export default class PlanCommand extends BaseSlashCommand {
  constructor() {
    super('/plan', 'Deep planning with extended thinking mode', {
      category: 'thinking',
      usage: '/plan [topic] [options]',
      examples: [
        'fsd slash "/plan \'New authentication system\'"',
        'fsd slash "/plan \'API redesign\' --scope architecture"',
        'fsd slash "/plan \'Mobile app\' --timeline 3months --create-adr"',
        'fsd slash "/plan \'Performance optimization\' --scope project"'
      ],
      options: [
        { name: 'topic', type: 'string', description: 'Topic to plan', required: true },
        { name: 'scope', type: 'string', description: 'Planning scope (feature, project, architecture)', default: 'feature' },
        { name: 'create-adr', type: 'boolean', description: 'Create Architecture Decision Record' },
        { name: 'timeline', type: 'string', description: 'Planning timeline (weeks/months)' },
        { name: 'depth', type: 'string', description: 'Analysis depth (shallow, medium, deep)', default: 'deep' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const topic = args?.[0] || options.topic;
    
    if (!topic) {
      console.log(chalk.blue('🧠 Extended Planning Mode\n'));
      console.log(chalk.gray('Perform deep planning with comprehensive analysis and extended thinking.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/plan \'Topic to plan\'"'));
      console.log(chalk.gray('\nExample topics:'));
      console.log(chalk.gray('  • "New authentication system"'));
      console.log(chalk.gray('  • "API rate limiting strategy"'));
      console.log(chalk.gray('  • "Database migration approach"'));
      console.log(chalk.gray('  • "Microservices architecture"'));
      console.log(chalk.gray('\nPlanning scopes:'));
      console.log(chalk.gray('  • feature: Single feature planning'));
      console.log(chalk.gray('  • project: Full project planning'));
      console.log(chalk.gray('  • architecture: System architecture planning'));
      return;
    }

    console.log(chalk.blue('🧠 Extended Planning Mode\n'));
    console.log(chalk.gray('Entering extended thinking mode for comprehensive planning...\n'));
    
    console.log(chalk.white('🔍 Initial Analysis:'));
    console.log(chalk.gray(`  Topic: ${topic}`));
    console.log(chalk.gray(`  Scope: ${options.scope}`));
    if (options.timeline) console.log(chalk.gray(`  Timeline: ${options.timeline}`));
    console.log(chalk.gray(`  Depth: ${options.depth}`));

    // Extended thinking visualization
    console.log(chalk.blue('\n<extended-thinking>'));
    await this.displayThinkingProcess();
    console.log(chalk.blue('</extended-thinking>\n'));

    // Perform deep analysis
    const analysis = await this.performExtendedPlanning(topic, options);
    
    // Display comprehensive results
    await this.displayPlanningResults(analysis, options);
    
    // Create ADR if requested
    if (options['create-adr']) {
      await this.createArchitectureDecisionRecord(topic, analysis);
    }
  }

  async displayThinkingProcess() {
    const thinkingSteps = [
      '1. CONTEXT ANALYSIS',
      '   - What is the current state?',
      '   - What are the stakeholder needs?',
      '   - What constraints exist?',
      '',
      '2. GOAL DECOMPOSITION',
      '   - Primary objectives',
      '   - Secondary benefits',
      '   - Success metrics',
      '',
      '3. APPROACH EVALUATION',
      '   - Multiple solution paths',
      '   - Risk assessment for each',
      '   - Resource requirements',
      '',
      '4. IMPLEMENTATION STRATEGY',
      '   - Phase breakdown',
      '   - Dependencies and blockers',
      '   - Validation checkpoints',
      '',
      '5. CONTINGENCY PLANNING',
      '   - Risk mitigation strategies',
      '   - Fallback options',
      '   - Decision points'
    ];

    for (const step of thinkingSteps) {
      console.log(chalk.gray(step));
      await this.sleep(50); // Simulate thinking
    }
  }

  async performExtendedPlanning(topic, options) {
    console.log(chalk.gray('Analyzing topic across multiple dimensions...\n'));
    
    const analysis = {
      topic,
      scope: options.scope,
      timeline: this.parseTimeline(options.timeline),
      context: this.analyzeContext(topic, options.scope),
      objectives: this.defineObjectives(topic, options.scope),
      approaches: this.evaluateApproaches(topic, options.scope),
      implementation: this.createImplementationStrategy(topic, options),
      risks: this.assessRisks(topic, options.scope),
      dependencies: this.identifyDependencies(topic, options.scope),
      metrics: this.defineSuccessMetrics(topic, options.scope),
      recommendations: this.generateRecommendations(topic, options)
    };

    return analysis;
  }

  analyzeContext(topic, scope) {
    const topicLower = topic.toLowerCase();
    
    const context = {
      domain: this.identifyDomain(topicLower),
      complexity: this.assessComplexity(topicLower, scope),
      stakeholders: this.identifyStakeholders(topicLower, scope),
      constraints: this.identifyConstraints(topicLower, scope),
      assumptions: this.identifyAssumptions(topicLower, scope)
    };

    return context;
  }

  identifyDomain(topic) {
    const domains = {
      auth: 'Security & Authentication',
      api: 'API & Integration',
      database: 'Data Management',
      ui: 'User Interface',
      performance: 'Performance & Optimization',
      infrastructure: 'Infrastructure & DevOps',
      mobile: 'Mobile Development',
      architecture: 'System Architecture'
    };

    for (const [key, value] of Object.entries(domains)) {
      if (topic.includes(key)) return value;
    }
    
    return 'General Development';
  }

  assessComplexity(topic, scope) {
    const complexityFactors = {
      simple: ['button', 'form', 'page', 'component'],
      medium: ['feature', 'module', 'service', 'integration'],
      complex: ['system', 'architecture', 'migration', 'redesign'],
      critical: ['security', 'payment', 'compliance', 'infrastructure']
    };

    let complexity = 'medium';
    let factors = [];

    for (const [level, keywords] of Object.entries(complexityFactors)) {
      const matches = keywords.filter(kw => topic.includes(kw));
      if (matches.length > 0) {
        complexity = level;
        factors = matches;
      }
    }

    // Adjust based on scope
    if (scope === 'architecture') complexity = 'complex';
    if (scope === 'project' && complexity === 'simple') complexity = 'medium';

    return { level: complexity, factors, score: this.getComplexityScore(complexity) };
  }

  getComplexityScore(level) {
    const scores = { simple: 1, medium: 3, complex: 5, critical: 8 };
    return scores[level] || 3;
  }

  identifyStakeholders(topic, scope) {
    const stakeholders = [];
    
    // Technical stakeholders
    stakeholders.push({ 
      role: 'Development Team', 
      interest: 'Implementation feasibility',
      influence: 'high'
    });

    // Based on topic
    if (topic.includes('ui') || topic.includes('user')) {
      stakeholders.push({ 
        role: 'UX/UI Team', 
        interest: 'User experience',
        influence: 'high'
      });
      stakeholders.push({ 
        role: 'End Users', 
        interest: 'Usability and features',
        influence: 'medium'
      });
    }

    if (topic.includes('api') || topic.includes('integration')) {
      stakeholders.push({ 
        role: 'External Partners', 
        interest: 'API stability and documentation',
        influence: 'medium'
      });
    }

    if (topic.includes('security') || topic.includes('auth')) {
      stakeholders.push({ 
        role: 'Security Team', 
        interest: 'Security compliance',
        influence: 'high'
      });
    }

    if (scope === 'project' || scope === 'architecture') {
      stakeholders.push({ 
        role: 'Product Management', 
        interest: 'Business value and timeline',
        influence: 'high'
      });
      stakeholders.push({ 
        role: 'Leadership', 
        interest: 'Strategic alignment',
        influence: 'high'
      });
    }

    return stakeholders;
  }

  identifyConstraints(topic, scope) {
    const constraints = [];
    
    // Common constraints
    constraints.push({ 
      type: 'Time', 
      description: 'Development timeline and deadlines',
      severity: 'medium'
    });

    constraints.push({ 
      type: 'Resources', 
      description: 'Available team members and budget',
      severity: 'medium'
    });

    // Topic-specific constraints
    if (topic.includes('legacy') || topic.includes('migration')) {
      constraints.push({ 
        type: 'Technical Debt', 
        description: 'Existing system limitations',
        severity: 'high'
      });
    }

    if (topic.includes('real-time') || topic.includes('performance')) {
      constraints.push({ 
        type: 'Performance', 
        description: 'Latency and throughput requirements',
        severity: 'high'
      });
    }

    if (topic.includes('security') || topic.includes('compliance')) {
      constraints.push({ 
        type: 'Regulatory', 
        description: 'Compliance and security standards',
        severity: 'critical'
      });
    }

    return constraints;
  }

  identifyAssumptions(topic, scope) {
    const assumptions = [];
    
    // Common assumptions
    assumptions.push('Team has necessary technical skills');
    assumptions.push('Development environment is properly configured');
    
    if (scope === 'feature') {
      assumptions.push('Core infrastructure already exists');
      assumptions.push('No major architectural changes required');
    }

    if (scope === 'project') {
      assumptions.push('Project requirements are well-defined');
      assumptions.push('Stakeholder availability for feedback');
    }

    if (topic.includes('api') || topic.includes('integration')) {
      assumptions.push('External services are reliable and documented');
      assumptions.push('API contracts remain stable');
    }

    return assumptions;
  }

  defineObjectives(topic, scope) {
    const objectives = [];
    
    // Primary objective
    objectives.push({
      type: 'primary',
      goal: `Successfully implement ${topic}`,
      successCriteria: 'All requirements met and system functioning as designed',
      priority: 'critical',
      measurable: true
    });

    // Scope-based objectives
    if (scope === 'feature') {
      objectives.push({
        type: 'secondary',
        goal: 'Minimal disruption to existing functionality',
        successCriteria: 'No breaking changes to current features',
        priority: 'high',
        measurable: true
      });
    }

    if (scope === 'project' || scope === 'architecture') {
      objectives.push({
        type: 'secondary',
        goal: 'Scalable and maintainable solution',
        successCriteria: 'Architecture supports future growth',
        priority: 'high',
        measurable: false
      });
      
      objectives.push({
        type: 'secondary',
        goal: 'Knowledge transfer and documentation',
        successCriteria: 'Complete documentation and team training',
        priority: 'medium',
        measurable: true
      });
    }

    // Topic-specific objectives
    if (topic.includes('performance')) {
      objectives.push({
        type: 'primary',
        goal: 'Achieve performance targets',
        successCriteria: 'Meet or exceed defined performance metrics',
        priority: 'critical',
        measurable: true
      });
    }

    if (topic.includes('security')) {
      objectives.push({
        type: 'primary',
        goal: 'Ensure security compliance',
        successCriteria: 'Pass security audit with no critical issues',
        priority: 'critical',
        measurable: true
      });
    }

    return objectives;
  }

  evaluateApproaches(topic, scope) {
    const approaches = [];
    
    // Generate multiple approaches based on scope
    if (scope === 'feature') {
      approaches.push({
        name: 'Incremental Implementation',
        description: 'Build feature incrementally with continuous testing',
        pros: ['Lower risk', 'Early feedback', 'Easier debugging'],
        cons: ['Potentially slower', 'May require refactoring'],
        effort: 'medium',
        risk: 'low',
        recommendation: 'recommended'
      });
      
      approaches.push({
        name: 'Complete Redesign',
        description: 'Build feature from scratch with optimal design',
        pros: ['Clean implementation', 'Better performance', 'Modern patterns'],
        cons: ['Higher risk', 'Longer timeline', 'More testing needed'],
        effort: 'high',
        risk: 'medium',
        recommendation: 'alternative'
      });
    }

    if (scope === 'project' || scope === 'architecture') {
      approaches.push({
        name: 'Phased Rollout',
        description: 'Implement in phases with validation checkpoints',
        pros: ['Risk mitigation', 'Early value delivery', 'Flexibility'],
        cons: ['Complex coordination', 'Potential integration issues'],
        effort: 'high',
        risk: 'low',
        recommendation: 'recommended'
      });
      
      approaches.push({
        name: 'Big Bang Deployment',
        description: 'Complete implementation before deployment',
        pros: ['Simpler coordination', 'Consistent experience'],
        cons: ['High risk', 'Late feedback', 'Difficult rollback'],
        effort: 'very high',
        risk: 'high',
        recommendation: 'not recommended'
      });
      
      approaches.push({
        name: 'Parallel Development',
        description: 'Multiple teams work on different components',
        pros: ['Faster delivery', 'Resource optimization'],
        cons: ['Integration challenges', 'Communication overhead'],
        effort: 'medium',
        risk: 'medium',
        recommendation: 'consider'
      });
    }

    // Add a conservative approach
    approaches.push({
      name: 'Minimal Viable Implementation',
      description: 'Start with core functionality only',
      pros: ['Quick delivery', 'Low risk', 'Early validation'],
      cons: ['Limited features', 'May need significant expansion'],
      effort: 'low',
      risk: 'very low',
      recommendation: 'fallback option'
    });

    return approaches;
  }

  createImplementationStrategy(topic, options) {
    const phases = [];
    const totalWeeks = this.estimateTotalWeeks(options);
    
    // Phase 1: Planning & Design
    phases.push({
      name: 'Planning & Design',
      duration: Math.ceil(totalWeeks * 0.2),
      activities: [
        'Requirements gathering and analysis',
        'Technical design documentation',
        'Architecture review and approval',
        'Resource allocation and planning'
      ],
      deliverables: [
        'Technical specification',
        'Architecture diagrams',
        'Project plan'
      ],
      risks: ['Incomplete requirements', 'Stakeholder alignment']
    });

    // Phase 2: Core Development
    phases.push({
      name: 'Core Development',
      duration: Math.ceil(totalWeeks * 0.4),
      activities: [
        'Environment setup',
        'Core functionality implementation',
        'Unit testing',
        'Code reviews'
      ],
      deliverables: [
        'Core features implemented',
        'Unit test coverage > 80%',
        'Development documentation'
      ],
      risks: ['Technical blockers', 'Scope creep']
    });

    // Phase 3: Integration & Testing
    phases.push({
      name: 'Integration & Testing',
      duration: Math.ceil(totalWeeks * 0.25),
      activities: [
        'Integration with existing systems',
        'End-to-end testing',
        'Performance testing',
        'Security testing'
      ],
      deliverables: [
        'Integration complete',
        'Test reports',
        'Performance benchmarks'
      ],
      risks: ['Integration issues', 'Performance problems']
    });

    // Phase 4: Deployment & Stabilization
    phases.push({
      name: 'Deployment & Stabilization',
      duration: Math.ceil(totalWeeks * 0.15),
      activities: [
        'Production deployment',
        'Monitoring setup',
        'Bug fixes and optimization',
        'Documentation completion'
      ],
      deliverables: [
        'Production deployment',
        'Monitoring dashboards',
        'Complete documentation'
      ],
      risks: ['Production issues', 'Rollback scenarios']
    });

    return {
      phases,
      totalDuration: totalWeeks,
      criticalPath: this.identifyCriticalPath(phases),
      milestones: this.defineMilestones(phases)
    };
  }

  estimateTotalWeeks(options) {
    if (options.timeline) {
      const match = options.timeline.match(/(\d+)\s*(weeks?|months?)/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        return unit.startsWith('month') ? value * 4 : value;
      }
    }
    
    // Default based on scope
    const defaults = { feature: 4, project: 12, architecture: 16 };
    return defaults[options.scope] || 8;
  }

  identifyCriticalPath(phases) {
    return phases
      .filter(phase => phase.risks.some(risk => risk.includes('blockers') || risk.includes('alignment')))
      .map(phase => phase.name);
  }

  defineMilestones(phases) {
    const milestones = [];
    let cumulativeWeeks = 0;
    
    phases.forEach(phase => {
      cumulativeWeeks += phase.duration;
      milestones.push({
        name: `${phase.name} Complete`,
        week: cumulativeWeeks,
        criteria: phase.deliverables.join(', ')
      });
    });
    
    return milestones;
  }

  assessRisks(topic, scope) {
    const risks = [];
    
    // Common risks
    risks.push({
      category: 'Technical',
      risk: 'Unknown technical challenges',
      impact: 'medium',
      probability: 'medium',
      mitigation: 'Proof of concept and spikes'
    });

    risks.push({
      category: 'Resource',
      risk: 'Team availability changes',
      impact: 'high',
      probability: 'low',
      mitigation: 'Cross-training and documentation'
    });

    // Scope-specific risks
    if (scope === 'architecture') {
      risks.push({
        category: 'Architectural',
        risk: 'Design flaws discovered late',
        impact: 'very high',
        probability: 'low',
        mitigation: 'Early prototyping and peer review'
      });
    }

    // Topic-specific risks
    if (topic.includes('migration')) {
      risks.push({
        category: 'Data',
        risk: 'Data loss during migration',
        impact: 'critical',
        probability: 'low',
        mitigation: 'Comprehensive backups and rollback plan'
      });
    }

    if (topic.includes('third-party') || topic.includes('integration')) {
      risks.push({
        category: 'External',
        risk: 'Third-party service changes',
        impact: 'high',
        probability: 'medium',
        mitigation: 'Abstract integration layer'
      });
    }

    return risks;
  }

  identifyDependencies(topic, scope) {
    const dependencies = [];
    
    // Internal dependencies
    dependencies.push({
      type: 'internal',
      name: 'Development Environment',
      criticality: 'high',
      status: 'ready'
    });

    if (scope === 'project' || scope === 'architecture') {
      dependencies.push({
        type: 'internal',
        name: 'Infrastructure Resources',
        criticality: 'high',
        status: 'needs verification'
      });
    }

    // External dependencies based on topic
    if (topic.includes('api') || topic.includes('integration')) {
      dependencies.push({
        type: 'external',
        name: 'Third-party APIs',
        criticality: 'critical',
        status: 'needs assessment'
      });
    }

    if (topic.includes('database') || topic.includes('data')) {
      dependencies.push({
        type: 'internal',
        name: 'Database Infrastructure',
        criticality: 'critical',
        status: 'needs review'
      });
    }

    return dependencies;
  }

  defineSuccessMetrics(topic, scope) {
    const metrics = [];
    
    // Common metrics
    metrics.push({
      name: 'Delivery Timeline',
      target: 'On schedule',
      measurement: 'Weekly progress tracking',
      type: 'process'
    });

    metrics.push({
      name: 'Quality Standards',
      target: 'Zero critical bugs',
      measurement: 'Bug tracking and severity',
      type: 'quality'
    });

    // Scope-specific metrics
    if (scope === 'feature') {
      metrics.push({
        name: 'Feature Adoption',
        target: '80% user adoption within 30 days',
        measurement: 'Usage analytics',
        type: 'business'
      });
    }

    if (scope === 'project' || scope === 'architecture') {
      metrics.push({
        name: 'System Performance',
        target: 'Meet defined SLAs',
        measurement: 'Performance monitoring',
        type: 'technical'
      });
      
      metrics.push({
        name: 'Team Productivity',
        target: '20% improvement',
        measurement: 'Velocity tracking',
        type: 'process'
      });
    }

    // Topic-specific metrics
    if (topic.includes('performance')) {
      metrics.push({
        name: 'Response Time',
        target: '< 200ms p95',
        measurement: 'APM tools',
        type: 'technical'
      });
    }

    return metrics;
  }

  generateRecommendations(topic, options) {
    const recommendations = [];
    
    // Primary recommendation based on analysis
    recommendations.push({
      priority: 'high',
      action: 'Start with proof of concept',
      rationale: 'Validate technical approach early',
      timeline: 'Week 1-2'
    });

    // Scope-based recommendations
    if (options.scope === 'architecture') {
      recommendations.push({
        priority: 'high',
        action: 'Conduct architecture review',
        rationale: 'Ensure design aligns with long-term goals',
        timeline: 'Before implementation'
      });
    }

    if (options.scope === 'project') {
      recommendations.push({
        priority: 'medium',
        action: 'Set up project tracking',
        rationale: 'Enable visibility and early issue detection',
        timeline: 'Week 1'
      });
    }

    // Always recommend documentation
    recommendations.push({
      priority: 'medium',
      action: 'Maintain decision log',
      rationale: 'Capture key decisions and rationale',
      timeline: 'Throughout project'
    });

    return recommendations;
  }

  parseTimeline(timeline) {
    if (!timeline) return null;
    
    const match = timeline.match(/(\d+)\s*(weeks?|months?)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      const weeks = unit.startsWith('month') ? value * 4 : value;
      
      return {
        original: timeline,
        weeks,
        months: Math.ceil(weeks / 4),
        description: `${weeks} weeks (${Math.ceil(weeks / 4)} months)`
      };
    }
    
    return { original: timeline, weeks: 8, months: 2, description: '8 weeks (2 months)' };
  }

  async displayPlanningResults(analysis, options) {
    console.log(chalk.white('📋 Comprehensive Planning Analysis:\n'));

    // Context Overview
    console.log(chalk.yellow('🌐 Context Analysis:'));
    console.log(`  Domain: ${chalk.cyan(analysis.context.domain)}`);
    console.log(`  Complexity: ${this.formatComplexity(analysis.context.complexity)}`);
    console.log(`  Key Stakeholders: ${analysis.context.stakeholders.map(s => s.role).join(', ')}`);
    
    // Objectives
    console.log(chalk.yellow('\n🎯 Objectives & Success Criteria:'));
    analysis.objectives.forEach((obj, index) => {
      const icon = obj.type === 'primary' ? '🎯' : '📍';
      console.log(`  ${icon} ${obj.goal}`);
      console.log(chalk.gray(`     Success: ${obj.successCriteria}`));
      console.log(chalk.gray(`     Priority: ${this.formatPriority(obj.priority)}`));
    });

    // Recommended Approach
    const recommended = analysis.approaches.find(a => a.recommendation === 'recommended');
    if (recommended) {
      console.log(chalk.yellow('\n✨ Recommended Approach:'));
      console.log(`  ${chalk.cyan(recommended.name)}`);
      console.log(chalk.gray(`  ${recommended.description}`));
      console.log(chalk.green(`  Pros: ${recommended.pros.join(', ')}`));
      console.log(chalk.red(`  Cons: ${recommended.cons.join(', ')}`));
    }

    // Alternative Approaches
    const alternatives = analysis.approaches.filter(a => a.recommendation !== 'recommended');
    if (alternatives.length > 0) {
      console.log(chalk.yellow('\n🔀 Alternative Approaches:'));
      alternatives.forEach((approach, index) => {
        console.log(`  ${index + 1}. ${approach.name} (${approach.recommendation})`);
        console.log(chalk.gray(`     ${approach.description}`));
      });
    }

    // Implementation Timeline
    console.log(chalk.yellow('\n📅 Implementation Timeline:'));
    if (analysis.timeline) {
      console.log(`  Duration: ${chalk.cyan(analysis.timeline.description)}`);
    }
    analysis.implementation.phases.forEach(phase => {
      console.log(`\n  ${chalk.cyan(phase.name)} (${phase.duration} weeks):`);
      console.log(`    Activities: ${phase.activities.slice(0, 2).join(', ')}...`);
      console.log(`    Deliverables: ${phase.deliverables[0]}`);
    });

    // Key Risks
    if (analysis.risks.length > 0) {
      console.log(chalk.yellow('\n⚠️  Key Risks:'));
      analysis.risks.slice(0, 3).forEach(risk => {
        const impact = this.formatRiskLevel(risk.impact);
        console.log(`  • ${risk.risk} (${impact} impact)`);
        console.log(chalk.gray(`    Mitigation: ${risk.mitigation}`));
      });
    }

    // Dependencies
    const criticalDeps = analysis.dependencies.filter(d => d.criticality === 'critical');
    if (criticalDeps.length > 0) {
      console.log(chalk.yellow('\n🔗 Critical Dependencies:'));
      criticalDeps.forEach(dep => {
        const status = dep.status === 'ready' ? chalk.green(dep.status) : chalk.yellow(dep.status);
        console.log(`  • ${dep.name} - ${status}`);
      });
    }

    // Success Metrics
    console.log(chalk.yellow('\n📊 Success Metrics:'));
    analysis.metrics.slice(0, 4).forEach(metric => {
      console.log(`  • ${metric.name}: ${chalk.cyan(metric.target)}`);
    });

    // Recommendations
    console.log(chalk.yellow('\n💡 Key Recommendations:'));
    analysis.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.action}`);
      console.log(chalk.gray(`     ${rec.rationale} (${rec.timeline})`));
    });

    // Next Steps
    console.log(chalk.green('\n🚀 Next Steps:'));
    console.log('  1. Review and validate this plan with stakeholders');
    console.log('  2. Create detailed technical specifications');
    console.log('  3. Set up project tracking and communication');
    console.log('  4. Begin proof of concept for high-risk areas');
  }

  formatComplexity(complexity) {
    const colors = {
      simple: chalk.green,
      medium: chalk.yellow,
      complex: chalk.red,
      critical: chalk.magenta
    };
    const color = colors[complexity.level] || chalk.gray;
    return `${color(complexity.level)} (score: ${complexity.score}/8)`;
  }

  formatPriority(priority) {
    const colors = {
      critical: chalk.red,
      high: chalk.yellow,
      medium: chalk.blue,
      low: chalk.gray
    };
    const color = colors[priority] || chalk.gray;
    return color(priority);
  }

  formatRiskLevel(level) {
    const colors = {
      'very high': chalk.red,
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.green,
      'very low': chalk.green
    };
    const color = colors[level] || chalk.gray;
    return color(level);
  }

  async createArchitectureDecisionRecord(topic, analysis) {
    console.log(chalk.blue('\n📝 Creating Architecture Decision Record...\n'));
    
    const adrContent = this.generateADRContent(topic, analysis);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `adr-${timestamp}-${topic.toLowerCase().replace(/\s+/g, '-')}.md`;
    
    try {
      const adrDir = './docs/adr';
      await this.exec(`mkdir -p ${adrDir}`, { silent: true });
      
      const filepath = `${adrDir}/${filename}`;
      await this.writeFile(filepath, adrContent);
      
      console.log(chalk.green(`✅ Created ADR: ${filepath}`));
      
      // Ask if should create GitHub issue
      const shouldCreateIssue = await this.confirm(
        'Create GitHub issue to track this ADR?',
        false
      );
      
      if (shouldCreateIssue) {
        await this.createADRIssue(topic, analysis, filepath);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Failed to create ADR: ${error.message}`));
    }
  }

  generateADRContent(topic, analysis) {
    const date = new Date().toISOString().slice(0, 10);
    const recommended = analysis.approaches.find(a => a.recommendation === 'recommended');
    
    return `# Architecture Decision Record: ${topic}

## Status
Proposed

## Date
${date}

## Context
${analysis.context.domain} - ${topic}

### Problem Statement
We need to plan and implement ${topic} with the following considerations:
- Complexity: ${analysis.context.complexity.level} (${analysis.context.complexity.score}/8)
- Timeline: ${analysis.timeline ? analysis.timeline.description : 'TBD'}
- Key constraints: ${analysis.context.constraints.map(c => c.description).join(', ')}

### Stakeholders
${analysis.context.stakeholders.map(s => `- ${s.role}: ${s.interest}`).join('\n')}

## Decision
We will implement ${topic} using the "${recommended?.name || 'Phased Approach'}" strategy.

### Approach Details
${recommended?.description || 'Implement in phases with validation checkpoints'}

**Advantages:**
${(recommended?.pros || ['Lower risk', 'Incremental value delivery']).map(pro => `- ${pro}`).join('\n')}

**Trade-offs:**
${(recommended?.cons || ['Potentially longer timeline']).map(con => `- ${con}`).join('\n')}

## Consequences

### Positive
- ${analysis.objectives.filter(o => o.type === 'primary').map(o => o.goal).join('\n- ')}
- Clear success metrics defined
- Risk mitigation strategies in place

### Negative
- ${analysis.risks.slice(0, 2).map(r => r.risk).join('\n- ')}

### Risks and Mitigation
${analysis.risks.slice(0, 3).map(r => `- **${r.risk}**: ${r.mitigation}`).join('\n')}

## Implementation Plan

### Phases
${analysis.implementation.phases.map(phase => 
`#### ${phase.name} (${phase.duration} weeks)
- Key activities: ${phase.activities.slice(0, 2).join(', ')}
- Deliverables: ${phase.deliverables[0]}`
).join('\n\n')}

### Success Metrics
${analysis.metrics.slice(0, 3).map(m => `- ${m.name}: ${m.target}`).join('\n')}

## References
- Extended planning analysis completed on ${date}
- Generated by Flow State Dev planning system
`;
  }

  async createADRIssue(topic, analysis, filepath) {
    try {
      const issueTitle = `ADR: ${topic}`;
      const issueBody = `## Architecture Decision Record

An ADR has been created for: **${topic}**

### Summary
- **Complexity**: ${analysis.context.complexity.level}
- **Timeline**: ${analysis.timeline ? analysis.timeline.description : 'TBD'}
- **Recommended Approach**: ${analysis.approaches.find(a => a.recommendation === 'recommended')?.name || 'Phased Implementation'}

### Key Objectives
${analysis.objectives.filter(o => o.type === 'primary').map(o => `- ${o.goal}`).join('\n')}

### File Location
\`${filepath}\`

### Next Steps
- [ ] Review ADR with team
- [ ] Gather feedback from stakeholders
- [ ] Approve or request changes
- [ ] Begin implementation planning

---
*Generated by Flow State Dev extended planning*`;

      await this.exec(`gh issue create --title "${issueTitle}" --body "${issueBody}" --label "documentation,adr"`, { silent: true });
      console.log(chalk.green('✅ Created GitHub issue for ADR'));
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