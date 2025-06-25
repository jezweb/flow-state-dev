/**
 * Module Search Engine
 * 
 * Provides advanced search capabilities for modules including fuzzy matching,
 * relevance scoring, and filtering.
 */
import Fuse from 'fuse.js';

export class ModuleSearchEngine {
  constructor() {
    this.index = null;
    this.fuse = null;
    this.modules = [];
  }

  /**
   * Build search index from modules
   */
  buildIndex(modules) {
    this.modules = modules;
    
    // Prepare searchable documents
    const documents = modules.map(module => ({
      id: module.name,
      name: module.name,
      displayName: module.displayName || module.name,
      description: module.description || '',
      type: module.moduleType,
      category: module.category,
      tags: module.tags || [],
      keywords: this.extractKeywords(module),
      provides: module.provides || [],
      compatibleWith: module.compatibleWith || [],
      popularity: module.stars || 0,
      author: module.author || 'fsd',
      version: module.version || '1.0.0'
    }));

    // Configure Fuse.js for fuzzy search
    const fuseOptions = {
      keys: [
        { name: 'name', weight: 2.0 },
        { name: 'displayName', weight: 1.8 },
        { name: 'description', weight: 1.5 },
        { name: 'tags', weight: 1.3 },
        { name: 'keywords', weight: 1.2 },
        { name: 'type', weight: 1.0 },
        { name: 'category', weight: 1.0 },
        { name: 'provides', weight: 0.8 },
        { name: 'author', weight: 0.5 }
      ],
      threshold: 0.3, // 0 = exact match, 1 = match anything
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: true,
      ignoreLocation: true, // Search anywhere in the string
      useExtendedSearch: true // Enable advanced search operators
    };

    this.fuse = new Fuse(documents, fuseOptions);
    this.index = documents;
  }

  /**
   * Extract keywords from a module
   */
  extractKeywords(module) {
    const keywords = new Set();
    
    // Add module name variations
    if (module.name) {
      keywords.add(module.name);
      keywords.add(module.name.toLowerCase());
      
      // Split camelCase and kebab-case
      const parts = module.name.split(/[-_]|(?=[A-Z])/);
      parts.forEach(part => {
        if (part.length > 2) {
          keywords.add(part.toLowerCase());
        }
      });
    }
    
    // Add type and category
    if (module.moduleType) keywords.add(module.moduleType);
    if (module.category) keywords.add(module.category);
    
    // Add provides
    if (module.provides) {
      module.provides.forEach(p => keywords.add(p));
    }
    
    // Add common variations
    const variations = {
      'vue': ['vuejs', 'vue.js', 'vue3'],
      'react': ['reactjs', 'react.js'],
      'supabase': ['supa', 'supabase.io'],
      'tailwind': ['tailwindcss', 'tw'],
      'auth': ['authentication', 'auth0', 'authorize']
    };
    
    for (const [key, values] of Object.entries(variations)) {
      if (module.name.toLowerCase().includes(key)) {
        values.forEach(v => keywords.add(v));
      }
    }
    
    return Array.from(keywords);
  }

  /**
   * Search modules with advanced options
   */
  search(query, options = {}) {
    if (!this.fuse) {
      throw new Error('Search index not built. Call buildIndex() first.');
    }

    const {
      type,
      category,
      tags,
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
      filters = {}
    } = options;

    // Build search query
    let searchQuery = query;
    
    // Add type filter to query if specified
    if (type) {
      searchQuery = `${searchQuery} type:${type}`;
    }
    
    // Perform fuzzy search
    let results = query ? this.fuse.search(searchQuery) : 
      this.index.map((item, idx) => ({ item, refIndex: idx, score: 1 }));

    // Apply filters
    results = this.applyFilters(results, {
      type,
      category,
      tags,
      ...filters
    });

    // Apply custom scoring
    results = this.applyScoring(results, query, options);

    // Sort results
    results = this.sortResults(results, sortBy);

    // Apply pagination
    const paginated = results.slice(offset, offset + limit);

    // Return formatted results
    return {
      results: paginated.map(r => ({
        module: this.modules[r.refIndex],
        score: r.finalScore || r.score,
        matches: r.matches || []
      })),
      total: results.length,
      query,
      options
    };
  }

  /**
   * Apply filters to search results
   */
  applyFilters(results, filters) {
    return results.filter(result => {
      const item = result.item;
      
      // Type filter
      if (filters.type && item.type !== filters.type) {
        return false;
      }
      
      // Category filter
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      
      // Tags filter (any match)
      if (filters.tags && filters.tags.length > 0) {
        const itemTags = new Set(item.tags);
        const hasTag = filters.tags.some(tag => itemTags.has(tag));
        if (!hasTag) return false;
      }
      
      // Compatible with filter
      if (filters.compatibleWith) {
        if (!item.compatibleWith.includes(filters.compatibleWith)) {
          return false;
        }
      }
      
      // Provides filter
      if (filters.provides) {
        if (!item.provides.includes(filters.provides)) {
          return false;
        }
      }
      
      // Minimum popularity
      if (filters.minPopularity && item.popularity < filters.minPopularity) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Apply custom scoring based on various factors
   */
  applyScoring(results, query, options) {
    return results.map(result => {
      let score = 1 - (result.score || 0); // Fuse returns 0 for perfect match
      
      const item = result.item;
      
      // Exact name match bonus
      if (query && item.name.toLowerCase() === query.toLowerCase()) {
        score += 0.5;
      }
      
      // Popularity bonus (normalized)
      const popularityBonus = Math.log10(item.popularity + 1) / 10;
      score += popularityBonus * 0.2;
      
      // Type relevance bonus
      if (options.preferredType && item.type === options.preferredType) {
        score += 0.1;
      }
      
      // Official module bonus
      if (item.author === 'fsd' || item.author === 'flow-state-dev') {
        score += 0.1;
      }
      
      // Recency bonus (if version info available)
      // TODO: Add version date tracking
      
      // Tag match bonus
      if (options.tags) {
        const matchedTags = options.tags.filter(tag => item.tags.includes(tag));
        score += matchedTags.length * 0.05;
      }
      
      result.finalScore = Math.min(score, 1); // Cap at 1
      return result;
    });
  }

  /**
   * Sort search results
   */
  sortResults(results, sortBy) {
    switch (sortBy) {
      case 'relevance':
        return results.sort((a, b) => 
          (b.finalScore || b.score) - (a.finalScore || a.score)
        );
      
      case 'popularity':
        return results.sort((a, b) => b.item.popularity - a.item.popularity);
      
      case 'name':
        return results.sort((a, b) => 
          a.item.displayName.localeCompare(b.item.displayName)
        );
      
      case 'recent':
        // TODO: Add last updated tracking
        return results;
      
      default:
        return results;
    }
  }

  /**
   * Get search suggestions based on partial input
   */
  getSuggestions(partial, limit = 5) {
    if (!this.fuse || partial.length < 2) {
      return [];
    }

    // Use stricter threshold for suggestions
    const tempOptions = { ...this.fuse.options, threshold: 0.1 };
    const tempFuse = new Fuse(this.index, tempOptions);
    
    const results = tempFuse.search(partial, { limit });
    
    return results.map(r => ({
      text: r.item.displayName,
      value: r.item.name,
      type: r.item.type,
      category: r.item.category
    }));
  }

  /**
   * Find similar modules
   */
  findSimilar(moduleId, limit = 5) {
    const module = this.index.find(m => m.id === moduleId);
    if (!module) return [];

    // Search using module characteristics
    const searchTerms = [
      module.type,
      module.category,
      ...module.tags
    ].filter(Boolean).join(' ');

    const results = this.search(searchTerms, {
      limit: limit + 1, // +1 to exclude self
      filters: {
        type: module.type
      }
    });

    // Filter out the module itself
    return results.results
      .filter(r => r.module.name !== moduleId)
      .slice(0, limit);
  }

  /**
   * Get trending modules (mock implementation)
   */
  getTrending(limit = 10) {
    // In a real implementation, this would track usage/downloads
    return this.modules
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, limit);
  }

  /**
   * Get recommended modules based on current selection
   */
  getRecommendations(selectedModules, limit = 5) {
    const recommendations = [];
    const selectedTypes = new Set(selectedModules.map(m => m.moduleType));
    const selectedNames = new Set(selectedModules.map(m => m.name));
    
    // Find modules that are commonly used together
    const commonPairs = {
      'vue3': ['vuetify', 'pinia', 'vue-router'],
      'react': ['tailwind', 'redux', 'react-router'],
      'sveltekit': ['tailwind', 'better-auth'],
      'tailwind': ['headlessui', 'heroicons'],
      'supabase': ['supabase-auth', 'postgres']
    };
    
    for (const selected of selectedModules) {
      const pairs = commonPairs[selected.name] || [];
      
      for (const pairName of pairs) {
        const module = this.modules.find(m => m.name === pairName);
        if (module && !selectedNames.has(pairName)) {
          recommendations.push({
            module,
            reason: `Commonly used with ${selected.displayName || selected.name}`,
            score: 0.8
          });
        }
      }
    }
    
    // Sort by score and limit
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Clear search index
   */
  clear() {
    this.index = null;
    this.fuse = null;
    this.modules = [];
  }
}

// Export singleton instance
export const searchEngine = new ModuleSearchEngine();