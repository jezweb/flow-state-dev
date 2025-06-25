/**
 * Integration tests for the onboarding flow
 */
import { OnboardingOrchestrator } from '../../lib/onboarding/base.js';
import { ProjectNameStep } from '../../lib/onboarding/steps/project-name.js';
import { StackSelectionStep } from '../../lib/onboarding/steps/stack-selection.js';
import { ProjectGenerationStep } from '../../lib/onboarding/steps/project-generation.js';
import { createTestDir, assertFileExists, assertFileContains } from '../utils/test-helpers.js';
import { join } from 'path';

describe('Onboarding Flow Integration', () => {
  let orchestrator;
  let testDir;
  
  beforeEach(async () => {
    testDir = await createTestDir('onboarding-test');
    orchestrator = new OnboardingOrchestrator();
    
    // Register steps
    orchestrator.registerStep(new ProjectNameStep());
    orchestrator.registerStep(new StackSelectionStep());
    orchestrator.registerStep(new ProjectGenerationStep());
    
    // Change to test directory for onboarding
    process.chdir(testDir);
  });
  
  afterEach(() => {
    // Change back to original directory
    process.chdir(global.testRootDir);
  });
  
  describe('Complete Onboarding Flow', () => {
    test('should complete non-interactive onboarding', async () => {
      const initialContext = {
        projectName: 'test-onboarding-project',
        interactive: false,
        here: false,
        subfolder: true,
        force: true,
        selectedModules: ['vue-base', 'vuetify']
      };
      
      const finalContext = await orchestrator.execute(initialContext);
      
      expect(finalContext.projectName).toBe('test-onboarding-project');
      expect(finalContext.generated).toBe(true);
      expect(finalContext.projectPath).toBeDefined();
      
      // Verify project was created
      const projectPath = join(testDir, 'test-onboarding-project');
      await assertFileExists(projectPath);
      await assertFileExists(join(projectPath, 'package.json'));
      await assertFileExists(join(projectPath, 'src/main.js'));
    });
    
    test('should handle here option correctly', async () => {
      const initialContext = {
        projectName: 'here-project',
        interactive: false,
        here: true,
        force: true,
        selectedModules: ['vue-base']
      };
      
      const finalContext = await orchestrator.execute(initialContext);
      
      expect(finalContext.here).toBe(true);
      expect(finalContext.projectPath).toBe(testDir);
      
      // Files should be created in current directory
      await assertFileExists(join(testDir, 'package.json'));
      await assertFileExists(join(testDir, 'src/main.js'));
    });
    
    test('should resolve stack dependencies automatically', async () => {
      const initialContext = {
        projectName: 'dependency-test',
        interactive: false,
        force: true,
        selectedModules: ['vuetify'] // Should auto-include vue-base
      };
      
      const finalContext = await orchestrator.execute(initialContext);
      
      expect(finalContext.stackResolution).toBeDefined();
      expect(finalContext.stackResolution.modules.length).toBeGreaterThan(1);
      
      const moduleNames = finalContext.stackResolution.modules.map(m => m.name);
      expect(moduleNames).toContain('vue-base');
      expect(moduleNames).toContain('vuetify');
    });
  });
  
  describe('Step Execution Order', () => {
    test('should execute steps in correct priority order', async () => {
      const executionOrder = [];
      
      // Create custom steps to track execution
      class TrackingStep1 extends ProjectNameStep {
        async execute(context) {
          executionOrder.push('step1');
          return super.execute(context);
        }
      }
      
      class TrackingStep2 extends StackSelectionStep {
        async execute(context) {
          executionOrder.push('step2');
          return super.execute(context);
        }
      }
      
      class TrackingStep3 extends ProjectGenerationStep {
        async execute(context) {
          executionOrder.push('step3');
          return super.execute(context);
        }
      }
      
      const trackingOrchestrator = new OnboardingOrchestrator();
      trackingOrchestrator.registerStep(new TrackingStep3()); // Register in wrong order
      trackingOrchestrator.registerStep(new TrackingStep1());
      trackingOrchestrator.registerStep(new TrackingStep2());
      
      const initialContext = {
        projectName: 'order-test',
        interactive: false,
        force: true,
        selectedModules: ['vue-base']
      };
      
      await trackingOrchestrator.execute(initialContext);
      
      // Should execute in priority order regardless of registration order
      expect(executionOrder).toEqual(['step1', 'step2', 'step3']);
    });
    
    test('should skip steps based on shouldRun condition', async () => {
      const executionOrder = [];
      
      class ConditionalStep extends ProjectNameStep {
        shouldRun(context) {
          return context.runConditionalStep === true;
        }
        
        async execute(context) {
          executionOrder.push('conditional');
          return super.execute(context);
        }
      }
      
      const conditionalOrchestrator = new OnboardingOrchestrator();
      conditionalOrchestrator.registerStep(new ConditionalStep());
      
      // First run without condition
      const context1 = {
        projectName: 'skip-test-1',
        interactive: false,
        force: true,
        runConditionalStep: false
      };
      
      await conditionalOrchestrator.execute(context1);
      expect(executionOrder).toHaveLength(0);
      
      // Second run with condition
      const context2 = {
        projectName: 'skip-test-2',
        interactive: false,
        force: true,
        runConditionalStep: true
      };
      
      await conditionalOrchestrator.execute(context2);
      expect(executionOrder).toContain('conditional');
    });
  });
  
  describe('Context Passing', () => {
    test('should pass context between steps correctly', async () => {
      let capturedContext;
      
      class ContextCapturingStep extends ProjectGenerationStep {
        async execute(context) {
          capturedContext = { ...context };
          return super.execute(context);
        }
      }
      
      const contextOrchestrator = new OnboardingOrchestrator();
      contextOrchestrator.registerStep(new ProjectNameStep());
      contextOrchestrator.registerStep(new StackSelectionStep());
      contextOrchestrator.registerStep(new ContextCapturingStep());
      
      const initialContext = {
        projectName: 'context-test',
        interactive: false,
        force: true,
        selectedModules: ['vue-base'],
        customValue: 'test-value'
      };
      
      await contextOrchestrator.execute(initialContext);
      
      expect(capturedContext.projectName).toBe('context-test');
      expect(capturedContext.customValue).toBe('test-value');
      expect(capturedContext.stackResolution).toBeDefined();
    });
    
    test('should allow steps to modify context', async () => {
      class ContextModifyingStep extends ProjectNameStep {
        async execute(context) {
          const result = await super.execute(context);
          result.modifiedByStep = true;
          result.stepData = { some: 'data' };
          return result;
        }
      }
      
      const modifyingOrchestrator = new OnboardingOrchestrator();
      modifyingOrchestrator.registerStep(new ContextModifyingStep());
      
      const initialContext = {
        projectName: 'modify-test',
        interactive: false,
        force: true
      };
      
      const finalContext = await modifyingOrchestrator.execute(initialContext);
      
      expect(finalContext.modifiedByStep).toBe(true);
      expect(finalContext.stepData).toEqual({ some: 'data' });
    });
  });
  
  describe('Error Handling', () => {
    test('should handle step execution errors', async () => {
      class FailingStep extends ProjectNameStep {
        async execute(context) {
          throw new Error('Step execution failed');
        }
      }
      
      const failingOrchestrator = new OnboardingOrchestrator();
      failingOrchestrator.registerStep(new FailingStep());
      
      const initialContext = {
        projectName: 'error-test',
        interactive: false,
        force: true
      };
      
      await expect(failingOrchestrator.execute(initialContext)).rejects.toThrow('Step execution failed');
    });
    
    test('should handle validation errors', async () => {
      const initialContext = {
        projectName: '', // Invalid: empty project name
        interactive: false,
        force: true
      };
      
      await expect(orchestrator.execute(initialContext)).rejects.toThrow();
    });
    
    test('should handle dependency resolution errors', async () => {
      const initialContext = {
        projectName: 'dep-error-test',
        interactive: false,
        force: true,
        selectedModules: ['non-existent-module']
      };
      
      await expect(orchestrator.execute(initialContext)).rejects.toThrow();
    });
  });
  
  describe('Safety Checks', () => {
    test('should respect force option for safety checks', async () => {
      // Create existing files to trigger safety warnings
      const fs = await import('fs-extra');
      await fs.writeFile(join(testDir, 'existing-file.txt'), 'existing content');
      
      const initialContext = {
        projectName: 'safety-test',
        interactive: false,
        here: true, // Create in current directory with existing files
        force: true, // Should skip safety checks
        selectedModules: ['vue-base']
      };
      
      // Should succeed despite existing files
      const finalContext = await orchestrator.execute(initialContext);
      expect(finalContext.generated).toBe(true);
    });
    
    test('should fail safety checks without force option', async () => {
      // Create existing project structure
      const fs = await import('fs-extra');
      await fs.writeFile(join(testDir, 'package.json'), '{}');
      await fs.writeFile(join(testDir, 'src/main.js'), '// existing');
      
      const initialContext = {
        projectName: 'safety-fail-test',
        interactive: false,
        here: true,
        force: false, // Don't force
        selectedModules: ['vue-base']
      };
      
      await expect(orchestrator.execute(initialContext)).rejects.toThrow('Safety check failed');
    });
  });
  
  describe('Module Integration', () => {
    test('should integrate with actual module system', async () => {
      // This test ensures the onboarding system works with real modules
      const initialContext = {
        projectName: 'real-modules-test',
        interactive: false,
        force: true,
        selectedModules: ['vue-base', 'vuetify', 'supabase']
      };
      
      const finalContext = await orchestrator.execute(initialContext);
      
      expect(finalContext.stackResolution.modules.length).toBeGreaterThan(0);
      
      const projectPath = join(testDir, 'real-modules-test');
      
      // Verify Vue base files
      await assertFileExists(join(projectPath, 'src/main.js'));
      await assertFileContains(join(projectPath, 'src/main.js'), 'createApp');
      
      // Verify Vuetify files
      await assertFileExists(join(projectPath, 'src/plugins/vuetify.js'));
      
      // Verify Supabase files
      await assertFileExists(join(projectPath, 'src/lib/supabase.js'));
      await assertFileExists(join(projectPath, '.env.example'));
      
      // Verify package.json merging
      const fs = await import('fs-extra');
      const packageJson = await fs.readJson(join(projectPath, 'package.json'));
      expect(packageJson.dependencies.vue).toBeDefined();
      expect(packageJson.dependencies.vuetify).toBeDefined();
      expect(packageJson.dependencies['@supabase/supabase-js']).toBeDefined();
    });
  });
  
  describe('Performance', () => {
    test('should complete onboarding within reasonable time', async () => {
      const startTime = Date.now();
      
      const initialContext = {
        projectName: 'performance-test',
        interactive: false,
        force: true,
        selectedModules: ['vue-base', 'vuetify', 'supabase', 'pinia']
      };
      
      await orchestrator.execute(initialContext);
      
      const duration = Date.now() - startTime;
      
      // Should complete within 10 seconds (adjust as needed)
      expect(duration).toBeLessThan(10000);
    });
  });
});