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
import { SecurityScanner } from '../lib/security-scanner.js';
import { runSetupLocal } from '../lib/setup-local.js';
import { executeSupabaseCommand } from '../lib/supabase-commands.js';
import { generateStore } from '../lib/generate-store.js';
import { labelsManager } from '../lib/labels-manager.js';
import { executeSlashCommand } from '../lib/slash-commands.js';
import { ProjectRetrofitEngine, executeRollback, listBackups } from '../lib/project-retrofit.js';

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
  .version('0.12.0');

// Init command
program
  .command('init [project-name]')
  .description('Create a new project with your choice of framework')
  .option('--no-interactive', 'Skip interactive setup')
  .option('--here', 'Create project in current directory')
  .option('--subfolder', 'Create project in subfolder (default)')
  .option('--force', 'Skip safety confirmations (use with caution)')
  .option('--memory', 'Set up Claude memory file during initialization')
  .option('--no-memory', 'Skip memory file setup')
  .action(async (projectName, options) => {
    console.log(logo);
    
    try {
      await legacyOnboarding(projectName, options);
    } catch (error) {
      console.error(chalk.red('❌ Error creating project:'), error.message);
      process.exit(1);
    }
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
  .option('--rollback <backup-id>', 'Rollback to previous backup')
  .option('--list-backups', 'Show available backups')
  .option('--force', 'Skip confirmations (dangerous)')
  .option('--auto-rollback', 'Automatically rollback on failure')
  .action(async (options) => {
    console.log(logo);
    
    try {
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

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(logo);
    program.outputHelp();
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(logo);
  program.outputHelp();
}