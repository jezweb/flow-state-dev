/**
 * Module Cache Manager
 * 
 * Provides caching and performance optimization for module loading and operations
 */
import { createHash } from 'crypto';
import { homedir } from 'os';
import { join } from 'path';
import fs from 'fs-extra';

export class ModuleCacheManager {
  constructor(options = {}) {
    this.memoryCache = new Map();
    this.cacheDir = options.cacheDir || join(homedir(), '.fsd', 'cache');
    this.maxMemorySize = options.maxMemorySize || 50 * 1024 * 1024; // 50MB
    this.ttl = options.ttl || 3600000; // 1 hour default TTL
    this.currentMemorySize = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  /**
   * Initialize cache directory
   */
  async initialize() {
    await fs.ensureDir(this.cacheDir);
    await fs.ensureDir(join(this.cacheDir, 'modules'));
    await fs.ensureDir(join(this.cacheDir, 'search'));
    await fs.ensureDir(join(this.cacheDir, 'metadata'));
  }

  /**
   * Generate cache key
   */
  generateKey(...parts) {
    const content = parts.join(':');
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Get from cache
   */
  async get(key, options = {}) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key);
      
      if (!this.isExpired(entry)) {
        this.stats.hits++;
        entry.lastAccessed = Date.now();
        return entry.data;
      } else {
        // Expired - remove from cache
        this.memoryCache.delete(key);
        this.currentMemorySize -= entry.size;
      }
    }

    // Check disk cache if not in memory
    if (options.diskCache !== false) {
      const diskData = await this.getFromDisk(key);
      if (diskData) {
        // Add to memory cache
        await this.set(key, diskData, { diskOnly: true });
        this.stats.hits++;
        return diskData;
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set in cache
   */
  async set(key, data, options = {}) {
    const ttl = options.ttl || this.ttl;
    const size = this.calculateSize(data);
    
    const entry = {
      data,
      size,
      created: Date.now(),
      expires: Date.now() + ttl,
      lastAccessed: Date.now()
    };

    // Memory cache
    if (!options.diskOnly) {
      // Check if we need to evict entries
      if (this.currentMemorySize + size > this.maxMemorySize) {
        await this.evictLRU(size);
      }

      this.memoryCache.set(key, entry);
      this.currentMemorySize += size;
    }

    // Disk cache
    if (options.diskCache !== false) {
      await this.saveToDisk(key, data, options);
    }
  }

  /**
   * Delete from cache
   */
  async delete(key) {
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key);
      this.currentMemorySize -= entry.size;
      this.memoryCache.delete(key);
    }

    await this.deleteFromDisk(key);
  }

  /**
   * Clear entire cache
   */
  async clear() {
    this.memoryCache.clear();
    this.currentMemorySize = 0;
    this.stats = { hits: 0, misses: 0, evictions: 0 };
    
    // Clear disk cache
    await fs.emptyDir(this.cacheDir);
    await this.initialize();
  }

  /**
   * Check if entry is expired
   */
  isExpired(entry) {
    return Date.now() > entry.expires;
  }

  /**
   * Calculate data size
   */
  calculateSize(data) {
    try {
      return Buffer.byteLength(JSON.stringify(data));
    } catch {
      return 1024; // Default 1KB for non-serializable data
    }
  }

  /**
   * Evict least recently used entries
   */
  async evictLRU(requiredSpace) {
    const entries = Array.from(this.memoryCache.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedSpace = 0;
    
    for (const entry of entries) {
      this.memoryCache.delete(entry.key);
      this.currentMemorySize -= entry.size;
      freedSpace += entry.size;
      this.stats.evictions++;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }
  }

  /**
   * Get from disk cache
   */
  async getFromDisk(key) {
    try {
      const filePath = this.getDiskPath(key);
      
      if (await fs.pathExists(filePath)) {
        const content = await fs.readJSON(filePath);
        
        if (!this.isExpired(content)) {
          return content.data;
        } else {
          // Clean up expired file
          await fs.remove(filePath);
        }
      }
    } catch (error) {
      // Ignore disk cache errors
    }
    
    return null;
  }

  /**
   * Save to disk cache
   */
  async saveToDisk(key, data, options = {}) {
    try {
      const filePath = this.getDiskPath(key);
      const ttl = options.ttl || this.ttl;
      
      const content = {
        data,
        created: Date.now(),
        expires: Date.now() + ttl
      };
      
      await fs.outputJSON(filePath, content, { spaces: 2 });
    } catch (error) {
      // Ignore disk cache errors
      console.warn('Failed to save to disk cache:', error.message);
    }
  }

  /**
   * Delete from disk cache
   */
  async deleteFromDisk(key) {
    try {
      const filePath = this.getDiskPath(key);
      await fs.remove(filePath);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get disk cache path for key
   */
  getDiskPath(key) {
    const prefix = key.substring(0, 2);
    return join(this.cacheDir, 'modules', prefix, `${key}.json`);
  }

  /**
   * Cache module metadata
   */
  async cacheModuleMetadata(moduleId, metadata) {
    const key = this.generateKey('module', moduleId, 'metadata');
    await this.set(key, metadata, {
      ttl: 86400000, // 24 hours for metadata
      diskCache: true
    });
  }

  /**
   * Get cached module metadata
   */
  async getCachedModuleMetadata(moduleId) {
    const key = this.generateKey('module', moduleId, 'metadata');
    return this.get(key);
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(query, options, results) {
    const key = this.generateKey('search', query, JSON.stringify(options));
    await this.set(key, results, {
      ttl: 1800000, // 30 minutes for search results
      diskCache: true
    });
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(query, options) {
    const key = this.generateKey('search', query, JSON.stringify(options));
    return this.get(key);
  }

  /**
   * Warm up cache
   */
  async warmUp(modules) {
    console.log('Warming up module cache...');
    
    for (const module of modules) {
      const key = this.generateKey('module', module.name, 'full');
      await this.set(key, module, {
        ttl: 86400000, // 24 hours
        diskCache: true
      });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
      : 0;
    
    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      memoryUsed: `${(this.currentMemorySize / 1024 / 1024).toFixed(2)}MB`,
      memoryLimit: `${(this.maxMemorySize / 1024 / 1024).toFixed(2)}MB`,
      entriesInMemory: this.memoryCache.size
    };
  }

  /**
   * Clean up expired entries
   */
  async cleanup() {
    // Clean memory cache
    let removed = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        this.currentMemorySize -= entry.size;
        removed++;
      }
    }

    // Clean disk cache
    const moduleFiles = await glob('**/*.json', { cwd: join(this.cacheDir, 'modules') });
    
    for (const file of moduleFiles) {
      try {
        const filePath = join(this.cacheDir, 'modules', file);
        const content = await fs.readJSON(filePath);
        
        if (this.isExpired(content)) {
          await fs.remove(filePath);
          removed++;
        }
      } catch {
        // Ignore errors
      }
    }

    return removed;
  }

  /**
   * Export cache state
   */
  async exportState() {
    const state = {
      stats: this.getStats(),
      memoryEntries: Array.from(this.memoryCache.keys()),
      diskUsage: await this.getDiskUsage()
    };
    
    return state;
  }

  /**
   * Get disk cache usage
   */
  async getDiskUsage() {
    try {
      const stats = await fs.stat(this.cacheDir);
      // This is a simplified calculation
      return {
        size: stats.size,
        files: await this.countDiskFiles()
      };
    } catch {
      return { size: 0, files: 0 };
    }
  }

  /**
   * Count disk cache files
   */
  async countDiskFiles() {
    try {
      const files = await glob('**/*.json', { cwd: this.cacheDir });
      return files.length;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const cacheManager = new ModuleCacheManager();