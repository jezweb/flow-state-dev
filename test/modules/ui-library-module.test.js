import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UILibraryModule } from '../../lib/modules/types/ui-library-module.js';

describe('UILibraryModule', () => {
  let vuetifyModule;
  let tailwindModule;
  let materialUIModule;

  beforeEach(() => {
    vuetifyModule = new UILibraryModule('vuetify', 'Vuetify Material Design', {
      libraryType: 'component',
      compatibleFrameworks: ['vue'],
      themeSupport: true,
      darkModeSupport: true,
      iconSet: 'material-icons',
      customization: 'full',
      provides: ['ui-components', 'theming']
    });

    tailwindModule = new UILibraryModule('tailwind', 'Tailwind CSS', {
      libraryType: 'utility',
      compatibleFrameworks: ['*'],
      themeSupport: true,
      darkModeSupport: true,
      customization: 'full',
      provides: ['ui-styling']
    });

    materialUIModule = new UILibraryModule('material-ui', 'Material UI', {
      libraryType: 'component',
      compatibleFrameworks: ['react'],
      themeSupport: true,
      darkModeSupport: true,
      customization: 'full',
      provides: ['ui-components', 'theming']
    });
  });

  describe('constructor', () => {
    it('should create a UI library module with correct defaults', () => {
      expect(vuetifyModule.name).toBe('vuetify');
      expect(vuetifyModule.moduleType).toBe('ui-library');
      expect(vuetifyModule.category).toBe('ui');
      expect(vuetifyModule.provides).toContain('ui');
      expect(vuetifyModule.provides).toContain('styling');
      expect(vuetifyModule.requires).toContain('frontend');
      expect(vuetifyModule.libraryType).toBe('component');
    });

    it('should set default values correctly', () => {
      const defaultModule = new UILibraryModule('test-ui', 'Test UI Library');
      expect(defaultModule.libraryType).toBe('component');
      expect(defaultModule.themeSupport).toBe(true);
      expect(defaultModule.darkModeSupport).toBe(true);
      expect(defaultModule.responsiveDesign).toBe(true);
      expect(defaultModule.customization).toBe('full');
      expect(defaultModule.accessibility).toBe('wcag-aa');
    });
  });

  describe('getMetadata', () => {
    it('should return extended metadata', () => {
      const metadata = vuetifyModule.getMetadata();
      
      expect(metadata).toHaveProperty('libraryType', 'component');
      expect(metadata).toHaveProperty('compatibleFrameworks');
      expect(metadata.compatibleFrameworks).toContain('vue');
      expect(metadata.features).toHaveProperty('themeSupport', true);
      expect(metadata.features).toHaveProperty('darkModeSupport', true);
      expect(metadata.features).toHaveProperty('iconSet', 'material-icons');
      expect(metadata.features).toHaveProperty('responsiveDesign', true);
      expect(metadata.features).toHaveProperty('accessibility', 'wcag-aa');
    });
  });

  describe('getDependencies', () => {
    it('should return correct dependencies for Vuetify', () => {
      const deps = vuetifyModule.getDependencies();
      
      expect(deps).toHaveProperty('vuetify');
      expect(deps).toHaveProperty('@mdi/font');
    });

    it('should return correct dependencies for Material UI', () => {
      const deps = materialUIModule.getDependencies();
      
      expect(deps).toHaveProperty('@mui/material');
      expect(deps).toHaveProperty('@emotion/react');
      expect(deps).toHaveProperty('@emotion/styled');
    });

    it('should include icon dependencies when iconSet is specified', () => {
      const moduleWithIcons = new UILibraryModule('test-ui', 'Test UI', {
        iconSet: 'fontawesome'
      });
      
      const deps = moduleWithIcons.getDependencies();
      expect(deps).toHaveProperty('@fortawesome/fontawesome-free');
    });

    it('should handle unknown UI library gracefully', () => {
      const unknownModule = new UILibraryModule('unknown-ui', 'Unknown UI');
      const deps = unknownModule.getDependencies();
      
      // Should return empty object for unknown libraries
      expect(Object.keys(deps)).toHaveLength(0);
    });
  });

  describe('getDevDependencies', () => {
    it('should return Tailwind dev dependencies for utility libraries', () => {
      const deps = tailwindModule.getDevDependencies();
      
      expect(deps).toHaveProperty('tailwindcss');
      expect(deps).toHaveProperty('autoprefixer');
      expect(deps).toHaveProperty('postcss');
    });

    it('should include CSS preprocessor dependencies', () => {
      const sassModule = new UILibraryModule('sass-ui', 'Sass UI', {
        cssFramework: 'sass'
      });
      
      const deps = sassModule.getDevDependencies();
      expect(deps).toHaveProperty('sass');
    });

    it('should include UnoCSS dependencies', () => {
      const unoModule = new UILibraryModule('unocss', 'UnoCSS', {
        libraryType: 'utility'
      });
      
      const deps = unoModule.getDevDependencies();
      expect(deps).toHaveProperty('unocss');
    });
  });

  describe('getConfigFiles', () => {
    it('should return Tailwind config files', () => {
      const configs = tailwindModule.getConfigFiles();
      
      const tailwindConfig = configs.find(c => c.path === 'tailwind.config.js');
      expect(tailwindConfig).toBeDefined();
      expect(tailwindConfig.content).toContain('tailwindcss');
      
      const postcssConfig = configs.find(c => c.path === 'postcss.config.js');
      expect(postcssConfig).toBeDefined();
      expect(postcssConfig.content).toContain('autoprefixer');
    });

    it('should include theme config when themeSupport is enabled', () => {
      const configs = vuetifyModule.getConfigFiles();
      
      const themeConfig = configs.find(c => c.path.includes('theme.js'));
      expect(themeConfig).toBeDefined();
      expect(themeConfig.content).toContain('colors');
    });

    it('should return empty configs for component libraries without special configs', () => {
      const simpleModule = new UILibraryModule('simple-ui', 'Simple UI', {
        libraryType: 'component'
      });
      
      const configs = simpleModule.getConfigFiles();
      const themeConfig = configs.find(c => c.path.includes('theme.js'));
      expect(themeConfig).toBeDefined(); // Theme config should still be included
    });
  });

  describe('getStyleImports', () => {
    it('should return correct imports for Vuetify', () => {
      const imports = vuetifyModule.getStyleImports();
      
      expect(imports).toContain("@import 'vuetify/styles';");
      expect(imports).toContain("@import '@mdi/font/css/materialdesignicons.css';");
    });

    it('should return correct imports for Tailwind', () => {
      const imports = tailwindModule.getStyleImports();
      
      expect(imports).toContain('@tailwind base;');
      expect(imports).toContain('@tailwind components;');
      expect(imports).toContain('@tailwind utilities;');
    });

    it('should return correct imports for Bootstrap', () => {
      const bootstrapModule = new UILibraryModule('bootstrap', 'Bootstrap');
      const imports = bootstrapModule.getStyleImports();
      
      expect(imports).toContain("@import 'bootstrap/dist/css/bootstrap.css';");
    });
  });

  describe('getFrameworkSetup', () => {
    it('should return Vue setup for Vuetify', () => {
      const setup = vuetifyModule.getFrameworkSetup('vue');
      
      expect(setup.imports).toContain("import { createVuetify } from 'vuetify'");
      expect(setup.imports).toContain("import * as components from 'vuetify/components'");
      expect(setup.plugins).toHaveLength(1);
      expect(setup.plugins[0]).toContain('createVuetify');
      expect(setup.config).toContain('app.use(vuetify)');
    });

    it('should return React setup for Material UI', () => {
      const setup = materialUIModule.getFrameworkSetup('react');
      
      expect(setup.imports).toContain("import { ThemeProvider, createTheme } from '@mui/material/styles'");
      expect(setup.imports).toContain("import CssBaseline from '@mui/material/CssBaseline'");
      expect(setup.plugins).toHaveLength(1);
      expect(setup.plugins[0]).toContain('createTheme');
    });

    it('should handle unknown framework gracefully', () => {
      const setup = vuetifyModule.getFrameworkSetup('unknown');
      
      expect(setup.imports).toHaveLength(0);
      expect(setup.plugins).toHaveLength(0);
      expect(setup.config).toHaveLength(0);
    });
  });

  describe('getTailwindConfig', () => {
    it('should generate valid Tailwind configuration', () => {
      const config = tailwindModule.getTailwindConfig();
      
      expect(config).toContain('content:');
      expect(config).toContain('./src/**/*.{vue,js,ts,jsx,tsx}');
      expect(config).toContain('darkMode:');
      expect(config).toContain('theme:');
      expect(config).toContain('extend:');
      expect(config).toContain('colors:');
    });

    it('should set correct dark mode based on darkModeSupport', () => {
      const config = tailwindModule.getTailwindConfig();
      expect(config).toContain("darkMode: 'class'");
      
      const noDarkMode = new UILibraryModule('no-dark', 'No Dark Mode', {
        darkModeSupport: false
      });
      const noDarkConfig = noDarkMode.getTailwindConfig();
      expect(noDarkConfig).toContain("darkMode: 'media'");
    });
  });

  describe('getComponentExamples', () => {
    it('should return Vue component examples', () => {
      const examples = vuetifyModule.getComponentExamples('vue');
      
      expect(examples).toHaveLength(3);
      expect(examples[0].path).toContain('Button.vue');
      expect(examples[1].path).toContain('Card.vue');
      expect(examples[2].path).toContain('Form.vue');
    });

    it('should return React component examples', () => {
      const examples = materialUIModule.getComponentExamples('react');
      
      expect(examples).toHaveLength(3);
      expect(examples[0].path).toContain('Button.jsx');
      expect(examples[1].path).toContain('Card.jsx');
      expect(examples[2].path).toContain('Form.jsx');
    });

    it('should return empty array for utility libraries', () => {
      const examples = tailwindModule.getComponentExamples('vue');
      
      expect(examples).toHaveLength(0);
    });
  });

  describe('checkCompatibility', () => {
    it('should detect framework incompatibility', () => {
      const vueFramework = {
        name: 'vue3',
        moduleType: 'frontend-framework',
        framework: 'vue',
        provides: ['frontend']
      };
      
      const result = materialUIModule.checkCompatibility([vueFramework]);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('incompatible-framework');
      expect(result.issues[0].message).toContain('material-ui is not compatible with vue');
    });

    it('should warn about multiple UI libraries', () => {
      const otherUI = {
        name: 'bootstrap',
        moduleType: 'ui-library',
        provides: ['ui', 'styling']
      };
      
      const result = vuetifyModule.checkCompatibility([otherUI]);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('multiple-ui-libraries');
      expect(result.warnings[0].message).toContain('Multiple UI libraries selected');
    });

    it('should pass compatibility with compatible framework', () => {
      const vueFramework = {
        name: 'vue3',
        moduleType: 'frontend-framework',
        framework: 'vue',
        provides: ['frontend']
      };
      
      const result = vuetifyModule.checkCompatibility([vueFramework]);
      
      expect(result.issues).toHaveLength(0);
    });

    it('should handle wildcard compatibility', () => {
      const anyFramework = {
        name: 'vue3',
        moduleType: 'frontend-framework',
        framework: 'vue',
        provides: ['frontend']
      };
      
      const result = tailwindModule.checkCompatibility([anyFramework]);
      
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('previewChanges', () => {
    it('should return preview of all files for Tailwind', async () => {
      const preview = await tailwindModule.previewChanges('/test/path', { framework: { name: 'vue' } });
      
      expect(preview.files.length).toBeGreaterThan(0);
      expect(preview.modifications.length).toBeGreaterThan(0);
      
      const tailwindConfig = preview.files.find(f => f.path === 'tailwind.config.js');
      expect(tailwindConfig).toBeDefined();
      
      const postcssConfig = preview.files.find(f => f.path === 'postcss.config.js');
      expect(postcssConfig).toBeDefined();
      
      const mainStyles = preview.files.find(f => f.path.includes('main.css'));
      expect(mainStyles).toBeDefined();
    });

    it('should return preview for component library', async () => {
      const preview = await vuetifyModule.previewChanges('/test/path', { framework: { name: 'vue' } });
      
      expect(preview.files.length).toBeGreaterThan(0);
      expect(preview.modifications.length).toBeGreaterThan(0);
      
      const examples = preview.files.filter(f => f.path.includes('components/'));
      expect(examples.length).toBeGreaterThan(0);
    });

    it('should include Vite config modification for Tailwind', async () => {
      const preview = await tailwindModule.previewChanges('/test/path', {});
      
      const viteModification = preview.modifications.find(m => m.path === 'vite.config.js');
      expect(viteModification).toBeDefined();
      expect(viteModification.description).toContain('PostCSS');
    });
  });

  describe('getPostInstallInstructions', () => {
    it('should return instructions for themeable library', () => {
      const instructions = vuetifyModule.getPostInstallInstructions({});
      
      expect(instructions).toContain('Configure your theme in src/styles/theme.js');
      expect(instructions.join(' ')).toContain('Customize colors, typography, and spacing');
      expect(instructions).toContain('Dark mode is supported');
      expect(instructions).toContain('material-icons icons are included');
    });

    it('should return basic instructions for utility library', () => {
      const tailwindNoFeatures = new UILibraryModule('tailwind-basic', 'Basic Tailwind', {
        themeSupport: false,
        darkModeSupport: false,
        iconSet: null
      });
      
      const instructions = tailwindNoFeatures.getPostInstallInstructions({});
      
      // Should not include feature-specific instructions
      expect(instructions.join(' ')).not.toContain('Configure your theme');
      expect(instructions.join(' ')).not.toContain('Dark mode');
      expect(instructions.join(' ')).not.toContain('icons are included');
    });
  });

  describe('edge cases', () => {
    it('should handle empty compatible frameworks', () => {
      const emptyModule = new UILibraryModule('empty-ui', 'Empty UI', {
        compatibleFrameworks: []
      });
      
      const anyFramework = {
        name: 'vue3',
        moduleType: 'frontend-framework',
        framework: 'vue',
        provides: ['frontend']
      };
      
      const result = emptyModule.checkCompatibility([anyFramework]);
      expect(result.issues).toHaveLength(0); // No compatibility restrictions
    });

    it('should handle modules without metadata', () => {
      const minimalModule = new UILibraryModule('minimal', 'Minimal UI');
      const metadata = minimalModule.getMetadata();
      
      expect(metadata.name).toBe('minimal');
      expect(metadata.libraryType).toBe('component');
    });

    it('should handle unknown CSS frameworks', () => {
      const unknownCSSModule = new UILibraryModule('unknown-css', 'Unknown CSS', {
        cssFramework: 'unknown-framework'
      });
      
      const deps = unknownCSSModule.getDevDependencies();
      expect(deps).toEqual({}); // Should not include unknown dependencies
    });
  });

  describe('configuration generation', () => {
    it('should generate valid PostCSS configuration', () => {
      const config = tailwindModule.getPostCSSConfig();
      
      expect(config).toContain('tailwindcss');
      expect(config).toContain('autoprefixer');
      expect(config).toContain('plugins');
    });

    it('should generate valid theme configuration', () => {
      const config = vuetifyModule.getThemeConfig();
      
      expect(config).toContain('export const theme');
      expect(config).toContain('colors');
      expect(config).toContain('typography');
      expect(config).toContain('spacing');
      expect(config).toContain('breakpoints');
    });
  });
});