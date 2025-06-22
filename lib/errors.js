// Enhanced error handling for Flow State Dev
import chalk from 'chalk';

// Error types
export const ErrorTypes = {
  GIT: 'git',
  GITHUB: 'github',
  FILE_SYSTEM: 'filesystem',
  NETWORK: 'network',
  DEPENDENCIES: 'dependencies',
  USER_INPUT: 'input',
  CONFIGURATION: 'config'
};

// Common error patterns and their solutions
const errorPatterns = {
  // Git errors
  'not a git repository': {
    type: ErrorTypes.GIT,
    message: 'This directory is not a Git repository',
    solution: 'Initialize Git first:',
    commands: ['git init', 'git branch -m main'],
    docs: 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup'
  },
  'no remote origin': {
    type: ErrorTypes.GIT,
    message: 'No GitHub remote repository configured',
    solution: 'Add your GitHub repository:',
    commands: ['git remote add origin https://github.com/username/repo.git'],
    docs: 'https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories'
  },
  'remote origin already exists': {
    type: ErrorTypes.GIT,
    message: 'A remote origin already exists',
    solution: 'Update the existing remote:',
    commands: ['git remote set-url origin https://github.com/username/repo.git'],
    alternative: 'Or remove and re-add:',
    alternativeCommands: ['git remote remove origin', 'git remote add origin https://github.com/username/repo.git']
  },
  
  // GitHub CLI errors
  'gh: command not found': {
    type: ErrorTypes.GITHUB,
    message: 'GitHub CLI is not installed',
    solution: 'Install GitHub CLI:',
    commands: {
      ubuntu: 'sudo apt install gh',
      macos: 'brew install gh',
      windows: 'winget install GitHub.cli'
    },
    docs: 'https://cli.github.com/manual/installation'
  },
  'gh auth login': {
    type: ErrorTypes.GITHUB,
    message: 'Not authenticated with GitHub',
    solution: 'Authenticate with GitHub:',
    commands: ['gh auth login'],
    tips: [
      'Choose "GitHub.com"',
      'Select "HTTPS" for protocol',
      'Use your browser to authenticate'
    ]
  },
  'could not resolve to a Repository': {
    type: ErrorTypes.GITHUB,
    message: 'GitHub repository not found or no access',
    solution: 'Check your repository:',
    tips: [
      'Ensure the repository exists on GitHub',
      'Check you have access to the repository',
      'Verify the remote URL is correct'
    ],
    commands: ['git remote -v']
  },
  
  // File system errors
  'ENOENT': {
    type: ErrorTypes.FILE_SYSTEM,
    message: 'File or directory not found',
    solution: 'Check the file path and ensure it exists',
    tips: ['Use absolute paths when possible', 'Check for typos in the path']
  },
  'EACCES': {
    type: ErrorTypes.FILE_SYSTEM,
    message: 'Permission denied',
    solution: 'Fix file permissions:',
    commands: ['sudo chown -R $(whoami) .'],
    alternative: 'Or use sudo (not recommended):',
    alternativeCommands: ['sudo npm install -g flow-state-dev']
  },
  'EEXIST': {
    type: ErrorTypes.FILE_SYSTEM,
    message: 'File or directory already exists',
    solution: 'Choose a different name or remove the existing one',
    tips: ['Check if the project already exists', 'Use a unique project name']
  },
  
  // Network errors
  'ETIMEDOUT': {
    type: ErrorTypes.NETWORK,
    message: 'Network request timed out',
    solution: 'Check your internet connection and try again',
    tips: [
      'Check if you\'re behind a firewall',
      'Try using a different network',
      'Check if npm registry is accessible'
    ]
  },
  'ECONNREFUSED': {
    type: ErrorTypes.NETWORK,
    message: 'Connection refused',
    solution: 'The server may be down or the port may be blocked',
    tips: ['Check if the service is running', 'Verify the correct port number']
  },
  
  // Dependency errors
  'Cannot find module': {
    type: ErrorTypes.DEPENDENCIES,
    message: 'Required module not found',
    solution: 'Install missing dependencies:',
    commands: ['npm install'],
    tips: ['Run this in your project directory', 'Check package.json for the dependency']
  },
  'npm ERR!': {
    type: ErrorTypes.DEPENDENCIES,
    message: 'npm encountered an error',
    solution: 'Try these fixes:',
    commands: [
      'npm cache clean --force',
      'rm -rf node_modules package-lock.json',
      'npm install'
    ]
  }
};

// Format error message with helpful information
export function formatError(error, context = {}) {
  const errorString = error.toString().toLowerCase();
  let errorInfo = null;
  
  // Find matching error pattern
  for (const [pattern, info] of Object.entries(errorPatterns)) {
    if (errorString.includes(pattern.toLowerCase())) {
      errorInfo = info;
      break;
    }
  }
  
  // Build formatted error message
  let output = '\n' + chalk.red.bold('❌ Error: ');
  
  if (errorInfo) {
    output += chalk.red(errorInfo.message) + '\n\n';
    
    // Add solution
    output += chalk.yellow.bold('💡 ' + errorInfo.solution) + '\n';
    
    // Add commands
    if (errorInfo.commands) {
      if (Array.isArray(errorInfo.commands)) {
        errorInfo.commands.forEach(cmd => {
          output += chalk.cyan(`   $ ${cmd}`) + '\n';
        });
      } else {
        // Platform-specific commands
        Object.entries(errorInfo.commands).forEach(([platform, cmd]) => {
          output += chalk.cyan(`   ${platform}: $ ${cmd}`) + '\n';
        });
      }
    }
    
    // Add alternative solution if available
    if (errorInfo.alternative) {
      output += '\n' + chalk.yellow(errorInfo.alternative) + '\n';
      if (errorInfo.alternativeCommands) {
        errorInfo.alternativeCommands.forEach(cmd => {
          output += chalk.cyan(`   $ ${cmd}`) + '\n';
        });
      }
    }
    
    // Add tips
    if (errorInfo.tips && errorInfo.tips.length > 0) {
      output += '\n' + chalk.gray('Tips:') + '\n';
      errorInfo.tips.forEach(tip => {
        output += chalk.gray(`   • ${tip}`) + '\n';
      });
    }
    
    // Add documentation link
    if (errorInfo.docs) {
      output += '\n' + chalk.blue(`📚 Learn more: ${errorInfo.docs}`) + '\n';
    }
  } else {
    // Generic error handling
    output += chalk.red(error.message || error) + '\n\n';
    
    // Add context-specific help
    if (context.command) {
      output += chalk.yellow(`This error occurred while running: ${context.command}`) + '\n';
    }
    
    // Generic tips
    output += chalk.gray('\nGeneral troubleshooting:') + '\n';
    output += chalk.gray('   • Check your internet connection') + '\n';
    output += chalk.gray('   • Ensure all dependencies are installed: npm install') + '\n';
    output += chalk.gray('   • Try running with --verbose for more details') + '\n';
    output += chalk.gray('   • Check the docs: https://github.com/jezweb/flow-state-dev') + '\n';
  }
  
  // Add stack trace in verbose mode
  if (context.verbose && error.stack) {
    output += '\n' + chalk.gray('Stack trace:') + '\n';
    output += chalk.gray(error.stack) + '\n';
  }
  
  return output;
}

// Wrap async functions with error handling
export function withErrorHandler(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(formatError(error, context));
      process.exit(1);
    }
  };
}

// Check for common issues before running commands
export async function preflightChecks(checks = []) {
  const errors = [];
  
  for (const check of checks) {
    try {
      await check.fn();
    } catch (error) {
      errors.push({
        check: check.name,
        error: error
      });
    }
  }
  
  if (errors.length > 0) {
    console.log(chalk.red.bold('\n⚠️  Preflight checks failed:\n'));
    
    errors.forEach(({ check, error }) => {
      console.log(chalk.yellow(`${check}:`));
      console.log(formatError(error, { command: check }));
    });
    
    process.exit(1);
  }
}