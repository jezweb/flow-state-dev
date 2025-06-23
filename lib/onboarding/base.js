/**
 * Base classes and interfaces for modular onboarding system
 */
import chalk from 'chalk';

/**
 * Base class for all onboarding steps
 */
export class OnboardingStep {
  constructor(name, description, options = {}) {
    this.name = name;
    this.description = description;
    this.priority = options.priority || 10;
    this.enabled = options.enabled !== false;
    this.required = options.required || false;
    this.dependencies = options.dependencies || [];
  }

  /**
   * Check if this step should run based on context
   * @param {Object} context - Current onboarding context
   * @returns {boolean}
   */
  shouldRun(context) {
    return this.enabled;
  }

  /**
   * Validate prerequisites for this step
   * @param {Object} context - Current onboarding context
   * @returns {Promise<{valid: boolean, message?: string}>}
   */
  async validate(context) {
    return { valid: true };
  }

  /**
   * Execute the onboarding step
   * @param {Object} context - Current onboarding context
   * @returns {Promise<Object>} Updated context
   */
  async execute(context) {
    throw new Error(`OnboardingStep.execute() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Cleanup or rollback if step fails
   * @param {Object} context - Current onboarding context
   * @param {Error} error - The error that occurred
   */
  async rollback(context, error) {
    // Default: no rollback needed
  }

  /**
   * Get configuration schema for this step
   * @returns {Object} JSON schema for step configuration
   */
  getConfigSchema() {
    return {};
  }
}

/**
 * Onboarding orchestrator that manages step execution
 */
export class OnboardingOrchestrator {
  constructor() {
    this.steps = new Map();
    this.context = {
      projectName: null,
      framework: null,
      targetDir: null,
      interactive: true,
      config: {},
      results: {}
    };
  }

  /**
   * Register an onboarding step
   * @param {OnboardingStep} step
   */
  registerStep(step) {
    if (!(step instanceof OnboardingStep)) {
      throw new Error('Step must extend OnboardingStep class');
    }
    this.steps.set(step.name, step);
  }

  /**
   * Get ordered list of steps to execute
   * @returns {OnboardingStep[]}
   */
  getExecutionOrder() {
    const steps = Array.from(this.steps.values())
      .filter(step => step.shouldRun(this.context))
      .sort((a, b) => a.priority - b.priority);

    // Check dependencies
    const resolved = new Set();
    const result = [];

    const resolveDependencies = (step) => {
      if (resolved.has(step.name)) return;
      
      for (const depName of step.dependencies) {
        const dep = this.steps.get(depName);
        if (!dep) {
          throw new Error(`Dependency not found: ${depName} required by ${step.name}`);
        }
        resolveDependencies(dep);
      }
      
      resolved.add(step.name);
      result.push(step);
    };

    for (const step of steps) {
      resolveDependencies(step);
    }

    return result;
  }

  /**
   * Execute all registered steps in order
   * @param {Object} initialContext - Initial context values
   * @returns {Promise<Object>} Final context
   */
  async execute(initialContext = {}) {
    this.context = { ...this.context, ...initialContext };
    const steps = this.getExecutionOrder();

    console.log(chalk.blue(`\n🚀 Starting onboarding with ${steps.length} steps...\n`));

    for (const step of steps) {
      try {
        console.log(chalk.gray(`⚡ ${step.description}...`));
        
        // Validate step prerequisites
        const validation = await step.validate(this.context);
        if (!validation.valid) {
          throw new Error(validation.message || `Validation failed for ${step.name}`);
        }

        // Execute step
        this.context = await step.execute(this.context);
        this.context.results[step.name] = { success: true };
        
        console.log(chalk.green(`✅ ${step.description} completed`));
      } catch (error) {
        console.log(chalk.red(`❌ ${step.description} failed: ${error.message}`));
        
        // Attempt rollback
        try {
          await step.rollback(this.context, error);
        } catch (rollbackError) {
          console.log(chalk.yellow(`⚠️  Rollback failed: ${rollbackError.message}`));
        }

        this.context.results[step.name] = { success: false, error: error.message };

        // Stop if required step fails
        if (step.required) {
          throw error;
        }
      }
    }

    return this.context;
  }

  /**
   * Get current context
   * @returns {Object}
   */
  getContext() {
    return { ...this.context };
  }

  /**
   * Update context
   * @param {Object} updates
   */
  updateContext(updates) {
    this.context = { ...this.context, ...updates };
  }
}

/**
 * Plugin loader for discovering and loading onboarding modules
 */
export class OnboardingPluginLoader {
  constructor() {
    this.pluginPaths = [
      './steps', // Built-in steps
      '../onboarding-plugins', // External plugins
      process.env.FSD_PLUGIN_PATH // Environment override
    ].filter(Boolean);
  }

  /**
   * Discover available plugins
   * @returns {Promise<Array>} Available plugin metadata
   */
  async discoverPlugins() {
    const plugins = [];
    
    for (const pluginPath of this.pluginPaths) {
      try {
        const { default: pluginModule } = await import(pluginPath);
        if (pluginModule && typeof pluginModule.getSteps === 'function') {
          plugins.push({
            path: pluginPath,
            module: pluginModule,
            steps: pluginModule.getSteps()
          });
        }
      } catch (error) {
        // Plugin not found or invalid - continue
      }
    }

    return plugins;
  }

  /**
   * Load plugins into orchestrator
   * @param {OnboardingOrchestrator} orchestrator
   * @param {Array} pluginFilter - Only load specific plugins
   */
  async loadPlugins(orchestrator, pluginFilter = null) {
    const plugins = await this.discoverPlugins();
    
    for (const plugin of plugins) {
      if (pluginFilter && !pluginFilter.includes(plugin.path)) {
        continue;
      }

      for (const step of plugin.steps) {
        orchestrator.registerStep(step);
      }
    }
  }
}