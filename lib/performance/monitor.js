/**
 * Performance Monitoring System for Flow State Dev
 * 
 * Tracks and reports performance metrics for the modular slash command system
 */
import { performance } from 'perf_hooks';
import { writeFile, ensureDir, readJson, pathExists } from 'fs-extra';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      commandDiscovery: [],
      commandExecution: new Map(), // command -> [executions]
      registryInit: [],
      memoryUsage: [],
      startupTime: null
    };
    
    this.thresholds = {
      commandDiscovery: 100, // ms
      commandExecution: 500, // ms
      registryInit: 200, // ms
      memoryUsage: 100 * 1024 * 1024 // 100MB
    };
    
    this.dataDir = join(homedir(), '.fsd', 'performance');
    this.sessionStartTime = Date.now();
  }

  /**
   * Track command discovery performance
   */
  trackCommandDiscovery(duration, commandCount) {
    const metric = {
      timestamp: Date.now(),
      duration,
      commandCount,
      avgPerCommand: duration / commandCount
    };
    
    this.metrics.commandDiscovery.push(metric);
    
    if (duration > this.thresholds.commandDiscovery) {
      console.warn(chalk.yellow(`⚠️  Command discovery took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.commandDiscovery}ms)`));
    }
  }

  /**
   * Track individual command execution
   */
  trackCommandExecution(commandName, duration, metadata = {}) {
    if (!this.metrics.commandExecution.has(commandName)) {
      this.metrics.commandExecution.set(commandName, []);
    }
    
    const executions = this.metrics.commandExecution.get(commandName);
    executions.push({
      timestamp: Date.now(),
      duration,
      metadata
    });
    
    if (duration > this.thresholds.commandExecution) {
      console.warn(chalk.yellow(`⚠️  Command '${commandName}' took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.commandExecution}ms)`));
    }
  }

  /**
   * Track registry initialization
   */
  trackRegistryInit(duration, moduleCount) {
    const metric = {
      timestamp: Date.now(),
      duration,
      moduleCount,
      avgPerModule: duration / moduleCount
    };
    
    this.metrics.registryInit.push(metric);
    
    if (duration > this.thresholds.registryInit) {
      console.warn(chalk.yellow(`⚠️  Registry init took ${duration.toFixed(2)}ms (threshold: ${this.thresholds.registryInit}ms)`));
    }
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage() {
    const usage = process.memoryUsage();
    const metric = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      rss: usage.rss,
      external: usage.external
    };
    
    this.metrics.memoryUsage.push(metric);
    
    if (usage.heapUsed > this.thresholds.memoryUsage) {
      console.warn(chalk.yellow(`⚠️  High memory usage: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`));
    }
  }

  /**
   * Record startup time
   */
  recordStartupTime(duration) {
    this.metrics.startupTime = duration;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary = {
      session: {
        startTime: this.sessionStartTime,
        duration: Date.now() - this.sessionStartTime,
        startupTime: this.metrics.startupTime
      },
      commandDiscovery: this.summarizeMetrics(this.metrics.commandDiscovery),
      registryInit: this.summarizeMetrics(this.metrics.registryInit),
      commandExecution: this.summarizeCommandExecution(),
      memoryUsage: this.summarizeMemoryUsage(),
      thresholdViolations: this.getThresholdViolations()
    };
    
    return summary;
  }

  /**
   * Summarize metrics array
   */
  summarizeMetrics(metrics) {
    if (metrics.length === 0) return null;
    
    const durations = metrics.map(m => m.duration);
    const sorted = [...durations].sort((a, b) => a - b);
    
    return {
      count: metrics.length,
      total: durations.reduce((a, b) => a + b, 0),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * Summarize command execution metrics
   */
  summarizeCommandExecution() {
    const summary = {};
    
    for (const [command, executions] of this.metrics.commandExecution) {
      const durations = executions.map(e => e.duration);
      summary[command] = this.summarizeMetrics(executions);
    }
    
    return summary;
  }

  /**
   * Summarize memory usage
   */
  summarizeMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return null;
    
    const heapUsages = this.metrics.memoryUsage.map(m => m.heapUsed);
    
    return {
      samples: this.metrics.memoryUsage.length,
      current: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1],
      peak: Math.max(...heapUsages),
      avg: heapUsages.reduce((a, b) => a + b, 0) / heapUsages.length
    };
  }

  /**
   * Get threshold violations
   */
  getThresholdViolations() {
    const violations = [];
    
    // Check command discovery
    for (const metric of this.metrics.commandDiscovery) {
      if (metric.duration > this.thresholds.commandDiscovery) {
        violations.push({
          type: 'commandDiscovery',
          threshold: this.thresholds.commandDiscovery,
          actual: metric.duration,
          timestamp: metric.timestamp
        });
      }
    }
    
    // Check command executions
    for (const [command, executions] of this.metrics.commandExecution) {
      for (const exec of executions) {
        if (exec.duration > this.thresholds.commandExecution) {
          violations.push({
            type: 'commandExecution',
            command,
            threshold: this.thresholds.commandExecution,
            actual: exec.duration,
            timestamp: exec.timestamp
          });
        }
      }
    }
    
    return violations;
  }

  /**
   * Generate performance report
   */
  async generateReport(options = {}) {
    const summary = this.getSummary();
    const report = {
      timestamp: Date.now(),
      version: '1.0.0',
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: require('os').cpus().length
      },
      summary,
      rawMetrics: options.includeRaw ? this.metrics : undefined
    };
    
    if (options.save) {
      await this.saveReport(report);
    }
    
    return report;
  }

  /**
   * Save report to disk
   */
  async saveReport(report) {
    await ensureDir(this.dataDir);
    
    const filename = `perf-report-${new Date().toISOString().replace(/:/g, '-')}.json`;
    const filepath = join(this.dataDir, filename);
    
    await writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`✅ Performance report saved to: ${filepath}`));
    
    return filepath;
  }

  /**
   * Load historical reports
   */
  async loadHistoricalReports(limit = 10) {
    if (!await pathExists(this.dataDir)) {
      return [];
    }
    
    const { readdir } = await import('fs-extra');
    const files = await readdir(this.dataDir);
    const reportFiles = files
      .filter(f => f.startsWith('perf-report-'))
      .sort()
      .reverse()
      .slice(0, limit);
    
    const reports = [];
    for (const file of reportFiles) {
      const report = await readJson(join(this.dataDir, file));
      reports.push(report);
    }
    
    return reports;
  }

  /**
   * Compare with historical performance
   */
  async compareWithHistory() {
    const current = this.getSummary();
    const historical = await this.loadHistoricalReports(5);
    
    if (historical.length === 0) {
      return null;
    }
    
    const comparison = {
      current,
      historical: historical.map(r => r.summary),
      trends: this.calculateTrends(current, historical.map(r => r.summary))
    };
    
    return comparison;
  }

  /**
   * Calculate performance trends
   */
  calculateTrends(current, historical) {
    const trends = {};
    
    // Command discovery trend
    if (current.commandDiscovery && historical.some(h => h.commandDiscovery)) {
      const historicalAvg = historical
        .filter(h => h.commandDiscovery)
        .map(h => h.commandDiscovery.avg)
        .reduce((a, b) => a + b, 0) / historical.length;
      
      trends.commandDiscovery = {
        current: current.commandDiscovery.avg,
        historical: historicalAvg,
        change: ((current.commandDiscovery.avg - historicalAvg) / historicalAvg) * 100
      };
    }
    
    return trends;
  }

  /**
   * Print performance summary to console
   */
  printSummary() {
    const summary = this.getSummary();
    
    console.log(chalk.bold('\n📊 Performance Summary\n'));
    
    // Session info
    console.log(chalk.gray('Session:'));
    console.log(`  Duration: ${(summary.session.duration / 1000).toFixed(2)}s`);
    if (summary.session.startupTime) {
      console.log(`  Startup Time: ${summary.session.startupTime.toFixed(2)}ms`);
    }
    
    // Command discovery
    if (summary.commandDiscovery) {
      console.log(chalk.gray('\nCommand Discovery:'));
      console.log(`  Count: ${summary.commandDiscovery.count}`);
      console.log(`  Average: ${summary.commandDiscovery.avg.toFixed(2)}ms`);
      console.log(`  P95: ${summary.commandDiscovery.p95.toFixed(2)}ms`);
    }
    
    // Command execution
    if (Object.keys(summary.commandExecution).length > 0) {
      console.log(chalk.gray('\nCommand Execution:'));
      for (const [cmd, stats] of Object.entries(summary.commandExecution)) {
        console.log(`  ${cmd}: ${stats.avg.toFixed(2)}ms avg (${stats.count} runs)`);
      }
    }
    
    // Memory usage
    if (summary.memoryUsage) {
      console.log(chalk.gray('\nMemory Usage:'));
      console.log(`  Current: ${(summary.memoryUsage.current.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Peak: ${(summary.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Violations
    if (summary.thresholdViolations.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Threshold Violations: ${summary.thresholdViolations.length}`));
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();