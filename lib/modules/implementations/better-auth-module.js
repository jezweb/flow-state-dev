/**
 * Better Auth Authentication Module for Flow State Dev
 * 
 * Provides Better Auth integration with support for multiple providers,
 * session management, and secure authentication flows.
 */
import { BaseStackModule } from '../types/base-stack-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';

export class BetterAuthModule extends BaseStackModule {
  constructor() {
    super('better-auth', 'Better Auth Authentication System', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.AUTHENTICATION,
      category: 'auth-provider',
      provides: [
        MODULE_PROVIDES.AUTHENTICATION,
        MODULE_PROVIDES.SESSION_MANAGEMENT
      ],
      requires: [],
      compatibleWith: ['sveltekit', 'react', 'vue3', 'supabase'],
      incompatibleWith: ['auth0', 'clerk', 'firebase-auth'],
      priority: 70,
      templatePath: 'templates/modules/better-auth'
    });

    this.defaultConfig = {
      providers: ['email', 'google'],
      database: 'sqlite',
      sessionStrategy: 'jwt',
      enableMFA: false,
      enablePasswordReset: true,
      enableEmailVerification: true
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'src/lib/auth/**/*': MERGE_STRATEGIES.REPLACE,
      'src/lib/server/auth.ts': MERGE_STRATEGIES.REPLACE,
      'src/routes/auth/**/*': MERGE_STRATEGIES.REPLACE,
      '.env.example': MERGE_STRATEGIES.APPEND_UNIQUE
    };

    this.setupInstructions = [
      'Better Auth is configured with:',
      '  • Email/Password authentication',
      '  • OAuth providers support',
      '  • Session management',
      '  • Secure authentication flows',
      '  • Password reset functionality',
      '  • Email verification'
    ];

    this.postInstallSteps = [
      'Configure your environment variables in .env',
      'Set up your database connection',
      'Configure OAuth providers if needed',
      'Run database migrations with "npm run db:migrate"'
    ];
  }

  /**
   * Get Better Auth dependencies
   */
  getDependencies(context) {
    const deps = {
      'better-auth': '^0.0.21',
      '@better-auth/client': '^0.0.21'
    };

    // Add database driver dependencies
    if (context.database === 'postgres') {
      deps['pg'] = '^8.11.0';
    } else if (context.database === 'mysql') {
      deps['mysql2'] = '^3.9.0';
    } else if (context.database === 'sqlite') {
      deps['better-sqlite3'] = '^9.4.0';
    }

    // Add provider-specific dependencies
    if (context.providers?.includes('google')) {
      deps['@better-auth/oauth-google'] = '^0.0.21';
    }
    if (context.providers?.includes('github')) {
      deps['@better-auth/oauth-github'] = '^0.0.21';
    }

    return deps;
  }

  /**
   * Get dev dependencies
   */
  getDevDependencies(context) {
    const devDeps = {
      '@types/better-sqlite3': '^7.6.9'
    };

    if (context.database === 'postgres') {
      devDeps['@types/pg'] = '^8.11.0';
    }

    return devDeps;
  }

  /**
   * Get package.json scripts
   */
  getScripts(context) {
    const scripts = {
      'db:migrate': 'better-auth migrate',
      'db:generate': 'better-auth generate'
    };

    return scripts;
  }

  /**
   * Get environment variables template
   */
  getEnvTemplate(context) {
    let env = `# Better Auth Configuration
BETTER_AUTH_SECRET={{generateSecret}}
BETTER_AUTH_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=${this.getDatabaseUrl(context)}
`;

    // Add provider-specific env vars
    if (context.providers?.includes('google')) {
      env += `
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
`;
    }

    if (context.providers?.includes('github')) {
      env += `
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
`;
    }

    if (context.enableEmailVerification || context.enablePasswordReset) {
      env += `
# Email Configuration (for password reset and verification)
EMAIL_FROM=noreply@example.com
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
`;
    }

    return env;
  }

  /**
   * Get database URL based on configuration
   */
  getDatabaseUrl(context) {
    switch (context.database) {
      case 'postgres':
        return 'postgresql://user:password@localhost:5432/mydb';
      case 'mysql':
        return 'mysql://user:password@localhost:3306/mydb';
      case 'sqlite':
      default:
        return 'file:./dev.db';
    }
  }

  /**
   * Get auth configuration template
   */
  getAuthConfigTemplate(context) {
    const providers = [];
    
    if (context.providers?.includes('email')) {
      providers.push(`
    emailPassword({
      enabled: true,
      requireEmailVerification: ${context.enableEmailVerification}
    })`);
    }

    if (context.providers?.includes('google')) {
      providers.push(`
    google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })`);
    }

    if (context.providers?.includes('github')) {
      providers.push(`
    github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    })`);
    }

    return `import { betterAuth } from 'better-auth'
import { emailPassword, google, github } from 'better-auth/providers'
import Database from 'better-sqlite3'

const db = new Database(process.env.DATABASE_URL!)

export const auth = betterAuth({
  database: db,
  session: {
    strategy: '${context.sessionStrategy || 'jwt'}'
  },
  providers: [${providers.join(',')}
  ],
  callbacks: {
    onRequest: async ({ request, user }) => {
      // Add custom logic here
    },
    onResponse: async ({ response, user }) => {
      // Add custom logic here
    }
  }
})

export type Auth = typeof auth`;
  }

  /**
   * Get client configuration template
   */
  getClientConfigTemplate(context) {
    return `import { createClient } from '@better-auth/client'
import type { Auth } from '$lib/server/auth'

export const authClient = createClient<Auth>({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || 'http://localhost:5173'
})`;
  }

  /**
   * Check compatibility with other modules
   */
  checkCompatibility(otherModules) {
    const result = {
      compatible: true,
      issues: [],
      warnings: []
    };

    // Check for conflicting auth providers
    const authModules = otherModules.filter(m => 
      m.provides.includes(MODULE_PROVIDES.AUTHENTICATION)
    );

    if (authModules.length > 0) {
      result.compatible = false;
      result.issues.push({
        type: 'multiple-auth',
        modules: authModules.map(m => m.name),
        message: 'Cannot have multiple authentication providers'
      });
    }

    // Check framework compatibility
    const hasCompatibleFramework = otherModules.some(m => 
      ['sveltekit', 'react', 'vue3'].includes(m.name)
    );

    if (!hasCompatibleFramework) {
      result.warnings.push({
        type: 'no-framework',
        message: 'Better Auth requires a compatible framework (SvelteKit, React, or Vue)'
      });
    }

    return result;
  }

  /**
   * Validate module configuration
   */
  validateConfig(config) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Validate providers
    const validProviders = ['email', 'google', 'github', 'discord', 'twitter'];
    if (config.providers) {
      for (const provider of config.providers) {
        if (!validProviders.includes(provider)) {
          result.errors.push(`Invalid provider: ${provider}`);
          result.valid = false;
        }
      }
    }

    // Validate database
    const validDatabases = ['sqlite', 'postgres', 'mysql'];
    if (config.database && !validDatabases.includes(config.database)) {
      result.errors.push(`database must be one of: ${validDatabases.join(', ')}`);
      result.valid = false;
    }

    // Validate session strategy
    const validStrategies = ['jwt', 'database'];
    if (config.sessionStrategy && !validStrategies.includes(config.sessionStrategy)) {
      result.errors.push(`sessionStrategy must be one of: ${validStrategies.join(', ')}`);
      result.valid = false;
    }

    return result;
  }

  /**
   * Get post-installation instructions
   */
  getPostInstallInstructions(context) {
    const instructions = [...this.setupInstructions];
    
    instructions.push('', 'Setup steps:');
    instructions.push(...this.postInstallSteps);

    if (context.providers?.includes('google')) {
      instructions.push('', 'Google OAuth Setup:');
      instructions.push('  1. Create a project at https://console.cloud.google.com');
      instructions.push('  2. Enable Google+ API');
      instructions.push('  3. Create OAuth 2.0 credentials');
      instructions.push('  4. Add authorized redirect URIs');
      instructions.push('  5. Copy client ID and secret to .env');
    }

    if (context.providers?.includes('github')) {
      instructions.push('', 'GitHub OAuth Setup:');
      instructions.push('  1. Go to GitHub Settings > Developer settings > OAuth Apps');
      instructions.push('  2. Create a new OAuth App');
      instructions.push('  3. Set authorization callback URL');
      instructions.push('  4. Copy client ID and secret to .env');
    }

    return instructions;
  }

  /**
   * Format module for display
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = `${selected ? '✓' : '○'} Better Auth - Modern authentication for web applications`;
    
    if (showDetails) {
      const features = [];
      features.push('Email/Password');
      features.push('OAuth Providers');
      features.push('Session Management');
      features.push('MFA Support');
      
      display += `\n  Features: ${features.join(', ')}`;
      display += `\n  Databases: SQLite, PostgreSQL, MySQL`;
    }
    
    return display;
  }

  /**
   * Get module name
   */
  getName() {
    return this.name;
  }

  /**
   * Get module description
   */
  getDescription() {
    return this.description;
  }

  /**
   * Get file templates
   */
  getFileTemplates(context) {
    // Better Auth module uses template scanning approach
    return {};
  }
}

// Export class
export default BetterAuthModule;