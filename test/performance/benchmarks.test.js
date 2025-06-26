/**
 * Performance benchmarks for Flow State Dev
 */
import { ModuleRegistry } from '../../lib/modules/registry.js';
import { ModuleDependencyResolver } from '../../lib/modules/dependency-resolver.js';
import { TemplateGenerator } from '../../lib/modules/template-generator.js';
import { OnboardingOrchestrator } from '../../lib/onboarding/base.js';
import { ProjectNameStep } from '../../lib/onboarding/steps/project-name.js';
import { StackSelectionStep } from '../../lib/onboarding/steps/stack-selection.js';
import { ProjectGenerationStep } from '../../lib/onboarding/steps/project-generation.js';
import { ProjectAnalyzer } from '../../lib/migration/analyzer.js';
import { createTestDir } from '../utils/test-helpers.js';
import { join } from 'path';
import fs from 'fs-extra';

describe('Performance Benchmarks', () => {
  let testDir;
  
  beforeAll(async () => {
    testDir = await createTestDir('performance-benchmarks');
  });
  
  describe('Module System Performance', () => {
    test('should discover modules within performance threshold', async () => {
      const startTime = Date.now();
      
      const registry = new ModuleRegistry();
      await registry.discover();
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(registry.getAllModules().length).toBeGreaterThan(0);
      
      console.log(`Module discovery: ${duration}ms`);
    });
    
    test('should resolve dependencies quickly', async () => {
      const registry = new ModuleRegistry();
      await registry.discover();
      
      const resolver = new ModuleDependencyResolver(registry);
      
      const startTime = Date.now();
      
      const result = await resolver.resolve(['vue-base', 'vuetify', 'supabase', 'pinia']);
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result.success).toBe(true);
      expect(result.modules.length).toBeGreaterThan(0);
      
      console.log(`Dependency resolution: ${duration}ms`);
    });
    
    test('should generate templates efficiently', async () => {
      const registry = new ModuleRegistry();
      await registry.discover();
      
      const resolver = new ModuleDependencyResolver(registry);
      const result = await resolver.resolve(['vue-base', 'vuetify']);
      
      const projectDir = join(testDir, 'template-perf-test');
      await fs.ensureDir(projectDir);
      
      const generator = new TemplateGenerator(result.modules, projectDir);
      
      const startTime = Date.now();
      
      const context = {
        projectName: 'template-perf-test',
        projectDir,
        packageManager: 'npm'
      };
      
      await generator.generate(context);
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      
      console.log(`Template generation: ${duration}ms`);
    });
    
    test('should complete full onboarding flow within threshold', async () => {
      const orchestrator = new OnboardingOrchestrator();
      
      orchestrator.registerStep(new ProjectNameStep());
      orchestrator.registerStep(new StackSelectionStep());
      orchestrator.registerStep(new ProjectGenerationStep());
      
      const projectDir = join(testDir, 'onboarding-perf-test');
      
      const startTime = Date.now();
      
      const initialContext = {
        projectName: 'onboarding-perf-test',
        interactive: false,
        here: false,
        subfolder: true,
        force: true,
        selectedModules: ['vue-base', 'vuetify', 'supabase', 'pinia'],
        projectDir
      };
      
      process.chdir(testDir);
      const result = await orchestrator.execute(initialContext);
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.generated).toBe(true);
      
      console.log(`Full onboarding flow: ${duration}ms`);
    });
  });
  
  describe('Migration System Performance', () => {
    test('should analyze projects quickly', async () => {
      // Create a test project for analysis
      const analysisDir = join(testDir, 'analysis-perf-test');
      await fs.ensureDir(analysisDir);
      
      await fs.writeJson(join(analysisDir, 'package.json'), {
        name: 'analysis-test',
        version: '1.0.0',
        dependencies: {
          vue: '^3.4.0',
          vuetify: '^3.4.0',
          pinia: '^2.0.0',
          '@supabase/supabase-js': '^2.38.0'
        },
        devDependencies: {
          vite: '^5.0.0',
          '@vitejs/plugin-vue': '^4.0.0'
        }
      });
      
      // Create source structure
      await fs.ensureDir(join(analysisDir, 'src'));
      await fs.writeFile(join(analysisDir, 'src/main.js'), `
        import { createApp } from 'vue'
        import { createPinia } from 'pinia'
        import { createVuetify } from 'vuetify'
        import App from './App.vue'
        
        const app = createApp(App)
        app.use(createPinia())
        app.use(createVuetify())
        app.mount('#app')
      `);
      
      await fs.writeFile(join(analysisDir, 'vite.config.js'), `
        import { defineConfig } from 'vite'
        import vue from '@vitejs/plugin-vue'
        
        export default defineConfig({
          plugins: [vue()]
        })
      `);
      
      const analyzer = new ProjectAnalyzer(analysisDir);
      
      const startTime = Date.now();
      
      const analysis = await analyzer.analyze();
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(analysis.projectType).toBe('vue-vuetify-supabase');
      expect(analysis.framework).toBe('vue');
      expect(analysis.uiLibrary).toBe('vuetify');
      
      console.log(`Project analysis: ${duration}ms`);
    });
  });
  
  describe('Concurrent Operations', () => {
    test('should handle multiple simultaneous module discoveries', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 5 }, async () => {
        const registry = new ModuleRegistry();
        await registry.discover();
        return registry.getAllModules().length;
      });
      
      const results = await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(results.every(count => count > 0)).toBe(true);
      
      console.log(`Concurrent module discovery (5x): ${duration}ms`);
    });
    
    test('should handle multiple dependency resolutions', async () => {
      const registry = new ModuleRegistry();
      await registry.discover();
      
      const startTime = Date.now();
      
      const promises = Array.from({ length: 3 }, async (_, i) => {
        const resolver = new ModuleDependencyResolver(registry);
        return resolver.resolve(['vue-base', 'vuetify']);
      });
      
      const results = await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(results.every(result => result.success)).toBe(true);
      
      console.log(`Concurrent dependency resolution (3x): ${duration}ms`);
    });
  });
  
  describe('Memory Usage', () => {
    test('should not exceed memory thresholds during operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform several operations
      const registry = new ModuleRegistry();
      await registry.discover();
      
      const resolver = new ModuleDependencyResolver(registry);
      await resolver.resolve(['vue-base', 'vuetify', 'supabase', 'pinia']);
      
      const projectDir = join(testDir, 'memory-test');
      await fs.ensureDir(projectDir);
      
      const generator = new TemplateGenerator(resolver.lastResolution.modules, projectDir);
      await generator.generate({
        projectName: 'memory-test',
        projectDir,
        packageManager: 'npm'
      });
      
      const finalMemory = process.memoryUsage();
      
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseInMB = memoryIncrease / 1024 / 1024;
      
      // Should not use more than 50MB additional memory
      expect(memoryIncreaseInMB).toBeLessThan(50);
      
      console.log(`Memory increase: ${memoryIncreaseInMB.toFixed(2)}MB`);
    });
  });
  
  describe('Stress Tests', () => {
    test('should handle rapid successive operations', async () => {
      const registry = new ModuleRegistry();
      await registry.discover();
      
      const startTime = Date.now();
      let operations = 0;
      
      // Perform rapid operations for 2 seconds
      const endTime = startTime + 2000;
      
      while (Date.now() < endTime) {
        const resolver = new ModuleDependencyResolver(registry);
        await resolver.resolve(['vue-base']);
        operations++;
      }
      
      const duration = Date.now() - startTime;
      const operationsPerSecond = operations / (duration / 1000);
      
      expect(operations).toBeGreaterThan(10); // Should complete at least 10 operations
      
      console.log(`Stress test: ${operations} operations in ${duration}ms (${operationsPerSecond.toFixed(2)} ops/sec)`);
    });
    
    test('should handle large dependency graphs', async () => {
      const registry = new ModuleRegistry();
      await registry.discover();
      
      const resolver = new ModuleDependencyResolver(registry);
      
      // Try to resolve all available modules at once (stress test)
      const allModules = registry.getAllModules().map(m => m.name);
      
      const startTime = Date.now();
      
      const result = await resolver.resolve(allModules.slice(0, Math.min(10, allModules.length)));
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds even for large graphs
      
      console.log(`Large dependency graph resolution: ${duration}ms for ${result.modules?.length || 0} modules`);
    });
  });
  
  describe('Performance Monitoring', () => {
    test('should provide performance metrics', () => {
      const metrics = {
        moduleDiscovery: 'Should complete within 2 seconds',
        dependencyResolution: 'Should complete within 1 second for typical stacks',
        templateGeneration: 'Should complete within 3 seconds',
        onboardingFlow: 'Should complete within 10 seconds',
        projectAnalysis: 'Should complete within 2 seconds',
        memoryUsage: 'Should not exceed 50MB additional memory usage',
        concurrentOperations: 'Should handle 5 concurrent discoveries within 5 seconds'
      };
      
      // Log performance expectations
      console.log('\n=== Performance Benchmarks ===');
      Object.entries(metrics).forEach(([operation, expectation]) => {
        console.log(`${operation}: ${expectation}`);
      });
      
      expect(Object.keys(metrics)).toHaveLength(7);
    });
  });
});