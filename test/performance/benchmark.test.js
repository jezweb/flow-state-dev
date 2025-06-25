/**
 * Performance Benchmark Tests for Modular Slash Commands
 * 
 * Tests performance characteristics and ensures no regression from monolithic version
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import { SlashCommandRegistry } from '../../lib/commands/registry.js';
import { performanceMonitor } from '../../lib/performance/monitor.js';
import { performance } from 'perf_hooks';
import chalk from 'chalk';

describe('Performance Benchmarks', () => {
  let executor;
  let registry;
  
  beforeAll(async () => {
    executor = new SlashCommandExecutor();
    registry = new SlashCommandRegistry();
  });
  
  afterAll(async () => {
    // Generate performance report
    const report = await performanceMonitor.generateReport();
    console.log(chalk.bold('\n📊 Performance Benchmark Report\n'));
    performanceMonitor.printSummary();
  });
  
  describe('Command Discovery Performance', () => {
    it('should discover all commands in under 100ms', async () => {
      const start = performance.now();
      await registry.discover();
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100);
      console.log(`  Command discovery: ${duration.toFixed(2)}ms`);
    });
    
    it('should load 60+ commands efficiently', async () => {
      await registry.discover();
      expect(registry.commands.size).toBeGreaterThan(60);
      
      const avgLoadTime = performanceMonitor.getSummary().commandDiscovery?.avg || 0;
      expect(avgLoadTime).toBeLessThan(2); // Less than 2ms per command
    });
  });
  
  describe('Command Execution Performance', () => {
    beforeAll(async () => {
      await executor.initialize();
    });
    
    it('should execute help command in under 50ms', async () => {
      const start = performance.now();
      await executor.execute('/help');
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50);
      console.log(`  Help command: ${duration.toFixed(2)}ms`);
    });
    
    it('should execute complex commands efficiently', async () => {
      const commands = [
        '/status',
        '/test --help',
        '/build --help',
        '/plan "Test planning"'
      ];
      
      for (const cmd of commands) {
        const start = performance.now();
        await executor.execute(cmd);
        const duration = performance.now() - start;
        
        expect(duration).toBeLessThan(200);
        console.log(`  ${cmd}: ${duration.toFixed(2)}ms`);
      }
    });
  });
  
  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage', async () => {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const before = process.memoryUsage();
      
      // Execute many commands
      for (let i = 0; i < 100; i++) {
        await executor.execute('/help');
      }
      
      const after = process.memoryUsage();
      const increase = (after.heapUsed - before.heapUsed) / 1024 / 1024;
      
      expect(increase).toBeLessThan(50); // Less than 50MB increase
      console.log(`  Memory increase: ${increase.toFixed(2)}MB`);
    });
  });
  
  describe('Concurrent Performance', () => {
    it('should handle concurrent command executions', async () => {
      const concurrentCount = 10;
      const start = performance.now();
      
      const promises = [];
      for (let i = 0; i < concurrentCount; i++) {
        promises.push(executor.execute('/help'));
      }
      
      await Promise.all(promises);
      const duration = performance.now() - start;
      
      const avgTime = duration / concurrentCount;
      expect(avgTime).toBeLessThan(100);
      console.log(`  Concurrent execution (${concurrentCount} commands): ${duration.toFixed(2)}ms total, ${avgTime.toFixed(2)}ms avg`);
    });
  });
  
  describe('Command Registry Performance', () => {
    it('should find commands quickly', async () => {
      const commands = ['/help', '/build', '/test', '/plan', '/investigate'];
      
      for (const cmd of commands) {
        const start = performance.now();
        const found = registry.get(cmd);
        const duration = performance.now() - start;
        
        expect(found).toBeTruthy();
        expect(duration).toBeLessThan(1);
      }
    });
    
    it('should generate suggestions efficiently', async () => {
      const partials = ['hel', 'bui', 'tes', 'pla'];
      
      for (const partial of partials) {
        const start = performance.now();
        const suggestions = registry.getSuggestions(partial);
        const duration = performance.now() - start;
        
        expect(suggestions.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(10);
      }
    });
  });
  
  describe('Performance Thresholds', () => {
    it('should track threshold violations', async () => {
      const summary = performanceMonitor.getSummary();
      const violations = summary.thresholdViolations || [];
      
      // Log any violations for investigation
      if (violations.length > 0) {
        console.log(chalk.yellow('\n  Threshold violations:'));
        violations.forEach(v => {
          console.log(chalk.yellow(`    ${v.type}: ${v.actual.toFixed(2)}ms (threshold: ${v.threshold}ms)`));
        });
      }
      
      // We expect some violations during testing, but not too many
      expect(violations.length).toBeLessThan(10);
    });
  });
  
  describe('Performance Comparison', () => {
    it('should perform comparably to monolithic version', async () => {
      // Baseline metrics from monolithic version
      const baseline = {
        commandDiscovery: 25, // ms
        helpCommand: 30, // ms
        memoryUsage: 80 // MB
      };
      
      const summary = performanceMonitor.getSummary();
      
      // Command discovery should be within 2x of baseline
      if (summary.commandDiscovery) {
        expect(summary.commandDiscovery.avg).toBeLessThan(baseline.commandDiscovery * 2);
      }
      
      // Help command should be within 2x of baseline
      const helpStats = summary.commandExecution['/help'];
      if (helpStats) {
        expect(helpStats.avg).toBeLessThan(baseline.helpCommand * 2);
      }
      
      // Memory usage should be reasonable
      if (summary.memoryUsage) {
        const currentMB = summary.memoryUsage.current.heapUsed / 1024 / 1024;
        expect(currentMB).toBeLessThan(baseline.memoryUsage * 1.5);
      }
    });
  });
});