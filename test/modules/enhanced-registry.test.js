/**
 * Tests for Enhanced Module Registry
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { EnhancedModuleRegistry } from '../../lib/modules/enhanced-registry.js';
import { ModuleVersionManager } from '../../lib/modules/version-manager.js';
import { ModuleSearchEngine } from '../../lib/modules/search-engine.js';
import { ModuleCacheManager } from '../../lib/modules/cache-manager.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Enhanced Module Registry', () => {
  let registry;
  let testModulesDir;

  beforeAll(async () => {
    testModulesDir = path.join(__dirname, 'test-modules');
    await fs.ensureDir(testModulesDir);
  });

  afterAll(async () => {
    await fs.remove(testModulesDir);
  });

  beforeEach(() => {
    registry = new EnhancedModuleRegistry();
  });

  describe('Module Discovery', () => {
    it('should discover modules from multiple sources', async () => {
      await registry.initialize();
      
      expect(registry.modules.size).toBeGreaterThan(0);
      expect(registry.sources.length).toBeGreaterThan(0);
    });

    it('should track discovery performance', async () => {
      const start = performance.now();
      await registry.initialize();
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should initialize in less than 1 second
    });

    it('should build module index', async () => {
      await registry.initialize();
      
      expect(registry.index).toBeDefined();
      expect(registry.index.modules).toBeDefined();
      expect(registry.index.byType).toBeDefined();
      expect(registry.index.byCategory).toBeDefined();
    });
  });

  describe('Version Management', () => {
    it('should support semantic versioning', () => {
      const versionManager = new ModuleVersionManager();
      
      const latest = versionManager.getLatest(['1.0.0', '2.0.0', '1.5.0']);
      expect(latest).toBe('2.0.0');
      
      const resolved = versionManager.resolveVersion(['1.0.0', '1.5.0', '2.0.0'], '^1.0.0');
      expect(resolved).toBe('1.5.0');
    });

    it('should resolve version conflicts', () => {
      const versionManager = new ModuleVersionManager();
      
      const requirements = [
        { module: 'vue', version: '^3.0.0', requiredBy: 'app' },
        { module: 'vue', version: '^3.2.0', requiredBy: 'vuetify' },
        { module: 'vue', version: '3.3.0', requiredBy: 'custom' }
      ];
      
      const { resolved, conflicts } = versionManager.resolveConflicts(requirements);
      expect(conflicts.length).toBe(0);
      expect(resolved.has('vue')).toBe(true);
    });

    it('should handle pre-release versions', () => {
      const versionManager = new ModuleVersionManager();
      
      const isStable = versionManager.isStable('1.0.0');
      expect(isStable).toBe(true);
      
      const isPrerelease = versionManager.isStable('1.0.0-beta.1');
      expect(isPrerelease).toBe(false);
    });
  });

  describe('Module Search', () => {
    it('should build search index', async () => {
      const searchEngine = new ModuleSearchEngine();
      await registry.initialize();
      
      const modules = Array.from(registry.modules.values())
        .map(versions => Array.from(versions.values())[0].module);
      
      searchEngine.buildIndex(modules);
      expect(searchEngine.index).toBeDefined();
      expect(searchEngine.fuse).toBeDefined();
    });

    it('should perform fuzzy search', async () => {
      const searchEngine = new ModuleSearchEngine();
      await registry.initialize();
      
      const modules = Array.from(registry.modules.values())
        .map(versions => Array.from(versions.values())[0].module);
      
      searchEngine.buildIndex(modules);
      
      const results = searchEngine.search('vue', { limit: 5 });
      expect(results.results).toBeDefined();
      expect(results.total).toBeGreaterThan(0);
    });

    it('should filter search results', async () => {
      const searchEngine = new ModuleSearchEngine();
      await registry.initialize();
      
      const modules = Array.from(registry.modules.values())
        .map(versions => Array.from(versions.values())[0].module);
      
      searchEngine.buildIndex(modules);
      
      const results = searchEngine.search('', {
        type: 'frontend-framework',
        limit: 10
      });
      
      expect(results.results.every(r => 
        r.module.moduleType === 'frontend-framework'
      )).toBe(true);
    });

    it('should provide search suggestions', async () => {
      const searchEngine = new ModuleSearchEngine();
      await registry.initialize();
      
      const modules = Array.from(registry.modules.values())
        .map(versions => Array.from(versions.values())[0].module);
      
      searchEngine.buildIndex(modules);
      
      const suggestions = searchEngine.getSuggestions('vu', 3);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].text).toContain('Vue');
    });
  });

  describe('Module Caching', () => {
    it('should cache modules in memory', async () => {
      const cache = new ModuleCacheManager();
      await cache.initialize();
      
      const testData = { name: 'test-module', version: '1.0.0' };
      await cache.set('test-key', testData);
      
      const cached = await cache.get('test-key');
      expect(cached).toEqual(testData);
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
    });

    it('should evict LRU entries when memory limit reached', async () => {
      const cache = new ModuleCacheManager({ maxMemorySize: 1024 }); // 1KB limit
      await cache.initialize();
      
      // Add multiple entries to exceed limit
      for (let i = 0; i < 10; i++) {
        await cache.set(`key-${i}`, { data: 'x'.repeat(200) });
      }
      
      const stats = cache.getStats();
      expect(stats.evictions).toBeGreaterThan(0);
      expect(cache.memoryCache.size).toBeLessThan(10);
    });

    it('should persist to disk cache', async () => {
      const cache = new ModuleCacheManager();
      await cache.initialize();
      
      const testData = { name: 'persistent-module' };
      await cache.set('disk-test', testData, { diskCache: true });
      
      // Clear memory cache
      cache.memoryCache.clear();
      
      // Should still get from disk
      const cached = await cache.get('disk-test');
      expect(cached).toEqual(testData);
    });
  });

  describe('Module Compatibility', () => {
    it('should check module compatibility', async () => {
      await registry.initialize();
      
      const vue = registry.getModule('vue3');
      const vuetify = registry.getModule('vuetify');
      
      if (vue && vuetify) {
        expect(vue.isCompatibleWith(vuetify)).toBe(true);
      }
    });

    it('should get compatible modules for type', async () => {
      await registry.initialize();
      
      const compatible = registry.getCompatibleModules('ui-library', {
        modules: ['vue3']
      });
      
      expect(compatible.length).toBeGreaterThan(0);
      expect(compatible.some(m => m.name === 'vuetify')).toBe(true);
    });
  });

  describe('Module Loading', () => {
    it('should load implementation modules', async () => {
      await registry.initialize();
      
      const vue = registry.getModule('vue3');
      expect(vue).toBeDefined();
      expect(vue.name).toBe('vue3');
      expect(vue.moduleType).toBeDefined();
    });

    it('should load directory-based modules', async () => {
      // Create test directory module
      const moduleDir = path.join(testModulesDir, 'test-module');
      await fs.ensureDir(moduleDir);
      await fs.writeJSON(path.join(moduleDir, 'module.json'), {
        id: 'test-module',
        name: 'Test Module',
        version: '1.0.0',
        moduleType: 'testing',
        category: 'other'
      });
      
      registry.sources.push({
        path: testModulesDir,
        type: 'test',
        priority: 0
      });
      
      await registry.discoverModules();
      
      const testModule = registry.getModule('test-module');
      expect(testModule).toBeDefined();
    });
  });

  describe('Registry Operations', () => {
    it('should get modules by type', async () => {
      await registry.initialize();
      
      const frontendModules = registry.getModulesByType('frontend-framework');
      expect(frontendModules.length).toBeGreaterThan(0);
      expect(frontendModules.every(m => m.moduleType === 'frontend-framework')).toBe(true);
    });

    it('should get modules by category', async () => {
      await registry.initialize();
      
      const uiModules = registry.getModulesByCategory('ui');
      expect(uiModules.length).toBeGreaterThan(0);
    });

    it('should export registry state', async () => {
      await registry.initialize();
      
      const state = registry.exportState();
      expect(state.modules).toBeDefined();
      expect(state.stats).toBeDefined();
      expect(state.stats.totalModules).toBeGreaterThan(0);
    });

    it('should support hot reload', async () => {
      await registry.initialize();
      
      const moduleId = 'vue3';
      const originalModule = registry.getModule(moduleId);
      
      if (originalModule) {
        const reloaded = await registry.reloadModule(moduleId);
        expect(reloaded).toBe(true);
        
        const reloadedModule = registry.getModule(moduleId);
        expect(reloadedModule).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should meet performance benchmarks', async () => {
      const start = performance.now();
      await registry.initialize();
      const initTime = performance.now() - start;
      
      expect(initTime).toBeLessThan(100); // Initialize in < 100ms
      
      // Test search performance
      const searchStart = performance.now();
      const results = await registry.searchModules('react');
      const searchTime = performance.now() - searchStart;
      
      expect(searchTime).toBeLessThan(50); // Search in < 50ms
    });
  });
});