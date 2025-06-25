/**
 * File Merge Strategies for Template Generator
 * 
 * Defines how to merge files when multiple modules provide the same file
 */
import chalk from 'chalk';

export class MergeStrategies {
  /**
   * Replace strategy - use the highest priority template
   */
  static replace(templates, render) {
    return render(templates[0].content);
  }

  /**
   * Append strategy - concatenate all templates
   */
  static async append(templates, render, options = {}) {
    const contents = await Promise.all(
      templates.map(t => render(t.content))
    );
    
    if (options.unique) {
      // Remove duplicate lines
      const lines = contents.join('\n').split('\n');
      const unique = [...new Set(lines)];
      return unique.join('\n');
    }
    
    return contents.join('\n');
  }

  /**
   * Prepend strategy - add to beginning
   */
  static async prepend(templates, render) {
    const contents = await Promise.all(
      templates.map(t => render(t.content))
    );
    
    // Reverse order so highest priority is first
    return contents.reverse().join('\n');
  }

  /**
   * Merge JSON files intelligently
   */
  static async mergeJson(templates, render) {
    const rendered = await Promise.all(
      templates.map(t => render(t.content))
    );
    
    const objects = rendered.map(content => {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error(chalk.red('Invalid JSON in template'), e);
        return {};
      }
    });
    
    // Deep merge all objects
    const merged = MergeStrategies.deepMerge(...objects);
    return JSON.stringify(merged, null, 2);
  }

  /**
   * Merge YAML files
   */
  static async mergeYaml(templates, render) {
    // For now, treat YAML as text and use append strategy
    // TODO: Add proper YAML parsing when yaml package is added
    console.warn(chalk.yellow('YAML merging not fully implemented - using append strategy'));
    return MergeStrategies.append(templates, render, { unique: true });
  }

  /**
   * Special merge for package.json
   */
  static async mergePackageJson(templates, render) {
    const rendered = await Promise.all(
      templates.map(t => render(t.content))
    );
    
    const packages = rendered.map(content => {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error(chalk.red('Invalid package.json in template'), e);
        return {};
      }
    });
    
    // Start with first package as base
    const merged = { ...packages[0] };
    
    // Initialize collections
    merged.dependencies = merged.dependencies || {};
    merged.devDependencies = merged.devDependencies || {};
    merged.scripts = merged.scripts || {};
    
    for (let i = 1; i < packages.length; i++) {
      const pkg = packages[i];
      const moduleName = templates[i].module;
      
      // Merge dependencies (simple merge)
      Object.assign(merged.dependencies, pkg.dependencies || {});
      Object.assign(merged.devDependencies, pkg.devDependencies || {});
      
      // Merge scripts with conflict resolution
      for (const [key, value] of Object.entries(pkg.scripts || {})) {
        if (merged.scripts[key] && merged.scripts[key] !== value) {
          // Conflict - create module-prefixed version
          merged.scripts[`${moduleName}:${key}`] = value;
          
          // If it's a common script, also create a combined version
          if (['build', 'test', 'dev', 'start'].includes(key)) {
            if (!merged.scripts[`${key}:all`]) {
              merged.scripts[`${key}:all`] = merged.scripts[key];
            }
            merged.scripts[`${key}:all`] += ` && npm run ${moduleName}:${key}`;
          }
        } else {
          merged.scripts[key] = value;
        }
      }
      
      // Merge arrays (keywords, files, etc)
      for (const key of ['keywords', 'files']) {
        if (Array.isArray(pkg[key])) {
          merged[key] = [...new Set([...(merged[key] || []), ...pkg[key]])];
        }
      }
      
      // Merge engines
      if (pkg.engines) {
        merged.engines = merged.engines || {};
        Object.assign(merged.engines, pkg.engines);
      }
      
      // Handle special fields
      if (pkg.type && !merged.type) {
        merged.type = pkg.type;
      }
    }
    
    // Sort dependencies
    merged.dependencies = MergeStrategies.sortObject(merged.dependencies);
    merged.devDependencies = MergeStrategies.sortObject(merged.devDependencies);
    merged.scripts = MergeStrategies.sortObject(merged.scripts);
    
    return JSON.stringify(merged, null, 2);
  }

  /**
   * Merge configuration files (like tsconfig.json, .eslintrc)
   */
  static async mergeConfig(templates, render, options = {}) {
    const { arrayStrategy = 'concat' } = options;
    
    const rendered = await Promise.all(
      templates.map(t => render(t.content))
    );
    
    const configs = rendered.map(content => {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error(chalk.red('Invalid config JSON in template'), e);
        return {};
      }
    });
    
    // Custom merge for config files
    const merged = configs[0];
    
    for (let i = 1; i < configs.length; i++) {
      const config = configs[i];
      
      for (const [key, value] of Object.entries(config)) {
        if (Array.isArray(value)) {
          if (arrayStrategy === 'concat') {
            merged[key] = [...(merged[key] || []), ...value];
          } else if (arrayStrategy === 'replace') {
            merged[key] = value;
          } else if (arrayStrategy === 'unique') {
            merged[key] = [...new Set([...(merged[key] || []), ...value])];
          }
        } else if (typeof value === 'object' && value !== null) {
          merged[key] = MergeStrategies.deepMerge(merged[key] || {}, value);
        } else {
          merged[key] = value;
        }
      }
    }
    
    return JSON.stringify(merged, null, 2);
  }

  /**
   * Merge environment files
   */
  static async mergeEnv(templates, render) {
    const contents = await Promise.all(
      templates.map(t => render(t.content))
    );
    
    const lines = [];
    const seen = new Set();
    
    // Process each template
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      const moduleName = templates[i].module;
      
      // Add module header
      if (i > 0) lines.push('');
      lines.push(`# ${moduleName.toUpperCase()} Configuration`);
      lines.push(`# ==============================`);
      
      // Process lines
      const envLines = content.split('\n');
      for (const line of envLines) {
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
          lines.push(line);
          continue;
        }
        
        // Extract key
        const match = line.match(/^([A-Z_]+)=/);
        if (match) {
          const key = match[1];
          if (seen.has(key)) {
            lines.push(`# ${line} # Duplicate from ${moduleName} - commented out`);
          } else {
            seen.add(key);
            lines.push(line);
          }
        } else {
          lines.push(line);
        }
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Deep merge objects
   */
  static deepMerge(...objects) {
    const result = {};
    
    for (const obj of objects) {
      if (!obj) continue;
      
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = MergeStrategies.deepMerge(result[key] || {}, value);
        } else if (Array.isArray(value)) {
          result[key] = [...(result[key] || []), ...value];
        } else {
          result[key] = value;
        }
      }
    }
    
    return result;
  }

  /**
   * Sort object keys alphabetically
   */
  static sortObject(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = obj[key];
        return sorted;
      }, {});
  }

  /**
   * Get merge function for a strategy
   */
  static getStrategy(strategyName) {
    const strategies = {
      replace: MergeStrategies.replace,
      append: MergeStrategies.append,
      prepend: MergeStrategies.prepend,
      merge: MergeStrategies.mergeJson,
      'merge-json': MergeStrategies.mergeJson,
      'merge-yaml': MergeStrategies.mergeYaml,
      'merge-package': MergeStrategies.mergePackageJson,
      'merge-config': MergeStrategies.mergeConfig,
      'merge-env': MergeStrategies.mergeEnv
    };
    
    return strategies[strategyName] || MergeStrategies.replace;
  }
}