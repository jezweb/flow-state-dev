/**
 * Common test utilities for Flow State Dev tests
 */
import { join } from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a temporary test directory
 */
export async function createTestDir(name) {
  const testDir = join(global.testTempDir, name);
  await fs.ensureDir(testDir);
  return testDir;
}

/**
 * Create a mock module structure
 */
export async function createMockModule(dir, config) {
  const moduleDir = join(dir, config.name);
  await fs.ensureDir(moduleDir);
  
  // Create module.json
  const moduleJson = {
    name: config.name,
    version: config.version || '1.0.0',
    category: config.category || 'other',
    description: config.description || 'Mock module for testing',
    ...config
  };
  
  await fs.writeJson(join(moduleDir, 'module.json'), moduleJson, { spaces: 2 });
  
  // Create index.js
  const indexContent = `
export default class ${config.className || 'MockModule'} {
  constructor() {
    this.name = '${config.name}';
    this.version = '${config.version || '1.0.0'}';
  }
  
  getFileTemplates(context) {
    return ${JSON.stringify(config.templates || {})};
  }
  
  getConfigSchema() {
    return ${JSON.stringify(config.schema || { type: 'object', properties: {} })};
  }
}
`;
  
  await fs.writeFile(join(moduleDir, 'index.js'), indexContent);
  
  return moduleDir;
}

/**
 * Create a test project structure
 */
export async function createTestProject(name, options = {}) {
  const projectDir = await createTestDir(name);
  
  // Create basic structure
  await fs.ensureDir(join(projectDir, 'src'));
  await fs.ensureDir(join(projectDir, 'lib'));
  
  // Create package.json
  const packageJson = {
    name: name,
    version: '1.0.0',
    type: 'module',
    dependencies: options.dependencies || {},
    devDependencies: options.devDependencies || {},
    ...options.packageJson
  };
  
  await fs.writeJson(join(projectDir, 'package.json'), packageJson, { spaces: 2 });
  
  // Create other files if specified
  if (options.files) {
    for (const [path, content] of Object.entries(options.files)) {
      const filePath = join(projectDir, path);
      await fs.ensureDir(dirname(filePath));
      await fs.writeFile(filePath, content);
    }
  }
  
  return projectDir;
}

/**
 * Run a command and capture output
 */
export async function runCommand(command, options = {}) {
  const { execSync } = await import('child_process');
  
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      ...options
    });
    
    return {
      success: true,
      output: output.trim(),
      error: null
    };
  } catch (error) {
    return {
      success: false,
      output: error.stdout ? error.stdout.toString() : '',
      error: error.message
    };
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * Mock the module registry for testing
 */
export function createMockRegistry(modules = []) {
  return {
    modules: new Map(modules.map(m => [m.name, m])),
    
    async discover() {
      // Mock discovery
    },
    
    getAllModules() {
      return Array.from(this.modules.values());
    },
    
    getModule(name) {
      return this.modules.get(name);
    },
    
    getModulesByCategory(category) {
      return this.getAllModules().filter(m => m.category === category);
    },
    
    searchModules(query) {
      const lowerQuery = query.toLowerCase();
      return this.getAllModules().filter(m => 
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
      );
    },
    
    async validateModule(module) {
      return { valid: true, errors: [], warnings: [] };
    }
  };
}

/**
 * Create a test context for onboarding
 */
export function createTestContext(overrides = {}) {
  return {
    projectName: 'test-project',
    interactive: false,
    here: false,
    subfolder: true,
    force: true,
    ...overrides
  };
}

/**
 * Assert file exists
 */
export async function assertFileExists(path, message) {
  const exists = await fs.pathExists(path);
  if (!exists) {
    throw new Error(message || `File does not exist: ${path}`);
  }
}

/**
 * Assert file contains content
 */
export async function assertFileContains(path, content, message) {
  await assertFileExists(path);
  const fileContent = await fs.readFile(path, 'utf-8');
  if (!fileContent.includes(content)) {
    throw new Error(message || `File ${path} does not contain: ${content}`);
  }
}

/**
 * Clean up test artifacts
 */
export async function cleanup(...paths) {
  for (const path of paths) {
    if (await fs.pathExists(path)) {
      await fs.remove(path);
    }
  }
}