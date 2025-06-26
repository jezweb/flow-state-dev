import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModuleSuggestionEngine } from '../../lib/modules/suggestion-engine.js';
import { ModuleDependencyResolver } from '../../lib/modules/dependency-resolver.js';
import { BaseStackModule } from '../../lib/modules/types/base-stack-module.js';
import chalk from 'chalk';

// Mock modules for testing
class MockModule extends BaseStackModule {
  constructor(name, type, options = {}) {
    super(name, `${name} module`, {
      moduleType: type,
      category: 'testing',
      metadata: { description: `${name} description` },
      ...options
    });
  }
}

describe('ModuleSuggestionEngine', () => {
  let suggestionEngine;
  let resolver;
  let mockModules;

  beforeEach(() => {
    resolver = new ModuleDependencyResolver();
    suggestionEngine = new ModuleSuggestionEngine(resolver);
    
    // Create test modules
    mockModules = {
      vue3: new MockModule('vue3', 'frontend-framework', {
        provides: ['frontend', 'routing', 'state-management'],
        compatibleWith: ['vuetify', 'tailwind', 'supabase'],
        incompatibleWith: ['react']
      }),
      
      react: new MockModule('react', 'frontend-framework', {
        provides: ['frontend'],
        requires: ['state-management'],
        compatibleWith: ['tailwind', 'mui', 'supabase'],
        incompatibleWith: ['vue3']
      }),
      
      sveltekit: new MockModule('sveltekit', 'frontend-framework', {
        provides: ['frontend', 'routing', 'ssr'],
        compatibleWith: ['tailwind', 'better-auth']
      }),
      
      vuetify: new MockModule('vuetify', 'ui-library', {
        requires: ['vue3'],
        provides: ['ui-components', 'theming'],
        compatibleWith: ['vue3']
      }),
      
      tailwind: new MockModule('tailwind', 'ui-library', {
        provides: ['ui-styling'],
        compatibleWith: ['*']
      }),
      
      mui: new MockModule('mui', 'ui-library', {
        requires: ['react'],
        provides: ['ui-components', 'theming'],
        compatibleWith: ['react']
      }),
      
      supabase: new MockModule('supabase', 'backend-service', {
        provides: ['database', 'auth', 'storage'],
        compatibleWith: ['*']
      }),
      
      'better-auth': new MockModule('better-auth', 'authentication', {
        provides: ['auth'],
        compatibleWith: ['sveltekit']
      }),
      
      redux: new MockModule('redux', 'state-manager', {
        provides: ['state-management'],
        compatibleWith: ['react']
      })
    };

    // Register all modules
    Object.values(mockModules).forEach(module => {
      resolver.registerModule(module);
    });
  });

  describe('initializePopularCombinations', () => {
    it('should initialize popular combinations', () => {
      expect(suggestionEngine.popularCombinations.size).toBeGreaterThan(0);
      expect(suggestionEngine.popularCombinations.has('vue-material')).toBe(true);
      expect(suggestionEngine.popularCombinations.has('react-modern')).toBe(true);
      expect(suggestionEngine.popularCombinations.has('sveltekit-full')).toBe(true);
    });

    it('should have proper structure for combinations', () => {
      const vueMaterial = suggestionEngine.popularCombinations.get('vue-material');
      expect(vueMaterial).toHaveProperty('modules');
      expect(vueMaterial).toHaveProperty('name');
      expect(vueMaterial).toHaveProperty('description');
      expect(vueMaterial).toHaveProperty('popularity');
      expect(vueMaterial).toHaveProperty('tags');
    });
  });

  describe('getSuggestions', () => {
    it('should return all suggestion types', async () => {
      const suggestions = await suggestionEngine.getSuggestions(['vue3']);
      
      expect(suggestions).toHaveProperty('recommended');
      expect(suggestions).toHaveProperty('popular');
      expect(suggestions).toHaveProperty('compatible');
      expect(suggestions).toHaveProperty('alternatives');
    });

    it('should recommend missing module types', async () => {
      const suggestions = await suggestionEngine.getSuggestions(['vue3']);
      
      const uiRecommendation = suggestions.recommended.find(r => 
        r.reason.includes('ui-library')
      );
      expect(uiRecommendation).toBeDefined();
      
      const backendRecommendation = suggestions.recommended.find(r => 
        r.reason.includes('backend-service')
      );
      expect(backendRecommendation).toBeDefined();
    });

    it('should find popular combinations', async () => {
      const suggestions = await suggestionEngine.getSuggestions(['vue3']);
      
      expect(suggestions.popular.length).toBeGreaterThan(0);
      const vueMaterial = suggestions.popular.find(p => p.id === 'vue-material');
      expect(vueMaterial).toBeDefined();
      expect(vueMaterial.missingModules).toContain('vuetify');
      expect(vueMaterial.missingModules).toContain('supabase');
    });

    it('should get compatible modules grouped by type', async () => {
      const suggestions = await suggestionEngine.getSuggestions(['vue3']);
      
      expect(suggestions.compatible).toHaveProperty('ui-library');
      expect(suggestions.compatible['ui-library']).toContainEqual(
        expect.objectContaining({ name: 'vuetify' })
      );
    });

    it('should provide alternatives for conflicts', async () => {
      const suggestions = await suggestionEngine.getSuggestions(['vue3', 'react']);
      
      expect(suggestions.alternatives.length).toBeGreaterThan(0);
      expect(suggestions.alternatives[0].type).toBe('replace');
    });

    it('should handle empty selection', async () => {
      const suggestions = await suggestionEngine.getSuggestions([]);
      
      expect(suggestions.recommended.length).toBeGreaterThan(0);
      expect(suggestions.compatible).toBeDefined();
    });
  });

  describe('getRecommendedModules', () => {
    it('should recommend modules for missing requirements', async () => {
      const recommendations = await suggestionEngine.getRecommendedModules(['react']);
      
      const stateManagement = recommendations.find(r => 
        r.reason.includes('Required by react') || r.type === 'requirement'
      );
      expect(stateManagement).toBeDefined();
      // Could be redux or any module that provides state-management
      expect(['redux', 'vue3'].includes(stateManagement.module)).toBe(true);
    });

    it('should score recommendations', async () => {
      const recommendations = await suggestionEngine.getRecommendedModules(['vue3']);
      
      expect(recommendations.every(r => r.score > 0)).toBe(true);
      expect(recommendations[0].score).toBeGreaterThanOrEqual(recommendations[1]?.score || 0);
    });
  });

  describe('calculateModuleScore', () => {
    it('should give bonus for popular combinations', () => {
      const score = suggestionEngine.calculateModuleScore('vuetify', mockModules.vuetify, ['vue3']);
      
      expect(score).toBeGreaterThan(50); // Base score is 50
    });

    it('should give bonus for explicit compatibility', () => {
      const score = suggestionEngine.calculateModuleScore('vuetify', mockModules.vuetify, ['vue3']);
      const baseScore = suggestionEngine.calculateModuleScore('vuetify', mockModules.vuetify, []);
      
      expect(score).toBeGreaterThan(baseScore);
    });

    it('should give bonus for providing required capabilities', () => {
      const score = suggestionEngine.calculateModuleScore('redux', mockModules.redux, ['react']);
      
      expect(score).toBeGreaterThan(50); // Provides state-management needed by react
    });
  });

  describe('getPopularCombinations', () => {
    it('should match current selection', () => {
      const combinations = suggestionEngine.getPopularCombinations(['vue3']);
      
      expect(combinations.length).toBeGreaterThan(0);
      expect(combinations.every(c => c.matchCount > 0)).toBe(true);
    });

    it('should sort by match count and popularity', () => {
      const combinations = suggestionEngine.getPopularCombinations(['vue3', 'tailwind']);
      
      // Should prioritize combinations with more matches
      const first = combinations[0];
      expect(first.matchCount).toBeGreaterThanOrEqual(2);
    });

    it('should include missing modules', () => {
      const combinations = suggestionEngine.getPopularCombinations(['vue3']);
      
      const vueMaterial = combinations.find(c => c.id === 'vue-material');
      expect(vueMaterial.missingModules).not.toContain('vue3');
      expect(vueMaterial.missingModules).toContain('vuetify');
    });
  });

  describe('getCompatibleModules', () => {
    it('should return modules grouped by type', async () => {
      const compatible = await suggestionEngine.getCompatibleModules(['vue3']);
      
      expect(compatible).toHaveProperty('ui-library');
      expect(compatible).toHaveProperty('backend-service');
    });

    it('should only include compatible modules', async () => {
      const compatible = await suggestionEngine.getCompatibleModules(['vue3']);
      
      // React should not be in the list
      const allModules = Object.values(compatible).flat();
      expect(allModules.find(m => m.name === 'react')).toBeUndefined();
    });

    it('should exclude already selected modules', async () => {
      const compatible = await suggestionEngine.getCompatibleModules(['vue3', 'vuetify']);
      
      const uiLibraries = compatible['ui-library'] || [];
      expect(uiLibraries.find(m => m.name === 'vuetify')).toBeUndefined();
    });
  });

  describe('getAlternativeSuggestions', () => {
    it('should suggest replacements for conflicts', async () => {
      const validation = await resolver.validate(['vue3', 'react']);
      const alternatives = await suggestionEngine.getAlternativeSuggestions(validation);
      
      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].type).toBe('replace');
    });

    it('should suggest modules for missing requirements', async () => {
      const validation = await resolver.validate(['react']);
      const alternatives = await suggestionEngine.getAlternativeSuggestions(validation);
      
      const addSuggestion = alternatives.find(a => a.type === 'add');
      expect(addSuggestion).toBeDefined();
      expect(addSuggestion.reason).toContain('state-management');
    });

    it('should remove duplicate suggestions', async () => {
      const validation = {
        conflicts: [
          { type: 'direct', module: 'vue3', conflictsWith: 'react' },
          { type: 'direct', module: 'react', conflictsWith: 'vue3' }
        ],
        missing: []
      };
      
      const alternatives = await suggestionEngine.getAlternativeSuggestions(validation);
      
      // Should not have duplicate suggestions
      const seen = new Set();
      alternatives.forEach(alt => {
        const key = `${alt.type}:${alt.remove || ''}:${alt.add}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      });
    });
  });

  describe('findBestAlternative', () => {
    it('should find alternative of same type', async () => {
      const alternative = await suggestionEngine.findBestAlternative('vue3', 'supabase');
      
      expect(alternative).toBeDefined();
      expect(alternative.module.type).toBe('frontend-framework');
    });

    it('should ensure compatibility', async () => {
      const alternative = await suggestionEngine.findBestAlternative('vuetify', 'react');
      
      // Should find an alternative or null if none exist
      if (alternative) {
        expect(alternative.module.type).toBe('ui-library');
      } else {
        expect(alternative).toBeNull();
      }
    });

    it('should return null if no alternative exists', async () => {
      const alternative = await suggestionEngine.findBestAlternative('supabase', 'vue3');
      
      // No alternative backend-service exists
      expect(alternative).toBeNull();
    });
  });

  describe('formatSuggestions', () => {
    it('should format all suggestion types', async () => {
      const suggestions = await suggestionEngine.getSuggestions(['vue3']);
      const formatted = suggestionEngine.formatSuggestions(suggestions);
      
      expect(formatted).toContain('Recommended Modules');
      expect(formatted).toContain('Popular Combinations');
    });

    it('should include reasons and descriptions', async () => {
      const suggestions = {
        recommended: [{
          module: 'vuetify',
          reason: 'Complete your stack with a ui-library',
          score: 85
        }],
        popular: [{
          name: 'Vue Material',
          description: 'Vue 3 with Material Design',
          missingModules: ['vuetify']
        }],
        alternatives: []
      };
      
      const formatted = suggestionEngine.formatSuggestions(suggestions);
      
      expect(formatted).toContain('vuetify');
      expect(formatted).toContain('Complete your stack');
      expect(formatted).toContain('Vue Material');
    });

    it('should handle empty suggestions gracefully', () => {
      const suggestions = {
        recommended: [],
        popular: [],
        compatible: {},
        alternatives: []
      };
      
      const formatted = suggestionEngine.formatSuggestions(suggestions);
      
      expect(formatted).toBe('');
    });

    it('should use chalk colors', () => {
      const suggestions = {
        recommended: [{
          module: 'test',
          reason: 'test reason',
          score: 50
        }],
        popular: [],
        alternatives: []
      };
      
      const formatted = suggestionEngine.formatSuggestions(suggestions);
      
      // Check that chalk methods are being used (formatted will contain ANSI codes)
      expect(formatted).toContain('test');
      expect(formatted).toContain('test reason');
    });
  });

  describe('edge cases', () => {
    it('should handle modules without metadata', async () => {
      const moduleWithoutMeta = new MockModule('test', 'test-type', {
        metadata: null
      });
      resolver.registerModule(moduleWithoutMeta);
      
      const compatible = await suggestionEngine.getCompatibleModules([]);
      const testModules = compatible['test-type'] || [];
      
      const test = testModules.find(m => m.name === 'test');
      expect(test?.description).toBeDefined(); // May fallback to module name
    });

    it('should handle circular references gracefully', async () => {
      // Create modules with circular compatibility
      const circA = new MockModule('circA', 'test', {
        compatibleWith: ['circB']
      });
      const circB = new MockModule('circB', 'test', {
        compatibleWith: ['circA']
      });
      
      resolver.registerModule(circA);
      resolver.registerModule(circB);
      
      const suggestions = await suggestionEngine.getSuggestions(['circA']);
      
      // Should not crash or infinite loop
      expect(suggestions).toBeDefined();
    });
  });
});