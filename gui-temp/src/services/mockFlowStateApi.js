/**
 * Mock Flow State API for GUI Testing
 * 
 * This provides a simplified API that works in the browser
 * without requiring Node.js modules
 */

// Mock module data
const mockModules = [
  {
    name: 'vue',
    displayName: 'Vue 3',
    category: 'frontend-framework',
    version: '3.4.21',
    description: 'Progressive JavaScript framework for building user interfaces',
    provides: ['frontend-framework'],
    requires: [],
    conflicts: ['react', 'svelte', 'angular'],
    tags: ['frontend', 'framework', 'vue']
  },
  {
    name: 'vuetify',
    displayName: 'Vuetify 3',
    category: 'ui-library',
    version: '3.5.9',
    description: 'Material Design component framework for Vue.js',
    provides: ['ui-library'],
    requires: ['vue'],
    conflicts: ['quasar', 'element-plus'],
    tags: ['ui', 'material', 'components']
  },
  {
    name: 'supabase',
    displayName: 'Supabase',
    category: 'backend',
    version: '2.39.8',
    description: 'Open source Firebase alternative with PostgreSQL',
    provides: ['backend', 'database', 'auth'],
    requires: [],
    conflicts: [],
    tags: ['backend', 'database', 'auth', 'postgresql']
  },
  {
    name: 'react',
    displayName: 'React',
    category: 'frontend-framework',
    version: '18.2.0',
    description: 'JavaScript library for building user interfaces',
    provides: ['frontend-framework'],
    requires: [],
    conflicts: ['vue', 'svelte', 'angular'],
    tags: ['frontend', 'framework', 'react']
  },
  {
    name: 'tailwind',
    displayName: 'Tailwind CSS',
    category: 'styling',
    version: '3.4.1',
    description: 'Utility-first CSS framework',
    provides: ['styling'],
    requires: [],
    conflicts: [],
    tags: ['css', 'styling', 'utility']
  }
];

// Mock presets
const mockPresets = [
  {
    id: 'vue-fullstack',
    name: 'Vue Full Stack',
    description: 'Complete Vue 3 + Vuetify + Supabase stack',
    modules: ['vue', 'vuetify', 'supabase', 'base-config'],
    tags: ['fullstack', 'vue', 'recommended'],
    useCase: 'Full-stack applications',
    difficulty: 'intermediate',
    recommended: true
  },
  {
    id: 'react-tailwind',
    name: 'React + Tailwind',
    description: 'Modern React with Tailwind CSS',
    modules: ['react', 'tailwind', 'base-config'],
    tags: ['frontend', 'react'],
    useCase: 'React applications',
    difficulty: 'beginner'
  }
];

// API Methods
export async function getModules() {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockModules;
}

export async function getPresets() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockPresets;
}

export async function checkCompatibility(modules) {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const issues = [];
  const moduleDetails = mockModules.filter(m => modules.includes(m.name));
  
  // Check for conflicts
  for (const module of moduleDetails) {
    for (const other of moduleDetails) {
      if (module !== other && module.conflicts?.includes(other.name)) {
        issues.push({
          type: 'conflict',
          module: module.name,
          conflicts: other.name,
          message: `${module.displayName} conflicts with ${other.displayName}`
        });
      }
    }
  }
  
  // Check for missing requirements
  for (const module of moduleDetails) {
    for (const req of module.requires || []) {
      if (!modules.includes(req)) {
        issues.push({
          type: 'missing',
          module: module.name,
          requires: req,
          message: `${module.displayName} requires ${req}`
        });
      }
    }
  }
  
  return {
    compatible: issues.length === 0,
    issues,
    warnings: []
  };
}

export async function createProject(projectName, options) {
  const events = [];
  
  // Simulate project creation with progress events
  const steps = [
    { name: 'validate', message: 'Validating project configuration', duration: 500 },
    { name: 'create-dir', message: 'Creating project directory', duration: 300 },
    { name: 'generate', message: 'Generating project files', duration: 1000 },
    { name: 'configure', message: 'Configuring modules', duration: 800 },
    { name: 'install', message: 'Installing dependencies (simulated)', duration: 2000 },
    { name: 'complete', message: 'Project created successfully!', duration: 200 }
  ];
  
  let onProgress = null;
  
  const api = {
    onProgress(callback) {
      onProgress = callback;
    },
    
    async execute() {
      for (const step of steps) {
        if (onProgress) {
          onProgress({ type: 'step:start', step: step.name, message: step.message });
        }
        await new Promise(resolve => setTimeout(resolve, step.duration));
        if (onProgress) {
          onProgress({ type: 'step:complete', step: step.name });
        }
      }
      
      return {
        success: true,
        projectName,
        projectPath: `/home/user/projects/${projectName}`,
        modules: options.modules || [],
        duration: steps.reduce((sum, s) => sum + s.duration, 0),
        nextSteps: [
          { command: `cd ${projectName}`, description: 'Navigate to project' },
          { command: 'npm run dev', description: 'Start development server' }
        ]
      };
    }
  };
  
  return api;
}

// Mock projects data
const mockProjects = [
  {
    name: 'my-vue-app',
    displayName: 'My Vue App',
    path: '/home/user/projects/my-vue-app',
    framework: { name: 'vue', version: '^3.4.21' },
    version: '1.0.0',
    description: 'A Vue 3 application with Vuetify',
    lastModified: new Date('2024-01-15T10:30:00'),
    hasGit: true,
    health: {
      hasNodeModules: true,
      hasLockFile: true,
      hasTests: true,
      hasLinter: true,
      hasTypeScript: false,
      hasDocs: true,
      status: 'healthy'
    },
    scripts: {
      dev: 'vite',
      build: 'vite build',
      test: 'vitest',
      lint: 'eslint .'
    }
  },
  {
    name: 'react-dashboard',
    displayName: 'React Dashboard',
    path: '/home/user/projects/react-dashboard',
    framework: { name: 'react', version: '^18.2.0' },
    version: '0.2.0',
    description: 'Admin dashboard built with React',
    lastModified: new Date('2024-01-10T14:20:00'),
    hasGit: true,
    health: {
      hasNodeModules: false,
      hasLockFile: true,
      hasTests: true,
      hasLinter: true,
      hasTypeScript: true,
      hasDocs: true,
      status: 'warning',
      message: 'Dependencies not installed'
    },
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test'
    }
  },
  {
    name: 'sveltekit-blog',
    displayName: 'SvelteKit Blog',
    path: '/home/user/projects/sveltekit-blog',
    framework: { name: 'sveltekit', version: '^2.0.0' },
    version: '0.1.0',
    description: 'Personal blog with SvelteKit',
    lastModified: new Date('2024-01-20T09:15:00'),
    hasGit: false,
    health: {
      hasNodeModules: true,
      hasLockFile: false,
      hasTests: false,
      hasLinter: true,
      hasTypeScript: true,
      hasDocs: false,
      status: 'warning',
      message: 'No lock file found'
    },
    scripts: {
      dev: 'vite dev',
      build: 'vite build',
      preview: 'vite preview'
    }
  }
];

export async function scanProjects(paths) {
  // Simulate scanning with progress
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock projects
  return mockProjects;
}

export async function getProjects(filters = {}) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let projects = [...mockProjects];
  
  if (filters.framework) {
    projects = projects.filter(p => p.framework.name === filters.framework);
  }
  
  if (filters.healthy !== undefined) {
    projects = projects.filter(p => (p.health.status === 'healthy') === filters.healthy);
  }
  
  return projects;
}

export async function openProject(path, options = {}) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    editor: options.editor || 'vscode',
    path
  };
}

export async function runProjectCommand(path, command) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    command: `npm run ${command}`,
    stdout: `> ${command}\n\nCommand executed successfully!`,
    stderr: ''
  };
}

export async function getProjectHealth(path) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const project = mockProjects.find(p => p.path === path);
  if (!project) {
    throw new Error('Project not found');
  }
  
  return {
    project: {
      name: project.name,
      path: project.path,
      framework: project.framework
    },
    health: project.health,
    recommendations: project.health.status === 'warning' ? [
      {
        type: 'warning',
        message: project.health.message,
        action: project.health.hasNodeModules ? 'Run npm install' : 'Add package-lock.json'
      }
    ] : []
  };
}

// Default settings
const defaultSettings = {
  searchPaths: [
    '~/claude',
    '~/projects', 
    '~/dev'
  ],
  defaultEditor: 'code',
  customEditorCommand: '',
  darkMode: false,
  theme: 'blue',
  maxSearchDepth: 3,
  scanOnStartup: true,
  showHiddenProjects: false
}

// Load settings from localStorage or use defaults
function loadStoredSettings() {
  try {
    const stored = localStorage.getItem('fsd-settings')
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.warn('Failed to load stored settings:', error)
  }
  return { ...defaultSettings }
}

// Save settings to localStorage
function saveStoredSettings(settings) {
  try {
    localStorage.setItem('fsd-settings', JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save settings:', error)
  }
}

// Initialize settings
let mockSettings = loadStoredSettings()

export async function getSettings() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { ...mockSettings };
}

export async function updateSettings(newSettings) {
  await new Promise(resolve => setTimeout(resolve, 200));
  mockSettings = { ...mockSettings, ...newSettings }
  saveStoredSettings(mockSettings)
  console.log('Settings updated:', mockSettings)
  return { ...mockSettings };
}

export async function runDiagnostics() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    timestamp: new Date().toISOString(),
    node: {
      status: 'ok',
      version: 'v20.11.0',
      message: 'Node.js version is supported'
    },
    git: {
      status: 'ok',
      version: '2.34.1',
      message: 'Git is properly installed'
    },
    npm: {
      status: 'ok',
      version: '10.2.4',
      message: 'npm registry is accessible'
    },
    docker: {
      status: 'ok',
      message: 'Docker Desktop is installed',
      version: '24.0.7'
    },
    system: {
      platform: 'linux',
      arch: 'x64',
      memory: {
        total: 16777216,
        free: 8388608
      }
    },
    summary: {
      overallStatus: 'ok',
      errors: 0,
      warnings: 0,
      message: 'System is healthy and ready'
    }
  };
}

export async function getHealth() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    api: 'mock',
    version: '1.0.0'
  };
}

export async function getVersion() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    version: '2.1.3',
    name: 'flow-state-dev',
    description: 'The fastest way to start a modern web project'
  };
}

export async function getModule(name) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockModules.find(m => m.name === name) || null;
}

export async function getModuleCategories() {
  await new Promise(resolve => setTimeout(resolve, 100));
  const categories = [...new Set(mockModules.map(m => m.category))];
  return categories;
}

export async function searchModules(query, options = {}) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const searchQuery = query.toLowerCase();
  return mockModules.filter(module => 
    module.name.toLowerCase().includes(searchQuery) ||
    module.displayName.toLowerCase().includes(searchQuery) ||
    module.description.toLowerCase().includes(searchQuery) ||
    module.tags.some(tag => tag.toLowerCase().includes(searchQuery))
  );
}

export async function getRecentProjects() {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return projects sorted by last modified
  return [...mockProjects]
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
    .slice(0, 5);
}

export async function getProjectInfo(path) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockProjects.find(p => p.path === path) || null;
}