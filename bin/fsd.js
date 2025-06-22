#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, '..', 'templates', 'vue-supabase');

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
  .version('0.2.0');

// Init command
program
  .command('init [project-name]')
  .description('Create a new Vue 3 + Supabase project')
  .option('--no-interactive', 'Skip interactive setup')
  .action(async (projectName, options) => {
    console.log(logo);
    
    // If no project name provided, ask for it
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-app',
          validate: (input) => {
            if (/^[a-z0-9-]+$/.test(input)) return true;
            return 'Project name must be lowercase with hyphens only';
          }
        }
      ]);
      projectName = answers.projectName;
    }

    const targetDir = path.join(process.cwd(), projectName);

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
      console.log(chalk.red(`❌ Directory ${projectName} already exists!`));
      process.exit(1);
    }

    console.log(chalk.blue(`\n📁 Creating project: ${projectName}`));

    try {
      // Copy template
      await fs.copy(templateDir, targetDir);

      // Update package.json with project name
      const packageJsonPath = path.join(targetDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = projectName;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      // Update CLAUDE.md with project name
      const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
      let claudeMd = await fs.readFile(claudeMdPath, 'utf-8');
      claudeMd = claudeMd.replace(/\[PROJECT_NAME\]/g, projectName);
      await fs.writeFile(claudeMdPath, claudeMd);

      // Update README.md with project name
      const readmePath = path.join(targetDir, 'README.md');
      let readme = await fs.readFile(readmePath, 'utf-8');
      readme = readme.replace(/\[PROJECT_NAME\]/g, projectName);
      await fs.writeFile(readmePath, readme);

      // Initialize git
      console.log(chalk.blue('\n📝 Initializing git repository...'));
      execSync('git init', { cwd: targetDir });
      execSync('git branch -m main', { cwd: targetDir });

      // Interactive setup (unless --no-interactive flag is used)
      let supabaseConfigured = false;
      let gitHubConfigured = false;
      
      if (options.interactive !== false) {
        console.log(chalk.blue('\n🔧 Let\'s configure your project:\n'));

        // Supabase configuration
        const { configureSupabase } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'configureSupabase',
            message: 'Would you like to configure Supabase now?',
            default: true
          }
        ]);

        if (configureSupabase) {
          supabaseConfigured = true;
          const supabaseAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'supabaseUrl',
              message: 'Supabase project URL:',
              validate: (input) => {
                if (!input) return 'Supabase URL is required';
                if (input.includes('supabase.co')) return true;
                return 'Please enter a valid Supabase URL (e.g., https://xyzabc.supabase.co)';
              }
            },
            {
              type: 'password',
              name: 'supabaseAnonKey',
              message: 'Supabase anon key:',
              validate: (input) => {
                if (!input) return 'Supabase anon key is required';
                return true;
              }
            }
          ]);

          // Create .env file
          const envPath = path.join(targetDir, '.env');
          const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseAnswers.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnswers.supabaseAnonKey}

# App Configuration
VITE_APP_NAME="${projectName}"
VITE_APP_ENV=development
`;
          await fs.writeFile(envPath, envContent);
          console.log(chalk.green('✅ Supabase configured in .env'));
        }

        // GitHub configuration
        const { configureGitHub } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'configureGitHub',
            message: 'Would you like to connect to a GitHub repository?',
            default: true
          }
        ]);

        if (configureGitHub) {
          gitHubConfigured = true;
          const { repoUrl } = await inquirer.prompt([
            {
              type: 'input',
              name: 'repoUrl',
              message: 'GitHub repository URL (optional):',
              validate: (input) => {
                if (!input) return true; // Optional
                if (input.includes('github.com')) return true;
                return 'Please enter a valid GitHub URL (e.g., https://github.com/username/repo)';
              }
            }
          ]);

          if (repoUrl) {
            try {
              execSync(`git remote add origin ${repoUrl}`, { cwd: targetDir });
              console.log(chalk.green('✅ GitHub remote added'));
              
              // Ask about labels
              const { setupLabels } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'setupLabels',
                  message: 'Would you like to set up GitHub labels now?',
                  default: true
                }
              ]);

              if (setupLabels) {
                // Check for GitHub CLI
                try {
                  execSync('gh --version', { stdio: 'ignore' });
                  // Run labels setup
                  console.log(chalk.blue('\n🏷️  Setting up GitHub labels...'));
                  execSync('fsd labels', { cwd: targetDir, stdio: 'inherit' });
                } catch {
                  console.log(chalk.yellow('⚠️  GitHub CLI not installed. You can run "fsd labels" later.'));
                }
              }
            } catch (error) {
              console.log(chalk.yellow('⚠️  Could not add GitHub remote. You can do this manually later.'));
            }
          }
        }
      }

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

    const labels = [
      // Priority
      { name: 'priority:high', color: 'B60205', description: 'Urgent priority' },
      { name: 'priority:medium', color: 'FBCA04', description: 'Medium priority' },
      { name: 'priority:low', color: '0E8A16', description: 'Low priority' },
      
      // Type
      { name: 'bug', color: 'B60205', description: 'Something isn\'t working' },
      { name: 'enhancement', color: '0E8A16', description: 'New feature or request' },
      { name: 'documentation', color: '0075CA', description: 'Documentation improvements' },
      
      // Component
      { name: 'frontend', color: '7057FF', description: 'Frontend work' },
      { name: 'backend', color: '7057FF', description: 'Backend work' },
      { name: 'database', color: '7057FF', description: 'Database related' },
      
      // Human tasks
      { name: 'human-task', color: 'FBCA04', description: 'Requires human intervention' },
      { name: 'config', color: 'FBCA04', description: 'Configuration needed' },
      { name: 'deploy', color: 'FBCA04', description: 'Deployment task' },
      
      // Status
      { name: 'blocked', color: 'B60205', description: 'Blocked by something' },
      { name: 'ready-for-review', color: '0E8A16', description: 'Ready for review' },
      { name: 'in-progress', color: '0075CA', description: 'Currently being worked on' }
    ];

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