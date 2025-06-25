/**
 * Vercel Deployment Module for Flow State Dev
 * 
 * Provides Vercel deployment configuration and scripts for modern web applications.
 * Supports both static sites and serverless functions.
 */
import { BaseStackModule } from '../types/base-stack-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';

export class VercelModule extends BaseStackModule {
  constructor() {
    super('vercel', 'Vercel - Deployment Platform', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.DEPLOYMENT,
      category: MODULE_CATEGORIES.DEVOPS,
      provides: [
        MODULE_PROVIDES.DEPLOYMENT,
        MODULE_PROVIDES.CI_CD
      ],
      requires: [MODULE_PROVIDES.FRONTEND],
      compatibleWith: ['vue-base', 'react', 'angular', 'svelte'],
      incompatibleWith: ['netlify'],
      priority: 60,
      templatePath: 'templates/modules/vercel'
    });

    // Deployment specific properties
    this.platform = 'vercel';
    this.supportsFunctions = true;
    this.supportsEdgeFunctions = true;
    this.supportsStaticSites = true;
    this.supportsSSR = true;
    this.supportsSPA = true;
    this.supportsAPIs = true;
    this.customDomains = true;
    this.ssl = true;
    this.cdn = true;
    this.analytics = true;

    this.defaultConfig = {
      deploymentType: 'static', // static, spa, ssr, api
      analytics: false,
      functions: false,
      edge: false,
      customDomain: '',
      environment: 'production'
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'vercel.json': MERGE_STRATEGIES.REPLACE,
      '.vercelignore': MERGE_STRATEGIES.APPEND_UNIQUE,
      'api/**/*': MERGE_STRATEGIES.REPLACE
    };

    this.setupInstructions = [
      'Vercel deployment is configured for your project:',
      '  • Run "npm run deploy" to deploy to Vercel',
      '  • Set environment variables in Vercel dashboard',
      '  • Configure custom domain in Vercel settings',
      '  • Enable analytics if desired'
    ];

    this.postInstallSteps = [
      'Install Vercel CLI: npm i -g vercel',
      'Login to Vercel: vercel login',
      'Deploy your project: vercel --prod'
    ];
  }

  /**
   * Get deployment configuration based on project type
   */
  getVercelConfig(context) {
    const { framework, modules } = context;
    
    // Detect project type
    const hasAPI = modules?.some(m => m.provides?.includes('api'));
    const hasSSR = framework?.value?.includes('nuxt') || framework?.value?.includes('next');
    const isSPA = !hasSSR;

    const config = {
      version: 2,
      name: context.projectName || 'my-app'
    };

    // Build configuration
    if (framework?.value === 'vue-vuetify' || framework?.value === 'vue') {
      config.buildCommand = 'npm run build';
      config.outputDirectory = 'dist';
      config.devCommand = 'npm run dev';
    } else if (framework?.value === 'react') {
      config.buildCommand = 'npm run build';
      config.outputDirectory = 'build';
      config.devCommand = 'npm run dev';
    }

    // SPA configuration
    if (isSPA) {
      config.routes = [
        {
          src: '/(.*)',
          dest: '/index.html'
        }
      ];
    }

    // API routes (if Supabase or custom API)
    if (hasAPI) {
      config.functions = {
        'api/**/*.js': {
          runtime: 'nodejs18.x'
        }
      };
    }

    // Environment variables template
    config.env = {
      NODE_ENV: 'production'
    };

    // Add Supabase env if present
    const hasSupabase = modules?.some(m => m.name === 'supabase');
    if (hasSupabase) {
      config.env.VITE_SUPABASE_URL = '@supabase_url';
      config.env.VITE_SUPABASE_ANON_KEY = '@supabase_anon_key';
    }

    return config;
  }

  /**
   * Get package.json scripts for deployment
   */
  getDeploymentScripts(context) {
    return {
      'deploy': 'vercel --prod',
      'deploy:preview': 'vercel',
      'vercel:env': 'vercel env pull .env.local',
      'vercel:logs': 'vercel logs'
    };
  }

  /**
   * Get .vercelignore content
   */
  getVercelIgnore() {
    return `# Dependencies
node_modules/

# Environment variables
.env
.env.*
!.env.example

# Build artifacts
dist/
build/
.next/

# Development files
src/
public/
*.config.js
*.config.ts

# Documentation
docs/
README.md

# Testing
test/
tests/
__tests__/
*.test.js
*.test.ts
*.spec.js
*.spec.ts

# IDE
.vscode/
.idea/

# Logs
logs/
*.log

# Cache
.cache/
.temp/

# OS
.DS_Store
Thumbs.db`;
  }

  /**
   * Get README deployment section
   */
  getDeploymentDocs(context) {
    return `## Deployment

This project is configured for deployment on [Vercel](https://vercel.com).

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=${context.repository || 'https://github.com/user/repo'})

### Manual Deployment

1. Install Vercel CLI:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. Login to Vercel:
   \`\`\`bash
   vercel login
   \`\`\`

3. Deploy:
   \`\`\`bash
   # Deploy to preview
   npm run deploy:preview
   
   # Deploy to production
   npm run deploy
   \`\`\`

### Environment Variables

Set the following environment variables in your Vercel dashboard:

${context.modules?.some(m => m.name === 'supabase') ? `
- \`VITE_SUPABASE_URL\` - Your Supabase project URL
- \`VITE_SUPABASE_ANON_KEY\` - Your Supabase anonymous key
` : ''}

### Custom Domain

1. Go to your project settings in Vercel dashboard
2. Navigate to "Domains" section
3. Add your custom domain
4. Configure DNS as instructed

### Analytics

Enable Vercel Analytics in your project settings to get insights about your application performance and usage.
`;
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

    for (const module of otherModules) {
      // Check for conflicting deployment providers
      if (this.incompatibleWith.includes(module.name)) {
        result.compatible = false;
        result.issues.push({
          type: 'incompatible',
          module: module.name,
          message: `Cannot use both Vercel and ${module.name} for deployment`
        });
      }

      // Check for multiple deployment modules
      if (module.moduleType === MODULE_TYPES.DEPLOYMENT && module.name !== this.name) {
        result.compatible = false;
        result.issues.push({
          type: 'multiple-deployment',
          module: module.name,
          message: 'Cannot have multiple deployment providers'
        });
      }
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

    // Validate deployment type
    const validTypes = ['static', 'spa', 'ssr', 'api'];
    if (config.deploymentType && !validTypes.includes(config.deploymentType)) {
      result.errors.push(`deploymentType must be one of: ${validTypes.join(', ')}`);
      result.valid = false;
    }

    // Validate boolean options
    const booleanOptions = ['analytics', 'functions', 'edge'];
    for (const option of booleanOptions) {
      if (config[option] !== undefined && typeof config[option] !== 'boolean') {
        result.errors.push(`${option} must be a boolean`);
        result.valid = false;
      }
    }

    // Validate custom domain format
    if (config.customDomain && config.customDomain.length > 0) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(config.customDomain)) {
        result.warnings.push('Custom domain format may be invalid');
      }
    }

    return result;
  }

  /**
   * Get post-installation instructions
   */
  getPostInstallInstructions(context) {
    const instructions = [...this.setupInstructions];
    
    instructions.push('', 'Next steps:');
    instructions.push(...this.postInstallSteps);

    if (context.modules?.some(m => m.name === 'supabase')) {
      instructions.push('', 'Supabase Integration:');
      instructions.push('  • Set VITE_SUPABASE_URL in Vercel environment variables');
      instructions.push('  • Set VITE_SUPABASE_ANON_KEY in Vercel environment variables');
    }

    return instructions;
  }

  /**
   * Format module for display
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = `${selected ? '✓' : '○'} Vercel - Frontend deployment platform`;
    
    if (showDetails) {
      const features = [];
      if (this.supportsStaticSites) features.push('Static Sites');
      if (this.supportsSPA) features.push('SPA');
      if (this.supportsSSR) features.push('SSR');
      if (this.supportsFunctions) features.push('Functions');
      if (this.analytics) features.push('Analytics');
      
      display += `\n  Features: ${features.join(', ')}`;
      display += `\n  Platform: ${this.platform}`;
      display += `\n  SSL & CDN: Included`;
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
    // Vercel module uses file scanning approach
    return {};
  }
}

// Export class
export default VercelModule;