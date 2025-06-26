/**
 * Suggestion Engine for Module Selection
 * 
 * Provides intelligent recommendations for module combinations
 */
import chalk from 'chalk';

export class ModuleSuggestionEngine {
  constructor(dependencyResolver) {
    this.resolver = dependencyResolver;
    this.popularCombinations = new Map();
    this.initializePopularCombinations();
  }

  /**
   * Initialize popular/blessed combinations
   */
  initializePopularCombinations() {
    // Define popular stack combinations
    this.popularCombinations.set('vue-material', {
      modules: ['vue3', 'vuetify', 'supabase'],
      name: 'Classic Vue Stack',
      description: 'Vue 3 with Material Design components',
      popularity: 95,
      tags: ['beginner-friendly', 'full-stack', 'material-design']
    });
    
    this.popularCombinations.set('react-modern', {
      modules: ['react', 'tailwind', 'supabase'],
      name: 'Modern React Stack',
      description: 'React with utility-first CSS',
      popularity: 90,
      tags: ['modern', 'flexible', 'performant']
    });
    
    this.popularCombinations.set('sveltekit-full', {
      modules: ['sveltekit', 'tailwind', 'better-auth'],
      name: 'SvelteKit Full Stack',
      description: 'SvelteKit with modern auth',
      popularity: 85,
      tags: ['cutting-edge', 'performant', 'ssr']
    });
    
    this.popularCombinations.set('vue-minimal', {
      modules: ['vue3', 'tailwind'],
      name: 'Minimalist Vue',
      description: 'Vue 3 with just Tailwind CSS',
      popularity: 80,
      tags: ['minimal', 'lightweight', 'flexible']
    });
  }

  /**
   * Get suggestions based on current selection
   */
  async getSuggestions(currentSelection = [], context = {}) {
    const suggestions = {
      recommended: [],
      popular: [],
      compatible: [],
      alternatives: []
    };
    
    // Get recommended modules to complete the stack
    suggestions.recommended = await this.getRecommendedModules(currentSelection, context);
    
    // Get popular combinations that include current selection
    suggestions.popular = this.getPopularCombinations(currentSelection);
    
    // Get all compatible modules
    suggestions.compatible = await this.getCompatibleModules(currentSelection);
    
    // Get alternatives if there are conflicts
    const validation = await this.resolver.validate(currentSelection);
    if (!validation.valid) {
      suggestions.alternatives = await this.getAlternativeSuggestions(validation);
    }
    
    return suggestions;
  }

  /**
   * Get recommended modules to complete the stack
   */
  async getRecommendedModules(currentSelection, context) {
    const recommendations = [];
    const selectedTypes = new Set();
    
    // Analyze current selection
    for (const moduleName of currentSelection) {
      const module = this.resolver.modules.get(moduleName);
      if (module) {
        selectedTypes.add(module.type);
      }
    }
    
    // Check what's missing
    const requiredTypes = ['frontend-framework', 'ui-library', 'backend-service'];
    const missingTypes = requiredTypes.filter(type => !selectedTypes.has(type));
    
    // Recommend modules for missing types
    for (const type of missingTypes) {
      const candidates = await this.getCandidatesForType(type, currentSelection);
      if (candidates.length > 0) {
        recommendations.push({
          module: candidates[0].name,
          reason: `Complete your stack with a ${type}`,
          score: candidates[0].score,
          type: 'missing-type'
        });
      }
    }
    
    // Check for missing requirements
    const validation = await this.resolver.validate(currentSelection);
    for (const missing of validation.missing) {
      const providers = await this.resolver.findModulesProviding(missing.requires);
      if (providers.length > 0) {
        recommendations.push({
          module: providers[0],
          reason: `Required by ${missing.module}`,
          score: 90,
          type: 'requirement'
        });
      }
    }
    
    // Sort by score
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Get candidates for a specific module type
   */
  async getCandidatesForType(type, currentSelection) {
    const candidates = [];
    
    for (const [name, module] of this.resolver.modules) {
      if (module.type !== type) continue;
      
      // Check compatibility
      const testSelection = [...currentSelection, name];
      const validation = await this.resolver.validate(testSelection);
      
      if (validation.valid) {
        candidates.push({
          name,
          module,
          score: this.calculateModuleScore(name, module, currentSelection)
        });
      }
    }
    
    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate score for a module
   */
  calculateModuleScore(moduleName, module, currentSelection) {
    let score = 50; // Base score
    
    // Bonus for popular combinations
    for (const [, combo] of this.popularCombinations) {
      if (combo.modules.includes(moduleName) && 
          currentSelection.some(m => combo.modules.includes(m))) {
        score += 20;
      }
    }
    
    // Bonus for explicit compatibility
    for (const selected of currentSelection) {
      const selectedModule = this.resolver.modules.get(selected);
      if (selectedModule && selectedModule.compatibleWith.includes(moduleName)) {
        score += 10;
      }
    }
    
    // Bonus for providing required capabilities
    const providedCapabilities = new Set(module.provides);
    for (const selected of currentSelection) {
      const selectedModule = this.resolver.modules.get(selected);
      if (selectedModule) {
        for (const req of selectedModule.requires) {
          if (providedCapabilities.has(req)) {
            score += 15;
          }
        }
      }
    }
    
    return score;
  }

  /**
   * Get popular combinations that include current selection
   */
  getPopularCombinations(currentSelection) {
    const matches = [];
    
    for (const [id, combo] of this.popularCombinations) {
      // Check if current selection is subset of combination
      const matchCount = currentSelection.filter(m => combo.modules.includes(m)).length;
      
      if (matchCount > 0) {
        matches.push({
          id,
          ...combo,
          matchCount,
          missingModules: combo.modules.filter(m => !currentSelection.includes(m))
        });
      }
    }
    
    return matches.sort((a, b) => {
      // Sort by match count, then popularity
      if (a.matchCount !== b.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return b.popularity - a.popularity;
    });
  }

  /**
   * Get all compatible modules
   */
  async getCompatibleModules(currentSelection) {
    const compatible = [];
    
    for (const [name, module] of this.resolver.modules) {
      if (currentSelection.includes(name)) continue;
      
      const testSelection = [...currentSelection, name];
      const validation = await this.resolver.validate(testSelection);
      
      if (validation.valid) {
        compatible.push({
          name,
          type: module.type,
          description: module.metadata?.description || '',
          provides: module.provides
        });
      }
    }
    
    // Group by type
    const grouped = {};
    for (const module of compatible) {
      if (!grouped[module.type]) {
        grouped[module.type] = [];
      }
      grouped[module.type].push(module);
    }
    
    return grouped;
  }

  /**
   * Get alternative suggestions when there are conflicts
   */
  async getAlternativeSuggestions(validation) {
    const alternatives = [];
    
    // For each conflict, find alternatives
    for (const conflict of validation.conflicts) {
      if (conflict.type === 'direct' || conflict.type === 'exclusive') {
        const alt1 = await this.findBestAlternative(conflict.module, conflict.conflictsWith);
        const alt2 = await this.findBestAlternative(conflict.conflictsWith, conflict.module);
        
        if (alt1) {
          alternatives.push({
            type: 'replace',
            remove: conflict.module,
            add: alt1.name,
            reason: `${alt1.name} is compatible with ${conflict.conflictsWith}`,
            score: alt1.score
          });
        }
        
        if (alt2) {
          alternatives.push({
            type: 'replace',
            remove: conflict.conflictsWith,
            add: alt2.name,
            reason: `${alt2.name} is compatible with ${conflict.module}`,
            score: alt2.score
          });
        }
      }
    }
    
    // For missing requirements, suggest providers
    for (const missing of validation.missing) {
      const providers = await this.resolver.findModulesProviding(missing.requires);
      for (const provider of providers.slice(0, 3)) {
        alternatives.push({
          type: 'add',
          add: provider,
          reason: `Provides ${missing.requires} required by ${missing.module}`,
          score: 80
        });
      }
    }
    
    // Remove duplicates and sort by score
    const unique = this.removeDuplicateAlternatives(alternatives);
    return unique.sort((a, b) => b.score - a.score);
  }

  /**
   * Find best alternative for a conflicting module
   */
  async findBestAlternative(moduleToReplace, mustBeCompatibleWith) {
    const module = this.resolver.modules.get(moduleToReplace);
    if (!module) return null;
    
    let bestAlternative = null;
    let bestScore = 0;
    
    for (const [name, candidate] of this.resolver.modules) {
      if (name === moduleToReplace) continue;
      if (candidate.type !== module.type) continue;
      
      // Check if compatible with the other module
      const validation = await this.resolver.validate([name, mustBeCompatibleWith]);
      if (validation.valid) {
        const score = this.calculateModuleScore(name, candidate, [mustBeCompatibleWith]);
        if (score > bestScore) {
          bestScore = score;
          bestAlternative = { name, module: candidate, score };
        }
      }
    }
    
    return bestAlternative;
  }

  /**
   * Remove duplicate alternative suggestions
   */
  removeDuplicateAlternatives(alternatives) {
    const seen = new Set();
    const unique = [];
    
    for (const alt of alternatives) {
      const key = `${alt.type}:${alt.remove || ''}:${alt.add}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(alt);
      }
    }
    
    return unique;
  }

  /**
   * Format suggestions for display
   */
  formatSuggestions(suggestions) {
    const output = [];
    
    if (suggestions.recommended.length > 0) {
      output.push(chalk.bold('🎯 Recommended Modules:'));
      for (const rec of suggestions.recommended.slice(0, 3)) {
        output.push(chalk.green(`  ✓ ${rec.module}`) + chalk.gray(` - ${rec.reason}`));
      }
      output.push('');
    }
    
    if (suggestions.popular.length > 0) {
      output.push(chalk.bold('🌟 Popular Combinations:'));
      for (const combo of suggestions.popular.slice(0, 3)) {
        output.push(chalk.cyan(`  ${combo.name}`) + chalk.gray(` - ${combo.description}`));
        if (combo.missingModules.length > 0) {
          output.push(chalk.gray(`    Missing: ${combo.missingModules.join(', ')}`));
        }
      }
      output.push('');
    }
    
    if (suggestions.alternatives.length > 0) {
      output.push(chalk.bold('💡 Alternatives to Resolve Conflicts:'));
      for (const alt of suggestions.alternatives.slice(0, 3)) {
        if (alt.type === 'replace') {
          output.push(chalk.yellow(`  Replace ${alt.remove} with ${alt.add}`));
        } else {
          output.push(chalk.yellow(`  Add ${alt.add}`));
        }
        output.push(chalk.gray(`    ${alt.reason}`));
      }
      output.push('');
    }
    
    return output.join('\n');
  }
}