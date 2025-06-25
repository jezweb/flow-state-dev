/**
 * Module Registry - Central registry for all stack modules
 * Handles discovery, loading, validation, and querying of modules
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { ModuleLoader } from './module-loader.js';
import { ModuleValidator } from './validation/module-validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.categories = new Set();
    this.initialized = false;
    this.loader = new ModuleLoader();
    this.validator = new ModuleValidator();
    this.modulesPath = join(__dirname, '../../modules');
  }

  /**
   * Discover and load all available modules
   */
  async discover() {
    console.log(chalk.blue('🔍 Discovering stack modules...'));
    
    try {
      // Reset state
      this.modules.clear();
      this.categories.clear();
      
      // Scan module directories
      await this.scanModuleDirectories();
      
      // Validate all modules
      await this.validateAllModules();
      
      // Build indices
      this.buildIndices();
      
      this.initialized = true;
      
      console.log(chalk.green(`✅ Discovered ${this.modules.size} modules across ${this.categories.size} categories`));
      
      return {
        success: true,
        moduleCount: this.modules.size,
        categories: Array.from(this.categories)
      };
    } catch (error) {
      console.error(chalk.red('❌ Module discovery failed:'), error);
      throw error;
    }
  }

  /**
   * Scan directories for module definitions
   */
  async scanModuleDirectories() {
    if (!existsSync(this.modulesPath)) {
      throw new Error(`Module directory not found: ${this.modulesPath}`);
    }

    // Check if this is a flat structure (modules directly in modules/) 
    // or nested structure (modules/category/module/)
    const items = readdirSync(this.modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const itemName of items) {
      const itemPath = join(this.modulesPath, itemName);
      
      // Check if this item has a module.json (flat structure)
      const moduleJsonPath = join(itemPath, 'module.json');
      if (existsSync(moduleJsonPath)) {
        // Flat structure - load module directly
        await this.loadModule(itemPath);
      } else {
        // Nested structure - treat as category
        const modules = readdirSync(itemPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);

        for (const moduleName of modules) {
          const modulePath = join(itemPath, moduleName);
          await this.loadModule(modulePath, itemName);
        }
      }
    }
  }

  /**
   * Load a single module
   */
  async loadModule(modulePath, category = null) {
    try {
      const module = await this.loader.load(modulePath);
      
      if (module) {
        // Ensure category is set (from module.json or directory structure)
        module.category = module.category || category || 'other';
        
        // Register module
        this.modules.set(module.name, module);
        this.categories.add(module.category);
        
        console.log(chalk.gray(`  📦 Loaded: ${module.name} (${module.category})`));
      }
    } catch (error) {
      console.warn(chalk.yellow(`  ⚠️  Failed to load module at ${modulePath}:`), error.message);
    }
  }

  /**
   * Validate all loaded modules
   */
  async validateAllModules() {
    const validationResults = [];
    
    for (const [name, module] of this.modules) {
      const result = await this.validator.validate(module);
      
      if (!result.valid) {
        console.warn(chalk.yellow(`  ⚠️  Validation issues for ${name}:`));
        result.errors.forEach(error => {
          console.warn(chalk.yellow(`     - ${error}`));
        });
      }
      
      validationResults.push({ name, ...result });
    }
    
    return validationResults;
  }

  /**
   * Build search indices
   */
  buildIndices() {
    // Build category index
    this.categoryIndex = new Map();
    
    for (const [name, module] of this.modules) {
      const category = module.category;
      
      if (!this.categoryIndex.has(category)) {
        this.categoryIndex.set(category, []);
      }
      
      this.categoryIndex.get(category).push(module);
    }
    
    // Build tag index
    this.tagIndex = new Map();
    
    for (const [name, module] of this.modules) {
      if (module.tags && Array.isArray(module.tags)) {
        for (const tag of module.tags) {
          if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, []);
          }
          
          this.tagIndex.get(tag).push(module);
        }
      }
    }
  }

  /**
   * Check if registry is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get a module by name
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Get all modules
   */
  getAllModules() {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category) {
    return this.categoryIndex.get(category) || [];
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories);
  }

  /**
   * Get modules by tag
   */
  getModulesByTag(tag) {
    return this.tagIndex.get(tag) || [];
  }

  /**
   * Search modules by query
   */
  searchModules(query, options = {}) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    for (const module of this.modules.values()) {
      let score = 0;
      
      // Name match (highest priority)
      if (module.name.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
      
      // Description match
      if (module.description && module.description.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
      
      // Tag match
      if (module.tags && module.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        score += 3;
      }
      
      // Category match
      if (module.category && module.category.toLowerCase().includes(lowerQuery)) {
        score += 2;
      }
      
      if (score > 0) {
        results.push({ module, score });
      }
    }
    
    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);
    
    // Apply filters if provided
    let filteredResults = results;
    
    if (options.category) {
      filteredResults = filteredResults.filter(r => r.module.category === options.category);
    }
    
    if (options.tags) {
      const requiredTags = Array.isArray(options.tags) ? options.tags : [options.tags];
      filteredResults = filteredResults.filter(r => 
        requiredTags.every(tag => r.module.tags?.includes(tag))
      );
    }
    
    // Return modules only
    return filteredResults.slice(0, options.limit || 10).map(r => r.module);
  }

  /**
   * Get module statistics
   */
  getStatistics() {
    const stats = {
      totalModules: this.modules.size,
      byCategory: {},
      byVersion: {},
      withDependencies: 0,
      recommended: 0
    };
    
    for (const module of this.modules.values()) {
      // Category stats
      stats.byCategory[module.category] = (stats.byCategory[module.category] || 0) + 1;
      
      // Version stats
      const majorVersion = module.version ? module.version.split('.')[0] : 'unknown';
      stats.byVersion[majorVersion] = (stats.byVersion[majorVersion] || 0) + 1;
      
      // Dependency stats
      if (module.dependencies && Object.keys(module.dependencies).length > 0) {
        stats.withDependencies++;
      }
      
      // Recommended stats
      if (module.recommended) {
        stats.recommended++;
      }
    }
    
    return stats;
  }

  /**
   * Get compatible modules for a given module
   */
  getCompatibleModules(moduleName, options = {}) {
    const module = this.getModule(moduleName);
    if (!module) {
      return [];
    }
    
    const compatible = [];
    
    for (const [name, otherModule] of this.modules) {
      if (name === moduleName) continue;
      
      // Check compatibility rules
      let isCompatible = true;
      
      // Check if modules are in conflicting categories
      if (options.excludeSameCategory && module.category === otherModule.category) {
        isCompatible = false;
      }
      
      // Check explicit compatibility
      if (module.compatible && !module.compatible.includes(otherModule.name)) {
        isCompatible = false;
      }
      
      // Check explicit incompatibility
      if (module.incompatible && module.incompatible.includes(otherModule.name)) {
        isCompatible = false;
      }
      
      if (isCompatible) {
        compatible.push(otherModule);
      }
    }
    
    return compatible;
  }

  /**
   * Export registry data for documentation
   */
  exportForDocumentation() {
    const data = {
      modules: [],
      categories: Array.from(this.categories),
      statistics: this.getStatistics(),
      generated: new Date().toISOString()
    };
    
    for (const module of this.modules.values()) {
      data.modules.push({
        name: module.name,
        displayName: module.displayName,
        version: module.version,
        description: module.description,
        category: module.category,
        tags: module.tags,
        author: module.author,
        repository: module.repository,
        dependencies: module.dependencies,
        peerDependencies: module.peerDependencies,
        compatible: module.compatible,
        incompatible: module.incompatible,
        recommended: module.recommended,
        configSchema: module.getConfigSchema ? module.getConfigSchema() : null
      });
    }
    
    return data;
  }
}