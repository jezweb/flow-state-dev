/**
 * Module Loader - Handles dynamic loading of stack modules
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';

export class ModuleLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Load a module from a directory
   */
  async load(modulePath) {
    // Check cache first
    if (this.cache.has(modulePath)) {
      return this.cache.get(modulePath);
    }

    try {
      // Check if module directory exists
      if (!existsSync(modulePath)) {
        throw new Error(`Module directory not found: ${modulePath}`);
      }

      // Load module configuration (check both config.json and module.json)
      let configPath = join(modulePath, 'config.json');
      if (!existsSync(configPath)) {
        configPath = join(modulePath, 'module.json');
      }
      
      if (!existsSync(configPath)) {
        throw new Error(`Module config.json or module.json not found in ${modulePath}`);
      }

      const config = JSON.parse(readFileSync(configPath, 'utf-8'));

      // Check if module has a JS implementation
      const moduleFilePath = join(modulePath, 'module.js');
      let moduleInstance;
      
      if (existsSync(moduleFilePath)) {
        // Load module class if available
        const moduleUrl = pathToFileURL(moduleFilePath).href;
        const moduleExports = await import(moduleUrl);
        
        // Get the module class (handle both default and named exports)
        const ModuleClass = moduleExports.default || moduleExports[config.className];
        
        if (!ModuleClass) {
          throw new Error(`Module class ${config.className} not found in ${moduleFilePath}`);
        }

        // Create module instance
        moduleInstance = new ModuleClass();
        
        // Merge config with instance
        Object.assign(moduleInstance, config);
      } else {
        // Simple configuration-only module
        moduleInstance = { ...config };
      }
      
      // Set module path for reference
      moduleInstance.path = modulePath;
      
      // Load hooks if available
      await this.loadHooks(moduleInstance, modulePath);
      
      // Cache the loaded module
      this.cache.set(modulePath, moduleInstance);
      
      return moduleInstance;
    } catch (error) {
      console.error(chalk.red(`Failed to load module from ${modulePath}:`), error);
      throw error;
    }
  }

  /**
   * Load module hooks
   */
  async loadHooks(moduleInstance, modulePath) {
    const hooks = ['before-install', 'after-install', 'before-build', 'after-build'];
    const loadedHooks = {};

    for (const hookName of hooks) {
      const hookPath = join(modulePath, 'hooks', `${hookName}.js`);
      
      if (existsSync(hookPath)) {
        try {
          const hookUrl = pathToFileURL(hookPath).href;
          const hookModule = await import(hookUrl);
          loadedHooks[hookName.replace('-', '')] = hookModule.default;
        } catch (error) {
          console.warn(chalk.yellow(`Failed to load hook ${hookName} for module ${moduleInstance.name}:`), error.message);
        }
      }
    }

    // Attach hooks to module instance
    if (Object.keys(loadedHooks).length > 0) {
      moduleInstance.hooks = loadedHooks;
    }
  }

  /**
   * Clear module cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cached module
   */
  getCached(modulePath) {
    return this.cache.get(modulePath);
  }

  /**
   * Check if module is cached
   */
  isCached(modulePath) {
    return this.cache.has(modulePath);
  }

  /**
   * Create a module instance from class
   */
  createInstance(ModuleClass, config = {}) {
    try {
      const instance = new ModuleClass();
      
      // Apply configuration
      Object.assign(instance, config);
      
      return instance;
    } catch (error) {
      console.error(chalk.red('Failed to create module instance:'), error);
      throw error;
    }
  }

  /**
   * Load module dependencies
   */
  async loadDependencies(module, registry) {
    const dependencies = [];
    
    if (module.dependencies) {
      for (const [depName, depVersion] of Object.entries(module.dependencies)) {
        const depModule = registry.getModule(depName);
        
        if (!depModule) {
          console.warn(chalk.yellow(`Dependency ${depName} not found for module ${module.name}`));
          continue;
        }
        
        // Check version compatibility
        if (!this.isVersionCompatible(depModule.version, depVersion)) {
          console.warn(chalk.yellow(`Dependency ${depName} version ${depModule.version} may not be compatible with required ${depVersion}`));
        }
        
        dependencies.push(depModule);
      }
    }
    
    return dependencies;
  }

  /**
   * Check version compatibility (simple implementation)
   */
  isVersionCompatible(actualVersion, requiredVersion) {
    // For now, just check major version
    if (!actualVersion || !requiredVersion) return true;
    
    const actualMajor = actualVersion.split('.')[0];
    const requiredMajor = requiredVersion.replace(/[\^~]/, '').split('.')[0];
    
    return actualMajor === requiredMajor;
  }

  /**
   * Validate module structure
   */
  validateModuleStructure(modulePath) {
    const required = ['config.json', 'module.js'];
    const missing = [];
    
    for (const file of required) {
      const filePath = join(modulePath, file);
      if (!existsSync(filePath)) {
        missing.push(file);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Module at ${modulePath} is missing required files: ${missing.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get module metadata without fully loading it
   */
  async getMetadata(modulePath) {
    const configPath = join(modulePath, 'config.json');
    
    if (!existsSync(configPath)) {
      return null;
    }
    
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      return {
        name: config.name,
        version: config.version,
        description: config.description,
        category: config.category,
        tags: config.tags,
        author: config.author
      };
    } catch (error) {
      console.warn(chalk.yellow(`Failed to read metadata from ${configPath}:`), error.message);
      return null;
    }
  }
}