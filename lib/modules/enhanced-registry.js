/**
 * Enhanced Module Registry for Flow State Dev
 * 
 * Central registry system for discovering, loading, and managing all stack modules
 * with support for versioning, dynamic loading, and multiple sources.
 */
import { readdir, readFile, pathExists } from 'fs-extra';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { glob } from 'glob';
import semver from 'semver';
import { BaseStackModule } from './types/base-stack-module.js';
import { validateModule } from './validation.js';
import { performance } from 'perf_hooks';

export class EnhancedModuleRegistry {
  constructor() {
    this.modules = new Map(); // id -> version -> module
    this.index = null;
    this.sources = [];
    this.cache = new Map();
    this.loadTimes = new Map();
    this.searchIndex = null;
  }

  /**
   * Initialize the registry
   */
  async initialize() {
    const startTime = performance.now();
    
    // Define module sources in priority order
    this.sources = [
      { path: './fsd-modules', type: 'project', priority: 1 },
      { path: join(homedir(), '.fsd/modules'), type: 'user', priority: 2 },
      { path: './node_modules/@fsd', type: 'installed', priority: 3 },
      { path: './lib/modules/implementations', type: 'builtin', priority: 4 },
      { path: './modules', type: 'legacy', priority: 5 }
    ];

    // Discover and load modules
    await this.discoverModules();
    
    // Build search index
    await this.buildSearchIndex();
    
    const loadTime = performance.now() - startTime;
    console.log(`Module registry initialized in ${loadTime.toFixed(2)}ms`);
  }

  /**
   * Discover modules from all sources
   */
  async discoverModules() {
    const discoveredModules = [];
    
    for (const source of this.sources) {
      const sourcePath = resolve(source.path);
      
      if (await pathExists(sourcePath)) {
        const modules = await this.discoverFromSource(sourcePath, source);
        discoveredModules.push(...modules);
      }
    }

    // Process discovered modules
    for (const moduleInfo of discoveredModules) {
      await this.registerModule(moduleInfo);
    }

    // Build module index
    await this.buildIndex();
  }

  /**
   * Discover modules from a specific source
   */
  async discoverFromSource(sourcePath, sourceInfo) {
    const modules = [];
    
    try {
      if (sourceInfo.type === 'builtin' || sourceInfo.type === 'installed') {
        // Implementation modules (JavaScript files)
        const files = await glob('**/*.js', { 
          cwd: sourcePath, 
          ignore: ['**/*.test.js', '**/*.spec.js', 'index.js'] 
        });
        
        for (const file of files) {
          const modulePath = join(sourcePath, file);
          const moduleInfo = await this.loadImplementationModule(modulePath, sourceInfo);
          if (moduleInfo) {
            modules.push(moduleInfo);
          }
        }
      } else {
        // Directory-based modules with module.json
        const dirs = await readdir(sourcePath);
        
        for (const dir of dirs) {
          const modulePath = join(sourcePath, dir);
          const moduleJsonPath = join(modulePath, 'module.json');
          
          if (await pathExists(moduleJsonPath)) {
            const moduleInfo = await this.loadDirectoryModule(modulePath, sourceInfo);
            if (moduleInfo) {
              modules.push(moduleInfo);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Error discovering modules from ${sourcePath}:`, error.message);
    }
    
    return modules;
  }

  /**
   * Load an implementation module (JavaScript class)
   */
  async loadImplementationModule(modulePath, sourceInfo) {
    try {
      const startTime = performance.now();
      const { default: ModuleClass } = await import(modulePath);
      
      if (!ModuleClass || typeof ModuleClass !== 'function') {
        return null;
      }
      
      const module = new ModuleClass();
      
      // Validate it's a proper module
      if (!(module instanceof BaseStackModule)) {
        return null;
      }
      
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(module.name, loadTime);
      
      return {
        module,
        source: sourceInfo,
        path: modulePath,
        type: 'implementation'
      };
    } catch (error) {
      console.warn(`Failed to load module from ${modulePath}:`, error.message);
      return null;
    }
  }

  /**
   * Load a directory-based module
   */
  async loadDirectoryModule(modulePath, sourceInfo) {
    try {
      const moduleJsonPath = join(modulePath, 'module.json');
      const config = JSON.parse(await readFile(moduleJsonPath, 'utf-8'));
      
      // Create a dynamic module class
      const DynamicModule = class extends BaseStackModule {
        constructor() {
          super(config.id || config.name, config.displayName || config.name, {
            ...config,
            templatePath: modulePath
          });
        }
      };
      
      const module = new DynamicModule();
      
      return {
        module,
        source: sourceInfo,
        path: modulePath,
        type: 'directory'
      };
    } catch (error) {
      console.warn(`Failed to load module from ${modulePath}:`, error.message);
      return null;
    }
  }

  /**
   * Register a module in the registry
   */
  async registerModule(moduleInfo) {
    const { module, source } = moduleInfo;
    const moduleId = module.name;
    const version = module.version || '1.0.0';
    
    // Validate module
    const validation = await validateModule(module);
    if (!validation.valid) {
      console.warn(`Module ${moduleId} validation failed:`, validation.errors);
      return;
    }
    
    // Initialize module map if needed
    if (!this.modules.has(moduleId)) {
      this.modules.set(moduleId, new Map());
    }
    
    const versionMap = this.modules.get(moduleId);
    
    // Check if this version already exists with higher priority
    if (versionMap.has(version)) {
      const existing = versionMap.get(version);
      if (existing.source.priority <= source.priority) {
        return; // Keep existing higher priority module
      }
    }
    
    // Store module with metadata
    versionMap.set(version, {
      module,
      source,
      path: moduleInfo.path,
      type: moduleInfo.type,
      loadTime: this.loadTimes.get(moduleId) || 0
    });
  }

  /**
   * Build module index for fast lookups
   */
  async buildIndex() {
    const index = {
      modules: {},
      byType: {},
      byCategory: {},
      byTag: {},
      updated: new Date().toISOString()
    };
    
    for (const [moduleId, versions] of this.modules) {
      const latestVersion = this.getLatestVersion(moduleId);
      const moduleInfo = versions.get(latestVersion);
      const module = moduleInfo.module;
      
      // Add to main index
      index.modules[moduleId] = {
        latest: latestVersion,
        versions: Object.fromEntries(versions),
        type: module.moduleType,
        category: module.category,
        tags: module.tags || []
      };
      
      // Index by type
      if (!index.byType[module.moduleType]) {
        index.byType[module.moduleType] = [];
      }
      index.byType[module.moduleType].push(moduleId);
      
      // Index by category
      if (!index.byCategory[module.category]) {
        index.byCategory[module.category] = [];
      }
      index.byCategory[module.category].push(moduleId);
      
      // Index by tags
      if (module.tags) {
        for (const tag of module.tags) {
          if (!index.byTag[tag]) {
            index.byTag[tag] = [];
          }
          index.byTag[tag].push(moduleId);
        }
      }
    }
    
    this.index = index;
  }

  /**
   * Build search index for fast searching
   */
  async buildSearchIndex() {
    const searchIndex = [];
    
    for (const [moduleId, versions] of this.modules) {
      const latestVersion = this.getLatestVersion(moduleId);
      const moduleInfo = versions.get(latestVersion);
      const module = moduleInfo.module;
      
      searchIndex.push({
        id: moduleId,
        name: module.name,
        displayName: module.displayName,
        description: module.description,
        type: module.moduleType,
        category: module.category,
        tags: module.tags || [],
        keywords: [
          moduleId,
          module.name,
          module.displayName,
          module.moduleType,
          module.category,
          ...(module.tags || [])
        ].filter(Boolean).map(k => k.toLowerCase())
      });
    }
    
    this.searchIndex = searchIndex;
  }

  /**
   * Get a module by ID and optional version
   */
  getModule(id, version) {
    if (!this.modules.has(id)) {
      return null;
    }
    
    const versions = this.modules.get(id);
    
    if (version) {
      // Exact version match
      if (versions.has(version)) {
        return versions.get(version).module;
      }
      
      // Semver range matching
      const resolvedVersion = this.resolveVersion(id, version);
      if (resolvedVersion && versions.has(resolvedVersion)) {
        return versions.get(resolvedVersion).module;
      }
    } else {
      // Get latest version
      const latestVersion = this.getLatestVersion(id);
      return versions.get(latestVersion)?.module;
    }
    
    return null;
  }

  /**
   * Get latest version of a module
   */
  getLatestVersion(id) {
    const versions = this.modules.get(id);
    if (!versions) return null;
    
    const versionList = Array.from(versions.keys());
    return versionList.sort(semver.rcompare)[0];
  }

  /**
   * Resolve version constraint to specific version
   */
  resolveVersion(id, constraint) {
    const versions = this.modules.get(id);
    if (!versions) return null;
    
    const versionList = Array.from(versions.keys());
    const matching = versionList.filter(v => semver.satisfies(v, constraint));
    
    if (matching.length === 0) return null;
    return matching.sort(semver.rcompare)[0];
  }

  /**
   * Get compatible versions of a module with another module
   */
  getCompatibleVersions(id, withModule) {
    const versions = this.modules.get(id);
    if (!versions) return [];
    
    const otherModule = this.getModule(withModule);
    if (!otherModule) return [];
    
    const compatible = [];
    
    for (const [version, info] of versions) {
      const module = info.module;
      
      // Check compatibility
      if (module.isCompatibleWith(otherModule)) {
        compatible.push(version);
      }
    }
    
    return compatible.sort(semver.rcompare);
  }

  /**
   * Get modules by type
   */
  getModulesByType(type) {
    if (!this.index) return [];
    
    const moduleIds = this.index.byType[type] || [];
    return moduleIds.map(id => this.getModule(id)).filter(Boolean);
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category) {
    if (!this.index) return [];
    
    const moduleIds = this.index.byCategory[category] || [];
    return moduleIds.map(id => this.getModule(id)).filter(Boolean);
  }

  /**
   * Get compatible modules for a given type and context
   */
  getCompatibleModules(type, context) {
    const modules = this.getModulesByType(type);
    const compatible = [];
    
    for (const module of modules) {
      let isCompatible = true;
      
      // Check compatibility with existing modules in context
      if (context.modules) {
        for (const existingModuleId of context.modules) {
          const existingModule = this.getModule(existingModuleId);
          if (existingModule && !module.isCompatibleWith(existingModule)) {
            isCompatible = false;
            break;
          }
        }
      }
      
      if (isCompatible) {
        compatible.push(module);
      }
    }
    
    return compatible;
  }

  /**
   * Search modules
   */
  searchModules(query, options = {}) {
    if (!this.searchIndex) return [];
    
    const searchTerm = query.toLowerCase();
    const results = [];
    
    for (const entry of this.searchIndex) {
      let score = 0;
      
      // Exact ID match
      if (entry.id === searchTerm) score += 100;
      
      // Name match
      if (entry.name.toLowerCase().includes(searchTerm)) score += 50;
      if (entry.displayName.toLowerCase().includes(searchTerm)) score += 40;
      
      // Description match
      if (entry.description.toLowerCase().includes(searchTerm)) score += 20;
      
      // Tag match
      if (entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))) score += 30;
      
      // Keyword match
      if (entry.keywords.some(kw => kw.includes(searchTerm))) score += 10;
      
      // Type/category filter
      if (options.type && entry.type !== options.type) continue;
      if (options.category && entry.category !== options.category) continue;
      
      if (score > 0) {
        results.push({
          module: this.getModule(entry.id),
          score,
          match: entry
        });
      }
    }
    
    // Sort by relevance score
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.module);
  }

  /**
   * Validate a module structure
   */
  async validateModule(module) {
    return validateModule(module);
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const stats = {
      totalModules: this.modules.size,
      totalVersions: 0,
      byType: {},
      byCategory: {},
      loadTimes: {},
      sources: {}
    };
    
    for (const [moduleId, versions] of this.modules) {
      stats.totalVersions += versions.size;
      
      for (const [version, info] of versions) {
        const module = info.module;
        
        // Count by type
        stats.byType[module.moduleType] = (stats.byType[module.moduleType] || 0) + 1;
        
        // Count by category
        stats.byCategory[module.category] = (stats.byCategory[module.category] || 0) + 1;
        
        // Count by source
        stats.sources[info.source.type] = (stats.sources[info.source.type] || 0) + 1;
        
        // Load times
        if (info.loadTime) {
          stats.loadTimes[moduleId] = info.loadTime;
        }
      }
    }
    
    return stats;
  }

  /**
   * Clear registry and cache
   */
  clear() {
    this.modules.clear();
    this.cache.clear();
    this.index = null;
    this.searchIndex = null;
    this.loadTimes.clear();
  }

  /**
   * Hot reload a specific module
   */
  async reloadModule(moduleId) {
    const versions = this.modules.get(moduleId);
    if (!versions) return false;
    
    // Get latest version info
    const latestVersion = this.getLatestVersion(moduleId);
    const moduleInfo = versions.get(latestVersion);
    
    if (!moduleInfo) return false;
    
    try {
      // Clear from cache
      delete require.cache[require.resolve(moduleInfo.path)];
      
      // Reload based on type
      let newModuleInfo;
      if (moduleInfo.type === 'implementation') {
        newModuleInfo = await this.loadImplementationModule(moduleInfo.path, moduleInfo.source);
      } else {
        newModuleInfo = await this.loadDirectoryModule(moduleInfo.path, moduleInfo.source);
      }
      
      if (newModuleInfo) {
        await this.registerModule(newModuleInfo);
        await this.buildIndex();
        await this.buildSearchIndex();
        return true;
      }
    } catch (error) {
      console.error(`Failed to reload module ${moduleId}:`, error);
    }
    
    return false;
  }

  /**
   * Export registry state for debugging
   */
  exportState() {
    const state = {
      modules: {},
      index: this.index,
      stats: this.getStats()
    };
    
    for (const [moduleId, versions] of this.modules) {
      state.modules[moduleId] = {};
      
      for (const [version, info] of versions) {
        state.modules[moduleId][version] = {
          source: info.source.type,
          path: info.path,
          type: info.type,
          loadTime: info.loadTime
        };
      }
    }
    
    return state;
  }
}

// Export singleton instance
export const enhancedRegistry = new EnhancedModuleRegistry();