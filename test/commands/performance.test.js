/**
 * Performance Tests for Slash Commands System
 * Measures performance targets for command discovery and execution
 */
import { jest } from '@jest/globals';
import { performance } from 'perf_hooks';
import { SlashCommandExecutor } from '../../lib/commands/executor.js';
import { commandRegistry } from '../../lib/commands/registry.js';

describe('Slash Commands Performance', () => {
  let executor;
  const performanceResults = {};

  beforeAll(() => {
    executor = new SlashCommandExecutor();
  });

  afterAll(() => {
    console.log('\n📊 Performance Benchmark Results:');
    Object.entries(performanceResults).forEach(([metric, value]) => {
      const target = getPerformanceTarget(metric);
      const status = value <= target ? '✅' : '❌';
      console.log(`  ${status} ${metric}: ${value.toFixed(2)}ms (target: ${target}ms)`);
    });
  });

  describe('Command Discovery Performance', () => {
    it('should discover all commands within 50ms', async () => {
      const start = performance.now();
      await commandRegistry.discover();
      const duration = performance.now() - start;
      
      performanceResults['Command Discovery'] = duration;
      expect(duration).toBeLessThan(50);
    });

    it('should cache discovery results for fast subsequent calls', async () => {
      // First call (already cached from previous test)
      const start = performance.now();
      await commandRegistry.discover();
      const duration = performance.now() - start;
      
      performanceResults['Cached Discovery'] = duration;
      expect(duration).toBeLessThan(5); // Should be nearly instant when cached
    });
  });

  describe('Command Registry Performance', () => {
    beforeAll(async () => {
      await commandRegistry.discover();
    });

    it('should retrieve commands within 1ms', () => {
      const commands = ['/help', '/status', '/build', '/test', '/commit'];
      let totalDuration = 0;
      
      for (const commandName of commands) {
        const start = performance.now();
        const command = commandRegistry.get(commandName);
        const duration = performance.now() - start;
        
        totalDuration += duration;
        expect(duration).toBeLessThan(1);
      }
      
      performanceResults['Command Retrieval'] = totalDuration / commands.length;
    });

    it('should generate suggestions within 5ms', () => {
      const testCases = [
        '/hel',     // Should suggest /help
        '/stat',    // Should suggest /status
        '/buil',    // Should suggest /build
        '/tes',     // Should suggest /test
        '/commi'    // Should suggest /commit
      ];

      let totalDuration = 0;
      for (const partial of testCases) {
        const start = performance.now();
        const suggestions = commandRegistry.getSuggestions(partial);
        const duration = performance.now() - start;
        
        totalDuration += duration;
        expect(suggestions.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(5);
      }
      
      performanceResults['Suggestion Generation'] = totalDuration / testCases.length;
    });
  });

  describe('Command Parsing Performance', () => {
    it('should parse commands within 1ms', () => {
      const testCommands = [
        '/help',
        '/status --porcelain',
        '/build --watch --env production',
        '/commit "Complex message with spaces" --no-verify --author "Test User"',
        '/test --coverage --watch --verbose --reporter spec'
      ];

      let totalDuration = 0;
      for (const command of testCommands) {
        const start = performance.now();
        const parsed = executor.parseCommand(command);
        const duration = performance.now() - start;
        
        totalDuration += duration;
        expect(parsed).toBeDefined();
        expect(duration).toBeLessThan(1);
      }
      
      performanceResults['Command Parsing'] = totalDuration / testCommands.length;
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory overhead', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Load commands and perform operations
      await commandRegistry.discover();
      
      // Parse multiple commands
      for (let i = 0; i < 100; i++) {
        executor.parseCommand('/test --flag value');
        commandRegistry.get('/help');
        commandRegistry.getSuggestions('/te');
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const overhead = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB
      
      performanceResults['Memory Overhead'] = overhead;
      expect(overhead).toBeLessThan(10); // Less than 10MB overhead
    });
  });

  describe('Scalability', () => {
    beforeAll(async () => {
      await commandRegistry.discover();
    });

    it('should handle rapid command lookups', () => {
      const commands = commandRegistry.getAll();
      const commandNames = commands.map(cmd => cmd.name);
      
      const start = performance.now();
      
      // Perform 1000 rapid lookups
      for (let i = 0; i < 1000; i++) {
        const randomCommand = commandNames[i % commandNames.length];
        commandRegistry.get(randomCommand);
      }
      
      const duration = performance.now() - start;
      performanceResults['1000 Lookups'] = duration;
      
      expect(duration).toBeLessThan(50); // 1000 lookups in under 50ms
    });

    it('should scale well with command count', () => {
      const allCommands = commandRegistry.getAll();
      expect(allCommands.length).toBeGreaterThan(20); // Should have loaded many commands
      
      // Test that lookup time doesn't degrade significantly with more commands
      const lookupTimes = [];
      
      for (const command of allCommands.slice(0, 10)) {
        const start = performance.now();
        commandRegistry.get(command.name);
        const duration = performance.now() - start;
        lookupTimes.push(duration);
      }
      
      const avgLookupTime = lookupTimes.reduce((a, b) => a + b, 0) / lookupTimes.length;
      performanceResults['Average Lookup'] = avgLookupTime;
      
      expect(avgLookupTime).toBeLessThan(0.1); // Average lookup under 0.1ms
    });
  });

  describe('System Resource Usage', () => {
    it('should not create excessive handles', async () => {
      const initialHandles = process._getActiveHandles ? process._getActiveHandles().length : 0;
      
      // Perform operations that might create handles
      await commandRegistry.discover();
      for (let i = 0; i < 10; i++) {
        executor.parseCommand('/test');
        commandRegistry.getSuggestions('/help');
      }
      
      const finalHandles = process._getActiveHandles ? process._getActiveHandles().length : 0;
      const handleIncrease = finalHandles - initialHandles;
      
      expect(handleIncrease).toBeLessThan(5); // Should not create many handles
    });
  });
});

/**
 * Get performance target for a given metric
 */
function getPerformanceTarget(metric) {
  const targets = {
    'Command Discovery': 50,
    'Cached Discovery': 5,
    'Command Retrieval': 1,
    'Suggestion Generation': 5,
    'Command Parsing': 1,
    'Memory Overhead': 10,
    '1000 Lookups': 50,
    'Average Lookup': 0.1
  };
  
  return targets[metric] || 100;
}