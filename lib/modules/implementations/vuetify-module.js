/**
 * Vuetify UI Library Module for Flow State Dev
 * 
 * Provides Vuetify 3 (Material Design 3) integration with Vue 3,
 * including theming, icons, and component configuration.
 */
import { UILibraryModule } from '../types/ui-library-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';

export class VuetifyModule extends UILibraryModule {
  constructor() {
    super('vuetify', 'Vuetify 3 - Material Design 3 Components', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.UI_LIBRARY,
      category: MODULE_CATEGORIES.UI,
      provides: [
        MODULE_PROVIDES.UI,
        MODULE_PROVIDES.COMPONENTS,
        MODULE_PROVIDES.THEME,
        MODULE_PROVIDES.STYLING
      ],
      requires: [MODULE_PROVIDES.FRONTEND],
      compatibleWith: ['vue3'],
      incompatibleWith: ['react', 'angular', 'tailwind'],
      priority: 80,
      templatePath: 'templates/modules/vuetify'
    });

    // UI Library specific properties
    this.libraryType = 'component';
    this.compatibleFrameworks = ['vue3'];
    this.themeSupport = true;
    this.darkModeSupport = true;
    this.customization = 'full';
    this.iconSet = '@mdi/js';
    this.responsiveDesign = true;
    this.accessibility = 'WCAG 2.1 AA';
    this.cssFramework = 'vuetify';
    this.componentsPath = 'src/plugins/vuetify.js';
    this.stylesPath = 'src/styles/vuetify.scss';

    this.defaultConfig = {
      theme: 'material',
      icons: '@mdi/js',
      darkMode: true,
      customColors: true,
      treeshaking: true
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'src/main.js': MERGE_STRATEGIES.MERGE_ENTRY,
      'src/main.ts': MERGE_STRATEGIES.MERGE_ENTRY,
      'src/plugins/vuetify.js': MERGE_STRATEGIES.REPLACE,
      'src/plugins/vuetify.ts': MERGE_STRATEGIES.REPLACE,
      'vite.config.js': MERGE_STRATEGIES.MERGE_VITE_CONFIG,
      'vite.config.ts': MERGE_STRATEGIES.MERGE_VITE_CONFIG
    };

    this.setupInstructions = [
      'Vuetify is configured and ready to use',
      'Import components as needed: import { VBtn, VCard } from "vuetify/components"',
      'Use Material Design 3 design tokens for theming'
    ];

    this.postInstallSteps = [
      'npm install',
      'npm run dev'
    ];

    this.gitignoreItems = [];
  }

  /**
   * Get NPM dependencies for Vuetify
   * @returns {Object} Dependencies object
   */
  getDependencies() {
    return {
      'vuetify': '^3.4.0',
      '@mdi/js': '^7.3.0'
    };
  }

  /**
   * Get development dependencies
   * @returns {Object} Dev dependencies object
   */
  getDevDependencies() {
    return {
      'vite-plugin-vuetify': '^2.0.0',
      'sass': '^1.69.0'
    };
  }

  /**
   * Get configuration files
   * @returns {Array} Config files
   */
  getConfigFiles() {
    return [
      {
        path: 'src/plugins/vuetify.ts',
        content: this.getVuetifyPlugin()
      },
      {
        path: 'src/styles/settings.scss',
        content: this.getVuetifySettings()
      }
    ];
  }

  /**
   * Get style imports for the framework
   * @returns {Array} Style import paths
   */
  getStyleImports() {
    return [
      'vuetify/styles',
      '@mdi/font/css/materialdesignicons.css'
    ];
  }

  /**
   * Get framework-specific setup configuration
   * @param {string} framework - Target framework
   * @returns {Object} Setup configuration
   */
  getFrameworkSetup(framework) {
    if (framework !== 'vue3') {
      throw new Error('Vuetify only supports Vue 3');
    }

    return {
      imports: [
        "import { createVuetify } from 'vuetify'",
        "import 'vuetify/styles'",
        "import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'"
      ],
      plugins: [
        'app.use(vuetify)'
      ],
      config: [
        'const vuetify = createVuetify({',
        '  theme: {',
        '    defaultTheme: "light"',
        '  },',
        '  icons: {',
        '    defaultSet: "mdi",',
        '    aliases,',
        '    sets: { mdi }',
        '  }',
        '})'
      ]
    };
  }

  /**
   * Get Vuetify plugin configuration
   * @returns {string} Plugin content
   */
  getVuetifyPlugin() {
    return `import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Custom theme
const customTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#FFFFFF',
    surface: '#FFFFFF'
  }
}

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'elevated'
    },
    VCard: {
      elevation: 2
    }
  }
})

export default vuetify`;
  }

  /**
   * Get Vuetify SCSS settings
   * @returns {string} SCSS settings content
   */
  getVuetifySettings() {
    return `// Vuetify SASS Variables
// https://vuetifyjs.com/en/features/sass-variables/

// Material Design 3 tokens
$primary: #1976D2;
$secondary: #424242;
$accent: #82B1FF;
$error: #FF5252;
$info: #2196F3;
$success: #4CAF50;
$warning: #FFC107;

// Spacing
$spacer: 1rem;

// Typography
$body-font-family: 'Roboto', sans-serif;
$heading-font-family: 'Roboto', sans-serif;

// Border radius
$border-radius-root: 4px;

// Elevation
$elevation-umbra: rgba(0, 0, 0, 0.2);
$elevation-penumbra: rgba(0, 0, 0, 0.14);
$elevation-ambient: rgba(0, 0, 0, 0.12);`;
  }

  /**
   * Get theme configuration
   * @returns {string} Theme config content
   */
  getThemeConfig() {
    return `export const lightTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    'primary-darken-1': '#1565C0',
    secondary: '#424242',
    'secondary-darken-1': '#303030',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'on-surface': '#000000'
  }
}

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#2196F3',
    'primary-darken-1': '#1976D2',
    secondary: '#616161',
    'secondary-darken-1': '#424242',
    accent: '#FF4081',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#121212',
    surface: '#212121',
    'on-surface': '#FFFFFF'
  }
}`;
  }

  /**
   * Get component examples for the framework
   * @param {string} framework - Target framework
   * @returns {Array} Component examples
   */
  getComponentExamples(framework) {
    if (framework !== 'vue3') {
      return [];
    }

    return [
      {
        path: 'src/components/examples/VuetifyButton.vue',
        description: 'Vuetify button examples'
      },
      {
        path: 'src/components/examples/VuetifyCard.vue',
        description: 'Vuetify card examples'
      },
      {
        path: 'src/components/examples/VuetifyForm.vue',
        description: 'Vuetify form examples'
      }
    ];
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
      // Check for incompatible UI libraries
      if (this.incompatibleWith.includes(module.name)) {
        result.compatible = false;
        result.issues.push({
          type: 'incompatible',
          module: module.name,
          message: `Vuetify conflicts with ${module.name}`
        });
      }

      // Check for multiple UI libraries
      if (module.moduleType === MODULE_TYPES.UI_LIBRARY && module.name !== this.name) {
        result.warnings.push({
          type: 'multiple-ui-libraries',
          module: module.name,
          message: `Having multiple UI libraries (${this.name} + ${module.name}) may cause conflicts`
        });
      }

      // Check for Vue 3 requirement
      const hasVue3 = otherModules.some(m => 
        m.name === 'vue3' || 
        (m.provides && m.provides.includes(MODULE_PROVIDES.FRONTEND))
      );

      if (!hasVue3) {
        result.compatible = false;
        result.issues.push({
          type: 'missing-requirement',
          requirement: 'vue3',
          message: 'Vuetify requires Vue 3 frontend framework'
        });
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

    // Validate theme option
    if (config.theme && !['material', 'custom'].includes(config.theme)) {
      result.errors.push('Theme must be either "material" or "custom"');
      result.valid = false;
    }

    // Validate icons option
    if (config.icons && !['@mdi/js', '@mdi/font', 'fa'].includes(config.icons)) {
      result.warnings.push('Recommended icon sets: @mdi/js, @mdi/font, or fa');
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
    
    let display = `${selected ? '✓' : '○'} Vuetify 3 - Material Design 3 Components`;
    
    if (showDetails) {
      const features = [];
      if (this.themeSupport) features.push('Theming');
      if (this.darkModeSupport) features.push('Dark Mode');
      if (this.responsiveDesign) features.push('Responsive');
      if (this.accessibility) features.push('A11y');
      
      display += `\n  Features: ${features.join(', ')}`;
      display += `\n  Icons: ${this.iconSet}`;
      display += `\n  Compatible: Vue 3`;
    }
    
    return display;
  }
}

// Export class
export default VuetifyModule;