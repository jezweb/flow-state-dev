/**
 * Module Validation Functions
 * 
 * Exports validation functions for modules and their configurations.
 */
import { ModuleValidator } from './validation/module-validator.js';

// Create a default validator instance
const defaultValidator = new ModuleValidator();

/**
 * Validate a module instance
 * @param {Object} module - Module instance to validate
 * @returns {Object} Validation result
 */
export function validateModule(module) {
  return defaultValidator.validateModule(module);
}

/**
 * Validate module configuration
 * @param {Object} config - Module configuration to validate
 * @returns {Object} Validation result
 */
export function validateModuleConfig(config) {
  return defaultValidator.validateModuleConfig(config);
}

/**
 * Validate module metadata
 * @param {Object} metadata - Module metadata to validate
 * @returns {Object} Validation result
 */
export function validateModuleMetadata(metadata) {
  return defaultValidator.validateModuleMetadata(metadata);
}

// Export the validator class as well
export { ModuleValidator };