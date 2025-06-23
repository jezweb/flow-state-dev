import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Analyzes a directory to provide comprehensive information about its contents
 * @param {string} dirPath - Path to directory to analyze
 * @returns {Object} Analysis results
 */
export function analyzeDirectory(dirPath) {
  try {
    // Resolve any symbolic links
    const resolvedPath = fs.realpathSync(dirPath);
    const files = fs.readdirSync(resolvedPath);
    const regularFiles = files.filter(f => !f.startsWith('.'));
    const hiddenFiles = files.filter(f => f.startsWith('.'));
    
    // Check for important files/directories
    const hasGit = files.includes('.git');
    const hasPackageJson = files.includes('package.json');
    const hasNodeModules = files.includes('node_modules');
    const hasEnv = files.some(f => f.startsWith('.env'));
    
    // Enhanced source code detection
    const codeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
      '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h',
      '.php', '.rb', '.swift', '.kt', '.scala', '.clj',
      '.html', '.css', '.scss', '.sass', '.less'
    ];
    
    const sourceFiles = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      return codeExtensions.includes(ext);
    });
    
    const hasSourceCode = sourceFiles.length > 0;
    
    // Detect configuration files
    const configFiles = files.filter(f => {
      const configPatterns = [
        'package.json', 'yarn.lock', 'package-lock.json', 'pnpm-lock.yaml',
        'tsconfig.json', 'jsconfig.json', 'vite.config.*', 'webpack.config.*',
        'tailwind.config.*', 'postcss.config.*', 'babel.config.*',
        '.eslintrc.*', '.prettierrc.*', '.gitignore', '.gitattributes',
        'docker-compose.*', 'Dockerfile', 'Makefile', 'README.*', 'LICENSE*'
      ];
      
      return configPatterns.some(pattern => {
        if (pattern.includes('*')) {
          const prefix = pattern.replace('*', '');
          return f.startsWith(prefix);
        }
        return f === pattern;
      }) || f.startsWith('.env');
    });
    
    // Detect build artifacts
    const buildArtifacts = files.filter(f => 
      ['dist', 'build', 'out', '.next', '.nuxt', 'target', 'bin'].includes(f)
    );
    
    // Git repository analysis
    let gitInfo = { hasGit: false };
    if (hasGit) {
      gitInfo = analyzeGitRepository(resolvedPath);
    }
    
    // Identify important files for display
    const importantFiles = files.filter(f => 
      ['.git', 'package.json', 'node_modules', 'README.md', 'LICENSE'].includes(f) ||
      f.startsWith('.env') || buildArtifacts.includes(f)
    );
    
    return {
      path: resolvedPath,
      originalPath: path.resolve(dirPath),
      isSymlink: resolvedPath !== path.resolve(dirPath),
      regularFiles,
      hiddenFiles,
      regularCount: regularFiles.length,
      hiddenCount: hiddenFiles.length,
      totalCount: files.length,
      hasGit,
      hasPackageJson,
      hasNodeModules,
      hasEnv,
      hasSourceCode,
      sourceFiles,
      configFiles,
      buildArtifacts,
      gitInfo,
      importantFiles,
      isEmpty: files.length === 0,
      files: files.slice(0, 8), // More files for display
      allFiles: files
    };
  } catch (error) {
    // Directory doesn't exist or can't be read
    return {
      path: path.resolve(dirPath),
      error: error.message,
      exists: false
    };
  }
}

/**
 * Analyzes a Git repository to understand its state
 * @param {string} dirPath - Path to directory containing .git
 * @returns {Object} Git analysis results
 */
function analyzeGitRepository(dirPath) {
  try {
    const gitDir = path.join(dirPath, '.git');
    const isGitRepo = fs.existsSync(gitDir);
    
    if (!isGitRepo) {
      return { hasGit: false };
    }
    
    let hasCommits = false;
    let hasRemote = false;
    let currentBranch = null;
    
    try {
      // Check for commits
      execSync('git rev-parse HEAD', { cwd: dirPath, stdio: 'pipe' });
      hasCommits = true;
      
      // Get current branch
      const branchOutput = execSync('git branch --show-current', { 
        cwd: dirPath, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      currentBranch = branchOutput.trim();
      
      // Check for remote
      const remoteOutput = execSync('git remote', { 
        cwd: dirPath, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      hasRemote = remoteOutput.trim().length > 0;
    } catch (error) {
      // Repository exists but has no commits yet
      hasCommits = false;
    }
    
    return {
      hasGit: true,
      hasCommits,
      hasRemote,
      currentBranch,
      isInitialized: !hasCommits && !hasRemote
    };
  } catch (error) {
    return {
      hasGit: true,
      error: error.message
    };
  }
}

/**
 * Formats directory analysis for display with enhanced information
 * @param {Object} analysis - Results from analyzeDirectory
 * @returns {string[]} Array of formatted lines
 */
export function formatDirectoryInfo(analysis) {
  const lines = [];
  
  // Directory path info
  if (analysis.isSymlink) {
    lines.push(`📁 Directory: ${analysis.originalPath} → ${analysis.path} (symlink)`);
  } else {
    lines.push(`📁 Directory: ${analysis.path}`);
  }
  
  if (analysis.error) {
    lines.push(`❌ Error: ${analysis.error}`);
    return lines;
  }
  
  if (analysis.isEmpty) {
    lines.push('✅ Directory is empty - perfect for a new project!');
    return lines;
  }
  
  // File counts
  lines.push(`📊 Contains: ${analysis.totalCount} files (${analysis.regularCount} regular, ${analysis.hiddenCount} hidden)`);
  
  // Project type detection
  if (analysis.hasPackageJson) {
    lines.push('🚫 Existing Node.js project detected (package.json found)');
  } else if (analysis.hasSourceCode) {
    lines.push(`💻 Source code detected: ${analysis.sourceFiles.length} files`);
  }
  
  // Git repository info
  if (analysis.hasGit && analysis.gitInfo) {
    if (analysis.gitInfo.hasCommits) {
      const branch = analysis.gitInfo.currentBranch ? ` on ${analysis.gitInfo.currentBranch}` : '';
      const remote = analysis.gitInfo.hasRemote ? ' with remote' : '';
      lines.push(`🔄 Active Git repository${branch}${remote}`);
    } else {
      lines.push('📝 Empty Git repository (no commits)');
    }
  }
  
  // Configuration and build artifacts
  if (analysis.configFiles.length > 0) {
    lines.push(`⚙️  Configuration files: ${analysis.configFiles.length}`);
  }
  
  if (analysis.buildArtifacts.length > 0) {
    lines.push(`🏗️  Build artifacts: ${analysis.buildArtifacts.join(', ')}`);
  }
  
  // Important files preview
  if (analysis.files.length > 0) {
    const preview = analysis.files.slice(0, 6).join(', ');
    const more = analysis.totalCount > 6 ? ` +${analysis.totalCount - 6} more` : '';
    lines.push(`📄 Files: ${preview}${more}`);
  }
  
  return lines;
}

/**
 * Formats safety check results for display
 * @param {Object} safety - Results from performSafetyChecks
 * @returns {string[]} Array of formatted lines
 */
export function formatSafetyInfo(safety) {
  const lines = [];
  
  // Blocking issues
  if (safety.blocks.length > 0) {
    lines.push('\n🚫 Critical Issues (prevent project creation):');
    safety.blocks.forEach(issue => {
      lines.push(`   • ${issue.message}`);
      if (issue.details) {
        lines.push(`     ${issue.details}`);
      }
      lines.push('     Solutions:');
      issue.solutions.forEach(solution => {
        lines.push(`       - ${solution}`);
      });
    });
  }
  
  // Warning issues
  if (safety.warnings.length > 0) {
    lines.push('\n⚠️  Warnings (require confirmation):');
    safety.warnings.forEach(warning => {
      lines.push(`   • ${warning.message}`);
      if (warning.details) {
        lines.push(`     ${warning.details}`);
      }
      if (warning.risks && warning.risks.length > 0) {
        lines.push('     Risks:');
        warning.risks.forEach(risk => {
          lines.push(`       - ${risk}`);
        });
      }
    });
  }
  
  // Gentle notices
  if (safety.notices.length > 0) {
    lines.push('\n💡 Information:');
    safety.notices.forEach(notice => {
      lines.push(`   • ${notice.message}`);
      if (notice.details) {
        lines.push(`     ${notice.details}`);
      }
    });
  }
  
  return lines;
}

/**
 * Performs comprehensive safety checks on a directory
 * @param {Object} analysis - Results from analyzeDirectory
 * @returns {Object} Safety check results with categorized issues
 */
export function performSafetyChecks(analysis) {
  const blocks = [];      // Critical issues that prevent creation
  const warnings = [];    // Risky operations requiring confirmation
  const notices = [];     // Gentle warnings for user awareness
  
  // === BLOCKING ISSUES === 
  // These prevent project creation without --force
  
  if (analysis.hasPackageJson) {
    blocks.push({
      type: 'error',
      category: 'existing-project',
      message: 'Directory contains existing Node.js project (package.json found)',
      details: `Found package.json with ${analysis.configFiles.length} config files`,
      solutions: [
        'Choose a different project name: fsd init my-other-project',
        'Use a subfolder: fsd init my-project --subfolder',
        'Remove existing project files first',
        'Force creation (dangerous): fsd init --force'
      ],
      risk: 'high'
    });
  }
  
  if (analysis.hasNodeModules) {
    blocks.push({
      type: 'error', 
      category: 'existing-project',
      message: 'Directory contains node_modules folder',
      details: 'This indicates an active Node.js project with installed dependencies',
      solutions: [
        'Use a different directory',
        'Delete node_modules: rm -rf node_modules',
        'Create in subfolder: fsd init --subfolder'
      ],
      risk: 'high'
    });
  }
  
  if (analysis.buildArtifacts.length > 0) {
    blocks.push({
      type: 'error',
      category: 'build-artifacts',
      message: `Directory contains build artifacts: ${analysis.buildArtifacts.join(', ')}`,
      details: 'Build folders suggest an existing development project',
      solutions: [
        'Use a clean directory',
        'Remove build artifacts first',
        'Create in subfolder: fsd init --subfolder'
      ],
      risk: 'medium'
    });
  }
  
  // === WARNING ISSUES ===
  // These require user confirmation but can proceed
  
  if (analysis.hasGit && analysis.gitInfo.hasCommits) {
    warnings.push({
      type: 'warning',
      category: 'git-repository',
      message: `Directory contains active Git repository with commits`,
      details: `Branch: ${analysis.gitInfo.currentBranch || 'unknown'}, Remote: ${analysis.gitInfo.hasRemote ? 'yes' : 'no'}`,
      risks: [
        'New project files may conflict with existing repository structure',
        'Git history could become confusing',
        'Existing .gitignore may not suit new project'
      ],
      solutions: [
        'Create in subfolder: fsd init --subfolder',
        'Clone to new location first',
        'Backup existing files before proceeding'
      ],
      risk: 'medium'
    });
  }
  
  if (analysis.hasSourceCode) {
    warnings.push({
      type: 'warning',
      category: 'source-code',
      message: `Directory contains ${analysis.sourceFiles.length} source code files`,
      details: `File types: ${[...new Set(analysis.sourceFiles.map(f => path.extname(f)))].join(', ')}`,
      risks: [
        'Existing code may be overwritten',
        'File naming conflicts possible',
        'Mixed project structure'
      ],
      solutions: [
        'Backup existing code first',
        'Use a clean directory',
        'Create in subfolder: fsd init --subfolder'
      ],
      risk: 'medium'
    });
  }
  
  if (analysis.configFiles.length > 3) {
    warnings.push({
      type: 'warning',
      category: 'configuration',
      message: `Directory contains ${analysis.configFiles.length} configuration files`,
      details: `Including: ${analysis.configFiles.slice(0, 3).join(', ')}${analysis.configFiles.length > 3 ? '...' : ''}`,
      risks: [
        'Configuration conflicts between projects',
        'Existing settings may be overwritten'
      ],
      solutions: [
        'Review configuration files first',
        'Backup existing configurations',
        'Use a clean directory'
      ],
      risk: 'low'
    });
  }
  
  if (analysis.totalCount > 15) {
    warnings.push({
      type: 'warning',
      category: 'many-files',
      message: `Directory contains ${analysis.totalCount} files (${analysis.regularFiles.length} regular, ${analysis.hiddenFiles.length} hidden)`,
      details: 'Large number of files increases risk of conflicts',
      risks: [
        'File naming conflicts',
        'Difficult to track changes',
        'Mixed project content'
      ],
      solutions: [
        'Use an empty directory',
        'Create in subfolder: fsd init --subfolder',
        'Review and clean up existing files first'
      ],
      risk: 'low'
    });
  }
  
  // === GENTLE NOTICES ===
  // These inform but don't require confirmation
  
  if (analysis.hasGit && analysis.gitInfo.isInitialized) {
    notices.push({
      type: 'info',
      category: 'empty-git',
      message: 'Directory contains empty Git repository (no commits)',
      details: 'This is common for freshly cloned or initialized repositories',
      note: 'Flow State Dev will work with this setup'
    });
  }
  
  if (analysis.hasEnv) {
    notices.push({
      type: 'info',
      category: 'env-files',
      message: 'Directory contains environment files (.env*)',
      details: 'Existing environment files will be preserved when possible',
      note: 'Review .env.example after project creation'
    });
  }
  
  if (analysis.isSymlink) {
    notices.push({
      type: 'info',
      category: 'symlink',
      message: 'Target is a symbolic link',
      details: `Links to: ${analysis.path}`,
      note: 'Project will be created in the linked directory'
    });
  }
  
  return {
    safe: blocks.length === 0,
    needsConfirmation: warnings.length > 0,
    hasNotices: notices.length > 0,
    blocks,
    warnings,
    notices,
    // Legacy support
    issues: blocks,
    riskLevel: blocks.length > 0 ? 'high' : warnings.length > 0 ? 'medium' : 'low'
  };
}