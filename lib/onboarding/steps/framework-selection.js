/**
 * Framework Selection Step
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { OnboardingStep } from '../base.js';
import { frameworks, getFramework, formatFrameworkInfo } from '../../frameworks.js';

export class FrameworkSelectionStep extends OnboardingStep {
  constructor() {
    super('framework-selection', 'Select project framework', {
      priority: 2,
      required: true,
      dependencies: ['project-name']
    });
  }

  shouldRun(context) {
    return !context.framework;
  }

  async execute(context) {
    let selectedFramework = context.framework;
    
    if (!selectedFramework && context.interactive) {
      console.log(chalk.blue('\n🎨 Choose your framework:\n'));
      
      const { framework } = await inquirer.prompt([
        {
          type: 'list',
          name: 'framework',
          message: 'Select a framework:',
          choices: frameworks.map(f => ({
            name: f.name,
            value: f.value,
            disabled: f.comingSoon ? chalk.gray('Coming soon') : false
          })),
          default: 'minimal'
        }
      ]);
      
      selectedFramework = getFramework(framework);
      
      // Show framework details
      console.log(formatFrameworkInfo(selectedFramework));
    } else if (!selectedFramework) {
      // Default to Vue + Vuetify for non-interactive mode (or from env)
      const defaultFramework = process.env.FSD_DEFAULT_FRAMEWORK || 'vue-vuetify';
      selectedFramework = getFramework(defaultFramework);
    } else if (typeof selectedFramework === 'string') {
      // Convert string to framework object
      selectedFramework = getFramework(selectedFramework);
    }

    return {
      ...context,
      framework: selectedFramework
    };
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: frameworks.map(f => f.value),
          description: 'Framework to use for the project'
        }
      }
    };
  }
}