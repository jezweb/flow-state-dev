/**
 * Modules API
 * 
 * API for managing and querying Flow State Dev modules
 */

import { ModuleRegistry } from '../../modules/registry.js';
import { ModuleValidator } from '../../modules/validation/module-validator.js';
import EventEmitter from 'events';

export class ModulesAPI extends EventEmitter {
  constructor(flowStateAPI) {
    super();
    this.api = flowStateAPI;
    this.registry = new ModuleRegistry();
    this.validator = new ModuleValidator();
    this.initialized = false;
  }
  
  /**
   * Initialize modules
   */
  async initialize() {
    if (this.initialized) return;
    
    this.emit('progress', { 
      step: 'modules:init', 
      message: 'Discovering modules...' 
    });
    
    await this.registry.discover();
    this.initialized = true;
    
    this.emit('progress', { 
      step: 'modules:ready', 
      message: `Loaded ${this.registry.getAllModules().length} modules` 
    });
  }
  
  /**
   * List all available modules
   * @param {Object} filters - Optional filters
   * @returns {Array} Module list
   */
  async list(filters = {}) {
    await this.initialize();
    
    let modules = this.registry.getAllModules();
    
    // Apply filters
    if (filters.category) {
      modules = modules.filter(m => m.category === filters.category);
    }
    
    if (filters.tag) {
      modules = modules.filter(m => m.tags?.includes(filters.tag));
    }
    
    if (filters.compatible) {
      modules = modules.filter(m => 
        m.compatibleWith?.includes(filters.compatible)
      );
    }
    
    // Transform for API response
    return modules.map(this.transformModule);
  }
  
  /**
   * Get module by name
   * @param {string} name - Module name
   * @returns {Object|null} Module details
   */
  async get(name) {
    await this.initialize();
    const module = this.registry.getModule(name);
    return module ? this.transformModule(module) : null;
  }
  
  /**
   * Get module categories
   * @returns {Array} Available categories
   */
  async getCategories() {
    await this.initialize();
    return Array.from(this.registry.getCategories());
  }
  
  /**
   * Search modules
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Search results
   */
  async search(query, options = {}) {
    await this.initialize();
    const results = this.registry.searchModules(query, options);
    return results.map(this.transformModule);
  }
  
  /**
   * Validate module configuration
   * @param {Object} moduleConfig - Module configuration
   * @returns {Object} Validation result
   */
  async validate(moduleConfig) {
    return this.validator.validate(moduleConfig);
  }
  
  /**
   * Check module compatibility
   * @param {Array} selectedModules - Selected module names
   * @returns {Object} Compatibility result
   */
  async checkCompatibility(selectedModules) {
    await this.initialize();
    
    const modules = selectedModules.map(name => 
      this.registry.getModule(name)
    ).filter(Boolean);
    
    const issues = [];
    const warnings = [];
    
    // Check each module against others
    for (const module of modules) {
      const otherModules = modules.filter(m => m.name !== module.name);
      
      // Check incompatibilities
      if (module.incompatibleWith) {
        for (const incompatible of module.incompatibleWith) {
          if (otherModules.some(m => m.name === incompatible)) {
            issues.push({
              type: 'incompatible',
              modules: [module.name, incompatible],
              message: `${module.name} is incompatible with ${incompatible}`
            });
          }
        }
      }
      
      // Check requirements
      if (module.requires) {
        for (const requirement of module.requires) {
          const hasRequirement = modules.some(m => 
            m.provides?.includes(requirement)
          );
          
          if (!hasRequirement) {
            issues.push({
              type: 'missing-requirement',
              module: module.name,
              requirement,
              message: `${module.name} requires ${requirement}`
            });
          }
        }
      }
    }
    
    return {
      compatible: issues.length === 0,
      issues,
      warnings
    };
  }
  
  /**
   * Get module statistics
   * @returns {Object} Module statistics
   */
  async getStatistics() {
    await this.initialize();
    return this.registry.getStatistics();
  }
  
  /**
   * Transform module for API response
   */
  transformModule(module) {
    return {
      name: module.name,
      displayName: module.displayName || module.name,
      version: module.version,
      description: module.description,
      category: module.category,
      tags: module.tags || [],
      author: module.author,
      provides: module.provides || [],
      requires: module.requires || [],
      compatibleWith: module.compatibleWith || [],
      incompatibleWith: module.incompatibleWith || [],
      recommended: module.recommended || false,
      experimental: module.experimental || false,
      deprecated: module.deprecated || false
    };
  }
  
  /**
   * Get available modules count
   */
  getAvailableModules() {
    return this.registry.getAllModules();
  }
  
  /**
   * Check if initialized
   */
  isInitialized() {
    return this.initialized;
  }
}