#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync, spawn } from 'child_process';
import fs from 'fs-extra';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const testDir = join(rootDir, 'test-output');

// Test configuration
const tests = {
  basic: {
    name: 'Basic Non-Interactive Init',
    run: async () => {
      const projectName = 'test-basic';
      const projectPath = join(testDir, projectName);
      
      // Clean up if exists
      await fs.remove(projectPath);
      
      // Run init command
      execSync(`node ${join(rootDir, 'bin/fsd.js')} init ${projectName} --no-interactive`, {
        cwd: testDir,
        stdio: 'inherit'
      });
      
      // Verify project structure
      const checks = [
        { path: 'package.json', type: 'file' },
        { path: 'CLAUDE.md', type: 'file' },
        { path: '.claude/settings.json', type: 'file' },
        { path: '.gitignore', type: 'file' },
        { path: '.eslintrc.cjs', type: 'file' },
        { path: 'src/main.js', type: 'file' },
        { path: '.git', type: 'dir' }
      ];
      
      for (const check of checks) {
        const fullPath = join(projectPath, check.path);
        const exists = await fs.pathExists(fullPath);
        if (!exists) {
          throw new Error(`Missing ${check.type}: ${check.path}`);
        }
      }
      
      // Verify project name was replaced
      const packageJson = await fs.readJson(join(projectPath, 'package.json'));
      if (packageJson.name !== projectName) {
        throw new Error(`Project name not updated in package.json`);
      }
      
      return true;
    }
  },
  
  interactive: {
    name: 'Interactive Init with Supabase',
    run: async () => {
      const projectName = 'test-interactive';
      const projectPath = join(testDir, projectName);
      
      // Clean up if exists
      await fs.remove(projectPath);
      
      // Create interactive test script
      const testScript = `
const { spawn } = require('child_process');
const path = require('path');

const fsd = spawn('node', [path.join('${rootDir}', 'bin/fsd.js'), 'init'], {
  cwd: '${testDir}'
});

let step = 0;
const responses = [
  '${projectName}\\n',  // Project name
  'Y\\n',               // Configure Supabase?
  'https://test.supabase.co\\n',  // Supabase URL
  'test-anon-key\\n',   // Supabase anon key
  'N\\n'                // Configure GitHub?
];

fsd.stdout.on('data', (data) => {
  console.log(data.toString());
  if (step < responses.length) {
    setTimeout(() => {
      fsd.stdin.write(responses[step]);
      step++;
    }, 100);
  }
});

fsd.on('close', (code) => {
  process.exit(code);
});
`;
      
      await fs.writeFile(join(testDir, 'interactive-test.js'), testScript);
      
      // Run interactive test
      execSync(`node interactive-test.js`, {
        cwd: testDir,
        stdio: 'inherit'
      });
      
      // Verify .env was created
      const envPath = join(projectPath, '.env');
      const envExists = await fs.pathExists(envPath);
      if (!envExists) {
        throw new Error('.env file was not created');
      }
      
      // Verify .env contents
      const envContent = await fs.readFile(envPath, 'utf-8');
      if (!envContent.includes('VITE_SUPABASE_URL=https://test.supabase.co')) {
        throw new Error('.env file does not contain Supabase URL');
      }
      
      // Clean up test script
      await fs.remove(join(testDir, 'interactive-test.js'));
      
      return true;
    }
  },
  
  gitignore: {
    name: 'Gitignore Functionality',
    run: async () => {
      const projectName = 'test-gitignore';
      const projectPath = join(testDir, projectName);
      
      await fs.remove(projectPath);
      
      execSync(`node ${join(rootDir, 'bin/fsd.js')} init ${projectName} --no-interactive`, {
        cwd: testDir,
        stdio: 'inherit'
      });
      
      // Create test files that should be ignored
      await fs.ensureDir(join(projectPath, 'node_modules'));
      await fs.writeFile(join(projectPath, '.env'), 'SECRET=test');
      await fs.writeFile(join(projectPath, '.DS_Store'), '');
      
      // Run git status and check if files are ignored
      const gitStatus = execSync('git status --porcelain', {
        cwd: projectPath,
        encoding: 'utf-8'
      });
      
      if (gitStatus.includes('node_modules')) {
        throw new Error('node_modules is not being ignored');
      }
      if (gitStatus.includes('.env')) {
        throw new Error('.env is not being ignored');
      }
      if (gitStatus.includes('.DS_Store')) {
        throw new Error('.DS_Store is not being ignored');
      }
      
      return true;
    }
  },
  
  claudeSettings: {
    name: 'Claude Code Settings',
    run: async () => {
      const projectName = 'test-claude';
      const projectPath = join(testDir, projectName);
      
      await fs.remove(projectPath);
      
      execSync(`node ${join(rootDir, 'bin/fsd.js')} init ${projectName} --no-interactive`, {
        cwd: testDir,
        stdio: 'inherit'
      });
      
      // Verify Claude settings exist and have correct structure
      const settingsPath = join(projectPath, '.claude/settings.json');
      const settings = await fs.readJson(settingsPath);
      
      if (!settings.permissions) {
        throw new Error('Claude settings missing permissions object');
      }
      
      if (!Array.isArray(settings.permissions.allow)) {
        throw new Error('Claude settings missing allow array');
      }
      
      // Check for key permissions
      const requiredPermissions = [
        'Bash(npm install)',
        'Bash(git status)',
        'WebFetch(domain:github.com)'
      ];
      
      for (const perm of requiredPermissions) {
        if (!settings.permissions.allow.includes(perm)) {
          throw new Error(`Missing required permission: ${perm}`);
        }
      }
      
      return true;
    }
  },
  
  npmInstall: {
    name: 'NPM Install and Build',
    run: async () => {
      const projectName = 'test-npm';
      const projectPath = join(testDir, projectName);
      
      await fs.remove(projectPath);
      
      execSync(`node ${join(rootDir, 'bin/fsd.js')} init ${projectName} --no-interactive`, {
        cwd: testDir,
        stdio: 'inherit'
      });
      
      console.log(chalk.blue('Running npm install (this may take a moment)...'));
      
      // Run npm install
      execSync('npm install', {
        cwd: projectPath,
        stdio: 'inherit'
      });
      
      // Verify node_modules exists
      const nodeModulesExists = await fs.pathExists(join(projectPath, 'node_modules'));
      if (!nodeModulesExists) {
        throw new Error('npm install did not create node_modules');
      }
      
      // Try to build
      console.log(chalk.blue('Running npm run build...'));
      execSync('npm run build', {
        cwd: projectPath,
        stdio: 'inherit'
      });
      
      // Verify dist exists
      const distExists = await fs.pathExists(join(projectPath, 'dist'));
      if (!distExists) {
        throw new Error('npm run build did not create dist folder');
      }
      
      return true;
    }
  }
};

// Test runner
async function runTests() {
  console.log(chalk.cyan.bold('\n🧪 Flow State Dev Test Suite\n'));
  
  // Ensure test directory exists
  await fs.ensureDir(testDir);
  
  const results = {
    passed: 0,
    failed: 0,
    errors: []
  };
  
  for (const [key, test] of Object.entries(tests)) {
    console.log(chalk.blue(`Running: ${test.name}`));
    
    try {
      await test.run();
      console.log(chalk.green(`✅ ${test.name}\n`));
      results.passed++;
    } catch (error) {
      console.log(chalk.red(`❌ ${test.name}`));
      console.log(chalk.red(`   Error: ${error.message}\n`));
      results.failed++;
      results.errors.push({ test: test.name, error: error.message });
    }
  }
  
  // Summary
  console.log(chalk.cyan.bold('\n📊 Test Summary\n'));
  console.log(chalk.green(`Passed: ${results.passed}`));
  console.log(chalk.red(`Failed: ${results.failed}`));
  
  if (results.failed > 0) {
    console.log(chalk.red('\n❌ Failed Tests:'));
    results.errors.forEach(({ test, error }) => {
      console.log(chalk.red(`   ${test}: ${error}`));
    });
    process.exit(1);
  } else {
    console.log(chalk.green.bold('\n✅ All tests passed!'));
    
    // Clean up test output
    console.log(chalk.gray('\nCleaning up test files...'));
    await fs.remove(testDir);
  }
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red('Test runner error:'), error);
  process.exit(1);
});