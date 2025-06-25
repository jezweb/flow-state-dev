/**
 * Frontend Framework Module Type
 * 
 * Specialized module type for frontend frameworks like Vue, React, Svelte, etc.
 * Handles framework-specific setup, configuration, and integration.
 */
import { BaseStackModule } from './base-stack-module.js';
import path from 'path';

export class FrontendFrameworkModule extends BaseStackModule {
  constructor(name, description, options = {}) {
    super(name, description, {
      ...options,
      moduleType: 'frontend-framework',
      category: 'frontend',
      provides: ['frontend', ...(options.provides || [])],
      requires: options.requires || []
    });

    // Frontend framework specific properties
    this.framework = options.framework || name.toLowerCase();
    this.version = options.frameworkVersion || 'latest';
    this.buildTool = options.buildTool || 'vite';
    this.typescript = options.typescript !== false;
    this.packageManager = options.packageManager || 'npm';
    this.stateManagement = options.stateManagement || null;
    this.routing = options.routing !== false;
    this.testing = options.testing || ['vitest'];
    this.linting = options.linting !== false;
    this.formatting = options.formatting !== false;
  }

  /**
   * Get framework-specific metadata
   * @returns {Object} Extended metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      framework: this.framework,
      frameworkVersion: this.version,
      buildTool: this.buildTool,
      typescript: this.typescript,
      features: {
        stateManagement: this.stateManagement,
        routing: this.routing,
        testing: this.testing,
        linting: this.linting,
        formatting: this.formatting
      }
    };
  }

  /**
   * Get development dependencies for this framework
   * @returns {Object} Dev dependencies
   */
  getDevDependencies() {
    const deps = {};

    // Build tool
    if (this.buildTool === 'vite') {
      deps.vite = '^5.0.0';
    } else if (this.buildTool === 'webpack') {
      deps.webpack = '^5.0.0';
      deps['webpack-cli'] = '^5.0.0';
    }

    // TypeScript
    if (this.typescript) {
      deps.typescript = '^5.0.0';
      deps['@types/node'] = '^20.0.0';
    }

    // Testing
    if (this.testing.includes('vitest')) {
      deps.vitest = '^1.0.0';
      deps['@vitest/ui'] = '^1.0.0';
    }
    if (this.testing.includes('jest')) {
      deps.jest = '^29.0.0';
    }

    // Linting & Formatting
    if (this.linting) {
      deps.eslint = '^8.0.0';
    }
    if (this.formatting) {
      deps.prettier = '^3.0.0';
    }

    return deps;
  }

  /**
   * Get framework-specific package.json scripts
   * @returns {Object} npm scripts
   */
  getScripts() {
    const scripts = {
      dev: this.buildTool === 'vite' ? 'vite' : 'webpack serve',
      build: this.buildTool === 'vite' ? 'vite build' : 'webpack build',
      preview: this.buildTool === 'vite' ? 'vite preview' : 'webpack preview'
    };

    if (this.testing.includes('vitest')) {
      scripts.test = 'vitest';
      scripts['test:ui'] = 'vitest --ui';
      scripts['test:coverage'] = 'vitest --coverage';
    } else if (this.testing.includes('jest')) {
      scripts.test = 'jest';
      scripts['test:watch'] = 'jest --watch';
    }

    if (this.linting) {
      scripts.lint = 'eslint src --ext .js,.jsx,.ts,.tsx,.vue';
      scripts['lint:fix'] = 'eslint src --ext .js,.jsx,.ts,.tsx,.vue --fix';
    }

    if (this.formatting) {
      scripts.format = 'prettier --write src';
      scripts['format:check'] = 'prettier --check src';
    }

    if (this.typescript) {
      scripts.typecheck = 'tsc --noEmit';
    }

    return scripts;
  }

  /**
   * Get framework-specific configuration files
   * @returns {Array} Configuration file definitions
   */
  getConfigFiles() {
    const configs = [];

    // Vite config
    if (this.buildTool === 'vite') {
      configs.push({
        path: 'vite.config.js',
        content: this.getViteConfig()
      });
    }

    // TypeScript config
    if (this.typescript) {
      configs.push({
        path: 'tsconfig.json',
        content: this.getTsConfig()
      });
    }

    // ESLint config
    if (this.linting) {
      configs.push({
        path: '.eslintrc.js',
        content: this.getEslintConfig()
      });
    }

    // Prettier config
    if (this.formatting) {
      configs.push({
        path: '.prettierrc',
        content: this.getPrettierConfig()
      });
    }

    return configs;
  }

  /**
   * Get entry point file for the framework
   * @returns {Object} Entry point definition
   */
  getEntryPoint() {
    const ext = this.typescript ? 'ts' : 'js';
    const framework = this.framework.toLowerCase();

    const entryPoints = {
      vue: {
        path: `src/main.${ext}`,
        template: 'main-vue'
      },
      react: {
        path: `src/main.${this.typescript ? 'tsx' : 'jsx'}`,
        template: 'main-react'
      },
      svelte: {
        path: `src/main.${ext}`,
        template: 'main-svelte'
      },
      angular: {
        path: `src/main.${ext}`,
        template: 'main-angular'
      }
    };

    return entryPoints[framework] || {
      path: `src/main.${ext}`,
      template: 'main-generic'
    };
  }

  /**
   * Generate base Vite configuration
   * @returns {string} Vite config content
   */
  getViteConfig() {
    return `import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
})`;
  }

  /**
   * Generate TypeScript configuration
   * @returns {string} TypeScript config content
   */
  getTsConfig() {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: true,
        module: 'ESNext',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: this.framework === 'react' ? 'react-jsx' : 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      references: [{ path: './tsconfig.node.json' }]
    }, null, 2);
  }

  /**
   * Generate ESLint configuration
   * @returns {string} ESLint config content
   */
  getEslintConfig() {
    return `module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}`;
  }

  /**
   * Generate Prettier configuration
   * @returns {string} Prettier config content
   */
  getPrettierConfig() {
    return JSON.stringify({
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      bracketSpacing: true
    }, null, 2);
  }

  /**
   * Check compatibility with UI library modules
   * @param {Array} otherModules - Other selected modules
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const result = super.checkCompatibility(otherModules);
    
    // Check for UI library compatibility
    const uiLibraries = otherModules.filter(m => m.moduleType === 'ui-library');
    for (const uiLib of uiLibraries) {
      if (uiLib.compatibleFrameworks && !uiLib.compatibleFrameworks.includes(this.framework)) {
        result.issues.push({
          type: 'framework-ui-mismatch',
          module: uiLib.name,
          message: `${uiLib.name} is not compatible with ${this.framework}`
        });
      }
    }

    // Check for state management compatibility
    if (this.stateManagement) {
      const hasStateManagement = otherModules.some(m => 
        m.provides.includes('state-management') || m.name.toLowerCase().includes(this.stateManagement)
      );
      if (!hasStateManagement) {
        result.warnings.push({
          type: 'missing-state-management',
          message: `${this.stateManagement} state management is configured but not included`
        });
      }
    }

    return result;
  }

  /**
   * Get framework-specific merge strategies
   * @returns {Object} Merge strategies
   */
  getMergeStrategies() {
    return {
      'src/router/*': 'merge-routes',
      'src/store/*': 'merge-stores',
      'src/main.*': 'merge-entry',
      'vite.config.*': 'merge-vite-config',
      'tsconfig.json': 'merge-json-deep',
      '.eslintrc.*': 'merge-eslint',
      ...this.mergeStrategies
    };
  }

  /**
   * Prepare preview of changes
   * @param {string} projectPath - Project path
   * @param {Object} projectAnalysis - Project analysis
   * @returns {Object} Preview results
   */
  async previewChanges(projectPath, projectAnalysis) {
    const preview = {
      files: [],
      modifications: [],
      warnings: []
    };

    // Config files
    const configs = this.getConfigFiles();
    for (const config of configs) {
      preview.files.push({
        path: config.path,
        description: `${this.framework} configuration file`
      });
    }

    // Entry point
    const entryPoint = this.getEntryPoint();
    preview.files.push({
      path: entryPoint.path,
      description: `${this.framework} application entry point`
    });

    // Package.json modifications
    preview.modifications.push({
      path: 'package.json',
      description: 'Add framework dependencies and scripts'
    });

    // Source directories
    preview.files.push({
      path: 'src/',
      description: 'Source code directory structure'
    });

    // Public assets
    preview.files.push({
      path: 'public/',
      description: 'Public assets directory'
    });

    return preview;
  }
}