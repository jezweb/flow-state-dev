#!/usr/bin/env node

// Flow State Dev Installation Diagnostic Tool (Node.js version)
// Usage: node -e "$(curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.js)"

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function checkFileExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK | fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

console.log('🔍 Flow State Dev Installation Diagnostics (Node.js)');
console.log('=====================================================');
console.log();

// System information
console.log('📋 System Information:');
console.log(`Platform: ${os.platform()} ${os.release()}`);
console.log(`Architecture: ${os.arch()}`);
console.log(`Node.js: ${process.version}`);
console.log(`User: ${os.userInfo().username}`);
console.log();

// Environment variables
console.log('🌍 Environment:');
console.log(`HOME: ${os.homedir()}`);
console.log(`PWD: ${process.cwd()}`);
console.log(`PATH: ${process.env.PATH?.split(path.delimiter).length || 0} directories`);
console.log();

// npm information
console.log('📦 npm Information:');
const npmVersion = run('npm --version');
const npmPrefix = run('npm config get prefix');
const npmBin = run('npm bin -g');
const npmCache = run('npm config get cache');

console.log(`npm version: ${npmVersion || 'NOT FOUND'}`);
console.log(`npm prefix: ${npmPrefix || 'NOT FOUND'}`);
console.log(`npm global bin: ${npmBin || 'NOT FOUND'}`);
console.log(`npm cache: ${npmCache || 'NOT FOUND'}`);
console.log();

// PATH analysis
console.log('🛤️  PATH Analysis:');
if (npmBin) {
  const pathDirs = process.env.PATH?.split(path.delimiter) || [];
  const npmBinInPath = pathDirs.includes(npmBin);
  
  console.log(`npm bin directory: ${npmBin}`);
  console.log(`In PATH: ${npmBinInPath ? '✅ YES' : '❌ NO'}`);
  
  if (!npmBinInPath) {
    console.log('PATH directories containing "npm":');
    pathDirs
      .filter(dir => dir.includes('npm'))
      .forEach(dir => console.log(`  ${dir}`));
  }
} else {
  console.log('❌ Could not determine npm bin directory');
}
console.log();

// Flow State Dev installation check
console.log('📱 Flow State Dev Installation:');
const fsdInstalled = run('npm list -g flow-state-dev');
if (fsdInstalled) {
  console.log('✅ Package installed globally');
  // Extract version from npm list output
  const versionMatch = fsdInstalled.match(/flow-state-dev@([\d.]+)/);
  if (versionMatch) {
    console.log(`Version: ${versionMatch[1]}`);
  }
} else {
  console.log('❌ Package NOT installed globally');
}

// Command availability
const fsdCommand = run('which fsd') || run('where fsd');
console.log(`fsd command: ${fsdCommand ? '✅ ' + fsdCommand : '❌ NOT FOUND'}`);

// Test fsd command
if (fsdCommand) {
  const fsdVersion = run('fsd --version');
  console.log(`fsd version: ${fsdVersion || 'FAILED TO GET VERSION'}`);
}

// Bin file check
if (npmBin) {
  const binFile = path.join(npmBin, 'fsd');
  const binFileExists = checkFileExists(binFile);
  const binFileExecutable = checkFileExecutable(binFile);
  
  console.log(`Bin file exists: ${binFileExists ? '✅ YES' : '❌ NO'} (${binFile})`);
  
  if (binFileExists) {
    console.log(`Bin file executable: ${binFileExecutable ? '✅ YES' : '❌ NO'}`);
    
    // Get file stats
    try {
      const stats = fs.statSync(binFile);
      console.log(`File size: ${stats.size} bytes`);
      console.log(`Modified: ${stats.mtime.toISOString()}`);
      
      // Check permissions (Unix-like systems)
      if (os.platform() !== 'win32') {
        const mode = stats.mode.toString(8);
        console.log(`Permissions: ${mode}`);
      }
    } catch (error) {
      console.log(`Could not get file stats: ${error.message}`);
    }
    
    // Test direct execution
    const directTest = run(`node "${binFile}" --version`);
    console.log(`Direct execution: ${directTest ? '✅ ' + directTest : '❌ FAILED'}`);
  }
}
console.log();

// Package.json check
console.log('📄 Package Analysis:');
try {
  const packageList = run('npm list -g flow-state-dev --json');
  if (packageList) {
    const packageInfo = JSON.parse(packageList);
    const fsdInfo = packageInfo.dependencies?.['flow-state-dev'];
    
    if (fsdInfo) {
      console.log(`Installed version: ${fsdInfo.version}`);
      console.log(`Installation path: ${fsdInfo.path || 'Unknown'}`);
      
      // Check if package.json exists in installation
      const packageJsonPath = path.join(fsdInfo.path || '', 'package.json');
      if (checkFileExists(packageJsonPath)) {
        console.log('✅ package.json found in installation');
        
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          console.log(`Bin configuration: ${JSON.stringify(packageJson.bin || 'None')}`);
        } catch {
          console.log('❌ Could not read package.json');
        }
      } else {
        console.log('❌ package.json NOT found in installation');
      }
    }
  }
} catch (error) {
  console.log(`Package analysis failed: ${error.message}`);
}
console.log();

// Node modules check
console.log('📚 Dependencies Check:');
const requiredDeps = ['commander', 'chalk', 'fs-extra', 'inquirer', 'marked', 'node-fetch', 'semver'];
const globalNodeModules = npmPrefix ? path.join(npmPrefix, 'lib', 'node_modules', 'flow-state-dev', 'node_modules') : null;

if (globalNodeModules && checkFileExists(globalNodeModules)) {
  console.log('✅ node_modules directory found');
  
  const missingDeps = requiredDeps.filter(dep => 
    !checkFileExists(path.join(globalNodeModules, dep))
  );
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies present');
  } else {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
  }
} else {
  console.log('❌ node_modules directory not found');
}
console.log();

// Recommendations
console.log('🎯 Diagnostic Summary:');
console.log('=====================');

const issues = [];
const fixes = [];

if (!fsdCommand) {
  if (!npmBin) {
    issues.push('Cannot determine npm global bin directory');
    fixes.push('Check npm installation: npm doctor');
  } else if (!checkFileExists(path.join(npmBin, 'fsd'))) {
    issues.push('fsd bin file missing');
    fixes.push('Reinstall package: npm uninstall -g flow-state-dev && npm install -g flow-state-dev');
  } else if (!process.env.PATH?.split(path.delimiter).includes(npmBin)) {
    issues.push('npm bin directory not in PATH');
    fixes.push(`Add to PATH: export PATH="${npmBin}:$PATH"`);
  } else {
    issues.push('Unknown issue - bin file exists but command not found');
    fixes.push('Try: npm cache clean --force && npm uninstall -g flow-state-dev && npm install -g flow-state-dev');
  }
}

if (issues.length === 0) {
  console.log('✅ No major issues detected!');
} else {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`  • ${issue}`));
  console.log();
  console.log('💡 Suggested fixes:');
  fixes.forEach(fix => console.log(`  • ${fix}`));
}

console.log();
console.log('📝 Need help? Create an issue with this output:');
console.log('   https://github.com/jezweb/flow-state-dev/issues');
console.log();
console.log('🔧 Quick fix commands:');
console.log('   npm uninstall -g flow-state-dev');
console.log('   npm cache clean --force');
console.log('   npm install -g flow-state-dev --verbose');