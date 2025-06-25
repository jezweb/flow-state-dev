/**
 * Dependency Resolver - Handles module dependency resolution and conflict detection
 */
import chalk from 'chalk';

export class DependencyResolver {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * Resolve module dependencies
   */
  async resolve(moduleNames, options = {}) {
    const {
      autoResolve = true,
      allowConflicts = false,
      maxDepth = 10
    } = options;

    try {
      // Convert module names to module objects
      const modules = this.getModules(moduleNames);
      
      // Build dependency graph
      const graph = this.buildDependencyGraph(modules, maxDepth);
      
      // Check for conflicts
      const conflicts = this.detectConflicts(graph.allModules);
      
      if (conflicts.length > 0 && !allowConflicts) {
        return {
          success: false,
          errors: conflicts,
          modules: [],
          graph
        };
      }
      
      // Topological sort for installation order
      const sorted = this.topologicalSort(graph);
      
      if (!sorted) {
        return {
          success: false,
          errors: ['Circular dependency detected in module graph'],
          modules: [],
          graph
        };
      }
      
      // Auto-resolve missing dependencies
      let finalModules = sorted;
      if (autoResolve) {
        finalModules = this.autoResolveDependencies(sorted);
      }
      
      return {
        success: true,
        modules: finalModules,
        conflicts: conflicts,
        graph,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        modules: [],
        graph: null
      };
    }
  }

  /**
   * Get module objects from names
   */
  getModules(moduleNames) {
    const modules = [];
    const notFound = [];
    
    for (const name of moduleNames) {
      const module = this.registry.getModule(name);
      if (module) {
        modules.push(module);
      } else {
        notFound.push(name);
      }
    }
    
    if (notFound.length > 0) {
      throw new Error(`Modules not found: ${notFound.join(', ')}`);
    }
    
    return modules;
  }

  /**
   * Build dependency graph
   */
  buildDependencyGraph(modules, maxDepth = 10) {
    const graph = {
      nodes: new Map(),
      edges: new Map(),
      allModules: new Set()
    };
    
    const visited = new Set();
    const queue = modules.map(m => ({ module: m, depth: 0 }));
    
    while (queue.length > 0) {
      const { module, depth } = queue.shift();
      
      if (visited.has(module.name) || depth > maxDepth) {
        continue;
      }
      
      visited.add(module.name);
      graph.allModules.add(module);
      
      // Add node
      if (!graph.nodes.has(module.name)) {
        graph.nodes.set(module.name, {
          module,
          dependencies: [],
          dependents: [],
          depth
        });
      }
      
      // Process dependencies
      if (module.dependencies) {
        for (const depName of Object.keys(module.dependencies)) {
          const depModule = this.registry.getModule(depName);
          
          if (depModule) {
            // Add edge
            if (!graph.edges.has(module.name)) {
              graph.edges.set(module.name, new Set());
            }
            graph.edges.get(module.name).add(depName);
            
            // Update node connections
            graph.nodes.get(module.name).dependencies.push(depName);
            
            if (!graph.nodes.has(depName)) {
              graph.nodes.set(depName, {
                module: depModule,
                dependencies: [],
                dependents: [],
                depth: depth + 1
              });
            }
            graph.nodes.get(depName).dependents.push(module.name);
            
            // Add to queue for processing
            queue.push({ module: depModule, depth: depth + 1 });
          }
        }
      }
    }
    
    return graph;
  }

  /**
   * Detect conflicts between modules
   */
  detectConflicts(modules) {
    const conflicts = [];
    const moduleArray = Array.from(modules);
    
    // Check category conflicts (multiple modules in same exclusive category)
    const exclusiveCategories = ['frontend-framework', 'backend-framework', 'database'];
    const categoryMap = new Map();
    
    for (const module of moduleArray) {
      if (exclusiveCategories.includes(module.category)) {
        if (!categoryMap.has(module.category)) {
          categoryMap.set(module.category, []);
        }
        categoryMap.get(module.category).push(module);
      }
    }
    
    for (const [category, categoryModules] of categoryMap) {
      if (categoryModules.length > 1) {
        conflicts.push(
          `Multiple ${category} modules selected: ${categoryModules.map(m => m.name).join(', ')}`
        );
      }
    }
    
    // Check explicit incompatibilities
    for (const module of moduleArray) {
      if (module.incompatible) {
        for (const incompatName of module.incompatible) {
          if (moduleArray.some(m => m.name === incompatName)) {
            conflicts.push(
              `${module.name} is incompatible with ${incompatName}`
            );
          }
        }
      }
    }
    
    // Check version conflicts
    const versionMap = new Map();
    for (const module of moduleArray) {
      if (module.dependencies) {
        for (const [depName, depVersion] of Object.entries(module.dependencies)) {
          if (!versionMap.has(depName)) {
            versionMap.set(depName, new Map());
          }
          versionMap.get(depName).set(module.name, depVersion);
        }
      }
    }
    
    for (const [depName, versions] of versionMap) {
      const uniqueVersions = new Set(versions.values());
      if (uniqueVersions.size > 1) {
        const versionList = Array.from(versions.entries())
          .map(([mod, ver]) => `${mod} requires ${ver}`)
          .join(', ');
        conflicts.push(
          `Version conflict for ${depName}: ${versionList}`
        );
      }
    }
    
    return conflicts;
  }

  /**
   * Topological sort for dependency order
   */
  topologicalSort(graph) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    
    const visit = (nodeName) => {
      if (visited.has(nodeName)) {
        return true;
      }
      
      if (visiting.has(nodeName)) {
        // Circular dependency detected
        return false;
      }
      
      visiting.add(nodeName);
      
      const node = graph.nodes.get(nodeName);
      if (node && node.dependencies) {
        for (const dep of node.dependencies) {
          if (!visit(dep)) {
            return false;
          }
        }
      }
      
      visiting.delete(nodeName);
      visited.add(nodeName);
      
      if (node) {
        sorted.push(node.module);
      }
      
      return true;
    };
    
    // Visit all nodes
    for (const nodeName of graph.nodes.keys()) {
      if (!visit(nodeName)) {
        return null; // Circular dependency
      }
    }
    
    return sorted;
  }

  /**
   * Auto-resolve missing dependencies
   */
  autoResolveDependencies(modules) {
    const resolved = new Set(modules);
    const added = [];
    
    for (const module of modules) {
      if (module.dependencies) {
        for (const depName of Object.keys(module.dependencies)) {
          if (!resolved.has(depName)) {
            const depModule = this.registry.getModule(depName);
            if (depModule) {
              resolved.add(depModule);
              added.push(depModule);
            }
          }
        }
      }
    }
    
    if (added.length > 0) {
      console.log(chalk.blue('📦 Auto-resolved dependencies:'));
      for (const module of added) {
        console.log(chalk.gray(`  + ${module.name} - ${module.description}`));
      }
    }
    
    return Array.from(resolved);
  }

  /**
   * Get dependency tree for visualization
   */
  getDependencyTree(modules) {
    const tree = {};
    
    const buildTree = (module, visited = new Set()) => {
      if (visited.has(module.name)) {
        return { circular: true };
      }
      
      visited.add(module.name);
      
      const node = {
        name: module.name,
        version: module.version,
        category: module.category,
        dependencies: {}
      };
      
      if (module.dependencies) {
        for (const depName of Object.keys(module.dependencies)) {
          const depModule = this.registry.getModule(depName);
          if (depModule) {
            node.dependencies[depName] = buildTree(depModule, new Set(visited));
          }
        }
      }
      
      return node;
    };
    
    for (const module of modules) {
      tree[module.name] = buildTree(module);
    }
    
    return tree;
  }

  /**
   * Check if adding a module would cause conflicts
   */
  canAddModule(currentModules, newModuleName) {
    const newModule = this.registry.getModule(newModuleName);
    if (!newModule) {
      return { canAdd: false, reason: 'Module not found' };
    }
    
    const testModules = [...currentModules, newModule];
    const conflicts = this.detectConflicts(testModules);
    
    if (conflicts.length > 0) {
      return { canAdd: false, reason: conflicts[0] };
    }
    
    return { canAdd: true };
  }

  /**
   * Get suggested modules based on current selection
   */
  getSuggestions(currentModules, options = {}) {
    const suggestions = [];
    const currentNames = currentModules.map(m => m.name);
    const currentCategories = new Set(currentModules.map(m => m.category));
    
    // Get all compatible modules
    const allModules = this.registry.getAllModules();
    
    for (const module of allModules) {
      // Skip already selected
      if (currentNames.includes(module.name)) {
        continue;
      }
      
      // Check if we can add it
      const { canAdd, reason } = this.canAddModule(currentModules, module.name);
      if (!canAdd) {
        continue;
      }
      
      // Calculate suggestion score
      let score = 0;
      
      // Boost if recommended
      if (module.recommended) {
        score += 10;
      }
      
      // Boost if commonly used with current modules
      for (const current of currentModules) {
        if (current.compatible && current.compatible.includes(module.name)) {
          score += 5;
        }
      }
      
      // Boost if fills a missing category
      if (!currentCategories.has(module.category)) {
        score += 3;
      }
      
      // Add to suggestions if score > 0
      if (score > 0 || options.includeAll) {
        suggestions.push({
          module,
          score,
          reason: this.getSuggestionReason(module, currentModules)
        });
      }
    }
    
    // Sort by score
    suggestions.sort((a, b) => b.score - a.score);
    
    return suggestions.slice(0, options.limit || 5);
  }

  /**
   * Get suggestion reason
   */
  getSuggestionReason(module, currentModules) {
    const reasons = [];
    
    if (module.recommended) {
      reasons.push('Recommended module');
    }
    
    const compatible = currentModules.filter(m => 
      m.compatible && m.compatible.includes(module.name)
    );
    
    if (compatible.length > 0) {
      reasons.push(`Works well with ${compatible.map(m => m.name).join(', ')}`);
    }
    
    const currentCategories = new Set(currentModules.map(m => m.category));
    if (!currentCategories.has(module.category)) {
      reasons.push(`Adds ${module.category} functionality`);
    }
    
    return reasons.length > 0 ? reasons.join('. ') : 'Additional functionality';
  }
}