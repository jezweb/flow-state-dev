/**
 * Memory Setup Step
 * Offers to set up Claude memory file during project initialization
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { OnboardingStep } from '../base.js';
import { memoryExists, initMemory } from '../../memory.js';

export class MemorySetupStep extends OnboardingStep {
  constructor() {
    super('memory-setup', 'Set up Claude memory file', {
      priority: 100, // Run at the end
      required: false,
      dependencies: ['template-processing'] // Run after project is initialized
    });
  }

  async validate(context) {
    // Always valid - this is an optional step
    return { valid: true };
  }

  async execute(context) {
    const { interactive, options } = context;
    
    // Skip if not interactive or if memory flag is false
    if (!interactive || options?.memory === false) {
      return context;
    }
    
    // Check if memory file already exists
    const hasMemory = memoryExists();
    
    if (hasMemory && !options?.memory) {
      // Memory exists and user didn't explicitly request setup
      return context;
    }
    
    console.log(chalk.blue('\n🧠 Claude Memory Setup\n'));
    
    if (hasMemory) {
      console.log(chalk.gray('You already have a Claude memory file configured.'));
      
      const { updateMemory } = await inquirer.prompt([{
        type: 'confirm',
        name: 'updateMemory',
        message: 'Would you like to update it?',
        default: false
      }]);
      
      if (!updateMemory) {
        return context;
      }
    } else {
      console.log(chalk.gray('Claude memory files help Claude understand your preferences and work style.'));
      console.log(chalk.gray('This creates a personalized development experience.\n'));
      
      const { setupMemory } = await inquirer.prompt([{
        type: 'confirm',
        name: 'setupMemory',
        message: 'Would you like to set up a Claude memory file now?',
        default: true
      }]);
      
      if (!setupMemory) {
        console.log(chalk.gray('\n💡 You can set up memory later with: fsd memory init'));
        return context;
      }
    }
    
    // Offer different setup modes
    const { setupMode } = await inquirer.prompt([{
      type: 'list',
      name: 'setupMode',
      message: 'Choose setup mode:',
      choices: [
        { name: '⚡ Quick - Just the essentials (recommended)', value: 'quick' },
        { name: '📄 Template - Start from a persona template', value: 'template' },
        { name: '🎯 Enhanced - Full configuration', value: 'enhanced' }
      ],
      default: 'quick'
    }]);
    
    try {
      // Set up memory with the selected mode
      const memoryOptions = {
        ...(setupMode === 'enhanced' && { enhanced: true }),
        ...(setupMode === 'template' && { template: true }),
        force: hasMemory // Force overwrite if updating
      };
      
      const success = await initMemory(memoryOptions);
      
      if (success) {
        context.memoryConfigured = true;
        console.log(chalk.green('\n✅ Claude memory file created successfully!'));
        console.log(chalk.gray('Claude will now have better context about your preferences.'));
      }
    } catch (error) {
      console.log(chalk.yellow('\n⚠️  Memory setup encountered an issue:'), error.message);
      console.log(chalk.gray('You can try again later with: fsd memory init'));
    }
    
    return context;
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        memory: {
          type: 'boolean',
          description: 'Set up Claude memory file during initialization'
        },
        memoryMode: {
          type: 'string',
          enum: ['quick', 'template', 'enhanced'],
          description: 'Memory setup mode to use'
        }
      }
    };
  }
}