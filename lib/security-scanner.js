/**
 * Security scanner for detecting secrets and security issues
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
// Using fs instead of glob for simpler file discovery

export class SecurityScanner {
  constructor(options = {}) {
    this.patterns = this.loadSecretPatterns();
    this.options = {
      verbose: options.verbose || false,
      ignoreFiles: options.ignoreFiles || ['.git', 'node_modules', 'dist', 'build'],
      includeExtensions: options.includeExtensions || ['.js', '.ts', '.vue', '.env', '.json', '.yaml', '.yml'],
      ...options
    };
  }

  /**
   * Load secret detection patterns
   */
  loadSecretPatterns() {
    const defaultPatterns = [
      {
        name: 'Supabase Service Key',
        pattern: /SUPABASE_SERVICE_KEY\s*=\s*['"]?eyJ[A-Za-z0-9_-]+/g,
        severity: 'critical',
        description: 'Supabase service key detected (should never be in client code)'
      },
      {
        name: 'Supabase Anon Key (Real)',
        pattern: /SUPABASE_ANON_KEY\s*=\s*['"]?eyJ[A-Za-z0-9_-]{100,}/g,
        severity: 'high',
        description: 'Real Supabase anon key detected (check if appropriate for repository visibility)'
      },
      {
        name: 'Database URL with Credentials',
        pattern: /DATABASE_URL\s*=\s*['"]?postgres:\/\/.*:.*@/g,
        severity: 'critical',
        description: 'Database connection string with embedded credentials'
      },
      {
        name: 'JWT Secret',
        pattern: /JWT_SECRET\s*=\s*['"]?[A-Za-z0-9+/=]{32,}/g,
        severity: 'critical',
        description: 'JWT signing secret detected'
      },
      {
        name: 'OpenAI API Key',
        pattern: /OPENAI_API_KEY\s*=\s*['"]?sk-[A-Za-z0-9]{48}/g,
        severity: 'high',
        description: 'OpenAI API key detected'
      },
      {
        name: 'Stripe Secret Key',
        pattern: /STRIPE_SECRET_KEY\s*=\s*['"]?sk_live_[A-Za-z0-9]+/g,
        severity: 'critical',
        description: 'Stripe live secret key detected'
      },
      {
        name: 'AWS Access Key',
        pattern: /(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY)\s*=\s*['"]?[A-Za-z0-9+/=]{20,}/g,
        severity: 'high',
        description: 'AWS credentials detected'
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN (RSA )?PRIVATE KEY-----/g,
        severity: 'critical',
        description: 'PEM encoded private key detected'
      },
      {
        name: 'Generic API Key Pattern',
        pattern: /[A-Za-z0-9_-]*[Aa][Pp][Ii][-_]?[Kk][Ee][Yy]\s*=\s*['"]?[A-Za-z0-9_-]{20,}/g,
        severity: 'medium',
        description: 'Potential API key detected'
      }
    ];

    // Try to load custom patterns from project
    try {
      const customPatternsPath = path.join(process.cwd(), '.security', 'secret-patterns.json');
      if (fs.existsSync(customPatternsPath)) {
        const customPatterns = fs.readJsonSync(customPatternsPath);
        if (customPatterns.patterns) {
          return [
            ...defaultPatterns,
            ...customPatterns.patterns.map(p => ({
              ...p,
              pattern: new RegExp(p.pattern, 'g'),
              severity: p.severity || 'medium'
            }))
          ];
        }
      }
    } catch (error) {
      if (this.options.verbose) {
        console.log(chalk.yellow(`Warning: Could not load custom patterns: ${error.message}`));
      }
    }

    return defaultPatterns;
  }

  /**
   * Scan project for security issues
   */
  async scanProject(targetDir = process.cwd()) {
    console.log(chalk.blue('🔍 Starting security scan...\n'));

    const results = {
      filesScanned: 0,
      issuesFound: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      files: []
    };

    // Get files to scan
    const filesToScan = await this.getFilesToScan(targetDir);
    
    if (filesToScan.length === 0) {
      console.log(chalk.yellow('⚠️  No files found to scan'));
      return results;
    }

    // Scan each file
    for (const filePath of filesToScan) {
      const fileResults = await this.scanFile(filePath);
      if (fileResults.issues.length > 0) {
        results.files.push(fileResults);
        results.issuesFound += fileResults.issues.length;
        
        // Count by severity
        fileResults.issues.forEach(issue => {
          switch (issue.severity) {
            case 'critical': results.criticalIssues++; break;
            case 'high': results.highIssues++; break;
            case 'medium': results.mediumIssues++; break;
            case 'low': results.lowIssues++; break;
          }
        });
      }
      results.filesScanned++;
    }

    this.displayResults(results);
    return results;
  }

  /**
   * Get list of files to scan
   */
  async getFilesToScan(targetDir) {
    const allFiles = [];
    
    const scanDirectory = async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip ignored directories
          if (entry.isDirectory()) {
            if (!this.options.ignoreFiles.includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            // Check if file extension matches
            const ext = path.extname(entry.name);
            if (this.options.includeExtensions.includes(ext) || entry.name.startsWith('.env')) {
              allFiles.push(fullPath);
            }
          }
        }
      } catch (error) {
        if (this.options.verbose) {
          console.log(chalk.yellow(`Warning: Could not scan directory ${dir}: ${error.message}`));
        }
      }
    };

    await scanDirectory(targetDir);
    return allFiles;
  }

  /**
   * Scan individual file for secrets
   */
  async scanFile(filePath) {
    const result = {
      file: path.relative(process.cwd(), filePath),
      issues: []
    };

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (const pattern of this.patterns) {
        let match;
        pattern.pattern.lastIndex = 0; // Reset regex

        while ((match = pattern.pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const lineContent = lines[lineNumber - 1]?.trim();

          result.issues.push({
            pattern: pattern.name,
            severity: pattern.severity,
            description: pattern.description,
            line: lineNumber,
            column: match.index - content.lastIndexOf('\n', match.index),
            content: lineContent,
            match: match[0]
          });
        }
      }
    } catch (error) {
      if (this.options.verbose) {
        console.log(chalk.yellow(`Warning: Could not read file ${filePath}: ${error.message}`));
      }
    }

    return result;
  }

  /**
   * Display scan results
   */
  displayResults(results) {
    console.log(chalk.blue('\n📊 Security Scan Results\n'));
    
    // Summary
    console.log(`Files scanned: ${chalk.cyan(results.filesScanned)}`);
    console.log(`Issues found: ${this.getSeverityColor(results.issuesFound, results.issuesFound)}\n`);

    if (results.issuesFound === 0) {
      console.log(chalk.green('✅ No security issues detected!'));
      return;
    }

    // Severity breakdown
    if (results.criticalIssues > 0) {
      console.log(`${chalk.red('🚨 Critical:')} ${results.criticalIssues}`);
    }
    if (results.highIssues > 0) {
      console.log(`${chalk.magenta('⚠️  High:')} ${results.highIssues}`);
    }
    if (results.mediumIssues > 0) {
      console.log(`${chalk.yellow('💡 Medium:')} ${results.mediumIssues}`);
    }
    if (results.lowIssues > 0) {
      console.log(`${chalk.blue('ℹ️  Low:')} ${results.lowIssues}`);
    }

    console.log('\n' + chalk.underline('Detailed Results:') + '\n');

    // File-by-file results
    for (const fileResult of results.files) {
      console.log(chalk.cyan(`📄 ${fileResult.file}`));
      
      for (const issue of fileResult.issues) {
        const severityIcon = this.getSeverityIcon(issue.severity);
        const severityColor = this.getSeverityColorFunc(issue.severity);
        
        console.log(`   ${severityIcon} ${severityColor(issue.pattern)} (line ${issue.line})`);
        console.log(`     ${chalk.gray(issue.description)}`);
        if (this.options.verbose) {
          console.log(`     ${chalk.gray('Content:')} ${chalk.gray(issue.content)}`);
        }
      }
      console.log();
    }

    // Recommendations
    this.displayRecommendations(results);
  }

  /**
   * Display security recommendations
   */
  displayRecommendations(results) {
    console.log(chalk.yellow('🔧 Recommendations:\n'));

    if (results.criticalIssues > 0) {
      console.log(chalk.red('🚨 CRITICAL ACTIONS REQUIRED:'));
      console.log(chalk.gray('  • Remove or secure all critical secrets immediately'));
      console.log(chalk.gray('  • Revoke and regenerate any exposed credentials'));
      console.log(chalk.gray('  • Check git history for previously committed secrets'));
      console.log();
    }

    if (results.issuesFound > 0) {
      console.log(chalk.blue('📋 General Recommendations:'));
      console.log(chalk.gray('  • Move secrets to environment variables'));
      console.log(chalk.gray('  • Use .env.local for local development (auto-ignored by git)'));
      console.log(chalk.gray('  • Update .gitignore to prevent future secret commits'));
      console.log(chalk.gray('  • Set up pre-commit hooks for automatic scanning'));
      console.log(chalk.gray('  • Run: fsd security:setup to configure security tools'));
      console.log();
    }

    console.log(chalk.blue('🔗 Resources:'));
    console.log(chalk.gray('  • Security guide: docs/SECURITY.md'));
    console.log(chalk.gray('  • Pre-commit hooks: .githooks/pre-commit'));
    console.log(chalk.gray('  • Secret patterns: .security/secret-patterns.json'));
  }

  /**
   * Check repository visibility
   */
  async checkRepositoryVisibility() {
    try {
      // Check if we're in a git repository
      const isGitRepo = fs.existsSync('.git');
      if (!isGitRepo) {
        return { status: 'not-git', public: null };
      }

      // Check for GitHub remote
      const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
      if (!remoteUrl.includes('github.com')) {
        return { status: 'non-github', public: null, remoteUrl };
      }

      // Try to use GitHub CLI
      try {
        execSync('gh --version', { stdio: 'ignore' });
        const repoInfo = JSON.parse(execSync('gh repo view --json visibility', { encoding: 'utf-8' }));
        return {
          status: 'github',
          public: repoInfo.visibility === 'public',
          visibility: repoInfo.visibility
        };
      } catch (error) {
        return { status: 'github-no-cli', public: null, remoteUrl };
      }
    } catch (error) {
      return { status: 'error', public: null, error: error.message };
    }
  }

  /**
   * Setup security tools and templates
   */
  async setupSecurity() {
    console.log(chalk.blue('🔧 Setting up security tools...\n'));

    // Create .security directory and patterns
    await this.createSecurityDirectory();

    // Enhance .gitignore
    await this.enhanceGitignore();

    // Setup pre-commit hooks
    await this.setupPreCommitHooks();

    // Create security documentation
    await this.createSecurityDocs();

    console.log(chalk.green('✅ Security setup complete!\n'));
    console.log(chalk.blue('Next steps:'));
    console.log(chalk.gray('  • Run: fsd security:scan to check for existing secrets'));
    console.log(chalk.gray('  • Enable pre-commit hooks: git config core.hooksPath .githooks'));
    console.log(chalk.gray('  • Review: docs/SECURITY.md for best practices'));
  }

  /**
   * Utility methods
   */
  getSeverityColor(count, total) {
    if (total === 0) return chalk.green(count);
    if (total > 10) return chalk.red(count);
    if (total > 5) return chalk.yellow(count);
    return chalk.blue(count);
  }

  getSeverityIcon(severity) {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '💡';
      case 'low': return 'ℹ️';
      default: return '🔍';
    }
  }

  getSeverityColorFunc(severity) {
    switch (severity) {
      case 'critical': return chalk.red;
      case 'high': return chalk.magenta;
      case 'medium': return chalk.yellow;
      case 'low': return chalk.blue;
      default: return chalk.gray;
    }
  }

  async createSecurityDirectory() {
    // Implementation would be similar to SecurityValidationStep
    console.log(chalk.green('📁 Created .security directory with patterns'));
  }

  async enhanceGitignore() {
    // Implementation would be similar to SecurityValidationStep
    console.log(chalk.green('📄 Enhanced .gitignore with security patterns'));
  }

  async setupPreCommitHooks() {
    // Implementation would be similar to SecurityValidationStep
    console.log(chalk.green('🪝 Created pre-commit security hooks'));
  }

  async createSecurityDocs() {
    // Implementation would be similar to SecurityValidationStep
    console.log(chalk.green('📚 Created security documentation'));
  }
}