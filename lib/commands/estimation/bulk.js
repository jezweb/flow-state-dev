/**
 * Estimation Bulk command - Analyze issue complexity and suggest estimates
 */
import chalk from 'chalk';
import { GitHubSlashCommand } from '../base.js';

export default class EstimationBulkCommand extends GitHubSlashCommand {
  constructor() {
    super('/estimate:bulk', 'Analyze issue complexity and suggest estimates', {
      aliases: ['/est:bulk', '/est:b'],
      category: 'estimation',
      usage: '/estimate:bulk [options]',
      examples: [
        'fsd slash "/estimate:bulk"',
        'fsd slash "/estimate:bulk --filter state:open"',
        'fsd slash "/estimate:bulk --scale fibonacci"',
        'fsd slash "/estimate:bulk --milestone Sprint-1 --auto-assign"'
      ],
      options: [
        { name: 'filter', type: 'string', description: 'Filter issues to estimate (state:open, label:bug, etc.)' },
        { name: 'scale', type: 'string', description: 'Estimation scale: fibonacci, linear, tshirt', default: 'fibonacci' },
        { name: 'milestone', type: 'string', description: 'Estimate issues in specific milestone' },
        { name: 'auto-assign', type: 'boolean', description: 'Automatically assign estimates based on analysis' },
        { name: 'threshold', type: 'number', description: 'Only estimate issues without existing story points' }
      ]
    });
  }

  async execute(options) {
    console.log(chalk.blue('🎯 Bulk Issue Estimation\n'));
    
    try {
      // Get issues to estimate
      const issues = await this.getIssuesForEstimation(options);
      
      if (issues.length === 0) {
        console.log(chalk.yellow('No issues found for estimation'));
        console.log(chalk.gray('\nTips:'));
        console.log(chalk.gray('  • Create some issues first'));
        console.log(chalk.gray('  • Use --filter to target specific issues'));
        console.log(chalk.gray('  • Use --milestone to estimate sprint issues'));
        return;
      }

      // Analyze complexity and generate estimates
      console.log(chalk.white(`📊 Analyzing ${issues.length} issues for estimation...\n`));
      
      const estimationResults = await this.analyzeAndEstimateIssues(issues, options);
      
      // Display results
      this.displayEstimationResults(estimationResults, options);
      
      // Option to apply estimates
      if (options['auto-assign'] || await this.confirmApplyEstimates(estimationResults)) {
        await this.applyEstimates(estimationResults, options);
      }
      
      // Show summary and recommendations
      this.showEstimationSummary(estimationResults, options);

    } catch (error) {
      this.log(`Failed to perform bulk estimation: ${error.message}`, 'error');
    }
  }

  async getIssuesForEstimation(options) {
    let issues = [];
    
    if (options.milestone) {
      // Get issues from specific milestone
      try {
        const result = await this.exec(`gh issue list --milestone "${options.milestone}" --state open --json number,title,body,labels,assignees`, { silent: true });
        issues = JSON.parse(result);
      } catch (error) {
        this.log(`Failed to get milestone issues: ${error.message}`, 'error');
      }
    } else if (options.filter) {
      // Apply custom filter
      issues = await this.getFilteredIssues(options.filter);
    } else {
      // Get all open issues
      try {
        const result = await this.exec('gh issue list --state open --json number,title,body,labels,assignees --limit 50', { silent: true });
        issues = JSON.parse(result);
      } catch (error) {
        this.log('Failed to get issues', 'error');
        return [];
      }
    }

    // Filter out issues that already have story point estimates (if threshold set)
    if (options.threshold !== undefined) {
      issues = issues.filter(issue => {
        const existingPoints = this.extractStoryPoints(issue);
        return existingPoints === null || existingPoints === 0;
      });
    }

    return issues;
  }

  async getFilteredIssues(filter) {
    const filterParts = filter.split(/\s+/);
    let query = 'gh issue list --json number,title,body,labels,assignees';
    
    for (const part of filterParts) {
      const [key, value] = part.split(':');
      switch (key) {
        case 'state':
          query += ` --state ${value}`;
          break;
        case 'label':
          query += ` --label "${value}"`;
          break;
        case 'assignee':
          query += ` --assignee "${value}"`;
          break;
        case 'author':
          query += ` --author "${value}"`;
          break;
      }
    }
    
    query += ' --limit 100';
    
    try {
      const result = await this.exec(query, { silent: true });
      return JSON.parse(result);
    } catch (error) {
      return [];
    }
  }

  async analyzeAndEstimateIssues(issues, options) {
    const results = [];
    const scale = this.getEstimationScale(options.scale);
    
    for (const issue of issues) {
      const analysis = this.analyzeIssueComplexity(issue);
      const estimate = this.calculateEstimate(analysis, scale);
      const existingPoints = this.extractStoryPoints(issue);
      
      results.push({
        issue,
        analysis,
        estimate,
        existingPoints,
        confidence: analysis.confidence,
        factors: analysis.factors
      });
    }
    
    return results;
  }

  analyzeIssueComplexity(issue) {
    const title = issue.title.toLowerCase();
    const body = (issue.body || '').toLowerCase();
    const labels = issue.labels?.map(l => l.name.toLowerCase()) || [];
    
    let complexityScore = 0;
    let confidence = 'medium';
    const factors = [];

    // Title-based analysis
    const titleFactors = this.analyzeTitleComplexity(title);
    complexityScore += titleFactors.score;
    factors.push(...titleFactors.factors);

    // Body-based analysis
    const bodyFactors = this.analyzeBodyComplexity(body);
    complexityScore += bodyFactors.score;
    factors.push(...bodyFactors.factors);

    // Label-based analysis
    const labelFactors = this.analyzeLabelComplexity(labels);
    complexityScore += labelFactors.score;
    factors.push(...labelFactors.factors);

    // Determine confidence based on available information
    if (body.length > 200 && labels.length > 1) {
      confidence = 'high';
    } else if (body.length < 50 && labels.length === 0) {
      confidence = 'low';
    }

    // Normalize score to complexity level
    let complexity;
    if (complexityScore <= 2) {
      complexity = 'trivial';
    } else if (complexityScore <= 5) {
      complexity = 'simple';
    } else if (complexityScore <= 10) {
      complexity = 'medium';
    } else if (complexityScore <= 15) {
      complexity = 'complex';
    } else {
      complexity = 'epic';
    }

    return {
      score: complexityScore,
      complexity,
      confidence,
      factors: factors.filter(f => f) // Remove empty factors
    };
  }

  analyzeTitleComplexity(title) {
    let score = 0;
    const factors = [];

    // Complexity keywords
    const complexityKeywords = {
      trivial: ['fix typo', 'update text', 'change color'],
      simple: ['add button', 'update style', 'fix bug'],
      medium: ['implement', 'create', 'add feature', 'refactor'],
      complex: ['integrate', 'architecture', 'design system', 'migration'],
      epic: ['rebuild', 'complete rewrite', 'new platform']
    };

    // Check for complexity indicators
    for (const [level, keywords] of Object.entries(complexityKeywords)) {
      for (const keyword of keywords) {
        if (title.includes(keyword)) {
          const levelScore = { trivial: 1, simple: 2, medium: 5, complex: 10, epic: 20 }[level];
          score += levelScore;
          factors.push(`Title indicates ${level} work: "${keyword}"`);
          break;
        }
      }
    }

    // Length-based complexity
    if (title.length > 100) {
      score += 2;
      factors.push('Long title suggests complex requirements');
    }

    // Multiple components mentioned
    if (title.match(/\band\b/g)?.length > 1) {
      score += 3;
      factors.push('Multiple components mentioned');
    }

    return { score, factors };
  }

  analyzeBodyComplexity(body) {
    let score = 0;
    const factors = [];

    if (!body || body.length < 10) {
      factors.push('Limited description - low confidence estimate');
      return { score: 0, factors };
    }

    // Length indicates detail level
    if (body.length > 500) {
      score += 2;
      factors.push('Detailed description');
    } else if (body.length < 100) {
      score -= 1;
      factors.push('Brief description');
    }

    // Technical complexity indicators
    const techKeywords = [
      'database', 'api', 'integration', 'authentication', 'security',
      'performance', 'optimization', 'testing', 'deployment', 'migration'
    ];
    
    const foundTechKeywords = techKeywords.filter(keyword => body.includes(keyword));
    if (foundTechKeywords.length > 0) {
      score += foundTechKeywords.length * 2;
      factors.push(`Technical complexity: ${foundTechKeywords.join(', ')}`);
    }

    // Acceptance criteria
    if (body.includes('acceptance criteria') || body.match(/- \[[ x]\]/g)) {
      score += 1;
      factors.push('Has acceptance criteria');
    }

    // Multiple steps or requirements
    const listItems = body.match(/^[-*+]\s/gm)?.length || 0;
    if (listItems > 5) {
      score += 2;
      factors.push(`Multiple requirements (${listItems} items)`);
    }

    return { score, factors };
  }

  analyzeLabelComplexity(labels) {
    let score = 0;
    const factors = [];

    // Label-based complexity mapping
    const labelComplexity = {
      'bug': 2,
      'enhancement': 3,
      'feature': 5,
      'epic': 15,
      'breaking-change': 8,
      'documentation': 1,
      'good first issue': 1,
      'help wanted': 2,
      'priority:high': 2,
      'priority:critical': 3,
      'scope:large': 5,
      'scope:medium': 3,
      'scope:small': 1
    };

    for (const label of labels) {
      if (labelComplexity[label]) {
        score += labelComplexity[label];
        factors.push(`Label "${label}" adds complexity`);
      }
    }

    // Many labels might indicate complexity
    if (labels.length > 4) {
      score += 2;
      factors.push('Multiple labels suggest complex issue');
    }

    return { score, factors };
  }

  calculateEstimate(analysis, scale) {
    const { complexity, score } = analysis;
    
    // Map complexity to story points based on scale
    const estimates = {
      fibonacci: {
        trivial: 1,
        simple: 2,
        medium: 5,
        complex: 8,
        epic: 13
      },
      linear: {
        trivial: 1,
        simple: 2,
        medium: 4,
        complex: 6,
        epic: 8
      },
      tshirt: {
        trivial: 'XS',
        simple: 'S',
        medium: 'M',
        complex: 'L',
        epic: 'XL'
      }
    };

    let baseEstimate = estimates[scale][complexity];
    
    // Fine-tune based on score for numeric scales
    if (typeof baseEstimate === 'number' && scale === 'fibonacci') {
      if (score > 20) baseEstimate = Math.min(21, baseEstimate + 5);
      else if (score > 15) baseEstimate = Math.min(13, baseEstimate + 3);
      else if (score < 3) baseEstimate = Math.max(1, baseEstimate - 1);
    }

    return {
      value: baseEstimate,
      scale,
      reasoning: `Based on ${complexity} complexity (score: ${score})`
    };
  }

  getEstimationScale(scaleName) {
    const validScales = ['fibonacci', 'linear', 'tshirt'];
    return validScales.includes(scaleName) ? scaleName : 'fibonacci';
  }

  displayEstimationResults(results, options) {
    console.log(chalk.yellow('📋 Estimation Results:\n'));

    results.forEach((result, index) => {
      const { issue, analysis, estimate, existingPoints, confidence } = result;
      
      console.log(`${chalk.cyan(`${index + 1}.`)} #${issue.number} ${chalk.white(issue.title)}`);
      
      // Show existing vs suggested estimate
      if (existingPoints !== null && existingPoints > 0) {
        console.log(`   Current: ${chalk.gray(existingPoints)} pts | Suggested: ${chalk.green(estimate.value)} pts`);
      } else {
        console.log(`   Suggested: ${chalk.green(estimate.value)} pts (${estimate.scale})`);
      }
      
      console.log(`   Complexity: ${chalk.cyan(analysis.complexity)} | Confidence: ${this.formatConfidence(confidence)}`);
      console.log(`   Reasoning: ${chalk.gray(estimate.reasoning)}`);
      
      // Show key factors (first 2)
      if (analysis.factors.length > 0) {
        const topFactors = analysis.factors.slice(0, 2);
        console.log(`   Factors: ${chalk.gray(topFactors.join('; '))}`);
      }
      
      console.log('');
    });
  }

  async confirmApplyEstimates(results) {
    const issuesWithoutEstimates = results.filter(r => r.existingPoints === null || r.existingPoints === 0);
    const issuesWithEstimates = results.filter(r => r.existingPoints !== null && r.existingPoints > 0);
    
    console.log(chalk.yellow('📊 Estimation Summary:'));
    console.log(`  Issues to estimate: ${chalk.cyan(issuesWithoutEstimates.length)}`);
    console.log(`  Issues with existing estimates: ${chalk.gray(issuesWithEstimates.length)}`);
    
    if (issuesWithoutEstimates.length === 0) {
      console.log(chalk.green('\n✅ All issues already have estimates'));
      return false;
    }
    
    return await this.confirm(
      `\nApply story point estimates to ${issuesWithoutEstimates.length} issue(s)?`,
      true
    );
  }

  async applyEstimates(results, options) {
    console.log(chalk.blue('\n🏷️ Applying Estimates...\n'));
    
    let applied = 0;
    let skipped = 0;
    let failed = 0;

    for (const result of results) {
      const { issue, estimate, existingPoints } = result;
      
      // Skip if already has estimate (unless forcing)
      if (existingPoints !== null && existingPoints > 0 && !options.force) {
        console.log(chalk.gray(`⏭️  #${issue.number}: Already has ${existingPoints} pts`));
        skipped++;
        continue;
      }

      try {
        await this.applyStoryPointsToIssue(issue.number, estimate.value, estimate.scale);
        console.log(chalk.green(`✅ #${issue.number}: Applied ${estimate.value} pts`));
        applied++;
      } catch (error) {
        console.log(chalk.red(`❌ #${issue.number}: Failed - ${error.message}`));
        failed++;
      }
    }

    console.log(chalk.green(`\n📊 Application Results:`));
    console.log(`  Applied: ${chalk.green(applied)}`);
    console.log(`  Skipped: ${chalk.gray(skipped)}`);
    console.log(`  Failed: ${chalk.red(failed)}`);
  }

  async applyStoryPointsToIssue(issueNumber, storyPoints, scale) {
    // Create story point label based on scale
    let labelName;
    if (scale === 'tshirt') {
      labelName = `size:${storyPoints}`;
    } else {
      labelName = `points:${storyPoints}`;
    }

    try {
      // Add the story point label
      await this.exec(`gh issue edit ${issueNumber} --add-label "${labelName}"`, { silent: true });
    } catch (error) {
      throw new Error(`Failed to add label: ${error.message}`);
    }
  }

  showEstimationSummary(results, options) {
    console.log(chalk.yellow('\n📈 Estimation Analysis:\n'));

    // Calculate statistics
    const estimates = results.map(r => typeof r.estimate.value === 'number' ? r.estimate.value : 0).filter(v => v > 0);
    const complexityDistribution = {};
    const confidenceDistribution = {};

    results.forEach(result => {
      complexityDistribution[result.analysis.complexity] = (complexityDistribution[result.analysis.complexity] || 0) + 1;
      confidenceDistribution[result.confidence] = (confidenceDistribution[result.confidence] || 0) + 1;
    });

    if (estimates.length > 0) {
      const total = estimates.reduce((sum, est) => sum + est, 0);
      const average = (total / estimates.length).toFixed(1);
      const min = Math.min(...estimates);
      const max = Math.max(...estimates);

      console.log(chalk.cyan('Story Points Summary:'));
      console.log(`  Total: ${chalk.white(total)} pts`);
      console.log(`  Average: ${chalk.white(average)} pts`);
      console.log(`  Range: ${chalk.white(min)} - ${chalk.white(max)} pts`);
    }

    console.log(chalk.cyan('\nComplexity Distribution:'));
    Object.entries(complexityDistribution).forEach(([complexity, count]) => {
      console.log(`  ${complexity}: ${chalk.white(count)} issue(s)`);
    });

    console.log(chalk.cyan('\nConfidence Distribution:'));
    Object.entries(confidenceDistribution).forEach(([confidence, count]) => {
      console.log(`  ${confidence}: ${chalk.white(count)} issue(s)`);
    });

    // Recommendations
    console.log(chalk.gray('\n💡 Recommendations:'));
    
    const lowConfidenceCount = confidenceDistribution.low || 0;
    if (lowConfidenceCount > 0) {
      console.log(chalk.gray(`  • Review ${lowConfidenceCount} low-confidence estimates - add more details`));
    }
    
    const epicCount = complexityDistribution.epic || 0;
    if (epicCount > 0) {
      console.log(chalk.gray(`  • Break down ${epicCount} epic-sized issues into smaller tasks`));
    }
    
    console.log(chalk.gray('  • Refine estimates through team discussion'));
    console.log(chalk.gray('  • Track actual vs estimated effort for future calibration'));
  }

  extractStoryPoints(issue) {
    const labels = issue.labels?.map(l => l.name) || [];
    return this.extractStoryPointsFromLabels(labels);
  }

  extractStoryPointsFromLabels(labels) {
    const pointPatterns = [
      /^(\d+)\s*points?$/i,
      /^points?:?\s*(\d+)$/i,
      /^sp[-:]?(\d+)$/i,
      /^size:(\d+)$/i,
      /^(\d+)[-_]?pts?$/i
    ];

    for (const label of labels) {
      for (const pattern of pointPatterns) {
        const match = label.match(pattern);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }

    return null;
  }

  formatConfidence(confidence) {
    const colors = {
      low: chalk.red,
      medium: chalk.yellow,
      high: chalk.green
    };
    
    return colors[confidence] ? colors[confidence](confidence) : chalk.gray(confidence);
  }
}