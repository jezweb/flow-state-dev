/**
 * Tests for DependencyResolver
 */
import { DependencyResolver } from '../../lib/modules/dependency-resolver.js';
import { mockModules, getMockModule } from '../utils/mock-modules.js';
import { createMockRegistry } from '../utils/test-helpers.js';

describe('DependencyResolver', () => {
  let resolver;
  let registry;
  
  beforeEach(() => {
    const modules = [
      getMockModule('vue-base'),
      getMockModule('vuetify'),
      getMockModule('supabase'),
      getMockModule('pinia'),
      getMockModule('react-base')
    ];
    
    registry = createMockRegistry(modules);
    resolver = new DependencyResolver(registry);
  });
  
  describe('Dependency Graph Building', () => {
    test('should build graph for modules with no dependencies', async () => {
      const result = await resolver.resolve(['vue-base']);
      
      expect(result).toHaveValidDependencyGraph();
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].name).toBe('vue-base');
    });
    
    test('should resolve simple dependencies', async () => {
      const result = await resolver.resolve(['vuetify']);
      
      expect(result).toHaveValidDependencyGraph();
      expect(result.modules).toHaveLength(2);
      
      const moduleNames = result.modules.map(m => m.name);
      expect(moduleNames).toContain('vue-base'); // Required by vuetify
      expect(moduleNames).toContain('vuetify');
    });
    
    test('should resolve complex dependency chains', async () => {
      const result = await resolver.resolve(['pinia']);
      
      expect(result).toHaveValidDependencyGraph();
      expect(result.modules).toHaveLength(2);
      
      const moduleNames = result.modules.map(m => m.name);
      expect(moduleNames).toContain('vue-base'); // Required by pinia
      expect(moduleNames).toContain('pinia');
    });
    
    test('should handle multiple root modules', async () => {
      const result = await resolver.resolve(['vue-base', 'supabase']);
      
      expect(result).toHaveValidDependencyGraph();
      expect(result.modules).toHaveLength(2);
      
      const moduleNames = result.modules.map(m => m.name);
      expect(moduleNames).toContain('vue-base');
      expect(moduleNames).toContain('supabase');
    });
  });
  
  describe('Conflict Detection', () => {
    test('should detect category conflicts', async () => {
      const result = await resolver.resolve(['vue-base', 'react-base']);
      
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('category');
      expect(result.conflicts[0].category).toBe('frontend-framework');
      expect(result.conflicts[0].modules.map(m => m.name)).toEqual(['vue-base', 'react-base']);
    });
    
    test('should detect incompatibility conflicts', async () => {
      // react-base is incompatible with vue-base
      const result = await resolver.resolve(['vuetify', 'react-base']);
      
      expect(result.conflicts.length).toBeGreaterThan(0);
      const incompatibleConflict = result.conflicts.find(c => c.type === 'incompatible');
      expect(incompatibleConflict).toBeDefined();
    });
    
    test('should not detect conflicts for compatible modules', async () => {
      const result = await resolver.resolve(['vue-base', 'vuetify', 'supabase']);
      
      expect(result.conflicts).toHaveLength(0);
    });
    
    test('should detect version conflicts', async () => {
      // Create modules with conflicting version requirements
      const vueV3Module = {
        ...getMockModule('vue-base'),
        name: 'vue-v3',
        dependencies: { 'vue': '^3.0.0' }
      };
      
      const vueV2Module = {
        ...getMockModule('vue-base'),
        name: 'vue-v2',
        dependencies: { 'vue': '^2.0.0' }
      };
      
      const testRegistry = createMockRegistry([vueV3Module, vueV2Module]);
      const testResolver = new DependencyResolver(testRegistry);
      
      const result = await testResolver.resolve(['vue-v3', 'vue-v2']);
      
      expect(result.conflicts.some(c => c.type === 'version')).toBe(true);
    });
  });
  
  describe('Topological Sorting', () => {
    test('should sort modules in dependency order', async () => {
      const result = await resolver.resolve(['vuetify']);
      
      expect(result.modules).toHaveLength(2);
      
      // vue-base should come before vuetify
      const vueIndex = result.modules.findIndex(m => m.name === 'vue-base');
      const vuetifyIndex = result.modules.findIndex(m => m.name === 'vuetify');
      
      expect(vueIndex).toBeLessThan(vuetifyIndex);
    });
    
    test('should handle modules with no dependencies first', async () => {
      const result = await resolver.resolve(['vuetify', 'supabase']);
      
      const moduleNames = result.modules.map(m => m.name);
      
      // Independent modules (vue-base, supabase) should come before dependent ones (vuetify)
      const supabaseIndex = moduleNames.indexOf('supabase');
      const vueBaseIndex = moduleNames.indexOf('vue-base');
      const vuetifyIndex = moduleNames.indexOf('vuetify');
      
      expect(supabaseIndex).toBeLessThan(vuetifyIndex);
      expect(vueBaseIndex).toBeLessThan(vuetifyIndex);
    });
    
    test('should detect circular dependencies', async () => {
      // Create modules with circular dependencies
      const moduleA = {
        name: 'module-a',
        version: '1.0.0',
        category: 'other',
        description: 'Module A',
        requires: ['module-b']
      };
      
      const moduleB = {
        name: 'module-b',
        version: '1.0.0',
        category: 'other',
        description: 'Module B',
        requires: ['module-a']
      };
      
      const testRegistry = createMockRegistry([moduleA, moduleB]);
      const testResolver = new DependencyResolver(testRegistry);
      
      await expect(testResolver.resolve(['module-a'])).rejects.toThrow('Circular dependency');
    });
  });
  
  describe('Missing Dependencies', () => {
    test('should detect missing dependencies', async () => {
      // Create module that requires non-existent dependency
      const moduleWithMissingDep = {
        name: 'missing-dep-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with missing dependency',
        requires: ['non-existent-module']
      };
      
      const testRegistry = createMockRegistry([moduleWithMissingDep]);
      const testResolver = new DependencyResolver(testRegistry);
      
      await expect(testResolver.resolve(['missing-dep-module'])).rejects.toThrow('Module not found: non-existent-module');
    });
    
    test('should list all missing dependencies', async () => {
      const moduleWithMultipleMissing = {
        name: 'multiple-missing',
        version: '1.0.0',
        category: 'other',
        description: 'Module with multiple missing dependencies',
        requires: ['missing-1', 'missing-2']
      };
      
      const testRegistry = createMockRegistry([moduleWithMultipleMissing]);
      const testResolver = new DependencyResolver(testRegistry);
      
      try {
        await testResolver.resolve(['multiple-missing']);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('missing-1');
        expect(error.message).toContain('missing-2');
      }
    });
  });
  
  describe('Resolution Options', () => {
    test('should respect includeDev option', async () => {
      const result = await resolver.resolve(['vue-base'], { includeDev: true });
      
      // Should include development dependencies if any
      expect(result).toHaveValidDependencyGraph();
    });
    
    test('should respect maxDepth option', async () => {
      // Create deep dependency chain
      const moduleA = {
        name: 'deep-a',
        version: '1.0.0',
        category: 'other',
        description: 'Deep module A',
        requires: ['deep-b']
      };
      
      const moduleB = {
        name: 'deep-b',
        version: '1.0.0',
        category: 'other',
        description: 'Deep module B',
        requires: ['deep-c']
      };
      
      const moduleC = {
        name: 'deep-c',
        version: '1.0.0',
        category: 'other',
        description: 'Deep module C',
        requires: []
      };
      
      const testRegistry = createMockRegistry([moduleA, moduleB, moduleC]);
      const testResolver = new DependencyResolver(testRegistry);
      
      const result = await testResolver.resolve(['deep-a'], { maxDepth: 1 });
      
      // Should only include moduleA and moduleB (depth 1)
      expect(result.modules).toHaveLength(2);
      expect(result.modules.map(m => m.name)).toContain('deep-a');
      expect(result.modules.map(m => m.name)).toContain('deep-b');
      expect(result.modules.map(m => m.name)).not.toContain('deep-c');
    });
    
    test('should handle allowConflicts option', async () => {
      const result = await resolver.resolve(['vue-base', 'react-base'], { allowConflicts: true });
      
      expect(result.modules).toHaveLength(2);
      expect(result.conflicts).toHaveLength(1); // Conflicts detected but allowed
    });
  });
  
  describe('Resolution Strategy', () => {
    test('should use priority for conflict resolution', async () => {
      // Create two modules in same category with different priorities
      const highPriorityModule = {
        name: 'high-priority',
        version: '1.0.0',
        category: 'frontend-framework',
        description: 'High priority module',
        priority: 100
      };
      
      const lowPriorityModule = {
        name: 'low-priority',
        version: '1.0.0',
        category: 'frontend-framework',
        description: 'Low priority module',
        priority: 50
      };
      
      const testRegistry = createMockRegistry([highPriorityModule, lowPriorityModule]);
      const testResolver = new DependencyResolver(testRegistry);
      
      const result = await testResolver.resolve(['high-priority', 'low-priority'], { 
        conflictResolution: 'priority' 
      });
      
      // Should prefer high priority module
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].name).toBe('high-priority');
    });
  });
});