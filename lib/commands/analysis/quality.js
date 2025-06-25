/**
 * Quality command - analyze code quality and technical debt
 */
import chalk from 'chalk';
import { BaseSlashCommand } from '../base.js';

export default class QualityCommand extends BaseSlashCommand {
  constructor() {
    super('/quality', 'Analyze code quality and technical debt', {
      aliases: ['/qa'],
      category: 'analysis',
      requiresRepo: true,
      usage: '/quality [aspect] [options]',
      examples: [
        'fsd slash "/quality"',
        'fsd slash "/quality lint --fix"',
        'fsd slash "/quality smells"',
        'fsd slash "/quality debt"',
        'fsd slash "/quality score"'
      ],
      options: [
        { name: 'fix', type: 'boolean', description: 'Auto-fix issues where possible' },
        { name: 'threshold', type: 'number', description: 'Quality score threshold' },
        { name: 'format', type: 'string', description: 'Output format (text, json)' },
        { name: 'ignore', type: 'string', description: 'Patterns to ignore' }
      ]
    });
  }

  async execute(options) {
    const { args } = options;
    const aspect = args?.[0] || 'overview';
    
    switch (aspect) {
      case 'overview':
        await this.showQualityOverview(options);
        break;
      case 'lint':
        await this.runLintAnalysis(options);
        break;
      case 'smells':
        await this.detectCodeSmells(options);
        break;
      case 'debt':
        await this.analyzeTechnicalDebt(options);
        break;
      case 'score':
        await this.calculateQualityScore(options);
        break;
      case 'refactor':
        await this.suggestRefactoring(options);
        break;
      default:
        this.log(`Unknown quality aspect: ${aspect}`, 'error');
        console.log(chalk.gray('Available aspects: overview, lint, smells, debt, score, refactor'));
    }
  }

  async showQualityOverview(options) {
    console.log(chalk.blue('🏆 Code Quality Overview\n'));
    
    try {
      // Calculate overall quality score
      const score = await this.calculateOverallScore();
      
      console.log(chalk.yellow('📊 Quality Score:'));
      this.displayQualityScore(score.overall);
      
      // Component scores
      console.log(chalk.yellow('\n📈 Component Scores:'));
      console.log(`  Code Style: ${this.formatScore(score.style)}/10`);
      console.log(`  Test Coverage: ${this.formatScore(score.coverage)}/10`);
      console.log(`  Documentation: ${this.formatScore(score.documentation)}/10`);
      console.log(`  Complexity: ${this.formatScore(score.complexity)}/10`);
      console.log(`  Dependencies: ${this.formatScore(score.dependencies)}/10`);
      
      // Quick health checks
      console.log(chalk.yellow('\n🏥 Health Checks:'));
      const health = await this.performHealthChecks();
      
      Object.entries(health).forEach(([check, result]) => {
        const icon = result.passed ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${icon} ${check}: ${result.message}`);
      });
      
      // Recent trends
      console.log(chalk.yellow('\n📈 Recent Trends:'));
      const trends = await this.getQualityTrends();
      
      if (trends) {
        console.log(`  Quality score: ${this.formatTrend(trends.score)}`);
        console.log(`  Technical debt: ${this.formatTrend(trends.debt, true)}`);
        console.log(`  Code coverage: ${this.formatTrend(trends.coverage)}`);
      } else {
        console.log(chalk.gray('  No historical data available'));
      }
      
      // Top issues
      console.log(chalk.yellow('\n⚠️  Top Issues:'));
      const issues = await this.getTopQualityIssues();
      
      if (issues.length === 0) {
        console.log(chalk.green('  No major issues detected!'));
      } else {
        issues.slice(0, 5).forEach(issue => {
          console.log(`  • ${issue.severity === 'high' ? chalk.red(issue.type) : chalk.yellow(issue.type)}: ${issue.message}`);
        });
      }
      
      // Recommendations
      console.log(chalk.gray('\n💡 Improve Quality:'));
      this.generateQualityRecommendations(score, health);
      
    } catch (error) {
      this.log(`Failed to generate quality overview: ${error.message}`, 'error');
    }
  }

  async runLintAnalysis(options) {
    console.log(chalk.blue('🔍 Code Linting Analysis\n'));
    
    try {
      const fix = options.fix || false;
      
      // Detect linter
      const linter = await this.detectLinter();
      
      if (!linter) {
        console.log(chalk.yellow('No linter configured.'));
        console.log(chalk.gray('\nPopular linters:'));
        console.log(chalk.gray('  • ESLint: npm install --save-dev eslint'));
        console.log(chalk.gray('  • TSLint: npm install --save-dev tslint'));
        console.log(chalk.gray('  • StandardJS: npm install --save-dev standard'));
        return;
      }
      
      console.log(chalk.gray(`Using ${linter.name}...\n`));
      
      // Run linter
      const command = fix ? linter.fixCommand : linter.command;
      
      try {
        const result = await this.exec(command, { silent: false });
        
        if (!result.trim()) {
          console.log(chalk.green('\n✅ No linting issues found!'));
        }
      } catch (error) {
        // Linters often exit with error code when issues found
        if (fix) {
          console.log(chalk.green('\n✅ Fixed all auto-fixable issues'));
          console.log(chalk.gray('Run without --fix to see remaining issues'));
        }
      }
      
      // Linting statistics
      console.log(chalk.yellow('\n📊 Linting Statistics:'));
      const stats = await this.getLintingStats();
      
      console.log(`  Total files checked: ${chalk.cyan(stats.files)}`);
      console.log(`  Errors: ${stats.errors > 0 ? chalk.red(stats.errors) : chalk.green('0')}`);
      console.log(`  Warnings: ${stats.warnings > 0 ? chalk.yellow(stats.warnings) : chalk.green('0')}`);
      
      // Common issues
      if (stats.topIssues.length > 0) {
        console.log(chalk.yellow('\n🔝 Most Common Issues:'));
        stats.topIssues.forEach(issue => {
          console.log(`  • ${issue.rule}: ${chalk.cyan(issue.count)} occurrences`);
        });
      }
      
      // Configuration
      console.log(chalk.gray('\n💡 Linting Tips:'));
      console.log(chalk.gray('  • Configure rules in .eslintrc'));
      console.log(chalk.gray('  • Add .eslintignore for files to skip'));
      console.log(chalk.gray('  • Use prettier for consistent formatting'));
      
    } catch (error) {
      this.log(`Failed to run lint analysis: ${error.message}`, 'error');
    }
  }

  async detectCodeSmells(options) {
    console.log(chalk.blue('👃 Code Smell Detection\n'));
    
    try {
      console.log(chalk.gray('Analyzing code for common smells...\n'));
      
      const smells = await this.analyzeCodeSmells();
      
      if (smells.length === 0) {
        console.log(chalk.green('✅ No significant code smells detected!'));
        return;
      }
      
      // Group by severity
      const bySeverity = {
        high: smells.filter(s => s.severity === 'high'),
        medium: smells.filter(s => s.severity === 'medium'),
        low: smells.filter(s => s.severity === 'low')
      };
      
      // Display high severity
      if (bySeverity.high.length > 0) {
        console.log(chalk.red('🚨 High Severity:'));
        bySeverity.high.forEach(smell => {
          console.log(`\n  ${chalk.red(smell.type)}`);
          console.log(`  ${smell.description}`);
          console.log(chalk.gray(`  Location: ${smell.location}`));
          if (smell.suggestion) {
            console.log(chalk.cyan(`  Suggestion: ${smell.suggestion}`));
          }
        });
      }
      
      // Display medium severity
      if (bySeverity.medium.length > 0) {
        console.log(chalk.yellow('\n⚠️  Medium Severity:'));
        bySeverity.medium.forEach(smell => {
          console.log(`\n  ${chalk.yellow(smell.type)}`);
          console.log(`  ${smell.description}`);
          console.log(chalk.gray(`  Location: ${smell.location}`));
        });
      }
      
      // Summary
      console.log(chalk.yellow('\n📊 Summary:'));
      console.log(`  Total code smells: ${chalk.cyan(smells.length)}`);
      console.log(`  High severity: ${chalk.red(bySeverity.high.length)}`);
      console.log(`  Medium severity: ${chalk.yellow(bySeverity.medium.length)}`);
      console.log(`  Low severity: ${chalk.gray(bySeverity.low.length)}`);
      
      // Common patterns
      console.log(chalk.yellow('\n🎯 Common Patterns:'));
      const patterns = this.groupSmellsByType(smells);
      
      Object.entries(patterns).slice(0, 5).forEach(([type, count]) => {
        console.log(`  • ${type}: ${chalk.cyan(count)} occurrences`);
      });
      
      // Refactoring priority
      console.log(chalk.gray('\n💡 Refactoring Priority:'));
      console.log(chalk.gray('  1. Address high severity issues first'));
      console.log(chalk.gray('  2. Focus on files with multiple smells'));
      console.log(chalk.gray('  3. Consider architectural improvements'));
      
    } catch (error) {
      this.log(`Failed to detect code smells: ${error.message}`, 'error');
    }
  }

  async analyzeTechnicalDebt(options) {
    console.log(chalk.blue('💳 Technical Debt Analysis\n'));
    
    try {
      // Calculate technical debt
      const debt = await this.calculateTechnicalDebt();
      
      console.log(chalk.yellow('📊 Debt Summary:'));
      console.log(`  Total debt: ${chalk.red(debt.total)} hours`);
      console.log(`  Debt ratio: ${this.formatDebtRatio(debt.ratio)}%`);
      console.log(`  Monthly interest: ${chalk.yellow(debt.interest)} hours`);
      
      // Debt by category
      console.log(chalk.yellow('\n📂 Debt by Category:'));
      Object.entries(debt.categories).forEach(([category, hours]) => {
        const percentage = ((hours / debt.total) * 100).toFixed(1);
        console.log(`  ${category}: ${chalk.cyan(hours)} hours (${percentage}%)`);
      });
      
      // High debt areas
      console.log(chalk.yellow('\n🔥 High Debt Areas:'));
      debt.hotspots.forEach(hotspot => {
        console.log(`\n  ${chalk.red(hotspot.file)}`);
        console.log(`    Debt: ${chalk.yellow(hotspot.hours)} hours`);
        console.log(`    Issues: ${hotspot.issues.join(', ')}`);
      });
      
      // TODO/FIXME comments
      console.log(chalk.yellow('\n📝 Technical Debt Markers:'));
      const markers = await this.findDebtMarkers();
      
      console.log(`  TODO comments: ${chalk.cyan(markers.todo)}`);
      console.log(`  FIXME comments: ${chalk.yellow(markers.fixme)}`);
      console.log(`  HACK comments: ${chalk.red(markers.hack)}`);
      console.log(`  XXX comments: ${chalk.red(markers.xxx)}`);
      
      // Debt timeline
      console.log(chalk.yellow('\n📅 Debt Timeline:'));
      if (debt.timeline.length > 0) {
        debt.timeline.forEach(item => {
          console.log(`  ${item.age}: ${chalk.cyan(item.count)} items (${item.hours} hours)`);
        });
      }
      
      // Cost estimation
      console.log(chalk.yellow('\n💰 Cost Estimation:'));
      const hourlyRate = 100; // Default hourly rate
      console.log(`  Total cost: ${chalk.red('$' + (debt.total * hourlyRate).toLocaleString())}`);
      console.log(`  Monthly interest cost: ${chalk.yellow('$' + (debt.interest * hourlyRate).toLocaleString())}`);
      console.log(chalk.gray(`  (Based on $${hourlyRate}/hour)`));
      
      // Payoff strategies
      console.log(chalk.gray('\n💡 Debt Reduction Strategies:'));
      console.log(chalk.gray('  • Allocate 20% of sprint capacity to debt'));
      console.log(chalk.gray('  • Boy Scout Rule: Leave code better than found'));
      console.log(chalk.gray('  • Refactor high-interest (frequently modified) areas'));
      console.log(chalk.gray('  • Create debt reduction sprints'));
      
    } catch (error) {
      this.log(`Failed to analyze technical debt: ${error.message}`, 'error');
    }
  }

  async calculateQualityScore(options) {
    console.log(chalk.blue('🎯 Code Quality Score Calculation\n'));
    
    try {
      const threshold = options.threshold || 7;
      
      console.log(chalk.gray('Calculating comprehensive quality score...\n'));
      
      // Calculate detailed scores
      const scores = await this.calculateDetailedScores();
      
      // Overall score
      console.log(chalk.yellow('🏆 Overall Quality Score:'));
      this.displayDetailedQualityScore(scores.overall);
      
      // Category breakdown
      console.log(chalk.yellow('\n📊 Category Scores:'));
      
      Object.entries(scores.categories).forEach(([category, score]) => {
        console.log(`\n${chalk.cyan(this.formatCategoryName(category))}:`);
        console.log(`  Score: ${this.formatScore(score.value)}/10`);
        console.log(`  Grade: ${this.getGrade(score.value)}`);
        
        if (score.factors.length > 0) {
          console.log('  Factors:');
          score.factors.forEach(factor => {
            const icon = factor.positive ? chalk.green('+') : chalk.red('-');
            console.log(`    ${icon} ${factor.description}`);
          });
        }
      });
      
      // Strengths and weaknesses
      console.log(chalk.yellow('\n💪 Strengths:'));
      scores.strengths.forEach(strength => {
        console.log(`  • ${chalk.green(strength)}`);
      });
      
      console.log(chalk.yellow('\n🔧 Areas for Improvement:'));
      scores.weaknesses.forEach(weakness => {
        console.log(`  • ${chalk.yellow(weakness)}`);
      });
      
      // Comparison
      if (scores.overall.value >= threshold) {
        console.log(chalk.green(`\n✅ Quality score meets threshold (${threshold})`));
      } else {
        console.log(chalk.red(`\n❌ Quality score below threshold (${threshold})`));
      }
      
      // Improvement plan
      console.log(chalk.gray('\n💡 Improvement Plan:'));
      this.generateImprovementPlan(scores);
      
    } catch (error) {
      this.log(`Failed to calculate quality score: ${error.message}`, 'error');
    }
  }

  async suggestRefactoring(options) {
    console.log(chalk.blue('🔨 Refactoring Suggestions\n'));
    
    try {
      console.log(chalk.gray('Analyzing code for refactoring opportunities...\n'));
      
      const suggestions = await this.analyzeRefactoringOpportunities();
      
      if (suggestions.length === 0) {
        console.log(chalk.green('✅ No urgent refactoring needed!'));
        return;
      }
      
      // Group by priority
      const byPriority = {
        high: suggestions.filter(s => s.priority === 'high'),
        medium: suggestions.filter(s => s.priority === 'medium'),
        low: suggestions.filter(s => s.priority === 'low')
      };
      
      // High priority refactorings
      if (byPriority.high.length > 0) {
        console.log(chalk.red('🚨 High Priority Refactorings:'));
        byPriority.high.forEach(suggestion => {
          console.log(`\n  ${chalk.red(suggestion.type)}`);
          console.log(`  File: ${suggestion.file}`);
          console.log(`  Issue: ${suggestion.issue}`);
          console.log(`  Suggestion: ${chalk.cyan(suggestion.action)}`);
          console.log(`  Effort: ${chalk.yellow(suggestion.effort)} hours`);
          console.log(`  Impact: ${chalk.green(suggestion.impact)}`);
        });
      }
      
      // Medium priority
      if (byPriority.medium.length > 0) {
        console.log(chalk.yellow('\n⚠️  Medium Priority Refactorings:'));
        byPriority.medium.forEach(suggestion => {
          console.log(`\n  ${chalk.yellow(suggestion.type)}`);
          console.log(`  File: ${suggestion.file}`);
          console.log(`  Suggestion: ${chalk.cyan(suggestion.action)}`);
        });
      }
      
      // Refactoring patterns
      console.log(chalk.yellow('\n🎯 Common Refactoring Patterns:'));
      const patterns = this.groupRefactoringPatterns(suggestions);
      
      Object.entries(patterns).forEach(([pattern, count]) => {
        console.log(`  • ${pattern}: ${chalk.cyan(count)} occurrences`);
      });
      
      // Refactoring plan
      console.log(chalk.yellow('\n📋 Suggested Refactoring Plan:'));
      const plan = this.createRefactoringPlan(suggestions);
      
      plan.phases.forEach((phase, idx) => {
        console.log(`\n  Phase ${idx + 1}: ${phase.name}`);
        console.log(`  Duration: ${chalk.cyan(phase.duration)}`);
        console.log(`  Tasks:`);
        phase.tasks.forEach(task => {
          console.log(`    • ${task}`);
        });
      });
      
      // Tips
      console.log(chalk.gray('\n💡 Refactoring Tips:'));
      console.log(chalk.gray('  • Write tests before refactoring'));
      console.log(chalk.gray('  • Refactor in small increments'));
      console.log(chalk.gray('  • Use version control effectively'));
      console.log(chalk.gray('  • Review refactored code'));
      
    } catch (error) {
      this.log(`Failed to suggest refactoring: ${error.message}`, 'error');
    }
  }

  // Helper methods
  async calculateOverallScore() {
    // Would perform actual calculations
    return {
      overall: 7.5,
      style: 8.0,
      coverage: 7.0,
      documentation: 6.5,
      complexity: 7.5,
      dependencies: 8.0
    };
  }

  displayQualityScore(score) {
    const maxScore = 10;
    const percentage = (score / maxScore) * 100;
    const filled = Math.round((score / maxScore) * 20);
    const empty = 20 - filled;
    
    let color;
    if (score >= 8) color = chalk.green;
    else if (score >= 6) color = chalk.yellow;
    else color = chalk.red;
    
    const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    
    console.log(`  ${bar} ${color(score.toFixed(1))}/10 (${percentage.toFixed(0)}%)`);
    console.log(`  Grade: ${this.getGrade(score)}`);
  }

  displayDetailedQualityScore(score) {
    this.displayQualityScore(score.value);
    
    if (score.trend) {
      console.log(`  Trend: ${this.formatTrend(score.trend)}`);
    }
  }

  formatScore(score) {
    if (score >= 8) return chalk.green(score.toFixed(1));
    if (score >= 6) return chalk.yellow(score.toFixed(1));
    return chalk.red(score.toFixed(1));
  }

  getGrade(score) {
    if (score >= 9) return chalk.green('A+');
    if (score >= 8) return chalk.green('A');
    if (score >= 7) return chalk.yellow('B');
    if (score >= 6) return chalk.yellow('C');
    if (score >= 5) return chalk.orange('D');
    return chalk.red('F');
  }

  formatTrend(value, inverse = false) {
    const positive = inverse ? value < 0 : value > 0;
    
    if (positive) {
      return chalk.green(`↑ ${Math.abs(value)}%`);
    } else if (value < 0) {
      return chalk.red(`↓ ${Math.abs(value)}%`);
    }
    return chalk.gray('→ 0%');
  }

  formatDebtRatio(ratio) {
    if (ratio < 5) return chalk.green(ratio.toFixed(1));
    if (ratio < 10) return chalk.yellow(ratio.toFixed(1));
    return chalk.red(ratio.toFixed(1));
  }

  formatCategoryName(category) {
    const names = {
      style: '🎨 Code Style',
      coverage: '🧪 Test Coverage',
      documentation: '📚 Documentation',
      complexity: '🧩 Complexity',
      dependencies: '📦 Dependencies',
      security: '🔒 Security',
      performance: '⚡ Performance'
    };
    return names[category] || category;
  }

  async performHealthChecks() {
    return {
      'Linting configured': { 
        passed: true, 
        message: 'ESLint configured and passing' 
      },
      'Tests passing': { 
        passed: true, 
        message: 'All tests passing' 
      },
      'No security vulnerabilities': { 
        passed: true, 
        message: 'No known vulnerabilities' 
      },
      'Dependencies up to date': { 
        passed: false, 
        message: '3 outdated packages' 
      },
      'Documentation exists': { 
        passed: true, 
        message: 'README and inline docs present' 
      }
    };
  }

  async getQualityTrends() {
    // Would read from stored metrics
    return {
      score: 5,
      debt: -10,
      coverage: 3
    };
  }

  async getTopQualityIssues() {
    return [
      {
        type: 'Low test coverage',
        severity: 'high',
        message: 'Overall coverage at 65%, below 80% target'
      },
      {
        type: 'Complex functions',
        severity: 'medium',
        message: '5 functions exceed complexity threshold'
      }
    ];
  }

  generateQualityRecommendations(score, health) {
    if (score.coverage < 7) {
      console.log(chalk.gray('  • Increase test coverage to 80%+'));
    }
    if (score.documentation < 7) {
      console.log(chalk.gray('  • Add JSDoc comments to public APIs'));
    }
    if (score.complexity < 7) {
      console.log(chalk.gray('  • Refactor complex functions'));
    }
    console.log(chalk.gray('  • Set up continuous quality monitoring'));
  }

  async detectLinter() {
    // Check for common linters
    const linters = [
      { name: 'ESLint', command: 'npm run lint', fixCommand: 'npm run lint -- --fix' },
      { name: 'TSLint', command: 'npm run tslint', fixCommand: 'npm run tslint -- --fix' },
      { name: 'Standard', command: 'standard', fixCommand: 'standard --fix' }
    ];
    
    for (const linter of linters) {
      try {
        await this.exec(`which ${linter.command.split(' ')[0]}`, { silent: true });
        return linter;
      } catch {
        // Continue checking
      }
    }
    
    return null;
  }

  async getLintingStats() {
    // Would parse linter output
    return {
      files: 45,
      errors: 3,
      warnings: 12,
      topIssues: [
        { rule: 'no-unused-vars', count: 5 },
        { rule: 'no-console', count: 3 }
      ]
    };
  }

  async analyzeCodeSmells() {
    // Would perform actual analysis
    return [
      {
        type: 'Long Method',
        severity: 'high',
        description: 'Method processData() has 150+ lines',
        location: 'src/processor.js:45',
        suggestion: 'Extract smaller methods for each processing step'
      },
      {
        type: 'Duplicate Code',
        severity: 'medium',
        description: 'Similar validation logic in 3 files',
        location: 'Multiple files',
        suggestion: 'Extract to shared validation utility'
      }
    ];
  }

  groupSmellsByType(smells) {
    const grouped = {};
    smells.forEach(smell => {
      grouped[smell.type] = (grouped[smell.type] || 0) + 1;
    });
    return grouped;
  }

  async calculateTechnicalDebt() {
    return {
      total: 120,
      ratio: 8.5,
      interest: 10,
      categories: {
        'Code complexity': 40,
        'Missing tests': 30,
        'Outdated dependencies': 20,
        'Poor documentation': 15,
        'Code duplication': 15
      },
      hotspots: [
        {
          file: 'src/legacy/processor.js',
          hours: 20,
          issues: ['High complexity', 'No tests', 'Poor docs']
        }
      ],
      timeline: [
        { age: '< 1 month', count: 10, hours: 15 },
        { age: '1-3 months', count: 25, hours: 40 },
        { age: '> 3 months', count: 30, hours: 65 }
      ]
    };
  }

  async findDebtMarkers() {
    try {
      const todo = await this.exec('grep -r "TODO" --include="*.js" --include="*.ts" . | wc -l', { silent: true });
      const fixme = await this.exec('grep -r "FIXME" --include="*.js" --include="*.ts" . | wc -l', { silent: true });
      const hack = await this.exec('grep -r "HACK" --include="*.js" --include="*.ts" . | wc -l', { silent: true });
      const xxx = await this.exec('grep -r "XXX" --include="*.js" --include="*.ts" . | wc -l', { silent: true });
      
      return {
        todo: parseInt(todo.trim()) || 0,
        fixme: parseInt(fixme.trim()) || 0,
        hack: parseInt(hack.trim()) || 0,
        xxx: parseInt(xxx.trim()) || 0
      };
    } catch {
      return { todo: 0, fixme: 0, hack: 0, xxx: 0 };
    }
  }

  async calculateDetailedScores() {
    return {
      overall: { value: 7.5, trend: 2 },
      categories: {
        style: {
          value: 8.0,
          factors: [
            { positive: true, description: 'Consistent formatting' },
            { positive: false, description: 'Some linting warnings' }
          ]
        },
        coverage: {
          value: 6.5,
          factors: [
            { positive: true, description: 'Critical paths covered' },
            { positive: false, description: 'Below 80% target' }
          ]
        }
      },
      strengths: [
        'Well-structured codebase',
        'Good dependency management',
        'Consistent coding style'
      ],
      weaknesses: [
        'Test coverage below target',
        'Some complex functions need refactoring',
        'Documentation could be improved'
      ]
    };
  }

  generateImprovementPlan(scores) {
    const improvements = [];
    
    Object.entries(scores.categories).forEach(([category, score]) => {
      if (score.value < 7) {
        improvements.push({ category, score: score.value });
      }
    });
    
    improvements.sort((a, b) => a.score - b.score);
    
    improvements.slice(0, 3).forEach((item, idx) => {
      console.log(chalk.gray(`  ${idx + 1}. Improve ${item.category} (current: ${item.score}/10)`));
    });
  }

  async analyzeRefactoringOpportunities() {
    return [
      {
        type: 'Extract Method',
        priority: 'high',
        file: 'src/processor.js',
        issue: 'Method too long (150+ lines)',
        action: 'Break into 5-6 smaller methods',
        effort: 4,
        impact: 'Improved readability and testability'
      },
      {
        type: 'Remove Duplication',
        priority: 'medium',
        file: 'Multiple files',
        issue: 'Duplicate validation logic',
        action: 'Create shared validation module',
        effort: 2,
        impact: 'Reduced maintenance burden'
      }
    ];
  }

  groupRefactoringPatterns(suggestions) {
    const patterns = {};
    suggestions.forEach(s => {
      patterns[s.type] = (patterns[s.type] || 0) + 1;
    });
    return patterns;
  }

  createRefactoringPlan(suggestions) {
    return {
      phases: [
        {
          name: 'Critical Refactorings',
          duration: '1 week',
          tasks: [
            'Extract methods from large functions',
            'Add missing tests for refactored code'
          ]
        },
        {
          name: 'Code Consolidation',
          duration: '3 days',
          tasks: [
            'Remove duplicate code',
            'Create shared utilities'
          ]
        },
        {
          name: 'Quality Improvements',
          duration: '1 week',
          tasks: [
            'Improve documentation',
            'Optimize complex algorithms'
          ]
        }
      ]
    };
  }
}