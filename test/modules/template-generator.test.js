/**
 * Tests for Template Generator
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TemplateGenerator } from '../../lib/modules/template-generator.js';
import fsExtra from 'fs-extra';
const { readFile, pathExists, remove } = fsExtra;
import { join } from 'path';
import { tmpdir } from 'os';

describe('TemplateGenerator', () => {
  let generator;
  let testDir;
  
  beforeEach(() => {
    generator = new TemplateGenerator();
    testDir = join(tmpdir(), `template-test-${Date.now()}`);
  });
  
  afterEach(async () => {
    if (await pathExists(testDir)) {
      await remove(testDir);
    }
  });
  
  describe('Constructor and Helpers', () => {
    it('should initialize with empty state', () => {
      expect(generator.templates).toBeDefined();
      expect(generator.templates.size).toBe(0);
      expect(generator.conflicts).toEqual([]);
      expect(generator.conflictResolver).toBeDefined();
    });
    
    it('should register Handlebars helpers', () => {
      const Handlebars = require('handlebars');
      
      // Test some helpers exist
      expect(Handlebars.helpers.ifModule).toBeDefined();
      expect(Handlebars.helpers.camelCase).toBeDefined();
      expect(Handlebars.helpers.json).toBeDefined();
    });
  });
  
  describe('Variable Substitution', () => {
    it('should render basic variables', async () => {
      const template = 'Project: {{projectName}}, Version: {{projectVersion}}';
      const result = await generator.renderTemplate(template);
      
      // Should return template as-is since no variables set
      expect(result).toBe(template);
      
      // Set variables and render again
      generator.variables = {
        projectName: 'test-app',
        projectVersion: '1.0.0'
      };
      
      const rendered = await generator.renderTemplate(template);
      expect(rendered).toBe('Project: test-app, Version: 1.0.0');
    });
    
    it('should handle case conversion helpers', async () => {
      generator.variables = { projectName: 'my-test-app' };
      
      const cases = {
        '{{camelCase projectName}}': 'myTestApp',
        '{{pascalCase projectName}}': 'MyTestApp',
        '{{kebabCase "myTestApp"}}': 'my-test-app',
        '{{snakeCase "myTestApp"}}': 'my_test_app'
      };
      
      for (const [template, expected] of Object.entries(cases)) {
        const result = await generator.renderTemplate(template);
        expect(result).toBe(expected);
      }
    });
    
    it('should handle module conditionals', async () => {
      generator.variables = {
        modules: {
          vue3: { name: 'vue3', version: '3.4.0' },
          vuetify: { name: 'vuetify', version: '3.4.0' }
        }
      };
      
      const template = '{{#ifModule "vue3"}}Has Vue{{else}}No Vue{{/ifModule}}';
      const result = await generator.renderTemplate(template);
      expect(result).toBe('Has Vue');
      
      const template2 = '{{#ifModule "react"}}Has React{{else}}No React{{/ifModule}}';
      const result2 = await generator.renderTemplate(template2);
      expect(result2).toBe('No React');
    });
  });
  
  describe('Module Map Creation', () => {
    it('should create module map from modules array', () => {
      const modules = [
        {
          name: 'vue3',
          version: '3.4.0',
          displayName: 'Vue 3',
          moduleType: 'frontend-framework',
          config: { ssr: true }
        },
        {
          name: 'vuetify',
          version: '3.4.0',
          displayName: 'Vuetify',
          moduleType: 'ui-library'
        }
      ];
      
      const moduleMap = generator.createModuleMap(modules);
      
      expect(moduleMap.vue3).toBeDefined();
      expect(moduleMap.vue3.name).toBe('vue3');
      expect(moduleMap.vue3.config.ssr).toBe(true);
      
      // Check type mapping
      expect(moduleMap['frontend-framework']).toBeDefined();
      expect(moduleMap['frontend-framework'].name).toBe('vue3');
    });
  });
  
  describe('Merge Strategies', () => {
    it('should determine correct merge strategy by file type', async () => {
      const module = { name: 'test' };
      
      const strategies = {
        'package.json': { strategy: 'merge', type: 'package.json' },
        '.env': { strategy: 'append', unique: true },
        'config.json': { strategy: 'merge', type: 'json' },
        '.gitignore': { strategy: 'append', unique: true },
        'main.js': { strategy: 'replace' }
      };
      
      for (const [file, expected] of Object.entries(strategies)) {
        const strategy = await generator.getMergeStrategy(module, file);
        expect(strategy).toEqual(expected);
      }
    });
    
    it('should respect module-defined strategies', async () => {
      const module = {
        name: 'test',
        mergeStrategies: {
          'custom.txt': { strategy: 'append', unique: false }
        }
      };
      
      const strategy = await generator.getMergeStrategy(module, 'custom.txt');
      expect(strategy).toEqual({ strategy: 'append', unique: false });
    });
  });
  
  describe('Conflict Detection', () => {
    it('should detect when templates can be merged', () => {
      const templates = [
        { mergeStrategy: { strategy: 'merge', type: 'json' } },
        { mergeStrategy: { strategy: 'merge', type: 'json' } }
      ];
      
      expect(generator.canMerge(templates)).toBe(true);
    });
    
    it('should detect when templates cannot be merged', () => {
      const templates = [
        { mergeStrategy: { strategy: 'replace' } },
        { mergeStrategy: { strategy: 'merge' } }
      ];
      
      expect(generator.canMerge(templates)).toBe(false);
    });
  });
  
  describe('Template Generation', () => {
    it('should generate files from templates', async () => {
      // Create mock modules with templates
      const modules = [
        {
          name: 'base',
          templatePath: null,
          priority: 10
        }
      ];
      
      // Manually add templates for testing
      generator.templates.set('index.js', [{
        module: 'base',
        content: 'console.log("{{projectName}}");',
        priority: 10,
        mergeStrategy: { strategy: 'replace' }
      }]);
      
      generator.variables = {
        projectName: 'test-app'
      };
      
      const result = await generator.generate({
        modules,
        projectPath: testDir,
        projectName: 'test-app'
      });
      
      expect(result.success).toBe(true);
      expect(result.generated).toContain('index.js');
      
      // Check file was created
      const filePath = join(testDir, 'index.js');
      expect(await pathExists(filePath)).toBe(true);
      
      const content = await readFile(filePath, 'utf-8');
      expect(content).toBe('console.log("test-app");');
    });
    
    it('should handle file conflicts', async () => {
      // Add conflicting templates
      generator.templates.set('config.json', [
        {
          module: 'module1',
          content: '{"name": "{{projectName}}", "version": "1.0.0"}',
          priority: 20,
          mergeStrategy: { strategy: 'merge', type: 'json' }
        },
        {
          module: 'module2',
          content: '{"name": "{{projectName}}", "debug": true}',
          priority: 10,
          mergeStrategy: { strategy: 'merge', type: 'json' }
        }
      ]);
      
      generator.variables = {
        projectName: 'test-app'
      };
      
      const result = await generator.generate({
        modules: [],
        projectPath: testDir,
        projectName: 'test-app'
      });
      
      expect(result.success).toBe(true);
      
      // Should merge JSON files
      const filePath = join(testDir, 'config.json');
      const content = await readFile(filePath, 'utf-8');
      const config = JSON.parse(content);
      
      expect(config.name).toBe('test-app');
      expect(config.version).toBe('1.0.0');
      expect(config.debug).toBe(true);
    });
  });
  
  describe('Performance', () => {
    it('should generate project quickly', async () => {
      const startTime = Date.now();
      
      const result = await generator.generate({
        modules: [],
        projectPath: testDir,
        projectName: 'perf-test'
      });
      
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});