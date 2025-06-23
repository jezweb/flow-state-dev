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
  .version('0.4.0');

// Init command
program
  .command('init [project-name]')
  .description('Create a new project with your choice of framework')
  .option('--no-interactive', 'Skip interactive setup')
  .option('--here', 'Create project in current directory')
  .option('--subfolder', 'Create project in subfolder (default)')
  .option('--force', 'Skip safety confirmations (use with caution)')
  .action(async (projectName, options) => {
    console.log(logo);
    
    try {
      await legacyOnboarding(projectName, options);
    } catch (error) {
      console.error(chalk.red('❌ Error creating project:'), error.message);
      process.exit(1);
    }
  });

// Labels command
program
  .command('labels')
  .description('Set up GitHub labels for the current repository')
  .action(async () => {
    console.log(logo);
    console.log(chalk.blue('\n🏷️  Setting up GitHub labels...\n'));

    // Check if we're in a git repo
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch {
      console.error(chalk.red('❌ Not in a git repository!'));
      console.log(chalk.gray('Please run this command from within your project directory.'));
      process.exit(1);
    }

    // Check for GitHub remote
    try {
      const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
      if (!remoteUrl.includes('github.com')) {
        console.error(chalk.red('❌ No GitHub remote found!'));
        console.log(chalk.gray('Please add your GitHub repository as origin first.'));
        process.exit(1);
      }
    } catch {
      console.error(chalk.red('❌ No remote origin found!'));
      console.log(chalk.gray('Please add your GitHub repository as origin first.'));
      process.exit(1);
    }

    // Get GitHub repo info
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);
    
    if (!match) {
      console.error(chalk.red('❌ Could not parse GitHub repository URL'));
      process.exit(1);
    }

    const owner = match[1];
    const repo = match[2];

    console.log(chalk.gray(`Repository: ${owner}/${repo}\n`));

    // Check for GitHub CLI
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch {
      console.error(chalk.red('❌ GitHub CLI (gh) is not installed!'));
      console.log(chalk.white('\nTo install GitHub CLI:'));
      console.log(chalk.gray('  • Ubuntu/Debian: sudo apt install gh'));
      console.log(chalk.gray('  • macOS: brew install gh'));
      console.log(chalk.gray('  • Or visit: https://cli.github.com/\n'));
      process.exit(1);
    }

    // Check if authenticated
    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch {
      console.error(chalk.red('❌ Not authenticated with GitHub!'));
      console.log(chalk.white('\nPlease run:'));
      console.log(chalk.gray('  gh auth login\n'));
      process.exit(1);
    }

    // Load labels from JSON file
    const labelsPath = path.join(__dirname, '..', 'setup', 'github-labels.json');
    const labels = await fs.readJson(labelsPath);

    console.log(chalk.white('Creating labels:\n'));

    for (const label of labels) {
      try {
        // Try to create the label
        execSync(
          `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`,
          { stdio: 'ignore' }
        );
        console.log(chalk.green(`✅ ${label.name}`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  ${label.name} (may already exist)`));
      }
    }

    console.log(chalk.green('\n✅ GitHub labels setup complete!\n'));
    console.log(chalk.gray('You can now create issues with consistent labels across all your projects.'));
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