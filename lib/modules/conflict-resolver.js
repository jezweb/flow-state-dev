/**
 * Conflict Resolution for Template Generation
 * 
 * Handles conflicts when multiple modules provide the same file
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import Table from 'cli-table3';

export class ConflictResolver {
  constructor() {
    this.resolutionCache = new Map();
    this.strategies = {
      priority: this.resolvePriority.bind(this),
      interactive: this.resolveInteractive.bind(this),
      merge: this.resolveMerge.bind(this),
      report: this.resolveReport.bind(this)
    };
  }

  /**
   * Resolve a file conflict
   */
  async resolve(filePath, templates, options = {}) {
    const {
      strategy = 'priority',
      interactive = false,
      cache = true
    } = options;

    // Check cache
    if (cache && this.resolutionCache.has(filePath)) {
      return this.resolutionCache.get(filePath);
    }

    // Apply resolution strategy
    const resolver = this.strategies[strategy] || this.strategies.priority;
    const result = await resolver(filePath, templates, options);

    // Cache result
    if (cache) {
      this.resolutionCache.set(filePath, result);
    }

    return result;
  }

  /**
   * Priority-based resolution (default)
   */
  async resolvePriority(filePath, templates) {
    // Sort by priority descending
    const sorted = [...templates].sort((a, b) => b.priority - a.priority);
    const winner = sorted[0];

    return {
      template: winner,
      conflict: templates.length > 1,
      resolution: templates.length > 1 
        ? `Used ${winner.module} version (priority: ${winner.priority})`
        : 'No conflict',
      alternatives: sorted.slice(1).map(t => ({
        module: t.module,
        priority: t.priority
      }))
    };
  }

  /**
   * Interactive resolution
   */
  async resolveInteractive(filePath, templates) {
    if (templates.length === 1) {
      return this.resolvePriority(filePath, templates);
    }

    console.log(chalk.yellow(`\n⚠️  Conflict detected in: ${filePath}`));
    
    // Show conflict details
    const table = new Table({
      head: ['Module', 'Priority', 'Size', 'Description'],
      colWidths: [20, 10, 10, 40]
    });

    for (const template of templates) {
      table.push([
        template.module,
        template.priority,
        `${template.content.length}b`,
        template.description || 'No description'
      ]);
    }

    console.log(table.toString());

    // Ask user to choose
    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'Which version would you like to use?',
      choices: [
        ...templates.map(t => ({
          name: `${t.module} (priority: ${t.priority})`,
          value: t
        })),
        new inquirer.Separator(),
        {
          name: 'Merge files if possible',
          value: 'merge'
        },
        {
          name: 'View differences',
          value: 'diff'
        },
        {
          name: 'Skip this file',
          value: 'skip'
        }
      ]
    }]);

    if (choice === 'merge') {
      return this.resolveMerge(filePath, templates);
    } else if (choice === 'diff') {
      await this.showDifferences(templates);
      return this.resolveInteractive(filePath, templates);
    } else if (choice === 'skip') {
      return {
        template: null,
        conflict: true,
        resolution: 'User chose to skip file'
      };
    } else {
      return {
        template: choice,
        conflict: true,
        resolution: `User selected ${choice.module} version`
      };
    }
  }

  /**
   * Attempt to merge conflicting files
   */
  async resolveMerge(filePath, templates) {
    // Check if files can be merged
    const strategies = templates.map(t => t.mergeStrategy);
    const canMerge = strategies.every(s => 
      s.strategy === 'merge' || s.strategy === 'append'
    );

    if (!canMerge) {
      console.log(chalk.red('Files cannot be merged - using priority resolution'));
      return this.resolvePriority(filePath, templates);
    }

    return {
      template: templates, // Return all templates for merging
      conflict: false,
      merge: true,
      resolution: 'Files will be merged'
    };
  }

  /**
   * Report-only resolution
   */
  async resolveReport(filePath, templates) {
    const priority = await this.resolvePriority(filePath, templates);
    
    return {
      ...priority,
      reportOnly: true
    };
  }

  /**
   * Show differences between templates
   */
  async showDifferences(templates) {
    console.log(chalk.cyan('\n📄 Template Differences:\n'));

    for (let i = 0; i < templates.length - 1; i++) {
      const t1 = templates[i];
      const t2 = templates[i + 1];
      
      console.log(chalk.bold(`${t1.module} vs ${t2.module}:`));
      
      // Simple line-by-line diff
      const lines1 = t1.content.split('\n');
      const lines2 = t2.content.split('\n');
      const maxLines = Math.max(lines1.length, lines2.length);
      
      for (let j = 0; j < Math.min(maxLines, 20); j++) {
        const line1 = lines1[j] || '';
        const line2 = lines2[j] || '';
        
        if (line1 !== line2) {
          console.log(chalk.red(`- ${line1}`));
          console.log(chalk.green(`+ ${line2}`));
        }
      }
      
      if (maxLines > 20) {
        console.log(chalk.gray(`... and ${maxLines - 20} more lines`));
      }
      
      console.log('');
    }
  }

  /**
   * Generate conflict report
   */
  generateReport(conflicts) {
    const report = {
      summary: {
        total: conflicts.length,
        resolved: conflicts.filter(c => c.resolution).length,
        skipped: conflicts.filter(c => c.resolution === 'skipped').length
      },
      conflicts: conflicts.map(c => ({
        file: c.file,
        modules: c.modules,
        resolution: c.resolution,
        alternatives: c.alternatives
      }))
    };

    return report;
  }

  /**
   * Print conflict report
   */
  printReport(conflicts) {
    if (conflicts.length === 0) {
      console.log(chalk.green('✅ No conflicts detected'));
      return;
    }

    console.log(chalk.yellow(`\n⚠️  ${conflicts.length} conflicts detected:\n`));

    const table = new Table({
      head: ['File', 'Modules', 'Resolution'],
      colWidths: [30, 30, 40],
      wordWrap: true
    });

    for (const conflict of conflicts) {
      table.push([
        conflict.file,
        conflict.modules.join(', '),
        conflict.resolution
      ]);
    }

    console.log(table.toString());
  }

  /**
   * Clear resolution cache
   */
  clearCache() {
    this.resolutionCache.clear();
  }
}