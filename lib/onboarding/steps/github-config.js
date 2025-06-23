/**
 * GitHub Configuration Step
 */
import chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { OnboardingStep } from '../base.js';
import { formatError } from '../../errors.js';

export class GitHubConfigurationStep extends OnboardingStep {
  constructor() {
    super('github-config', 'Configure GitHub repository', {
      priority: 25,
      required: false,
      dependencies: ['git-initialization']
    });
  }

  shouldRun(context) {
    // Only run if interactive mode or github config provided
    return context.interactive || (context.config && context.config.github);
  }

  async validate(context) {
    const { targetDir, gitInitialized } = context;
    
    if (!targetDir) {
      return { valid: false, message: 'Target directory is required' };
    }

    if (!gitInitialized) {
      return { valid: false, message: 'Git repository must be initialized first' };
    }

    return { valid: true };
  }

  async execute(context) {
    const { targetDir, interactive, config = {} } = context;
    let gitHubConfigured = false;
    let repoUrl = null;

    if (interactive) {
      // GitHub configuration
      const { configureGitHub } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'configureGitHub',
          message: 'Would you like to connect to a GitHub repository?',
          default: true
        }
      ]);

      if (configureGitHub) {
        const { repoUrl: inputRepoUrl } = await inquirer.prompt([
          {
            type: 'input',
            name: 'repoUrl',
            message: 'GitHub repository URL (optional):',
            validate: (input) => {
              if (!input) return true; // Optional
              if (input.includes('github.com')) return true;
              return 'Please enter a valid GitHub URL (e.g., https://github.com/username/repo)';
            }
          }
        ]);

        repoUrl = inputRepoUrl;
        gitHubConfigured = true;
      }
    } else if (config.github && config.github.repoUrl) {
      // Non-interactive mode with config provided
      repoUrl = config.github.repoUrl;
      gitHubConfigured = true;
    }

    // Configure GitHub remote if URL provided
    if (gitHubConfigured && repoUrl) {
      try {
        execSync(`git remote add origin ${repoUrl}`, { cwd: targetDir });
        console.log(chalk.green('✅ GitHub remote added'));
        
        // Ask about labels in interactive mode
        if (interactive) {
          const { setupLabels } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'setupLabels',
              message: 'Would you like to set up GitHub labels now?',
              default: true
            }
          ]);

          if (setupLabels) {
            await this.setupGitHubLabels(targetDir);
          }
        }
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not add GitHub remote:'));
        console.log(formatError(error, { command: 'git remote add' }));
      }
    }

    return {
      ...context,
      gitHubConfigured,
      githubRepoUrl: repoUrl
    };
  }

  async setupGitHubLabels(targetDir) {
    // Check for GitHub CLI
    try {
      execSync('gh --version', { stdio: 'ignore' });
      // Run labels setup
      console.log(chalk.blue('\n🏷️  Setting up GitHub labels...'));
      execSync('fsd labels', { cwd: targetDir, stdio: 'inherit' });
    } catch {
      console.log(chalk.yellow('⚠️  GitHub CLI not installed.'));
      console.log(chalk.gray('   Visit: https://cli.github.com/'));
      console.log(chalk.gray('   After installing, run: gh auth login'));
      console.log(chalk.gray('   Then run: fsd labels'));
    }
  }

  async rollback(context, error) {
    const { targetDir } = context;
    
    // Remove GitHub remote if it was added
    try {
      execSync('git remote remove origin', { cwd: targetDir, stdio: 'ignore' });
      console.log(chalk.yellow('🧹 Removed GitHub remote'));
    } catch (cleanupError) {
      // Remote might not have been added, ignore
    }
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        github: {
          type: 'object',
          properties: {
            repoUrl: {
              type: 'string',
              description: 'GitHub repository URL'
            },
            setupLabels: {
              type: 'boolean',
              description: 'Automatically setup GitHub labels'
            }
          }
        },
        skipGitHub: {
          type: 'boolean',
          description: 'Skip GitHub configuration'
        }
      }
    };
  }
}