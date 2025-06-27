/**
 * Flow State Dev Main API Class
 * 
 * Central API class that provides access to all Flow State Dev functionality
 */

import { ModulesAPI } from './modules/index.js';
import { ProjectAPI } from './project/index.js';
import { ProjectsAPI } from './projects/index.js';
import { DoctorAPI } from './doctor/index.js';
import { MemoryAPI } from './memory/index.js';
import { GitHubAPI } from './github/index.js';
// TODO: Add proper config and logging when implemented
// import { ConfigManager } from '../config/config-manager.js';
// import { Logger } from '../utils/logger.js';
import EventEmitter from 'events';

export class FlowStateAPI extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configuration - use simple defaults for now
    this.config = options.config || { 
      load: async () => {}, 
      isLoaded: () => true,
      getConfigPath: () => process.cwd() 
    };
    this.logger = options.logger || { 
      log: () => {}, 
      error: console.error 
    };
    
    // Initialize sub-APIs
    this.modules = new ModulesAPI(this);
    this.project = new ProjectAPI(this);
    this.projects = new ProjectsAPI(this);
    this.doctor = new DoctorAPI(this);
    this.memory = new MemoryAPI(this);
    this.github = new GitHubAPI(this);
    
    // API state
    this.initialized = false;
  }
  
  /**
   * Initialize the API
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load configuration (no-op for now)
      if (this.config.load) await this.config.load();
      
      // Initialize sub-APIs
      await Promise.all([
        this.modules.initialize(),
        this.projects.initialize(),
        this.doctor.initialize()
      ]);
      
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
  
  /**
   * Get API version information
   */
  async getVersion() {
    // Read package.json directly
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const packagePath = join(process.cwd(), '..', 'package.json');
    
    try {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      return {
        version: packageJson.version,
        name: packageJson.name,
        description: packageJson.description
      };
    } catch {
      return {
        version: '2.1.3',
        name: 'flow-state-dev',
        description: 'The fastest way to start a modern web project'
      };
    }
  }
  
  /**
   * Get API status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      modules: {
        available: this.modules.getAvailableModules().length,
        loaded: this.modules.isInitialized()
      },
      config: {
        loaded: this.config.isLoaded(),
        path: this.config.getConfigPath()
      }
    };
  }
  
  /**
   * Create a new project
   * @param {string} projectName - Name of the project
   * @param {Object} options - Project creation options
   * @returns {Promise<Object>} Project creation result
   */
  async createProject(projectName, options = {}) {
    await this.initialize();
    return this.project.create(projectName, options);
  }
  
  /**
   * List available stack presets
   * @returns {Promise<Array>} Available presets
   */
  async getPresets() {
    await this.initialize();
    return this.project.getPresets();
  }
  
  /**
   * Get available modules
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Available modules
   */
  async getModules(filters = {}) {
    await this.initialize();
    return this.modules.list(filters);
  }
  
  /**
   * Run system diagnostics
   * @returns {Promise<Object>} Diagnostic results
   */
  async runDiagnostics() {
    await this.initialize();
    return this.doctor.runDiagnostics();
  }
  
  /**
   * Set up event listeners for progress tracking
   * @param {Function} onProgress - Progress callback
   * @param {Function} onError - Error callback
   */
  onProgress(onProgress, onError) {
    if (onProgress) this.on('progress', onProgress);
    if (onError) this.on('error', onError);
    
    // Forward events from sub-APIs
    const apis = [this.modules, this.project, this.projects, this.doctor, this.memory, this.github];
    apis.forEach(api => {
      api.on('progress', data => this.emit('progress', data));
      api.on('error', error => this.emit('error', error));
    });
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    this.removeAllListeners();
    this.initialized = false;
  }
}