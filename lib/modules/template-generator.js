/**
 * Template Generator for Modular Stacks
 * 
 * Sophisticated template generation engine that merges multiple module templates
 * intelligently to produce a cohesive project structure.
 */
import { readFile, writeFile, ensureDir, pathExists, copy } from 'fs-extra';
import { join, dirname, relative } from 'path';
import { glob } from 'glob';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { performanceMonitor } from '../performance/monitor.js';
import { MergeStrategies } from './merge-strategies.js';
import { ConflictResolver } from './conflict-resolver.js';

export class TemplateGenerator {
  constructor() {
    this.templates = new Map();
    this.conflicts = [];
    this.mergedFiles = new Map();
    this.variables = {};
    this.conflictResolver = new ConflictResolver();
    
    // Register Handlebars helpers
    this.registerHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  registerHelpers() {
    // Conditional helper for module checks
    Handlebars.registerHelper('ifModule', function(moduleName, options) {
      const hasModule = this.modules && this.modules[moduleName];
      return hasModule ? options.fn(this) : options.inverse(this);
    });

    // Get module property
    Handlebars.registerHelper('moduleProperty', function(moduleName, property) {
      if (this.modules && this.modules[moduleName]) {
        return this.modules[moduleName][property];
      }
      return '';
    });

    // Module type check
    Handlebars.registerHelper('ifModuleType', function(moduleType, options) {
      const hasType = this.modules && Object.values(this.modules).some(
        m => m.moduleType === moduleType
      );
      return hasType ? options.fn(this) : options.inverse(this);
    });

    // Get module by type
    Handlebars.registerHelper('moduleByType', function(moduleType, property) {
      if (this.modules) {
        const module = Object.values(this.modules).find(
          m => m.moduleType === moduleType
        );
        return module ? (property ? module[property] : module.name) : '';
      }
      return '';
    });

    // Case conversion helpers
    Handlebars.registerHelper('camelCase', str => 
      str.replace(/-([a-z])/g, g => g[1].toUpperCase())
    );
    
    Handlebars.registerHelper('pascalCase', str => 
      str.replace(/(^|-)([a-z])/g, g => g[g.length - 1].toUpperCase())
    );
    
    Handlebars.registerHelper('kebabCase', str => 
      str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    );
    
    Handlebars.registerHelper('snakeCase', str => 
      str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
    );

    // String helpers
    Handlebars.registerHelper('capitalize', str => 
      str.charAt(0).toUpperCase() + str.slice(1)
    );
    
    Handlebars.registerHelper('lowercase', str => str.toLowerCase());
    Handlebars.registerHelper('uppercase', str => str.toUpperCase());

    // JSON helpers
    Handlebars.registerHelper('json', function(context) {
      return JSON.stringify(context, null, 2);
    });
    
    Handlebars.registerHelper('jsonInline', function(context) {
      return JSON.stringify(context);
    });

    // Comparison helpers
    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('ne', (a, b) => a !== b);
    Handlebars.registerHelper('lt', (a, b) => a < b);
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('lte', (a, b) => a <= b);
    Handlebars.registerHelper('gte', (a, b) => a >= b);

    // Array helpers
    Handlebars.registerHelper('includes', (arr, value) => 
      Array.isArray(arr) && arr.includes(value)
    );
    
    Handlebars.registerHelper('join', (arr, separator = ', ') => 
      Array.isArray(arr) ? arr.join(separator) : ''
    );

    // Logic helpers
    Handlebars.registerHelper('and', function() {
      const args = Array.prototype.slice.call(arguments, 0, -1);
      return args.every(Boolean);
    });
    
    Handlebars.registerHelper('or', function() {
      const args = Array.prototype.slice.call(arguments, 0, -1);
      return args.some(Boolean);
    });
    
    Handlebars.registerHelper('not', value => !value);

    // Date/time helpers
    Handlebars.registerHelper('year', () => new Date().getFullYear());
    Handlebars.registerHelper('date', () => new Date().toISOString().split('T')[0]);
    Handlebars.registerHelper('timestamp', () => new Date().toISOString());
  }

  /**
   * Generate a project from selected modules
   */
  async generate(options) {
    const startTime = performance.now();
    
    const {
      modules = [],
      projectPath,
      projectName,
      variables = {},
      interactive = false
    } = options;

    try {
      // Reset state
      this.conflicts = [];
      this.mergedFiles.clear();
      this.templates.clear();
      
      // Set up variables
      this.variables = {
        projectName,
        projectVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        ...variables,
        modules: this.createModuleMap(modules)
      };

      // Ensure project directory exists
      await ensureDir(projectPath);

      // Load all module templates
      console.log(chalk.gray('Loading module templates...'));
      await this.loadModuleTemplates(modules);

      // Process templates in priority order
      console.log(chalk.gray('Processing templates...'));
      const generatedFiles = await this.processTemplates(projectPath, interactive);

      // Handle conflicts
      if (this.conflicts.length > 0 && !interactive) {
        console.warn(chalk.yellow(`⚠️  ${this.conflicts.length} conflicts detected`));
      }

      const duration = performance.now() - startTime;
      performanceMonitor.trackCommandExecution('template-generation', duration, {
        moduleCount: modules.length,
        fileCount: generatedFiles.length,
        conflictCount: this.conflicts.length
      });

      console.log(chalk.green(`✅ Generated ${generatedFiles.length} files in ${duration.toFixed(2)}ms`));

      return {
        success: true,
        generated: generatedFiles,
        conflicts: this.conflicts,
        duration
      };
    } catch (error) {
      console.error(chalk.red('Template generation failed:'), error.message);
      throw error;
    }
  }

  /**
   * Create module map for template variables
   */
  createModuleMap(modules) {
    const moduleMap = {};
    
    for (const module of modules) {
      moduleMap[module.name] = {
        name: module.name,
        version: module.version,
        displayName: module.displayName,
        config: module.config || {},
        ...module.metadata || {}
      };
      
      // Also map by type for convenience
      if (module.moduleType) {
        moduleMap[module.moduleType] = moduleMap[module.name];
      }
    }
    
    return moduleMap;
  }

  /**
   * Load templates from all modules
   */
  async loadModuleTemplates(modules) {
    for (const module of modules) {
      if (!module.templatePath) continue;
      
      const templatePath = module.templatePath;
      if (!await pathExists(templatePath)) {
        console.warn(chalk.yellow(`Template path not found for ${module.name}: ${templatePath}`));
        continue;
      }

      // Find all template files
      const pattern = join(templatePath, '**/*.template');
      const templateFiles = await glob(pattern);
      
      for (const templateFile of templateFiles) {
        const relativePath = relative(templatePath, templateFile);
        const targetPath = relativePath.replace(/\.template$/, '');
        
        const content = await readFile(templateFile, 'utf-8');
        const priority = module.priority || 50;
        
        // Store template with metadata
        const key = targetPath;
        if (!this.templates.has(key)) {
          this.templates.set(key, []);
        }
        
        this.templates.get(key).push({
          module: module.name,
          content,
          priority,
          mergeStrategy: await this.getMergeStrategy(module, targetPath)
        });
      }
    }
  }

  /**
   * Get merge strategy for a file
   */
  async getMergeStrategy(module, filePath) {
    // Check if module defines custom merge strategies
    if (module.mergeStrategies && module.mergeStrategies[filePath]) {
      return module.mergeStrategies[filePath];
    }

    // Default strategies based on file type
    const fileName = filePath.split('/').pop();
    
    if (fileName === 'package.json') {
      return { strategy: 'merge', type: 'package.json' };
    } else if (fileName === '.env' || fileName === '.env.example') {
      return { strategy: 'append', unique: true };
    } else if (fileName.endsWith('.json')) {
      return { strategy: 'merge', type: 'json' };
    } else if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
      return { strategy: 'merge', type: 'yaml' };
    } else if (fileName === '.gitignore') {
      return { strategy: 'append', unique: true };
    }
    
    // Default to replace
    return { strategy: 'replace' };
  }

  /**
   * Process all templates and generate files
   */
  async processTemplates(projectPath, interactive) {
    const generatedFiles = [];
    
    for (const [filePath, templates] of this.templates.entries()) {
      // Sort by priority (higher priority wins)
      templates.sort((a, b) => b.priority - a.priority);
      
      // Process the file
      const result = await this.processFile(filePath, templates, projectPath, interactive);
      
      if (result.generated) {
        generatedFiles.push(result.path);
      }
    }
    
    return generatedFiles;
  }

  /**
   * Process a single file with potentially multiple templates
   */
  async processFile(filePath, templates, projectPath, interactive) {
    const fullPath = join(projectPath, filePath);
    
    if (templates.length === 1) {
      // No conflict, just process
      const content = await this.renderTemplate(templates[0].content);
      await this.writeFile(fullPath, content);
      return { generated: true, path: filePath };
    }
    
    // Multiple templates for same file - need to merge or resolve
    const result = await this.resolveFileConflict(filePath, templates, interactive);
    
    if (result.conflict) {
      this.conflicts.push({
        file: filePath,
        modules: templates.map(t => t.module),
        resolution: result.resolution
      });
    }
    
    if (result.content) {
      await this.writeFile(fullPath, result.content);
      return { generated: true, path: filePath };
    }
    
    return { generated: false };
  }

  /**
   * Resolve conflicts between multiple templates for the same file
   */
  async resolveFileConflict(filePath, templates, interactive) {
    // Use conflict resolver
    const resolution = await this.conflictResolver.resolve(filePath, templates, {
      strategy: interactive ? 'interactive' : 'priority',
      interactive
    });
    
    // Handle merge resolution
    if (resolution.merge && this.canMerge(templates)) {
      const merged = await this.mergeTemplates(templates);
      return { content: merged, conflict: false };
    }
    
    // Handle skip resolution
    if (!resolution.template) {
      return { content: null, conflict: true, resolution: resolution.resolution };
    }
    
    // Handle single template resolution
    const content = await this.renderTemplate(resolution.template.content);
    return {
      content,
      conflict: resolution.conflict,
      resolution: resolution.resolution
    };
  }

  /**
   * Check if templates can be merged
   */
  canMerge(templates) {
    const strategies = templates.map(t => t.mergeStrategy.strategy);
    
    // All must have merge strategy
    if (!strategies.every(s => s === 'merge' || s === 'append')) {
      return false;
    }
    
    // Check if types are compatible
    const types = templates.map(t => t.mergeStrategy.type).filter(Boolean);
    if (types.length > 0 && !types.every(t => t === types[0])) {
      return false;
    }
    
    return true;
  }

  /**
   * Merge multiple templates using appropriate strategy
   */
  async mergeTemplates(templates) {
    const strategy = templates[0].mergeStrategy.strategy;
    const type = templates[0].mergeStrategy.type;
    
    // Determine the merge function to use
    let mergeFunction;
    if (type === 'package.json') {
      mergeFunction = MergeStrategies.mergePackageJson;
    } else if (type === 'yaml') {
      mergeFunction = MergeStrategies.mergeYaml;
    } else if (strategy === 'merge-env') {
      mergeFunction = MergeStrategies.mergeEnv;
    } else {
      mergeFunction = MergeStrategies.getStrategy(strategy);
    }
    
    // Apply the merge strategy
    return await mergeFunction(
      templates, 
      content => this.renderTemplate(content),
      templates[0].mergeStrategy
    );
  }


  /**
   * Render template with variables
   */
  async renderTemplate(content) {
    try {
      const template = Handlebars.compile(content);
      return template(this.variables);
    } catch (error) {
      console.error(chalk.red('Template rendering error:'), error.message);
      return content; // Return raw content on error
    }
  }

  /**
   * Write file with directory creation
   */
  async writeFile(filePath, content) {
    await ensureDir(dirname(filePath));
    await writeFile(filePath, content);
  }

  /**
   * Copy static files from module
   */
  async copyStaticFiles(module, projectPath) {
    if (!module.staticPath) return;
    
    const staticPath = module.staticPath;
    if (!await pathExists(staticPath)) return;
    
    await copy(staticPath, projectPath, {
      overwrite: false, // Don't overwrite existing files
      filter: (src) => !src.endsWith('.template')
    });
  }
}