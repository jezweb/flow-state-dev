import fs from 'fs-extra';
import path from 'path';

/**
 * Analyzes a directory to provide information about its contents
 * @param {string} dirPath - Path to directory to analyze
 * @returns {Object} Analysis results
 */
export function analyzeDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    const regularFiles = files.filter(f => !f.startsWith('.'));
    const hiddenFiles = files.filter(f => f.startsWith('.'));
    
    // Check for important files/directories
    const hasGit = files.includes('.git');
    const hasPackageJson = files.includes('package.json');
    const hasNodeModules = files.includes('node_modules');
    const hasEnv = files.some(f => f.startsWith('.env'));
    
    // Find source code files
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.go'];
    const hasSourceCode = regularFiles.some(f => 
      codeExtensions.some(ext => f.endsWith(ext))
    );
    
    // Identify important files
    const importantFiles = files.filter(f => 
      ['.git', 'package.json', '.env', 'node_modules', 'README.md', 'LICENSE'].includes(f) ||
      f.startsWith('.env')
    );
    
    return {
      path: path.resolve(dirPath),
      regularCount: regularFiles.length,
      hiddenCount: hiddenFiles.length,
      totalCount: files.length,
      hasGit,
      hasPackageJson,
      hasNodeModules,
      hasEnv,
      hasSourceCode,
      importantFiles,
      isEmpty: files.length === 0,
      files: files.slice(0, 5), // First 5 files for display
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
 * Formats directory analysis for display
 * @param {Object} analysis - Results from analyzeDirectory
 * @returns {string[]} Array of formatted lines
 */
export function formatDirectoryInfo(analysis) {
  const lines = [];
  
  lines.push(`📁 Current directory: ${analysis.path}`);
  
  if (analysis.error) {
    lines.push(`❌ Error: ${analysis.error}`);
    return lines;
  }
  
  if (analysis.isEmpty) {
    lines.push('✅ Directory is empty');
  } else {
    lines.push(`📊 Contains: ${analysis.regularCount} files, ${analysis.hiddenCount} hidden files`);
    
    if (analysis.hasPackageJson) {
      lines.push('🚫 Existing Node.js project detected (package.json found)');
    } else if (analysis.hasGit) {
      lines.push('⚠️  Git repository detected');
    }
    
    if (analysis.importantFiles.length > 0) {
      const notable = analysis.importantFiles.slice(0, 3).join(', ');
      const more = analysis.importantFiles.length > 3 ? ` +${analysis.importantFiles.length - 3} more` : '';
      lines.push(`📄 Notable: ${notable}${more}`);
    }
  }
  
  return lines;
}

/**
 * Performs safety checks on a directory
 * @param {Object} analysis - Results from analyzeDirectory
 * @returns {Object} Safety check results
 */
export function performSafetyChecks(analysis) {
  const issues = [];
  const warnings = [];
  
  // Critical issues that should block
  if (analysis.hasPackageJson) {
    issues.push({
      type: 'error',
      message: 'Directory contains existing Node.js project (package.json)',
      suggestion: 'Use a different directory or delete the existing project'
    });
  }
  
  if (analysis.hasNodeModules) {
    issues.push({
      type: 'error',
      message: 'Directory contains node_modules',
      suggestion: 'This appears to be an existing project directory'
    });
  }
  
  // Warnings that need confirmation
  if (analysis.hasGit) {
    warnings.push({
      type: 'warning',
      message: 'Directory contains a git repository',
      suggestion: 'This may cause conflicts with the new project'
    });
  }
  
  if (analysis.hasEnv) {
    warnings.push({
      type: 'warning',
      message: 'Directory contains environment files (.env)',
      suggestion: 'Existing configuration may be overwritten'
    });
  }
  
  if (analysis.totalCount > 10) {
    warnings.push({
      type: 'warning',
      message: `Directory contains ${analysis.totalCount} files`,
      suggestion: 'Consider using an empty directory'
    });
  }
  
  return {
    safe: issues.length === 0,
    needsConfirmation: warnings.length > 0,
    issues,
    warnings
  };
}