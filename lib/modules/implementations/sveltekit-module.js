/**
 * SvelteKit Frontend Framework Module for Flow State Dev
 * 
 * Provides SvelteKit 2.0 project scaffolding with TypeScript support,
 * routing, state management, and modern development tooling.
 */
import { FrontendFrameworkModule } from '../types/frontend-framework-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';

export class SvelteKitModule extends FrontendFrameworkModule {
  constructor() {
    super('sveltekit', 'SvelteKit Frontend Framework', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.FRONTEND_FRAMEWORK,
      category: 'frontend',
      provides: [
        MODULE_PROVIDES.FRONTEND,
        MODULE_PROVIDES.ROUTING,
        MODULE_PROVIDES.STATE_MANAGEMENT
      ],
      requires: [],
      compatibleWith: ['tailwind', 'better-auth', 'supabase', 'firebase'],
      incompatibleWith: ['vue3', 'vue-base', 'react', 'angular'],
      priority: 80,
      templatePath: 'templates/modules/sveltekit'
    });

    // Frontend Framework specific properties
    this.framework = 'sveltekit';
    this.buildTool = 'vite';
    this.typescript = true;
    this.packageManager = 'npm';
    this.stateManagement = ['stores', 'runes'];
    this.routing = true;
    this.testing = ['vitest', 'playwright'];
    this.linting = true;
    this.formatting = true;

    this.defaultConfig = {
      typescript: true,
      adapter: 'auto',
      testing: true,
      eslint: true,
      prettier: true,
      vitest: true,
      playwright: true
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'vite.config.js': MERGE_STRATEGIES.REPLACE,
      'svelte.config.js': MERGE_STRATEGIES.REPLACE,
      'tsconfig.json': MERGE_STRATEGIES.MERGE_JSON,
      'eslint.config.js': MERGE_STRATEGIES.REPLACE,
      'src/**/*': MERGE_STRATEGIES.REPLACE,
      'static/**/*': MERGE_STRATEGIES.REPLACE
    };

    this.setupInstructions = [
      'SvelteKit 2.0 project is ready with:',
      '  • Vite for fast development and building',
      '  • TypeScript for type safety',
      '  • File-based routing',
      '  • ESLint and Prettier for code quality',
      '  • Vitest for unit testing',
      '  • Playwright for e2e testing',
      '  • Hot module replacement for development'
    ];

    this.postInstallSteps = [
      'Run "npm run dev" to start development server',
      'Edit src/routes/+page.svelte to customize your home page',
      'Add components in src/lib/components/',
      'Create new routes by adding +page.svelte files in src/routes/'
    ];
  }

  /**
   * Get SvelteKit-specific dependencies
   */
  getDependencies(context) {
    const deps = {
      '@sveltejs/adapter-auto': '^3.0.0'
    };

    // Add adapter dependencies
    if (context.adapter === 'vercel') {
      deps['@sveltejs/adapter-vercel'] = '^5.0.0';
    } else if (context.adapter === 'netlify') {
      deps['@sveltejs/adapter-netlify'] = '^4.0.0';
    } else if (context.adapter === 'node') {
      deps['@sveltejs/adapter-node'] = '^5.0.0';
    }

    return deps;
  }

  /**
   * Get SvelteKit-specific dev dependencies
   */
  getDevDependencies(context) {
    const devDeps = {
      '@sveltejs/kit': '^2.0.0',
      '@sveltejs/vite-plugin-svelte': '^3.0.0',
      'svelte': '^4.2.0',
      'vite': '^5.0.8',
      'eslint': '^8.56.0',
      'eslint-plugin-svelte': '^2.35.0',
      'prettier': '^3.1.1',
      'prettier-plugin-svelte': '^3.1.2',
      'svelte-check': '^3.6.0'
    };

    // TypeScript dependencies
    if (context.typescript !== false) {
      devDeps['@types/node'] = '^20.0.0';
      devDeps['typescript'] = '^5.3.3';
      devDeps['tslib'] = '^2.6.0';
    }

    // Testing dependencies
    if (context.vitest !== false) {
      devDeps['vitest'] = '^1.2.0';
      devDeps['@testing-library/svelte'] = '^4.1.0';
      devDeps['@vitest/ui'] = '^1.2.0';
      devDeps['jsdom'] = '^24.0.0';
    }

    if (context.playwright !== false) {
      devDeps['@playwright/test'] = '^1.41.0';
    }

    return devDeps;
  }

  /**
   * Get package.json scripts
   */
  getScripts(context) {
    const scripts = {
      'dev': 'vite dev',
      'build': 'vite build',
      'preview': 'vite preview',
      'check': 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json',
      'check:watch': 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch',
      'lint': 'eslint .',
      'format': 'prettier --write .'
    };

    // Add testing scripts
    if (context.vitest !== false) {
      scripts['test'] = 'vitest';
      scripts['test:unit'] = 'vitest run';
      scripts['test:ui'] = 'vitest --ui';
    }

    if (context.playwright !== false) {
      scripts['test:e2e'] = 'playwright test';
      scripts['test:e2e:install'] = 'playwright install';
    }

    return scripts;
  }

  /**
   * Get Vite configuration for SvelteKit
   */
  getViteConfig(context) {
    const config = {
      plugins: ['sveltekit()'],
      imports: [
        "import { sveltekit } from '@sveltejs/kit/vite'",
        "import { defineConfig } from 'vite'"
      ],
      test: context.vitest !== false ? {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts']
      } : undefined
    };

    return config;
  }

  /**
   * Get Svelte configuration
   */
  getSvelteConfig(context) {
    let adapter = '@sveltejs/adapter-auto';
    
    if (context.adapter === 'vercel') {
      adapter = '@sveltejs/adapter-vercel';
    } else if (context.adapter === 'netlify') {
      adapter = '@sveltejs/adapter-netlify';
    } else if (context.adapter === 'node') {
      adapter = '@sveltejs/adapter-node';
    }

    return `import adapter from '${adapter}'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter()
  }
}

export default config`;
  }

  /**
   * Get ESLint configuration
   */
  getESLintConfig(context) {
    return `import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/']
  }
]`;
  }

  /**
   * Get TypeScript configuration
   */
  getTSConfig(context) {
    if (context.typescript === false) return null;

    return {
      extends: './.svelte-kit/tsconfig.json',
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        sourceMap: true,
        strict: true
      }
    };
  }

  /**
   * Get app.html template
   */
  getAppHtmlTemplate(context) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`;
  }

  /**
   * Get root layout template
   */
  getLayoutTemplate(context) {
    const isTS = context.typescript !== false;
    const ext = isTS ? 'ts' : 'js';

    return {
      layout: `<script>
  import './styles.css'
</script>

<slot />`,
      layoutScript: isTS ? `import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async () => {
  return {
    title: '{{projectName}}'
  }
}` : `/** @type {import('./$types').LayoutLoad} */
export async function load() {
  return {
    title: '{{projectName}}'
  }
}`
    };
  }

  /**
   * Get home page template
   */
  getHomePageTemplate(context) {
    const isTS = context.typescript !== false;

    return `<script${isTS ? ' lang="ts"' : ''}>
  import Counter from '$lib/components/Counter.svelte'
  import welcome from '$lib/images/svelte-welcome.webp'
  import welcome_fallback from '$lib/images/svelte-welcome.png'
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <h1>
    <span class="welcome">
      <picture>
        <source srcset={welcome} type="image/webp" />
        <img src={welcome_fallback} alt="Welcome" />
      </picture>
    </span>

    to your new<br />SvelteKit app
  </h1>

  <h2>
    try editing <strong>src/routes/+page.svelte</strong>
  </h2>

  <Counter />
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }

  h1 {
    width: 100%;
  }

  .welcome {
    display: block;
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
  }

  .welcome img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: block;
  }
</style>`;
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
      // Check for conflicting frontend frameworks
      if (this.incompatibleWith.includes(module.name)) {
        result.compatible = false;
        result.issues.push({
          type: 'incompatible',
          module: module.name,
          message: `Cannot use both SvelteKit and ${module.name} in the same project`
        });
      }

      // Check for multiple frontend frameworks
      if (module.moduleType === MODULE_TYPES.FRONTEND_FRAMEWORK && module.name !== this.name) {
        result.compatible = false;
        result.issues.push({
          type: 'multiple-frameworks',
          module: module.name,
          message: 'Cannot have multiple frontend frameworks'
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

    // Validate adapter choice
    const validAdapters = ['auto', 'vercel', 'netlify', 'node', 'static'];
    if (config.adapter && !validAdapters.includes(config.adapter)) {
      result.errors.push(`adapter must be one of: ${validAdapters.join(', ')}`);
      result.valid = false;
    }

    // Validate boolean options
    const booleanOptions = ['typescript', 'eslint', 'prettier', 'vitest', 'playwright'];
    for (const option of booleanOptions) {
      if (config[option] !== undefined && typeof config[option] !== 'boolean') {
        result.errors.push(`${option} must be a boolean`);
        result.valid = false;
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

    if (context.adapter === 'vercel') {
      instructions.push('', 'Vercel Deployment:');
      instructions.push('  • Deploy with "vercel" command or connect GitHub repo');
      instructions.push('  • Configure environment variables in Vercel dashboard');
    } else if (context.adapter === 'netlify') {
      instructions.push('', 'Netlify Deployment:');
      instructions.push('  • Deploy with "netlify deploy" or connect GitHub repo');
      instructions.push('  • Configure environment variables in Netlify dashboard');
    }

    if (context.vitest !== false) {
      instructions.push('', 'Unit Testing:');
      instructions.push('  • Run "npm run test" to start testing');
      instructions.push('  • Write tests in .test.ts or .spec.ts files');
      instructions.push('  • Use @testing-library/svelte for component tests');
    }

    if (context.playwright !== false) {
      instructions.push('', 'E2E Testing:');
      instructions.push('  • Run "npm run test:e2e:install" to install browsers');
      instructions.push('  • Run "npm run test:e2e" to run end-to-end tests');
      instructions.push('  • Write tests in tests/ directory');
    }

    return instructions;
  }

  /**
   * Format module for display
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = `${selected ? '✓' : '○'} SvelteKit - The fastest way to build Svelte apps`;
    
    if (showDetails) {
      const features = [];
      if (this.typescript) features.push('TypeScript');
      if (this.routing) features.push('File-based Routing');
      if (this.testing.length > 0) features.push('Testing');
      if (this.linting) features.push('ESLint');
      
      display += `\n  Features: ${features.join(', ')}`;
      display += `\n  Build Tool: ${this.buildTool}`;
      display += `\n  State Management: ${this.stateManagement.join(', ')}`;
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
   * Get file templates - uses new template scanning approach
   */
  getFileTemplates(context) {
    // SvelteKit module uses template scanning approach
    return {};
  }
}

// Export class
export default SvelteKitModule;