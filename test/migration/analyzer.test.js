/**
 * Tests for ProjectAnalyzer
 */
import { ProjectAnalyzer } from '../../lib/migration/analyzer.js';
import { createTestDir, createMockModule } from '../utils/test-helpers.js';
import { join } from 'path';
import fs from 'fs-extra';

describe('ProjectAnalyzer', () => {
  let testDir;
  let analyzer;
  
  beforeEach(async () => {
    testDir = await createTestDir('analyzer-test');
    analyzer = new ProjectAnalyzer(testDir);
  });
  
  describe('Package.json Analysis', () => {
    test('should detect Vue 3 project', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-vue-project',
        version: '1.0.0',
        dependencies: {
          vue: '^3.4.0',
          vuetify: '^3.4.0'
        },
        devDependencies: {
          vite: '^5.0.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.framework).toBe('vue');
      expect(analysis.frameworkVersion).toBe('3');
      expect(analysis.uiLibrary).toBe('vuetify');
      expect(analysis.buildTool).toBe('vite');
      expect(analysis.projectType).toBe('vue-vuetify');
    });
    
    test('should detect React project', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-react-project',
        dependencies: {
          react: '^18.0.0',
          '@mui/material': '^5.0.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.framework).toBe('react');
      expect(analysis.uiLibrary).toBe('material-ui');
      expect(analysis.projectType).toBe('react');
    });
    
    test('should detect Supabase backend', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-supabase-project',
        dependencies: {
          vue: '^3.4.0',
          '@supabase/supabase-js': '^2.38.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.backend).toBe('supabase');
      expect(analysis.database).toBe('supabase');
      expect(analysis.projectType).toBe('vue-basic-supabase');
    });
    
    test('should detect package manager', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project'
      });
      
      // Test yarn
      await fs.writeFile(join(testDir, 'yarn.lock'), '# yarn lock file');
      let analysis = await analyzer.analyze();
      expect(analysis.packageManager).toBe('yarn');
      
      // Clean up and test npm
      await fs.remove(join(testDir, 'yarn.lock'));
      await fs.writeFile(join(testDir, 'package-lock.json'), '{}');
      analysis = await analyzer.analyze();
      expect(analysis.packageManager).toBe('npm');
      
      // Clean up and test pnpm
      await fs.remove(join(testDir, 'package-lock.json'));
      await fs.writeFile(join(testDir, 'pnpm-lock.yaml'), '');
      analysis = await analyzer.analyze();
      expect(analysis.packageManager).toBe('pnpm');
    });
  });
  
  describe('File Structure Analysis', () => {
    test('should analyze source structure', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project'
      });
      
      // Create source structure
      await fs.ensureDir(join(testDir, 'src'));
      await fs.ensureDir(join(testDir, 'components'));
      await fs.writeFile(join(testDir, 'src/main.js'), 'console.log("main")');
      await fs.writeFile(join(testDir, 'src/App.vue'), '<template></template>');
      await fs.writeFile(join(testDir, 'components/Header.vue'), '<template></template>');
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.sourceStructure.src).toBeDefined();
      expect(analysis.sourceStructure.src.fileCount).toBe(2);
      expect(analysis.sourceStructure.src.fileTypes).toContain('.js');
      expect(analysis.sourceStructure.src.fileTypes).toContain('.vue');
      expect(analysis.sourceStructure.components).toBeDefined();
    });
    
    test('should detect configuration files', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      await fs.writeFile(join(testDir, 'vite.config.js'), 'export default {}');
      await fs.writeFile(join(testDir, 'tsconfig.json'), '{}');
      await fs.writeFile(join(testDir, 'tailwind.config.js'), 'module.exports = {}');
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.configFiles).toContain('vite.config.js');
      expect(analysis.configFiles).toContain('tsconfig.json');
      expect(analysis.configFiles).toContain('tailwind.config.js');
      expect(analysis.hasViteConfig).toBe(true);
      expect(analysis.usesTypeScript).toBe(true);
      expect(analysis.cssFramework).toBe('tailwind');
    });
    
    test('should detect Git repository', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      await fs.ensureDir(join(testDir, '.git'));
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.hasGit).toBe(true);
    });
  });
  
  describe('Source Code Analysis', () => {
    test('should detect Vue app patterns', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: { vue: '^3.4.0' }
      });
      
      await fs.ensureDir(join(testDir, 'src'));
      await fs.writeFile(join(testDir, 'src/main.js'), `
        import { createApp } from 'vue'
        import { createPinia } from 'pinia'
        import { createVuetify } from 'vuetify'
        import App from './App.vue'
        
        const app = createApp(App)
        app.use(createPinia())
        app.use(createVuetify())
        app.mount('#app')
      `);
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.vueAppPattern).toBe('composition-api');
      expect(analysis.usesPinia).toBe(true);
      expect(analysis.usesVuetify).toBe(true);
    });
    
    test('should detect Vue 2 patterns', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: { vue: '^2.6.0' }
      });
      
      await fs.ensureDir(join(testDir, 'src'));
      await fs.writeFile(join(testDir, 'src/main.js'), `
        import Vue from 'vue'
        import App from './App.vue'
        
        new Vue({
          render: h => h(App)
        }).$mount('#app')
      `);
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.vueAppPattern).toBe('options-api');
    });
  });
  
  describe('Migration Complexity Assessment', () => {
    test('should assess low complexity for Vue 3 + Vite project', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'simple-project',
        dependencies: {
          vue: '^3.4.0'
        },
        devDependencies: {
          vite: '^5.0.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.migrationComplexity).toBe('low');
      expect(analysis.complexityFactors).toContain('Vue 3 (low complexity)');
      expect(analysis.complexityFactors).toContain('Vite build tool (low complexity)');
    });
    
    test('should assess medium complexity for Vue 2 project', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'vue2-project',
        dependencies: {
          vue: '^2.6.0'
        },
        devDependencies: {
          'vue-cli-service': '^4.0.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.migrationComplexity).toBe('medium');
      expect(analysis.complexityFactors).toContain('Vue 2 (medium complexity)');
      expect(analysis.complexityFactors).toContain('Vue CLI (medium complexity)');
    });
    
    test('should assess high complexity for React project', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'complex-project',
        dependencies: {
          react: '^18.0.0',
          // Add many dependencies to increase complexity
          ...Array.from({ length: 25 }, (_, i) => ({ [`dep-${i}`]: '^1.0.0' }))
            .reduce((acc, dep) => ({ ...acc, ...dep }), {})
        },
        devDependencies: {
          webpack: '^5.0.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.migrationComplexity).toBe('high');
      expect(analysis.complexityFactors).toContain('React framework (high complexity)');
      expect(analysis.complexityFactors).toContain('Many dependencies (medium complexity)');
    });
  });
  
  describe('Module Recommendations', () => {
    test('should recommend appropriate modules', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: {
          vue: '^3.4.0',
          vuetify: '^3.4.0',
          pinia: '^2.0.0',
          '@supabase/supabase-js': '^2.38.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.recommendedModules).toContain('vue-base');
      expect(analysis.recommendedModules).toContain('vuetify');
      expect(analysis.recommendedModules).toContain('pinia');
      expect(analysis.recommendedModules).toContain('supabase');
    });
    
    test('should recommend Pinia migration from Vuex', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: {
          vue: '^3.4.0',
          vuex: '^4.0.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.recommendedModules).toContain('pinia');
      expect(analysis.potentialIssues).toContain('Consider migrating from Vuex to Pinia');
    });
  });
  
  describe('Migration Strategy', () => {
    test('should generate appropriate migration strategy', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project',
        dependencies: {
          vue: '^3.4.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.migrationStrategy).toBeDefined();
      expect(analysis.migrationStrategy.approach).toBe('direct');
      expect(analysis.migrationStrategy.estimatedTime).toBe('1-2 hours');
      expect(analysis.migrationStrategy.phases).toContain('Backup current project');
      expect(analysis.migrationStrategy.phases).toContain('Update package.json dependencies');
    });
    
    test('should generate careful strategy for high complexity', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'complex-project',
        dependencies: {
          react: '^18.0.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.migrationStrategy.approach).toBe('careful');
      expect(analysis.migrationStrategy.estimatedTime).toBe('1-2 days');
      expect(analysis.migrationStrategy.risks).toContain('Cross-framework migration is complex');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle missing package.json', async () => {
      const analysis = await analyzer.analyze();
      
      expect(analysis.potentialIssues).toContain('No package.json found - not a Node.js project');
    });
    
    test('should handle invalid package.json', async () => {
      await fs.writeFile(join(testDir, 'package.json'), 'invalid json');
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.potentialIssues.some(issue => 
        issue.includes('Invalid package.json')
      )).toBe(true);
    });
    
    test('should handle unreadable source files', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      await fs.ensureDir(join(testDir, 'src'));
      
      // Create a directory where main.js should be (will cause read error)
      await fs.ensureDir(join(testDir, 'src/main.js'));
      
      const analysis = await analyzer.analyze();
      
      expect(analysis.potentialIssues.some(issue => 
        issue.includes('Could not read src/main.js')
      )).toBe(true);
    });
  });
  
  describe('Summary and Display', () => {
    test('should provide accurate summary', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'summary-test',
        dependencies: {
          vue: '^3.4.0',
          vuetify: '^3.4.0'
        }
      });
      
      const analysis = await analyzer.analyze();
      const summary = analyzer.getSummary();
      
      expect(summary.projectType).toBe('vue-vuetify');
      expect(summary.framework).toBe('vue');
      expect(summary.migrationComplexity).toBe('low');
      expect(summary.recommendedModules).toContain('vue-base');
      expect(summary.recommendedModules).toContain('vuetify');
    });
    
    test('should require analysis before summary', () => {
      const freshAnalyzer = new ProjectAnalyzer(testDir);
      
      expect(() => {
        freshAnalyzer.getSummary();
      }).toThrow('Analysis not completed. Run analyze() first.');
    });
  });
});