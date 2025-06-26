/**
 * Vue 3 Frontend Framework Module for Flow State Dev
 * 
 * Provides Vue 3 project scaffolding with Vite, TypeScript support,
 * routing, state management, and development tooling.
 */
import { FrontendFrameworkModule } from '../types/frontend-framework-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Vue3Module extends FrontendFrameworkModule {
  constructor() {
    super('vue-base', 'Vue 3 Frontend Framework with Vite', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.FRONTEND_FRAMEWORK,
      category: 'frontend-framework',
      provides: [
        MODULE_PROVIDES.FRONTEND,
        MODULE_PROVIDES.ROUTING,
        MODULE_PROVIDES.STATE_MANAGEMENT
      ],
      requires: [],
      compatibleWith: ['vuetify', 'tailwind', 'supabase', 'firebase'],
      incompatibleWith: ['react', 'angular'],
      priority: 90,
      templatePath: path.resolve(__dirname, '../../../templates/modules/vue3')
    });

    // Frontend Framework specific properties
    this.framework = 'vue3';
    this.buildTool = 'vite';
    this.typescript = true;
    this.packageManager = 'npm';
    this.stateManagement = 'pinia';
    this.routing = true;
    this.testing = ['vitest', 'vue-test-utils'];
    this.linting = true;
    this.formatting = true;

    this.defaultConfig = {
      typescript: true,
      router: true,
      pinia: true,
      eslint: true,
      prettier: true,
      vitest: true
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'vite.config.js': MERGE_STRATEGIES.MERGE_VITE_CONFIG,
      'vite.config.ts': MERGE_STRATEGIES.MERGE_VITE_CONFIG,
      'src/main.js': MERGE_STRATEGIES.MERGE_ENTRY,
      'src/main.ts': MERGE_STRATEGIES.MERGE_ENTRY,
      'src/router/index.js': MERGE_STRATEGIES.MERGE_ROUTES,
      'src/router/index.ts': MERGE_STRATEGIES.MERGE_ROUTES,
      'src/stores/index.js': MERGE_STRATEGIES.MERGE_STORES,
      'src/stores/index.ts': MERGE_STRATEGIES.MERGE_STORES,
      '.eslintrc.js': MERGE_STRATEGIES.MERGE_ESLINT,
      'tsconfig.json': MERGE_STRATEGIES.MERGE_JSON
    };

    this.setupInstructions = [
      'Run npm install to install dependencies',
      'Run npm run dev to start development server',
      'Open http://localhost:5173 in your browser'
    ];

    this.postInstallSteps = [
      'npm install',
      'npm run lint',
      'npm run type-check'
    ];

    this.gitignoreItems = [
      'node_modules/',
      'dist/',
      '.env.local',
      '.env.*.local',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*'
    ];
  }

  /**
   * Get NPM dependencies for Vue 3
   * @returns {Object} Dependencies object
   */
  getDependencies() {
    return {
      'vue': '^3.4.0',
      'vue-router': '^4.2.0',
      'pinia': '^2.1.0'
    };
  }

  /**
   * Get development dependencies
   * @returns {Object} Dev dependencies object
   */
  getDevDependencies() {
    const deps = {
      '@vitejs/plugin-vue': '^5.0.0',
      'vite': '^5.0.0',
      '@vue/test-utils': '^2.4.0',
      'vitest': '^1.0.0',
      'jsdom': '^23.0.0'
    };

    if (this.typescript) {
      Object.assign(deps, {
        'typescript': '^5.0.0',
        'vue-tsc': '^1.8.0',
        '@tsconfig/node18': '^18.2.0'
      });
    }

    if (this.linting) {
      Object.assign(deps, {
        'eslint': '^8.0.0',
        '@vue/eslint-config-typescript': '^12.0.0',
        'eslint-plugin-vue': '^9.0.0'
      });
    }

    if (this.formatting) {
      Object.assign(deps, {
        'prettier': '^3.0.0',
        '@vue/eslint-config-prettier': '^8.0.0'
      });
    }

    return deps;
  }

  /**
   * Get package.json scripts
   * @returns {Object} Scripts object
   */
  getScripts() {
    const scripts = {
      'dev': 'vite',
      'build': 'vite build',
      'preview': 'vite preview',
      'test': 'vitest',
      'test:ui': 'vitest --ui',
      'coverage': 'vitest run --coverage'
    };

    if (this.typescript) {
      scripts['type-check'] = 'vue-tsc --noEmit --skipLibCheck';
      scripts['build'] = 'vue-tsc --noEmit --skipLibCheck && vite build';
    }

    if (this.linting) {
      scripts['lint'] = 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore';
    }

    if (this.formatting) {
      scripts['format'] = 'prettier --write src/';
    }

    return scripts;
  }

  /**
   * Get configuration files
   * @returns {Array} Config files
   */
  getConfigFiles() {
    const configs = [
      {
        path: 'vite.config.js',
        content: this.getViteConfig()
      }
    ];

    if (this.typescript) {
      configs.push({
        path: 'tsconfig.json',
        content: this.getTsConfig()
      });
      configs.push({
        path: 'tsconfig.app.json',
        content: this.getTsAppConfig()
      });
      configs.push({
        path: 'tsconfig.vitest.json',
        content: this.getTsVitestConfig()
      });
    }

    if (this.linting) {
      configs.push({
        path: '.eslintrc.cjs',
        content: this.getEslintConfig()
      });
    }

    if (this.formatting) {
      configs.push({
        path: '.prettierrc.json',
        content: this.getPrettierConfig()
      });
    }

    return configs;
  }

  /**
   * Get application entry point
   * @returns {Object} Entry point info
   */
  getEntryPoint() {
    return {
      path: this.typescript ? 'src/main.ts' : 'src/main.js',
      template: this.getMainTemplate()
    };
  }

  /**
   * Get Vite configuration
   * @returns {string} Vite config content
   */
  getViteConfig() {
    return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})`;
  }

  /**
   * Get TypeScript configuration
   * @returns {string} TypeScript config content
   */
  getTsConfig() {
    return `{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.vitest.json"
    }
  ]
}`;
  }

  /**
   * Get TypeScript app configuration
   * @returns {string} TypeScript app config content
   */
  getTsAppConfig() {
    return `{
  "extends": "@tsconfig/node18/tsconfig.json",
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue"
  ],
  "exclude": [
    "src/**/__tests__/*"
  ],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`;
  }

  /**
   * Get TypeScript Vitest configuration
   * @returns {string} TypeScript Vitest config content
   */
  getTsVitestConfig() {
    return `{
  "extends": "@tsconfig/node18/tsconfig.json",
  "include": [
    "src/**/__tests__/*"
  ],
  "compilerOptions": {
    "composite": true,
    "lib": [],
    "types": ["node", "jsdom"]
  }
}`;
  }

  /**
   * Get ESLint configuration
   * @returns {string} ESLint config content
   */
  getEslintConfig() {
    const config = {
      root: true,
      extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended'
      ],
      parserOptions: {
        ecmaVersion: 'latest'
      },
      env: {
        'vue/setup-compiler-macros': true
      }
    };

    if (this.typescript) {
      config.extends.push('@vue/eslint-config-typescript');
    }

    if (this.formatting) {
      config.extends.push('@vue/eslint-config-prettier/skip-formatting');
    }

    return `/* eslint-env node */
module.exports = ${JSON.stringify(config, null, 2)}`;
  }

  /**
   * Get Prettier configuration
   * @returns {string} Prettier config content
   */
  getPrettierConfig() {
    return JSON.stringify({
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      vueIndentScriptAndStyle: true
    }, null, 2);
  }

  /**
   * Get main.js/ts template
   * @returns {string} Main file content
   */
  getMainTemplate() {
    const imports = ["import { createApp } from 'vue'"];
    const setup = [];
    const mount = [];

    if (this.stateManagement === 'pinia') {
      imports.push("import { createPinia } from 'pinia'");
      setup.push('const pinia = createPinia()');
      mount.push('app.use(pinia)');
    }

    if (this.routing) {
      imports.push("import router from './router'");
      mount.push('app.use(router)');
    }

    imports.push("import App from './App.vue'");
    
    if (this.typescript) {
      imports.push("import './assets/main.css'");
    }

    setup.push('const app = createApp(App)');
    mount.push("app.mount('#app')");

    return [
      ...imports,
      '',
      ...setup,
      '',
      ...mount
    ].join('\n');
  }

  /**
   * Get merge strategies specific to this module
   * @returns {Object} Merge strategies map
   */
  getMergeStrategies() {
    return this.mergeStrategies;
  }

  /**
   * Check compatibility with other modules
   * @param {Array} otherModules - Other modules to check against
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const result = {
      compatible: true,
      issues: [],
      warnings: []
    };

    for (const module of otherModules) {
      // Check for incompatible frameworks
      if (this.incompatibleWith.includes(module.name)) {
        result.compatible = false;
        result.issues.push({
          type: 'incompatible',
          module: module.name,
          message: `Vue 3 is incompatible with ${module.name}`
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

      // Warn about UI library compatibility
      if (module.moduleType === MODULE_TYPES.UI_LIBRARY) {
        if (module.compatibleFrameworks && !module.compatibleFrameworks.includes('vue3')) {
          result.warnings.push({
            type: 'framework-ui-mismatch',
            module: module.name,
            message: `${module.name} may not be optimized for Vue 3`
          });
        }
      }
    }

    return result;
  }

  /**
   * Validate module configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfig(config) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Validate boolean options
    const booleanOptions = ['typescript', 'router', 'pinia', 'eslint', 'prettier', 'vitest'];
    for (const option of booleanOptions) {
      if (config[option] !== undefined && typeof config[option] !== 'boolean') {
        result.errors.push(`${option} must be a boolean`);
        result.valid = false;
      }
    }

    return result;
  }

  /**
   * Format module for display
   * @param {Object} options - Display options
   * @returns {string} Formatted display string
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = `${selected ? '✓' : '○'} Vue 3 - Modern progressive framework`;
    
    if (showDetails) {
      const features = [];
      if (this.typescript) features.push('TypeScript');
      if (this.routing) features.push('Router');
      if (this.stateManagement) features.push('Pinia');
      if (this.linting) features.push('ESLint');
      if (this.testing.length) features.push('Vitest');
      
      display += `\n  Features: ${features.join(', ')}`;
      display += `\n  Build: ${this.buildTool}`;
    }
    
    return display;
  }
}

// Export class
export default Vue3Module;