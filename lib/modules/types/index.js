/**
 * Module Types for Flow State Dev Modular Architecture
 * 
 * Exports all available module type classes that can be used
 * to create specific stack modules.
 */

export { BaseStackModule } from './base-stack-module.js';
export { FrontendFrameworkModule } from './frontend-framework-module.js';
export { UILibraryModule } from './ui-library-module.js';
export { BackendServiceModule } from './backend-service-module.js';
export { AuthProviderModule } from './auth-provider-module.js';
export { BackendFrameworkModule } from './backend-framework-module.js';

/**
 * Module type identifiers
 */
export const MODULE_TYPES = {
  BASE: 'base',
  FRONTEND_FRAMEWORK: 'frontend-framework',
  UI_LIBRARY: 'ui-library',
  BACKEND_SERVICE: 'backend-service',
  AUTH_PROVIDER: 'auth-provider',
  BACKEND_FRAMEWORK: 'backend-framework',
  DATABASE: 'database',
  DEPLOYMENT: 'deployment',
  TESTING: 'testing',
  MONITORING: 'monitoring',
  CUSTOM: 'custom'
};

/**
 * Module categories for organization
 */
export const MODULE_CATEGORIES = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  UI: 'ui',
  AUTH: 'auth',
  DATA: 'data',
  DEVOPS: 'devops',
  TOOLING: 'tooling',
  OTHER: 'other'
};

/**
 * Common provides/requires identifiers
 */
export const MODULE_PROVIDES = {
  // Base
  CONFIG: 'config',
  LINTING: 'linting',
  FORMATTING: 'formatting',
  
  // Frontend
  FRONTEND: 'frontend',
  ROUTING: 'routing',
  STATE_MANAGEMENT: 'state-management',
  
  // UI
  UI: 'ui',
  STYLING: 'styling',
  COMPONENTS: 'components',
  THEME: 'theme',
  THEMING: 'theming',
  
  // Backend
  BACKEND: 'backend',
  API: 'api',
  DATABASE: 'database',
  AUTH: 'auth',
  STORAGE: 'storage',
  REALTIME: 'realtime',
  
  // DevOps
  DEPLOYMENT: 'deployment',
  MONITORING: 'monitoring',
  LOGGING: 'logging',
  CI_CD: 'ci-cd'
};

/**
 * Merge strategies for combining module templates
 */
export const MERGE_STRATEGIES = {
  REPLACE: 'replace',              // Replace entire file
  APPEND: 'append',                // Append to end of file
  APPEND_UNIQUE: 'append-unique',  // Append only if not exists
  PREPEND: 'prepend',              // Prepend to beginning
  MERGE_JSON: 'merge-json',        // Deep merge JSON files
  MERGE_JSON_SHALLOW: 'merge-json-shallow', // Shallow merge JSON
  MERGE_ROUTES: 'merge-routes',    // Merge router configurations
  MERGE_STORES: 'merge-stores',    // Merge state management
  MERGE_ENTRY: 'merge-entry',      // Merge app entry points
  MERGE_CONFIG: 'merge-config',    // Merge configuration files
  MERGE_ESLINT: 'merge-eslint',    // Merge ESLint configs
  MERGE_VITE_CONFIG: 'merge-vite-config', // Merge Vite configs
  CUSTOM: 'custom'                 // Custom merge function
};

/**
 * Helper to validate module type
 * @param {Object} module - Module instance
 * @param {string} expectedType - Expected module type
 * @returns {boolean} Whether module is of expected type
 */
export function isModuleType(module, expectedType) {
  return module && module.moduleType === expectedType;
}

/**
 * Helper to check if module provides a feature
 * @param {Object} module - Module instance
 * @param {string} feature - Feature identifier
 * @returns {boolean} Whether module provides the feature
 */
export function moduleProvides(module, feature) {
  return module && module.provides && module.provides.includes(feature);
}

/**
 * Helper to check if module requires a feature
 * @param {Object} module - Module instance
 * @param {string} feature - Feature identifier
 * @returns {boolean} Whether module requires the feature
 */
export function moduleRequires(module, feature) {
  return module && module.requires && module.requires.includes(feature);
}