/**
 * Supabase Configuration Step
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { OnboardingStep } from '../base.js';

export class SupabaseConfigurationStep extends OnboardingStep {
  constructor() {
    super('supabase-config', 'Configure Supabase connection', {
      priority: 20,
      required: false,
      dependencies: ['template-processing', 'repository-security']
    });
  }

  shouldRun(context) {
    // Only run if interactive mode or supabase config provided
    return context.interactive || (context.config && context.config.supabase);
  }

  async validate(context) {
    const { targetDir } = context;
    
    if (!targetDir) {
      return { valid: false, message: 'Target directory is required' };
    }

    return { valid: true };
  }

  async execute(context) {
    const { targetDir, projectName, interactive, config = {}, securityMode } = context;
    let supabaseConfigured = false;
    let supabaseConfig = null;
    let configureSupabase = false;

    if (interactive) {
      console.log(chalk.blue('\n🔧 Let\'s configure your project:\n'));

      // Show security-aware Supabase configuration
      const response = await this.getSupabaseConfigurationChoice(securityMode);
      configureSupabase = response.configureSupabase;

      if (configureSupabase) {
        supabaseConfig = await this.getSupabaseCredentials(securityMode);
        supabaseConfigured = supabaseConfig !== null; // Only set to true if not skipped
      }
    } else if (config.supabase) {
      // Non-interactive mode with config provided
      supabaseConfig = config.supabase;
      supabaseConfigured = true;
    }

    // Create appropriate .env file based on security mode
    if (supabaseConfigured && supabaseConfig) {
      await this.createEnvironmentFile(targetDir, projectName, supabaseConfig, securityMode);
      console.log(chalk.green('✅ Supabase configured with security-appropriate settings'));
    } else {
      // Create template files based on security mode
      await this.createEnvironmentTemplate(targetDir, projectName, securityMode);
      if (configureSupabase && !supabaseConfigured) {
        console.log(chalk.yellow('⏭️  Supabase setup skipped - you can configure it manually later'));
        console.log(chalk.gray('   Check the .env.example file for configuration templates'));
      }
    }

    return {
      ...context,
      supabaseConfigured,
      supabaseConfig
    };
  }

  /**
   * Get Supabase configuration choice with security context
   */
  async getSupabaseConfigurationChoice(securityMode) {
    const messages = {
      'public-demo': 'Would you like to configure Supabase with demo/placeholder values?',
      'private-secure': 'Would you like to configure Supabase with your real credentials?',
      'unknown-cautious': 'Would you like to configure Supabase (will use placeholder values for safety)?',
      'local-development': 'Would you like to configure Supabase for local development?'
    };

    const message = messages[securityMode] || 'Would you like to configure Supabase now?';

    return await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureSupabase',
        message,
        default: true
      }
    ]);
  }

  /**
   * Get Supabase credentials with security-appropriate prompts
   */
  async getSupabaseCredentials(securityMode) {
    if (securityMode === 'public-demo' || securityMode === 'unknown-cautious') {
      // Use placeholder values for public repositories
      return await this.getPlaceholderCredentials();
    } else {
      // Get real credentials for private repositories (may return null if skipped)
      return await this.getRealCredentials();
    }
  }

  /**
   * Get placeholder credentials for public repositories
   */
  async getPlaceholderCredentials() {
    console.log(chalk.yellow('\n📋 Using placeholder values - you can update these later:\n'));
    
    return {
      supabaseUrl: 'https://your-project-id.supabase.co',
      supabaseAnonKey: 'your-anon-key-here'
    };
  }

  /**
   * Get real credentials for private repositories
   */
  async getRealCredentials() {
    // First ask if they want to continue with Supabase or skip
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Choose how to proceed with Supabase configuration:',
        choices: [
          { name: '🔧 Enter Supabase credentials now', value: 'configure' },
          { name: '⏭️  Skip Supabase setup (configure manually later)', value: 'skip' },
          { name: '📋 Use placeholder values for now', value: 'placeholder' }
        ]
      }
    ]);

    if (action === 'skip') {
      return null; // Return null to indicate skipping
    }

    if (action === 'placeholder') {
      return await this.getPlaceholderCredentials();
    }

    // Continue with real credential gathering
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'supabaseUrl',
        message: 'Supabase project URL:',
        validate: (input) => {
          if (!input) return 'Supabase URL is required (or go back and choose "Skip")';
          if (input.includes('supabase.co') || input.includes('localhost')) return true;
          return 'Please enter a valid Supabase URL (e.g., https://xyzabc.supabase.co)';
        }
      },
      {
        type: 'password',
        name: 'supabaseAnonKey',
        message: 'Supabase anon key:',
        validate: (input) => {
          if (!input) return 'Supabase anon key is required (or restart and choose "Skip")';
          return true;
        }
      }
    ]);

    // Validate that credentials don't look like placeholders
    if (this.looksLikePlaceholder(answers.supabaseUrl) || this.looksLikePlaceholder(answers.supabaseAnonKey)) {
      console.log(chalk.yellow('\n⚠️  The values you entered look like placeholders.'));
      const { confirmPlaceholder } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmPlaceholder',
          message: 'Are you sure you want to use these values?',
          default: false
        }
      ]);
      
      if (!confirmPlaceholder) {
        console.log(chalk.blue('Please enter your real Supabase credentials.'));
        return await this.getRealCredentials();
      }
    }

    return answers;
  }

  /**
   * Check if a value looks like a placeholder
   */
  looksLikePlaceholder(value) {
    const placeholderPatterns = [
      /your[-_]?project[-_]?id/i,
      /your[-_]?anon[-_]?key/i,
      /placeholder/i,
      /example/i,
      /xxx+/i,
      /abc+/i,
      /123+/i
    ];
    
    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Create environment file with security-appropriate content
   */
  async createEnvironmentFile(targetDir, projectName, supabaseConfig, securityMode) {
    const envPath = path.join(targetDir, '.env');
    
    if (securityMode === 'public-demo' || securityMode === 'unknown-cautious') {
      // Create .env.example for public repositories
      const envExamplePath = path.join(targetDir, '.env.example');
      const envContent = this.generateSecureEnvironmentTemplate(projectName, supabaseConfig, securityMode);
      await fs.writeFile(envExamplePath, envContent);
      
      // Also create instructions
      const instructionsPath = path.join(targetDir, 'ENVIRONMENT_SETUP.md');
      await fs.writeFile(instructionsPath, this.generateEnvironmentInstructions(securityMode));
      
      console.log(chalk.yellow('📄 Created .env.example with placeholder values'));
      console.log(chalk.blue('📖 See ENVIRONMENT_SETUP.md for configuration instructions'));
    } else {
      // Create actual .env file for private repositories
      const envContent = this.generateEnvironmentFile(projectName, supabaseConfig);
      await fs.writeFile(envPath, envContent);
    }
  }

  /**
   * Create environment template when Supabase is not configured
   */
  async createEnvironmentTemplate(targetDir, projectName, securityMode) {
    const envExamplePath = path.join(targetDir, '.env.example');
    const templateConfig = {
      supabaseUrl: 'https://your-project-id.supabase.co',
      supabaseAnonKey: 'your-anon-key-here'
    };
    
    const envContent = this.generateSecureEnvironmentTemplate(projectName, templateConfig, securityMode);
    await fs.writeFile(envExamplePath, envContent);
    console.log(chalk.blue('📄 Created .env.example template for future configuration'));
  }

  /**
   * Generate environment file content
   */
  generateEnvironmentFile(projectName, supabaseConfig) {
    return `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseConfig.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseConfig.supabaseAnonKey}

# App Configuration
VITE_APP_NAME="${projectName}"
VITE_APP_ENV=development

# Development Settings
VITE_DEBUG=true
`;
  }

  /**
   * Generate secure environment template
   */
  generateSecureEnvironmentTemplate(projectName, supabaseConfig, securityMode) {
    const securityHeaders = {
      'public-demo': `# 🔒 SECURITY NOTICE: This is a PUBLIC repository!
# NEVER commit real credentials. Use these placeholder values only.
# For real development:
# 1. Copy this file to .env.local
# 2. Replace with your actual Supabase credentials  
# 3. .env.local is automatically ignored by git`,
      
      'private-secure': `# 🔒 Private Repository - Safe for real credentials
# These values are used for your development environment`,
      
      'unknown-cautious': `# ⚠️ Repository visibility unknown - using safe defaults
# If this is a public repository, NEVER commit real credentials
# If this is a private repository, you can safely use real values`,
      
      'local-development': `# 📁 Local Development Configuration
# Choose appropriate security settings before pushing to remote`
    };

    const header = securityHeaders[securityMode] || securityHeaders['unknown-cautious'];

    return `${header}

# Supabase Configuration
VITE_SUPABASE_URL=${supabaseConfig.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseConfig.supabaseAnonKey}

# App Configuration
VITE_APP_NAME="${projectName}"
VITE_APP_ENV=development

# Development Settings
VITE_DEBUG=true

# Additional Configuration (uncomment as needed)
# VITE_SUPABASE_SERVICE_KEY=your-service-key-here
# VITE_APP_VERSION=1.0.0
`;
  }

  /**
   * Generate environment setup instructions
   */
  generateEnvironmentInstructions(securityMode) {
    return `# Environment Configuration Instructions

## Security Mode: ${securityMode}

### For Development

1. **Copy the template:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Edit .env.local with your real credentials:**
   - Replace \`your-project-id\` with your actual Supabase project ID
   - Replace \`your-anon-key-here\` with your real anon key
   - Add any additional environment variables you need

3. **Verify .env.local is ignored:**
   - Check that \`.env.local\` is in your \`.gitignore\`
   - Never commit files containing real credentials

### Security Best Practices

- ✅ Use \`.env.local\` for real credentials (automatically ignored by git)
- ✅ Keep \`.env.example\` with placeholder values (safe to commit)
- ❌ Never commit \`.env\` files with real credentials
- ❌ Never hardcode secrets in your source code

### Getting Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy your:
   - Project URL
   - Anon/Public key

### Troubleshooting

If you see connection errors:
- Verify your Supabase URL format: \`https://xxx.supabase.co\`
- Check that your anon key is correct
- Ensure your Supabase project is active
`;
  }

  async rollback(context, error) {
    const { targetDir } = context;
    
    // Remove .env file if it was created
    const envPath = path.join(targetDir, '.env');
    if (fs.existsSync(envPath)) {
      try {
        await fs.remove(envPath);
        console.log(chalk.yellow('🧹 Removed .env file'));
      } catch (cleanupError) {
        console.log(chalk.red(`Failed to remove .env file: ${cleanupError.message}`));
      }
    }
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        supabase: {
          type: 'object',
          properties: {
            supabaseUrl: {
              type: 'string',
              description: 'Supabase project URL'
            },
            supabaseAnonKey: {
              type: 'string',
              description: 'Supabase anonymous key'
            }
          },
          required: ['supabaseUrl', 'supabaseAnonKey']
        },
        skipSupabase: {
          type: 'boolean',
          description: 'Skip Supabase configuration'
        }
      }
    };
  }
}