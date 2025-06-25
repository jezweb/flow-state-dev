/**
 * Alternatives command - Alternative solution exploration
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';

export default class AlternativesCommand extends BaseSlashCommand {
  constructor() {
    super('/alternatives', 'Alternative solution exploration', {
      category: 'thinking',
      usage: '/alternatives [problem] [options]',
      examples: [
        'fsd slash "/alternatives \'State management for React app\'"',
        'fsd slash "/alternatives \'Database for high-volume writes\' --constraints performance,cost"',
        'fsd slash "/alternatives \'CI/CD pipeline\' --criteria speed,reliability,cost"',
        'fsd slash "/alternatives \'Authentication solution\' --count 5"'
      ],
      options: [
        { name: 'problem', type: 'string', description: 'Problem or challenge', required: true },
        { name: 'constraints', type: 'string', description: 'Known constraints (comma-separated)' },
        { name: 'criteria', type: 'string', description: 'Evaluation criteria (comma-separated)' },
        { name: 'count', type: 'number', description: 'Number of alternatives to explore', default: 4 },
        { name: 'compare', type: 'boolean', description: 'Create comparison matrix', default: true }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const problem = args?.[0] || options.problem;
    
    if (!problem) {
      console.log(chalk.blue('🔄 Alternative Solutions Explorer\n'));
      console.log(chalk.gray('Discover and evaluate alternative solutions for technical challenges.\n'));
      console.log(chalk.yellow('Usage:'));
      console.log(chalk.gray('  fsd slash "/alternatives \'Problem to solve\'"'));
      console.log(chalk.gray('\nExample problems:'));
      console.log(chalk.gray('  • "State management for React application"'));
      console.log(chalk.gray('  • "Real-time data synchronization"'));
      console.log(chalk.gray('  • "Microservices communication pattern"'));
      console.log(chalk.gray('  • "File storage for user uploads"'));
      console.log(chalk.gray('\nFeatures:'));
      console.log(chalk.gray('  • Discovers multiple solution approaches'));
      console.log(chalk.gray('  • Evaluates against criteria'));
      console.log(chalk.gray('  • Provides comparison matrix'));
      console.log(chalk.gray('  • Suggests best fit for constraints'));
      return;
    }

    console.log(chalk.blue('🔄 Alternative Solutions Explorer\n'));
    console.log(chalk.white(`Problem: ${problem}\n`));
    
    // Parse constraints and criteria
    const constraints = this.parseConstraints(options.constraints);
    const criteria = this.parseCriteria(options.criteria);
    
    if (constraints.length > 0) {
      console.log(chalk.gray(`Constraints: ${constraints.join(', ')}`));
    }
    if (criteria.length > 0) {
      console.log(chalk.gray(`Criteria: ${criteria.join(', ')}\n`));
    }

    // Explore alternatives
    const exploration = await this.exploreAlternatives(problem, options, constraints, criteria);
    
    // Display results
    await this.displayAlternatives(exploration);
    
    // Show comparison matrix if requested
    if (options.compare && exploration.alternatives.length > 1) {
      await this.displayComparisonMatrix(exploration);
    }
    
    // Provide recommendation
    await this.displayRecommendation(exploration);
  }

  parseConstraints(constraintsStr) {
    if (!constraintsStr) return [];
    return constraintsStr.split(',').map(c => c.trim()).filter(Boolean);
  }

  parseCriteria(criteriaStr) {
    if (!criteriaStr) {
      // Default criteria
      return ['Performance', 'Cost', 'Complexity', 'Maintainability', 'Scalability'];
    }
    return criteriaStr.split(',').map(c => c.trim()).filter(Boolean);
  }

  async exploreAlternatives(problem, options, constraints, criteria) {
    console.log(chalk.gray('Exploring alternative solutions...\n'));
    
    const exploration = {
      problem,
      constraints,
      criteria,
      context: this.analyzeProblemContext(problem),
      alternatives: this.generateAlternatives(problem, options, constraints),
      evaluation: null,
      recommendation: null
    };
    
    // Evaluate each alternative
    exploration.evaluation = this.evaluateAlternatives(exploration.alternatives, criteria, constraints);
    
    // Generate recommendation
    exploration.recommendation = this.generateRecommendation(exploration);
    
    return exploration;
  }

  analyzeProblemContext(problem) {
    const problemLower = problem.toLowerCase();
    
    const context = {
      domain: this.identifyDomain(problemLower),
      type: this.identifyProblemType(problemLower),
      scale: this.assessScale(problemLower),
      complexity: this.assessComplexity(problemLower)
    };
    
    return context;
  }

  identifyDomain(problem) {
    const domains = {
      'state': 'Frontend State Management',
      'database': 'Data Storage',
      'auth': 'Authentication & Security',
      'api': 'API & Integration',
      'cache': 'Caching & Performance',
      'message': 'Messaging & Communication',
      'deploy': 'Deployment & Infrastructure',
      'monitor': 'Monitoring & Observability',
      'test': 'Testing & Quality',
      'build': 'Build & Development'
    };
    
    for (const [key, value] of Object.entries(domains)) {
      if (problem.includes(key)) return value;
    }
    
    return 'General Software Development';
  }

  identifyProblemType(problem) {
    if (problem.includes('real-time') || problem.includes('sync')) {
      return 'Real-time Processing';
    } else if (problem.includes('storage') || problem.includes('database')) {
      return 'Data Storage';
    } else if (problem.includes('communication') || problem.includes('messaging')) {
      return 'System Communication';
    } else if (problem.includes('performance') || problem.includes('optimization')) {
      return 'Performance Optimization';
    } else if (problem.includes('security') || problem.includes('auth')) {
      return 'Security & Access Control';
    }
    
    return 'Technical Implementation';
  }

  assessScale(problem) {
    if (problem.includes('high-volume') || problem.includes('large-scale') || problem.includes('enterprise')) {
      return 'Large Scale';
    } else if (problem.includes('small') || problem.includes('simple') || problem.includes('basic')) {
      return 'Small Scale';
    }
    
    return 'Medium Scale';
  }

  assessComplexity(problem) {
    const complexityIndicators = {
      high: ['distributed', 'real-time', 'concurrent', 'multi-tenant', 'high-volume'],
      medium: ['integration', 'workflow', 'processing', 'management'],
      low: ['simple', 'basic', 'straightforward', 'small']
    };
    
    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(ind => problem.includes(ind))) {
        return level;
      }
    }
    
    return 'medium';
  }

  generateAlternatives(problem, options, constraints) {
    const alternatives = [];
    const problemLower = problem.toLowerCase();
    const count = options.count || 4;
    
    // Generate context-specific alternatives
    if (problemLower.includes('state') && problemLower.includes('react')) {
      alternatives.push(
        this.createAlternative('Redux', 'Predictable state container with time-travel debugging', 'state-management'),
        this.createAlternative('MobX', 'Simple, scalable state management with reactive programming', 'state-management'),
        this.createAlternative('Zustand', 'Lightweight state management solution', 'state-management'),
        this.createAlternative('Context API + useReducer', 'Built-in React solution for state management', 'state-management'),
        this.createAlternative('Recoil', 'Experimental state management by Facebook', 'state-management'),
        this.createAlternative('Valtio', 'Proxy-based state management', 'state-management')
      );
    } else if (problemLower.includes('database')) {
      alternatives.push(
        this.createAlternative('PostgreSQL', 'Robust relational database with advanced features', 'database'),
        this.createAlternative('MongoDB', 'Document-oriented NoSQL database', 'database'),
        this.createAlternative('Redis', 'In-memory data structure store', 'database'),
        this.createAlternative('DynamoDB', 'Fully managed NoSQL database by AWS', 'database'),
        this.createAlternative('Cassandra', 'Wide-column store for large-scale data', 'database'),
        this.createAlternative('TimescaleDB', 'Time-series database built on PostgreSQL', 'database')
      );
    } else if (problemLower.includes('auth')) {
      alternatives.push(
        this.createAlternative('Auth0', 'Identity platform with extensive features', 'authentication'),
        this.createAlternative('Firebase Auth', 'Google\'s authentication service', 'authentication'),
        this.createAlternative('AWS Cognito', 'AWS identity and access management', 'authentication'),
        this.createAlternative('Supabase Auth', 'Open-source authentication solution', 'authentication'),
        this.createAlternative('Custom JWT', 'Build your own JWT-based auth', 'authentication'),
        this.createAlternative('Keycloak', 'Open-source identity management', 'authentication')
      );
    } else if (problemLower.includes('ci') || problemLower.includes('cd')) {
      alternatives.push(
        this.createAlternative('GitHub Actions', 'Native GitHub CI/CD with excellent integration', 'ci-cd'),
        this.createAlternative('GitLab CI', 'Integrated CI/CD in GitLab', 'ci-cd'),
        this.createAlternative('Jenkins', 'Extensible open-source automation server', 'ci-cd'),
        this.createAlternative('CircleCI', 'Cloud-based CI/CD platform', 'ci-cd'),
        this.createAlternative('Travis CI', 'Hosted continuous integration service', 'ci-cd'),
        this.createAlternative('Drone', 'Container-native CI/CD platform', 'ci-cd')
      );
    } else if (problemLower.includes('message') || problemLower.includes('queue')) {
      alternatives.push(
        this.createAlternative('RabbitMQ', 'Reliable message broker with many protocols', 'messaging'),
        this.createAlternative('Apache Kafka', 'Distributed streaming platform', 'messaging'),
        this.createAlternative('Redis Pub/Sub', 'Simple pub/sub messaging with Redis', 'messaging'),
        this.createAlternative('AWS SQS', 'Fully managed message queuing service', 'messaging'),
        this.createAlternative('NATS', 'High-performance messaging system', 'messaging'),
        this.createAlternative('Apache Pulsar', 'Cloud-native distributed messaging', 'messaging')
      );
    } else if (problemLower.includes('storage') || problemLower.includes('file')) {
      alternatives.push(
        this.createAlternative('AWS S3', 'Scalable object storage service', 'storage'),
        this.createAlternative('Cloudinary', 'Media management platform', 'storage'),
        this.createAlternative('MinIO', 'Self-hosted S3-compatible storage', 'storage'),
        this.createAlternative('Google Cloud Storage', 'Google\'s object storage service', 'storage'),
        this.createAlternative('Local filesystem', 'Traditional file system storage', 'storage'),
        this.createAlternative('Azure Blob Storage', 'Microsoft\'s object storage solution', 'storage')
      );
    } else {
      // Generic alternatives
      alternatives.push(
        this.createAlternative('Build Custom Solution', 'Tailored to exact requirements', 'custom'),
        this.createAlternative('Open Source Library', 'Community-maintained solution', 'open-source'),
        this.createAlternative('Commercial Product', 'Enterprise-grade with support', 'commercial'),
        this.createAlternative('Hybrid Approach', 'Combine multiple solutions', 'hybrid'),
        this.createAlternative('Managed Service', 'Fully managed cloud solution', 'managed'),
        this.createAlternative('Framework-based', 'Use existing framework features', 'framework')
      );
    }
    
    // Filter based on constraints
    let filtered = this.filterByConstraints(alternatives, constraints);
    
    // Ensure we have enough alternatives
    if (filtered.length < count) {
      filtered = alternatives; // Use all if filtering is too restrictive
    }
    
    return filtered.slice(0, count);
  }

  createAlternative(name, description, category) {
    return {
      name,
      description,
      category,
      characteristics: this.getCharacteristics(name, category),
      pros: this.getPros(name, category),
      cons: this.getCons(name, category),
      bestFor: this.getBestFor(name, category),
      avoidWhen: this.getAvoidWhen(name, category)
    };
  }

  getCharacteristics(name, category) {
    const characteristics = {
      'Redux': { maturity: 'Very High', learning: 'Steep', ecosystem: 'Extensive' },
      'MobX': { maturity: 'High', learning: 'Moderate', ecosystem: 'Good' },
      'Zustand': { maturity: 'Medium', learning: 'Easy', ecosystem: 'Growing' },
      'PostgreSQL': { type: 'Relational', consistency: 'ACID', scaling: 'Vertical' },
      'MongoDB': { type: 'Document', consistency: 'Eventual', scaling: 'Horizontal' },
      'Auth0': { type: 'Managed', features: 'Comprehensive', pricing: 'Per-user' },
      'GitHub Actions': { type: 'Cloud', integration: 'Native', pricing: 'Usage-based' }
    };
    
    return characteristics[name] || { maturity: 'Varies', complexity: 'Moderate', support: 'Available' };
  }

  getPros(name, category) {
    const prosMap = {
      'Redux': ['Predictable state updates', 'Time-travel debugging', 'Large ecosystem', 'Battle-tested'],
      'MobX': ['Less boilerplate', 'Reactive updates', 'Easy to learn', 'Flexible'],
      'Zustand': ['Minimal setup', 'TypeScript-first', 'Small bundle size', 'Simple API'],
      'PostgreSQL': ['ACID compliance', 'Complex queries', 'Mature and stable', 'Extensions'],
      'MongoDB': ['Flexible schema', 'Horizontal scaling', 'JSON-like documents', 'Fast writes'],
      'Auth0': ['Quick setup', 'Many integrations', 'Advanced features', 'Good documentation'],
      'GitHub Actions': ['GitHub integration', 'Matrix builds', 'Free for public repos', 'YAML configuration']
    };
    
    if (prosMap[name]) return prosMap[name];
    
    // Generic pros by category
    const categoryPros = {
      'custom': ['Full control', 'Exact fit', 'No dependencies', 'Optimized for use case'],
      'open-source': ['Free to use', 'Community support', 'Transparent', 'Customizable'],
      'commercial': ['Professional support', 'SLA guarantees', 'Regular updates', 'Enterprise features'],
      'managed': ['No maintenance', 'Automatic scaling', 'High availability', 'Built-in monitoring']
    };
    
    return categoryPros[category] || ['Proven solution', 'Documentation available', 'Community support'];
  }

  getCons(name, category) {
    const consMap = {
      'Redux': ['Boilerplate code', 'Steep learning curve', 'Overkill for simple apps', 'Verbose'],
      'MobX': ['Magic can be confusing', 'Less predictable', 'Smaller community', 'Decorator syntax'],
      'Zustand': ['Newer solution', 'Smaller ecosystem', 'Less tooling', 'Limited middleware'],
      'PostgreSQL': ['Vertical scaling limits', 'More complex setup', 'Resource intensive', 'Schema rigidity'],
      'MongoDB': ['No joins', 'Eventual consistency', 'Memory usage', 'Less mature tooling'],
      'Auth0': ['Vendor lock-in', 'Cost at scale', 'Customization limits', 'External dependency'],
      'GitHub Actions': ['GitHub dependency', 'Limited self-hosted', 'YAML complexity', 'Debugging challenges']
    };
    
    if (consMap[name]) return consMap[name];
    
    // Generic cons by category
    const categoryCons = {
      'custom': ['Development time', 'Maintenance burden', 'No community', 'Potential bugs'],
      'open-source': ['Variable quality', 'Support depends on community', 'May be abandoned', 'Security concerns'],
      'commercial': ['Licensing costs', 'Vendor lock-in', 'Less flexibility', 'Closed source'],
      'managed': ['Less control', 'Vendor dependency', 'Potentially expensive', 'Data location concerns']
    };
    
    return categoryCons[category] || ['Learning curve', 'Integration effort', 'Potential limitations'];
  }

  getBestFor(name, category) {
    const bestForMap = {
      'Redux': 'Large applications with complex state logic',
      'MobX': 'Applications with reactive UI requirements',
      'Zustand': 'Small to medium React apps needing simple state',
      'PostgreSQL': 'Applications requiring complex queries and transactions',
      'MongoDB': 'Applications with varying data structures',
      'Auth0': 'Quick authentication implementation with advanced features',
      'GitHub Actions': 'Projects already using GitHub for version control'
    };
    
    return bestForMap[name] || `${category} solutions with standard requirements`;
  }

  getAvoidWhen(name, category) {
    const avoidMap = {
      'Redux': 'Building simple applications with minimal state',
      'MobX': 'Team prefers explicit over implicit behavior',
      'Zustand': 'Need extensive middleware or dev tools',
      'PostgreSQL': 'Need extreme horizontal scaling',
      'MongoDB': 'Need ACID transactions across documents',
      'Auth0': 'Have very specific authentication requirements',
      'GitHub Actions': 'Need extensive self-hosted runners'
    };
    
    return avoidMap[name] || `Requirements don't match ${category} characteristics`;
  }

  filterByConstraints(alternatives, constraints) {
    if (constraints.length === 0) return alternatives;
    
    return alternatives.filter(alt => {
      // Simple constraint matching
      for (const constraint of constraints) {
        const constraintLower = constraint.toLowerCase();
        
        // Performance constraint
        if (constraintLower.includes('performance') || constraintLower.includes('fast')) {
          if (alt.name === 'MongoDB' || alt.name === 'Redis' || alt.name === 'Zustand') {
            continue; // These are generally fast
          }
        }
        
        // Cost constraint
        if (constraintLower.includes('cost') || constraintLower.includes('free') || constraintLower.includes('cheap')) {
          if (alt.category === 'commercial' || alt.name === 'Auth0' || alt.name === 'DynamoDB') {
            return false; // These can be expensive
          }
        }
        
        // Simplicity constraint
        if (constraintLower.includes('simple') || constraintLower.includes('easy')) {
          if (alt.name === 'Redux' || alt.name === 'Kubernetes' || alt.category === 'custom') {
            return false; // These are complex
          }
        }
        
        // Scale constraint
        if (constraintLower.includes('scale') || constraintLower.includes('large')) {
          if (alt.name === 'Local filesystem' || alt.name === 'SQLite') {
            return false; // These don't scale well
          }
        }
      }
      
      return true;
    });
  }

  evaluateAlternatives(alternatives, criteria, constraints) {
    const evaluations = alternatives.map(alt => {
      const scores = {};
      let totalScore = 0;
      
      criteria.forEach(criterion => {
        const score = this.scoreAlternative(alt, criterion);
        scores[criterion] = score;
        totalScore += score;
      });
      
      // Apply constraint penalties
      const constraintPenalty = this.calculateConstraintPenalty(alt, constraints);
      totalScore = Math.max(0, totalScore - constraintPenalty);
      
      return {
        alternative: alt,
        scores,
        totalScore,
        averageScore: totalScore / criteria.length,
        constraintPenalty
      };
    });
    
    // Sort by total score
    evaluations.sort((a, b) => b.totalScore - a.totalScore);
    
    return evaluations;
  }

  scoreAlternative(alternative, criterion) {
    const criterionLower = criterion.toLowerCase();
    const name = alternative.name;
    
    // Scoring matrix (1-5 scale)
    const scores = {
      'performance': {
        'Redis': 5, 'Zustand': 5, 'NATS': 5,
        'PostgreSQL': 4, 'MongoDB': 4, 'MobX': 4,
        'Redux': 3, 'Auth0': 3, 'GitHub Actions': 3
      },
      'cost': {
        'Zustand': 5, 'Redux': 5, 'PostgreSQL': 5, 'Open Source Library': 5,
        'MobX': 5, 'Jenkins': 5, 'Custom JWT': 5,
        'GitHub Actions': 4, 'Firebase Auth': 3,
        'Auth0': 2, 'AWS Cognito': 2, 'Commercial Product': 2
      },
      'complexity': {
        'Zustand': 5, 'Firebase Auth': 5, 'Managed Service': 5,
        'MobX': 4, 'PostgreSQL': 3, 'GitHub Actions': 3,
        'Redux': 2, 'Custom Solution': 1, 'Jenkins': 2
      },
      'maintainability': {
        'Managed Service': 5, 'Commercial Product': 4,
        'Redux': 4, 'PostgreSQL': 4, 'GitHub Actions': 4,
        'MobX': 3, 'Custom Solution': 2, 'Build Custom Solution': 1
      },
      'scalability': {
        'AWS S3': 5, 'DynamoDB': 5, 'Kafka': 5, 'Managed Service': 5,
        'MongoDB': 4, 'Redis': 4, 'Kubernetes': 5,
        'PostgreSQL': 3, 'Local filesystem': 1
      }
    };
    
    // Check specific scores
    if (scores[criterionLower] && scores[criterionLower][name]) {
      return scores[criterionLower][name];
    }
    
    // Category-based scoring
    if (criterionLower === 'cost') {
      if (alternative.category === 'open-source') return 5;
      if (alternative.category === 'commercial') return 2;
      if (alternative.category === 'managed') return 3;
    }
    
    if (criterionLower === 'support') {
      if (alternative.category === 'commercial') return 5;
      if (alternative.category === 'managed') return 5;
      if (alternative.category === 'open-source') return 3;
      if (alternative.category === 'custom') return 1;
    }
    
    // Default middle score
    return 3;
  }

  calculateConstraintPenalty(alternative, constraints) {
    let penalty = 0;
    
    constraints.forEach(constraint => {
      const constraintLower = constraint.toLowerCase();
      
      // Apply penalties for constraint violations
      if (constraintLower.includes('budget') && alternative.category === 'commercial') {
        penalty += 10;
      }
      
      if (constraintLower.includes('simple') && 
          (alternative.name === 'Redux' || alternative.name === 'Kubernetes')) {
        penalty += 15;
      }
      
      if (constraintLower.includes('performance') && 
          alternative.name === 'Local filesystem') {
        penalty += 20;
      }
    });
    
    return penalty;
  }

  generateRecommendation(exploration) {
    const topAlternative = exploration.evaluation[0];
    const runnerUp = exploration.evaluation[1];
    
    const recommendation = {
      primary: topAlternative.alternative,
      score: topAlternative.totalScore,
      reasoning: this.generateReasoning(topAlternative, exploration),
      conditions: this.identifyConditions(topAlternative, exploration),
      alternativeOption: runnerUp ? {
        name: runnerUp.alternative.name,
        whenToConsider: this.whenToConsiderAlternative(topAlternative, runnerUp)
      } : null,
      actionItems: this.generateActionItems(topAlternative, exploration)
    };
    
    return recommendation;
  }

  generateReasoning(topAlternative, exploration) {
    const alt = topAlternative.alternative;
    const scores = topAlternative.scores;
    
    // Find strongest criteria
    const sortedCriteria = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([criterion]) => criterion);
    
    return `${alt.name} scores highest overall, particularly excelling in ${sortedCriteria.join(' and ')}. ` +
           `It's ${alt.bestFor.toLowerCase()}, which aligns well with the stated problem.`;
  }

  identifyConditions(topAlternative, exploration) {
    const conditions = [];
    const alt = topAlternative.alternative;
    
    // Add specific conditions based on the alternative
    if (alt.category === 'managed' || alt.category === 'commercial') {
      conditions.push('Budget allows for paid solution');
    }
    
    if (alt.name.includes('AWS') || alt.name.includes('Google') || alt.name.includes('Azure')) {
      conditions.push('Cloud vendor alignment is acceptable');
    }
    
    if (topAlternative.scores['complexity'] <= 2) {
      conditions.push('Team has expertise for complex solution');
    }
    
    // Add avoid conditions
    if (alt.avoidWhen) {
      conditions.push(`Not applicable when: ${alt.avoidWhen}`);
    }
    
    return conditions;
  }

  whenToConsiderAlternative(primary, runnerUp) {
    // Generate conditions for considering the runner-up
    const reasons = [];
    
    // Compare scores
    for (const [criterion, score] of Object.entries(runnerUp.scores)) {
      if (score > primary.scores[criterion]) {
        reasons.push(`${criterion} is critical`);
      }
    }
    
    // Category differences
    if (primary.alternative.category === 'commercial' && runnerUp.alternative.category === 'open-source') {
      reasons.push('Budget constraints emerge');
    }
    
    if (primary.alternative.category === 'managed' && runnerUp.alternative.category === 'custom') {
      reasons.push('Need more control or customization');
    }
    
    return reasons.length > 0 ? reasons.join(' or ') : 'Requirements significantly change';
  }

  generateActionItems(topAlternative, exploration) {
    const actions = [];
    const alt = topAlternative.alternative;
    
    // Research phase
    actions.push(`Research ${alt.name} documentation and best practices`);
    
    // Proof of concept
    actions.push(`Create proof of concept to validate ${alt.name} fits requirements`);
    
    // Category-specific actions
    if (alt.category === 'commercial' || alt.category === 'managed') {
      actions.push('Evaluate pricing and licensing terms');
      actions.push('Contact vendor for demo or trial');
    } else if (alt.category === 'open-source') {
      actions.push('Review community activity and maintenance status');
      actions.push('Check license compatibility');
    } else if (alt.category === 'custom') {
      actions.push('Define detailed technical specifications');
      actions.push('Estimate development effort and timeline');
    }
    
    // Implementation planning
    actions.push('Create implementation plan with milestones');
    actions.push('Identify team training needs');
    
    return actions;
  }

  async displayAlternatives(exploration) {
    console.log(chalk.yellow('🔍 Alternative Solutions Found:\n'));
    
    exploration.alternatives.forEach((alt, index) => {
      console.log(chalk.cyan(`${index + 1}. ${alt.name}`));
      console.log(chalk.gray(`   ${alt.description}`));
      console.log(chalk.green(`   ✓ Pros: ${alt.pros.slice(0, 3).join(', ')}`));
      console.log(chalk.red(`   ✗ Cons: ${alt.cons.slice(0, 3).join(', ')}`));
      console.log(chalk.gray(`   Best for: ${alt.bestFor}\n`));
    });
  }

  async displayComparisonMatrix(exploration) {
    console.log(chalk.yellow('📊 Comparison Matrix:\n'));
    
    // Header
    const criteria = exploration.criteria;
    console.log(chalk.gray('Alternative'.padEnd(25) + criteria.map(c => c.padEnd(15)).join('')));
    console.log(chalk.gray('-'.repeat(25 + criteria.length * 15)));
    
    // Rows
    exploration.evaluation.forEach(eval => {
      const name = eval.alternative.name.padEnd(25);
      const scores = criteria.map(c => {
        const score = eval.scores[c];
        const stars = '★'.repeat(score) + '☆'.repeat(5 - score);
        return stars.padEnd(15);
      });
      
      console.log(name + scores.join(''));
    });
    
    console.log(chalk.gray('\n(★ = 1 point, ☆ = 0 points)'));
  }

  async displayRecommendation(exploration) {
    const rec = exploration.recommendation;
    
    console.log(chalk.green('\n🏆 Recommendation:\n'));
    console.log(chalk.white(`Recommended Solution: ${chalk.cyan(rec.primary.name)}`));
    console.log(chalk.gray(`\n${rec.reasoning}`));
    
    if (rec.conditions.length > 0) {
      console.log(chalk.yellow('\n⚡ Conditions for Success:'));
      rec.conditions.forEach(condition => {
        console.log(chalk.gray(`  • ${condition}`));
      });
    }
    
    if (rec.alternativeOption) {
      console.log(chalk.yellow(`\n🔄 Alternative Option: ${rec.alternativeOption.name}`));
      console.log(chalk.gray(`  Consider when: ${rec.alternativeOption.whenToConsider}`));
    }
    
    console.log(chalk.yellow('\n📋 Next Steps:'));
    rec.actionItems.forEach((action, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${action}`));
    });
    
    // Context-specific advice
    console.log(chalk.blue('\n💡 Additional Considerations:'));
    console.log(chalk.gray(`  • Problem complexity: ${exploration.context.complexity}`));
    console.log(chalk.gray(`  • Expected scale: ${exploration.context.scale}`));
    console.log(chalk.gray(`  • Consider running a time-boxed spike to validate the choice`));
  }
}