/**
 * Project Name Step - Handles project naming and location
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync } from 'fs';
import path from 'path';
import { OnboardingStep } from '../base.js';
import { analyzeDirectory, performSafetyChecks } from '../../directory-utils.js';

export class ProjectNameStep extends OnboardingStep {
  constructor() {
    super('project-name', 'Set project name and location', {
      priority: 1,
      required: true
    });
  }

  shouldRun(context) {
    // Skip if project name is already set
    return !context.projectName || context.interactive;
  }

  async execute(context) {
    let projectName = context.projectName;
    let targetLocation = context.here ? 'here' : 'subfolder';
    
    if (context.interactive && !projectName) {
      // Ask for project name
      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-flow-state-app',
          validate: (input) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            if (!/^[a-z0-9-_]+$/i.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens and underscores';
            }
            return true;
          }
        }
      ]);
      
      projectName = response.projectName;
    }
    
    // Determine target location if not specified
    if (context.interactive && !context.here && !context.subfolder) {
      const currentDir = process.cwd();
      const isEmpty = await this.isDirectoryEmpty(currentDir);
      
      if (!isEmpty) {
        const locationResponse = await inquirer.prompt([
          {
            type: 'list',
            name: 'location',
            message: 'Where would you like to create the project?',
            choices: [
              {
                name: `In a new subfolder: ${path.join(currentDir, projectName)}`,
                value: 'subfolder'
              },
              {
                name: `In the current directory: ${currentDir}`,
                value: 'here'
              }
            ],
            default: 'subfolder'
          }
        ]);
        
        targetLocation = locationResponse.location;
      } else {
        // Empty directory, safe to use current
        targetLocation = 'here';
      }
    }
    
    // Set context values
    context.projectName = projectName;
    context.here = targetLocation === 'here';
    context.subfolder = targetLocation === 'subfolder';
    
    // Perform safety checks
    const targetPath = context.here ? process.cwd() : path.join(process.cwd(), projectName);
    
    if (!context.force) {
      console.log(chalk.blue('\n🔍 Analyzing target directory...\n'));
      
      const analysis = await analyzeDirectory(targetPath);
      const safetyCheck = await performSafetyChecks(analysis);
      
      if (!safetyCheck.safe) {
        console.log(chalk.red('\n⚠️  Safety check failed:'));
        for (const issue of safetyCheck.issues) {
          console.log(chalk.red(`  • ${issue}`));
        }
        
        if (context.interactive) {
          const continueResponse = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'continue',
              message: 'Do you want to continue anyway?',
              default: false
            }
          ]);
          
          if (!continueResponse.continue) {
            throw new Error('Project creation cancelled due to safety concerns');
          }
        } else {
          throw new Error('Safety check failed. Use --force to override');
        }
      }
      
      // Show analysis results
      if (analysis.hasContent) {
        console.log(chalk.yellow('📁 Directory contains:'));
        console.log(chalk.gray(`  • ${analysis.fileCount} files`));
        console.log(chalk.gray(`  • ${analysis.totalSize} total size`));
        
        if (analysis.hasGit) {
          console.log(chalk.yellow('  • Git repository detected'));
        }
        if (analysis.hasNodeModules) {
          console.log(chalk.yellow('  • node_modules detected'));
        }
      }
    }
    
    return context;
  }

  async isDirectoryEmpty(dir) {
    const analysis = await analyzeDirectory(dir);
    return !analysis.hasContent || analysis.fileCount <= 2; // Allow .git or similar
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        projectName: {
          type: 'string',
          pattern: '^[a-z0-9-_]+$',
          description: 'Name of the project'
        },
        here: {
          type: 'boolean',
          description: 'Create project in current directory'
        },
        subfolder: {
          type: 'boolean',
          description: 'Create project in subfolder'
        },
        force: {
          type: 'boolean',
          description: 'Skip safety checks'
        }
      }
    };
  }
}