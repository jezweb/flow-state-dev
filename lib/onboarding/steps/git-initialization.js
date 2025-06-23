/**
 * Git Initialization Step
 */
import chalk from 'chalk';
import { execSync } from 'child_process';
import { OnboardingStep } from '../base.js';

export class GitInitializationStep extends OnboardingStep {
  constructor() {
    super('git-initialization', 'Initialize git repository', {
      priority: 15,
      required: false,
      dependencies: ['template-processing']
    });
  }

  async validate(context) {
    const { targetDir } = context;
    
    if (!targetDir) {
      return { valid: false, message: 'Target directory is required' };
    }

    // Check if git is available
    try {
      execSync('git --version', { stdio: 'ignore' });
      return { valid: true };
    } catch (error) {
      return { valid: false, message: 'Git is not installed or not available in PATH' };
    }
  }

  async execute(context) {
    const { targetDir } = context;

    console.log(chalk.blue('\n📝 Initializing git repository...'));
    
    try {
      execSync('git init --quiet', { cwd: targetDir, stdio: 'pipe' });
      execSync('git branch -m main', { cwd: targetDir, stdio: 'pipe' });
      
      return {
        ...context,
        gitInitialized: true
      };
    } catch (error) {
      throw new Error(`Failed to initialize git repository: ${error.message}`);
    }
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        skipGit: {
          type: 'boolean',
          description: 'Skip git initialization'
        },
        defaultBranch: {
          type: 'string',
          description: 'Default branch name',
          default: 'main'
        }
      }
    };
  }
}