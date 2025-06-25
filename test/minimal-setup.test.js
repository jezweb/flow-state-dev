#!/usr/bin/env node

/**
 * Test script for minimal setup functionality
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const testDir = path.join(__dirname, 'test-minimal-project');

// Cleanup function
const cleanup = () => {
  if (fs.existsSync(testDir)) {
    fs.removeSync(testDir);
  }
};

// Main test function
const runTests = async () => {
  console.log(chalk.blue('\n🧪 Testing Minimal Setup Functionality\n'));
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Test 1: Create minimal project
    console.log(chalk.yellow('Test 1: Create minimal project'));
    cleanup();
    
    const result = execSync(
      `node ${path.join(rootDir, 'bin/fsd.js')} init test-minimal-project --legacy --no-interactive`,
      {
        cwd: __dirname,
        encoding: 'utf-8',
        env: { ...process.env, FSD_TEST_MODE: 'true', FSD_DEFAULT_FRAMEWORK: 'minimal' }
      }
    );
    
    if (fs.existsSync(testDir)) {
      console.log(chalk.green('✅ Minimal project created successfully'));
      passed++;
    } else {
      console.log(chalk.red('❌ Failed to create minimal project'));
      failed++;
    }
    
    // Test 2: Check file structure
    console.log(chalk.yellow('\nTest 2: Check file structure'));
    const expectedFiles = [
      'package.json',
      'index.html',
      'vite.config.js',
      '.gitignore',
      '.eslintrc.cjs',
      '.prettierrc.json',
      'README.md',
      'CLAUDE.md',
      'src/main.js',
      'src/style.css',
      'docs/CHOOSING_A_FRAMEWORK.md'
    ];
    
    let allFilesExist = true;
    for (const file of expectedFiles) {
      const filePath = path.join(testDir, file);
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`  ❌ Missing: ${file}`));
        allFilesExist = false;
      } else {
        console.log(chalk.green(`  ✅ Found: ${file}`));
      }
    }
    
    if (allFilesExist) {
      console.log(chalk.green('✅ All expected files present'));
      passed++;
    } else {
      console.log(chalk.red('❌ Some files missing'));
      failed++;
    }
    
    // Test 3: Check package.json content
    console.log(chalk.yellow('\nTest 3: Check package.json content'));
    const packageJson = fs.readJsonSync(path.join(testDir, 'package.json'));
    
    const hasExpectedScripts = 
      packageJson.scripts?.dev === 'vite' &&
      packageJson.scripts?.build === 'vite build' &&
      packageJson.scripts?.lint === 'eslint src' &&
      packageJson.scripts?.format === 'prettier --write .';
    
    const hasExpectedDeps = 
      packageJson.devDependencies?.vite &&
      packageJson.devDependencies?.eslint &&
      packageJson.devDependencies?.prettier &&
      !packageJson.devDependencies['@vitejs/plugin-vue']; // Should NOT have Vue plugin
    
    if (hasExpectedScripts && hasExpectedDeps) {
      console.log(chalk.green('✅ package.json configured correctly'));
      passed++;
    } else {
      console.log(chalk.red('❌ package.json has incorrect configuration'));
      failed++;
    }
    
    // Test 4: Check that no framework files exist
    console.log(chalk.yellow('\nTest 4: Check no framework files'));
    const frameworkFiles = [
      'src/App.vue',
      'src/App.jsx',
      'src/App.tsx',
      'src/components',
      'src/views',
      'src/router'
    ];
    
    let noFrameworkFiles = true;
    for (const file of frameworkFiles) {
      const filePath = path.join(testDir, file);
      if (fs.existsSync(filePath)) {
        console.log(chalk.red(`  ❌ Found framework file: ${file}`));
        noFrameworkFiles = false;
      }
    }
    
    if (noFrameworkFiles) {
      console.log(chalk.green('✅ No framework files present (as expected)'));
      passed++;
    } else {
      console.log(chalk.red('❌ Framework files found in minimal setup'));
      failed++;
    }
    
    // Test 5: Test upgrade command
    console.log(chalk.yellow('\nTest 5: Test upgrade --list-frameworks'));
    try {
      const upgradeResult = execSync(
        `node ${path.join(rootDir, 'bin/fsd.js')} upgrade --list-frameworks`,
        { encoding: 'utf-8' }
      );
      
      if (upgradeResult.includes('Vue 3 + Vuetify') || upgradeResult.includes('Available frameworks')) {
        console.log(chalk.green('✅ Upgrade command lists available frameworks'));
        passed++;
      } else {
        console.log(chalk.red('❌ Upgrade command does not list frameworks'));
        failed++;
      }
    } catch (e) {
      console.log(chalk.red('❌ Upgrade command failed'));
      failed++;
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Test error:'), error.message);
    failed++;
  } finally {
    // Cleanup
    cleanup();
  }
  
  // Summary
  console.log(chalk.blue('\n📊 Test Summary'));
  console.log(chalk.green(`  ✅ Passed: ${passed}`));
  console.log(chalk.red(`  ❌ Failed: ${failed}`));
  console.log(chalk.blue(`  📋 Total: ${passed + failed}`));
  
  process.exit(failed > 0 ? 1 : 0);
};

// Run tests
runTests().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});