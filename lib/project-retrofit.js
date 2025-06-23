/**
 * Flow State Dev Project Retrofit Engine
 * 
 * Main orchestrator for safely upgrading existing projects with
 * new Flow State Dev features.
 */
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ProjectAnalyzer } from './project-analysis.js';
import { BackupManager } from './backup-manager.js';
import { getModuleRegistry } from './retrofit-modules/index.js';

export class ProjectRetrofitEngine {
  constructor(projectPath = process.cwd()) {
    this.projectPath = path.resolve(projectPath);
    this.analyzer = new ProjectAnalyzer(this.projectPath);
    this.backupManager = new BackupManager(this.projectPath);
    this.moduleRegistry = getModuleRegistry();
    this.analysis = null;
  }

  /**
   * Main entry point for project retrofit
   * @param {Object} options - Retrofit options
   * @returns {Object} Retrofit results
   */
  async executeRetrofit(options = {}) {
    try {
      console.log(chalk.cyan.bold('\n🔄 Flow State Dev Project Retrofit\n'));
      
      // Step 1: Analyze current project
      console.log(chalk.blue('Step 1: Analyzing project...'));
      this.analysis = await this.analyzer.analyzeProject();
      
      const missingFeatures = await this.analyzer.identifyMissingFeatures();
      const upgradePlan = await this.analyzer.generateUpgradePlan();
      
      // Check if upgrade is needed/possible
      if (!upgradePlan.canUpgrade) {
        console.log(chalk.green('✅ Your project is already up to date with Flow State Dev!'));
        return { success: true, upgraded: false };
      }

      // Show current state
      this.displayProjectStatus(missingFeatures);
      
      // Step 2: Get available modules
      const availableModules = await this.getAvailableModules();
      
      if (availableModules.length === 0) {
        console.log(chalk.yellow('⚠️  No retrofit modules available for this project.'));
        return { success: true, upgraded: false };
      }

      // Step 3: Select features to apply
      let selectedModules;
      if (options.features) {
        selectedModules = this.selectModulesByName(availableModules, options.features);
      } else if (options.preview) {
        selectedModules = availableModules; // Preview all for now
      } else {
        selectedModules = await this.selectModulesInteractively(availableModules, upgradePlan);
      }

      if (selectedModules.length === 0) {
        console.log(chalk.yellow('No features selected for upgrade.'));
        return { success: true, upgraded: false };
      }

      // Step 4: Preview changes
      console.log(chalk.blue('\nStep 2: Previewing changes...'));
      const previewResults = await this.previewChanges(selectedModules);
      
      if (options.preview) {
        this.displayPreview(previewResults);
        return { success: true, upgraded: false, preview: previewResults };
      }

      // Step 5: Confirm changes
      if (!options.force) {
        const confirmed = await this.confirmChanges(previewResults);
        if (!confirmed) {
          console.log(chalk.yellow('Retrofit cancelled by user.'));
          return { success: true, upgraded: false };
        }
      }

      // Step 6: Create backup
      console.log(chalk.blue('\nStep 3: Creating backup...'));
      const backup = await this.backupManager.createBackup('Pre-retrofit backup');

      // Step 7: Apply changes
      console.log(chalk.blue('\nStep 4: Applying features...'));
      const applyResults = await this.applyModules(selectedModules);

      // Step 8: Validate changes
      console.log(chalk.blue('\nStep 5: Validating changes...'));
      const validationResults = await this.validateChanges(selectedModules);

      // Step 9: Report results
      this.displayResults({
        backup,
        modules: selectedModules,
        applyResults,
        validationResults,
        preview: previewResults
      });

      return {
        success: true,
        upgraded: true,
        backup: backup.id,
        modules: selectedModules.map(m => m.name),
        results: applyResults
      };

    } catch (error) {
      console.error(chalk.red('\n❌ Retrofit failed:'), error.message);
      
      // Attempt rollback if backup exists
      if (options.autoRollback && this.lastBackup) {
        console.log(chalk.yellow('\n🔄 Attempting automatic rollback...'));
        try {
          await this.backupManager.restoreFromBackup(this.lastBackup, { force: true });
          console.log(chalk.green('✅ Rollback completed successfully'));
        } catch (rollbackError) {
          console.error(chalk.red('❌ Rollback failed:'), rollbackError.message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Get modules applicable to current project
   * @returns {Array} Available retrofit modules
   */
  async getAvailableModules() {
    const modules = await this.moduleRegistry.getApplicableModules(this.analysis);
    return this.moduleRegistry.sortByDependencies(modules);
  }

  /**
   * Select modules by name from command line
   * @param {Array} availableModules - Available modules
   * @param {string|Array} featureNames - Comma-separated or array of feature names
   * @returns {Array} Selected modules
   */
  selectModulesByName(availableModules, featureNames) {
    const names = Array.isArray(featureNames) 
      ? featureNames 
      : featureNames.split(',').map(s => s.trim());
    
    return availableModules.filter(module => 
      names.some(name => 
        module.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(module.name.toLowerCase())
      )
    );
  }

  /**
   * Interactive feature selection
   * @param {Array} availableModules - Available modules
   * @param {Object} upgradePlan - Upgrade plan
   * @returns {Array} Selected modules
   */
  async selectModulesInteractively(availableModules, upgradePlan) {
    console.log(chalk.blue('\n📋 Available Features:\n'));
    
    // Group modules by impact
    const byImpact = {
      high: availableModules.filter(m => m.impact === 'high'),
      medium: availableModules.filter(m => m.impact === 'medium'),
      low: availableModules.filter(m => m.impact === 'low')
    };

    // Display grouped features
    for (const [impact, modules] of Object.entries(byImpact)) {
      if (modules.length === 0) continue;
      
      const impactLabel = {
        high: chalk.red('🔴 Essential'),
        medium: chalk.yellow('🟡 Recommended'),
        low: chalk.blue('🔵 Optional')
      }[impact];
      
      console.log(`${impactLabel} Features:`);
      for (const module of modules) {
        console.log(`   • ${chalk.white(module.name)} - ${chalk.gray(module.description)}`);
      }
      console.log();
    }

    // Feature selection prompt
    const choices = availableModules.map(module => ({
      name: `${module.name} - ${module.description}`,
      value: module,
      checked: module.impact === 'high' // Auto-select high impact features
    }));

    const { selectedModules } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedModules',
        message: 'Select features to add:',
        choices,
        validate: (selection) => {
          if (selection.length === 0) {
            return 'Please select at least one feature to upgrade.';
          }
          return true;
        }
      }
    ]);

    return selectedModules;
  }

  /**
   * Preview changes for selected modules
   * @param {Array} modules - Selected modules
   * @returns {Object} Preview results
   */
  async previewChanges(modules) {
    const results = {
      modules: [],
      totalFiles: 0,
      totalModifications: 0,
      warnings: [],
      conflicts: []
    };

    for (const module of modules) {
      console.log(`   ${module.formatStatus('checking', 'analyzing changes...')}`);
      
      try {
        const preview = await module.previewChanges(this.projectPath, this.analysis);
        
        const moduleResult = {
          name: module.name,
          description: module.description,
          files: preview.files || [],
          modifications: preview.modifications || [],
          warnings: preview.warnings || [],
          success: true
        };

        results.modules.push(moduleResult);
        results.totalFiles += moduleResult.files.length;
        results.totalModifications += moduleResult.modifications.length;
        results.warnings.push(...moduleResult.warnings);
        
        console.log(`   ${module.formatStatus('applicable', 
          `${moduleResult.files.length} files, ${moduleResult.modifications.length} modifications`)}`);
        
      } catch (error) {
        console.log(`   ${module.formatStatus('error', error.message)}`);
        results.modules.push({
          name: module.name,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Apply selected modules to project
   * @param {Array} modules - Modules to apply
   * @returns {Object} Application results
   */
  async applyModules(modules) {
    const results = {
      applied: [],
      failed: [],
      totalChanges: 0
    };

    for (const module of modules) {
      console.log(`   ${module.formatStatus('checking', 'applying...')}`);
      
      try {
        const result = await module.applyFeature(this.projectPath, this.analysis);
        
        if (result.success) {
          console.log(`   ${module.formatStatus('applied', 
            `${result.changes.length} changes applied`)}`);
          
          results.applied.push({
            module: module.name,
            changes: result.changes
          });
          results.totalChanges += result.changes.length;
        } else {
          throw new Error('Module application failed');
        }
        
      } catch (error) {
        console.log(`   ${module.formatStatus('error', error.message)}`);
        results.failed.push({
          module: module.name,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Validate that modules were applied correctly
   * @param {Array} modules - Applied modules
   * @returns {Object} Validation results
   */
  async validateChanges(modules) {
    const results = {
      valid: [],
      invalid: [],
      allValid: true
    };

    for (const module of modules) {
      try {
        const validation = await module.validateApplication(this.projectPath);
        
        if (validation.valid) {
          console.log(`   ${module.formatStatus('applied', 'validation passed')}`);
          results.valid.push(module.name);
        } else {
          console.log(`   ${module.formatStatus('warning', 'validation issues found')}`);
          results.invalid.push({
            module: module.name,
            issues: validation.issues
          });
          results.allValid = false;
        }
        
      } catch (error) {
        console.log(`   ${module.formatStatus('error', `validation failed: ${error.message}`)}`);
        results.invalid.push({
          module: module.name,
          error: error.message
        });
        results.allValid = false;
      }
    }

    return results;
  }

  /**
   * Display current project status
   * @param {Object} missingFeatures - Missing features analysis
   */
  displayProjectStatus(missingFeatures) {
    console.log(chalk.blue('\n📊 Project Status:\n'));
    
    if (this.analysis.flowStateDev.isFlowStateDevProject) {
      console.log(chalk.green(`✅ Flow State Dev project detected (v${this.analysis.flowStateDev.version || 'unknown'})`));
    } else {
      console.log(chalk.yellow('⚠️  Flow State Dev project not detected'));
    }
    
    console.log(chalk.gray(`   Framework: ${this.analysis.framework.type || 'unknown'}`));
    console.log(chalk.gray(`   Git: ${this.analysis.git.isGitRepo ? '✅' : '❌'}`));
    console.log(chalk.gray(`   GitHub: ${this.analysis.git.isGitHub ? '✅' : '❌'}`));
    
    console.log(chalk.blue(`\n🎯 Available Upgrades: ${missingFeatures.features.length} features\n`));
    
    for (const feature of missingFeatures.features) {
      const impactColor = {
        high: chalk.red,
        medium: chalk.yellow,
        low: chalk.blue
      }[feature.impact] || chalk.white;
      
      console.log(`   ${impactColor('●')} ${chalk.white(feature.name)}`);
      console.log(`     ${chalk.gray(feature.description)}`);
      console.log(`     ${chalk.gray(`Benefits: ${feature.benefits.slice(0, 2).join(', ')}`)}`);
      console.log();
    }
  }

  /**
   * Display preview of changes
   * @param {Object} previewResults - Preview results
   */
  displayPreview(previewResults) {
    console.log(chalk.blue('\n📋 Change Preview:\n'));
    
    console.log(chalk.white(`Total: ${previewResults.totalFiles} new files, ${previewResults.totalModifications} modifications\n`));
    
    for (const module of previewResults.modules) {
      if (!module.success) continue;
      
      console.log(chalk.cyan(`📦 ${module.name}:`));
      
      if (module.files.length > 0) {
        console.log(chalk.green(`   New files (${module.files.length}):`));
        module.files.slice(0, 5).forEach(file => {
          console.log(chalk.gray(`     + ${file.path || file}`));
        });
        if (module.files.length > 5) {
          console.log(chalk.gray(`     ... and ${module.files.length - 5} more`));
        }
      }
      
      if (module.modifications.length > 0) {
        console.log(chalk.yellow(`   Modified files (${module.modifications.length}):`));
        module.modifications.slice(0, 3).forEach(mod => {
          console.log(chalk.gray(`     ~ ${mod.path || mod} ${mod.description ? '- ' + mod.description : ''}`));
        });
        if (module.modifications.length > 3) {
          console.log(chalk.gray(`     ... and ${module.modifications.length - 3} more`));
        }
      }
      
      console.log();
    }
    
    if (previewResults.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Warnings:'));
      previewResults.warnings.forEach(warning => {
        console.log(chalk.yellow(`   • ${warning}`));
      });
      console.log();
    }
  }

  /**
   * Confirm changes with user
   * @param {Object} previewResults - Preview results
   * @returns {boolean} Whether user confirmed
   */
  async confirmChanges(previewResults) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Continue with ${previewResults.totalFiles} new files and ${previewResults.totalModifications} modifications?`,
        default: true
      }
    ]);
    
    return confirm;
  }

  /**
   * Display final results
   * @param {Object} results - Complete results
   */
  displayResults(results) {
    console.log(chalk.green('\n🎉 Retrofit Complete!\n'));
    
    console.log(chalk.white('📊 Summary:'));
    console.log(chalk.gray(`   Backup: ${results.backup.id}`));
    console.log(chalk.gray(`   Features applied: ${results.applyResults.applied.length}`));
    console.log(chalk.gray(`   Total changes: ${results.applyResults.totalChanges}`));
    
    if (results.applyResults.failed.length > 0) {
      console.log(chalk.red(`   Failed modules: ${results.applyResults.failed.length}`));
    }
    
    console.log(chalk.blue('\n🚀 Next Steps:'));
    console.log(chalk.gray('   • Review the new documentation in docs/'));
    console.log(chalk.gray('   • Check .claude/ folder for AI optimizations'));
    console.log(chalk.gray('   • Run security scan: fsd security scan'));
    console.log(chalk.gray('   • Commit your changes to git'));
    
    if (results.backup) {
      console.log(chalk.yellow(`\n💡 Need to undo? Run: fsd upgrade --rollback ${results.backup.id}`));
    }
    
    console.log();
  }
}

/**
 * Execute rollback to a previous backup
 * @param {string} backupId - Backup ID to restore
 * @param {Object} options - Rollback options
 */
export async function executeRollback(backupId, options = {}) {
  const backupManager = new BackupManager();
  
  console.log(chalk.yellow(`🔄 Rolling back to backup: ${backupId}`));
  
  try {
    await backupManager.restoreFromBackup(backupId, {
      force: options.force,
      skipConfirmation: options.force
    });
    
    console.log(chalk.green('✅ Rollback completed successfully'));
    return true;
    
  } catch (error) {
    console.error(chalk.red('❌ Rollback failed:'), error.message);
    return false;
  }
}

/**
 * List available backups
 */
export async function listBackups() {
  const backupManager = new BackupManager();
  const backups = await backupManager.listBackups();
  
  if (backups.length === 0) {
    console.log(chalk.gray('No backups found.'));
    return;
  }
  
  console.log(chalk.blue('\n💾 Available Backups:\n'));
  
  for (const backup of backups) {
    const date = new Date(backup.timestamp).toLocaleString();
    const size = backupManager.formatSize(backup.size || 0);
    
    console.log(chalk.white(`${backup.id}`));
    console.log(chalk.gray(`   Created: ${date}`));
    console.log(chalk.gray(`   Description: ${backup.description}`));
    console.log(chalk.gray(`   Size: ${size}`));
    console.log();
  }
}