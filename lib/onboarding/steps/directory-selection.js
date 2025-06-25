/**
 * Directory Selection Step
 */
import chalk from 'chalk';
import path from 'path';
import inquirer from 'inquirer';
import { OnboardingStep } from '../base.js';
import { analyzeDirectory, formatDirectoryInfo, performSafetyChecks, formatSafetyInfo } from '../../directory-utils.js';

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
      
      // Show enhanced directory info after choice
      console.log();
      formatDirectoryInfo(currentAnalysis).forEach(line => {
        console.log(chalk.gray(line));
      });
      
      // Show safety preview for current directory choice
      if (directoryChoice === 'current') {
        const safety = performSafetyChecks(currentAnalysis);
        if (!safety.safe || safety.needsConfirmation) {
          console.log(chalk.yellow('\n⚠️  Safety check preview for current directory:'));
          formatSafetyInfo(safety).forEach(line => {
            if (line.includes('Critical Issues')) {
              console.log(chalk.red(line));
            } else if (line.includes('Warnings')) {
              console.log(chalk.yellow(line));
            } else if (line.includes('Information')) {
              console.log(chalk.blue(line));
            } else {
              console.log(chalk.gray(line));
            }
          });
          console.log(chalk.gray('\n(Full safety check will run after selection)'));
        }
      }
      
      if (directoryChoice === 'current') {
        targetDir = currentDir;
        useCurrentDir = true;
      } else {
        targetDir = path.join(currentDir, projectName);
        useCurrentDir = false;
      }
    }

    // Perform comprehensive safety checks if using current directory
    if (useCurrentDir && !options.force) {
      const analysis = analyzeDirectory(targetDir);
      const safety = performSafetyChecks(analysis);
      
      // Handle blocking issues
      if (!safety.safe) {
        console.log(chalk.red('\n🚫 Cannot create project in this directory:\n'));
        
        safety.blocks.forEach(block => {
          console.log(chalk.red(`   • ${block.message}`));
          if (block.details) {
            console.log(chalk.gray(`     ${block.details}`));
          }
          console.log(chalk.yellow('\n     💡 Solutions:'));
          block.solutions.forEach(solution => {
            console.log(chalk.gray(`       - ${solution}`));
          });
          console.log();
        });
        
        throw new Error('Directory safety check failed');
      }
      
      // Handle warnings that need confirmation
      if (safety.needsConfirmation && context.interactive) {
        console.log(chalk.yellow('\n⚠️  Directory Analysis:\n'));
        
        // Show directory information
        formatDirectoryInfo(analysis).forEach(line => {
          console.log(chalk.gray(line));
        });
        
        // Show safety warnings
        formatSafetyInfo(safety).forEach(line => {
          if (line.includes('Warnings')) {
            console.log(chalk.yellow(line));
          } else if (line.includes('Information')) {
            console.log(chalk.blue(line));
          } else {
            console.log(chalk.gray(line));
          }
        });
        
        console.log(chalk.yellow('\n🤔 This directory has potential conflicts with new project creation.'));
        
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to continue creating the project here?',
            default: false
          }
        ]);
        
        if (!proceed) {
          console.log(chalk.blue('\n💡 Consider using:'));
          console.log(chalk.gray(`   fsd init ${context.projectName} --subfolder`));
          console.log(chalk.gray('   (creates project in a new subfolder)\n'));
          throw new Error('Project creation cancelled by user');
        }
      }
      
      // Show informational notices if any
      if (safety.hasNotices && context.interactive) {
        const notices = formatSafetyInfo(safety).filter(line => 
          line.includes('Information') || line.includes('💡')
        );
        
        if (notices.length > 0) {
          notices.forEach(line => {
            console.log(chalk.blue(line));
          });
          console.log();
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