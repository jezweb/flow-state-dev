/**
 * Stack Selection Step - Multi-module stack composition
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { OnboardingStep } from '../base.js';
import { ModuleRegistry } from '../../modules/registry.js';
import { DependencyResolver } from '../../modules/dependency-resolver.js';
import { StackPresetManager } from '../stack-presets.js';

export class StackSelectionStep extends OnboardingStep {
  constructor() {
    super('stack-selection', 'Select project stack', {
      priority: 2,
      required: true,
      dependencies: ['project-name']
    });
    
    this.registry = new ModuleRegistry();
    this.resolver = new DependencyResolver(this.registry);
    this.presetManager = new StackPresetManager();
  }

  shouldRun(context) {
    // Always run to resolve stack, even when modules are pre-selected
    return true;
  }

  async execute(context) {
    // Initialize modules if not already loaded
    if (!this.registry.isInitialized()) {
      await this.registry.discover();
    }

    let selectedModules = context.selectedModules || [];
    
    // Skip interactive selection if modules are already specified
    if (context.interactive && !context.selectedModules && !context.stackPreset) {
      const selectionMode = await this.chooseSelectionMode();
      
      if (selectionMode === 'preset') {
        selectedModules = await this.selectFromPresets(context);
      } else if (selectionMode === 'custom') {
        selectedModules = await this.customModuleSelection(context);
      } else {
        selectedModules = await this.guidedSelection(context);
      }
    } else {
      // Non-interactive: use preset or specified modules, fall back to default
      if (context.stackPreset) {
        const preset = this.presetManager.getPreset(context.stackPreset);
        selectedModules = preset ? preset.modules : [];
      } else if (!selectedModules.length) {
        // Only use default if no modules were specified
        selectedModules = ['vue-base', 'vuetify', 'supabase'];
      }
    }

    // Resolve dependencies and validate selection
    console.log(chalk.blue('\n🔍 Resolving dependencies...'));
    const resolution = await this.resolver.resolve(selectedModules, {
      autoResolve: true,
      allowConflicts: false
    });

    if (!resolution.success) {
      console.log(chalk.red('❌ Stack validation failed:'));
      for (const error of resolution.errors) {
        console.log(chalk.red(`  • ${error}`));
      }
      throw new Error('Invalid stack configuration');
    }

    console.log(chalk.green('✅ Stack validated successfully'));
    
    // Show final stack summary
    this.displayStackSummary(resolution.modules);

    return {
      ...context,
      selectedModules: resolution.modules.map(m => m.name),
      stackResolution: resolution,
      framework: this.extractFrameworkForBackwardsCompatibility(resolution.modules)
    };
  }

  async chooseSelectionMode() {
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'How would you like to select your stack?',
        choices: [
          {
            name: '🎯 Choose from popular presets (Recommended)',
            value: 'preset'
          },
          {
            name: '🧭 Guided selection by category',
            value: 'guided'
          },
          {
            name: '⚙️  Custom module selection',
            value: 'custom'
          }
        ],
        default: 'preset'
      }
    ]);

    return mode;
  }

  async selectFromPresets(context) {
    const presets = this.presetManager.getAvailablePresets();
    
    console.log(chalk.blue('\n🎨 Choose from popular stack combinations:\n'));
    
    const { preset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Select a stack preset:',
        choices: presets.map(p => ({
          name: `${p.name} - ${p.description}`,
          value: p.id,
          short: p.name
        })),
        default: 'vue-full-stack'
      }
    ]);

    const selectedPreset = this.presetManager.getPreset(preset);
    
    // Show preset details
    console.log(chalk.cyan(`\n📋 ${selectedPreset.name}:`));
    console.log(chalk.gray(`${selectedPreset.description}\n`));
    
    console.log(chalk.blue('Included modules:'));
    for (const moduleId of selectedPreset.modules) {
      const module = this.registry.getModule(moduleId);
      if (module) {
        console.log(chalk.green(`  ✓ ${module.name} - ${module.description}`));
      }
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Use this preset?',
        default: true
      }
    ]);

    if (!confirm) {
      return this.customModuleSelection(context);
    }

    return selectedPreset.modules;
  }

  async guidedSelection(context) {
    console.log(chalk.blue('\n🧭 Let\'s build your stack step by step:\n'));
    
    const categories = this.registry.getCategories();
    const selectedModules = [];

    for (const category of categories) {
      const modules = this.registry.getModulesByCategory(category);
      if (modules.length === 0) continue;

      console.log(chalk.cyan(`\n${this.getCategoryIcon(category)} ${this.getCategoryName(category)}:`));
      
      const { moduleId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'moduleId',
          message: `Choose a ${category} module:`,
          choices: [
            { name: 'Skip this category', value: null },
            ...modules.map(m => ({
              name: `${m.name} - ${m.description}`,
              value: m.name,
              short: m.name
            }))
          ],
          default: modules.find(m => m.recommended)?.name || null
        }
      ]);

      if (moduleId) {
        selectedModules.push(moduleId);
      }
    }

    return selectedModules;
  }

  async customModuleSelection(context) {
    console.log(chalk.blue('\n⚙️  Custom module selection:\n'));
    
    const allModules = this.registry.getAllModules();
    const choices = allModules.map(m => ({
      name: `${m.name} (${m.category}) - ${m.description}`,
      value: m.name,
      checked: m.recommended || false
    }));

    const { modules } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'modules',
        message: 'Select modules for your stack:',
        pageSize: 15,
        choices,
        validate: (input) => {
          if (input.length === 0) {
            return 'Please select at least one module';
          }
          return true;
        }
      }
    ]);

    return modules;
  }

  displayStackSummary(modules) {
    console.log(chalk.blue('\n📦 Your Stack:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const byCategory = {};
    for (const module of modules) {
      if (!byCategory[module.category]) {
        byCategory[module.category] = [];
      }
      byCategory[module.category].push(module);
    }

    for (const [category, categoryModules] of Object.entries(byCategory)) {
      console.log(chalk.cyan(`\n${this.getCategoryIcon(category)} ${this.getCategoryName(category)}:`));
      for (const module of categoryModules) {
        console.log(chalk.green(`  ✓ ${module.name} ${chalk.gray(`(v${module.version})`)}`));
      }
    }
    
    console.log(chalk.gray('\n─'.repeat(50)));
  }

  getCategoryIcon(category) {
    const icons = {
      'frontend-framework': '🖼️',
      'ui-library': '🎨',
      'backend-service': '🔧',
      'auth-provider': '🔐',
      'backend-framework': '⚙️',
      'database': '💾',
      'other': '📦'
    };
    return icons[category] || '📦';
  }

  getCategoryName(category) {
    const names = {
      'frontend-framework': 'Frontend Framework',
      'ui-library': 'UI Library',
      'backend-service': 'Backend Service',
      'auth-provider': 'Authentication',
      'backend-framework': 'Backend Framework',
      'database': 'Database',
      'other': 'Other'
    };
    return names[category] || category;
  }

  // For backwards compatibility with existing framework-based logic
  extractFrameworkForBackwardsCompatibility(modules) {
    const frontendModule = modules.find(m => m.category === 'frontend-framework');
    const uiModule = modules.find(m => m.category === 'ui-library');
    
    if (frontendModule?.name === 'vue-base' && uiModule?.name === 'vuetify') {
      return { value: 'vue-vuetify', name: 'Vue 3 + Vuetify' };
    } else if (frontendModule?.name === 'vue-base') {
      return { value: 'vue', name: 'Vue 3' };
    } else if (frontendModule?.name === 'react') {
      return { value: 'react', name: 'React' };
    }
    
    return null;
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        selectedModules: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of module IDs to include in the stack'
        },
        stackPreset: {
          type: 'string',
          description: 'Preset stack configuration to use'
        }
      }
    };
  }
}