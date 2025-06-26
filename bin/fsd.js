#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { initMemory, showMemory, editMemory, importMemory, validateMemory } from '../lib/memory.js';
import { frameworks, getFramework, formatFrameworkInfo } from '../lib/frameworks.js';
import { runDoctor } from '../lib/doctor.js';
import { formatError } from '../lib/errors.js';
import { analyzeDirectory, formatDirectoryInfo, performSafetyChecks } from '../lib/directory-utils.js';
import { legacyOnboarding } from '../lib/onboarding/index.js';
import { ModuleRegistry } from '../lib/modules/registry.js';
import { StackPresetManager } from '../lib/onboarding/stack-presets.js';
import { TemplateGenerator } from '../lib/modules/template-generator.js';
import { SecurityScanner } from '../lib/security-scanner.js';
import { runSetupLocal } from '../lib/setup-local.js';
import { executeSupabaseCommand } from '../lib/supabase-commands.js';
import { generateStore } from '../lib/generate-store.js';
import { labelsManager } from '../lib/labels-manager.js';
import { executeSlashCommand } from '../lib/slash-commands-wrapper.js';
import { ProjectRetrofitEngine, executeRollback, listBackups } from '../lib/project-retrofit.js';
import { ProjectAnalyzer } from '../lib/migration/analyzer.js';
import { ProjectMigrator } from '../lib/migration/migrator.js';
import { BackupManager } from '../lib/migration/backup.js';
import { setupModuleCommands } from '../lib/cli/module-commands.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Template directory is now determined by framework selection

const program = new Command();

// ASCII art logo
const logo = chalk.cyan(`
╔═╗┬  ┌─┐┬ ┬  ╔═╗┌┬┐┌─┐┌┬┐┌─┐  ╔╦╗┌─┐┬  ┬
╠╣ │  │ ││││  ╚═╗ │ ├─┤ │ ├┤    ║║├┤ └┐┌┘
╚  ┴─┘└─┘└┴┘  ╚═╝ ┴ ┴ ┴ ┴ └─┘  ═╩╝└─┘ └┘ 
`);

program
  .name('fsd')
  .description('Flow State Dev - Vue 3 + Supabase project generator')
  .version('2.1.0');

// Init command
program
  .command('init [project-name]')
  .description('Create a new project with modular stack selection')
  .option('--no-interactive', 'Skip interactive setup')
  .option('--here', 'Create project in current directory')
  .option('--subfolder', 'Create project in subfolder (default)')
  .option('--force', 'Skip safety confirmations (use with caution)')
  .option('--memory', 'Set up Claude memory file during initialization')
  .option('--no-memory', 'Skip memory file setup')
  .option('--preset <preset>', 'Use a stack preset (e.g., vue-full-stack, react-frontend)')
  .option('--modules <modules>', 'Comma-separated list of modules to include')
  .option('--legacy', 'Use legacy framework-based selection')
  .option('--verbose', 'Show detailed error information')
  .action(async (projectName, options) => {
    console.log(logo);
    
    try {
      if (options.legacy) {
        await legacyOnboarding(projectName, options);
      } else {
        await newModularOnboarding(projectName, options);
      }
    } catch (error) {
      console.error(formatError(error, { command: 'init', verbose: options.verbose }));
      process.exit(1);
    }
  });

// Modules command with subcommands
const modulesCmd = program
  .command('modules')
  .description('Manage project modules and stacks');

modulesCmd
  .command('list')
  .description('List available modules')
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-v, --verbose', 'Show detailed module information')
  .action(async (options) => {
    console.log(logo);
    try {
      const registry = new ModuleRegistry();
      await registry.discover();
      await listModules(registry, options);
    } catch (error) {
      console.error(formatError(error, { command: 'modules list', verbose: options.verbose }));
      process.exit(1);
    }
  });

modulesCmd
  .command('info <module>')
  .description('Show detailed information about a module')
  .action(async (moduleId) => {
    console.log(logo);
    try {
      const registry = new ModuleRegistry();
      await registry.discover();
      await showModuleInfo(registry, moduleId);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

modulesCmd
  .command('validate <module>')
  .description('Validate a module implementation')
  .action(async (moduleId) => {
    console.log(logo);
    try {
      const registry = new ModuleRegistry();
      await registry.discover();
      await validateModule(registry, moduleId);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

modulesCmd
  .command('docs')
  .description('Generate module documentation')
  .option('-o, --output <dir>', 'Output directory', './docs/modules')
  .option('-j, --json', 'Also generate JSON data')
  .action(async (options) => {
    console.log(logo);
    try {
      const registry = new ModuleRegistry();
      await registry.discover();
      const { DocumentationGenerator } = await import('../lib/modules/documentation/generator.js');
      const generator = new DocumentationGenerator(registry);
      await generator.generateAll({ generateJson: options.json });
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

modulesCmd
  .command('search <query>')
  .description('Search for modules by name, description, or tags')
  .option('-c, --category <category>', 'Filter by category')
  .option('-l, --limit <number>', 'Maximum results to show', '10')
  .action(async (query, options) => {
    console.log(logo);
    try {
      const registry = new ModuleRegistry();
      await registry.discover();
      await searchModules(registry, query, options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Default action for modules command
modulesCmd
  .action(async () => {
    console.log(logo);
    const registry = new ModuleRegistry();
    await registry.discover();
    await listModules(registry, {});
  });

// Presets command with subcommands  
const presetsCmd = program
  .command('presets')
  .description('Manage stack presets');

presetsCmd
  .command('list')
  .description('List available stack presets')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .option('-d, --difficulty <level>', 'Filter by difficulty level')
  .action(async (options) => {
    console.log(logo);
    try {
      const presetManager = new StackPresetManager();
      await listPresets(presetManager, options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

presetsCmd
  .command('info <preset>')
  .description('Show detailed information about a preset')
  .action(async (presetId) => {
    console.log(logo);
    try {
      const presetManager = new StackPresetManager();
      presetManager.displayPreset(presetId);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

presetsCmd
  .command('create <name>')
  .description('Create a custom preset from modules')
  .option('-d, --description <desc>', 'Preset description')
  .option('-m, --modules <modules>', 'Comma-separated list of modules')
  .action(async (name, options) => {
    console.log(logo);
    try {
      await createCustomPreset(name, options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Default action for presets command
presetsCmd
  .action(async () => {
    console.log(logo);
    const presetManager = new StackPresetManager();
    presetManager.listPresets();
  });

// Labels command with subcommands
const labelsCmd = program
  .command('labels')
  .description('Set up GitHub labels for the current repository');

labelsCmd
  .command('create')
  .description('Create labels in repository (default action)')
  .option('-c, --collection <name>', 'Use specific label collection (minimal, standard, ai-enhanced, full)')
  .option('-e, --emoji', 'Include emojis in label names')
  .option('--emoji-format <format>', 'Emoji position: prefix or suffix', 'prefix')
  .option('-f, --force', 'Skip preview and confirmation')
  .option('-v, --verbose', 'Show detailed error messages')
  .action(async (options) => {
    console.log(logo);
    try {
      await labelsManager.setupLabels(options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

labelsCmd
  .command('list')
  .description('List available label collections')
  .action(async () => {
    console.log(logo);
    await labelsManager.listCollections();
  });

labelsCmd
  .command('export')
  .description('Export labels from current repository')
  .option('-o, --output <file>', 'Output file name', 'labels-export.json')
  .action(async (options) => {
    console.log(logo);
    try {
      await labelsManager.exportLabels(options.output);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Default action for labels command (create labels)
labelsCmd
  .action(async () => {
    console.log(logo);
    try {
      await labelsManager.setupLabels();
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Memory command with subcommands
const memoryCmd = program
  .command('memory')
  .description('Manage Claude Code user memory file');

memoryCmd
  .command('init')
  .description('Initialize a new user memory file')
  .option('-f, --force', 'Overwrite existing memory file')
  .option('-m, --minimal', 'Use minimal setup with all defaults')
  .option('-e, --enhanced', 'Use enhanced setup mode')
  .option('-t, --template <name>', 'Start from a specific template')
  .action(async (options) => {
    console.log(logo);
    await initMemory(options);
  });

memoryCmd
  .command('show')
  .description('Display current user memory file')
  .action(async () => {
    console.log(logo);
    await showMemory();
  });

memoryCmd
  .command('edit')
  .description('Edit user memory file in default editor')
  .action(async () => {
    console.log(logo);
    await editMemory();
  });

memoryCmd
  .command('import [source]')
  .description('Import memory from another file')
  .action(async (source) => {
    console.log(logo);
    await importMemory(source);
  });

memoryCmd
  .command('validate [file]')
  .description('Validate memory file structure and content')
  .option('--strict', 'Enable strict validation mode')
  .option('--fix', 'Auto-fix common issues')
  .action(async (file, options) => {
    console.log(logo);
    await validateMemory(file, options);
  });

memoryCmd
  .command('fix [file]')
  .description('Auto-fix common issues in memory file')
  .action(async (file) => {
    console.log(logo);
    await validateMemory(file, { fix: true });
  });

memoryCmd
  .command('templates')
  .description('List available memory templates')
  .action(async () => {
    console.log(logo);
    const { templateManager } = await import('../lib/memory-templates.js');
    await templateManager.listTemplates();
  });

// Default action for memory command (show help)
memoryCmd
  .action(() => {
    console.log(logo);
    memoryCmd.outputHelp();
  });

// Doctor command
program
  .command('doctor')
  .description('Run diagnostics on your Flow State Dev project')
  .option('--fix', 'Automatically fix issues where possible')
  .action(async (options) => {
    console.log(logo);
    const exitCode = await runDoctor(options);
    process.exit(exitCode);
  });

// Security commands
const securityCmd = program
  .command('security')
  .description('Security tools and scanning');

securityCmd
  .command('scan')
  .description('Scan project for secrets and security issues')
  .option('--verbose', 'Show detailed output')
  .option('--report', 'Generate security report')
  .action(async (options) => {
    console.log(logo);
    const scanner = new SecurityScanner(options);
    const results = await scanner.scanProject();
    
    if (results.criticalIssues > 0 || results.highIssues > 0) {
      process.exit(1);
    }
  });

securityCmd
  .command('setup')
  .description('Set up security tools and templates')
  .action(async () => {
    console.log(logo);
    const scanner = new SecurityScanner();
    await scanner.setupSecurity();
  });

securityCmd
  .command('check')
  .description('Check repository security status')
  .action(async () => {
    console.log(logo);
    const scanner = new SecurityScanner();
    const repoStatus = await scanner.checkRepositoryVisibility();
    
    console.log(chalk.blue('\n🔍 Repository Security Status:\n'));
    
    switch (repoStatus.status) {
      case 'not-git':
        console.log(chalk.gray('📁 Local project (no git repository)'));
        break;
      case 'github':
        if (repoStatus.public) {
          console.log(chalk.red('🌍 PUBLIC GitHub repository'));
          console.log(chalk.yellow('⚠️  Extra security precautions recommended'));
        } else {
          console.log(chalk.green('🔒 PRIVATE GitHub repository'));
          console.log(chalk.green('✅ Safe for sensitive data'));
        }
        break;
      case 'github-no-cli':
        console.log(chalk.yellow('🔍 GitHub repository (visibility unknown)'));
        console.log(chalk.gray('Install GitHub CLI for visibility detection'));
        break;
      default:
        console.log(chalk.gray(`Repository status: ${repoStatus.status}`));
    }
  });

// Default action for security command
securityCmd
  .action(() => {
    console.log(logo);
    securityCmd.outputHelp();
  });

// Setup-local command
program
  .command('setup-local')
  .description('Set up local Supabase development environment')
  .action(async () => {
    console.log(logo);
    try {
      await runSetupLocal();
    } catch (error) {
      console.error(chalk.red('❌ Setup error:'), error.message);
      process.exit(1);
    }
  });

// Supabase command
program
  .command('supabase <command>')
  .description('Manage local Supabase development')
  .action(async (command) => {
    console.log(logo);
    try {
      await executeSupabaseCommand(command);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Store generator command
program
  .command('store <name>')
  .description('Generate a new Pinia store')
  .option('-m, --minimal', 'Generate a minimal store template')
  .option('-a, --auth', 'Generate an authentication store')
  .option('-s, --supabase', 'Generate a Supabase-connected store')
  .option('-t, --table <table>', 'Specify Supabase table name (with --supabase)')
  .option('-f, --force', 'Overwrite existing store')
  .action(async (name, options) => {
    console.log(logo);
    try {
      await generateStore(name, options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Slash commands for project management
program
  .command('slash <command>')
  .description('Execute project management slash commands')
  .action(async (command) => {
    console.log(logo);
    try {
      await executeSlashCommand(command);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Upgrade command
program
  .command('upgrade')
  .description('Safely add Flow State Dev features to existing project')
  .option('--preview', 'Show what would change without applying')
  .option('--features <features>', 'Specific features to add (comma-separated)')
  .option('--add-framework <framework>', 'Add a framework to minimal setup')
  .option('--list-frameworks', 'List available frameworks')
  .option('--rollback <backup-id>', 'Rollback to previous backup')
  .option('--list-backups', 'Show available backups')
  .option('--force', 'Skip confirmations (dangerous)')
  .option('--auto-rollback', 'Automatically rollback on failure')
  .action(async (options) => {
    console.log(logo);
    
    try {
      // Handle list frameworks option
      if (options.listFrameworks) {
        console.log(chalk.blue('\n📦 Available frameworks:\n'));
        frameworks.filter(f => f.available && f.value !== 'minimal').forEach(f => {
          console.log(`  ${f.name}`);
          if (f.description) {
            console.log(`    ${chalk.gray(f.description)}`);
          }
        });
        console.log('\n' + chalk.gray('Use: fsd upgrade --add-framework [framework-name]'));
        return;
      }
      
      // Handle add framework option
      if (options.addFramework) {
        console.log(chalk.blue('\n🚀 Adding framework to minimal project...\n'));
        
        // Check if we're in a minimal project
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
          console.error(chalk.red('❌ No package.json found. Are you in a project directory?'));
          process.exit(1);
        }
        
        // TODO: Implement framework addition logic
        console.log(chalk.yellow('⚠️  Framework addition is coming soon!'));
        console.log(chalk.gray('This feature will allow you to upgrade from minimal setup to a full framework.'));
        return;
      }
      
      // Handle rollback option
      if (options.rollback) {
        const success = await executeRollback(options.rollback, { force: options.force });
        process.exit(success ? 0 : 1);
        return;
      }
      
      // Handle list backups option
      if (options.listBackups) {
        await listBackups();
        return;
      }
      
      // Execute main retrofit
      const engine = new ProjectRetrofitEngine();
      const result = await engine.executeRetrofit(options);
      
      if (result.success) {
        console.log(chalk.green('✅ Upgrade completed successfully'));
        process.exit(0);
      } else {
        console.error(chalk.red('❌ Upgrade failed'));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Migration commands
const migrateCmd = program
  .command('migrate')
  .description('Migrate existing projects to Flow State Dev');

migrateCmd
  .command('analyze [path]')
  .description('Analyze project for migration possibilities')
  .option('-v, --verbose', 'Show detailed analysis')
  .option('-j, --json', 'Output results as JSON')
  .action(async (projectPath, options) => {
    console.log(logo);
    try {
      const analyzer = new ProjectAnalyzer(projectPath);
      const analysis = await analyzer.analyze();
      
      if (options.json) {
        console.log(JSON.stringify(analysis, null, 2));
      } else {
        analyzer.displayResults();
      }
    } catch (error) {
      console.error(chalk.red('❌ Analysis error:'), error.message);
      process.exit(1);
    }
  });

migrateCmd
  .command('execute [path]')
  .description('Execute project migration')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--no-backup', 'Skip creating backup (not recommended)')
  .option('--no-confirm', 'Skip confirmation prompts')
  .option('-v, --verbose', 'Show detailed migration progress')
  .action(async (projectPath, options) => {
    console.log(logo);
    try {
      const migrator = new ProjectMigrator(projectPath, {
        dryRun: options.dryRun,
        autoBackup: options.backup !== false,
        confirmSteps: options.confirm !== false,
        verbose: options.verbose
      });
      
      const result = await migrator.migrate();
      
      if (result.success) {
        console.log(chalk.green('\n✅ Migration completed successfully!'));
      } else {
        console.log(chalk.red('\n❌ Migration failed'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Migration error:'), error.message);
      process.exit(1);
    }
  });

migrateCmd
  .command('backup [path]')
  .description('Create backup of project before migration')
  .option('-d, --description <desc>', 'Backup description')
  .option('--include-node-modules', 'Include node_modules in backup')
  .option('--include-git', 'Include .git directory in backup')
  .action(async (projectPath, options) => {
    console.log(logo);
    try {
      const backupManager = new BackupManager(projectPath);
      const backupId = await backupManager.createBackup({
        description: options.description || 'Manual backup',
        includeNodeModules: options.includeNodeModules,
        includeGit: options.includeGit
      });
      
      console.log(chalk.green(`✅ Backup created: ${backupId}`));
    } catch (error) {
      console.error(chalk.red('❌ Backup error:'), error.message);
      process.exit(1);
    }
  });

migrateCmd
  .command('restore <backup-id> [path]')
  .description('Restore from backup')
  .option('--no-confirm', 'Skip confirmation prompts')
  .option('--no-current-backup', 'Skip creating backup of current state')
  .action(async (backupId, projectPath, options) => {
    console.log(logo);
    try {
      const backupManager = new BackupManager(projectPath);
      await backupManager.restoreBackup(backupId, {
        confirmOverwrite: options.confirm !== false,
        createCurrentBackup: options.currentBackup !== false
      });
      
      console.log(chalk.green('✅ Restore completed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Restore error:'), error.message);
      process.exit(1);
    }
  });

migrateCmd
  .command('backups [path]')
  .description('List available backups')
  .action(async (projectPath) => {
    console.log(logo);
    try {
      const backupManager = new BackupManager(projectPath);
      await backupManager.displayBackups();
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

migrateCmd
  .command('cleanup [path]')
  .description('Clean up old backups')
  .option('--max-age <days>', 'Maximum age in days', '30')
  .option('--max-count <count>', 'Maximum number of backups to keep', '10')
  .action(async (projectPath, options) => {
    console.log(logo);
    try {
      const backupManager = new BackupManager(projectPath);
      const result = await backupManager.cleanupOldBackups({
        maxAge: parseInt(options.maxAge),
        maxCount: parseInt(options.maxCount)
      });
      
      console.log(chalk.green(`✅ ${result.message}`));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  });

// Default action for migrate command
migrateCmd
  .action(() => {
    console.log(logo);
    migrateCmd.outputHelp();
  });

// Test command
program
  .command('test [pattern]')
  .description('Run project tests with comprehensive coverage')
  .option('-u, --unit', 'Run unit tests only')
  .option('-i, --integration', 'Run integration tests only')
  .option('-c, --coverage', 'Generate coverage report')
  .option('-w, --watch', 'Run tests in watch mode')
  .option('-v, --verbose', 'Show verbose test output')
  .option('--modules', 'Test module system specifically')
  .option('--migration', 'Test migration tools specifically')
  .action(async (pattern, options) => {
    console.log(logo);
    
    try {
      let testCommand = 'npm test';
      const args = [];
      
      // Build Jest command
      if (options.unit) {
        args.push('--testPathPattern=test/modules');
      } else if (options.integration) {
        args.push('--testPathPattern=test/integration');
      } else if (options.modules) {
        args.push('--testPathPattern=test/modules');
      } else if (options.migration) {
        args.push('--testPathPattern=test/migration');
      }
      
      if (pattern) {
        args.push(`--testNamePattern="${pattern}"`);
      }
      
      if (options.coverage) {
        args.push('--coverage');
      }
      
      if (options.watch) {
        args.push('--watch');
      }
      
      if (options.verbose) {
        args.push('--verbose');
      }
      
      if (args.length > 0) {
        testCommand += ' -- ' + args.join(' ');
      }
      
      console.log(chalk.blue(`🧪 Running tests: ${testCommand}\n`));
      
      execSync(testCommand, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Tests failed'));
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(logo);
    program.outputHelp();
  });

// Setup module commands
setupModuleCommands(program);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(logo);
  program.outputHelp();
}

// Helper functions for new modular commands

async function newModularOnboarding(projectName, options) {
  const { OnboardingOrchestrator } = await import('../lib/onboarding/base.js');
  const { ProjectNameStep } = await import('../lib/onboarding/steps/project-name.js');
  const { StackSelectionStep } = await import('../lib/onboarding/steps/stack-selection.js');
  const { ProjectGenerationStep } = await import('../lib/onboarding/steps/project-generation.js');
  
  const orchestrator = new OnboardingOrchestrator();
  
  // Register steps
  orchestrator.registerStep(new ProjectNameStep());
  orchestrator.registerStep(new StackSelectionStep());
  orchestrator.registerStep(new ProjectGenerationStep());
  
  // Set initial context
  const initialContext = {
    projectName,
    interactive: options.interactive !== false,
    here: options.here,
    subfolder: !options.here,
    force: options.force,
    memory: options.memory,
    noMemory: options.noMemory
  };
  
  // Handle preset option
  if (options.preset) {
    initialContext.stackPreset = options.preset;
  }
  
  // Handle modules option
  if (options.modules) {
    initialContext.selectedModules = options.modules.split(',').map(m => m.trim());
  }
  
  return await orchestrator.execute(initialContext);
}

async function listModules(registry, options) {
  let modules = registry.getAllModules();
  
  // Apply filters
  if (options.category) {
    modules = modules.filter(m => m.category === options.category);
  }
  
  if (options.tag) {
    modules = modules.filter(m => m.tags && m.tags.includes(options.tag));
  }
  
  console.log(chalk.blue('\n📦 Available Modules:\n'));
  
  if (modules.length === 0) {
    console.log(chalk.gray('No modules found matching criteria.'));
    return;
  }
  
  // Group by category
  const byCategory = {};
  for (const module of modules) {
    if (!byCategory[module.category]) {
      byCategory[module.category] = [];
    }
    byCategory[module.category].push(module);
  }
  
  for (const [category, categoryModules] of Object.entries(byCategory)) {
    console.log(chalk.cyan(`\n${getCategoryIcon(category)} ${getCategoryName(category)}:`));
    
    for (const module of categoryModules) {
      const recommended = module.recommended ? chalk.green(' ⭐') : '';
      const version = chalk.gray(`(v${module.version})`);
      
      console.log(chalk.green(`  ✓ ${module.name} ${version}${recommended}`));
      
      if (options.verbose) {
        console.log(chalk.gray(`    ${module.description}`));
        if (module.dependencies && module.dependencies.length > 0) {
          console.log(chalk.gray(`    Dependencies: ${module.dependencies.join(', ')}`));
        }
        if (module.tags && module.tags.length > 0) {
          console.log(chalk.gray(`    Tags: ${module.tags.join(', ')}`));
        }
      } else {
        console.log(chalk.gray(`    ${module.description}`));
      }
    }
  }
}

async function showModuleInfo(registry, moduleId) {
  const module = registry.getModule(moduleId);
  
  if (!module) {
    console.log(chalk.red(`❌ Module '${moduleId}' not found`));
    process.exit(1);
  }
  
  console.log(chalk.blue(`\n📦 ${module.name}`));
  if (module.recommended) {
    console.log(chalk.green('⭐ Recommended'));
  }
  console.log(chalk.gray(`${module.description}\n`));
  
  console.log(chalk.cyan(`📊 Category: ${getCategoryName(module.category)}`));
  console.log(chalk.cyan(`🏷️  Version: ${module.version}`));
  
  if (module.dependencies && module.dependencies.length > 0) {
    console.log(chalk.cyan(`🔗 Dependencies: ${module.dependencies.join(', ')}`));
  }
  
  if (module.provides && module.provides.length > 0) {
    console.log(chalk.cyan(`✅ Provides: ${module.provides.join(', ')}`));
  }
  
  if (module.requires && module.requires.length > 0) {
    console.log(chalk.cyan(`📋 Requires: ${module.requires.join(', ')}`));
  }
  
  if (module.compatibleWith && module.compatibleWith.length > 0) {
    console.log(chalk.green(`✓ Compatible with: ${module.compatibleWith.join(', ')}`));
  }
  
  if (module.incompatibleWith && module.incompatibleWith.length > 0) {
    console.log(chalk.red(`✗ Incompatible with: ${module.incompatibleWith.join(', ')}`));
  }
  
  if (module.tags && module.tags.length > 0) {
    console.log(chalk.gray(`\n🏷️  Tags: ${module.tags.join(', ')}`));
  }
}

async function validateModule(registry, moduleId) {
  const module = registry.getModule(moduleId);
  
  if (!module) {
    console.log(chalk.red(`❌ Module '${moduleId}' not found`));
    process.exit(1);
  }
  
  console.log(chalk.blue(`\n🔍 Validating module: ${module.name}\n`));
  
  const validationResult = await registry.validateModule(module);
  
  if (validationResult.valid) {
    console.log(chalk.green('✅ Module validation passed'));
  } else {
    console.log(chalk.red('❌ Module validation failed:'));
    for (const error of validationResult.errors) {
      console.log(chalk.red(`  • ${error}`));
    }
    process.exit(1);
  }
}

async function listPresets(presetManager, options) {
  let presets = presetManager.getAvailablePresets();
  
  // Apply filters
  if (options.tags) {
    const tags = options.tags.split(',').map(t => t.trim());
    presets = presetManager.getPresetsByTags(tags);
  }
  
  if (options.difficulty) {
    presets = presetManager.getPresetsByDifficulty(options.difficulty);
  }
  
  if (presets.length === 0) {
    console.log(chalk.gray('No presets found matching criteria.'));
    return;
  }
  
  presetManager.listPresets();
}

async function createCustomPreset(name, options) {
  const presetManager = new StackPresetManager();
  
  if (!options.modules) {
    console.log(chalk.red('❌ Please specify modules with --modules option'));
    process.exit(1);
  }
  
  const modules = options.modules.split(',').map(m => m.trim());
  const description = options.description || `Custom preset: ${modules.join(', ')}`;
  
  try {
    const preset = presetManager.createCustomPreset(name, description, modules);
    console.log(chalk.green(`✅ Created custom preset: ${preset.name}`));
    console.log(chalk.gray(`ID: ${preset.id}`));
    console.log(chalk.gray(`Modules: ${modules.join(', ')}`));
  } catch (error) {
    console.log(chalk.red(`❌ Failed to create preset: ${error.message}`));
    process.exit(1);
  }
}

function getCategoryIcon(category) {
  const icons = {
    'frontend-framework': '🖼️',
    'ui-library': '🎨', 
    'backend-service': '🔧',
    'auth-provider': '🔐',
    'backend-framework': '⚙️',
    'database': '💾',
    'other': '📦'
  };
  return icons[category] || '📦';
}

function getCategoryName(category) {
  const names = {
    'frontend-framework': 'Frontend Framework',
    'ui-library': 'UI Library',
    'backend-service': 'Backend Service', 
    'auth-provider': 'Authentication',
    'backend-framework': 'Backend Framework',
    'database': 'Database',
    'other': 'Other'
  };
  return names[category] || category;
}

async function searchModules(registry, query, options) {
  const searchOptions = {
    category: options.category,
    limit: parseInt(options.limit) || 10
  };
  
  const results = registry.searchModules(query, searchOptions);
  
  if (results.length === 0) {
    console.log(chalk.gray(`\nNo modules found matching "${query}"`));
    return;
  }
  
  console.log(chalk.blue(`\n🔍 Search results for "${query}":\n`));
  
  for (const module of results) {
    const recommended = module.recommended ? chalk.green(' ⭐') : '';
    const version = chalk.gray(`(v${module.version})`);
    const category = chalk.cyan(`[${getCategoryName(module.category)}]`);
    
    console.log(`${category} ${chalk.green(module.name)} ${version}${recommended}`);
    console.log(chalk.gray(`  ${module.description}`));
    
    if (module.tags && module.tags.length > 0) {
      console.log(chalk.gray(`  Tags: ${module.tags.join(', ')}`));
    }
    console.log('');
  }
}