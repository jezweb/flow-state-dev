/**
 * Modular onboarding system for Flow State Dev
 * 
 * This system allows for extensible, plugin-based onboarding flows
 * while maintaining backward compatibility with the existing CLI.
 */
import chalk from 'chalk';
import { OnboardingOrchestrator, OnboardingPluginLoader } from './base.js';
import { getSteps } from './steps/index.js';

/**
 * Create and configure a standard onboarding orchestrator
 * @param {Object} options - Configuration options
 * @returns {OnboardingOrchestrator}
 */
export function createOnboardingOrchestrator(options = {}) {
  const orchestrator = new OnboardingOrchestrator();
  
  // Register built-in steps
  const steps = getSteps();
  for (const step of steps) {
    orchestrator.registerStep(step);
  }
  
  return orchestrator;
}

/**
 * Run the complete onboarding flow
 * @param {Object} initialContext - Initial context values
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Final context
 */
export async function runOnboarding(initialContext = {}, options = {}) {
  try {
    const orchestrator = createOnboardingOrchestrator(options);
    
    // Load external plugins if requested
    if (options.loadPlugins !== false) {
      const pluginLoader = new OnboardingPluginLoader();
      await pluginLoader.loadPlugins(orchestrator, options.pluginFilter);
    }
    
    // Execute onboarding flow
    const finalContext = await orchestrator.execute(initialContext);
    
    // Show completion summary
    showCompletionSummary(finalContext);
    
    return finalContext;
  } catch (error) {
    console.error(chalk.red('❌ Onboarding failed:'), error.message);
    throw error;
  }
}

/**
 * Show completion summary and next steps
 * @param {Object} context - Final onboarding context
 */
function showCompletionSummary(context) {
  const { projectName, supabaseConfigured, gitHubConfigured } = context;
  
  console.log(chalk.green('\n✅ Project created successfully!\n'));
  console.log(chalk.white('Next steps:'));
  console.log(chalk.gray(`  cd ${projectName}`));
  
  if (!supabaseConfigured) {
    console.log(chalk.gray('  cp .env.example .env'));
    console.log(chalk.gray('  # Edit .env with your Supabase credentials'));
  }
  
  console.log(chalk.gray('  npm install'));
  console.log(chalk.gray('  npm run dev\n'));
  
  if (!gitHubConfigured) {
    console.log(chalk.yellow('💡 Tip: Run "fsd labels" after creating your GitHub repo\n'));
  }
}

/**
 * Legacy compatibility function for existing CLI
 * This maintains backward compatibility while using the new modular system
 */
export async function legacyOnboarding(projectName, options = {}) {
  const initialContext = {
    projectName,
    interactive: options.interactive !== false,
    options: {
      here: options.here,
      subfolder: options.subfolder,
      force: options.force
    }
  };
  
  return runOnboarding(initialContext, { loadPlugins: false });
}

// Export the core classes for advanced usage
export { OnboardingOrchestrator, OnboardingPluginLoader } from './base.js';
export * from './steps/index.js';