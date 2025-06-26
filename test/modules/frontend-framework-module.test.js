import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { FrontendFrameworkModule } from '../../lib/modules/types/frontend-framework-module.js';

describe('FrontendFrameworkModule', () => {
  let vueModule;
  let reactModule;

  beforeEach(() => {
    vueModule = new FrontendFrameworkModule('vue3', 'Vue 3 Framework', {
      framework: 'vue',
      frameworkVersion: '3.4.0',
      buildTool: 'vite',
      typescript: true,
      stateManagement: 'pinia',
      compatibleWith: ['vuetify', 'tailwind', 'supabase'],
      incompatibleWith: ['react', 'angular']
    });

    reactModule = new FrontendFrameworkModule('react', 'React Framework', {
      framework: 'react',
      frameworkVersion: '18.0.0',
      buildTool: 'vite',
      typescript: true,
      stateManagement: 'redux',
      compatibleWith: ['material-ui', 'tailwind'],
      incompatibleWith: ['vue3', 'angular']
    });
  });

  describe('constructor', () => {
    it('should create a frontend framework module with correct defaults', () => {
      expect(vueModule.name).toBe('vue3');
      expect(vueModule.moduleType).toBe('frontend-framework');
      expect(vueModule.category).toBe('frontend');
      expect(vueModule.provides).toContain('frontend');
      expect(vueModule.framework).toBe('vue');
      expect(vueModule.buildTool).toBe('vite');
      expect(vueModule.typescript).toBe(true);
    });

    it('should set default values correctly', () => {
      const defaultModule = new FrontendFrameworkModule('test-framework', 'Test Framework');
      expect(defaultModule.framework).toBe('test-framework');
      expect(defaultModule.buildTool).toBe('vite');
      expect(defaultModule.typescript).toBe(true);
      expect(defaultModule.routing).toBe(true);
      expect(defaultModule.linting).toBe(true);
      expect(defaultModule.formatting).toBe(true);
    });
  });

  describe('getMetadata', () => {
    it('should return extended metadata', () => {
      const metadata = vueModule.getMetadata();
      
      expect(metadata).toHaveProperty('framework', 'vue');
      expect(metadata).toHaveProperty('frameworkVersion', '3.4.0');
      expect(metadata).toHaveProperty('buildTool', 'vite');
      expect(metadata).toHaveProperty('typescript', true);
      expect(metadata.features).toHaveProperty('stateManagement', 'pinia');
      expect(metadata.features).toHaveProperty('routing', true);
      expect(metadata.features).toHaveProperty('testing');
      expect(metadata.features).toHaveProperty('linting', true);
      expect(metadata.features).toHaveProperty('formatting', true);
    });
  });

  describe('getDevDependencies', () => {
    it('should return correct dev dependencies for Vite', () => {
      const deps = vueModule.getDevDependencies();
      
      expect(deps).toHaveProperty('vite');
      expect(deps).toHaveProperty('typescript');
      expect(deps).toHaveProperty('@types/node');
      expect(deps).toHaveProperty('vitest');
      expect(deps).toHaveProperty('eslint');
      expect(deps).toHaveProperty('prettier');
    });

    it('should return webpack dependencies when webpack is selected', () => {
      const webpackModule = new FrontendFrameworkModule('react-webpack', 'React with Webpack', {
        buildTool: 'webpack'
      });
      
      const deps = webpackModule.getDevDependencies();
      
      expect(deps).toHaveProperty('webpack');
      expect(deps).toHaveProperty('webpack-cli');
    });

    it('should include jest dependencies when specified', () => {
      const jestModule = new FrontendFrameworkModule('vue-jest', 'Vue with Jest', {
        testing: ['jest']
      });
      
      const deps = jestModule.getDevDependencies();
      
      expect(deps).toHaveProperty('jest');
    });
  });

  describe('getScripts', () => {
    it('should return correct npm scripts for Vite', () => {
      const scripts = vueModule.getScripts();
      
      expect(scripts.dev).toBe('vite');
      expect(scripts.build).toBe('vite build');
      expect(scripts.preview).toBe('vite preview');
      expect(scripts.test).toBe('vitest');
      expect(scripts.lint).toContain('eslint');
      expect(scripts.format).toContain('prettier');
      expect(scripts.typecheck).toBe('tsc --noEmit');
    });

    it('should return webpack scripts when webpack is selected', () => {
      const webpackModule = new FrontendFrameworkModule('react-webpack', 'React with Webpack', {
        buildTool: 'webpack'
      });
      
      const scripts = webpackModule.getScripts();
      
      expect(scripts.dev).toBe('webpack serve');
      expect(scripts.build).toBe('webpack build');
    });

    it('should include jest scripts when specified', () => {
      const jestModule = new FrontendFrameworkModule('vue-jest', 'Vue with Jest', {
        testing: ['jest']
      });
      
      const scripts = jestModule.getScripts();
      
      expect(scripts.test).toBe('jest');
      expect(scripts['test:watch']).toBe('jest --watch');
    });
  });

  describe('getConfigFiles', () => {
    it('should return config files for Vite setup', () => {
      const configs = vueModule.getConfigFiles();
      
      const viteConfig = configs.find(c => c.path === 'vite.config.js');
      expect(viteConfig).toBeDefined();
      expect(viteConfig.content).toContain('defineConfig');
      
      const tsConfig = configs.find(c => c.path === 'tsconfig.json');
      expect(tsConfig).toBeDefined();
      
      const eslintConfig = configs.find(c => c.path === '.eslintrc.js');
      expect(eslintConfig).toBeDefined();
      
      const prettierConfig = configs.find(c => c.path === '.prettierrc');
      expect(prettierConfig).toBeDefined();
    });

    it('should not include TypeScript config when typescript is false', () => {
      const jsModule = new FrontendFrameworkModule('vue-js', 'Vue without TypeScript', {
        typescript: false
      });
      
      const configs = jsModule.getConfigFiles();
      const tsConfig = configs.find(c => c.path === 'tsconfig.json');
      expect(tsConfig).toBeUndefined();
    });
  });

  describe('getEntryPoint', () => {
    it('should return correct entry point for Vue with TypeScript', () => {
      const entryPoint = vueModule.getEntryPoint();
      
      expect(entryPoint.path).toBe('src/main.ts');
      expect(entryPoint.template).toBe('main-vue');
    });

    it('should return correct entry point for React with TypeScript', () => {
      const entryPoint = reactModule.getEntryPoint();
      
      expect(entryPoint.path).toBe('src/main.tsx');
      expect(entryPoint.template).toBe('main-react');
    });

    it('should return JavaScript entry point when TypeScript is disabled', () => {
      const jsModule = new FrontendFrameworkModule('vue-js', 'Vue without TypeScript', {
        framework: 'vue',
        typescript: false
      });
      
      const entryPoint = jsModule.getEntryPoint();
      
      expect(entryPoint.path).toBe('src/main.js');
    });
  });

  describe('getViteConfig', () => {
    it('should generate valid Vite configuration', () => {
      const config = vueModule.getViteConfig();
      
      expect(config).toContain("import { defineConfig } from 'vite'");
      expect(config).toContain('path.resolve(__dirname, \'./src\')');
      expect(config).toContain('port: 3000');
      expect(config).toContain('open: true');
    });
  });

  describe('getTsConfig', () => {
    it('should generate valid TypeScript configuration', () => {
      const config = vueModule.getTsConfig();
      const parsed = JSON.parse(config);
      
      expect(parsed.compilerOptions.target).toBe('ES2022');
      expect(parsed.compilerOptions.module).toBe('ESNext');
      expect(parsed.compilerOptions.strict).toBe(true);
      expect(parsed.compilerOptions.jsx).toBe('preserve');
      expect(parsed.compilerOptions.baseUrl).toBe('.');
      expect(parsed.compilerOptions.paths).toHaveProperty('@/*');
    });

    it('should set correct JSX for React', () => {
      const config = reactModule.getTsConfig();
      const parsed = JSON.parse(config);
      
      expect(parsed.compilerOptions.jsx).toBe('react-jsx');
    });
  });

  describe('checkCompatibility', () => {
    it('should detect UI library compatibility issues', () => {
      const incompatibleUI = {
        name: 'material-ui',
        moduleType: 'ui-library',
        compatibleFrameworks: ['react'],
        provides: []
      };
      
      const result = vueModule.checkCompatibility([incompatibleUI]);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('framework-ui-mismatch');
      expect(result.issues[0].module).toBe('material-ui');
    });

    it('should warn about missing state management', () => {
      const moduleWithState = new FrontendFrameworkModule('vue-pinia', 'Vue with Pinia', {
        stateManagement: 'pinia'
      });
      
      const result = moduleWithState.checkCompatibility([]);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('missing-state-management');
    });

    it('should pass compatibility with compatible modules', () => {
      const compatibleUI = {
        name: 'vuetify',
        moduleType: 'ui-library',
        compatibleFrameworks: ['vue'],
        provides: []
      };
      
      const result = vueModule.checkCompatibility([compatibleUI]);
      
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('getMergeStrategies', () => {
    it('should return correct merge strategies', () => {
      const strategies = vueModule.getMergeStrategies();
      
      expect(strategies['src/router/*']).toBe('merge-routes');
      expect(strategies['src/store/*']).toBe('merge-stores');
      expect(strategies['src/main.*']).toBe('merge-entry');
      expect(strategies['vite.config.*']).toBe('merge-vite-config');
      expect(strategies['tsconfig.json']).toBe('merge-json-deep');
    });
  });

  describe('previewChanges', () => {
    it('should return preview of all files to be created', async () => {
      const preview = await vueModule.previewChanges('/test/path', {});
      
      expect(preview.files.length).toBeGreaterThan(4); // Config files + entry point + src + public
      expect(preview.modifications).toHaveLength(1); // package.json
      
      const viteConfig = preview.files.find(f => f.path === 'vite.config.js');
      expect(viteConfig).toBeDefined();
      expect(viteConfig.description).toContain('vue configuration');
      
      const entryPoint = preview.files.find(f => f.path === 'src/main.ts');
      expect(entryPoint).toBeDefined();
      expect(entryPoint.description).toContain('vue application entry point');
    });
  });

  describe('edge cases', () => {
    it('should handle unknown frameworks gracefully', () => {
      const unknownFramework = new FrontendFrameworkModule('unknown', 'Unknown Framework', {
        framework: 'unknown-framework'
      });
      
      const entryPoint = unknownFramework.getEntryPoint();
      expect(entryPoint.template).toBe('main-generic');
    });

    it('should handle modules without metadata', () => {
      const minimalModule = new FrontendFrameworkModule('minimal', 'Minimal Framework');
      const metadata = minimalModule.getMetadata();
      
      expect(metadata.name).toBe('minimal');
      expect(metadata.framework).toBe('minimal');
    });

    it('should handle empty compatibility arrays', () => {
      const emptyModule = new FrontendFrameworkModule('empty', 'Empty Framework', {
        compatibleWith: [],
        incompatibleWith: []
      });
      
      const result = emptyModule.checkCompatibility([]);
      expect(result.compatible).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('configuration generation', () => {
    it('should generate valid ESLint configuration', () => {
      const eslintConfig = vueModule.getEslintConfig();
      
      expect(eslintConfig).toContain('module.exports');
      expect(eslintConfig).toContain('env');
      expect(eslintConfig).toContain('extends');
      expect(eslintConfig).toContain('rules');
    });

    it('should generate valid Prettier configuration', () => {
      const prettierConfig = vueModule.getPrettierConfig();
      const parsed = JSON.parse(prettierConfig);
      
      expect(parsed).toHaveProperty('semi');
      expect(parsed).toHaveProperty('singleQuote');
      expect(parsed).toHaveProperty('tabWidth');
      expect(parsed).toHaveProperty('trailingComma');
    });
  });
});