/**
 * Base Stack Module for Flow State Dev Modular Architecture
 * 
 * Abstract base class that all stack modules must extend.
 * Provides common functionality for template-based modules that
 * can be combined to create complete project stacks.
 */
import { BaseRetrofitModule } from '../../retrofit-modules/base-module.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class BaseStackModule extends BaseRetrofitModule {
  constructor(name, description, options = {}) {
    super(name, description, options);
    
    // Stack-specific properties
    this.moduleType = options.moduleType || 'generic';
    this.category = options.category || 'other';
    this.templatePath = options.templatePath || null;
    this.compatibleWith = options.compatibleWith || [];
    this.incompatibleWith = options.incompatibleWith || [];
    this.provides = options.provides || [];
    this.requires = options.requires || [];
    this.defaultConfig = options.defaultConfig || {};
    this.mergeStrategies = options.mergeStrategies || {};
    this.setupInstructions = options.setupInstructions || [];
    this.postInstallSteps = options.postInstallSteps || [];
  }

  /**
   * Get module metadata for registry and UI display
   * @returns {Object} Module metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      moduleType: this.moduleType,
      category: this.category,
      provides: this.provides,
      requires: this.requires,
      compatibleWith: this.compatibleWith,
      incompatibleWith: this.incompatibleWith,
      author: this.author || 'Flow State Dev',
      keywords: this.keywords || [],
      homepage: this.homepage || null,
      repository: this.repository || null
    };
  }

  /**
   * Check compatibility with other modules
   * @param {Array} otherModules - Other selected modules
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const issues = [];
    const warnings = [];

    // Check for incompatible modules
    for (const module of otherModules) {
      if (this.incompatibleWith.includes(module.name)) {
        issues.push({
          type: 'incompatible',
          module: module.name,
          message: `${this.name} is incompatible with ${module.name}`
        });
      }
    }

    // Check for required dependencies
    for (const requirement of this.requires) {
      const found = otherModules.some(m => 
        m.provides.includes(requirement) || m.moduleType === requirement
      );
      
      if (!found) {
        issues.push({
          type: 'missing-requirement',
          requirement,
          message: `${this.name} requires ${requirement} but none selected`
        });
      }
    }

    // Check for recommended modules
    for (const compatible of this.compatibleWith) {
      const found = otherModules.some(m => m.name === compatible);
      if (!found) {
        warnings.push({
          type: 'recommended',
          module: compatible,
          message: `${compatible} is recommended with ${this.name}`
        });
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Get the module's template files
   * @returns {Object} Template file information
   */
  async getTemplateFiles() {
    if (!this.templatePath) {
      return { files: [], directories: [] };
    }

    const templateDir = path.isAbsolute(this.templatePath) 
      ? this.templatePath 
      : path.join(process.cwd(), this.templatePath);

    if (!await fs.pathExists(templateDir)) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    const files = [];
    const directories = new Set();

    const scanDir = async (dir, basePath = '') => {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          directories.add(relativePath);
          await scanDir(fullPath, relativePath);
        } else {
          files.push({
            path: relativePath,
            absolute: fullPath,
            size: stat.size,
            isTemplate: this.isTemplateFile(relativePath)
          });
        }
      }
    };

    await scanDir(templateDir);

    return {
      files,
      directories: Array.from(directories)
    };
  }

  /**
   * Check if a file should be processed as a template
   * @param {string} filePath - File path to check
   * @returns {boolean} Whether file is a template
   */
  isTemplateFile(filePath) {
    const templateExtensions = ['.md', '.json', '.js', '.ts', '.vue', '.jsx', '.tsx', '.html', '.css', '.yml', '.yaml'];
    const ext = path.extname(filePath).toLowerCase();
    return templateExtensions.includes(ext);
  }

  /**
   * Get merge strategy for a specific file
   * @param {string} filePath - File path
   * @returns {string} Merge strategy
   */
  getMergeStrategy(filePath) {
    // Check specific merge strategies first
    for (const [pattern, strategy] of Object.entries(this.mergeStrategies)) {
      if (this.matchesPattern(filePath, pattern)) {
        return strategy;
      }
    }

    // Default strategies by file type
    const basename = path.basename(filePath);
    
    if (basename === 'package.json') return 'merge-json';
    if (basename === 'tsconfig.json') return 'merge-json';
    if (basename === '.gitignore') return 'append-unique';
    if (basename === '.env.example') return 'append-unique';
    if (basename === 'README.md') return 'replace';
    if (filePath.includes('router')) return 'merge-routes';
    if (filePath.includes('store')) return 'merge-stores';
    
    // Default strategy
    return 'replace';
  }

  /**
   * Check if a file path matches a pattern
   * @param {string} filePath - File path to check
   * @param {string} pattern - Pattern to match (glob-like)
   * @returns {boolean} Whether path matches pattern
   */
  matchesPattern(filePath, pattern) {
    // Simple glob matching
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\//g, '\\/');
    
    return new RegExp(`^${regex}$`).test(filePath);
  }

  /**
   * Get configuration options for this module
   * @returns {Object} Configuration schema
   */
  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        ...this.defaultConfig,
        enabled: {
          type: 'boolean',
          description: `Enable ${this.name} module`,
          default: true
        }
      }
    };
  }

  /**
   * Transform template variables in content
   * @param {string} content - Template content
   * @param {Object} variables - Variables to substitute
   * @returns {string} Transformed content
   */
  transformTemplate(content, variables) {
    let result = content;
    
    // Standard variables
    const standardVars = {
      PROJECT_NAME: variables.projectName || 'my-app',
      PROJECT_DESCRIPTION: variables.projectDescription || '',
      AUTHOR_NAME: variables.authorName || '',
      AUTHOR_EMAIL: variables.authorEmail || '',
      MODULE_NAME: this.name,
      CURRENT_YEAR: new Date().getFullYear()
    };

    // Merge with custom variables
    const allVars = { ...standardVars, ...variables };

    // Replace template variables
    for (const [key, value] of Object.entries(allVars)) {
      const patterns = [
        new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'),  // {{VAR}}
        new RegExp(`\\[${key}\\]`, 'g'),                 // [VAR]
        new RegExp(`__${key}__`, 'g')                    // __VAR__
      ];
      
      patterns.forEach(pattern => {
        result = result.replace(pattern, value);
      });
    }

    return result;
  }

  /**
   * Get post-installation instructions
   * @param {Object} context - Installation context
   * @returns {Array} Instructions to display
   */
  getPostInstallInstructions(context) {
    const instructions = [...this.setupInstructions];
    
    // Add module-specific instructions
    if (this.postInstallSteps.length > 0) {
      instructions.push('', `${chalk.blue(this.name)} Setup:`, '');
      instructions.push(...this.postInstallSteps);
    }

    return instructions;
  }

  /**
   * Validate module configuration
   * @param {Object} config - Module configuration
   * @returns {Object} Validation result
   */
  validateConfig(config) {
    const errors = [];
    const warnings = [];

    // Validate against schema
    const schema = this.getConfigSchema();
    
    // Basic validation (can be enhanced with a proper JSON schema validator)
    for (const [key, spec] of Object.entries(schema.properties || {})) {
      const value = config[key];
      
      if (spec.required && value === undefined) {
        errors.push(`Missing required configuration: ${key}`);
      }
      
      if (value !== undefined && spec.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== spec.type) {
          errors.push(`Invalid type for ${key}: expected ${spec.type}, got ${actualType}`);
        }
      }
      
      if (spec.enum && value !== undefined && !spec.enum.includes(value)) {
        errors.push(`Invalid value for ${key}: must be one of ${spec.enum.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Abstract method - must be implemented by subclasses
   * Check if this module can be applied to the project
   * @param {Object} projectAnalysis - Project analysis results
   * @returns {Object} Application result
   */
  async canApply(projectAnalysis) {
    // For new projects, stack modules can always be applied
    if (!projectAnalysis || projectAnalysis.isNewProject) {
      return { canApply: true };
    }

    // For existing projects, check if already has this module type
    if (this.moduleType && projectAnalysis[this.moduleType]) {
      return {
        canApply: false,
        reason: `Project already has a ${this.moduleType}`
      };
    }

    return { canApply: true };
  }

  /**
   * Format module display for CLI
   * @param {Object} options - Display options
   * @returns {string} Formatted display string
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = selected 
      ? chalk.green(`✓ ${this.name}`)
      : `  ${this.name}`;
    
    display += chalk.gray(` - ${this.description}`);
    
    if (showDetails) {
      display += '\n';
      if (this.provides.length > 0) {
        display += chalk.gray(`    Provides: ${this.provides.join(', ')}\n`);
      }
      if (this.requires.length > 0) {
        display += chalk.yellow(`    Requires: ${this.requires.join(', ')}\n`);
      }
    }
    
    return display;
  }
}