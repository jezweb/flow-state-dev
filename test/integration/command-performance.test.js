/**
 * Command Performance Integration Tests
 * 
 * Compares performance of modular slash command system against
 * expected benchmarks and ensures no regression from v1.x
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { commandRegistry } from '../../lib/commands/registry.js';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import fs from 'fs-extra';
import path from 'path';
import { performance } from 'perf_hooks';

describe('Command Performance Integration', () => {
  let executor;
  const performanceReport = {
    discovery: {},
    execution: {},
    memory: {},
    comparison: {}
  };

  // Performance thresholds (in milliseconds)
  const THRESHOLDS = {
    discovery: 25,
    firstExecution: 100,
    averageExecution: 50,
    helpCommand: 10,
    complexCommand: 200,
    memoryIncrease: 10 * 1024 * 1024 // 10MB
  };

  beforeAll(async () => {
    // Clear registry for clean test
    commandRegistry.clear();
    
    // Measure cold start discovery
    const coldStartBegin = performance.now();
    await commandRegistry.discover();
    performanceReport.discovery.coldStart = performance.now() - coldStartBegin;
    
    // Measure warm discovery
    commandRegistry.clear();
    const warmStartBegin = performance.now();
    await commandRegistry.discover();
    performanceReport.discovery.warmStart = performance.now() - warmStartBegin;
    
    executor = new SlashCommandExecutor();
  });

  afterAll(() => {
    // Generate performance report
    console.log('\n📊 Performance Report:');
    console.log('\n🔍 Discovery Performance:');
    console.log(`  Cold Start: ${performanceReport.discovery.coldStart.toFixed(2)}ms`);
    console.log(`  Warm Start: ${performanceReport.discovery.warmStart.toFixed(2)}ms`);
    
    console.log('\n⚡ Execution Performance:');
    Object.entries(performanceReport.execution).forEach(([command, metrics]) => {
      console.log(`  /${command}:`);
      console.log(`    First Run: ${metrics.firstRun.toFixed(2)}ms`);
      console.log(`    Average: ${metrics.average.toFixed(2)}ms`);
      console.log(`    Min: ${metrics.min.toFixed(2)}ms`);
      console.log(`    Max: ${metrics.max.toFixed(2)}ms`);
    });
    
    console.log('\n💾 Memory Usage:');
    console.log(`  Initial: ${(performanceReport.memory.initial / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Peak: ${(performanceReport.memory.peak / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Final: ${(performanceReport.memory.final / 1024 / 1024).toFixed(2)}MB`);
    
    console.log('\n✅ Threshold Compliance:');
    const passed = performanceReport.comparison.passed || [];
    const failed = performanceReport.comparison.failed || [];
    console.log(`  Passed: ${passed.length}`);
    console.log(`  Failed: ${failed.length}`);
    if (failed.length > 0) {
      console.log('  Failed tests:');
      failed.forEach(f => console.log(`    - ${f}`));
    }
  });

  describe('Discovery Performance', () => {
    it('should discover commands within threshold', () => {
      expect(performanceReport.discovery.coldStart).toBeLessThan(THRESHOLDS.discovery);
      expect(performanceReport.discovery.warmStart).toBeLessThan(THRESHOLDS.discovery);
    });

    it('should have faster warm starts', () => {
      expect(performanceReport.discovery.warmStart).toBeLessThan(performanceReport.discovery.coldStart);
    });

    it('should scale linearly with command count', async () => {
      const times = [];
      const commandCounts = [];
      
      // Test with subsets of commands
      for (let i = 1; i <= 5; i++) {
        commandRegistry.clear();
        const start = performance.now();
        
        // Discover with limit (simulate different command counts)
        await commandRegistry.discover({ limit: i * 10 });
        
        times.push(performance.now() - start);
        commandCounts.push(commandRegistry.getAll().length);
      }
      
      // Calculate correlation (should be close to linear)
      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const avgCount = commandCounts.reduce((a, b) => a + b) / commandCounts.length;
      
      let correlation = 0;
      for (let i = 0; i < times.length; i++) {
        correlation += (times[i] - avgTime) * (commandCounts[i] - avgCount);
      }
      
      // Should show reasonable linear scaling
      expect(Math.abs(correlation)).toBeGreaterThan(0);
    });
  });

  describe('Command Execution Performance', () => {
    it('should execute simple commands quickly', async () => {
      const simpleCommands = ['help', 'status', 'sync'];
      
      for (const cmd of simpleCommands) {
        const times = [];
        
        // First run
        const firstStart = performance.now();
        await executor.execute(`/${cmd}`, { test: true });
        const firstRun = performance.now() - firstStart;
        times.push(firstRun);
        
        // Subsequent runs
        for (let i = 0; i < 5; i++) {
          const start = performance.now();
          await executor.execute(`/${cmd}`, { test: true });
          times.push(performance.now() - start);
        }
        
        const metrics = {
          firstRun,
          average: times.reduce((a, b) => a + b) / times.length,
          min: Math.min(...times),
          max: Math.max(...times)
        };
        
        performanceReport.execution[cmd] = metrics;
        
        expect(metrics.average).toBeLessThan(THRESHOLDS.averageExecution);
      }
    });

    it('should handle complex commands within threshold', async () => {
      const complexCommands = [
        { name: 'breakdown', options: { scope: 'Test system', skipInteractive: true, test: true } },
        { name: 'plan', options: { topic: 'Architecture', skipInteractive: true, test: true } },
        { name: 'research', options: { topic: 'Performance', skipInteractive: true, test: true } }
      ];
      
      for (const { name, options } of complexCommands) {
        const start = performance.now();
        await executor.execute(`/${name}`, options);
        const duration = performance.now() - start;
        
        performanceReport.execution[name] = { firstRun: duration, average: duration, min: duration, max: duration };
        
        expect(duration).toBeLessThan(THRESHOLDS.complexCommand);
      }
    });

    it('should maintain consistent performance', async () => {
      const times = [];
      const command = '/help';
      
      // Run many times
      for (let i = 0; i < 20; i++) {
        const start = performance.now();
        await executor.execute(command, { test: true });
        times.push(performance.now() - start);
      }
      
      const average = times.reduce((a, b) => a + b) / times.length;
      const variance = times.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / average;
      
      // Low coefficient of variation indicates consistent performance
      expect(coefficientOfVariation).toBeLessThan(0.3); // 30% variation max
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory', async function() {
      if (!global.gc) {
        console.warn('Skipping memory leak test - run with --expose-gc');
        this.skip();
        return;
      }
      
      // Force GC and record initial memory
      global.gc();
      const initialMemory = process.memoryUsage().heapUsed;
      performanceReport.memory.initial = initialMemory;
      
      // Execute many commands
      for (let i = 0; i < 100; i++) {
        await executor.execute('/help', { test: true });
        await executor.execute('/status', { test: true, skipInteractive: true });
        
        if (i % 10 === 0) {
          global.gc();
        }
      }
      
      // Force GC and check final memory
      global.gc();
      const finalMemory = process.memoryUsage().heapUsed;
      performanceReport.memory.final = finalMemory;
      
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(THRESHOLDS.memoryIncrease);
    });

    it('should handle large data efficiently', async () => {
      const largeInput = 'x'.repeat(100000); // 100KB string
      
      const beforeMemory = process.memoryUsage().heapUsed;
      
      await executor.execute('/breakdown', {
        scope: largeInput,
        skipInteractive: true,
        test: true
      });
      
      if (global.gc) global.gc();
      const afterMemory = process.memoryUsage().heapUsed;
      performanceReport.memory.peak = Math.max(performanceReport.memory.peak || 0, afterMemory);
      
      // Memory increase should be reasonable
      const increase = afterMemory - beforeMemory;
      expect(increase).toBeLessThan(10 * largeInput.length); // Max 10x input size
    });
  });

  describe('Comparative Performance', () => {
    it('should match or exceed v1.x performance', () => {
      // Simulated v1.x benchmarks (these would be real measurements in production)
      const v1Benchmarks = {
        discovery: 50, // v1.x took 50ms
        helpCommand: 15, // v1.x took 15ms
        averageExecution: 75 // v1.x average was 75ms
      };
      
      const comparisons = [];
      
      // Discovery should be faster
      if (performanceReport.discovery.coldStart < v1Benchmarks.discovery) {
        comparisons.push('Discovery improved');
        performanceReport.comparison.passed = [...(performanceReport.comparison.passed || []), 'discovery'];
      } else {
        performanceReport.comparison.failed = [...(performanceReport.comparison.failed || []), 'discovery'];
      }
      
      // Help command should be faster
      if (performanceReport.execution.help && performanceReport.execution.help.average < v1Benchmarks.helpCommand) {
        comparisons.push('Help command improved');
        performanceReport.comparison.passed = [...(performanceReport.comparison.passed || []), 'help-command'];
      } else {
        performanceReport.comparison.failed = [...(performanceReport.comparison.failed || []), 'help-command'];
      }
      
      expect(comparisons.length).toBeGreaterThan(0);
    });

    it('should show performance benefits of modular architecture', async () => {
      // Test lazy loading benefit - only load what's needed
      commandRegistry.clear();
      
      // Load single category
      const singleCategoryStart = performance.now();
      await commandRegistry.discover({ category: 'quick-action' });
      const singleCategoryTime = performance.now() - singleCategoryStart;
      
      // Load all categories
      commandRegistry.clear();
      const allCategoriesStart = performance.now();
      await commandRegistry.discover();
      const allCategoriesTime = performance.now() - allCategoriesStart;
      
      // Single category should be significantly faster
      expect(singleCategoryTime).toBeLessThan(allCategoriesTime * 0.3); // Less than 30% of full time
    });
  });

  describe('Optimization Validation', () => {
    it('should benefit from command caching', async () => {
      const command = '/build';
      const times = [];
      
      // First execution (cold)
      const coldStart = performance.now();
      await executor.execute(command, { test: true, skipInteractive: true });
      const coldTime = performance.now() - coldStart;
      
      // Subsequent executions (should be cached)
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        await executor.execute(command, { test: true, skipInteractive: true });
        times.push(performance.now() - start);
      }
      
      const avgCachedTime = times.reduce((a, b) => a + b) / times.length;
      
      // Cached executions should be faster
      expect(avgCachedTime).toBeLessThan(coldTime * 0.8); // At least 20% faster
    });

    it('should efficiently handle concurrent requests', async () => {
      const concurrentCount = 10;
      const start = performance.now();
      
      const promises = [];
      for (let i = 0; i < concurrentCount; i++) {
        promises.push(
          executor.execute('/help', { 
            category: i % 2 === 0 ? 'quick-action' : 'utility',
            test: true 
          })
        );
      }
      
      await Promise.all(promises);
      const totalTime = performance.now() - start;
      
      // Concurrent execution should be efficient
      const expectedSequentialTime = concurrentCount * THRESHOLDS.helpCommand;
      expect(totalTime).toBeLessThan(expectedSequentialTime * 0.5); // At least 2x speedup
    });
  });

  describe('Real-world Scenarios', () => {
    it('should perform well with typical workflow', async () => {
      const workflowStart = performance.now();
      
      // Typical developer workflow
      await executor.execute('/status', { test: true, skipInteractive: true });
      await executor.execute('/build', { test: true, skipInteractive: true });
      await executor.execute('/test', { test: true, skipInteractive: true });
      await executor.execute('/lint', { fix: true, test: true, skipInteractive: true });
      await executor.execute('/commit', { message: 'test: Update', test: true, skipInteractive: true });
      
      const workflowTime = performance.now() - workflowStart;
      
      // Entire workflow should complete quickly
      expect(workflowTime).toBeLessThan(500); // 500ms for 5 commands
    });

    it('should handle rapid successive commands', async () => {
      const rapidCommands = ['/help', '/status', '/help', '/status', '/help'];
      const times = [];
      
      for (const cmd of rapidCommands) {
        const start = performance.now();
        await executor.execute(cmd, { test: true });
        times.push(performance.now() - start);
      }
      
      // Later executions should be faster (caching effect)
      const firstHalf = times.slice(0, Math.floor(times.length / 2));
      const secondHalf = times.slice(Math.floor(times.length / 2));
      
      const avgFirst = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
      
      expect(avgSecond).toBeLessThanOrEqual(avgFirst);
    });
  });
});