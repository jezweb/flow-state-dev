/**
 * Directory Selection Step
 */
import chalk from 'chalk';
import path from 'path';
import inquirer from 'inquirer';
import { OnboardingStep } from '../base.js';
import { analyzeDirectory, formatDirectoryInfo, performSafetyChecks } from '../../directory-utils.js';

export class DirectorySelectionStep extends OnboardingStep {
  constructor() {
    super('directory-selection', 'Choose target directory', {
      priority: 3,
      required: true,
      dependencies: ['project-name']
    });
  }

  shouldRun(context) {
    return !context.targetDir;
  }

  async validate(context) {
    if (!context.projectName) {
      return { valid: false, message: 'Project name is required for directory selection' };
    }
    return { valid: true };
  }

  async execute(context) {
    const { projectName, options = {} } = context;
    const currentDir = process.cwd();
    let targetDir;
    let useCurrentDir = false;

    // Check for conflicting flags
    if (options.here && options.subfolder) {
      throw new Error('Cannot use both --here and --subfolder flags');
    }

    // Determine target directory based on flags or interactive prompt
    if (options.here) {
      // Explicit --here flag
      targetDir = currentDir;
      useCurrentDir = true;
    } else if (options.subfolder || !context.interactive) {
      // Explicit --subfolder flag or non-interactive mode
      targetDir = path.join(currentDir, projectName);
      useCurrentDir = false;
    } else {
      // Interactive mode - ask user
      const currentAnalysis = analyzeDirectory(currentDir);
      
      // Show directory info
      console.log(chalk.blue('\n📍 Directory Selection:\n'));
      
      const { directoryChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'directoryChoice',
          message: 'Where should we create your project files?',
          choices: [
            {
              name: `./${projectName}/ (new subfolder)`,
              value: 'subfolder',
              short: 'Subfolder'
            },
            {
              name: `./ (current directory)`,
              value: 'current',
              short: 'Current'
            }
          ],
          default: 'subfolder'
        }
      ]);
      
      // Show current directory info after choice
      console.log();
      formatDirectoryInfo(currentAnalysis).forEach(line => {
        console.log(chalk.gray(line));
      });
      
      if (directoryChoice === 'current') {
        targetDir = currentDir;
        useCurrentDir = true;
      } else {
        targetDir = path.join(currentDir, projectName);
        useCurrentDir = false;
      }
    }

    // Perform safety checks if using current directory
    if (useCurrentDir && !options.force) {
      const analysis = analyzeDirectory(targetDir);
      const safety = performSafetyChecks(analysis);
      
      if (!safety.safe) {
        const errorMessage = 'Cannot create project in this directory:\\n' +
          safety.issues.map(issue => `   • ${issue.message}\\n     ${issue.suggestion}`).join('\\n');
        throw new Error(errorMessage);
      }
      
      if (safety.needsConfirmation && context.interactive) {
        console.log(chalk.yellow('\n⚠️  Warning:\n'));
        safety.warnings.forEach(warning => {
          console.log(chalk.yellow(`   • ${warning.message}`));
        });
        
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Are you sure you want to create the project here?',
            default: false
          }
        ]);
        
        if (!proceed) {
          throw new Error('Project creation cancelled by user');
        }
      }
    }

    return {
      ...context,
      targetDir,
      useCurrentDir
    };
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        here: {
          type: 'boolean',
          description: 'Create project in current directory'
        },
        subfolder: {
          type: 'boolean',
          description: 'Create project in subfolder (default)'
        },
        force: {
          type: 'boolean',
          description: 'Skip safety confirmations'
        }
      }
    };
  }
}