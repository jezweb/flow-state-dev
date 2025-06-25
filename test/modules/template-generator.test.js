/**
 * Tests for TemplateGenerator
 */
import { TemplateGenerator } from '../../lib/modules/template-generator.js';
import { createTestDir, createTestProject, assertFileExists, assertFileContains } from '../utils/test-helpers.js';
import { getMockModule } from '../utils/mock-modules.js';
import { join } from 'path';
import fs from 'fs-extra';

describe('TemplateGenerator', () => {
  let generator;
  let projectDir;
  let modules;
  
  beforeEach(async () => {
    projectDir = await createTestDir('template-generator-test');
    modules = [
      getMockModule('vue-base'),
      getMockModule('vuetify'),
      getMockModule('supabase')
    ];
    generator = new TemplateGenerator(modules, projectDir);
  });
  
  describe('Template Collection', () => {
    test('should collect templates from all modules', async () => {
      const context = { projectName: 'test-project' };
      
      await generator.collectTemplates(context);
      
      expect(generator.templates.size).toBeGreaterThan(0);
      expect(generator.templates.has('src/main.js')).toBe(true);
      expect(generator.templates.has('package.json')).toBe(true);
    });
    
    test('should handle modules without templates', async () => {
      const moduleWithoutTemplates = {
        name: 'no-templates',
        version: '1.0.0',
        category: 'other',
        description: 'Module without templates'
        // No getFileTemplates method
      };
      
      const testGenerator = new TemplateGenerator([moduleWithoutTemplates], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.collectTemplates(context);
      
      expect(testGenerator.templates.size).toBe(0);
    });
    
    test('should track module priority for templates', async () => {
      const context = { projectName: 'test-project' };
      
      await generator.collectTemplates(context);
      
      const packageJsonSources = generator.templates.get('package.json');
      expect(packageJsonSources).toBeDefined();
      expect(packageJsonSources[0]).toHaveProperty('priority');
      expect(packageJsonSources[0]).toHaveProperty('module');
    });
  });
  
  describe('Conflict Detection', () => {
    test('should detect template conflicts', async () => {
      const context = { projectName: 'test-project' };
      
      await generator.collectTemplates(context);
      const conflicts = generator.detectConflicts();
      
      // package.json should have conflicts (multiple modules provide it)
      const packageJsonConflict = conflicts.find(c => c.path === 'package.json');
      expect(packageJsonConflict).toBeDefined();
      expect(packageJsonConflict.sources.length).toBeGreaterThan(1);
    });
    
    test('should not detect conflicts for unique templates', async () => {
      const moduleWithUniqueTemplate = {
        name: 'unique-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with unique template',
        getFileTemplates: () => ({
          'unique-file.js': {
            content: 'unique content',
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([moduleWithUniqueTemplate], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.collectTemplates(context);
      const conflicts = testGenerator.detectConflicts();
      
      expect(conflicts).toHaveLength(0);
    });
    
    test('should detect merge strategy conflicts', async () => {
      const module1 = {
        name: 'module-1',
        getFileTemplates: () => ({
          'conflict.js': { content: 'content1', merge: 'replace' }
        })
      };
      
      const module2 = {
        name: 'module-2',
        getFileTemplates: () => ({
          'conflict.js': { content: 'content2', merge: 'append' }
        })
      };
      
      const testGenerator = new TemplateGenerator([module1, module2], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.collectTemplates(context);
      const conflicts = testGenerator.detectConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].strategies).toEqual(['replace', 'append']);
    });
  });
  
  describe('File Generation', () => {
    test('should generate single file template', async () => {
      const module = {
        name: 'single-file-module',
        getFileTemplates: () => ({
          'test-file.js': {
            content: 'console.log("test");',
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'test-file.js');
      await assertFileExists(filePath);
      await assertFileContains(filePath, 'console.log("test");');
    });
    
    test('should merge JSON files correctly', async () => {
      const module1 = {
        name: 'json-module-1',
        getFileTemplates: () => ({
          'config.json': {
            content: { name: 'test', version: '1.0.0' },
            merge: 'merge-json'
          }
        })
      };
      
      const module2 = {
        name: 'json-module-2',
        getFileTemplates: () => ({
          'config.json': {
            content: { scripts: { dev: 'vite' } },
            merge: 'merge-json'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module1, module2], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.generate(context);
      
      const configPath = join(projectDir, 'config.json');
      await assertFileExists(configPath);
      
      const config = await fs.readJson(configPath);
      expect(config.name).toBe('test');
      expect(config.version).toBe('1.0.0');
      expect(config.scripts.dev).toBe('vite');
    });
    
    test('should append content correctly', async () => {
      const module1 = {
        name: 'append-module-1',
        getFileTemplates: () => ({
          'append-file.txt': {
            content: 'Line 1',
            merge: 'append'
          }
        })
      };
      
      const module2 = {
        name: 'append-module-2',
        getFileTemplates: () => ({
          'append-file.txt': {
            content: 'Line 2',
            merge: 'append'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module1, module2], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'append-file.txt');
      await assertFileExists(filePath);
      
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('Line 1');
      expect(content).toContain('Line 2');
    });
    
    test('should append unique content only', async () => {
      const module1 = {
        name: 'unique-module-1',
        getFileTemplates: () => ({
          'unique-file.txt': {
            content: 'Line 1\nLine 2',
            merge: 'append-unique'
          }
        })
      };
      
      const module2 = {
        name: 'unique-module-2',
        getFileTemplates: () => ({
          'unique-file.txt': {
            content: 'Line 2\nLine 3',
            merge: 'append-unique'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module1, module2], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'unique-file.txt');
      await assertFileExists(filePath);
      
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Should only have unique lines
      expect(lines.filter(line => line === 'Line 2')).toHaveLength(1);
      expect(lines).toContain('Line 1');
      expect(lines).toContain('Line 3');
    });
  });
  
  describe('Template Processing', () => {
    test('should process template variables', async () => {
      const module = {
        name: 'template-module',
        getFileTemplates: (context) => ({
          'template-file.js': {
            content: 'const projectName = "{{projectName}}";',
            template: true,
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module], projectDir);
      const context = { projectName: 'my-awesome-project' };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'template-file.js');
      await assertFileExists(filePath);
      await assertFileContains(filePath, 'const projectName = "my-awesome-project";');
    });
    
    test('should handle complex template context', async () => {
      const module = {
        name: 'complex-template-module',
        getFileTemplates: (context) => ({
          'complex-template.js': {
            content: '// {{description}}\nexport const config = {\n  name: "{{name}}",\n  version: "{{version}}"\n};',
            template: true,
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module], projectDir);
      const context = {
        name: 'test-app',
        version: '1.0.0',
        description: 'A test application'
      };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'complex-template.js');
      await assertFileExists(filePath);
      await assertFileContains(filePath, '// A test application');
      await assertFileContains(filePath, 'name: "test-app"');
      await assertFileContains(filePath, 'version: "1.0.0"');
    });
  });
  
  describe('Directory Creation', () => {
    test('should create nested directories', async () => {
      const module = {
        name: 'nested-module',
        getFileTemplates: () => ({
          'src/components/App.vue': {
            content: '<template><div>App</div></template>',
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'src/components/App.vue');
      await assertFileExists(filePath);
      await assertFileContains(filePath, '<template><div>App</div></template>');
    });
    
    test('should handle deep directory structures', async () => {
      const module = {
        name: 'deep-module',
        getFileTemplates: () => ({
          'very/deep/nested/directory/file.js': {
            content: 'console.log("deep");',
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'very/deep/nested/directory/file.js');
      await assertFileExists(filePath);
    });
  });
  
  describe('Priority Resolution', () => {
    test('should use higher priority template in conflicts', async () => {
      const lowPriorityModule = {
        name: 'low-priority',
        priority: 50,
        getFileTemplates: () => ({
          'priority-test.js': {
            content: 'low priority content',
            merge: 'replace'
          }
        })
      };
      
      const highPriorityModule = {
        name: 'high-priority',
        priority: 100,
        getFileTemplates: () => ({
          'priority-test.js': {
            content: 'high priority content',
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([lowPriorityModule, highPriorityModule], projectDir);
      const context = { projectName: 'test-project' };
      
      await testGenerator.generate(context);
      
      const filePath = join(projectDir, 'priority-test.js');
      await assertFileExists(filePath);
      await assertFileContains(filePath, 'high priority content');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid JSON in merge-json strategy', async () => {
      const module = {
        name: 'invalid-json-module',
        getFileTemplates: () => ({
          'invalid.json': {
            content: 'invalid json content',
            merge: 'merge-json'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module], projectDir);
      const context = { projectName: 'test-project' };
      
      await expect(testGenerator.generate(context)).rejects.toThrow();
    });
    
    test('should handle missing source files gracefully', async () => {
      const module = {
        name: 'missing-source-module',
        getFileTemplates: () => ({
          'from-source.js': {
            src: '/non/existent/file.js',
            merge: 'replace'
          }
        })
      };
      
      const testGenerator = new TemplateGenerator([module], projectDir);
      const context = { projectName: 'test-project' };
      
      await expect(testGenerator.generate(context)).rejects.toThrow();
    });
  });
});