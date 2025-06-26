/**
 * Module Dependency Resolution System
 * 
 * Validates and resolves module dependencies for the modular stack selection
 */
import chalk from 'chalk';
import semver from 'semver';
import { performance } from 'perf_hooks';
import { performanceMonitor } from '../performance/monitor.js';

export class ModuleDependencyResolver {
  constructor() {
    this.modules = new Map();
    this.dependencyGraph = new Map();
    this.compatibilityMatrix = new Map();
    this.resolutionCache = new Map();
  }

  /**
   * Register a module with its dependencies and compatibility
   */
  registerModule(module) {
    const moduleInfo = {
      id: module.name,
      version: module.version || '1.0.0',
      type: module.moduleType,
      requires: module.requires || [],
      provides: module.provides || [],
      compatibleWith: module.compatibleWith || [],
      incompatibleWith: module.incompatibleWith || [],
      optional: module.optional || [],
      metadata: module
    };
    
    this.modules.set(module.name, moduleInfo);
    this.updateCompatibilityMatrix(module.name, moduleInfo);
    this.updateDependencyGraph(module.name, moduleInfo);
  }

  /**
   * Update compatibility matrix
   */
  updateCompatibilityMatrix(moduleName, moduleInfo) {
    if (!this.compatibilityMatrix.has(moduleName)) {
      this.compatibilityMatrix.set(moduleName, {
        compatible: new Set(),
        incompatible: new Set(),
        requires: new Set(),
        provides: new Set()
      });
    }
    
    const matrix = this.compatibilityMatrix.get(moduleName);
    
    // Add compatible modules
    moduleInfo.compatibleWith.forEach(mod => {
      if (mod === '*') {
        // Compatible with all modules of this type
        matrix.compatible.add('*');
      } else {
        matrix.compatible.add(mod);
      }
    });
    
    // Add incompatible modules
    moduleInfo.incompatibleWith.forEach(mod => {
      matrix.incompatible.add(mod);
    });
    
    // Add requirements
    moduleInfo.requires.forEach(req => {
      matrix.requires.add(req);
    });
    
    // Add provisions
    moduleInfo.provides.forEach(prov => {
      matrix.provides.add(prov);
    });
  }

  /**
   * Update dependency graph
   */
  updateDependencyGraph(moduleName, moduleInfo) {
    if (!this.dependencyGraph.has(moduleName)) {
      this.dependencyGraph.set(moduleName, {
        dependencies: new Set(),
        dependents: new Set()
      });
    }
    
    const node = this.dependencyGraph.get(moduleName);
    
    // Add dependencies
    moduleInfo.requires.forEach(dep => {
      node.dependencies.add(dep);
      
      // Update dependent's graph
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, {
          dependencies: new Set(),
          dependents: new Set()
        });
      }
      this.dependencyGraph.get(dep).dependents.add(moduleName);
    });
  }

  /**
   * Validate a module combination
   */
  async validate(selection) {
    const startTime = performance.now();
    
    // Check cache
    const cacheKey = this.getCacheKey(selection);
    if (this.resolutionCache.has(cacheKey)) {
      return this.resolutionCache.get(cacheKey);
    }
    
    const result = {
      valid: true,
      conflicts: [],
      missing: [],
      suggestions: [],
      warnings: []
    };
    
    try {
      // Convert selection to module list
      const selectedModules = this.normalizeSelection(selection);
      
      // Check for direct conflicts
      this.checkDirectConflicts(selectedModules, result);
      
      // Check for missing requirements
      this.checkRequirements(selectedModules, result);
      
      // Check for indirect conflicts
      this.checkIndirectConflicts(selectedModules, result);
      
      // Check module type coverage
      this.checkTypeCoverage(selectedModules, result);
      
      // Generate suggestions if needed
      if (!result.valid) {
        await this.generateSuggestions(selectedModules, result);
      }
      
      // Determine overall validity
      result.valid = result.conflicts.length === 0 && result.missing.length === 0;
      
    } catch (error) {
      result.valid = false;
      result.errors = [error.message];
    }
    
    const duration = performance.now() - startTime;
    performanceMonitor.trackCommandExecution('dependency-validation', duration, {
      moduleCount: Object.keys(selection).length,
      valid: result.valid
    });
    
    // Cache result
    this.resolutionCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Normalize selection to module list
   */
  normalizeSelection(selection) {
    const modules = [];
    
    if (Array.isArray(selection)) {
      // Already a list of module names
      modules.push(...selection);
    } else {
      // Object with type -> module mapping
      for (const [type, moduleName] of Object.entries(selection)) {
        if (moduleName) {
          modules.push(moduleName);
        }
      }
    }
    
    return modules;
  }

  /**
   * Check for direct conflicts between modules
   */
  checkDirectConflicts(selectedModules, result) {
    for (const moduleName of selectedModules) {
      const module = this.modules.get(moduleName);
      if (!module) continue;
      
      const matrix = this.compatibilityMatrix.get(moduleName);
      if (!matrix) continue;
      
      // Check incompatibilities
      for (const incompatible of matrix.incompatible) {
        if (selectedModules.includes(incompatible)) {
          result.conflicts.push({
            type: 'direct',
            module: moduleName,
            conflictsWith: incompatible,
            reason: `${moduleName} is incompatible with ${incompatible}`
          });
        }
      }
      
      // Check same-type conflicts (e.g., can't have two frontend frameworks)
      for (const otherModule of selectedModules) {
        if (otherModule === moduleName) continue;
        
        const other = this.modules.get(otherModule);
        if (other && other.type === module.type && this.isExclusiveType(module.type)) {
          result.conflicts.push({
            type: 'exclusive',
            module: moduleName,
            conflictsWith: otherModule,
            reason: `Cannot use multiple ${module.type} modules`
          });
        }
      }
    }
  }

  /**
   * Check if all requirements are satisfied
   */
  checkRequirements(selectedModules, result) {
    const providedCapabilities = new Set();
    
    // Collect all provided capabilities
    for (const moduleName of selectedModules) {
      const module = this.modules.get(moduleName);
      if (!module) continue;
      
      module.provides.forEach(cap => providedCapabilities.add(cap));
    }
    
    // Check each module's requirements
    for (const moduleName of selectedModules) {
      const module = this.modules.get(moduleName);
      if (!module) continue;
      
      const matrix = this.compatibilityMatrix.get(moduleName);
      if (!matrix) continue;
      
      for (const requirement of matrix.requires) {
        // Check if requirement is a module name or capability
        if (!selectedModules.includes(requirement) && !providedCapabilities.has(requirement)) {
          result.missing.push({
            module: moduleName,
            requires: requirement,
            type: this.isCapability(requirement) ? 'capability' : 'module'
          });
        }
      }
    }
  }

  /**
   * Check for indirect conflicts (transitive dependencies)
   */
  checkIndirectConflicts(selectedModules, result) {
    // Build full dependency tree
    const dependencyTree = this.buildDependencyTree(selectedModules);
    
    // Check for circular dependencies
    const cycles = this.detectCycles(dependencyTree);
    for (const cycle of cycles) {
      result.conflicts.push({
        type: 'circular',
        modules: cycle,
        reason: `Circular dependency detected: ${cycle.join(' -> ')}`
      });
    }
    
    // Check for version conflicts
    this.checkVersionConflicts(dependencyTree, result);
  }

  /**
   * Build dependency tree for selected modules
   */
  buildDependencyTree(modules, visited = new Set(), tree = {}) {
    for (const moduleName of modules) {
      if (visited.has(moduleName)) continue;
      visited.add(moduleName);
      
      const module = this.modules.get(moduleName);
      if (!module) continue;
      
      tree[moduleName] = {
        module,
        dependencies: {}
      };
      
      // Recursively add dependencies
      if (module.requires.length > 0) {
        this.buildDependencyTree(module.requires, visited, tree[moduleName].dependencies);
      }
    }
    
    return tree;
  }

  /**
   * Detect circular dependencies
   */
  detectCycles(tree, path = [], cycles = []) {
    for (const [moduleName, node] of Object.entries(tree)) {
      if (path.includes(moduleName)) {
        // Found a cycle
        const cycleStart = path.indexOf(moduleName);
        cycles.push([...path.slice(cycleStart), moduleName]);
      } else {
        // Continue searching
        path.push(moduleName);
        this.detectCycles(node.dependencies || {}, path, cycles);
        path.pop();
      }
    }
    
    return cycles;
  }

  /**
   * Check for version conflicts
   */
  checkVersionConflicts(tree, result) {
    const versionRequirements = new Map();
    
    this.collectVersionRequirements(tree, versionRequirements);
    
    // Check for conflicts
    for (const [moduleName, requirements] of versionRequirements) {
      if (requirements.length > 1) {
        // Check if all requirements are compatible
        const compatible = this.areVersionsCompatible(requirements);
        if (!compatible) {
          result.conflicts.push({
            type: 'version',
            module: moduleName,
            requirements: requirements.map(r => `${r.requiredBy}: ${r.version}`),
            reason: `Incompatible version requirements for ${moduleName}`
          });
        }
      }
    }
  }

  /**
   * Collect version requirements from dependency tree
   */
  collectVersionRequirements(tree, requirements, parent = null) {
    for (const [moduleName, node] of Object.entries(tree)) {
      if (!requirements.has(moduleName)) {
        requirements.set(moduleName, []);
      }
      
      if (parent) {
        requirements.get(moduleName).push({
          requiredBy: parent,
          version: node.module?.version || '*'
        });
      }
      
      if (node.dependencies) {
        this.collectVersionRequirements(node.dependencies, requirements, moduleName);
      }
    }
  }

  /**
   * Check if version requirements are compatible
   */
  areVersionsCompatible(requirements) {
    // Simple check - in real implementation would use semver
    const versions = requirements.map(r => r.version);
    
    // If any is *, it's compatible with all
    if (versions.includes('*')) return true;
    
    // Check semver compatibility
    try {
      return versions.every(v1 => 
        versions.every(v2 => 
          v1 === v2 || semver.satisfies(v1, v2) || semver.satisfies(v2, v1)
        )
      );
    } catch {
      // If semver parsing fails, assume incompatible
      return false;
    }
  }

  /**
   * Check module type coverage
   */
  checkTypeCoverage(selectedModules, result) {
    const requiredTypes = ['frontend-framework', 'ui-library', 'backend-service'];
    const coveredTypes = new Set();
    
    for (const moduleName of selectedModules) {
      const module = this.modules.get(moduleName);
      if (module) {
        coveredTypes.add(module.type);
      }
    }
    
    for (const type of requiredTypes) {
      if (!coveredTypes.has(type)) {
        result.warnings.push({
          type: 'missing-type',
          moduleType: type,
          message: `No ${type} module selected`
        });
      }
    }
  }

  /**
   * Generate suggestions for fixing issues
   */
  async generateSuggestions(selectedModules, result) {
    // Suggest modules to resolve conflicts
    for (const conflict of result.conflicts) {
      if (conflict.type === 'direct' || conflict.type === 'exclusive') {
        const alternatives = await this.findAlternatives(conflict.module, selectedModules);
        if (alternatives.length > 0) {
          result.suggestions.push({
            type: 'replace',
            remove: conflict.module,
            add: alternatives[0],
            reason: `Replace ${conflict.module} with ${alternatives[0]} to resolve conflict`
          });
        }
      }
    }
    
    // Suggest modules to satisfy requirements
    for (const missing of result.missing) {
      const candidates = await this.findModulesProviding(missing.requires);
      if (candidates.length > 0) {
        result.suggestions.push({
          type: 'add',
          add: candidates[0],
          reason: `Add ${candidates[0]} to provide ${missing.requires}`
        });
      }
    }
  }

  /**
   * Find alternative modules
   */
  async findAlternatives(moduleName, selectedModules) {
    const module = this.modules.get(moduleName);
    if (!module) return [];
    
    const alternatives = [];
    
    for (const [name, candidate] of this.modules) {
      if (name === moduleName) continue;
      if (candidate.type !== module.type) continue;
      
      // Check if compatible with other selected modules
      const testSelection = selectedModules.filter(m => m !== moduleName).concat(name);
      const validation = await this.validate(testSelection);
      
      if (validation.valid) {
        alternatives.push(name);
      }
    }
    
    return alternatives;
  }

  /**
   * Find modules that provide a capability
   */
  async findModulesProviding(capability) {
    const providers = [];
    
    for (const [name, module] of this.modules) {
      if (module.provides.includes(capability) || name === capability) {
        providers.push(name);
      }
    }
    
    // Sort by popularity or other metrics
    return providers;
  }

  /**
   * Check if a type is exclusive (only one allowed)
   */
  isExclusiveType(type) {
    const exclusiveTypes = [
      'frontend-framework',
      'backend-framework',
      'build-tool',
      'package-manager'
    ];
    
    return exclusiveTypes.includes(type);
  }

  /**
   * Check if a requirement is a capability vs module name
   */
  isCapability(requirement) {
    // Capabilities typically use lowercase with dashes
    return requirement.includes('-') && !this.modules.has(requirement);
  }

  /**
   * Get cache key for selection
   */
  getCacheKey(selection) {
    if (Array.isArray(selection)) {
      return selection.sort().join(',');
    } else {
      return Object.entries(selection)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join(',');
    }
  }

  /**
   * Get topological sort of modules for installation order
   */
  getInstallationOrder(modules) {
    const visited = new Set();
    const result = [];
    
    const visit = (module) => {
      if (visited.has(module)) return;
      visited.add(module);
      
      const node = this.dependencyGraph.get(module);
      if (node) {
        // Visit dependencies first
        for (const dep of node.dependencies) {
          visit(dep);
        }
      }
      
      result.push(module);
    };
    
    for (const module of modules) {
      visit(module);
    }
    
    return result;
  }

  /**
   * Get compatibility report for a module
   */
  getCompatibilityReport(moduleName) {
    const module = this.modules.get(moduleName);
    if (!module) return null;
    
    const matrix = this.compatibilityMatrix.get(moduleName);
    if (!matrix) return null;
    
    return {
      module: moduleName,
      type: module.type,
      compatible: Array.from(matrix.compatible),
      incompatible: Array.from(matrix.incompatible),
      requires: Array.from(matrix.requires),
      provides: Array.from(matrix.provides),
      exclusiveType: this.isExclusiveType(module.type)
    };
  }

  /**
   * Clear resolution cache
   */
  clearCache() {
    this.resolutionCache.clear();
  }
}