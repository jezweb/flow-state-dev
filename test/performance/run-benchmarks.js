#!/usr/bin/env node
/**
 * Performance Benchmark Runner
 * 
 * Runs performance benchmarks and generates a report
 */
import { execSync } from 'child_process';
import chalk from 'chalk';
import { performanceMonitor } from '../../lib/performance/monitor.js';

console.log(chalk.bold.cyan('\n🚀 Running Performance Benchmarks\n'));

try {
  // Run the benchmark tests
  execSync('npm run test:performance', { stdio: 'inherit' });
  
  // Generate and save performance report
  console.log(chalk.bold('\n📊 Generating Performance Report...\n'));
  
  const report = await performanceMonitor.generateReport({ 
    save: true,
    includeRaw: true 
  });
  
  // Compare with historical data
  const comparison = await performanceMonitor.compareWithHistory();
  
  if (comparison && comparison.trends) {
    console.log(chalk.bold('\n📈 Performance Trends:\n'));
    
    for (const [metric, trend] of Object.entries(comparison.trends)) {
      const changeStr = trend.change > 0 ? `+${trend.change.toFixed(1)}%` : `${trend.change.toFixed(1)}%`;
      const color = trend.change > 10 ? chalk.red : trend.change > 0 ? chalk.yellow : chalk.green;
      
      console.log(`${metric}: ${trend.current.toFixed(2)}ms (${color(changeStr)} from average)`);
    }
  }
  
  console.log(chalk.green('\n✅ Performance benchmarks completed!\n'));
  
} catch (error) {
  console.error(chalk.red('\n❌ Benchmark failed:'), error.message);
  process.exit(1);
}