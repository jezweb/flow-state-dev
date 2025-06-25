/**
 * Tailwind CSS UI Library Module for Flow State Dev
 * 
 * Provides Tailwind CSS utility-first styling with PostCSS configuration,
 * theme customization, and framework-specific components.
 */
import { UILibraryModule } from '../types/ui-library-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';

export class TailwindModule extends UILibraryModule {
  constructor() {
    super('tailwind', 'Tailwind CSS - Utility-first CSS framework', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.UI_LIBRARY,
      category: 'ui-library',
      provides: [
        MODULE_PROVIDES.UI,
        MODULE_PROVIDES.STYLING,
        MODULE_PROVIDES.THEMING
      ],
      requires: [MODULE_PROVIDES.FRONTEND],
      compatibleWith: ['vue3', 'vue-base', 'react', 'angular', 'svelte'],
      incompatibleWith: ['vuetify', 'material-ui', 'ant-design', 'bootstrap'],
      priority: 70,
      templatePath: 'templates/modules/tailwind',
      libraryType: 'utility',
      compatibleFrameworks: ['vue3', 'react', 'svelte', 'angular'],
      themeSupport: true,
      darkModeSupport: true,
      customization: 'full',
      responsiveDesign: true,
      accessibility: 'wcag-aa'
    });

    // Tailwind specific properties
    this.cssFramework = 'tailwind';
    this.buildIntegration = 'postcss';
    this.plugins = ['forms', 'typography', 'aspect-ratio'];
    this.jitMode = true;
    this.purgeCSS = true;

    this.defaultConfig = {
      darkMode: 'class',
      plugins: ['forms'],
      componentExamples: true,
      customColors: true,
      preflight: true
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'tailwind.config.js': MERGE_STRATEGIES.REPLACE,
      'postcss.config.js': MERGE_STRATEGIES.REPLACE,
      'src/index.css': MERGE_STRATEGIES.PREPEND,
      'src/main.css': MERGE_STRATEGIES.PREPEND,
      'src/styles/**/*': MERGE_STRATEGIES.REPLACE,
      'src/components/**/*': MERGE_STRATEGIES.APPEND_UNIQUE
    };

    this.setupInstructions = [
      'Tailwind CSS is configured for your project:',
      '  • Utility-first CSS framework with JIT mode',
      '  • Dark mode support with class strategy',
      '  • Responsive design utilities included',
      '  • Custom color palette and themes',
      '  • PostCSS integration for processing'
    ];

    this.postInstallSteps = [
      'Start using Tailwind classes in your components',
      'Customize colors and spacing in tailwind.config.js',
      'Add custom components in src/styles/components.css',
      'Toggle dark mode with the "dark" class on html element'
    ];
  }

  /**
   * Get Tailwind-specific dependencies
   */
  getDependencies(context) {
    // Tailwind has no runtime dependencies
    return {};
  }

  /**
   * Get Tailwind-specific dev dependencies
   */
  getDevDependencies(context) {
    const devDeps = {
      'tailwindcss': '^3.4.0',
      'autoprefixer': '^10.4.16',
      'postcss': '^8.4.32'
    };

    // Add plugins based on configuration
    if (context.plugins?.includes('forms')) {
      devDeps['@tailwindcss/forms'] = '^0.5.7';
    }
    if (context.plugins?.includes('typography')) {
      devDeps['@tailwindcss/typography'] = '^0.5.10';
    }
    if (context.plugins?.includes('aspect-ratio')) {
      devDeps['@tailwindcss/aspect-ratio'] = '^0.4.2';
    }

    return devDeps;
  }

  /**
   * Get Tailwind configuration
   */
  getTailwindConfig(context) {
    const plugins = [];
    
    if (context.plugins?.includes('forms')) {
      plugins.push("require('@tailwindcss/forms')");
    }
    if (context.plugins?.includes('typography')) {
      plugins.push("require('@tailwindcss/typography')");
    }
    if (context.plugins?.includes('aspect-ratio')) {
      plugins.push("require('@tailwindcss/aspect-ratio')");
    }

    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: '${context.darkMode || 'class'}',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [${plugins.join(',\n    ')}],
}`;
  }

  /**
   * Get PostCSS configuration
   */
  getPostCSSConfig(context) {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  }

  /**
   * Get CSS imports for Tailwind
   */
  getCSSImports(context) {
    const imports = [
      '@tailwind base;',
      '@tailwind components;',
      '@tailwind utilities;'
    ];

    if (context.customColors) {
      imports.push('');
      imports.push('/* Custom component styles */');
      imports.push('@layer components {');
      imports.push('  .btn-primary {');
      imports.push('    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;');
      imports.push('  }');
      imports.push('  .btn-secondary {');
      imports.push('    @apply bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;');
      imports.push('  }');
      imports.push('  .card {');
      imports.push('    @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;');
      imports.push('  }');
      imports.push('}');
    }

    return imports.join('\n');
  }

  /**
   * Get framework-specific Vite configuration
   */
  getViteConfig(context, framework) {
    if (framework === 'vue3' || framework === 'vue-base') {
      return {
        css: {
          postcss: './postcss.config.js'
        }
      };
    }
    
    if (framework === 'react') {
      return {
        css: {
          postcss: './postcss.config.js'
        }
      };
    }

    return {};
  }

  /**
   * Get component examples for the framework
   */
  getComponentExamples(framework, context) {
    const examples = [];

    if (framework === 'vue3' || framework === 'vue-base') {
      examples.push({
        path: 'src/components/ui/Button.vue',
        description: 'Tailwind styled button component for Vue'
      });
      examples.push({
        path: 'src/components/ui/Card.vue',
        description: 'Tailwind styled card component for Vue'
      });
      examples.push({
        path: 'src/components/ui/Input.vue',
        description: 'Tailwind styled input component for Vue'
      });
    } else if (framework === 'react') {
      examples.push({
        path: 'src/components/ui/Button.tsx',
        description: 'Tailwind styled button component for React'
      });
      examples.push({
        path: 'src/components/ui/Card.tsx',
        description: 'Tailwind styled card component for React'
      });
      examples.push({
        path: 'src/components/ui/Input.tsx',
        description: 'Tailwind styled input component for React'
      });
    }

    return examples;
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
      // Check for conflicting UI libraries
      if (this.incompatibleWith.includes(module.name)) {
        result.compatible = false;
        result.issues.push({
          type: 'incompatible',
          module: module.name,
          message: `Cannot use both Tailwind CSS and ${module.name} in the same project`
        });
      }

      // Check for multiple UI libraries
      if (module.moduleType === MODULE_TYPES.UI_LIBRARY && module.name !== this.name) {
        result.warnings.push({
          type: 'multiple-ui-libraries',
          module: module.name,
          message: `Multiple UI libraries selected: Tailwind CSS and ${module.name}. This may cause styling conflicts.`
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

    // Validate dark mode option
    const validDarkModes = ['class', 'media', false];
    if (config.darkMode && !validDarkModes.includes(config.darkMode)) {
      result.errors.push(`darkMode must be one of: ${validDarkModes.join(', ')}`);
      result.valid = false;
    }

    // Validate plugins
    const validPlugins = ['forms', 'typography', 'aspect-ratio', 'line-clamp', 'container-queries'];
    if (config.plugins && Array.isArray(config.plugins)) {
      for (const plugin of config.plugins) {
        if (!validPlugins.includes(plugin)) {
          result.warnings.push(`Unknown plugin: ${plugin}. Valid plugins: ${validPlugins.join(', ')}`);
        }
      }
    }

    // Validate boolean options
    const booleanOptions = ['componentExamples', 'customColors', 'preflight'];
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

    if (context.plugins?.includes('forms')) {
      instructions.push('', 'Forms Plugin:');
      instructions.push('  • Form elements are automatically styled');
      instructions.push('  • Use utility classes for further customization');
    }

    if (context.plugins?.includes('typography')) {
      instructions.push('', 'Typography Plugin:');
      instructions.push('  • Use "prose" class for rich text content');
      instructions.push('  • Customize typography in tailwind.config.js');
    }

    if (context.darkMode === 'class') {
      instructions.push('', 'Dark Mode:');
      instructions.push('  • Add "dark" class to html element to enable dark mode');
      instructions.push('  • Use "dark:" prefix for dark mode styles');
      instructions.push('  • Example: <div class="bg-white dark:bg-gray-800">');
    }

    return instructions;
  }

  /**
   * Format module for display
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = `${selected ? '✓' : '○'} Tailwind CSS - Utility-first CSS framework for rapid UI development`;
    
    if (showDetails) {
      const features = [];
      if (this.jitMode) features.push('JIT Mode');
      if (this.darkModeSupport) features.push('Dark Mode');
      if (this.responsiveDesign) features.push('Responsive');
      if (this.customization === 'full') features.push('Fully Customizable');
      
      display += `\n  Features: ${features.join(', ')}`;
      display += `\n  Type: ${this.libraryType}`;
      display += `\n  Framework Support: ${this.compatibleFrameworks.join(', ')}`;
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
   * Get file templates - uses template scanning approach
   */
  getFileTemplates(context) {
    // Tailwind module uses template scanning approach
    return {};
  }
}

// Export class
export default TailwindModule;