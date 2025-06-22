#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const os = require('os');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[37m'
};

function colorize(color, text) {
  // Skip colors in CI environments or if NO_COLOR is set
  if (process.env.CI || process.env.NO_COLOR) {
    return text;
  }
  return `${colors[color]}${text}${colors.reset}`;
}

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return null;
  }
}

function checkCommandAsync(command, callback) {
  exec(command, { encoding: 'utf8' }, (error, stdout) => {
    if (error) {
      callback(null);
    } else {
      callback(stdout.trim());
    }
  });
}

async function postInstall() {
  console.log('');
  console.log(colorize('cyan', '╔═╗┬  ┌─┐┬ ┬  ╔═╗┌┬┐┌─┐┌┬┐┌─┐  ╔╦╗┌─┐┬  ┬'));
  console.log(colorize('cyan', '╠╣ │  │ ││││  ╚═╗ │ ├─┤ │ ├┤    ║║├┤ └┐┌┘'));
  console.log(colorize('cyan', '╚  ┴─┘└─┘└┴┘  ╚═╝ ┴ ┴ ┴ ┴ └─┘  ═╩╝└─┘ └┘'));
  console.log('');

  // Get package version
  let version = 'unknown';
  try {
    const packageJson = require('../package.json');
    version = packageJson.version;
  } catch (error) {
    // Fallback - try to read from npm
    const npmVersion = runCommand('npm list -g flow-state-dev --depth=0 --json');
    if (npmVersion) {
      try {
        const parsed = JSON.parse(npmVersion);
        version = parsed.dependencies?.['flow-state-dev']?.version || 'unknown';
      } catch {}
    }
  }

  console.log(colorize('green', `🎉 Flow State Dev v${version} installed successfully!`));
  console.log('');

  // Platform-specific info
  const platform = os.platform();
  const arch = os.arch();
  console.log(colorize('gray', `📋 Platform: ${platform} ${arch}`));
  console.log(colorize('gray', `🏠 Node.js: ${process.version}`));
  
  // Get npm info
  const npmVersion = runCommand('npm --version');
  if (npmVersion) {
    console.log(colorize('gray', `📦 npm: ${npmVersion}`));
  }
  console.log('');

  // Test if fsd command is available
  console.log(colorize('blue', '🧪 Testing installation...'));
  
  // Try multiple ways to find the command
  let fsdWorking = false;
  let fsdLocation = null;
  let fsdVersion = null;
  let testResults = [];

  // Test 1: Direct command check
  const whichCommand = platform === 'win32' ? 'where fsd' : 'which fsd';
  fsdLocation = runCommand(whichCommand);
  
  if (fsdLocation) {
    testResults.push('✅ fsd command found in PATH');
    
    // Test 2: Version check
    fsdVersion = runCommand('fsd --version');
    if (fsdVersion) {
      testResults.push(`✅ fsd working correctly: v${fsdVersion}`);
      fsdWorking = true;
    } else {
      testResults.push('⚠️  fsd found but version check failed');
    }
  } else {
    testResults.push('❌ fsd command not found in PATH');
  }

  // Test 3: Check npm bin directory
  let npmBin = runCommand('npm bin -g');
  if (!npmBin) {
    // Fallback for newer npm versions
    const npmPrefix = runCommand('npm prefix -g');
    if (npmPrefix) {
      npmBin = path.join(npmPrefix, 'bin');
    }
  }

  if (npmBin) {
    const binFile = path.join(npmBin, platform === 'win32' ? 'fsd.cmd' : 'fsd');
    try {
      const fs = require('fs');
      if (fs.existsSync(binFile)) {
        testResults.push('✅ Binary file exists in npm directory');
        const stats = fs.statSync(binFile);
        if (platform !== 'win32' && (stats.mode & parseInt('111', 8))) {
          testResults.push('✅ Binary file is executable');
        } else if (platform === 'win32') {
          testResults.push('✅ Binary file permissions OK');
        } else {
          testResults.push('⚠️  Binary file may not be executable');
        }
      } else {
        testResults.push('❌ Binary file not found in npm directory');
      }
    } catch (error) {
      testResults.push('⚠️  Could not check binary file');
    }
  }

  // Display test results
  testResults.forEach(result => console.log(result));
  console.log('');

  // Show location if found
  if (fsdLocation) {
    console.log(colorize('gray', `📍 Installed at: ${fsdLocation}`));
  }

  if (npmBin) {
    console.log(colorize('gray', `📂 npm bin directory: ${npmBin}`));
  }
  console.log('');

  // Provide guidance based on results
  if (fsdWorking) {
    console.log(colorize('green', '🚀 Ready to use! Get started with:'));
    console.log('');
    console.log(colorize('bright', '   fsd init my-project'));
    console.log('   fsd --help');
    console.log('   fsd memory init');
    console.log('');
  } else {
    console.log(colorize('yellow', '⚠️  Command not immediately available'));
    console.log('');
    console.log('This is common and usually means you need to:');
    console.log('');
    console.log(colorize('bright', '1. Restart your terminal completely'));
    console.log('2. Or reload your shell:');
    
    const shell = process.env.SHELL || '';
    if (shell.includes('bash')) {
      console.log('   source ~/.bashrc');
    } else if (shell.includes('zsh')) {
      console.log('   source ~/.zshrc');
    } else {
      console.log('   source ~/.bashrc  # or ~/.zshrc');
    }
    
    if (npmBin) {
      console.log('3. Or add npm bin to PATH:');
      console.log(`   export PATH="${npmBin}:$PATH"`);
    }
    console.log('');
    console.log('💡 If still having issues, run our diagnostic:');
    console.log(colorize('gray', '   curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash'));
    console.log('');
  }

  // Show helpful links
  console.log(colorize('blue', '📚 Helpful Resources:'));
  console.log('   Documentation: https://github.com/jezweb/flow-state-dev');
  console.log('   Troubleshooting: https://github.com/jezweb/flow-state-dev/tree/main/debug');
  console.log('   Issues: https://github.com/jezweb/flow-state-dev/issues');
  console.log('');

  // Check for common issues asynchronously (don't block)
  setTimeout(() => {
    checkForCommonIssues();
  }, 100);
}

function checkForCommonIssues() {
  // Check PATH configuration
  const npmBin = runCommand('npm bin -g') || runCommand('npm prefix -g')?.replace(/\n$/, '') + '/bin';
  
  if (npmBin && !process.env.PATH?.includes(npmBin)) {
    console.log(colorize('yellow', '💡 Tip: npm bin directory not in PATH'));
    console.log(`   Consider adding to your shell profile: export PATH="${npmBin}:$PATH"`);
    console.log('');
  }

  // Check for multiple Node installations
  const nodeLocations = runCommand('which -a node 2>/dev/null || where node 2>nul');
  if (nodeLocations && nodeLocations.split('\n').length > 1) {
    console.log(colorize('yellow', '💡 Multiple Node.js installations detected'));
    console.log('   This can sometimes cause issues with global packages');
    console.log('');
  }
}

// Handle errors gracefully - don't break installation
process.on('unhandledRejection', (error) => {
  console.log(colorize('yellow', '⚠️  Post-install check encountered an issue (this doesn\'t affect installation)'));
  if (process.env.DEBUG) {
    console.log(error);
  }
});

process.on('uncaughtException', (error) => {
  console.log(colorize('yellow', '⚠️  Post-install check encountered an issue (this doesn\'t affect installation)'));
  if (process.env.DEBUG) {
    console.log(error);
  }
  process.exit(0); // Exit gracefully
});

// Run the post-install check
postInstall().catch((error) => {
  console.log(colorize('yellow', '⚠️  Post-install check encountered an issue (this doesn\'t affect installation)'));
  if (process.env.DEBUG) {
    console.log(error);
  }
});