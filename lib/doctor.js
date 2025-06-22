// Doctor command - diagnostics for Flow State Dev projects
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

// Check result types
const CHECK_PASS = 'pass';
const CHECK_FAIL = 'fail';
const CHECK_WARN = 'warn';

// Icons for different check results
const icons = {
  [CHECK_PASS]: chalk.green('✅'),
  [CHECK_FAIL]: chalk.red('❌'),
  [CHECK_WARN]: chalk.yellow('⚠️')
};

// Diagnostic checks
const checks = [
  {
    name: 'Flow State Dev Project',
    description: 'Check for Flow State Dev project markers',
    check: async (projectPath) => {
      const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
      const claudeSettingsPath = path.join(projectPath, '.claude/settings.json');
      
      if (!await fs.pathExists(claudeMdPath)) {
        return {
          status: CHECK_FAIL,
          message: 'CLAUDE.md not found',
          fix: 'This may not be a Flow State Dev project. Run "fsd init" to create one.'
        };
      }
      
      if (!await fs.pathExists(claudeSettingsPath)) {
        return {
          status: CHECK_WARN,
          message: 'Claude settings not found',
          fix: 'Run "fsd init" again to generate .claude/settings.json'
        };
      }
      
      return {
        status: CHECK_PASS,
        message: 'Valid Flow State Dev project'
      };
    }
  },
  {
    name: 'Node.js Version',
    description: 'Check Node.js version compatibility',
    check: async () => {
      try {
        const nodeVersion = process.version;
        const major = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (major < 18) {
          return {
            status: CHECK_FAIL,
            message: `Node.js ${nodeVersion} is too old`,
            fix: 'Update to Node.js 18 or higher: https://nodejs.org/'
          };
        }
        
        return {
          status: CHECK_PASS,
          message: `Node.js ${nodeVersion}`
        };
      } catch (error) {
        return {
          status: CHECK_FAIL,
          message: 'Could not check Node.js version',
          fix: 'Ensure Node.js is installed: https://nodejs.org/'
        };
      }
    }
  },
  {
    name: 'Dependencies',
    description: 'Check if project dependencies are installed',
    check: async (projectPath) => {
      const nodeModulesPath = path.join(projectPath, 'node_modules');
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (!await fs.pathExists(packageJsonPath)) {
        return {
          status: CHECK_FAIL,
          message: 'package.json not found',
          fix: 'This may not be a valid Node.js project'
        };
      }
      
      if (!await fs.pathExists(nodeModulesPath)) {
        return {
          status: CHECK_FAIL,
          message: 'Dependencies not installed',
          fix: 'Run "npm install" to install project dependencies',
          canAutoFix: true,
          autoFix: async () => {
            console.log(chalk.blue('Running npm install...'));
            execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
          }
        };
      }
      
      // Check if node_modules is up to date
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const packageLockPath = path.join(projectPath, 'package-lock.json');
        
        if (await fs.pathExists(packageLockPath)) {
          const packageLockStat = await fs.stat(packageLockPath);
          const nodeModulesStat = await fs.stat(nodeModulesPath);
          
          if (packageLockStat.mtime > nodeModulesStat.mtime) {
            return {
              status: CHECK_WARN,
              message: 'Dependencies may be out of date',
              fix: 'Run "npm install" to update dependencies',
              canAutoFix: true,
              autoFix: async () => {
                console.log(chalk.blue('Running npm install...'));
                execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
              }
            };
          }
        }
        
        return {
          status: CHECK_PASS,
          message: 'Dependencies installed'
        };
      } catch (error) {
        return {
          status: CHECK_WARN,
          message: 'Could not verify dependency status',
          fix: 'Run "npm install" to ensure dependencies are up to date'
        };
      }
    }
  },
  {
    name: 'Environment Variables',
    description: 'Check Supabase configuration',
    check: async (projectPath) => {
      const envPath = path.join(projectPath, '.env');
      const envExamplePath = path.join(projectPath, '.env.example');
      
      if (!await fs.pathExists(envPath)) {
        if (await fs.pathExists(envExamplePath)) {
          return {
            status: CHECK_FAIL,
            message: '.env file not found',
            fix: 'Copy .env.example to .env and add your Supabase credentials',
            canAutoFix: true,
            autoFix: async () => {
              await fs.copy(envExamplePath, envPath);
              console.log(chalk.green('Created .env file. Please add your Supabase credentials.'));
            }
          };
        }
        return {
          status: CHECK_WARN,
          message: 'No environment configuration',
          fix: 'Create a .env file with your Supabase credentials'
        };
      }
      
      // Check for required variables
      const envContent = await fs.readFile(envPath, 'utf-8');
      const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
      const missingVars = [];
      
      for (const varName of requiredVars) {
        if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
          missingVars.push(varName);
        }
      }
      
      if (missingVars.length > 0) {
        return {
          status: CHECK_WARN,
          message: `Missing Supabase credentials: ${missingVars.join(', ')}`,
          fix: 'Add your Supabase project URL and anon key to .env'
        };
      }
      
      return {
        status: CHECK_PASS,
        message: 'Environment variables configured'
      };
    }
  },
  {
    name: 'Git Repository',
    description: 'Check Git repository status',
    check: async (projectPath) => {
      try {
        // Check if git is initialized
        execSync('git rev-parse --git-dir', { cwd: projectPath, stdio: 'pipe' });
        
        // Check for remote
        try {
          const remoteUrl = execSync('git config --get remote.origin.url', { 
            cwd: projectPath, 
            encoding: 'utf-8' 
          }).trim();
          
          if (remoteUrl) {
            return {
              status: CHECK_PASS,
              message: `Connected to ${remoteUrl}`
            };
          }
        } catch {
          return {
            status: CHECK_WARN,
            message: 'No remote repository configured',
            fix: 'Add a remote with: git remote add origin <repository-url>'
          };
        }
      } catch {
        return {
          status: CHECK_FAIL,
          message: 'Not a git repository',
          fix: 'Initialize git with: git init',
          canAutoFix: true,
          autoFix: async () => {
            execSync('git init', { cwd: projectPath });
            execSync('git branch -m main', { cwd: projectPath });
            console.log(chalk.green('Initialized git repository'));
          }
        };
      }
      
      return {
        status: CHECK_PASS,
        message: 'Git repository configured'
      };
    }
  },
  {
    name: 'Linting Configuration',
    description: 'Check ESLint configuration',
    check: async (projectPath) => {
      const eslintPaths = [
        '.eslintrc.js',
        '.eslintrc.cjs',
        '.eslintrc.json',
        '.eslintrc.yml',
        '.eslintrc.yaml'
      ];
      
      let eslintFound = false;
      for (const eslintPath of eslintPaths) {
        if (await fs.pathExists(path.join(projectPath, eslintPath))) {
          eslintFound = true;
          break;
        }
      }
      
      if (!eslintFound) {
        return {
          status: CHECK_WARN,
          message: 'No ESLint configuration found',
          fix: 'ESLint helps maintain code quality. Consider adding .eslintrc.cjs'
        };
      }
      
      return {
        status: CHECK_PASS,
        message: 'ESLint configured'
      };
    }
  },
  {
    name: 'Build Configuration',
    description: 'Check if project can build',
    check: async (projectPath) => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        
        if (!packageJson.scripts || !packageJson.scripts.build) {
          return {
            status: CHECK_FAIL,
            message: 'No build script found',
            fix: 'Add a build script to package.json'
          };
        }
        
        // Check if Vite is configured
        if (packageJson.devDependencies && packageJson.devDependencies.vite) {
          const viteConfigPath = path.join(projectPath, 'vite.config.js');
          if (!await fs.pathExists(viteConfigPath)) {
            return {
              status: CHECK_WARN,
              message: 'Vite config not found',
              fix: 'Create vite.config.js for custom build configuration'
            };
          }
        }
        
        return {
          status: CHECK_PASS,
          message: 'Build configuration found'
        };
      } catch (error) {
        return {
          status: CHECK_FAIL,
          message: 'Could not check build configuration',
          fix: 'Ensure package.json is valid'
        };
      }
    }
  },
  {
    name: 'Port Availability',
    description: 'Check if development port is available',
    check: async () => {
      const port = 5173; // Default Vite port
      
      try {
        // Try to check if port is in use
        execSync(`lsof -i:${port}`, { stdio: 'pipe' });
        return {
          status: CHECK_WARN,
          message: `Port ${port} is in use`,
          fix: 'Stop other services or use a different port'
        };
      } catch {
        // If lsof fails, the port is likely available
        return {
          status: CHECK_PASS,
          message: `Port ${port} is available`
        };
      }
    }
  }
];

// Run all diagnostic checks
export async function runDoctor(options = {}) {
  const projectPath = process.cwd();
  console.log(chalk.blue('\n🩺 Running Flow State Dev diagnostics...\n'));
  
  const results = [];
  const fixableIssues = [];
  
  // Run each check
  for (const check of checks) {
    process.stdout.write(chalk.gray(`Checking ${check.name}... `));
    
    try {
      const result = await check.check(projectPath);
      results.push({ ...result, check });
      
      // Collect fixable issues
      if (result.canAutoFix && result.status !== CHECK_PASS) {
        fixableIssues.push({ ...result, check });
      }
      
      // Display result
      console.log(`${icons[result.status]} ${result.message}`);
      
      // Show fix instructions if not passing
      if (result.status !== CHECK_PASS && result.fix) {
        console.log(chalk.gray(`   └─ ${result.fix}\n`));
      }
    } catch (error) {
      console.log(`${icons[CHECK_FAIL]} Error: ${error.message}`);
      results.push({
        status: CHECK_FAIL,
        message: `Error: ${error.message}`,
        check
      });
    }
  }
  
  // Summary
  console.log(chalk.blue('\n📊 Diagnostic Summary\n'));
  
  const passed = results.filter(r => r.status === CHECK_PASS).length;
  const failed = results.filter(r => r.status === CHECK_FAIL).length;
  const warnings = results.filter(r => r.status === CHECK_WARN).length;
  
  console.log(chalk.green(`   Passed: ${passed}`));
  if (warnings > 0) console.log(chalk.yellow(`   Warnings: ${warnings}`));
  if (failed > 0) console.log(chalk.red(`   Failed: ${failed}`));
  
  // Auto-fix option
  if (fixableIssues.length > 0 && !options.fix) {
    console.log(chalk.yellow(`\n💡 ${fixableIssues.length} issue(s) can be fixed automatically.`));
    console.log(chalk.gray('   Run "fsd doctor --fix" to apply fixes.\n'));
  }
  
  // Apply fixes if requested
  if (options.fix && fixableIssues.length > 0) {
    console.log(chalk.blue('\n🔧 Applying automatic fixes...\n'));
    
    for (const issue of fixableIssues) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Fix "${issue.check.name}": ${issue.fix}?`,
          default: true
        }
      ]);
      
      if (confirm && issue.autoFix) {
        try {
          await issue.autoFix();
          console.log(chalk.green(`✅ Fixed ${issue.check.name}\n`));
        } catch (error) {
          console.log(chalk.red(`❌ Failed to fix ${issue.check.name}: ${error.message}\n`));
        }
      }
    }
  }
  
  // Overall status
  if (failed === 0 && warnings === 0) {
    console.log(chalk.green.bold('✨ Your project is healthy!\n'));
    return 0;
  } else if (failed === 0) {
    console.log(chalk.yellow.bold('⚠️  Your project has some warnings but should work.\n'));
    return 0;
  } else {
    console.log(chalk.red.bold('❌ Your project has issues that need attention.\n'));
    return 1;
  }
}