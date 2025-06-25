/**
 * Mock module implementations for testing
 */

export const mockModules = {
  // Frontend framework mock
  'vue-base': {
    name: 'vue-base',
    displayName: 'Vue 3 Base',
    version: '1.0.0',
    category: 'frontend-framework',
    description: 'Vue 3 with Composition API',
    author: { name: 'Test', email: 'test@example.com' },
    tags: ['vue', 'frontend', 'spa'],
    recommended: true,
    priority: 100,
    provides: ['frontend-framework', 'vue'],
    requires: [],
    dependencies: {
      'vue': '^3.4.0',
      '@vitejs/plugin-vue': '^5.0.0'
    },
    templates: {
      'src/main.js': {
        content: "import { createApp } from 'vue'\\nimport App from './App.vue'\\n\\ncreateApp(App).mount('#app')",
        merge: 'replace'
      },
      'package.json': {
        content: { scripts: { dev: 'vite', build: 'vite build' } },
        merge: 'merge-json'
      }
    }
  },
  
  // UI library mock
  'vuetify': {
    name: 'vuetify',
    displayName: 'Vuetify 3',
    version: '1.0.0',
    category: 'ui-library',
    description: 'Material Design component framework',
    tags: ['ui', 'material', 'components'],
    recommended: true,
    priority: 90,
    provides: ['ui-library', 'vuetify'],
    requires: ['vue'],
    dependencies: {
      'vuetify': '^3.5.0',
      '@mdi/font': '^7.4.0'
    },
    compatibleWith: ['vue-base'],
    templates: {
      'src/plugins/vuetify.js': {
        content: "import { createVuetify } from 'vuetify'\\nexport default createVuetify()",
        merge: 'replace'
      }
    }
  },
  
  // Backend service mock
  'supabase': {
    name: 'supabase',
    displayName: 'Supabase',
    version: '1.0.0',
    category: 'backend-service',
    description: 'Open source Firebase alternative',
    tags: ['backend', 'database', 'auth'],
    recommended: true,
    priority: 85,
    provides: ['backend-service', 'database', 'auth'],
    requires: [],
    dependencies: {
      '@supabase/supabase-js': '^2.39.0'
    },
    templates: {
      'src/lib/supabase.js': {
        content: "import { createClient } from '@supabase/supabase-js'\\nexport const supabase = createClient(url, key)",
        merge: 'replace'
      },
      '.env.example': {
        content: "VITE_SUPABASE_URL=\\nVITE_SUPABASE_ANON_KEY=",
        merge: 'append-unique'
      }
    }
  },
  
  // Conflicting module for testing
  'react-base': {
    name: 'react-base',
    displayName: 'React 18',
    version: '1.0.0',
    category: 'frontend-framework',
    description: 'React with hooks',
    tags: ['react', 'frontend'],
    priority: 95,
    provides: ['frontend-framework', 'react'],
    requires: [],
    incompatibleWith: ['vue-base'],
    dependencies: {
      'react': '^18.0.0',
      'react-dom': '^18.0.0'
    }
  },
  
  // Module with complex dependencies
  'pinia': {
    name: 'pinia',
    displayName: 'Pinia',
    version: '1.0.0',
    category: 'other',
    description: 'State management for Vue',
    tags: ['state', 'store'],
    priority: 80,
    provides: ['state-management'],
    requires: ['vue'],
    dependencies: {
      'pinia': '^2.1.0'
    },
    compatibleWith: ['vue-base'],
    templates: {
      'src/stores/index.js': {
        content: "import { createPinia } from 'pinia'\\nexport default createPinia()",
        merge: 'replace'
      }
    }
  },
  
  // Module with hooks for testing
  'test-hooks': {
    name: 'test-hooks',
    displayName: 'Test Hooks Module',
    version: '1.0.0',
    category: 'other',
    description: 'Module with lifecycle hooks for testing',
    priority: 50,
    hooks: {
      beforeInstall: 'console.log("Before install")',
      afterInstall: 'console.log("After install")',
      beforeGenerate: 'console.log("Before generate")',
      afterGenerate: 'console.log("After generate")'
    }
  }
};

/**
 * Create a mock module class
 */
export function createMockModuleClass(config) {
  return class MockModule {
    constructor() {
      Object.assign(this, config);
    }
    
    getFileTemplates(context) {
      return this.templates || {};
    }
    
    getConfigSchema() {
      return this.schema || { type: 'object', properties: {} };
    }
    
    async beforeInstall(context) {
      if (this.hooks?.beforeInstall) {
        if (typeof this.hooks.beforeInstall === 'function') {
          return await this.hooks.beforeInstall(context);
        }
      }
      return context;
    }
    
    async afterInstall(context) {
      if (this.hooks?.afterInstall) {
        if (typeof this.hooks.afterInstall === 'function') {
          return await this.hooks.afterInstall(context);
        }
      }
      return context;
    }
  };
}

/**
 * Get mock module instance
 */
export function getMockModule(name) {
  const config = mockModules[name];
  if (!config) {
    throw new Error(`Mock module not found: ${name}`);
  }
  
  const ModuleClass = createMockModuleClass(config);
  return new ModuleClass();
}

/**
 * Get all mock modules as instances
 */
export function getAllMockModules() {
  return Object.keys(mockModules).map(name => getMockModule(name));
}