/**
 * React Frontend Framework Module
 * Provides React 18 with Vite, TypeScript, and modern tooling
 */
import { FrontendFrameworkModule } from '../../base-modules.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ReactModule extends FrontendFrameworkModule {
  constructor() {
    super({
      name: 'react',
      displayName: 'React',
      version: '18.2.0',
      description: 'A JavaScript library for building user interfaces',
      category: 'frontend-framework',
      priority: 20,
      tags: ['frontend', 'spa', 'jsx', 'component-based'],
      homepage: 'https://react.dev',
      repository: 'https://github.com/facebook/react'
    });
  }

  getMetadata() {
    return {
      ...super.getMetadata(),
      framework: 'react',
      buildTool: 'vite',
      language: 'javascript',
      typescript: true,
      features: {
        routing: 'react-router-dom',
        stateManagement: ['context', 'redux', 'zustand'],
        styling: ['css', 'css-modules', 'styled-components', 'emotion'],
        testing: ['vitest', 'react-testing-library'],
        linting: ['eslint', 'prettier']
      }
    };
  }

  getCompatibility() {
    return {
      requires: [],
      provides: ['frontend-framework', 'react-framework'],
      compatibleWith: [
        'tailwind',
        'material-ui',
        'chakra-ui',
        'ant-design',
        'supabase',
        'firebase',
        'express',
        'nestjs'
      ],
      incompatibleWith: ['vue3', 'angular', 'svelte']
    };
  }

  getFileTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    
    return {
      // Base project files
      'package.json': {
        src: path.join(templatesDir, 'base/package.json.template'),
        template: true,
        merge: 'merge-json'
      },
      'vite.config.js': {
        src: path.join(templatesDir, 'base/vite.config.js.template'),
        template: true
      },
      'index.html': {
        src: path.join(templatesDir, 'base/index.html.template'),
        template: true
      },
      '.gitignore': {
        src: path.join(templatesDir, 'base/.gitignore.template'),
        merge: 'append-unique'
      },
      
      // Source files
      'src/main.jsx': {
        src: path.join(templatesDir, 'base/src/main.jsx.template'),
        template: true
      },
      'src/App.jsx': {
        src: path.join(templatesDir, 'base/src/App.jsx.template'),
        template: true
      },
      'src/App.css': {
        src: path.join(templatesDir, 'base/src/App.css.template')
      },
      'src/index.css': {
        src: path.join(templatesDir, 'base/src/index.css.template')
      },
      
      // Components
      'src/components/ErrorBoundary.jsx': {
        src: path.join(templatesDir, 'base/src/components/ErrorBoundary.jsx.template'),
        template: true
      },
      'src/components/Loading.jsx': {
        src: path.join(templatesDir, 'base/src/components/Loading.jsx.template')
      },
      
      // Hooks
      'src/hooks/useAuth.js': {
        src: path.join(templatesDir, 'hooks/useAuth.js.template'),
        template: true,
        condition: (ctx) => ctx.hasModule('auth-provider')
      },
      'src/hooks/useApi.js': {
        src: path.join(templatesDir, 'hooks/useApi.js.template'),
        template: true,
        condition: (ctx) => ctx.hasModule('backend-service')
      },
      
      // TypeScript files (conditional)
      'tsconfig.json': {
        src: path.join(templatesDir, 'typescript/tsconfig.json.template'),
        template: true,
        condition: (ctx) => ctx.options?.typescript !== false
      },
      'src/vite-env.d.ts': {
        src: path.join(templatesDir, 'typescript/vite-env.d.ts.template'),
        condition: (ctx) => ctx.options?.typescript !== false
      },
      
      // ESLint configuration
      '.eslintrc.cjs': {
        src: path.join(templatesDir, 'base/.eslintrc.cjs.template'),
        template: true
      }
    };
  }

  getDependencies() {
    return {
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.1',
        'vite': '^5.0.8',
        'eslint': '^8.56.0',
        'eslint-plugin-react': '^7.33.2',
        'eslint-plugin-react-hooks': '^4.6.0',
        'eslint-plugin-react-refresh': '^0.4.5'
      },
      optional: {
        // TypeScript dependencies
        typescript: {
          '@types/react': '^18.2.48',
          '@types/react-dom': '^18.2.18',
          'typescript': '^5.3.3'
        },
        // Router dependencies
        router: {
          'react-router-dom': '^6.21.3'
        },
        // State management
        redux: {
          '@reduxjs/toolkit': '^2.1.0',
          'react-redux': '^9.1.0'
        },
        zustand: {
          'zustand': '^4.5.0'
        }
      }
    };
  }

  async configure(options = {}) {
    const config = {
      typescript: options.typescript !== false,
      router: options.router !== false,
      stateManagement: options.stateManagement || 'context',
      testing: options.testing !== false,
      ...options
    };

    // Add router files if enabled
    if (config.router) {
      this.addRouterFiles();
    }

    // Add state management files
    if (config.stateManagement !== 'context') {
      this.addStateManagementFiles(config.stateManagement);
    }

    return config;
  }

  addRouterFiles() {
    const templatesDir = path.join(__dirname, 'templates');
    
    this.additionalFiles = {
      ...this.additionalFiles,
      'src/router/index.jsx': {
        src: path.join(templatesDir, 'router/index.jsx.template'),
        template: true
      },
      'src/pages/Home.jsx': {
        src: path.join(templatesDir, 'router/pages/Home.jsx.template'),
        template: true
      },
      'src/pages/About.jsx': {
        src: path.join(templatesDir, 'router/pages/About.jsx.template'),
        template: true
      },
      'src/layouts/MainLayout.jsx': {
        src: path.join(templatesDir, 'router/layouts/MainLayout.jsx.template'),
        template: true
      }
    };
  }

  addStateManagementFiles(type) {
    const templatesDir = path.join(__dirname, 'templates');
    
    if (type === 'redux') {
      this.additionalFiles = {
        ...this.additionalFiles,
        'src/store/index.js': {
          src: path.join(templatesDir, 'state/redux/store.js.template'),
          template: true
        },
        'src/store/slices/authSlice.js': {
          src: path.join(templatesDir, 'state/redux/authSlice.js.template'),
          template: true
        }
      };
    } else if (type === 'zustand') {
      this.additionalFiles = {
        ...this.additionalFiles,
        'src/store/useStore.js': {
          src: path.join(templatesDir, 'state/zustand/useStore.js.template'),
          template: true
        }
      };
    }
  }

  getScripts() {
    return {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      lint: 'eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0'
    };
  }

  async beforeInstall(context) {
    console.log('🚀 Setting up React 18 with Vite...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion < 14) {
      throw new Error('React 18 requires Node.js 14 or higher');
    }
  }

  async afterInstall(context) {
    console.log('✅ React project structure created');
    console.log('📦 Installing dependencies...');
  }

  async validate() {
    const validation = await super.validate();
    
    // Additional React-specific validation
    const templatesDir = path.join(__dirname, 'templates');
    const requiredTemplates = [
      'base/package.json.template',
      'base/src/main.jsx.template',
      'base/src/App.jsx.template'
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

export default ReactModule;