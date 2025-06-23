/**
 * Base Feature Module for Flow State Dev Retrofit System
 * 
 * Abstract base class that all retrofit modules must extend.
 * Provides common functionality and enforces interface contracts.
 */
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class BaseRetrofitModule {
  constructor(name, description, options = {}) {
    this.name = name;
    this.description = description;
    this.version = options.version || '1.0.0';
    this.priority = options.priority || 'medium';
    this.dependencies = options.dependencies || [];
    this.conflicts = options.conflicts || [];
    this.sinceVersion = options.sinceVersion || '0.1.0';
    this.impact = options.impact || 'medium'; // low, medium, high
  }

  /**
   * Check if this module can be applied to the project
   * Must be implemented by subclasses
   * @param {Object} projectAnalysis - Results from ProjectAnalyzer
   * @returns {Object} { canApply: boolean, reason?: string, requirements?: Array }
   */
  async canApply(projectAnalysis) {
    throw new Error('canApply() must be implemented by subclass');
  }

  /**
   * Preview what changes this module would make
   * Must be implemented by subclasses
   * @param {string} projectPath - Path to project
   * @param {Object} projectAnalysis - Analysis results
   * @returns {Object} { files: Array, modifications: Array, warnings: Array }
   */
  async previewChanges(projectPath, projectAnalysis) {
    throw new Error('previewChanges() must be implemented by subclass');
  }

  /**
   * Apply this module's changes to the project
   * Must be implemented by subclasses
   * @param {string} projectPath - Path to project
   * @param {Object} projectAnalysis - Analysis results
   * @param {Object} options - Module-specific options
   * @returns {Object} { success: boolean, changes: Array, errors?: Array }
   */
  async applyFeature(projectPath, projectAnalysis, options = {}) {
    throw new Error('applyFeature() must be implemented by subclass');
  }

  /**
   * Validate that the module was applied correctly
   * Can be overridden by subclasses for custom validation
   * @param {string} projectPath - Path to project
   * @returns {Object} { valid: boolean, issues?: Array }
   */
  async validateApplication(projectPath) {
    const preview = await this.previewChanges(projectPath, null);
    const issues = [];
    
    // Check that expected files were created
    for (const file of preview.files || []) {
      const filePath = path.join(projectPath, file.path);
      if (!fs.existsSync(filePath)) {
        issues.push(`Expected file not found: ${file.path}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  /**
   * Get configuration schema for this module
   * Can be overridden by subclasses
   * @returns {Object} JSON schema for module configuration
   */
  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          description: `Enable ${this.name} module`,
          default: true
        }
      }
    };
  }

  /**
   * Get user-friendly information about this module
   * @returns {Object} Module information for display
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      priority: this.priority,
      impact: this.impact,
      sinceVersion: this.sinceVersion,
      dependencies: this.dependencies,
      conflicts: this.conflicts
    };
  }

  // Helper methods for common operations

  /**
   * Safely copy template files to project
   * @param {string} templateDir - Source template directory
   * @param {string} projectPath - Target project directory
   * @param {Object} options - Copy options
   */
  async copyTemplateFiles(templateDir, projectPath, options = {}) {
    const { overwrite = false, transform = null } = options;
    
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    const results = {
      copied: [],
      skipped: [],
      errors: []
    };

    const copyRecursive = async (srcDir, destDir) => {
      const items = await fs.readdir(srcDir);
      
      for (const item of items) {
        const srcPath = path.join(srcDir, item);
        const destPath = path.join(destDir, item);
        const stat = await fs.stat(srcPath);
        
        if (stat.isDirectory()) {
          await fs.ensureDir(destPath);
          await copyRecursive(srcPath, destPath);
        } else {
          // Check if file already exists
          if (fs.existsSync(destPath) && !overwrite) {
            results.skipped.push(path.relative(projectPath, destPath));
            continue;
          }
          
          try {
            await fs.ensureDir(path.dirname(destPath));
            
            if (transform && this.shouldTransformFile(srcPath)) {
              // Apply transformations to template
              let content = await fs.readFile(srcPath, 'utf8');
              content = await transform(content, srcPath, destPath);
              await fs.writeFile(destPath, content);
            } else {
              // Direct copy
              await fs.copy(srcPath, destPath);
            }
            
            results.copied.push(path.relative(projectPath, destPath));
          } catch (error) {
            results.errors.push({
              file: path.relative(projectPath, destPath),
              error: error.message
            });
          }
        }
      }
    };

    await copyRecursive(templateDir, projectPath);
    return results;
  }

  /**
   * Check if a file should be transformed during copy
   * @param {string} filePath - File path to check
   * @returns {boolean} Whether to apply transformations
   */
  shouldTransformFile(filePath) {
    const transformableExtensions = ['.md', '.json', '.js', '.ts', '.vue', '.html', '.css'];
    return transformableExtensions.includes(path.extname(filePath));
  }

  /**
   * Apply template variable substitutions
   * @param {string} content - Template content
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed content
   */
  applyTemplateVariables(content, variables) {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  /**
   * Safely modify an existing file
   * @param {string} filePath - Path to file to modify
   * @param {Function} modifier - Function that takes content and returns modified content
   * @param {Object} options - Modification options
   */
  async modifyFile(filePath, modifier, options = {}) {
    const { backup = true, encoding = 'utf8' } = options;
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Create backup if requested
    if (backup) {
      const backupPath = `${filePath}.bak`;
      await fs.copy(filePath, backupPath);
    }

    try {
      const originalContent = await fs.readFile(filePath, encoding);
      const modifiedContent = await modifier(originalContent);
      
      if (originalContent !== modifiedContent) {
        await fs.writeFile(filePath, modifiedContent, encoding);
        return { modified: true, backup: backup ? `${filePath}.bak` : null };
      }
      
      return { modified: false };
    } catch (error) {
      // Restore from backup if modification failed
      if (backup && fs.existsSync(`${filePath}.bak`)) {
        await fs.copy(`${filePath}.bak`, filePath);
        await fs.remove(`${filePath}.bak`);
      }
      throw error;
    }
  }

  /**
   * Add content to a file without overwriting
   * @param {string} filePath - Path to file
   * @param {string} content - Content to add
   * @param {Object} options - Add options
   */
  async addToFile(filePath, content, options = {}) {
    const { position = 'end', marker = null, unique = true } = options;
    
    let existingContent = '';
    if (fs.existsSync(filePath)) {
      existingContent = await fs.readFile(filePath, 'utf8');
    }

    // Check if content already exists (if unique is true)
    if (unique && existingContent.includes(content.trim())) {
      return { added: false, reason: 'Content already exists' };
    }

    let newContent;
    if (position === 'start') {
      newContent = content + '\n' + existingContent;
    } else if (marker && existingContent.includes(marker)) {
      // Insert after marker
      newContent = existingContent.replace(marker, marker + '\n' + content);
    } else {
      // Append to end
      newContent = existingContent + (existingContent ? '\n' : '') + content;
    }

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, newContent);
    
    return { added: true };
  }

  /**
   * Format module status for display
   * @param {string} status - Current status
   * @param {string} message - Status message
   * @returns {string} Formatted status line
   */
  formatStatus(status, message = '') {
    const statusColors = {
      checking: chalk.blue,
      applicable: chalk.green,
      'not-applicable': chalk.gray,
      warning: chalk.yellow,
      error: chalk.red,
      applied: chalk.green,
      skipped: chalk.gray
    };

    const statusSymbols = {
      checking: '🔍',
      applicable: '✅',
      'not-applicable': '⏭️',
      warning: '⚠️',
      error: '❌',
      applied: '✅',
      skipped: '⏭️'
    };

    const color = statusColors[status] || chalk.white;
    const symbol = statusSymbols[status] || '•';
    
    return color(`${symbol} ${this.name}${message ? ': ' + message : ''}`);
  }
}

/**
 * Module registry for managing retrofit modules
 */
export class RetrofitModuleRegistry {
  constructor() {
    this.modules = new Map();
  }

  /**
   * Register a retrofit module
   * @param {BaseRetrofitModule} module - Module to register
   */
  register(module) {
    if (!(module instanceof BaseRetrofitModule)) {
      throw new Error('Module must extend BaseRetrofitModule');
    }
    
    this.modules.set(module.name, module);
  }

  /**
   * Get a registered module by name
   * @param {string} name - Module name
   * @returns {BaseRetrofitModule} Module instance
   */
  get(name) {
    return this.modules.get(name);
  }

  /**
   * Get all registered modules
   * @returns {Array} Array of modules
   */
  getAll() {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules applicable to a project
   * @param {Object} projectAnalysis - Project analysis results
   * @returns {Array} Array of applicable modules
   */
  async getApplicableModules(projectAnalysis) {
    const applicable = [];
    
    for (const module of this.modules.values()) {
      const canApply = await module.canApply(projectAnalysis);
      if (canApply.canApply) {
        applicable.push(module);
      }
    }
    
    return applicable;
  }

  /**
   * Sort modules by priority and dependencies
   * @param {Array} modules - Modules to sort
   * @returns {Array} Sorted modules
   */
  sortByDependencies(modules) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    
    const visit = (module) => {
      if (visiting.has(module.name)) {
        throw new Error(`Circular dependency detected: ${module.name}`);
      }
      
      if (visited.has(module.name)) {
        return;
      }
      
      visiting.add(module.name);
      
      // Visit dependencies first
      for (const depName of module.dependencies) {
        const dep = this.modules.get(depName);
        if (dep && modules.includes(dep)) {
          visit(dep);
        }
      }
      
      visiting.delete(module.name);
      visited.add(module.name);
      sorted.push(module);
    };
    
    for (const module of modules) {
      visit(module);
    }
    
    return sorted;
  }
}