/**
 * Module Registry for Flow State Dev Modular Architecture
 * 
 * Enhanced registry that manages stack modules for project generation.
 * Extends the existing RetrofitModuleRegistry with stack-specific functionality.
 */
import { RetrofitModuleRegistry } from '../retrofit-modules/base-module.js';
import { BaseStackModule, MODULE_TYPES, MODULE_PROVIDES } from './types/index.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class StackModuleRegistry extends RetrofitModuleRegistry {
  constructor() {
    super();
    this.stackModules = new Map();
    this.modulesByType = new Map();
    this.modulesByCategory = new Map();
    this.modulesByProvider = new Map();
    this.loadedModules = false;
  }

  /**
   * Register a stack module
   * @param {BaseStackModule} module - Stack module to register
   */
  register(module) {
    if (!(module instanceof BaseStackModule)) {
      throw new Error('Module must extend BaseStackModule');
    }

    // Register with parent class
    super.register(module);

    // Stack-specific registration
    this.stackModules.set(module.name, module);

    // Index by type
    if (!this.modulesByType.has(module.moduleType)) {
      this.modulesByType.set(module.moduleType, []);
    }
    this.modulesByType.get(module.moduleType).push(module);

    // Index by category
    if (!this.modulesByCategory.has(module.category)) {
      this.modulesByCategory.set(module.category, []);
    }
    this.modulesByCategory.get(module.category).push(module);

    // Index by what they provide
    for (const provides of module.provides) {
      if (!this.modulesByProvider.has(provides)) {
        this.modulesByProvider.set(provides, []);
      }
      this.modulesByProvider.get(provides).push(module);
    }
  }

  /**
   * Auto-discover and load modules from the modules directory
   * @param {string} modulesPath - Path to modules directory
   */
  async autoLoadModules(modulesPath = null) {
    if (this.loadedModules) return;

    const defaultPath = path.join(process.cwd(), 'lib', 'modules', 'implementations');
    const searchPath = modulesPath || defaultPath;

    if (!await fs.pathExists(searchPath)) {
      console.log(chalk.yellow(`Modules directory not found: ${searchPath}`));
      return;
    }

    try {
      const moduleFiles = await fs.readdir(searchPath);
      const jsFiles = moduleFiles.filter(file => file.endsWith('.js'));

      for (const file of jsFiles) {
        try {
          const modulePath = path.join(searchPath, file);
          const moduleExports = await import(modulePath);
          
          // Look for default export or named exports that are modules
          const potentialModules = [
            moduleExports.default,
            ...Object.values(moduleExports)
          ].filter(exp => exp instanceof BaseStackModule);

          for (const module of potentialModules) {
            this.register(module);
            console.log(chalk.green(`✓ Loaded module: ${module.name}`));
          }
        } catch (error) {
          console.warn(chalk.yellow(`⚠ Failed to load module ${file}: ${error.message}`));
        }
      }

      this.loadedModules = true;
    } catch (error) {
      console.error(chalk.red(`Error loading modules: ${error.message}`));
    }
  }

  /**
   * Get modules by type
   * @param {string} moduleType - Module type identifier
   * @returns {Array} Modules of specified type
   */
  getModulesByType(moduleType) {
    return this.modulesByType.get(moduleType) || [];
  }

  /**
   * Get modules by category
   * @param {string} category - Module category
   * @returns {Array} Modules in specified category
   */
  getModulesByCategory(category) {
    return this.modulesByCategory.get(category) || [];
  }

  /**
   * Get modules that provide a specific feature
   * @param {string} feature - Feature identifier
   * @returns {Array} Modules that provide the feature
   */
  getModulesByProvider(feature) {
    return this.modulesByProvider.get(feature) || [];
  }

  /**
   * Get available frontend frameworks
   * @returns {Array} Frontend framework modules
   */
  getFrontendFrameworks() {
    return this.getModulesByType(MODULE_TYPES.FRONTEND_FRAMEWORK);
  }

  /**
   * Get available UI libraries
   * @param {string} framework - Optional framework filter
   * @returns {Array} UI library modules
   */
  getUILibraries(framework = null) {
    const uiLibs = this.getModulesByType(MODULE_TYPES.UI_LIBRARY);
    
    if (!framework) return uiLibs;
    
    return uiLibs.filter(lib => 
      !lib.compatibleFrameworks.length || 
      lib.compatibleFrameworks.includes(framework)
    );
  }

  /**
   * Get available backend services
   * @returns {Array} Backend service modules
   */
  getBackendServices() {
    return this.getModulesByType(MODULE_TYPES.BACKEND_SERVICE);
  }

  /**
   * Get available auth providers
   * @returns {Array} Auth provider modules
   */
  getAuthProviders() {
    return this.getModulesByType(MODULE_TYPES.AUTH_PROVIDER);
  }

  /**
   * Get available backend frameworks
   * @returns {Array} Backend framework modules
   */
  getBackendFrameworks() {
    return this.getModulesByType(MODULE_TYPES.BACKEND_FRAMEWORK);
  }

  /**
   * Validate a stack configuration
   * @param {Array} selectedModules - Selected modules
   * @returns {Object} Validation result
   */
  validateStack(selectedModules) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check for required module types
    const requiredTypes = [MODULE_TYPES.FRONTEND_FRAMEWORK];
    for (const type of requiredTypes) {
      const hasType = selectedModules.some(m => m.moduleType === type);
      if (!hasType) {
        result.errors.push(`Missing required module type: ${type}`);
        result.valid = false;
      }
    }

    // Check for conflicts and compatibility
    for (const module of selectedModules) {
      const compatibility = module.checkCompatibility(selectedModules);
      
      if (!compatibility.compatible) {
        result.errors.push(...compatibility.issues.map(issue => issue.message));
        result.valid = false;
      }
      
      result.warnings.push(...compatibility.warnings.map(warning => warning.message));
    }

    // Check for missing features
    const allRequires = selectedModules.flatMap(m => m.requires);
    const allProvides = selectedModules.flatMap(m => m.provides);
    
    for (const requirement of allRequires) {
      if (!allProvides.includes(requirement)) {
        // Look for modules that can provide this requirement
        const providers = this.getModulesByProvider(requirement);
        if (providers.length > 0) {
          result.suggestions.push({
            type: 'missing-requirement',
            requirement,
            suggestions: providers.map(p => p.name)
          });
        } else {
          result.warnings.push(`No modules available that provide: ${requirement}`);
        }
      }
    }

    // Check for recommended combinations
    this.addRecommendations(selectedModules, result);

    return result;
  }

  /**
   * Add recommendations based on selected modules
   * @param {Array} selectedModules - Selected modules
   * @param {Object} result - Validation result to modify
   */
  addRecommendations(selectedModules, result) {
    const selectedTypes = new Set(selectedModules.map(m => m.moduleType));

    // If has frontend but no UI library
    if (selectedTypes.has(MODULE_TYPES.FRONTEND_FRAMEWORK) && 
        !selectedTypes.has(MODULE_TYPES.UI_LIBRARY)) {
      const frontend = selectedModules.find(m => m.moduleType === MODULE_TYPES.FRONTEND_FRAMEWORK);
      const compatibleUI = this.getUILibraries(frontend.framework);
      
      if (compatibleUI.length > 0) {
        result.suggestions.push({
          type: 'recommendation',
          message: 'Consider adding a UI library for better component styling',
          suggestions: compatibleUI.slice(0, 3).map(ui => ui.name)
        });
      }
    }

    // If has frontend but no backend
    if (selectedTypes.has(MODULE_TYPES.FRONTEND_FRAMEWORK) && 
        !selectedTypes.has(MODULE_TYPES.BACKEND_SERVICE) &&
        !selectedTypes.has(MODULE_TYPES.BACKEND_FRAMEWORK)) {
      result.suggestions.push({
        type: 'recommendation',
        message: 'Consider adding a backend service or framework for data management',
        suggestions: ['supabase', 'firebase', 'express']
      });
    }

    // If has backend but no auth
    if ((selectedTypes.has(MODULE_TYPES.BACKEND_SERVICE) || 
         selectedTypes.has(MODULE_TYPES.BACKEND_FRAMEWORK)) &&
        !selectedModules.some(m => m.provides.includes(MODULE_PROVIDES.AUTH))) {
      result.suggestions.push({
        type: 'recommendation',
        message: 'Consider adding authentication for user management',
        suggestions: this.getAuthProviders().slice(0, 3).map(auth => auth.name)
      });
    }
  }

  /**
   * Get stack presets (common module combinations)
   * @returns {Array} Available presets
   */
  getStackPresets() {
    const presets = [];

    // Vue + Vuetify + Supabase preset
    const vueVuetify = this.get('vue3');
    const vuetify = this.get('vuetify');
    const supabase = this.get('supabase');
    
    if (vueVuetify && vuetify && supabase) {
      presets.push({
        name: 'Vue + Vuetify + Supabase',
        description: 'Full-stack Vue 3 application with Material Design and Supabase backend',
        modules: ['vue3', 'vuetify', 'supabase'],
        tags: ['frontend', 'material-design', 'backend', 'auth', 'database'],
        recommended: true
      });
    }

    // React + Material UI + Firebase preset
    const react = this.get('react');
    const mui = this.get('material-ui');
    const firebase = this.get('firebase');
    
    if (react && mui && firebase) {
      presets.push({
        name: 'React + Material UI + Firebase',
        description: 'React application with Material UI components and Firebase backend',
        modules: ['react', 'material-ui', 'firebase'],
        tags: ['frontend', 'material-design', 'backend', 'google'],
        recommended: true
      });
    }

    // Vue + Tailwind preset
    const vueTailwind = this.get('vue3');
    const tailwind = this.get('tailwind');
    
    if (vueTailwind && tailwind) {
      presets.push({
        name: 'Vue + Tailwind CSS',
        description: 'Vue 3 application with utility-first CSS framework',
        modules: ['vue3', 'tailwind'],
        tags: ['frontend', 'utility-css', 'minimal'],
        recommended: false
      });
    }

    // Full-stack Express preset
    const express = this.get('express');
    
    if (vueVuetify && express) {
      presets.push({
        name: 'Vue + Express Full-Stack',
        description: 'Full-stack application with Vue frontend and Express backend',
        modules: ['vue3', 'vuetify', 'express'],
        tags: ['fullstack', 'nodejs', 'api'],
        recommended: false
      });
    }

    return presets;
  }

  /**
   * Resolve a preset to module instances
   * @param {Object} preset - Preset configuration
   * @returns {Array} Module instances
   */
  resolvePreset(preset) {
    const modules = [];
    
    for (const moduleName of preset.modules) {
      const module = this.get(moduleName);
      if (module) {
        modules.push(module);
      } else {
        throw new Error(`Module not found in preset: ${moduleName}`);
      }
    }
    
    return modules;
  }

  /**
   * Generate dependency graph for modules
   * @param {Array} modules - Modules to analyze
   * @returns {Object} Dependency graph
   */
  generateDependencyGraph(modules) {
    const graph = {
      nodes: [],
      edges: [],
      levels: []
    };

    // Create nodes
    for (const module of modules) {
      graph.nodes.push({
        id: module.name,
        name: module.name,
        type: module.moduleType,
        category: module.category,
        provides: module.provides,
        requires: module.requires
      });
    }

    // Create edges based on dependencies
    for (const module of modules) {
      for (const requirement of module.requires) {
        const provider = modules.find(m => m.provides.includes(requirement));
        if (provider) {
          graph.edges.push({
            from: provider.name,
            to: module.name,
            label: requirement
          });
        }
      }
    }

    // Calculate dependency levels
    const sorted = this.sortByDependencies(modules);
    const levelMap = new Map();
    
    for (let i = 0; i < sorted.length; i++) {
      const level = Math.floor(i / 3); // Group into levels
      if (!levelMap.has(level)) {
        levelMap.set(level, []);
      }
      levelMap.get(level).push(sorted[i].name);
    }
    
    graph.levels = Array.from(levelMap.values());

    return graph;
  }

  /**
   * Export registry state for debugging
   * @returns {Object} Registry state
   */
  exportState() {
    return {
      totalModules: this.stackModules.size,
      modulesByType: Object.fromEntries(
        Array.from(this.modulesByType.entries()).map(([type, modules]) => [
          type, 
          modules.map(m => m.name)
        ])
      ),
      modulesByCategory: Object.fromEntries(
        Array.from(this.modulesByCategory.entries()).map(([category, modules]) => [
          category, 
          modules.map(m => m.name)
        ])
      ),
      modulesByProvider: Object.fromEntries(
        Array.from(this.modulesByProvider.entries()).map(([provider, modules]) => [
          provider, 
          modules.map(m => m.name)
        ])
      ),
      loadedModules: this.loadedModules
    };
  }

  /**
   * Display registry status
   */
  displayStatus() {
    console.log(chalk.blue('\n📦 Module Registry Status:\n'));
    
    console.log(chalk.white(`Total modules: ${this.stackModules.size}`));
    
    if (this.modulesByType.size > 0) {
      console.log(chalk.white('\nBy type:'));
      for (const [type, modules] of this.modulesByType.entries()) {
        console.log(chalk.gray(`  ${type}: ${modules.length} modules`));
      }
    }
    
    if (this.modulesByCategory.size > 0) {
      console.log(chalk.white('\nBy category:'));
      for (const [category, modules] of this.modulesByCategory.entries()) {
        console.log(chalk.gray(`  ${category}: ${modules.length} modules`));
      }
    }
    
    const presets = this.getStackPresets();
    if (presets.length > 0) {
      console.log(chalk.white(`\nAvailable presets: ${presets.length}`));
      for (const preset of presets) {
        const marker = preset.recommended ? chalk.green('✓') : chalk.gray('•');
        console.log(chalk.gray(`  ${marker} ${preset.name}`));
      }
    }
    
    console.log();
  }
}

// Create default registry instance
export const stackModuleRegistry = new StackModuleRegistry();

/**
 * Get the default stack module registry
 * @returns {StackModuleRegistry} Registry instance
 */
export function getStackModuleRegistry() {
  return stackModuleRegistry;
}