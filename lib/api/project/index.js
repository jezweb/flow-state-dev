/**
 * Project API
 * 
 * API for creating and managing Flow State Dev projects
 */

import { OnboardingOrchestrator } from '../../onboarding/index.js';
import { StackPresetManager } from '../../onboarding/stack-presets.js';
import { ModuleStackValidator } from '../../modules/validation/stack-validator.js';
import EventEmitter from 'events';
import { join } from 'path';
import { existsSync } from 'fs';

export class ProjectAPI extends EventEmitter {
  constructor(flowStateAPI) {
    super();
    this.api = flowStateAPI;
    this.presetManager = new StackPresetManager();
    this.validator = new ModuleStackValidator();
  }
  
  /**
   * Create a new project
   * @param {string} projectName - Project name
   * @param {Object} options - Creation options
   * @returns {Object} Creation result
   */
  async create(projectName, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate project name
      this.validateProjectName(projectName);
      
      // Check if directory exists
      const projectPath = options.path || join(process.cwd(), projectName);
      if (existsSync(projectPath) && !options.force) {
        throw new Error(`Directory ${projectPath} already exists`);
      }
      
      // TODO: Implement proper orchestrator
      // For now, return mock result
      const mockResult = {
        projectPath,
        modules: options.modules || [],
        skipInstall: options.skipInstall
      };
      
      // Emit progress events
      this.emit('progress', { 
        type: 'step:start', 
        step: 'create',
        message: 'Creating project' 
      });
      
      // Prepare options
      const runOptions = {
        projectName,
        projectPath,
        preset: options.preset,
        modules: options.modules,
        skipInstall: options.skipInstall || false,
        skipGit: options.skipGit || false,
        packageManager: options.packageManager || 'npm'
      };
      
      // TODO: Implement actual project creation
      const result = mockResult;
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        projectName,
        projectPath: result.projectPath || projectPath,
        modules: result.modules || [],
        duration,
        nextSteps: this.getNextSteps(result)
      };
      
    } catch (error) {
      this.emit('error', error);
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  /**
   * Get available presets
   * @returns {Array} Available presets
   */
  async getPresets() {
    return this.presetManager.getAvailablePresets().map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      modules: preset.modules,
      tags: preset.tags || [],
      useCase: preset.useCase,
      difficulty: preset.difficulty,
      recommended: preset.recommended || false
    }));
  }
  
  /**
   * Get preset by ID
   * @param {string} id - Preset ID
   * @returns {Object|null} Preset details
   */
  async getPreset(id) {
    const preset = this.presetManager.getPreset(id);
    if (!preset) return null;
    
    return {
      id: preset.id,
      name: preset.name,
      description: preset.description,
      modules: preset.modules,
      tags: preset.tags || [],
      useCase: preset.useCase,
      difficulty: preset.difficulty,
      recommended: preset.recommended || false
    };
  }
  
  /**
   * Validate stack configuration
   * @param {Array} modules - Module names
   * @returns {Object} Validation result
   */
  async validateStack(modules) {
    // Get module details
    const moduleDetails = await Promise.all(
      modules.map(name => this.api.modules.get(name))
    );
    
    const validModules = moduleDetails.filter(Boolean);
    
    if (validModules.length !== modules.length) {
      const missing = modules.filter(name => 
        !validModules.some(m => m.name === name)
      );
      
      return {
        valid: false,
        errors: [`Unknown modules: ${missing.join(', ')}`],
        warnings: []
      };
    }
    
    // Check compatibility
    const compatibility = await this.api.modules.checkCompatibility(modules);
    
    return {
      valid: compatibility.compatible,
      errors: compatibility.issues.map(i => i.message),
      warnings: compatibility.warnings.map(w => w.message),
      modules: validModules
    };
  }
  
  /**
   * Create a custom preset
   * @param {Object} presetConfig - Preset configuration
   * @returns {Object} Created preset
   */
  async createPreset(presetConfig) {
    const { name, description, modules, metadata } = presetConfig;
    
    // Validate modules
    const validation = await this.validateStack(modules);
    if (!validation.valid) {
      throw new Error(`Invalid module configuration: ${validation.errors.join(', ')}`);
    }
    
    // Create preset
    const preset = this.presetManager.createCustomPreset(
      name,
      description,
      modules,
      metadata
    );
    
    return {
      id: preset.id,
      name: preset.name,
      description: preset.description,
      modules: preset.modules,
      custom: true,
      createdAt: preset.createdAt
    };
  }
  
  /**
   * Validate project name
   */
  validateProjectName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Project name is required');
    }
    
    if (name.length < 2 || name.length > 50) {
      throw new Error('Project name must be between 2 and 50 characters');
    }
    
    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new Error('Project name must contain only lowercase letters, numbers, and hyphens');
    }
    
    if (name.startsWith('-') || name.endsWith('-')) {
      throw new Error('Project name cannot start or end with a hyphen');
    }
  }
  
  /**
   * Get next steps based on creation result
   */
  getNextSteps(result) {
    const steps = [];
    
    steps.push({
      command: `cd ${result.projectName || 'your-project'}`,
      description: 'Navigate to your project'
    });
    
    if (result.modules?.some(m => m.includes('supabase'))) {
      steps.push({
        command: 'cp .env.example .env',
        description: 'Copy environment template'
      });
      steps.push({
        command: 'edit .env',
        description: 'Configure Supabase credentials'
      });
    }
    
    if (!result.skipInstall) {
      steps.push({
        command: 'npm run dev',
        description: 'Start development server'
      });
    } else {
      steps.push({
        command: 'npm install',
        description: 'Install dependencies'
      });
    }
    
    steps.push({
      command: 'fsd doctor',
      description: 'Check project health'
    });
    
    return steps;
  }
}