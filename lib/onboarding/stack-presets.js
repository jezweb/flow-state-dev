/**
 * Stack Preset Manager - Predefined stack combinations
 */
import chalk from 'chalk';

export class StackPresetManager {
  constructor() {
    this.presets = new Map();
    this.initializeDefaultPresets();
  }

  initializeDefaultPresets() {
    // Vue.js Full Stack (Recommended)
    this.addPreset({
      id: 'vue-full-stack',
      name: 'Vue Full Stack',
      description: 'Vue 3 + Vuetify + Supabase + Vercel - Complete web app stack',
      modules: ['vue-base', 'vuetify', 'supabase', 'vercel'],
      recommended: true,
      tags: ['frontend', 'backend', 'database', 'auth', 'deployment'],
      useCase: 'Full-featured web applications with modern UI, backend, and deployment',
      difficulty: 'beginner'
    });

    // Vue.js Frontend Only
    this.addPreset({
      id: 'vue-frontend',
      name: 'Vue Frontend',
      description: 'Vue 3 + Vuetify + Vercel - Frontend-only with deployment',
      modules: ['vue-base', 'vuetify', 'vercel'],
      tags: ['frontend', 'ui', 'deployment'],
      useCase: 'Frontend applications, admin dashboards, SPAs with deployment',
      difficulty: 'beginner'
    });

    // React Full Stack
    this.addPreset({
      id: 'react-full-stack',
      name: 'React Full Stack',
      description: 'React + Tailwind + Supabase + Vercel - Modern React stack with deployment',
      modules: ['react', 'tailwind', 'supabase', 'vercel'],
      tags: ['frontend', 'backend', 'database', 'auth', 'deployment'],
      useCase: 'React applications with modern styling, backend, and deployment',
      difficulty: 'intermediate'
    });

    // React Frontend Only
    this.addPreset({
      id: 'react-frontend',
      name: 'React Frontend',
      description: 'React + Tailwind + Vercel - Modern React setup with deployment',
      modules: ['react', 'tailwind', 'vercel'],
      tags: ['frontend', 'ui', 'deployment'],
      useCase: 'React SPAs, component libraries, frontend applications with deployment',
      difficulty: 'intermediate'
    });

    // Minimal Vue
    this.addPreset({
      id: 'vue-minimal',
      name: 'Vue Minimal',
      description: 'Vue 3 only - Lightweight setup for simple projects',
      modules: ['vue-base'],
      tags: ['frontend', 'minimal'],
      useCase: 'Simple applications, learning projects, lightweight SPAs',
      difficulty: 'beginner'
    });

    // Minimal React
    this.addPreset({
      id: 'react-minimal',
      name: 'React Minimal',
      description: 'React only - Basic React setup without extras',
      modules: ['react'],
      tags: ['frontend', 'minimal'],
      useCase: 'Basic React applications, learning projects',
      difficulty: 'beginner'
    });

    // Backend Only
    this.addPreset({
      id: 'backend-only',
      name: 'Backend Only',
      description: 'Supabase - For API-only projects or headless applications',
      modules: ['supabase'],
      tags: ['backend', 'api', 'database'],
      useCase: 'APIs, headless CMS, backend services, microservices',
      difficulty: 'intermediate'
    });

    // Deployment Ready Vue
    this.addPreset({
      id: 'vue-deploy-ready',
      name: 'Vue Deploy Ready',
      description: 'Vue 3 + Base Config + Vercel - Minimal Vue with instant deployment',
      modules: ['vue-base', 'base-config', 'vercel'],
      tags: ['frontend', 'deployment', 'minimal'],
      useCase: 'Quick prototypes, MVPs, demo applications',
      difficulty: 'beginner'
    });
  }

  /**
   * Add a new preset
   * @param {Object} preset - Preset configuration
   */
  addPreset(preset) {
    this.validatePreset(preset);
    this.presets.set(preset.id, preset);
  }

  /**
   * Get a preset by ID
   * @param {string} id - Preset ID
   * @returns {Object|null} Preset configuration
   */
  getPreset(id) {
    return this.presets.get(id) || null;
  }

  /**
   * Get all available presets
   * @returns {Array} Array of preset configurations
   */
  getAvailablePresets() {
    return Array.from(this.presets.values())
      .sort((a, b) => {
        // Recommended presets first, then alphabetical
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Get presets filtered by tags
   * @param {Array} tags - Tags to filter by
   * @returns {Array} Filtered presets
   */
  getPresetsByTags(tags) {
    return this.getAvailablePresets().filter(preset =>
      tags.some(tag => preset.tags.includes(tag))
    );
  }

  /**
   * Get presets by difficulty level
   * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
   * @returns {Array} Filtered presets
   */
  getPresetsByDifficulty(difficulty) {
    return this.getAvailablePresets().filter(preset =>
      preset.difficulty === difficulty
    );
  }

  /**
   * Get recommended presets
   * @returns {Array} Recommended presets
   */
  getRecommendedPresets() {
    return this.getAvailablePresets().filter(preset => preset.recommended);
  }

  /**
   * Create a custom preset from module selection
   * @param {string} name - Preset name
   * @param {string} description - Preset description
   * @param {Array} modules - Module IDs
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Created preset
   */
  createCustomPreset(name, description, modules, metadata = {}) {
    const preset = {
      id: this.generatePresetId(name),
      name,
      description,
      modules,
      custom: true,
      createdAt: new Date().toISOString(),
      ...metadata
    };

    this.addPreset(preset);
    return preset;
  }

  /**
   * Remove a custom preset
   * @param {string} id - Preset ID
   * @returns {boolean} Success status
   */
  removeCustomPreset(id) {
    const preset = this.getPreset(id);
    if (!preset || !preset.custom) {
      return false;
    }
    
    return this.presets.delete(id);
  }

  /**
   * Export presets to JSON
   * @param {boolean} includeCustom - Include custom presets
   * @returns {string} JSON string
   */
  exportPresets(includeCustom = true) {
    const presets = this.getAvailablePresets().filter(preset =>
      includeCustom || !preset.custom
    );
    
    return JSON.stringify(presets, null, 2);
  }

  /**
   * Import presets from JSON
   * @param {string} jsonData - JSON string with presets
   * @param {boolean} overwrite - Overwrite existing presets
   */
  importPresets(jsonData, overwrite = false) {
    const presets = JSON.parse(jsonData);
    
    for (const preset of presets) {
      if (!overwrite && this.presets.has(preset.id)) {
        continue;
      }
      
      preset.imported = true;
      this.addPreset(preset);
    }
  }

  /**
   * Validate preset configuration
   * @param {Object} preset - Preset to validate
   * @throws {Error} If preset is invalid
   */
  validatePreset(preset) {
    if (!preset.id || typeof preset.id !== 'string') {
      throw new Error('Preset must have a valid ID');
    }
    
    if (!preset.name || typeof preset.name !== 'string') {
      throw new Error('Preset must have a valid name');
    }
    
    if (!preset.description || typeof preset.description !== 'string') {
      throw new Error('Preset must have a valid description');
    }
    
    if (!Array.isArray(preset.modules) || preset.modules.length === 0) {
      throw new Error('Preset must have at least one module');
    }
    
    if (preset.tags && !Array.isArray(preset.tags)) {
      throw new Error('Preset tags must be an array');
    }
  }

  /**
   * Generate a unique preset ID from name
   * @param {string} name - Preset name
   * @returns {string} Generated ID
   */
  generatePresetId(name) {
    const baseId = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let id = baseId;
    let counter = 1;
    
    while (this.presets.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    return id;
  }

  /**
   * Display preset information
   * @param {string} id - Preset ID
   */
  displayPreset(id) {
    const preset = this.getPreset(id);
    if (!preset) {
      console.log(chalk.red(`Preset '${id}' not found`));
      return;
    }

    console.log(chalk.blue(`\n📋 ${preset.name}`));
    if (preset.recommended) {
      console.log(chalk.green('⭐ Recommended'));
    }
    console.log(chalk.gray(`${preset.description}\n`));
    
    if (preset.useCase) {
      console.log(chalk.cyan(`💡 Use case: ${preset.useCase}`));
    }
    
    if (preset.difficulty) {
      const difficultyColors = {
        beginner: 'green',
        intermediate: 'yellow',
        advanced: 'red'
      };
      console.log(chalk[difficultyColors[preset.difficulty] || 'gray'](`📊 Difficulty: ${preset.difficulty}`));
    }
    
    console.log(chalk.blue('\n📦 Modules:'));
    for (const moduleId of preset.modules) {
      console.log(chalk.green(`  ✓ ${moduleId}`));
    }
    
    if (preset.tags && preset.tags.length > 0) {
      console.log(chalk.gray(`\n🏷️  Tags: ${preset.tags.join(', ')}`));
    }
  }

  /**
   * List all available presets
   */
  listPresets() {
    const presets = this.getAvailablePresets();
    
    console.log(chalk.blue('\n📋 Available Stack Presets:\n'));
    
    for (const preset of presets) {
      const icon = preset.recommended ? '⭐' : '📦';
      const difficulty = preset.difficulty ? ` (${preset.difficulty})` : '';
      
      console.log(chalk.green(`${icon} ${preset.name}${difficulty}`));
      console.log(chalk.gray(`   ${preset.description}`));
      console.log(chalk.cyan(`   Modules: ${preset.modules.join(', ')}\n`));
    }
  }
}

export default StackPresetManager;