/**
 * React Frontend Framework Module for Flow State Dev
 * 
 * Provides React 18 project scaffolding with Vite, TypeScript support,
 * routing, state management, and modern development tooling.
 */
import { FrontendFrameworkModule } from '../types/frontend-framework-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';

export class ReactModule extends FrontendFrameworkModule {
  constructor() {
    super('react', 'React Frontend Framework with Vite', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.FRONTEND_FRAMEWORK,
      category: 'frontend-framework',
      provides: [
        MODULE_PROVIDES.FRONTEND,
        MODULE_PROVIDES.ROUTING,
        MODULE_PROVIDES.STATE_MANAGEMENT
      ],
      requires: [],
      compatibleWith: ['tailwind', 'material-ui', 'supabase', 'firebase'],
      incompatibleWith: ['vue3', 'vue-base', 'angular', 'svelte'],
      priority: 80,
      templatePath: 'templates/modules/react'
    });

    // Frontend Framework specific properties
    this.framework = 'react';
    this.buildTool = 'vite';
    this.typescript = true;
    this.packageManager = 'npm';
    this.stateManagement = ['context', 'redux', 'zustand'];
    this.routing = true;
    this.testing = ['vitest', 'react-testing-library'];
    this.linting = true;
    this.formatting = true;

    this.defaultConfig = {
      typescript: true,
      router: true,
      stateManagement: 'context',
      eslint: true,
      prettier: true,
      vitest: true
    };

    this.mergeStrategies = {
      'package.json': MERGE_STRATEGIES.MERGE_JSON,
      'vite.config.js': MERGE_STRATEGIES.REPLACE,
      'tsconfig.json': MERGE_STRATEGIES.MERGE_JSON,
      'eslint.config.js': MERGE_STRATEGIES.REPLACE,
      '.eslintrc.cjs': MERGE_STRATEGIES.REPLACE,
      'src/**/*': MERGE_STRATEGIES.REPLACE,
      'public/**/*': MERGE_STRATEGIES.REPLACE
    };

    this.setupInstructions = [
      'React 18 project is ready with:',
      '  • Vite for fast development and building',
      '  • TypeScript for type safety',
      '  • React Router for routing',
      '  • ESLint and Prettier for code quality',
      '  • Vitest for testing',
      '  • Hot module replacement for development'
    ];

    this.postInstallSteps = [
      'Run "npm run dev" to start development server',
      'Edit src/App.jsx to customize your application',
      'Add components in src/components/',
      'Configure routing in src/router/index.jsx'
    ];
  }

  /**
   * Get React-specific dependencies
   */
  getDependencies(context) {
    const deps = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    };

    // Add router if enabled
    if (context.router !== false) {
      deps['react-router-dom'] = '^6.21.3';
    }

    // Add state management dependencies
    if (context.stateManagement === 'redux') {
      deps['@reduxjs/toolkit'] = '^2.1.0';
      deps['react-redux'] = '^9.1.0';
    } else if (context.stateManagement === 'zustand') {
      deps['zustand'] = '^4.5.0';
    }

    return deps;
  }

  /**
   * Get React-specific dev dependencies
   */
  getDevDependencies(context) {
    const devDeps = {
      '@vitejs/plugin-react': '^4.2.1',
      'vite': '^5.0.8',
      'eslint': '^8.56.0',
      'eslint-plugin-react': '^7.33.2',
      'eslint-plugin-react-hooks': '^4.6.0',
      'eslint-plugin-react-refresh': '^0.4.5'
    };

    // TypeScript dependencies
    if (context.typescript !== false) {
      devDeps['@types/react'] = '^18.2.48';
      devDeps['@types/react-dom'] = '^18.2.18';
      devDeps['typescript'] = '^5.3.3';
    }

    // Testing dependencies
    if (context.testing !== false) {
      devDeps['vitest'] = '^1.2.0';
      devDeps['@testing-library/react'] = '^14.1.2';
      devDeps['@testing-library/jest-dom'] = '^6.2.0';
      devDeps['@testing-library/user-event'] = '^14.5.2';
      devDeps['@vitest/ui'] = '^1.2.0';
      devDeps['jsdom'] = '^24.0.0';
    }

    return devDeps;
  }

  /**
   * Get package.json scripts
   */
  getScripts(context) {
    const scripts = {
      'dev': 'vite',
      'build': context.typescript !== false ? 'tsc && vite build' : 'vite build',
      'lint': `eslint . --ext js,jsx${context.typescript !== false ? ',ts,tsx' : ''} --report-unused-disable-directives --max-warnings 0`,
      'preview': 'vite preview'
    };

    // Add testing scripts
    if (context.testing !== false) {
      scripts['test'] = 'vitest';
      scripts['test:ui'] = 'vitest --ui';
      scripts['test:coverage'] = 'vitest --coverage';
    }

    return scripts;
  }

  /**
   * Get Vite configuration for React
   */
  getViteConfig(context) {
    const config = {
      plugins: ['react()'],
      imports: ["import { defineConfig } from 'vite'", "import react from '@vitejs/plugin-react'"],
      test: context.testing !== false ? {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.js'
      } : undefined
    };

    return config;
  }

  /**
   * Get ESLint configuration
   */
  getESLintConfig(context) {
    const config = {
      root: true,
      env: { browser: true, es2020: true },
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:react-hooks/recommended'
      ],
      ignorePatterns: ['dist', '.eslintrc.cjs'],
      parser: '@typescript-eslint/parser',
      plugins: ['react-refresh'],
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true }
        ]
      }
    };

    if (context.typescript === false) {
      config.extends = config.extends.filter(ext => !ext.includes('typescript'));
      config.parser = undefined;
    }

    return config;
  }

  /**
   * Get TypeScript configuration
   */
  getTSConfig(context) {
    if (context.typescript === false) return null;

    return {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    };
  }

  /**
   * Get main application template
   */
  getAppTemplate(context) {
    const isTS = context.typescript !== false;
    const hasRouter = context.router !== false;
    const ext = isTS ? 'tsx' : 'jsx';

    if (hasRouter) {
      return `import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App`;
    }

    return `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.${ext}</code> and save to test HMR
          </p>
        </div>
      </header>
    </div>
  )
}

export default App`;
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
          message: `Cannot use both React and ${module.name} in the same project`
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

    // Validate state management choice
    if (config.stateManagement && !this.stateManagement.includes(config.stateManagement)) {
      result.errors.push(`stateManagement must be one of: ${this.stateManagement.join(', ')}`);
      result.valid = false;
    }

    // Validate boolean options
    const booleanOptions = ['typescript', 'router', 'eslint', 'testing'];
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

    if (context.stateManagement === 'redux') {
      instructions.push('', 'Redux Setup:');
      instructions.push('  • Configure your store in src/store/store.js');
      instructions.push('  • Create slices in src/store/slices/');
      instructions.push('  • Connect components with useSelector and useDispatch');
    } else if (context.stateManagement === 'zustand') {
      instructions.push('', 'Zustand Setup:');
      instructions.push('  • Create stores in src/stores/');
      instructions.push('  • Use stores with hooks in components');
    }

    if (context.testing !== false) {
      instructions.push('', 'Testing:');
      instructions.push('  • Run "npm run test" to start testing');
      instructions.push('  • Write tests in __tests__ folders or .test.jsx files');
      instructions.push('  • Use React Testing Library for component tests');
    }

    return instructions;
  }

  /**
   * Format module for display
   */
  formatDisplay(options = {}) {
    const { selected = false, showDetails = false } = options;
    
    let display = `${selected ? '✓' : '○'} React - Popular JavaScript library for building user interfaces`;
    
    if (showDetails) {
      const features = [];
      if (this.typescript) features.push('TypeScript');
      if (this.routing) features.push('Router');
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
    // React module uses template scanning approach like Vercel
    return {};
  }
}

// Export class
export default ReactModule;