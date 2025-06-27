/**
 * Flow State Dev API
 * 
 * Programmatic API for Flow State Dev CLI functionality
 * This wrapper allows GUI applications to use Flow State Dev features
 * without executing CLI commands directly.
 */

import { FlowStateAPI } from './flow-state-api.js';

// Export the main API class
export { FlowStateAPI };

// Export individual API modules for granular access
export * from './modules/index.js';
export * from './project/index.js';
export * from './doctor/index.js';
export * from './memory/index.js';
export * from './github/index.js';

// Create and export default instance
const api = new FlowStateAPI();
export default api;