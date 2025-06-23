/**
 * Retrofit Modules Registry
 * 
 * Central registry for all available retrofit modules.
 * Modules are automatically loaded and registered here.
 */
import { RetrofitModuleRegistry } from './base-module.js';
import { DocumentationModule } from './documentation-module.js';

// Create the main registry instance
const registry = new RetrofitModuleRegistry();

// Register all available modules
registry.register(new DocumentationModule());

// TODO: Register additional modules as they're implemented
// registry.register(new SecurityModule());
// registry.register(new AIContextModule());
// registry.register(new GitHubIntegrationModule());
// registry.register(new MemorySystemModule());

/**
 * Get the configured module registry
 * @returns {RetrofitModuleRegistry} Configured registry
 */
export function getModuleRegistry() {
  return registry;
}

/**
 * Get all available modules
 * @returns {Array} Array of all registered modules
 */
export function getAllModules() {
  return registry.getAll();
}

/**
 * Get modules applicable to a specific project
 * @param {Object} projectAnalysis - Project analysis results
 * @returns {Array} Array of applicable modules
 */
export async function getApplicableModules(projectAnalysis) {
  return registry.getApplicableModules(projectAnalysis);
}

/**
 * Get a specific module by name
 * @param {string} name - Module name
 * @returns {BaseRetrofitModule} Module instance
 */
export function getModule(name) {
  return registry.get(name);
}

/**
 * List all module names and descriptions
 * @returns {Array} Array of module info objects
 */
export function listModules() {
  return registry.getAll().map(module => ({
    name: module.name,
    description: module.description,
    impact: module.impact,
    sinceVersion: module.sinceVersion
  }));
}

// Export the registry as default
export default registry;