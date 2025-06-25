/**
 * Module Documentation Generator
 * Auto-generates documentation from module metadata and schemas
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class DocumentationGenerator {
  constructor(registry) {
    this.registry = registry;
    this.outputDir = join(__dirname, '../../../docs/modules');
    this.templatesDir = join(__dirname, './templates');
  }

  /**
   * Generate documentation for all modules
   */
  async generateAll(options = {}) {
    console.log(chalk.blue('📚 Generating module documentation...'));
    
    try {
      // Ensure output directory exists
      this.ensureDirectory(this.outputDir);
      
      // Generate individual module docs
      const modules = this.registry.getAllModules();
      for (const module of modules) {
        await this.generateModuleDoc(module);
      }
      
      // Generate index page
      await this.generateIndexPage(modules);
      
      // Generate category pages
      await this.generateCategoryPages();
      
      // Generate comparison matrix
      await this.generateComparisonMatrix(modules);
      
      // Generate API reference
      await this.generateApiReference(modules);
      
      if (options.generateJson) {
        await this.generateJsonData();
      }
      
      console.log(chalk.green(`✅ Generated documentation for ${modules.length} modules`));
      
      return {
        success: true,
        moduleCount: modules.length,
        outputDir: this.outputDir
      };
    } catch (error) {
      console.error(chalk.red('❌ Documentation generation failed:'), error);
      throw error;
    }
  }

  /**
   * Generate documentation for a single module
   */
  async generateModuleDoc(module) {
    const moduleDir = join(this.outputDir, module.category, module.name);
    this.ensureDirectory(moduleDir);
    
    // Load template
    const template = this.loadTemplate('module.md');
    
    // Prepare data
    const data = {
      ...module,
      configSchema: module.getConfigSchema ? JSON.stringify(module.getConfigSchema(), null, 2) : null,
      fileTemplates: module.getFileTemplates ? this.formatFileTemplates(module.getFileTemplates()) : null,
      dependencies: this.formatDependencies(module.dependencies),
      compatibilityInfo: this.getCompatibilityInfo(module),
      examples: await this.loadModuleExamples(module),
      installation: this.getInstallationInstructions(module),
      configuration: this.getConfigurationGuide(module)
    };
    
    // Render template
    const content = this.renderTemplate(template, data);
    
    // Write documentation
    const outputPath = join(moduleDir, 'README.md');
    writeFileSync(outputPath, content);
    
    console.log(chalk.gray(`  📄 Generated: ${module.name}/README.md`));
  }

  /**
   * Generate index page
   */
  async generateIndexPage(modules) {
    const template = this.loadTemplate('index.md');
    
    const categorizedModules = this.categorizeModules(modules);
    const stats = this.registry.getStatistics();
    
    const data = {
      moduleCount: modules.length,
      categoryCount: Object.keys(categorizedModules).length,
      categorizedModules,
      stats,
      lastUpdated: new Date().toISOString()
    };
    
    const content = this.renderTemplate(template, data);
    writeFileSync(join(this.outputDir, 'README.md'), content);
  }

  /**
   * Generate category pages
   */
  async generateCategoryPages() {
    const categories = this.registry.getCategories();
    
    for (const category of categories) {
      const modules = this.registry.getModulesByCategory(category);
      const categoryDir = join(this.outputDir, category);
      this.ensureDirectory(categoryDir);
      
      const template = this.loadTemplate('category.md');
      
      const data = {
        category,
        categoryName: this.getCategoryDisplayName(category),
        modules,
        moduleCount: modules.length,
        description: this.getCategoryDescription(category)
      };
      
      const content = this.renderTemplate(template, data);
      writeFileSync(join(categoryDir, 'README.md'), content);
    }
  }

  /**
   * Generate comparison matrix
   */
  async generateComparisonMatrix(modules) {
    const template = this.loadTemplate('comparison.md');
    
    // Group modules by category for comparison
    const categorizedModules = this.categorizeModules(modules);
    
    // Generate comparison tables
    const comparisons = {};
    for (const [category, categoryModules] of Object.entries(categorizedModules)) {
      comparisons[category] = this.generateComparisonTable(categoryModules);
    }
    
    const data = {
      comparisons,
      lastUpdated: new Date().toISOString()
    };
    
    const content = this.renderTemplate(template, data);
    writeFileSync(join(this.outputDir, 'comparison.md'), content);
  }

  /**
   * Generate API reference
   */
  async generateApiReference(modules) {
    const template = this.loadTemplate('api-reference.md');
    
    const apiData = modules.map(module => ({
      name: module.name,
      category: module.category,
      methods: this.extractModuleMethods(module),
      hooks: this.extractModuleHooks(module),
      configSchema: module.getConfigSchema ? module.getConfigSchema() : null,
      events: this.extractModuleEvents(module)
    }));
    
    const data = {
      modules: apiData,
      lastUpdated: new Date().toISOString()
    };
    
    const content = this.renderTemplate(template, data);
    writeFileSync(join(this.outputDir, 'api-reference.md'), content);
  }

  /**
   * Generate JSON data for programmatic access
   */
  async generateJsonData() {
    const data = this.registry.exportForDocumentation();
    
    const jsonPath = join(this.outputDir, 'modules.json');
    writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    
    console.log(chalk.gray('  📊 Generated: modules.json'));
  }

  /**
   * Load template file
   */
  loadTemplate(filename) {
    const templatePath = join(this.templatesDir, filename);
    
    if (!existsSync(templatePath)) {
      // Return default template if file doesn't exist
      return this.getDefaultTemplate(filename);
    }
    
    return readFileSync(templatePath, 'utf-8');
  }

  /**
   * Get default template
   */
  getDefaultTemplate(filename) {
    const templates = {
      'module.md': `# {{displayName || name}}

{{description}}

## Overview

- **Category**: {{category}}
- **Version**: {{version}}
{{#if author}}- **Author**: {{author.name}}{{/if}}
{{#if tags}}- **Tags**: {{tags.join(', ')}}{{/if}}

## Installation

{{installation}}

## Configuration

{{configuration}}

{{#if configSchema}}
### Configuration Schema

\`\`\`json
{{configSchema}}
\`\`\`
{{/if}}

## Dependencies

{{dependencies}}

## Compatibility

{{compatibilityInfo}}

{{#if examples}}
## Examples

{{examples}}
{{/if}}

## API Reference

{{#if fileTemplates}}
### File Templates

{{fileTemplates}}
{{/if}}

---
*Documentation generated on {{new Date().toLocaleDateString()}}*`,

      'index.md': `# Flow State Dev Modules

Welcome to the Flow State Dev module documentation. This directory contains comprehensive documentation for all available stack modules.

## Overview

- **Total Modules**: {{moduleCount}}
- **Categories**: {{categoryCount}}

## Modules by Category

{{#each categorizedModules}}
### {{@key}}

{{#each this}}
- [{{displayName || name}}](./{{category}}/{{name}}/README.md) - {{description}}
{{/each}}

{{/each}}

## Statistics

- **Recommended Modules**: {{stats.recommended}}
- **Modules with Dependencies**: {{stats.withDependencies}}

## Quick Links

- [Module Comparison Matrix](./comparison.md)
- [API Reference](./api-reference.md)
- [Module Development Guide](./development-guide.md)

---
*Last updated: {{new Date(lastUpdated).toLocaleDateString()}}*`,

      'category.md': `# {{categoryName}}

{{description}}

## Available Modules ({{moduleCount}})

{{#each modules}}
### [{{displayName || name}}](./{{name}}/README.md)

{{description}}

- **Version**: {{version}}
{{#if recommended}}- **⭐ Recommended**{{/if}}
{{#if tags}}- **Tags**: {{tags.join(', ')}}{{/if}}

{{/each}}

## Category Overview

This category contains modules that provide {{category}} functionality for Flow State Dev projects.

---
*Documentation generated on {{new Date().toLocaleDateString()}}*`,

      'comparison.md': `# Module Comparison Matrix

This page provides a detailed comparison of modules within each category.

{{#each comparisons}}
## {{@key}}

{{this}}

{{/each}}

---
*Last updated: {{new Date(lastUpdated).toLocaleDateString()}}*`,

      'api-reference.md': `# API Reference

Complete API reference for all Flow State Dev modules.

{{#each modules}}
## {{name}}

**Category**: {{category}}

{{#if methods}}
### Methods

{{#each methods}}
#### {{name}}({{params}})

{{description}}

{{/each}}
{{/if}}

{{#if hooks}}
### Hooks

{{#each hooks}}
- **{{name}}**: {{description}}
{{/each}}
{{/if}}

{{#if configSchema}}
### Configuration Schema

\`\`\`json
{{json configSchema}}
\`\`\`
{{/if}}

---

{{/each}}

*Last updated: {{new Date(lastUpdated).toLocaleDateString()}}*`
    };
    
    return templates[filename] || '';
  }

  /**
   * Render template with data
   */
  renderTemplate(template, data) {
    // Simple template rendering (replace with proper template engine if needed)
    let content = template;
    
    // Handle simple replacements
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value || '');
    });
    
    // Handle conditionals
    content = content.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, key, block) => {
      return data[key] ? block : '';
    });
    
    // Handle loops
    content = content.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, key, block) => {
      const items = data[key];
      if (!items || !Array.isArray(items) && typeof items !== 'object') return '';
      
      if (Array.isArray(items)) {
        return items.map(item => {
          let itemBlock = block;
          Object.entries(item).forEach(([itemKey, itemValue]) => {
            const itemRegex = new RegExp(`{{${itemKey}}}`, 'g');
            itemBlock = itemBlock.replace(itemRegex, itemValue || '');
          });
          return itemBlock;
        }).join('\n');
      } else {
        return Object.entries(items).map(([key, value]) => {
          let itemBlock = block;
          itemBlock = itemBlock.replace(/{{@key}}/g, key);
          itemBlock = itemBlock.replace(/{{this}}/g, value);
          return itemBlock;
        }).join('\n');
      }
    });
    
    // Handle json helper
    content = content.replace(/{{json (\w+)}}/g, (match, key) => {
      return JSON.stringify(data[key], null, 2);
    });
    
    return content;
  }

  /**
   * Format file templates for documentation
   */
  formatFileTemplates(templates) {
    const lines = ['The module provides the following file templates:\n'];
    
    for (const [path, config] of Object.entries(templates)) {
      lines.push(`- **${path}**`);
      if (config.description) {
        lines.push(`  - ${config.description}`);
      }
      if (config.merge) {
        lines.push(`  - Merge strategy: \`${config.merge}\``);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Format dependencies
   */
  formatDependencies(dependencies) {
    if (!dependencies || Object.keys(dependencies).length === 0) {
      return 'This module has no dependencies.';
    }
    
    const lines = ['### Required Modules\n'];
    
    for (const [name, version] of Object.entries(dependencies)) {
      const depModule = this.registry.getModule(name);
      if (depModule) {
        lines.push(`- **${name}** (${version}) - ${depModule.description}`);
      } else {
        lines.push(`- **${name}** (${version})`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Get compatibility information
   */
  getCompatibilityInfo(module) {
    const lines = [];
    
    if (module.compatible && module.compatible.length > 0) {
      lines.push('### Works Well With\n');
      for (const name of module.compatible) {
        const compatModule = this.registry.getModule(name);
        if (compatModule) {
          lines.push(`- **${name}** - ${compatModule.description}`);
        } else {
          lines.push(`- **${name}**`);
        }
      }
    }
    
    if (module.incompatible && module.incompatible.length > 0) {
      lines.push('\n### Incompatible With\n');
      for (const name of module.incompatible) {
        const incompatModule = this.registry.getModule(name);
        if (incompatModule) {
          lines.push(`- **${name}** - ${incompatModule.description}`);
        } else {
          lines.push(`- **${name}**`);
        }
      }
    }
    
    if (lines.length === 0) {
      return 'This module is compatible with all other modules.';
    }
    
    return lines.join('\n');
  }

  /**
   * Load module examples
   */
  async loadModuleExamples(module) {
    // Check if module has examples directory
    const examplesPath = join(module.path, 'examples');
    
    if (!existsSync(examplesPath)) {
      return null;
    }
    
    // TODO: Load and format examples
    return null;
  }

  /**
   * Get installation instructions
   */
  getInstallationInstructions(module) {
    const lines = [];
    
    lines.push('This module is automatically available when creating a new Flow State Dev project.\n');
    lines.push('### Using with CLI\n');
    lines.push('```bash');
    lines.push('fsd init my-project');
    lines.push(`# Select "${module.displayName || module.name}" when prompted`);
    lines.push('```\n');
    
    lines.push('### Using with Presets\n');
    lines.push('```bash');
    lines.push(`fsd init my-project --modules ${module.name}`);
    lines.push('```');
    
    return lines.join('\n');
  }

  /**
   * Get configuration guide
   */
  getConfigurationGuide(module) {
    const lines = [];
    
    if (module.getConfigOptions) {
      const options = module.getConfigOptions();
      
      lines.push('This module supports the following configuration options:\n');
      
      for (const [key, config] of Object.entries(options)) {
        lines.push(`### ${key}`);
        lines.push(`- **Type**: \`${config.type}\``);
        if (config.default !== undefined) {
          lines.push(`- **Default**: \`${JSON.stringify(config.default)}\``);
        }
        if (config.description) {
          lines.push(`- **Description**: ${config.description}`);
        }
        lines.push('');
      }
    } else {
      lines.push('This module works out of the box with sensible defaults.');
    }
    
    return lines.join('\n');
  }

  /**
   * Extract module methods
   */
  extractModuleMethods(module) {
    // Get public methods from module prototype
    const methods = [];
    const proto = Object.getPrototypeOf(module);
    
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key !== 'constructor' && typeof proto[key] === 'function' && !key.startsWith('_')) {
        methods.push({
          name: key,
          params: this.extractMethodParams(proto[key]),
          description: `Method ${key} of ${module.name} module`
        });
      }
    }
    
    return methods;
  }

  /**
   * Extract method parameters
   */
  extractMethodParams(method) {
    const funcStr = method.toString();
    const match = funcStr.match(/\(([^)]*)\)/);
    return match ? match[1] : '';
  }

  /**
   * Extract module hooks
   */
  extractModuleHooks(module) {
    if (!module.hooks) return [];
    
    return Object.keys(module.hooks).map(name => ({
      name,
      description: `Hook that runs ${name.replace(/([A-Z])/g, ' $1').toLowerCase()}`
    }));
  }

  /**
   * Extract module events
   */
  extractModuleEvents(module) {
    // TODO: Implement event extraction if modules emit events
    return [];
  }

  /**
   * Categorize modules
   */
  categorizeModules(modules) {
    const categorized = {};
    
    for (const module of modules) {
      const category = this.getCategoryDisplayName(module.category);
      
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      categorized[category].push(module);
    }
    
    return categorized;
  }

  /**
   * Generate comparison table
   */
  generateComparisonTable(modules) {
    if (modules.length === 0) return 'No modules in this category.';
    
    const headers = ['Module', 'Version', 'Recommended', 'Dependencies', 'Tags'];
    const rows = modules.map(module => [
      module.displayName || module.name,
      module.version,
      module.recommended ? '✅' : '❌',
      module.dependencies ? Object.keys(module.dependencies).length.toString() : '0',
      module.tags ? module.tags.join(', ') : '-'
    ]);
    
    return this.generateMarkdownTable(headers, rows);
  }

  /**
   * Generate markdown table
   */
  generateMarkdownTable(headers, rows) {
    const lines = [];
    
    // Header row
    lines.push('| ' + headers.join(' | ') + ' |');
    
    // Separator row
    lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');
    
    // Data rows
    for (const row of rows) {
      lines.push('| ' + row.join(' | ') + ' |');
    }
    
    return lines.join('\n');
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category) {
    const names = {
      'frontend-framework': 'Frontend Frameworks',
      'ui-library': 'UI Libraries',
      'backend-service': 'Backend Services',
      'auth-provider': 'Authentication Providers',
      'backend-framework': 'Backend Frameworks',
      'database': 'Databases',
      'deployment': 'Deployment Tools',
      'testing': 'Testing Frameworks',
      'other': 'Other Modules'
    };
    
    return names[category] || category;
  }

  /**
   * Get category description
   */
  getCategoryDescription(category) {
    const descriptions = {
      'frontend-framework': 'Frontend frameworks provide the foundation for building user interfaces. They handle component rendering, state management, and application structure.',
      'ui-library': 'UI libraries offer pre-built components and styling solutions to create beautiful, consistent user interfaces quickly.',
      'backend-service': 'Backend services provide server-side functionality including APIs, serverless functions, and cloud services.',
      'auth-provider': 'Authentication providers handle user identity, authentication, and authorization for your applications.',
      'backend-framework': 'Backend frameworks provide structure and tools for building server-side applications and APIs.',
      'database': 'Database modules integrate various database solutions for data persistence and querying.',
      'deployment': 'Deployment tools help you build, package, and deploy your applications to various platforms.',
      'testing': 'Testing frameworks provide tools for unit testing, integration testing, and end-to-end testing.',
      'other': 'Additional modules that provide various utilities and enhancements.'
    };
    
    return descriptions[category] || `Modules in the ${category} category.`;
  }

  /**
   * Ensure directory exists
   */
  ensureDirectory(dir) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}