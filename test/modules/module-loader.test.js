/**
 * Tests for ModuleLoader
 */
import { ModuleLoader } from '../../lib/modules/module-loader.js';
import { createTestDir, createMockModule } from '../utils/test-helpers.js';
import { mockModules } from '../utils/mock-modules.js';
import { join } from 'path';
import fs from 'fs-extra';

describe('ModuleLoader', () => {
  let loader;
  let testDir;
  
  beforeEach(async () => {
    loader = new ModuleLoader();
    testDir = await createTestDir('loader-test');
  });
  
  describe('Module Loading', () => {
    test('should load valid module', async () => {
      const moduleDir = await createMockModule(testDir, mockModules['vue-base']);
      
      const module = await loader.load(moduleDir);
      
      expect(module).toBeValidModule();
      expect(module.name).toBe('vue-base');
      expect(module.version).toBe('1.0.0');
      expect(module.category).toBe('frontend-framework');
    });
    
    test('should throw error for missing module.json', async () => {
      const emptyDir = join(testDir, 'empty-module');
      await fs.ensureDir(emptyDir);
      
      await expect(loader.load(emptyDir)).rejects.toThrow('module.json not found');
    });
    
    test('should throw error for invalid module.json', async () => {
      const moduleDir = join(testDir, 'invalid-module');
      await fs.ensureDir(moduleDir);
      await fs.writeFile(join(moduleDir, 'module.json'), 'invalid json');
      
      await expect(loader.load(moduleDir)).rejects.toThrow();
    });
    
    test('should throw error for missing index.js', async () => {
      const moduleDir = join(testDir, 'no-index');
      await fs.ensureDir(moduleDir);
      await fs.writeJson(join(moduleDir, 'module.json'), {
        name: 'no-index',
        version: '1.0.0',
        category: 'other',
        description: 'Module without index.js'
      });
      
      await expect(loader.load(moduleDir)).rejects.toThrow('Module file not found');
    });
    
    test('should load module with custom main file', async () => {
      const moduleDir = join(testDir, 'custom-main');
      await fs.ensureDir(moduleDir);
      
      const config = {
        ...mockModules['vue-base'],
        main: 'custom.js'
      };
      
      await fs.writeJson(join(moduleDir, 'module.json'), config);
      
      const customContent = `
        export default class CustomModule {
          constructor() {
            this.name = '${config.name}';
            this.version = '${config.version}';
          }
        }
      `;
      
      await fs.writeFile(join(moduleDir, 'custom.js'), customContent);
      
      const module = await loader.load(moduleDir);
      expect(module.name).toBe('vue-base');
    });
  });
  
  describe('Module Caching', () => {
    test('should cache loaded modules', async () => {
      const moduleDir = await createMockModule(testDir, mockModules['vue-base']);
      
      const module1 = await loader.load(moduleDir);
      const module2 = await loader.load(moduleDir);
      
      expect(module1).toBe(module2); // Same instance
    });
    
    test('should clear cache when requested', async () => {
      const moduleDir = await createMockModule(testDir, mockModules['vue-base']);
      
      const module1 = await loader.load(moduleDir);
      loader.clearCache();
      const module2 = await loader.load(moduleDir);
      
      expect(module1).not.toBe(module2); // Different instances
    });
    
    test('should clear specific module from cache', async () => {
      const moduleDir1 = await createMockModule(testDir, mockModules['vue-base']);
      const moduleDir2 = await createMockModule(testDir, mockModules['vuetify']);
      
      const module1 = await loader.load(moduleDir1);
      const module2 = await loader.load(moduleDir2);
      
      loader.clearCache(moduleDir1);
      
      const module1Reloaded = await loader.load(moduleDir1);
      const module2Cached = await loader.load(moduleDir2);
      
      expect(module1).not.toBe(module1Reloaded);
      expect(module2).toBe(module2Cached);
    });
  });
  
  describe('Module Validation', () => {
    test('should validate module structure after loading', async () => {
      const moduleConfig = {
        name: 'test-module',
        version: '1.0.0',
        category: 'other',
        description: 'Test module',
        className: 'TestModule'
      };
      
      const moduleDir = join(testDir, 'test-module');
      await fs.ensureDir(moduleDir);
      await fs.writeJson(join(moduleDir, 'module.json'), moduleConfig);
      
      // Create module class without required methods
      const moduleContent = `
        export default class TestModule {
          constructor() {
            this.name = 'test-module';
            this.version = '1.0.0';
          }
          // Missing getFileTemplates and getConfigSchema
        }
      `;
      
      await fs.writeFile(join(moduleDir, 'index.js'), moduleContent);
      
      const module = await loader.load(moduleDir);
      
      // Should load but validation should catch missing methods
      expect(module.name).toBe('test-module');
      expect(typeof module.getFileTemplates).toBe('undefined');
    });
    
    test('should handle modules with all required methods', async () => {
      const moduleDir = await createMockModule(testDir, mockModules['vue-base']);
      
      const module = await loader.load(moduleDir);
      
      expect(typeof module.getFileTemplates).toBe('function');
      expect(typeof module.getConfigSchema).toBe('function');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle module with syntax errors', async () => {
      const moduleDir = join(testDir, 'syntax-error');
      await fs.ensureDir(moduleDir);
      await fs.writeJson(join(moduleDir, 'module.json'), {
        name: 'syntax-error',
        version: '1.0.0',
        category: 'other',
        description: 'Module with syntax error'
      });
      
      // Create module with syntax error
      await fs.writeFile(join(moduleDir, 'index.js'), 'invalid javascript syntax {{{');
      
      await expect(loader.load(moduleDir)).rejects.toThrow();
    });
    
    test('should handle module with runtime errors in constructor', async () => {
      const moduleDir = join(testDir, 'runtime-error');
      await fs.ensureDir(moduleDir);
      await fs.writeJson(join(moduleDir, 'module.json'), {
        name: 'runtime-error',
        version: '1.0.0',
        category: 'other',
        description: 'Module with runtime error'
      });
      
      const moduleContent = `
        export default class RuntimeErrorModule {
          constructor() {
            throw new Error('Runtime error in constructor');
          }
        }
      `;
      
      await fs.writeFile(join(moduleDir, 'index.js'), moduleContent);
      
      await expect(loader.load(moduleDir)).rejects.toThrow('Runtime error in constructor');
    });
    
    test('should handle non-existent module directory', async () => {
      const nonExistentDir = join(testDir, 'non-existent');
      
      await expect(loader.load(nonExistentDir)).rejects.toThrow();
    });
  });
  
  describe('Module Metadata', () => {
    test('should merge module.json with class properties', async () => {
      const moduleConfig = {
        name: 'metadata-test',
        version: '1.0.0',
        category: 'other',
        description: 'Test metadata merging',
        author: { name: 'Test Author' },
        tags: ['test', 'metadata']
      };
      
      const moduleDir = join(testDir, 'metadata-test');
      await fs.ensureDir(moduleDir);
      await fs.writeJson(join(moduleDir, 'module.json'), moduleConfig);
      
      const moduleContent = `
        export default class MetadataTestModule {
          constructor() {
            this.name = 'metadata-test';
            this.version = '1.0.0';
            this.priority = 75;
          }
        }
      `;
      
      await fs.writeFile(join(moduleDir, 'index.js'), moduleContent);
      
      const module = await loader.load(moduleDir);
      
      expect(module.name).toBe('metadata-test');
      expect(module.author).toEqual({ name: 'Test Author' });
      expect(module.tags).toEqual(['test', 'metadata']);
      expect(module.priority).toBe(75);
    });
  });
});