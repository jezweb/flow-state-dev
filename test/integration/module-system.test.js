/**
 * Integration tests for the complete module system
 */
import { ModuleRegistry } from '../../lib/modules/registry.js';
import { DependencyResolver } from '../../lib/modules/dependency-resolver.js';
import { TemplateGenerator } from '../../lib/modules/template-generator.js';
import { createTestDir, createMockModule, createTestProject, assertFileExists } from '../utils/test-helpers.js';
import { mockModules } from '../utils/mock-modules.js';
import { join } from 'path';

describe('Module System Integration', () => {
  let testDir;
  let registry;
  let resolver;
  
  beforeEach(async () => {
    testDir = await createTestDir('integration-test');
    registry = new ModuleRegistry();
    
    // Create mock modules in test directory
    await createMockModule(testDir, mockModules['vue-base']);
    await createMockModule(testDir, mockModules['vuetify']);
    await createMockModule(testDir, mockModules['supabase']);
    await createMockModule(testDir, mockModules['pinia']);
    
    // Configure registry for test directory
    registry.moduleDirectories = [testDir];
    
    // Discover modules
    await registry.discover();
    
    resolver = new DependencyResolver(registry);
  });
  
  describe('End-to-End Module Resolution and Generation', () => {
    test('should resolve and generate simple stack', async () => {
      const projectDir = await createTestDir('simple-stack-project');
      
      // Resolve dependencies for Vue + Vuetify stack
      const resolution = await resolver.resolve(['vue-base', 'vuetify']);
      
      expect(resolution.modules).toHaveLength(2);
      expect(resolution.conflicts).toHaveLength(0);
      
      // Generate project files
      const generator = new TemplateGenerator(resolution.modules, projectDir);
      const context = { projectName: 'simple-stack' };
      
      const result = await generator.generate(context);
      
      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);
      
      // Verify key files were generated
      await assertFileExists(join(projectDir, 'src/main.js'));
      await assertFileExists(join(projectDir, 'src/plugins/vuetify.js'));
      await assertFileExists(join(projectDir, 'package.json'));
    });
    
    test('should handle complex stack with dependencies', async () => {
      const projectDir = await createTestDir('complex-stack-project');
      
      // Resolve dependencies for Vue + Vuetify + Supabase + Pinia
      const resolution = await resolver.resolve(['vuetify', 'supabase', 'pinia']);
      
      expect(resolution.modules).toHaveLength(4); // vue-base will be auto-included
      expect(resolution.conflicts).toHaveLength(0);
      
      // Verify dependency order
      const moduleNames = resolution.modules.map(m => m.name);
      const vueIndex = moduleNames.indexOf('vue-base');
      const vuetifyIndex = moduleNames.indexOf('vuetify');
      const piniaIndex = moduleNames.indexOf('pinia');
      
      expect(vueIndex).toBeLessThan(vuetifyIndex);
      expect(vueIndex).toBeLessThan(piniaIndex);
      
      // Generate project files
      const generator = new TemplateGenerator(resolution.modules, projectDir);
      const context = { projectName: 'complex-stack' };
      
      const result = await generator.generate(context);
      
      expect(result.success).toBe(true);
      
      // Verify all component files were generated
      await assertFileExists(join(projectDir, 'src/main.js'));
      await assertFileExists(join(projectDir, 'src/plugins/vuetify.js'));
      await assertFileExists(join(projectDir, 'src/lib/supabase.js'));
      await assertFileExists(join(projectDir, 'src/stores/index.js'));
    });
    
    test('should detect and resolve conflicts', async () => {
      const projectDir = await createTestDir('conflict-resolution-project');
      
      // Try to use conflicting modules
      const resolution = await resolver.resolve(['vue-base', 'react-base'], { allowConflicts: true });
      
      expect(resolution.conflicts).toHaveLength(1);
      expect(resolution.conflicts[0].type).toBe('category');
      
      // Should still generate with conflicts allowed
      const generator = new TemplateGenerator(resolution.modules, projectDir);
      const context = { projectName: 'conflict-test' };
      
      const result = await generator.generate(context);
      expect(result.success).toBe(true);
    });
  });
  
  describe('Registry Search and Discovery', () => {
    test('should search across all modules', () => {
      const results = registry.searchModules('vue');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(m => m.name === 'vue-base')).toBe(true);
      expect(results.some(m => m.name === 'vuetify')).toBe(true); // Contains 'vue' in dependencies
    });
    
    test('should filter by category', () => {
      const frontendModules = registry.getModulesByCategory('frontend-framework');
      const uiModules = registry.getModulesByCategory('ui-library');
      
      expect(frontendModules).toHaveLength(1);
      expect(frontendModules[0].name).toBe('vue-base');
      expect(uiModules).toHaveLength(1);
      expect(uiModules[0].name).toBe('vuetify');
    });
    
    test('should get statistics', () => {
      const stats = registry.getStatistics();
      
      expect(stats.total).toBe(4);
      expect(stats.categories).toBeGreaterThan(0);
      expect(stats.recommended).toBeGreaterThan(0);
    });
  });
  
  describe('Module Validation Integration', () => {
    test('should validate all discovered modules', async () => {
      const modules = registry.getAllModules();
      
      for (const module of modules) {
        const validation = await registry.validateModule(module);
        expect(validation.valid).toBe(true);
      }
    });
    
    test('should handle invalid modules during discovery', async () => {
      // Create an invalid module
      const invalidModuleDir = join(testDir, 'invalid-module');
      await createMockModule(testDir, {
        name: 'invalid-module',
        version: 'not-a-version', // Invalid version
        category: 'invalid-category', // Invalid category
        description: 'Invalid module'
      });
      
      // Re-discover modules
      await registry.discover();
      
      // Invalid module should be excluded
      const moduleNames = registry.getAllModules().map(m => m.name);
      expect(moduleNames).not.toContain('invalid-module');
    });
  });
  
  describe('Template Generation Integration', () => {
    test('should merge JSON configurations correctly', async () => {
      const projectDir = await createTestDir('json-merge-project');
      
      // Create modules that both provide package.json
      const module1 = {
        name: 'json-module-1',
        getFileTemplates: () => ({
          'package.json': {
            content: {
              name: 'test-project',
              version: '1.0.0',
              dependencies: {
                'vue': '^3.4.0'
              }
            },
            merge: 'merge-json'
          }
        })
      };
      
      const module2 = {
        name: 'json-module-2',
        getFileTemplates: () => ({
          'package.json': {
            content: {
              scripts: {
                dev: 'vite',
                build: 'vite build'
              },
              dependencies: {
                'vuetify': '^3.5.0'
              }
            },
            merge: 'merge-json'
          }
        })
      };
      
      const generator = new TemplateGenerator([module1, module2], projectDir);
      const context = { projectName: 'json-merge-test' };
      
      await generator.generate(context);
      
      // Verify merged package.json
      const packagePath = join(projectDir, 'package.json');
      await assertFileExists(packagePath);
      
      const fs = await import('fs-extra');
      const packageJson = await fs.readJson(packagePath);
      
      expect(packageJson.name).toBe('test-project');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.scripts.dev).toBe('vite');
      expect(packageJson.scripts.build).toBe('vite build');
      expect(packageJson.dependencies.vue).toBe('^3.4.0');
      expect(packageJson.dependencies.vuetify).toBe('^3.5.0');
    });
    
    test('should handle template processing with context', async () => {
      const projectDir = await createTestDir('template-context-project');
      
      const module = {
        name: 'context-module',
        getFileTemplates: (context) => ({
          'config.js': {
            content: `export const config = {\n  name: "{{projectName}}",\n  version: "{{version}}"\n};`,
            template: true,
            merge: 'replace'
          }
        })
      };
      
      const generator = new TemplateGenerator([module], projectDir);
      const context = {
        projectName: 'my-test-project',
        version: '2.1.0'
      };
      
      await generator.generate(context);
      
      // Verify template processing
      const configPath = join(projectDir, 'config.js');
      await assertFileExists(configPath);
      
      const fs = await import('fs-extra');
      const content = await fs.readFile(configPath, 'utf-8');
      
      expect(content).toContain('name: "my-test-project"');
      expect(content).toContain('version: "2.1.0"');
    });
  });
  
  describe('Performance Integration', () => {
    test('should handle large module sets efficiently', async () => {
      const startTime = Date.now();
      
      // Resolve all available modules
      const allModuleNames = registry.getAllModules().map(m => m.name);
      const resolution = await resolver.resolve(allModuleNames, { allowConflicts: true });
      
      const resolutionTime = Date.now() - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(resolutionTime).toBeLessThan(5000); // 5 seconds
      expect(resolution.modules.length).toBeGreaterThan(0);
    });
    
    test('should cache module loading for performance', async () => {
      // First discovery
      const startTime1 = Date.now();
      await registry.discover();
      const firstTime = Date.now() - startTime1;
      
      // Second discovery (should use cache)
      const startTime2 = Date.now();
      await registry.discover();
      const secondTime = Date.now() - startTime2;
      
      // Second time should be significantly faster
      expect(secondTime).toBeLessThan(firstTime * 0.5);
    });
  });
  
  describe('Error Handling Integration', () => {
    test('should gracefully handle missing dependencies', async () => {
      // Create module with missing dependency
      await createMockModule(testDir, {
        name: 'missing-dep-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with missing dependency',
        requires: ['non-existent-module']
      });
      
      // Re-discover modules
      await registry.discover();
      
      // Should throw error when trying to resolve
      await expect(resolver.resolve(['missing-dep-module'])).rejects.toThrow();
    });
    
    test('should handle template generation errors gracefully', async () => {
      const projectDir = await createTestDir('error-handling-project');
      
      const faultyModule = {
        name: 'faulty-module',
        getFileTemplates: () => {
          throw new Error('Template generation error');
        }
      };
      
      const generator = new TemplateGenerator([faultyModule], projectDir);
      const context = { projectName: 'error-test' };
      
      await expect(generator.generate(context)).rejects.toThrow('Template generation error');
    });
  });
});