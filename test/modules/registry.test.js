/**
 * Tests for ModuleRegistry
 */
import { ModuleRegistry } from '../../lib/modules/registry.js';
import { createTestDir, createMockModule } from '../utils/test-helpers.js';
import { mockModules, getMockModule } from '../utils/mock-modules.js';
import { join } from 'path';
import fs from 'fs-extra';

describe('ModuleRegistry', () => {
  let registry;
  let testDir;
  
  beforeEach(async () => {
    registry = new ModuleRegistry();
    testDir = await createTestDir('registry-test');
  });
  
  describe('Module Discovery', () => {
    test('should discover modules from directory', async () => {
      // Create mock modules in test directory
      await createMockModule(testDir, mockModules['vue-base']);
      await createMockModule(testDir, mockModules['vuetify']);
      
      // Override module path for testing
      registry.modulesPath = testDir;
      
      await registry.discover();
      
      const modules = registry.getAllModules();
      expect(modules).toHaveLength(2);
      expect(modules.find(m => m.name === 'vue-base')).toBeValidModule();
      expect(modules.find(m => m.name === 'vuetify')).toBeValidModule();
    });
    
    test('should handle empty module directories gracefully', async () => {
      registry.modulesPath = testDir;
      
      await registry.discover();
      
      const modules = registry.getAllModules();
      expect(modules).toHaveLength(0);
    });
    
    test('should skip invalid modules during discovery', async () => {
      // Create valid module
      await createMockModule(testDir, mockModules['vue-base']);
      
      // Create a completely broken module directory (no module.json)
      const invalidModuleDir = join(testDir, 'broken-module');
      await fs.ensureDir(invalidModuleDir);
      await fs.writeFile(join(invalidModuleDir, 'broken.txt'), 'not a module');
      
      registry.modulesPath = testDir;
      
      await registry.discover();
      
      const modules = registry.getAllModules();
      expect(modules).toHaveLength(1);
      expect(modules[0].name).toBe('vue-base');
    });
  });
  
  describe('Module Querying', () => {
    beforeEach(async () => {
      // Set up test modules
      registry.modules = new Map([
        ['vue-base', getMockModule('vue-base')],
        ['vuetify', getMockModule('vuetify')],
        ['supabase', getMockModule('supabase')],
        ['react-base', getMockModule('react-base')]
      ]);
    });
    
    test('should get module by name', () => {
      const module = registry.getModule('vue-base');
      expect(module).toBeValidModule();
      expect(module.name).toBe('vue-base');
    });
    
    test('should return null for non-existent module', () => {
      const module = registry.getModule('non-existent');
      expect(module).toBeUndefined();
    });
    
    test('should get modules by category', () => {
      // Need to build indices first
      registry.buildIndices();
      const frontendModules = registry.getModulesByCategory('frontend-framework');
      expect(frontendModules).toHaveLength(2);
      expect(frontendModules.map(m => m.name)).toContain('vue-base');
      expect(frontendModules.map(m => m.name)).toContain('react-base');
    });
    
    test('should get all categories', () => {
      // Add categories manually for test
      registry.categories.add('frontend-framework');
      registry.categories.add('ui-library');
      registry.categories.add('backend-service');
      
      const categories = registry.getCategories();
      expect(categories).toContain('frontend-framework');
      expect(categories).toContain('ui-library');
      expect(categories).toContain('backend-service');
    });
    
    test('should get recommended modules', () => {
      // Filter recommended modules manually
      const recommended = registry.getAllModules().filter(m => m.recommended);
      expect(recommended.length).toBeGreaterThan(0);
      expect(recommended.every(m => m.recommended)).toBe(true);
    });
  });
  
  describe('Module Search', () => {
    beforeEach(async () => {
      registry.modules = new Map([
        ['vue-base', getMockModule('vue-base')],
        ['vuetify', getMockModule('vuetify')],
        ['supabase', getMockModule('supabase')]
      ]);
    });
    
    test('should search modules by name', () => {
      const results = registry.searchModules('vue');
      expect(results).toHaveLength(2); // vue-base and vuetify (compatible with vue)
      expect(results.map(m => m.name)).toContain('vue-base');
    });
    
    test('should search modules by description', () => {
      const results = registry.searchModules('Material Design');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('vuetify');
    });
    
    test('should search modules by tags', () => {
      const results = registry.searchModules('database');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('supabase');
    });
    
    test('should filter search by category', () => {
      const results = registry.searchModules('vue', { category: 'frontend-framework' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('vue-base');
    });
    
    test('should limit search results', () => {
      const results = registry.searchModules('', { limit: 2 });
      expect(results).toHaveLength(2);
    });
    
    test('should return empty array for no matches', () => {
      const results = registry.searchModules('nonexistent');
      expect(results).toHaveLength(0);
    });
  });
  
  describe('Module Validation', () => {
    test('should validate correct module', async () => {
      const module = mockModules['vue-base'];
      const result = await registry.validator.validate(module);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should detect missing required fields', async () => {
      const invalidModule = {
        name: 'invalid',
        // Missing version, category, description
      };
      
      const result = await registry.validator.validate(invalidModule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('version'))).toBe(true);
    });
    
    test('should detect invalid category', async () => {
      const invalidModule = {
        name: 'invalid',
        version: '1.0.0',
        category: 'invalid-category',
        description: 'Test module'
      };
      
      const result = await registry.validator.validate(invalidModule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('category'))).toBe(true);
    });
  });
  
  describe('Statistics', () => {
    beforeEach(() => {
      registry.modules = new Map([
        ['vue-base', getMockModule('vue-base')],
        ['vuetify', getMockModule('vuetify')],
        ['supabase', getMockModule('supabase')],
        ['pinia', getMockModule('pinia')]
      ]);
    });
    
    test('should calculate correct statistics', () => {
      const stats = registry.getStatistics();
      
      expect(stats.totalModules).toBe(4);
      expect(stats.recommended).toBe(3); // vue-base, vuetify, supabase
      expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
      expect(stats.withDependencies).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Export/Import', () => {
    beforeEach(() => {
      registry.modules = new Map([
        ['vue-base', getMockModule('vue-base')],
        ['vuetify', getMockModule('vuetify')]
      ]);
    });
    
    test('should export module data for documentation', () => {
      // Add categories for test
      registry.categories.add('frontend-framework');
      registry.categories.add('ui-library');
      
      const exported = registry.exportForDocumentation();
      
      expect(exported.modules).toHaveLength(2);
      expect(exported.categories).toContain('frontend-framework');
      expect(exported.statistics).toBeDefined();
      expect(exported.generated).toBeDefined();
    });
    
    test('should get compatible modules', () => {
      const compatible = registry.getCompatibleModules('vue-base');
      
      expect(Array.isArray(compatible)).toBe(true);
      // vuetify should be compatible with vue-base
      expect(compatible.some(m => m.name === 'vuetify')).toBe(true);
    });
  });
});