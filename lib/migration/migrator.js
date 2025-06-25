/**
 * Core Migration Engine
 * Handles the migration process from analysis to completion
 */
import { ProjectAnalyzer } from './analyzer.js';
import { BackupManager } from './backup.js';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

export class ProjectMigrator {
  constructor(projectPath = process.cwd(), options = {}) {
    this.projectPath = projectPath;
    this.options = {
      dryRun: false,
      autoBackup: true,
      confirmSteps: true,
      verbose: false,
      ...options
    };
    
    this.analyzer = new ProjectAnalyzer(projectPath);
    this.backupManager = new BackupManager(projectPath);
    this.transformers = new Map();
    this.migrationLog = [];
  }

  /**
   * Register a transformer for a specific project type
   */
  registerTransformer(projectType, transformer) {
    this.transformers.set(projectType, transformer);
  }

  /**
   * Execute the complete migration process
   */
  async migrate() {
    try {
      console.log(chalk.cyan('🚀 Starting project migration...\n'));
      
      // Step 1: Analyze the project
      const analysis = await this.analyzer.analyze();
      this.analyzer.displayResults();
      
      // Step 2: Confirm migration
      if (this.options.confirmSteps && !await this.confirmMigration(analysis)) {
        console.log(chalk.yellow('Migration cancelled by user.'));
        return { success: false, reason: 'cancelled' };
      }
      
      // Step 3: Create backup
      let backupId = null;
      if (this.options.autoBackup) {
        backupId = await this.createBackup();
      }
      
      // Step 4: Execute migration
      const result = await this.executeMigration(analysis);
      
      // Step 5: Validate migration
      if (result.success) {
        const validation = await this.validateMigration();
        if (!validation.valid) {
          console.log(chalk.red('❌ Migration validation failed'));
          if (backupId && await this.confirmRollback()) {
            await this.rollback(backupId);
          }
          return { success: false, reason: 'validation_failed', validation };
        }
      }
      
      // Step 6: Cleanup or rollback
      if (result.success) {
        console.log(chalk.green('\n✅ Migration completed successfully!'));
        await this.showPostMigrationInstructions(analysis);
      } else {
        console.log(chalk.red('\n❌ Migration failed'));
        if (backupId && await this.confirmRollback()) {
          await this.rollback(backupId);
        }
      }
      
      return {
        success: result.success,
        backupId,
        migrationLog: this.migrationLog,
        analysis
      };
      
    } catch (error) {
      console.error(chalk.red('💥 Migration error:'), error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a backup before migration
   */
  async createBackup() {
    console.log(chalk.blue('\n💾 Creating backup...'));
    
    if (this.options.dryRun) {
      console.log(chalk.gray('(Dry run - backup skipped)'));
      return 'dry-run-backup';
    }
    
    const backupId = await this.backupManager.createBackup({
      includeNodeModules: false,
      compression: true
    });
    
    console.log(chalk.green(`✅ Backup created: ${backupId}`));
    this.logStep('backup_created', { backupId });
    
    return backupId;
  }

  /**
   * Execute the migration based on analysis
   */
  async executeMigration(analysis) {
    console.log(chalk.blue('\n🔄 Executing migration...'));
    
    const transformer = this.getTransformer(analysis.projectType);
    
    if (!transformer) {
      throw new Error(`No transformer available for project type: ${analysis.projectType}`);
    }
    
    try {
      // Phase 1: Pre-migration setup
      console.log(chalk.blue('Phase 1: Pre-migration setup'));
      await this.executePhase('pre-migration', transformer, analysis);
      
      // Phase 2: Dependencies migration
      console.log(chalk.blue('Phase 2: Dependencies migration'));
      await this.executePhase('dependencies', transformer, analysis);
      
      // Phase 3: Configuration migration
      console.log(chalk.blue('Phase 3: Configuration migration'));
      await this.executePhase('configuration', transformer, analysis);
      
      // Phase 4: File structure migration
      console.log(chalk.blue('Phase 4: File structure migration'));
      await this.executePhase('file-structure', transformer, analysis);
      
      // Phase 5: Source code migration
      console.log(chalk.blue('Phase 5: Source code migration'));
      await this.executePhase('source-code', transformer, analysis);
      
      // Phase 6: Post-migration cleanup
      console.log(chalk.blue('Phase 6: Post-migration cleanup'));
      await this.executePhase('post-migration', transformer, analysis);
      
      return { success: true };
      
    } catch (error) {
      console.error(chalk.red(`Migration failed in phase: ${error.phase || 'unknown'}`));
      console.error(chalk.red(`Error: ${error.message}`));
      return { success: false, error: error.message, phase: error.phase };
    }
  }

  /**
   * Execute a migration phase
   */
  async executePhase(phaseName, transformer, analysis) {
    const phaseMethod = `migrate${phaseName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')}`;
    
    if (typeof transformer[phaseMethod] === 'function') {
      try {
        await transformer[phaseMethod](analysis, {
          dryRun: this.options.dryRun,
          verbose: this.options.verbose,
          projectPath: this.projectPath,
          logger: (message, type = 'info') => this.logStep(type, { phase: phaseName, message })
        });
        
        this.logStep('phase_completed', { phase: phaseName });
        
      } catch (error) {
        error.phase = phaseName;
        throw error;
      }
    } else {
      console.log(chalk.gray(`  Skipping ${phaseName} (not implemented)`));
    }
  }

  /**
   * Get transformer for project type
   */
  getTransformer(projectType) {
    // Try exact match first
    if (this.transformers.has(projectType)) {
      return this.transformers.get(projectType);
    }
    
    // Try partial matches
    for (const [type, transformer] of this.transformers) {
      if (projectType.includes(type) || type.includes(projectType)) {
        return transformer;
      }
    }
    
    // Try framework-based fallback
    const framework = projectType.split('-')[0];
    if (this.transformers.has(framework)) {
      return this.transformers.get(framework);
    }
    
    return null;
  }

  /**
   * Validate migration results
   */
  async validateMigration() {
    console.log(chalk.blue('\n🔍 Validating migration...'));
    
    const validation = {
      valid: true,
      issues: [],
      warnings: []
    };
    
    try {
      // Check if package.json is valid
      const packagePath = join(this.projectPath, 'package.json');
      if (existsSync(packagePath)) {
        try {
          JSON.parse(readFileSync(packagePath, 'utf-8'));
        } catch (error) {
          validation.issues.push('Invalid package.json after migration');
          validation.valid = false;
        }
      }
      
      // Check for required files
      const requiredFiles = ['package.json', 'src/main.js'];
      for (const file of requiredFiles) {
        if (!existsSync(join(this.projectPath, file))) {
          validation.warnings.push(`Missing expected file: ${file}`);
        }
      }
      
      // Check if dependencies can be resolved (basic check)
      // In a real implementation, you might run npm/yarn to test dependency resolution
      
      if (validation.issues.length === 0) {
        console.log(chalk.green('✅ Migration validation passed'));
      } else {
        console.log(chalk.red('❌ Migration validation failed'));
        validation.issues.forEach(issue => {
          console.log(chalk.red(`  • ${issue}`));
        });
      }
      
      if (validation.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  Validation warnings:'));
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
      }
      
    } catch (error) {
      validation.valid = false;
      validation.issues.push(`Validation error: ${error.message}`);
    }
    
    return validation;
  }

  /**
   * Rollback to backup
   */
  async rollback(backupId) {
    console.log(chalk.blue(`\n🔄 Rolling back to backup: ${backupId}...`));
    
    if (this.options.dryRun) {
      console.log(chalk.gray('(Dry run - rollback skipped)'));
      return true;
    }
    
    try {
      await this.backupManager.restoreBackup(backupId);
      console.log(chalk.green('✅ Rollback completed'));
      this.logStep('rollback_completed', { backupId });
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Rollback failed:'), error.message);
      return false;
    }
  }

  /**
   * Show post-migration instructions
   */
  async showPostMigrationInstructions(analysis) {
    console.log(chalk.cyan('\n📋 Post-Migration Instructions:\n'));
    
    console.log('1. Install dependencies:');
    const packageManager = analysis.packageManager || 'npm';
    console.log(chalk.gray(`   ${packageManager} install\n`));
    
    console.log('2. Run the development server:');
    console.log(chalk.gray('   npm run dev\n'));
    
    console.log('3. Test your application:');
    console.log(chalk.gray('   • Check that all features work correctly'));
    console.log(chalk.gray('   • Run your test suite if available'));
    console.log(chalk.gray('   • Verify build process works\n'));
    
    if (analysis.potentialIssues.length > 0) {
      console.log(chalk.yellow('⚠️  Items to review:'));
      analysis.potentialIssues.forEach(issue => {
        console.log(chalk.yellow(`   • ${issue}`));
      });
    }
    
    console.log('\n4. Next steps:');
    console.log(chalk.gray('   • Update your CI/CD configuration if needed'));
    console.log(chalk.gray('   • Update documentation'));
    console.log(chalk.gray('   • Consider removing the backup once everything is working'));
  }

  /**
   * Confirm migration with user
   */
  async confirmMigration(analysis) {
    if (this.options.dryRun) {
      console.log(chalk.blue('\n🔍 Dry run mode - no changes will be made\n'));
      return true;
    }
    
    const response = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `Proceed with ${analysis.migrationComplexity} complexity migration?`,
        default: analysis.migrationComplexity === 'low'
      }
    ]);
    
    return response.proceed;
  }

  /**
   * Confirm rollback with user
   */
  async confirmRollback() {
    const response = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'rollback',
        message: 'Would you like to rollback to the backup?',
        default: true
      }
    ]);
    
    return response.rollback;
  }

  /**
   * Log migration step
   */
  logStep(type, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      ...data
    };
    
    this.migrationLog.push(logEntry);
    
    if (this.options.verbose) {
      console.log(chalk.gray(`[${logEntry.timestamp}] ${type}: ${JSON.stringify(data)}`));
    }
  }

  /**
   * Get migration log
   */
  getMigrationLog() {
    return this.migrationLog;
  }

  /**
   * Export migration report
   */
  async exportMigrationReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      projectPath: this.projectPath,
      analysis: this.analyzer.analysis,
      migrationLog: this.migrationLog,
      options: this.options
    };
    
    if (this.options.dryRun) {
      console.log('Migration report:', JSON.stringify(report, null, 2));
    } else {
      writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(chalk.green(`Migration report saved: ${outputPath}`));
    }
    
    return report;
  }
}