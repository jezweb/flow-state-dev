/**
 * Built-in onboarding steps registry
 */
import { ProjectNameStep } from './project-name.js';
import { FrameworkSelectionStep } from './framework-selection.js';
import { DirectorySelectionStep } from './directory-selection.js';
import { RepositorySecurityStep } from './repository-security.js';
import { TemplateProcessingStep } from './template-processing.js';
import { SecurityValidationStep } from './security-validation.js';
import { GitInitializationStep } from './git-initialization.js';
import { SupabaseConfigurationStep } from './supabase-config.js';
import { GitHubConfigurationStep } from './github-config.js';
import { MemorySetupStep } from './memory-setup.js';

/**
 * Get all built-in onboarding steps
 * @returns {OnboardingStep[]}
 */
export function getSteps() {
  return [
    new ProjectNameStep(),
    new FrameworkSelectionStep(),
    new DirectorySelectionStep(),
    new RepositorySecurityStep(),
    new TemplateProcessingStep(),
    new SecurityValidationStep(),
    new GitInitializationStep(),
    new SupabaseConfigurationStep(),
    new GitHubConfigurationStep(),
    new MemorySetupStep()
  ];
}

/**
 * Get specific step by name
 * @param {string} name
 * @returns {OnboardingStep|null}
 */
export function getStep(name) {
  const steps = getSteps();
  return steps.find(step => step.name === name) || null;
}

/**
 * Get steps filtered by category or criteria
 * @param {Object} criteria
 * @returns {OnboardingStep[]}
 */
export function getStepsBy(criteria = {}) {
  const steps = getSteps();
  
  return steps.filter(step => {
    if (criteria.required !== undefined && step.required !== criteria.required) {
      return false;
    }
    
    if (criteria.priority !== undefined && step.priority !== criteria.priority) {
      return false;
    }
    
    if (criteria.dependencies && !criteria.dependencies.every(dep => step.dependencies.includes(dep))) {
      return false;
    }
    
    return true;
  });
}

// Export individual steps for direct usage
export {
  ProjectNameStep,
  FrameworkSelectionStep,
  DirectorySelectionStep,
  RepositorySecurityStep,
  TemplateProcessingStep,
  SecurityValidationStep,
  GitInitializationStep,
  SupabaseConfigurationStep,
  GitHubConfigurationStep,
  MemorySetupStep
};