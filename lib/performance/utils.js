/**
 * Performance Utility Functions
 * 
 * Helper functions for performance monitoring and optimization
 */
import { performance } from 'perf_hooks';
import { performanceMonitor } from './monitor.js';

/**
 * Measure async function execution time
 */
export async function measureAsync(name, fn, metadata = {}) {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    performanceMonitor.trackCommandExecution(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.trackCommandExecution(name, duration, { ...metadata, error: true });
    throw error;
  }
}

/**
 * Measure sync function execution time
 */
export function measureSync(name, fn, metadata = {}) {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    performanceMonitor.trackCommandExecution(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.trackCommandExecution(name, duration, { ...metadata, error: true });
    throw error;
  }
}

/**
 * Create a performance-tracked wrapper for async functions
 */
export function trackPerformance(name, options = {}) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      return measureAsync(
        options.customName || `${name}.${propertyKey}`,
        () => originalMethod.apply(this, args),
        options.metadata || {}
      );
    };
    
    return descriptor;
  };
}

/**
 * Lazy loading wrapper for modules
 */
export function lazyLoad(loader) {
  let cache = null;
  let loading = false;
  let loadError = null;
  
  return async function() {
    if (loadError) {
      throw loadError;
    }
    
    if (cache !== null) {
      return cache;
    }
    
    if (loading) {
      // Wait for ongoing load
      while (loading) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return cache;
    }
    
    loading = true;
    try {
      const start = performance.now();
      cache = await loader();
      const duration = performance.now() - start;
      
      if (duration > 50) {
        console.log(`Lazy load took ${duration.toFixed(2)}ms`);
      }
      
      return cache;
    } catch (error) {
      loadError = error;
      throw error;
    } finally {
      loading = false;
    }
  };
}

/**
 * Memory usage checker
 */
export function checkMemoryUsage(threshold = 100) {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  
  performanceMonitor.trackMemoryUsage();
  
  if (heapUsedMB > threshold) {
    console.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB (threshold: ${threshold}MB)`);
  }
  
  return usage;
}

/**
 * Batch operations for better performance
 */
export class BatchProcessor {
  constructor(processor, options = {}) {
    this.processor = processor;
    this.batchSize = options.batchSize || 10;
    this.delay = options.delay || 100;
    this.queue = [];
    this.processing = false;
  }
  
  add(item) {
    this.queue.push(item);
    if (!this.processing) {
      this.process();
    }
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      const start = performance.now();
      
      try {
        await this.processor(batch);
        const duration = performance.now() - start;
        
        if (duration > 1000) {
          console.warn(`Batch processing took ${duration.toFixed(2)}ms for ${batch.length} items`);
        }
      } catch (error) {
        console.error('Batch processing error:', error);
      }
      
      if (this.queue.length > 0 && this.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }
    
    this.processing = false;
  }
}

/**
 * Simple LRU cache for performance
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to end (most recently used)
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
    
    return this.cache.get(key);
  }
  
  set(key, value) {
    // Remove if exists
    if (this.cache.has(key)) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    }
    
    // Add to end
    this.cache.set(key, value);
    this.accessOrder.push(key);
    
    // Evict if necessary
    if (this.cache.size > this.maxSize) {
      const lru = this.accessOrder.shift();
      this.cache.delete(lru);
    }
  }
  
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  get size() {
    return this.cache.size;
  }
}