/**
 * UI Library Module Type
 * 
 * Specialized module type for UI component libraries like Vuetify, Material UI, Tailwind, etc.
 * Handles styling, theming, and component integration.
 */
import { BaseStackModule } from './base-stack-module.js';

export class UILibraryModule extends BaseStackModule {
  constructor(name, description, options = {}) {
    super(name, description, {
      ...options,
      moduleType: 'ui-library',
      category: options.category || 'ui-library',
      provides: ['ui', 'styling', ...(options.provides || [])],
      requires: ['frontend', ...(options.requires || [])]
    });

    // UI library specific properties
    this.libraryType = options.libraryType || 'component'; // 'component' or 'utility'
    this.compatibleFrameworks = options.compatibleFrameworks || [];
    this.themeSupport = options.themeSupport !== false;
    this.darkModeSupport = options.darkModeSupport !== false;
    this.customization = options.customization || 'full'; // 'full', 'limited', 'none'
    this.iconSet = options.iconSet || null;
    this.responsiveDesign = options.responsiveDesign !== false;
    this.accessibility = options.accessibility || 'wcag-aa';
    this.cssFramework = options.cssFramework || null;
    this.componentsPath = options.componentsPath || 'src/components';
    this.stylesPath = options.stylesPath || 'src/styles';
  }

  /**
   * Get UI library metadata
   * @returns {Object} Extended metadata
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      libraryType: this.libraryType,
      compatibleFrameworks: this.compatibleFrameworks,
      features: {
        themeSupport: this.themeSupport,
        darkModeSupport: this.darkModeSupport,
        customization: this.customization,
        iconSet: this.iconSet,
        responsiveDesign: this.responsiveDesign,
        accessibility: this.accessibility
      }
    };
  }

  /**
   * Get UI library dependencies
   * @returns {Object} Dependencies
   */
  getDependencies() {
    const deps = {};

    // Add library-specific dependencies
    switch (this.name.toLowerCase()) {
      case 'vuetify':
        deps['vuetify'] = '^3.0.0';
        deps['@mdi/font'] = '^7.0.0';
        break;
      case 'material-ui':
        deps['@mui/material'] = '^5.0.0';
        deps['@emotion/react'] = '^11.0.0';
        deps['@emotion/styled'] = '^11.0.0';
        break;
      case 'tailwind':
        // Tailwind is typically a dev dependency
        break;
      case 'bootstrap':
        deps['bootstrap'] = '^5.0.0';
        break;
      case 'ant-design':
        deps['antd'] = '^5.0.0';
        break;
    }

    // Icon dependencies
    if (this.iconSet) {
      switch (this.iconSet) {
        case 'material-icons':
          deps['@mdi/font'] = '^7.0.0';
          break;
        case 'fontawesome':
          deps['@fortawesome/fontawesome-free'] = '^6.0.0';
          break;
        case 'heroicons':
          deps['heroicons'] = '^2.0.0';
          break;
      }
    }

    return deps;
  }

  /**
   * Get UI library dev dependencies
   * @returns {Object} Dev dependencies
   */
  getDevDependencies() {
    const deps = {};

    // Utility-based CSS frameworks
    if (this.libraryType === 'utility') {
      switch (this.name.toLowerCase()) {
        case 'tailwind':
          deps['tailwindcss'] = '^3.0.0';
          deps['autoprefixer'] = '^10.0.0';
          deps['postcss'] = '^8.0.0';
          break;
        case 'unocss':
          deps['unocss'] = '^0.50.0';
          break;
      }
    }

    // CSS processors
    if (this.cssFramework === 'sass') {
      deps['sass'] = '^1.0.0';
    } else if (this.cssFramework === 'less') {
      deps['less'] = '^4.0.0';
    }

    return deps;
  }

  /**
   * Get UI library configuration files
   * @returns {Array} Configuration file definitions
   */
  getConfigFiles() {
    const configs = [];

    // Tailwind config
    if (this.name.toLowerCase() === 'tailwind') {
      configs.push({
        path: 'tailwind.config.js',
        content: this.getTailwindConfig()
      });
      configs.push({
        path: 'postcss.config.js',
        content: this.getPostCSSConfig()
      });
    }

    // Theme configuration
    if (this.themeSupport) {
      configs.push({
        path: `${this.stylesPath}/theme.js`,
        content: this.getThemeConfig()
      });
    }

    return configs;
  }

  /**
   * Get style imports for main CSS file
   * @returns {Array} CSS import statements
   */
  getStyleImports() {
    const imports = [];

    switch (this.name.toLowerCase()) {
      case 'vuetify':
        imports.push("@import 'vuetify/styles';");
        if (this.iconSet === 'material-icons') {
          imports.push("@import '@mdi/font/css/materialdesignicons.css';");
        }
        break;
      case 'tailwind':
        imports.push('@tailwind base;');
        imports.push('@tailwind components;');
        imports.push('@tailwind utilities;');
        break;
      case 'bootstrap':
        imports.push("@import 'bootstrap/dist/css/bootstrap.css';");
        break;
    }

    return imports;
  }

  /**
   * Get framework-specific setup code
   * @param {string} framework - Frontend framework name
   * @returns {Object} Setup code snippets
   */
  getFrameworkSetup(framework) {
    const setup = {
      imports: [],
      plugins: [],
      config: []
    };

    if (framework === 'vue' && this.name.toLowerCase() === 'vuetify') {
      setup.imports.push("import { createVuetify } from 'vuetify'");
      setup.imports.push("import * as components from 'vuetify/components'");
      setup.imports.push("import * as directives from 'vuetify/directives'");
      setup.plugins.push(`const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      }
    }
  }
})`);
      setup.config.push('app.use(vuetify)');
    }

    if (framework === 'react' && this.name.toLowerCase() === 'material-ui') {
      setup.imports.push("import { ThemeProvider, createTheme } from '@mui/material/styles'");
      setup.imports.push("import CssBaseline from '@mui/material/CssBaseline'");
      setup.plugins.push(`const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})`);
    }

    return setup;
  }

  /**
   * Generate Tailwind configuration
   * @returns {string} Tailwind config content
   */
  getTailwindConfig() {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: '${this.darkModeSupport ? 'class' : 'media'}',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        success: '#10B981'
      }
    },
  },
  plugins: [],
}`;
  }

  /**
   * Generate PostCSS configuration
   * @returns {string} PostCSS config content
   */
  getPostCSSConfig() {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  }

  /**
   * Generate theme configuration
   * @returns {string} Theme config content
   */
  getThemeConfig() {
    return `export const theme = {
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    
    // Grayscale
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
}

export default theme`;
  }

  /**
   * Get component template examples
   * @param {string} framework - Frontend framework
   * @returns {Array} Component examples
   */
  getComponentExamples(framework) {
    const examples = [];

    if (this.libraryType === 'component') {
      examples.push({
        path: `${this.componentsPath}/Button.${framework === 'vue' ? 'vue' : 'jsx'}`,
        description: 'Example button component using UI library'
      });
      
      examples.push({
        path: `${this.componentsPath}/Card.${framework === 'vue' ? 'vue' : 'jsx'}`,
        description: 'Example card component using UI library'
      });
      
      examples.push({
        path: `${this.componentsPath}/Form.${framework === 'vue' ? 'vue' : 'jsx'}`,
        description: 'Example form component using UI library'
      });
    }

    return examples;
  }

  /**
   * Check compatibility with frontend frameworks
   * @param {Array} otherModules - Other selected modules
   * @returns {Object} Compatibility result
   */
  checkCompatibility(otherModules) {
    const result = super.checkCompatibility(otherModules);
    
    // Find frontend framework
    const framework = otherModules.find(m => m.moduleType === 'frontend-framework');
    
    if (framework && this.compatibleFrameworks.length > 0) {
      if (!this.compatibleFrameworks.includes(framework.framework)) {
        result.issues.push({
          type: 'incompatible-framework',
          message: `${this.name} is not compatible with ${framework.framework}`
        });
      }
    }

    // Check for conflicting UI libraries
    const otherUILibs = otherModules.filter(m => 
      m.moduleType === 'ui-library' && m.name !== this.name
    );
    
    if (otherUILibs.length > 0) {
      result.warnings.push({
        type: 'multiple-ui-libraries',
        message: `Multiple UI libraries selected: ${this.name} and ${otherUILibs.map(m => m.name).join(', ')}`
      });
    }

    return result;
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

    // Configuration files
    const configs = this.getConfigFiles();
    for (const config of configs) {
      preview.files.push({
        path: config.path,
        description: `${this.name} configuration`
      });
    }

    // Style files
    preview.files.push({
      path: `${this.stylesPath}/main.css`,
      description: 'Main stylesheet with UI library imports'
    });

    if (this.themeSupport) {
      preview.files.push({
        path: `${this.stylesPath}/variables.css`,
        description: 'CSS variables for theming'
      });
    }

    // Component examples
    const framework = projectAnalysis?.framework?.name || 'vue';
    const examples = this.getComponentExamples(framework);
    preview.files.push(...examples);

    // Modifications
    preview.modifications.push({
      path: 'package.json',
      description: `Add ${this.name} dependencies`
    });

    preview.modifications.push({
      path: 'src/main.js',
      description: `Configure ${this.name} in app initialization`
    });

    if (this.libraryType === 'utility' && this.name.toLowerCase() === 'tailwind') {
      preview.modifications.push({
        path: 'vite.config.js',
        description: 'Add PostCSS configuration for Tailwind'
      });
    }

    return preview;
  }

  /**
   * Get post-installation instructions
   * @param {Object} context - Installation context
   * @returns {Array} Instructions
   */
  getPostInstallInstructions(context) {
    const instructions = super.getPostInstallInstructions(context);
    
    if (this.themeSupport) {
      instructions.push(
        `Configure your theme in ${this.stylesPath}/theme.js`,
        `Customize colors, typography, and spacing to match your brand`
      );
    }

    if (this.darkModeSupport) {
      instructions.push(
        'Dark mode is supported - toggle it in your app settings'
      );
    }

    if (this.iconSet) {
      instructions.push(
        `${this.iconSet} icons are included and ready to use`
      );
    }

    return instructions;
  }
}