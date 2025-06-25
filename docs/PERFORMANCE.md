# Performance Monitoring and Optimization Guide

This guide covers the performance monitoring system implemented for Flow State Dev's modular slash command architecture.

## Overview

The performance monitoring system tracks key metrics to ensure the modular command system performs efficiently and identifies optimization opportunities.

## Key Performance Metrics

### 1. Command Discovery
- **Target**: < 100ms for discovering all commands
- **Current**: ~25ms for 67+ commands
- **Metric**: Time to scan and register all command modules

### 2. Command Execution
- **Target**: < 500ms for command execution
- **Current**: Most commands < 50ms
- **Metric**: Time from command invocation to completion

### 3. Memory Usage
- **Target**: < 100MB heap usage
- **Current**: ~60-80MB typical usage
- **Metric**: Process heap usage and peak memory

### 4. Startup Time
- **Target**: < 200ms for full initialization
- **Current**: ~150ms including all modules
- **Metric**: Time to initialize registry and commands

## Performance Monitoring Tools

### CLI Commands

```bash
# Show performance summary
fsd slash "/performance"
fsd slash "/perf"  # Alias

# Generate detailed report
fsd slash "/performance report"

# View historical data
fsd slash "/performance history"

# Check lazy loading stats
fsd slash "/performance lazy"

# Reset session metrics
fsd slash "/performance reset"
```

### Performance Monitor API

```javascript
import { performanceMonitor } from './lib/performance/monitor.js';

// Track custom operations
performanceMonitor.trackCommandExecution('my-operation', duration);

// Get current summary
const summary = performanceMonitor.getSummary();

// Generate report
const report = await performanceMonitor.generateReport({ save: true });
```

## Optimization Strategies

### 1. Lazy Loading

Commands are loaded on-demand to reduce startup time and memory usage:

```javascript
// Commands are only loaded when first used
const command = await lazyCommandRegistry.get('/build');
```

Benefits:
- Reduced startup time (only metadata loaded initially)
- Lower memory usage (unexecuted commands not in memory)
- Faster initial response time

### 2. Performance Utilities

```javascript
import { measureAsync, lazyLoad, LRUCache } from './lib/performance/utils.js';

// Measure async operations
const result = await measureAsync('operation-name', async () => {
  return await someAsyncOperation();
});

// Create lazy-loaded resources
const getResource = lazyLoad(async () => {
  return await loadExpensiveResource();
});

// Use LRU cache for frequently accessed data
const cache = new LRUCache(100);
cache.set('key', value);
```

### 3. Batch Processing

For operations on multiple items:

```javascript
import { BatchProcessor } from './lib/performance/utils.js';

const processor = new BatchProcessor(async (items) => {
  // Process items in batch
}, { batchSize: 10, delay: 100 });

// Add items for processing
processor.add(item);
```

## Performance Benchmarks

Run performance benchmarks:

```bash
# Run benchmark suite
npm run test:performance

# Run with watch mode
npm run test:performance:watch

# Run full benchmark with report
node test/performance/run-benchmarks.js
```

### Benchmark Metrics

The benchmark suite tests:
- Command discovery performance
- Individual command execution times
- Memory usage patterns
- Concurrent execution handling
- Registry lookup performance
- Suggestion generation speed

## Performance Best Practices

### 1. Command Development

```javascript
export class MyCommand extends BaseSlashCommand {
  async execute(args) {
    // Use performance tracking for expensive operations
    await measureAsync('my-command:expensive-op', async () => {
      await this.expensiveOperation();
    });
    
    // Check memory usage for large operations
    checkMemoryUsage(100); // Warn if > 100MB
  }
}
```

### 2. Module Loading

```javascript
// Prefer lazy imports for heavy dependencies
const getHeavyDep = lazyLoad(async () => {
  const { HeavyDep } = await import('heavy-dependency');
  return new HeavyDep();
});
```

### 3. Caching Strategies

```javascript
class MyCommand extends BaseSlashCommand {
  constructor() {
    super({ /* ... */ });
    this.cache = new LRUCache(50);
  }
  
  async getData(key) {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached) return cached;
    
    // Load and cache
    const data = await this.loadData(key);
    this.cache.set(key, data);
    return data;
  }
}
```

## Threshold Configuration

Performance thresholds can be configured:

```javascript
performanceMonitor.thresholds = {
  commandDiscovery: 100,  // ms
  commandExecution: 500,  // ms
  registryInit: 200,      // ms
  memoryUsage: 100 * 1024 * 1024  // 100MB
};
```

## Performance Reports

Reports are saved to `~/.fsd/performance/` and include:
- Session metrics
- Command execution statistics
- Memory usage patterns
- Threshold violations
- Historical comparisons

### Report Format

```json
{
  "timestamp": 1234567890,
  "version": "1.0.0",
  "environment": {
    "node": "v18.0.0",
    "platform": "linux",
    "cpus": 8
  },
  "summary": {
    "commandDiscovery": { /* ... */ },
    "commandExecution": { /* ... */ },
    "memoryUsage": { /* ... */ },
    "thresholdViolations": []
  }
}
```

## Troubleshooting Performance Issues

### High Command Discovery Time

1. Check for synchronous file operations in command constructors
2. Verify no heavy imports at module level
3. Use lazy loading for command dependencies

### High Command Execution Time

1. Profile the command with Node.js profiler
2. Check for unnecessary API calls
3. Implement caching for repeated operations
4. Use batch processing for multiple items

### High Memory Usage

1. Check for memory leaks in command state
2. Clear caches periodically
3. Use streams for large data processing
4. Implement proper cleanup in command lifecycle

### Example Optimization

Before:
```javascript
// Heavy import at module level
import { expensiveDep } from 'expensive-package';

export class SlowCommand extends BaseSlashCommand {
  async execute() {
    // Synchronous heavy operation
    const data = this.processLargeDataSync();
    return data;
  }
}
```

After:
```javascript
// Lazy import
const getExpensiveDep = lazyLoad(async () => {
  const { expensiveDep } = await import('expensive-package');
  return expensiveDep;
});

export class FastCommand extends BaseSlashCommand {
  constructor() {
    super({ /* ... */ });
    this.cache = new LRUCache(20);
  }
  
  async execute() {
    // Async with caching
    return await measureAsync('process-data', async () => {
      const cached = this.cache.get('data');
      if (cached) return cached;
      
      const dep = await getExpensiveDep();
      const data = await this.processLargeDataAsync(dep);
      this.cache.set('data', data);
      return data;
    });
  }
}
```

## Continuous Monitoring

1. Run benchmarks regularly: `npm run test:performance`
2. Monitor production metrics with `/performance` command
3. Review performance reports weekly
4. Set up alerts for threshold violations
5. Track performance trends over time

## Performance Goals

- **No regression**: Modular system should match or exceed monolithic performance
- **Scalability**: Support 100+ commands without degradation
- **Responsiveness**: User-perceived latency < 100ms
- **Efficiency**: Memory usage < 100MB for typical sessions
- **Reliability**: No performance degradation over long sessions