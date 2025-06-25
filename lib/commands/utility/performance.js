/**
 * Performance monitoring slash command
 * Provides insights into command system performance
 */
import { BaseSlashCommand } from '../base.js';
import { performanceMonitor } from '../../performance/monitor.js';
import { lazyCommandRegistry } from '../lazy-registry.js';
import chalk from 'chalk';
import Table from 'cli-table3';

export class PerformanceCommand extends BaseSlashCommand {
  constructor() {
    super({
      name: '/performance',
      description: 'Monitor and analyze command system performance',
      category: 'utility',
      aliases: ['/perf', '/p']
    });
  }

  async execute(args = {}) {
    const subcommand = args.args?.[0] || 'summary';
    
    switch (subcommand) {
      case 'summary':
        await this.showSummary();
        break;
      case 'report':
        await this.generateReport(args);
        break;
      case 'history':
        await this.showHistory();
        break;
      case 'lazy':
        await this.showLazyLoadingStats();
        break;
      case 'reset':
        await this.resetMetrics();
        break;
      default:
        await this.showHelp();
    }
  }

  async showSummary() {
    console.log(chalk.bold('\n📊 Performance Summary\n'));
    
    const summary = performanceMonitor.getSummary();
    
    // Session info
    console.log(chalk.gray('Session Information:'));
    console.log(`  Duration: ${(summary.session.duration / 1000).toFixed(2)}s`);
    if (summary.session.startupTime) {
      console.log(`  Startup Time: ${summary.session.startupTime.toFixed(2)}ms`);
    }
    
    // Command discovery
    if (summary.commandDiscovery) {
      console.log(chalk.gray('\nCommand Discovery:'));
      console.log(`  Total Runs: ${summary.commandDiscovery.count}`);
      console.log(`  Average Time: ${summary.commandDiscovery.avg.toFixed(2)}ms`);
      console.log(`  Min/Max: ${summary.commandDiscovery.min.toFixed(2)}ms / ${summary.commandDiscovery.max.toFixed(2)}ms`);
      console.log(`  P95: ${summary.commandDiscovery.p95.toFixed(2)}ms`);
    }
    
    // Command execution
    if (Object.keys(summary.commandExecution).length > 0) {
      console.log(chalk.gray('\nTop Command Execution Times:'));
      
      const table = new Table({
        head: ['Command', 'Runs', 'Avg (ms)', 'P95 (ms)', 'Max (ms)'],
        colWidths: [25, 10, 12, 12, 12]
      });
      
      // Sort by average time descending
      const sorted = Object.entries(summary.commandExecution)
        .sort((a, b) => b[1].avg - a[1].avg)
        .slice(0, 10);
      
      for (const [cmd, stats] of sorted) {
        table.push([
          cmd,
          stats.count,
          stats.avg.toFixed(2),
          stats.p95.toFixed(2),
          stats.max.toFixed(2)
        ]);
      }
      
      console.log(table.toString());
    }
    
    // Memory usage
    if (summary.memoryUsage) {
      console.log(chalk.gray('\nMemory Usage:'));
      console.log(`  Current: ${(summary.memoryUsage.current.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Peak: ${(summary.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Average: ${(summary.memoryUsage.avg / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Threshold violations
    if (summary.thresholdViolations.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Performance Warnings: ${summary.thresholdViolations.length} threshold violations`));
      
      const recentViolations = summary.thresholdViolations.slice(-5);
      for (const violation of recentViolations) {
        const time = new Date(violation.timestamp).toLocaleTimeString();
        console.log(chalk.yellow(`  ${time}: ${violation.type} - ${violation.actual.toFixed(2)}ms (threshold: ${violation.threshold}ms)`));
      }
    } else {
      console.log(chalk.green('\n✅ All performance metrics within thresholds'));
    }
  }

  async generateReport(args) {
    console.log(chalk.gray('Generating performance report...'));
    
    const options = {
      save: !args.nosave,
      includeRaw: args.raw || false
    };
    
    const report = await performanceMonitor.generateReport(options);
    
    if (args.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(chalk.green('\n✅ Performance report generated'));
      
      if (options.save) {
        console.log(chalk.gray('Report saved to ~/.fsd/performance/'));
      }
    }
    
    // Compare with history
    const comparison = await performanceMonitor.compareWithHistory();
    if (comparison && comparison.trends) {
      console.log(chalk.bold('\n📈 Performance Trends:'));
      
      for (const [metric, trend] of Object.entries(comparison.trends)) {
        const changeStr = trend.change > 0 ? `+${trend.change.toFixed(1)}%` : `${trend.change.toFixed(1)}%`;
        const color = trend.change > 10 ? chalk.red : trend.change > 0 ? chalk.yellow : chalk.green;
        
        console.log(`  ${metric}: ${trend.current.toFixed(2)}ms (${color(changeStr)} from historical average)`);
      }
    }
  }

  async showHistory() {
    console.log(chalk.bold('\n📈 Performance History\n'));
    
    const reports = await performanceMonitor.loadHistoricalReports(10);
    
    if (reports.length === 0) {
      console.log(chalk.gray('No historical reports found.'));
      return;
    }
    
    const table = new Table({
      head: ['Date', 'Commands', 'Avg Discovery', 'Avg Execution', 'Memory Peak'],
      colWidths: [20, 12, 15, 15, 15]
    });
    
    for (const report of reports) {
      const date = new Date(report.timestamp).toLocaleString();
      const summary = report.summary;
      
      const commandCount = summary.commandDiscovery?.count || 0;
      const avgDiscovery = summary.commandDiscovery?.avg?.toFixed(2) || 'N/A';
      
      // Calculate average execution across all commands
      let totalExec = 0;
      let execCount = 0;
      for (const stats of Object.values(summary.commandExecution || {})) {
        totalExec += stats.avg * stats.count;
        execCount += stats.count;
      }
      const avgExecution = execCount > 0 ? (totalExec / execCount).toFixed(2) : 'N/A';
      
      const memoryPeak = summary.memoryUsage?.peak 
        ? `${(summary.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`
        : 'N/A';
      
      table.push([date, commandCount, avgDiscovery + 'ms', avgExecution + 'ms', memoryPeak]);
    }
    
    console.log(table.toString());
  }

  async showLazyLoadingStats() {
    console.log(chalk.bold('\n⚡ Lazy Loading Statistics\n'));
    
    const stats = lazyCommandRegistry.getStats();
    
    console.log(chalk.gray('Command Loading:'));
    console.log(`  Total Commands: ${stats.total}`);
    console.log(`  Loaded: ${stats.loaded} (${stats.loadedPercentage}%)`);
    console.log(`  Lazy (not loaded): ${stats.lazy}`);
    
    // Show which commands are loaded
    const categories = lazyCommandRegistry.exportData();
    
    console.log(chalk.gray('\nLoaded Commands by Category:'));
    for (const [category, commands] of Object.entries(categories)) {
      const loaded = commands.filter(c => c.loaded).length;
      const total = commands.length;
      console.log(`  ${category}: ${loaded}/${total} loaded`);
    }
    
    // Memory savings estimate
    const estimatedSavings = stats.lazy * 0.5; // Estimate 0.5MB per unloaded command
    console.log(chalk.gray(`\nEstimated Memory Savings: ~${estimatedSavings.toFixed(1)}MB`));
  }

  async resetMetrics() {
    console.log(chalk.yellow('⚠️  This will reset all performance metrics for this session.'));
    
    // Reset the metrics
    performanceMonitor.metrics = {
      commandDiscovery: [],
      commandExecution: new Map(),
      registryInit: [],
      memoryUsage: [],
      startupTime: null
    };
    
    console.log(chalk.green('✅ Performance metrics reset'));
  }

  async showHelp() {
    console.log(chalk.bold('\n📊 Performance Command Usage\n'));
    
    console.log('Available subcommands:');
    console.log('  /performance summary    - Show current performance summary (default)');
    console.log('  /performance report     - Generate detailed performance report');
    console.log('  /performance history    - Show historical performance data');
    console.log('  /performance lazy       - Show lazy loading statistics');
    console.log('  /performance reset      - Reset current session metrics');
    
    console.log(chalk.gray('\nOptions:'));
    console.log('  --json                  - Output in JSON format');
    console.log('  --raw                   - Include raw metrics in report');
    console.log('  --nosave                - Don\'t save report to disk');
    
    console.log(chalk.gray('\nExamples:'));
    console.log('  /performance');
    console.log('  /performance report --json');
    console.log('  /perf lazy');
  }
}