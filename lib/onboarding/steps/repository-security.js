/**
 * Repository Security Detection Step
 */
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { OnboardingStep } from '../base.js';

export class RepositorySecurityStep extends OnboardingStep {
  constructor() {
    super('repository-security', 'Analyze repository security and visibility', {
      priority: 4, // After directory selection, before template processing
      required: false,
      dependencies: ['directory-selection']
    });
  }

  async validate(context) {
    const { targetDir } = context;
    
    if (!targetDir) {
      return { valid: false, message: 'Target directory is required' };
    }

    return { valid: true };
  }

  async execute(context) {
    const { targetDir, interactive } = context;
    
    // Detect repository status
    const repoStatus = await this.detectRepositoryVisibility(targetDir);
    
    // Security briefing and configuration
    const securityConfig = await this.performSecurityBriefing(repoStatus, interactive);
    
    return {
      ...context,
      repositoryStatus: repoStatus,
      securityMode: securityConfig.mode,
      securityWarningsShown: securityConfig.warningsShown,
      proceedWithSecurity: securityConfig.proceed
    };
  }

  /**
   * Detect repository visibility and status
   */
  async detectRepositoryVisibility(targetDir) {
    try {
      // Check if we're in a git repository
      const gitDir = `${targetDir}/.git`;
      const isGitRepo = fs.existsSync(gitDir);
      
      if (!isGitRepo) {
        return { 
          status: 'not-git', 
          public: null,
          message: 'No git repository detected'
        };
      }

      // Check for GitHub remote
      let remoteUrl = null;
      try {
        remoteUrl = execSync('git config --get remote.origin.url', { 
          cwd: targetDir, 
          encoding: 'utf-8' 
        }).trim();
      } catch (error) {
        return {
          status: 'git-no-remote',
          public: null,
          message: 'Git repository without remote origin'
        };
      }

      if (!remoteUrl.includes('github.com')) {
        return { 
          status: 'git-non-github', 
          public: null,
          remoteUrl,
          message: 'Git repository with non-GitHub remote'
        };
      }

      // Try to use GitHub CLI to check visibility
      try {
        execSync('gh --version', { stdio: 'ignore' });
        
        const repoInfo = JSON.parse(
          execSync('gh repo view --json visibility,url,owner', { 
            cwd: targetDir,
            encoding: 'utf-8' 
          })
        );
        
        return {
          status: 'github',
          public: repoInfo.visibility === 'public',
          private: repoInfo.visibility === 'private',
          repoUrl: repoInfo.url,
          owner: repoInfo.owner.login,
          message: `GitHub repository detected (${repoInfo.visibility})`
        };
      } catch (error) {
        // GitHub CLI not available or not authenticated
        return {
          status: 'github-no-cli',
          public: null,
          remoteUrl,
          message: 'GitHub repository detected (visibility unknown - GitHub CLI not available)'
        };
      }
    } catch (error) {
      return { 
        status: 'error', 
        public: null, 
        error: error.message,
        message: 'Error detecting repository status'
      };
    }
  }

  /**
   * Perform security briefing based on repository status
   */
  async performSecurityBriefing(repoStatus, interactive) {
    console.log(chalk.blue('\n🔍 Repository Security Analysis:\n'));
    
    // Show repository status
    this.displayRepositoryStatus(repoStatus);
    
    // Determine security mode and show appropriate warnings
    const securityMode = this.determineSecurityMode(repoStatus);
    const warningsShown = await this.showSecurityWarnings(repoStatus, securityMode, interactive);
    
    // Get user confirmation if needed
    const proceed = await this.getSecurityConfirmation(repoStatus, securityMode, interactive);
    
    return {
      mode: securityMode,
      warningsShown,
      proceed
    };
  }

  /**
   * Display repository status information
   */
  displayRepositoryStatus(repoStatus) {
    switch (repoStatus.status) {
      case 'not-git':
        console.log(chalk.gray('📁 Local project (no git repository)'));
        console.log(chalk.gray('   No version control detected'));
        break;
        
      case 'git-no-remote':
        console.log(chalk.yellow('📁 Local git repository'));
        console.log(chalk.gray('   No remote origin configured'));
        break;
        
      case 'git-non-github':
        console.log(chalk.blue('📁 Git repository detected'));
        console.log(chalk.gray(`   Remote: ${repoStatus.remoteUrl}`));
        break;
        
      case 'github':
        if (repoStatus.public) {
          console.log(chalk.red('🌍 PUBLIC GitHub repository detected'));
          console.log(chalk.yellow(`   URL: ${repoStatus.repoUrl}`));
          console.log(chalk.red('   ⚠️  Anyone can view this code and any committed secrets!'));
        } else {
          console.log(chalk.green('🔒 PRIVATE GitHub repository detected'));
          console.log(chalk.gray(`   URL: ${repoStatus.repoUrl}`));
          console.log(chalk.green('   ✅ Safe for real credentials and sensitive data'));
        }
        break;
        
      case 'github-no-cli':
        console.log(chalk.yellow('🔍 GitHub repository detected (visibility unknown)'));
        console.log(chalk.gray(`   Remote: ${repoStatus.remoteUrl}`));
        console.log(chalk.yellow('   Install GitHub CLI to check visibility: https://cli.github.com/'));
        break;
        
      default:
        console.log(chalk.red('❌ Error detecting repository status'));
        console.log(chalk.gray(`   ${repoStatus.message}`));
    }
  }

  /**
   * Determine appropriate security mode
   */
  determineSecurityMode(repoStatus) {
    if (repoStatus.public === true) {
      return 'public-demo';
    } else if (repoStatus.private === true) {
      return 'private-secure';
    } else if (repoStatus.status === 'not-git') {
      return 'local-development';
    } else {
      return 'unknown-cautious';
    }
  }

  /**
   * Show appropriate security warnings
   */
  async showSecurityWarnings(repoStatus, securityMode, interactive) {
    const warnings = [];

    switch (securityMode) {
      case 'public-demo':
        console.log(chalk.red('\n🚨 SECURITY WARNING: PUBLIC REPOSITORY\n'));
        console.log(chalk.yellow('This repository is publicly visible. Security guidelines:'));
        console.log(chalk.gray('  • NEVER commit real API keys, passwords, or secrets'));
        console.log(chalk.gray('  • Use placeholder values in all configuration files'));
        console.log(chalk.gray('  • All .env files will use demo/example values only'));
        console.log(chalk.gray('  • Consider making this repository private for real projects'));
        warnings.push('public-repository-warning');
        break;

      case 'private-secure':
        console.log(chalk.green('\n✅ PRIVATE REPOSITORY: SECURE CONFIGURATION\n'));
        console.log(chalk.blue('This repository is private. You can safely:'));
        console.log(chalk.gray('  • Configure real Supabase credentials'));
        console.log(chalk.gray('  • Store sensitive configuration (still use .env files)'));
        console.log(chalk.gray('  • Set up team collaboration features'));
        console.log(chalk.gray('  • Prepare for production deployment'));
        break;

      case 'unknown-cautious':
        console.log(chalk.yellow('\n⚠️  UNKNOWN REPOSITORY VISIBILITY\n'));
        console.log(chalk.yellow('Cannot determine if repository is public or private.'));
        console.log(chalk.blue('Proceeding with cautious security settings:'));
        console.log(chalk.gray('  • Using placeholder values for safety'));
        console.log(chalk.gray('  • Install GitHub CLI for better security detection'));
        console.log(chalk.gray('  • Review repository settings manually'));
        warnings.push('unknown-visibility-warning');
        break;

      case 'local-development':
        console.log(chalk.blue('\n📁 LOCAL DEVELOPMENT PROJECT\n'));
        console.log(chalk.blue('No git repository detected. Recommendations:'));
        console.log(chalk.gray('  • Initialize git for version control'));
        console.log(chalk.gray('  • Choose repository visibility carefully'));
        console.log(chalk.gray('  • Consider security implications before pushing'));
        break;
    }

    return warnings;
  }

  /**
   * Get user confirmation for security settings
   */
  async getSecurityConfirmation(repoStatus, securityMode, interactive) {
    if (!interactive) {
      return true; // Non-interactive mode proceeds with secure defaults
    }

    if (securityMode === 'public-demo') {
      console.log(chalk.yellow('\nIMPORTANT: Proceeding will create a demo project with placeholder values.'));
      
      const { understanding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'understanding',
          message: 'Do you understand the security implications of public repositories?',
          default: false
        }
      ]);

      if (!understanding) {
        console.log(chalk.blue('\n💡 Consider these alternatives:'));
        console.log(chalk.gray('  • Make this repository private'));
        console.log(chalk.gray('  • Create a new private repository'));
        console.log(chalk.gray('  • Use this for learning/demo purposes only'));
        
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Continue with demo/learning setup anyway?',
            default: false
          }
        ]);

        if (!proceed) {
          throw new Error('Setup cancelled for security reasons. Consider using a private repository.');
        }
      }
    }

    return true;
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        security: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['public-demo', 'private-secure', 'local-development', 'unknown-cautious'],
              description: 'Security mode for the project'
            },
            skipWarnings: {
              type: 'boolean',
              description: 'Skip security warnings (not recommended)'
            }
          }
        }
      }
    };
  }
}