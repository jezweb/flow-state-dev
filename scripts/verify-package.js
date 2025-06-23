#!/usr/bin/env node

/**
 * Pre-publish verification script
 * Ensures package is correctly configured before publishing to npm
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Verification results
const results = {
  passed: [],
  warnings: [],
  errors: []
};

function log(type, message) {
  results[type].push(message);
  switch (type) {
    case 'passed':
      console.log(chalk.green(`✅ ${message}`));
      break;
    case 'warnings':
      console.log(chalk.yellow(`⚠️  ${message}`));
      break;
    case 'errors':
      console.log(chalk.red(`❌ ${message}`));
      break;
  }
}

async function verifyPackageJson() {
  console.log(chalk.blue('\n📋 Verifying package.json...\n'));
  
  try {
    const packageJson = await fs.readJson(path.join(rootDir, 'package.json'));
    
    // Required fields
    const requiredFields = ['name', 'version', 'description', 'bin', 'main', 'type', 'engines'];
    for (const field of requiredFields) {
      if (packageJson[field]) {
        log('passed', `Required field '${field}' present`);
      } else {
        log('errors', `Missing required field '${field}'`);
      }
    }
    
    // Verify bin configuration
    if (packageJson.bin && packageJson.bin.fsd) {
      const binPath = path.join(rootDir, packageJson.bin.fsd);
      if (await fs.pathExists(binPath)) {
        log('passed', `Bin file exists: ${packageJson.bin.fsd}`);
        
        // Check if executable
        const stats = await fs.stat(binPath);
        if (process.platform !== 'win32' && (stats.mode & 0o111)) {
          log('passed', 'Bin file is executable');
        } else if (process.platform === 'win32') {
          log('passed', 'Bin file ready (Windows)');
        } else {
          log('errors', 'Bin file is not executable');
        }
      } else {
        log('errors', `Bin file not found: ${packageJson.bin.fsd}`);
      }
    }
    
    // Verify version format
    if (/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
      log('passed', `Valid version format: ${packageJson.version}`);
    } else {
      log('errors', `Invalid version format: ${packageJson.version}`);
    }
    
    // Check files field
    if (packageJson.files && Array.isArray(packageJson.files)) {
      log('passed', `Files field configured with ${packageJson.files.length} entries`);
    } else {
      log('warnings', 'No files field in package.json - all files will be included');
    }
    
  } catch (error) {
    log('errors', `Failed to read package.json: ${error.message}`);
  }
}

async function verifyRequiredFiles() {
  console.log(chalk.blue('\n📁 Verifying required files...\n'));
  
  const requiredFiles = [
    'README.md',
    'LICENSE',
    'package.json',
    'bin/fsd.js',
    'lib/frameworks.js',
    'lib/onboarding/index.js',
    'templates/vue-vuetify/package.json',
    'setup/github-labels.json',
    'scripts/post-install.cjs'
  ];
  
  const requiredDirs = [
    'bin',
    'lib',
    'templates',
    'setup',
    'scripts'
  ];
  
  // Check directories
  for (const dir of requiredDirs) {
    const dirPath = path.join(rootDir, dir);
    if (await fs.pathExists(dirPath)) {
      const stats = await fs.stat(dirPath);
      if (stats.isDirectory()) {
        log('passed', `Required directory exists: ${dir}/`);
      } else {
        log('errors', `${dir} exists but is not a directory`);
      }
    } else {
      log('errors', `Required directory missing: ${dir}/`);
    }
  }
  
  // Check files
  for (const file of requiredFiles) {
    const filePath = path.join(rootDir, file);
    if (await fs.pathExists(filePath)) {
      log('passed', `Required file exists: ${file}`);
    } else {
      log('errors', `Required file missing: ${file}`);
    }
  }
}

async function verifyDependencies() {
  console.log(chalk.blue('\n📦 Verifying dependencies...\n'));
  
  try {
    const packageJson = await fs.readJson(path.join(rootDir, 'package.json'));
    
    // Check if dependencies are specified
    if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
      log('passed', `${Object.keys(packageJson.dependencies).length} dependencies specified`);
      
      // Verify critical dependencies
      const criticalDeps = ['commander', 'chalk', 'inquirer', 'fs-extra'];
      for (const dep of criticalDeps) {
        if (packageJson.dependencies[dep]) {
          log('passed', `Critical dependency present: ${dep}`);
        } else {
          log('errors', `Missing critical dependency: ${dep}`);
        }
      }
    } else {
      log('errors', 'No dependencies specified');
    }
    
    // Check for devDependencies in dependencies
    if (packageJson.devDependencies) {
      const devDeps = Object.keys(packageJson.devDependencies);
      const deps = Object.keys(packageJson.dependencies || {});
      const overlap = devDeps.filter(d => deps.includes(d));
      
      if (overlap.length > 0) {
        log('warnings', `DevDependencies found in dependencies: ${overlap.join(', ')}`);
      }
    }
    
  } catch (error) {
    log('errors', `Failed to verify dependencies: ${error.message}`);
  }
}

async function verifyPackageSize() {
  console.log(chalk.blue('\n📏 Checking package size...\n'));
  
  try {
    // Run npm pack --dry-run to check what will be included
    const packOutput = execSync('npm pack --dry-run --json', {
      cwd: rootDir,
      encoding: 'utf-8'
    });
    
    const packInfo = JSON.parse(packOutput);
    const files = packInfo[0].files;
    let totalSize = 0;
    
    for (const file of files) {
      totalSize += file.size;
    }
    
    const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
    log('passed', `Package size: ${sizeMB} MB (${files.length} files)`);
    
    // Warn if package is too large
    if (totalSize > 10 * 1024 * 1024) { // 10MB
      log('warnings', `Package size is large (${sizeMB} MB) - consider optimizing`);
    }
    
    // Check for common issues
    const suspiciousFiles = files.filter(f => 
      f.path.includes('node_modules') || 
      f.path.includes('.git') ||
      f.path.includes('.env') ||
      f.path.includes('test/') ||
      f.path.includes('tests/')
    );
    
    if (suspiciousFiles.length > 0) {
      log('warnings', `Suspicious files in package: ${suspiciousFiles.map(f => f.path).join(', ')}`);
    }
    
  } catch (error) {
    log('warnings', `Could not determine package size: ${error.message}`);
  }
}

async function verifyCommands() {
  console.log(chalk.blue('\n🧪 Testing commands...\n'));
  
  try {
    // Test version command
    const version = execSync('node bin/fsd.js --version', {
      cwd: rootDir,
      encoding: 'utf-8'
    }).trim();
    
    if (version) {
      log('passed', `Version command works: ${version}`);
    } else {
      log('errors', 'Version command returned empty output');
    }
    
    // Test help command
    const help = execSync('node bin/fsd.js --help', {
      cwd: rootDir,
      encoding: 'utf-8'
    });
    
    if (help.includes('Flow State Dev')) {
      log('passed', 'Help command works correctly');
    } else {
      log('errors', 'Help command output incorrect');
    }
    
  } catch (error) {
    log('errors', `Command test failed: ${error.message}`);
  }
}

async function checkGitStatus() {
  console.log(chalk.blue('\n🔍 Checking git status...\n'));
  
  try {
    // Check for uncommitted changes
    const status = execSync('git status --porcelain', {
      cwd: rootDir,
      encoding: 'utf-8'
    }).trim();
    
    if (status) {
      log('warnings', 'Uncommitted changes detected - ensure all changes are committed before publishing');
    } else {
      log('passed', 'No uncommitted changes');
    }
    
    // Check if on main branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: rootDir,
      encoding: 'utf-8'
    }).trim();
    
    if (branch === 'main' || branch === 'master') {
      log('passed', `On main branch: ${branch}`);
    } else {
      log('warnings', `Not on main branch (current: ${branch})`);
    }
    
  } catch (error) {
    log('warnings', `Could not check git status: ${error.message}`);
  }
}

async function runVerification() {
  console.log(chalk.cyan(`
╔═╗┬  ┌─┐┬ ┬  ╔═╗┌┬┐┌─┐┌┬┐┌─┐  ╔╦╗┌─┐┬  ┬
╠╣ │  │ ││││  ╚═╗ │ ├─┤ │ ├┤    ║║├┤ └┐┌┘
╚  ┴─┘└─┘└┴┘  ╚═╝ ┴ ┴ ┴ ┴ └─┘  ═╩╝└─┘ └┘ 
`));
  
  console.log(chalk.blue('🔍 Pre-publish Package Verification\n'));
  
  // Run all verifications
  await verifyPackageJson();
  await verifyRequiredFiles();
  await verifyDependencies();
  await verifyPackageSize();
  await verifyCommands();
  await checkGitStatus();
  
  // Summary
  console.log(chalk.blue('\n📊 Verification Summary\n'));
  console.log(chalk.green(`✅ Passed: ${results.passed.length}`));
  console.log(chalk.yellow(`⚠️  Warnings: ${results.warnings.length}`));
  console.log(chalk.red(`❌ Errors: ${results.errors.length}`));
  
  if (results.errors.length > 0) {
    console.log(chalk.red('\n❌ Verification FAILED - Fix errors before publishing:'));
    results.errors.forEach(error => console.log(chalk.red(`   • ${error}`)));
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Verification passed with warnings:'));
    results.warnings.forEach(warning => console.log(chalk.yellow(`   • ${warning}`)));
    console.log(chalk.blue('\nConsider addressing warnings before publishing.'));
  } else {
    console.log(chalk.green('\n✅ All verifications passed! Package is ready to publish.'));
  }
}

// Run verification
runVerification().catch(error => {
  console.error(chalk.red('\n❌ Verification script error:'), error);
  process.exit(1);
});