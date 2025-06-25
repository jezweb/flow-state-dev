/**
 * Module Validator - Validates module structure and configuration
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import chalk from 'chalk';

export class ModuleValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.setupSchemas();
  }

  /**
   * Setup validation schemas
   */
  setupSchemas() {
    // Base module schema
    this.moduleSchema = {
      type: 'object',
      required: ['name', 'version', 'description', 'category'],
      properties: {
        name: {
          type: 'string',
          pattern: '^[a-z0-9-]+$',
          minLength: 2,
          maxLength: 50
        },
        displayName: {
          type: 'string',
          minLength: 2,
          maxLength: 100
        },
        version: {
          type: 'string',
          pattern: '^\\d+\\.\\d+\\.\\d+$'
        },
        description: {
          type: 'string',
          minLength: 10,
          maxLength: 500
        },
        category: {
          type: 'string',
          enum: [
            'frontend-framework',
            'ui-library',
            'backend-service',
            'auth-provider',
            'backend-framework',
            'database',
            'state-management',
            'deployment',
            'testing',
            'other'
          ]
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 2,
            maxLength: 30
          }
        },
        author: {
          oneOf: [
            { type: 'string' },
            {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                url: { type: 'string', format: 'uri' }
              }
            }
          ]
        },
        repository: {
          type: 'string',
          format: 'uri'
        },
        homepage: {
          type: 'string',
          format: 'uri'
        },
        dependencies: {
          oneOf: [
            { 
              type: 'array',
              items: { type: 'string' }
            },
            {
              type: 'object',
              additionalProperties: {
                type: 'string'
              }
            }
          ]
        },
        peerDependencies: {
          type: 'object',
          additionalProperties: {
            type: 'string'
          }
        },
        compatible: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        incompatible: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        recommended: {
          type: 'boolean'
        },
        experimental: {
          type: 'boolean'
        },
        deprecated: {
          type: 'boolean'
        }
      }
    };

    // Compile schema
    this.validateModule = this.ajv.compile(this.moduleSchema);
  }

  /**
   * Validate a module
   */
  async validate(module) {
    const errors = [];
    const warnings = [];
    
    // Validate basic structure
    if (!this.validateModule(module)) {
      errors.push(...this.formatAjvErrors(this.validateModule.errors));
    }
    
    // Validate module methods (only if it's a class-based module)
    if (module.constructor && module.constructor.name !== 'Object') {
      const requiredMethods = ['getName', 'getDescription', 'getFileTemplates'];
      for (const method of requiredMethods) {
        if (typeof module[method] !== 'function') {
          errors.push(`Missing required method: ${method}`);
        }
      }
    }
    
    // Validate dependencies exist
    if (module.dependencies) {
      for (const [depName, depVersion] of Object.entries(module.dependencies)) {
        // Version format check
        if (!this.isValidVersionSpec(depVersion)) {
          warnings.push(`Invalid version specification for dependency ${depName}: ${depVersion}`);
        }
      }
    }
    
    // Validate configuration schema if provided
    if (module.getConfigSchema && typeof module.getConfigSchema === 'function') {
      try {
        const schema = module.getConfigSchema();
        if (!this.isValidJsonSchema(schema)) {
          warnings.push('Module configuration schema is invalid');
        }
      } catch (error) {
        warnings.push(`Error getting config schema: ${error.message}`);
      }
    }
    
    // Check for security issues
    const securityIssues = await this.checkSecurity(module);
    if (securityIssues.length > 0) {
      errors.push(...securityIssues);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Format AJV validation errors
   */
  formatAjvErrors(errors) {
    return errors.map(error => {
      const field = error.instancePath.replace(/^\//, '') || 'root';
      return `${field}: ${error.message}`;
    });
  }

  /**
   * Check if version specification is valid
   */
  isValidVersionSpec(version) {
    // Simple check for common version patterns
    const patterns = [
      /^\d+\.\d+\.\d+$/,           // Exact version
      /^\^\d+\.\d+\.\d+$/,         // Caret range
      /^~\d+\.\d+\.\d+$/,          // Tilde range
      /^>=?\d+\.\d+\.\d+$/,        // Greater than
      /^<=?\d+\.\d+\.\d+$/,        // Less than
      /^\d+\.x$/,                  // Major version
      /^\d+\.\d+\.x$/,             // Minor version
      /^\*$/                       // Any version
    ];
    
    return patterns.some(pattern => pattern.test(version));
  }

  /**
   * Validate JSON Schema
   */
  isValidJsonSchema(schema) {
    try {
      this.ajv.compile(schema);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check for security issues
   */
  async checkSecurity(module) {
    const issues = [];
    
    // Check for suspicious patterns in templates
    if (module.getFileTemplates && typeof module.getFileTemplates === 'function') {
      try {
        const templates = module.getFileTemplates();
        
        // Check for dangerous patterns
        const dangerousPatterns = [
          /eval\s*\(/,
          /new\s+Function\s*\(/,
          /require\s*\(\s*[^'"]/,  // Dynamic require
          /__dirname\s*\+[^\/]/,   // Path traversal
          /process\.env\.(PASSWORD|SECRET|KEY)/i
        ];
        
        for (const [file, config] of Object.entries(templates)) {
          if (config.content) {
            for (const pattern of dangerousPatterns) {
              if (pattern.test(config.content)) {
                issues.push(`Potentially dangerous pattern found in template ${file}`);
              }
            }
          }
        }
      } catch (error) {
        // Ignore errors in template checking
      }
    }
    
    // Check for suspicious module names
    const suspiciousNames = ['eval', 'exec', 'shell', 'cmd', 'backdoor'];
    if (suspiciousNames.some(name => module.name.includes(name))) {
      issues.push(`Module name '${module.name}' contains suspicious keywords`);
    }
    
    return issues;
  }

  /**
   * Validate module compatibility
   */
  validateCompatibility(module, otherModules) {
    const issues = [];
    
    // Check for circular dependencies
    const visited = new Set();
    const checkCircular = (mod, path = []) => {
      if (visited.has(mod.name)) {
        if (path.includes(mod.name)) {
          issues.push(`Circular dependency detected: ${path.join(' -> ')} -> ${mod.name}`);
        }
        return;
      }
      
      visited.add(mod.name);
      path.push(mod.name);
      
      if (mod.dependencies) {
        for (const depName of Object.keys(mod.dependencies)) {
          const depModule = otherModules.find(m => m.name === depName);
          if (depModule) {
            checkCircular(depModule, [...path]);
          }
        }
      }
    };
    
    checkCircular(module);
    
    // Check incompatible modules
    if (module.incompatible) {
      for (const incompatName of module.incompatible) {
        if (otherModules.some(m => m.name === incompatName)) {
          issues.push(`Module is incompatible with ${incompatName}`);
        }
      }
    }
    
    return issues;
  }

  /**
   * Get validation report
   */
  getValidationReport(results) {
    const report = {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      errors: results.reduce((sum, r) => sum + r.errors.length, 0)
    };
    
    report.successRate = (report.valid / report.total * 100).toFixed(1) + '%';
    
    return report;
  }
}