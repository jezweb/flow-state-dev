/**
 * Tailwind CSS UI Module
 * Provides utility-first CSS framework for Vue and React
 */
import { UILibraryModule } from '../../base-modules.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TailwindModule extends UILibraryModule {
  constructor() {
    super({
      name: 'tailwind',
      displayName: 'Tailwind CSS',
      version: '3.4.0',
      description: 'A utility-first CSS framework for rapid UI development',
      category: 'ui-library',
      priority: 10,
      tags: ['css', 'utility-first', 'responsive', 'customizable'],
      homepage: 'https://tailwindcss.com',
      repository: 'https://github.com/tailwindlabs/tailwindcss'
    });
  }

  getMetadata() {
    return {
      ...super.getMetadata(),
      type: 'utility-css',
      designSystem: 'utility-first',
      features: {
        components: false, // Utility classes, not pre-built components
        styling: true,
        themes: true,
        darkMode: true,
        responsive: true,
        customization: true,
        treeShaking: true
      }
    };
  }

  getCompatibility() {
    return {
      requires: [],
      provides: ['ui-library', 'styling-system'],
      compatibleWith: [
        'vue3',
        'react',
        'svelte',
        'angular',
        'supabase',
        'firebase',
        'headless-ui',
        'radix-ui',
        'shadcn-ui'
      ],
      incompatibleWith: ['vuetify', 'material-ui', 'ant-design', 'bootstrap']
    };
  }

  getFileTemplates(context) {
    const templatesDir = path.join(__dirname, 'templates');
    const framework = this.detectFramework(context);
    
    const templates = {
      // Tailwind configuration
      'tailwind.config.js': {
        src: path.join(templatesDir, 'config/tailwind.config.js.template'),
        template: true
      },
      'postcss.config.js': {
        src: path.join(templatesDir, 'config/postcss.config.js.template'),
        template: true
      },
      
      // CSS files
      'src/index.css': {
        src: path.join(templatesDir, 'config/index.css.template'),
        merge: 'prepend'
      },
      
      // Utility files
      'src/utils/cn.js': {
        src: path.join(templatesDir, 'utilities/cn.js.template'),
        template: true
      }
    };

    // Add framework-specific component examples
    if (framework === 'vue3') {
      Object.assign(templates, this.getVueComponents(templatesDir));
    } else if (framework === 'react') {
      Object.assign(templates, this.getReactComponents(templatesDir));
    }

    return templates;
  }

  getVueComponents(templatesDir) {
    return {
      'src/components/ui/Button.vue': {
        src: path.join(templatesDir, 'components/vue/Button.vue.template'),
        template: true
      },
      'src/components/ui/Card.vue': {
        src: path.join(templatesDir, 'components/vue/Card.vue.template'),
        template: true
      },
      'src/components/ui/Input.vue': {
        src: path.join(templatesDir, 'components/vue/Input.vue.template'),
        template: true
      },
      'src/components/ui/Modal.vue': {
        src: path.join(templatesDir, 'components/vue/Modal.vue.template'),
        template: true
      }
    };
  }

  getReactComponents(templatesDir) {
    return {
      'src/components/ui/Button.jsx': {
        src: path.join(templatesDir, 'components/react/Button.jsx.template'),
        template: true
      },
      'src/components/ui/Card.jsx': {
        src: path.join(templatesDir, 'components/react/Card.jsx.template'),
        template: true
      },
      'src/components/ui/Input.jsx': {
        src: path.join(templatesDir, 'components/react/Input.jsx.template'),
        template: true
      },
      'src/components/ui/Modal.jsx': {
        src: path.join(templatesDir, 'components/react/Modal.jsx.template'),
        template: true
      }
    };
  }

  getDependencies(context) {
    const framework = this.detectFramework(context);
    
    return {
      dependencies: {},
      devDependencies: {
        'tailwindcss': '^3.4.0',
        'postcss': '^8.4.32',
        'autoprefixer': '^10.4.16'
      },
      optional: {
        // Component libraries that work well with Tailwind
        headlessui: framework === 'vue3' ? {
          '@headlessui/vue': '^1.7.17'
        } : framework === 'react' ? {
          '@headlessui/react': '^1.7.17'
        } : {},
        
        // Form plugin
        forms: {
          '@tailwindcss/forms': '^0.5.7'
        },
        
        // Typography plugin
        typography: {
          '@tailwindcss/typography': '^0.5.10'
        },
        
        // Animation plugin
        animation: {
          'tailwindcss-animate': '^1.0.7'
        }
      }
    };
  }

  detectFramework(context) {
    // Check for frontend framework in the module list
    const frontendModule = context.modules?.find(m => 
      m.category === 'frontend-framework'
    );
    
    return frontendModule?.name || null;
  }

  async configure(options = {}) {
    const config = {
      plugins: options.plugins || ['forms'],
      darkMode: options.darkMode !== false,
      componentExamples: options.componentExamples !== false,
      ...options
    };

    // Add plugin dependencies
    if (config.plugins.includes('forms')) {
      this.additionalDependencies = {
        ...this.additionalDependencies,
        '@tailwindcss/forms': '^0.5.7'
      };
    }

    if (config.plugins.includes('typography')) {
      this.additionalDependencies = {
        ...this.additionalDependencies,
        '@tailwindcss/typography': '^0.5.10'
      };
    }

    return config;
  }

  async beforeInstall(context) {
    console.log('🎨 Setting up Tailwind CSS...');
    
    const framework = this.detectFramework(context);
    if (!framework) {
      console.log('⚠️  No frontend framework detected. Tailwind will be configured for generic use.');
    } else {
      console.log(`✅ Configuring Tailwind for ${framework}`);
    }
  }

  async afterInstall(context) {
    console.log('✅ Tailwind CSS configured successfully');
    
    console.log('\n📋 Next steps:');
    console.log('1. Tailwind directives have been added to your CSS');
    console.log('2. PostCSS is configured to process Tailwind');
    
    if (context.tailwindConfig?.componentExamples) {
      console.log('3. Example UI components have been created in src/components/ui/');
    }
    
    console.log('\n💡 Tips:');
    console.log('- Use the Tailwind IntelliSense extension for better DX');
    console.log('- Check out Tailwind UI for premium components');
    console.log('- Use the cn() utility for conditional classes');
  }

  getScripts() {
    return {
      // No specific scripts needed - Tailwind is processed by build tools
    };
  }

  async validate() {
    const validation = await super.validate();
    
    // Check for required template files
    const templatesDir = path.join(__dirname, 'templates');
    const requiredTemplates = [
      'config/tailwind.config.js.template',
      'config/postcss.config.js.template',
      'config/index.css.template'
    ];
    
    for (const template of requiredTemplates) {
      const templatePath = path.join(templatesDir, template);
      try {
        await fs.access(templatePath);
      } catch (error) {
        validation.errors.push(`Missing required template: ${template}`);
        validation.valid = false;
      }
    }
    
    return validation;
  }
}

export default TailwindModule;