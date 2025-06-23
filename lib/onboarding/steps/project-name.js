/**
 * Project Name Collection Step
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { OnboardingStep } from '../base.js';

export class ProjectNameStep extends OnboardingStep {
  constructor() {
    super('project-name', 'Collect project name', {
      priority: 1,
      required: true
    });
  }

  shouldRun(context) {
    return !context.projectName;
  }

  /**
   * Normalize project names to be filesystem and npm safe
   */
  normalizeProjectName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Convert spaces to hyphens
      .replace(/-+/g, '-') // Remove multiple consecutive hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  async execute(context) {
    let projectName = context.projectName;

    // If no project name provided, ask for it
    if (!projectName) {
      // Get the current directory name as default
      const currentDirName = path.basename(process.cwd());
      const defaultName = this.normalizeProjectName(currentDirName) || 'my-app';
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: defaultName,
          validate: (input) => {
            if (!input.trim()) return 'Project name is required';
            const normalized = this.normalizeProjectName(input);
            if (!normalized) return 'Project name must contain at least one letter or number';
            return true;
          },
          filter: (input) => this.normalizeProjectName(input)
        }
      ]);
      projectName = answers.projectName;
    } else {
      // Normalize provided project name
      const originalName = projectName;
      projectName = this.normalizeProjectName(projectName);
      if (originalName !== projectName && context.interactive) {
        console.log(chalk.yellow(`📝 Normalized project name: ${originalName} → ${projectName}`));
      }
    }

    return {
      ...context,
      projectName
    };
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          description: 'Name of the project to create'
        }
      }
    };
  }
}