/**
 * Flow State Dev API Service
 * 
 * Main API service that can switch between mock and real APIs
 */

// Import both API implementations
import * as mockApi from './mockFlowStateApi.js';
import * as realApi from './realFlowStateApi.js';

// Configuration
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true' || false;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Select API implementation
const api = USE_REAL_API ? realApi : mockApi;

console.log(`Using ${USE_REAL_API ? 'real' : 'mock'} API`);
if (USE_REAL_API) {
  console.log(`API server: ${API_BASE_URL}`);
}

// Initialize API
let initialized = false;

export async function initializeAPI() {
  if (!initialized) {
    if (USE_REAL_API) {
      // Test connection to real API
      try {
        await api.getHealth();
        console.log('Real API connection established');
      } catch (error) {
        console.error('Failed to connect to real API:', error);
        throw new Error('Cannot connect to API server. Make sure it is running.');
      }
    } else {
      // Mock initialization
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    initialized = true;
  }
  return true;
}

// Project creation with progress tracking
export async function createProject(name, options) {
  await initializeAPI();
  
  if (USE_REAL_API) {
    return api.createProject(name, options);
  } else {
    // Mock API with progress events
    const projectApi = await mockApi.createProject(name, options);
    
    return new Promise((resolve, reject) => {
      const progressEvents = [];
      
      projectApi.onProgress((progress) => {
        progressEvents.push(progress);
        window.dispatchEvent(new CustomEvent('project-progress', { 
          detail: progress 
        }));
      });
      
      projectApi.execute()
        .then(result => {
          resolve({
            ...result,
            progressEvents
          });
        })
        .catch(reject);
    });
  }
}

// API function exports
export async function getModules(filters = {}) {
  await initializeAPI();
  
  if (USE_REAL_API) {
    return api.getModules(filters);
  } else {
    const modules = await mockApi.getModules();
    // Apply filters if needed
    if (filters.category) {
      return modules.filter(m => m.category === filters.category);
    }
    return modules;
  }
}

export async function getModule(name) {
  await initializeAPI();
  return USE_REAL_API ? api.getModule(name) : mockApi.getModule(name);
}

export async function getModuleCategories() {
  await initializeAPI();
  return USE_REAL_API ? api.getModuleCategories() : mockApi.getModuleCategories();
}

export async function searchModules(query, options) {
  await initializeAPI();
  return USE_REAL_API ? api.searchModules(query, options) : mockApi.searchModules(query, options);
}

export async function getPresets() {
  await initializeAPI();
  return USE_REAL_API ? api.getPresets() : mockApi.getPresets();
}

export async function getDiagnostics() {
  await initializeAPI();
  return USE_REAL_API ? api.getDiagnostics() : mockApi.runDiagnostics();
}

export async function runDiagnostics() {
  return getDiagnostics();
}

export async function validateStack(modules) {
  await initializeAPI();
  
  if (USE_REAL_API) {
    // TODO: Implement real validation
    return {
      valid: true,
      errors: [],
      warnings: [],
      modules: modules
    };
  } else {
    const result = await mockApi.checkCompatibility(modules);
    return {
      valid: result.compatible,
      errors: result.issues.filter(i => i.type === 'conflict').map(i => i.message),
      warnings: result.issues.filter(i => i.type === 'missing').map(i => i.message),
      modules: modules
    };
  }
}

// Project discovery functions
export async function scanProjects(paths) {
  await initializeAPI();
  return USE_REAL_API ? api.getProjects(paths) : mockApi.scanProjects(paths);
}

export async function getProjects(filters) {
  await initializeAPI();
  return USE_REAL_API ? api.getProjects() : mockApi.getProjects(filters);
}

export async function getRecentProjects() {
  await initializeAPI();
  return USE_REAL_API ? api.getRecentProjects() : mockApi.getRecentProjects();
}

export async function getProjectInfo(path) {
  await initializeAPI();
  return USE_REAL_API ? api.getProjectInfo(path) : mockApi.getProjectInfo(path);
}

export async function openProject(path, options) {
  await initializeAPI();
  return USE_REAL_API ? 
    { success: true, message: 'Project opened (real API)' } : 
    mockApi.openProject(path, options);
}

export async function runProjectCommand(path, command) {
  await initializeAPI();
  return USE_REAL_API ? 
    { success: true, output: 'Command executed (real API)' } : 
    mockApi.runProjectCommand(path, command);
}

export async function getProjectHealth(path) {
  await initializeAPI();
  return USE_REAL_API ? 
    { status: 'healthy', message: 'Project is healthy (real API)' } : 
    mockApi.getProjectHealth(path);
}

export async function getSettings() {
  await initializeAPI();
  return USE_REAL_API ? api.getSettings() : mockApi.getSettings();
}

export async function updateSettings(settings) {
  await initializeAPI();
  return USE_REAL_API ? api.updateSettings(settings) : mockApi.updateSettings(settings);
}

export async function getHealth() {
  await initializeAPI();
  return USE_REAL_API ? api.getHealth() : mockApi.getHealth();
}

export async function getVersion() {
  await initializeAPI();
  return USE_REAL_API ? api.getVersion() : mockApi.getVersion();
}

// Progress and event handling
export function onProgress(callback) {
  if (USE_REAL_API && api.onProgress) {
    api.onProgress(callback);
  }
}

export function onError(callback) {
  if (USE_REAL_API && api.onError) {
    api.onError(callback);
  }
}

export function onProgressAndError(onProgress, onError) {
  if (USE_REAL_API && api.onProgressAndError) {
    api.onProgressAndError(onProgress, onError);
  }
}

export function disconnect() {
  if (USE_REAL_API && api.disconnect) {
    api.disconnect();
  }
}

// Health check function that works with both APIs
export async function checkApiHealth() {
  try {
    if (USE_REAL_API) {
      // Test connection to real API server
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const health = await response.json();
      return {
        connected: true,
        type: 'real',
        server: API_BASE_URL,
        health
      };
    } else {
      // Mock API is always available
      return {
        connected: true,
        type: 'mock',
        health: await getHealth()
      };
    }
  } catch (error) {
    return {
      connected: false,
      type: USE_REAL_API ? 'real' : 'mock',
      error: error.message,
      suggestion: USE_REAL_API ? 
        'Make sure the API server is running (npm run server)' :
        'Mock API should always be available'
    };
  }
}

// Connection status
export function getConnectionInfo() {
  return {
    usingRealApi: USE_REAL_API,
    baseUrl: USE_REAL_API ? API_BASE_URL : 'mock',
    type: USE_REAL_API ? 'real' : 'mock'
  };
}