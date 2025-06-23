#!/usr/bin/env node

/**
 * Test local installation of the package
 * Simulates what users will experience when installing from npm
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const testResults = {
  passed: [],
  failed: []
};

function log(success, message) {
  if (success) {
    testResults.passed.push(message);
    console.log(chalk.green(`✅ ${message}`));
  } else {
    testResults.failed.push(message);
    console.log(chalk.red(`❌ ${message}`));
  }
}

function runCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (options.allowFailure) {
      return null;
    }
    throw error;
  }
}

async function createTestEnvironment() {
  console.log(chalk.blue('\n🏗️  Creating test environment...\n'));
  
  // Create temporary directory
  const tempDir = path.join(os.tmpdir(), `fsd-test-${Date.now()}`);
  await fs.ensureDir(tempDir);
  
  console.log(chalk.gray(`Test directory: ${tempDir}`));
  
  return tempDir;
}

async function packPackage() {
  console.log(chalk.blue('\n📦 Packing package...\n'));
  
  try {
    // Pack the package
    const packOutput = runCommand('npm pack', {
      cwd: rootDir,
      silent: true
    }).trim();
    
    const tarballName = packOutput.split('\n').pop();
    const tarballPath = path.join(rootDir, tarballName);
    
    log(true, `Package packed: ${tarballName}`);
    
    return tarballPath;
  } catch (error) {
    log(false, `Failed to pack package: ${error.message}`);
    throw error;
  }
}

async function testGlobalInstallation(tarballPath, tempDir) {
  console.log(chalk.blue('\n🌍 Testing global installation...\n'));
  
  try {
    // Create a test npm prefix
    const testPrefix = path.join(tempDir, 'npm-global');
    await fs.ensureDir(testPrefix);
    
    // Install globally in test prefix
    console.log(chalk.gray('Installing package globally...'));
    runCommand(`npm install -g ${tarballPath} --prefix="${testPrefix}"`, {
      silent: false
    });
    
    log(true, 'Global installation successful');
    
    // Check if binary exists
    const binPath = path.join(testPrefix, process.platform === 'win32' ? 'fsd.cmd' : 'bin/fsd');
    if (await fs.pathExists(binPath)) {
      log(true, 'Binary file created');
      
      // Test version command
      const version = runCommand(`"${binPath}" --version`, {
        silent: true,
        allowFailure: true
      });
      
      if (version) {
        log(true, `Version command works: ${version.trim()}`);
      } else {
        log(false, 'Version command failed');
      }
    } else {
      log(false, 'Binary file not found after installation');
    }
    
    return testPrefix;
  } catch (error) {
    log(false, `Global installation failed: ${error.message}`);
    return null;
  }
}

async function testLocalInstallation(tarballPath, tempDir) {
  console.log(chalk.blue('\n📁 Testing local installation...\n'));
  
  const testProject = path.join(tempDir, 'test-project');
  await fs.ensureDir(testProject);
  
  try {
    // Initialize a test project
    await fs.writeJson(path.join(testProject, 'package.json'), {
      name: 'test-project',
      version: '1.0.0',
      description: 'Test project for Flow State Dev'
    });
    
    // Install locally
    console.log(chalk.gray('Installing package locally...'));
    runCommand(`npm install ${tarballPath}`, {
      cwd: testProject,
      silent: false
    });
    
    log(true, 'Local installation successful');
    
    // Check if it was installed
    const nodeModulesPath = path.join(testProject, 'node_modules', 'flow-state-dev');
    if (await fs.pathExists(nodeModulesPath)) {
      log(true, 'Package installed in node_modules');
      
      // Test using npx
      const npxVersion = runCommand('npx fsd --version', {
        cwd: testProject,
        silent: true,
        allowFailure: true
      });
      
      if (npxVersion) {
        log(true, `npx command works: ${npxVersion.trim()}`);
      } else {
        log(false, 'npx command failed');
      }
    } else {
      log(false, 'Package not found in node_modules');
    }
    
    return testProject;
  } catch (error) {
    log(false, `Local installation failed: ${error.message}`);
    return null;
  }
}

async function testCommands(installPath, isGlobal = false) {
  console.log(chalk.blue(`\n🧪 Testing commands (${isGlobal ? 'global' : 'local'})...\n`));
  
  const commands = [
    { cmd: '--version', expect: 'version number' },
    { cmd: '--help', expect: 'help text' },
    { cmd: 'help', expect: 'help text' },
    { cmd: 'doctor --help', expect: 'doctor help' },
    { cmd: 'memory --help', expect: 'memory help' },
    { cmd: 'security --help', expect: 'security help' }
  ];
  
  for (const test of commands) {
    try {
      let cmdPath;
      if (isGlobal) {
        cmdPath = path.join(installPath, process.platform === 'win32' ? 'fsd.cmd' : 'bin/fsd');
      } else {
        cmdPath = 'npx fsd';
      }
      
      const output = runCommand(`${cmdPath} ${test.cmd}`, {
        cwd: isGlobal ? installPath : installPath,
        silent: true,
        allowFailure: true
      });
      
      if (output) {
        log(true, `Command 'fsd ${test.cmd}' returns ${test.expect}`);
      } else {
        log(false, `Command 'fsd ${test.cmd}' failed`);
      }
    } catch (error) {
      log(false, `Command 'fsd ${test.cmd}' error: ${error.message}`);
    }
  }
}

async function testProjectCreation(installPath, tempDir, isGlobal = false) {
  console.log(chalk.blue(`\n🚀 Testing project creation (${isGlobal ? 'global' : 'local'})...\n`));
  
  const testAppName = 'test-vue-app';
  const testAppPath = path.join(tempDir, testAppName);
  
  try {
    let cmdPath;
    if (isGlobal) {
      cmdPath = path.join(installPath, process.platform === 'win32' ? 'fsd.cmd' : 'bin/fsd');
    } else {
      cmdPath = 'npx fsd';
    }
    
    // Test non-interactive project creation
    console.log(chalk.gray(`Creating test project: ${testAppName}`));
    runCommand(`${cmdPath} init ${testAppName} --no-interactive`, {
      cwd: tempDir,
      silent: false,
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    // Check if project was created
    if (await fs.pathExists(testAppPath)) {
      log(true, 'Test project created successfully');
      
      // Check for key files
      const keyFiles = [
        'package.json',
        'README.md',
        'CLAUDE.md',
        '.env.example',
        'src/main.js',
        'src/App.vue'
      ];
      
      for (const file of keyFiles) {
        const filePath = path.join(testAppPath, file);
        if (await fs.pathExists(filePath)) {
          log(true, `Key file exists: ${file}`);
        } else {
          log(false, `Key file missing: ${file}`);
        }
      }
    } else {
      log(false, 'Test project directory not created');
    }
  } catch (error) {
    log(false, `Project creation failed: ${error.message}`);
  }
}

async function cleanup(tempDir, tarballPath) {
  console.log(chalk.blue('\n🧹 Cleaning up...\n'));
  
  try {
    // Remove temporary directory
    if (tempDir && await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
      console.log(chalk.gray(`Removed: ${tempDir}`));
    }
    
    // Remove tarball
    if (tarballPath && await fs.pathExists(tarballPath)) {
      await fs.remove(tarballPath);
      console.log(chalk.gray(`Removed: ${path.basename(tarballPath)}`));
    }
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Cleanup warning: ${error.message}`));
  }
}

async function runTests() {
  console.log(chalk.cyan(`
╔═╗┬  ┌─┐┬ ┬  ╔═╗┌┬┐┌─┐┌┬┐┌─┐  ╔╦╗┌─┐┬  ┬
╠╣ │  │ ││││  ╚═╗ │ ├─┤ │ ├┤    ║║├┤ └┐┌┘
╚  ┴─┘└─┘└┴┘  ╚═╝ ┴ ┴ ┴ ┴ └─┘  ═╩╝└─┘ └┘ 
`));
  
  console.log(chalk.blue('🧪 Local Installation Test\n'));
  
  let tempDir, tarballPath;
  
  try {
    // Create test environment
    tempDir = await createTestEnvironment();
    
    // Pack the package
    tarballPath = await packPackage();
    
    // Test global installation
    const globalInstallPath = await testGlobalInstallation(tarballPath, tempDir);
    if (globalInstallPath) {
      await testCommands(globalInstallPath, true);
      await testProjectCreation(globalInstallPath, tempDir, true);
    }
    
    // Test local installation
    const localInstallPath = await testLocalInstallation(tarballPath, tempDir);
    if (localInstallPath) {
      await testCommands(localInstallPath, false);
      await testProjectCreation(localInstallPath, tempDir, false);
    }
    
    // Summary
    console.log(chalk.blue('\n📊 Test Summary\n'));
    console.log(chalk.green(`✅ Passed: ${testResults.passed.length}`));
    console.log(chalk.red(`❌ Failed: ${testResults.failed.length}`));
    
    if (testResults.failed.length > 0) {
      console.log(chalk.red('\n❌ Some tests failed:'));
      testResults.failed.forEach(failure => console.log(chalk.red(`   • ${failure}`)));
      process.exit(1);
    } else {
      console.log(chalk.green('\n✅ All installation tests passed!'));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Test error:'), error);
    process.exit(1);
  } finally {
    // Always cleanup
    await cleanup(tempDir, tarballPath);
  }
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red('\n❌ Test script error:'), error);
  process.exit(1);
});