import chalk from 'chalk';
import { marked } from 'marked';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import semver from 'semver';

// Validation rules configuration
const VALIDATION_RULES = {
  maxFileSize: 10 * 1024, // 10KB
  requiredSections: [
    'Personal Information',
    'Development Environment',
    'Tech Stack Preferences',
    'Work Style & Preferences'
  ],
  recommendedSections: [
    'Claude Interaction Preferences',
    'Project Approach',
    'Workflow Commands',
    'Current Focus'
  ],
  sensitivePatterns: [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email (warn only)
    /\bpassword\s*[:=]\s*["']?[^"'\s]+["']?/gi, // Passwords
    /\bapi[_-]?key\s*[:=]\s*["']?[^"'\s]+["']?/gi, // API keys
    /\bsecret\s*[:=]\s*["']?[^"'\s]+["']?/gi, // Secrets
    /\btoken\s*[:=]\s*["']?[^"'\s]+["']?/gi, // Tokens
  ],
  techVersionPatterns: {
    'Node.js': /node\.?js\s*(?:v?(\d+(?:\.\d+)*)?)/i,
    'Vue': /vue\s*(?:v?(\d+(?:\.\d+)*)?)/i,
    'React': /react\s*(?:v?(\d+(?:\.\d+)*)?)/i,
    'Python': /python\s*(?:v?(\d+(?:\.\d+)*)?)/i,
  }
};

// Validation issue types
const IssueType = {
  ERROR: 'error',
  WARNING: 'warning',
  SUGGESTION: 'suggestion'
};

// Validation issue class
class ValidationIssue {
  constructor(type, category, message, line = null, suggestion = null) {
    this.type = type;
    this.category = category;
    this.message = message;
    this.line = line;
    this.suggestion = suggestion;
  }
}

// Memory file validator class
export class MemoryValidator {
  constructor(options = {}) {
    this.strict = options.strict || false;
    this.autoFix = options.autoFix || false;
    this.issues = [];
    this.techVersionCache = new Map();
  }

  /**
   * Validate a memory file
   */
  async validate(filePath) {
    this.issues = [];
    
    try {
      // Check file exists
      if (!await fs.pathExists(filePath)) {
        this.addIssue(IssueType.ERROR, 'file', 'Memory file does not exist');
        return this.getResults();
      }

      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Run all validation checks
      await this.validateFileSize(filePath);
      this.validateMarkdownSyntax(content);
      this.validateStructure(content, lines);
      this.validateContent(content, lines);
      await this.validateTechVersions(content);
      this.validateSensitiveInfo(content, lines);
      this.checkBestPractices(content, lines);

      return this.getResults();
    } catch (error) {
      this.addIssue(IssueType.ERROR, 'validation', `Validation error: ${error.message}`);
      return this.getResults();
    }
  }

  /**
   * Fix common issues in a memory file
   */
  async fix(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    let fixed = content;

    // Fix markdown syntax issues
    fixed = this.fixMarkdownSyntax(fixed);

    // Fix structure issues
    fixed = this.fixStructure(fixed);

    // Fix content issues
    fixed = this.fixContent(fixed);

    return fixed;
  }

  /**
   * Validate file size
   */
  async validateFileSize(filePath) {
    const stats = await fs.stat(filePath);
    if (stats.size > VALIDATION_RULES.maxFileSize) {
      this.addIssue(
        IssueType.WARNING,
        'size',
        `File size (${(stats.size / 1024).toFixed(1)}KB) exceeds recommended maximum of ${VALIDATION_RULES.maxFileSize / 1024}KB`,
        null,
        'Consider removing verbose or redundant content'
      );
    }
  }

  /**
   * Validate markdown syntax
   */
  validateMarkdownSyntax(content) {
    try {
      // Parse markdown to check for syntax errors
      const tokens = marked.lexer(content);
      
      // Check for proper heading hierarchy
      let lastLevel = 0;
      let headingIssues = false;
      
      tokens.forEach((token, index) => {
        if (token.type === 'heading') {
          if (token.depth > lastLevel + 1 && lastLevel !== 0) {
            this.addIssue(
              IssueType.WARNING,
              'markdown',
              `Heading level jumps from ${lastLevel} to ${token.depth}: "${token.text}"`,
              null,
              'Use sequential heading levels'
            );
            headingIssues = true;
          }
          lastLevel = token.depth;
        }
      });

      // Check for broken internal links
      const linkRegex = /\[([^\]]+)\]\(#([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const anchor = match[2];
        const headingAnchor = this.generateAnchor(anchor);
        if (!content.includes(`# ${anchor}`) && !content.includes(`## ${anchor}`)) {
          this.addIssue(
            IssueType.WARNING,
            'markdown',
            `Broken internal link: [${match[1]}](#${anchor})`,
            null,
            'Check that the linked heading exists'
          );
        }
      }

    } catch (error) {
      this.addIssue(
        IssueType.ERROR,
        'markdown',
        `Invalid markdown syntax: ${error.message}`
      );
    }
  }

  /**
   * Validate memory file structure
   */
  validateStructure(content, lines) {
    // Check for required sections
    for (const section of VALIDATION_RULES.requiredSections) {
      const regex = new RegExp(`^##\\s+${section}`, 'm');
      if (!regex.test(content)) {
        this.addIssue(
          IssueType.ERROR,
          'structure',
          `Missing required section: "${section}"`,
          null,
          `Add a "## ${section}" section`
        );
      }
    }

    // Check for recommended sections
    if (this.strict) {
      for (const section of VALIDATION_RULES.recommendedSections) {
        const regex = new RegExp(`^##\\s+${section}`, 'm');
        if (!regex.test(content)) {
          this.addIssue(
            IssueType.SUGGESTION,
            'structure',
            `Consider adding section: "${section}"`,
            null,
            `Add a "## ${section}" section for better context`
          );
        }
      }
    }

    // Check header format
    if (!content.startsWith('# User Memory for')) {
      this.addIssue(
        IssueType.WARNING,
        'structure',
        'Memory file should start with "# User Memory for [Name]"',
        1,
        'Update the header to follow the standard format'
      );
    }

    // Check for duplicate sections
    const sectionCounts = {};
    lines.forEach((line, index) => {
      const sectionMatch = line.match(/^##\s+(.+)$/);
      if (sectionMatch) {
        const section = sectionMatch[1];
        sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        if (sectionCounts[section] > 1) {
          this.addIssue(
            IssueType.WARNING,
            'structure',
            `Duplicate section found: "${section}"`,
            index + 1,
            'Merge duplicate sections'
          );
        }
      }
    });
  }

  /**
   * Validate content quality
   */
  validateContent(content, lines) {
    // Check for empty sections
    const sections = content.split(/^##\s+/m);
    sections.forEach((section, index) => {
      if (index > 0) { // Skip content before first section
        const lines = section.trim().split('\n');
        const sectionName = lines[0];
        const contentLines = lines.slice(1).filter(line => line.trim());
        
        if (contentLines.length === 0) {
          this.addIssue(
            IssueType.WARNING,
            'content',
            `Empty section: "${sectionName}"`,
            null,
            'Add relevant content or remove the section'
          );
        }
      }
    });

    // Check for vague instructions
    const vaguePatterns = [
      /\bsomething\s+like\b/gi,
      /\bmaybe\b/gi,
      /\bprobably\b/gi,
      /\bkind\s+of\b/gi,
      /\bsort\s+of\b/gi,
      /\betc\.?\s*$/gim
    ];

    lines.forEach((line, index) => {
      vaguePatterns.forEach(pattern => {
        if (pattern.test(line) && !line.startsWith('#')) {
          this.addIssue(
            IssueType.SUGGESTION,
            'content',
            'Vague language detected - be more specific',
            index + 1,
            `Line: "${line.trim()}"`
          );
        }
      });
    });

    // Check for contradictions (basic)
    const preferences = {};
    lines.forEach((line, index) => {
      // Look for preference statements
      const preferenceMatch = line.match(/(?:prefer|like|use|avoid|don't\s+(?:like|use))\s+(.+)/i);
      if (preferenceMatch) {
        const preference = preferenceMatch[1].toLowerCase().trim();
        const isNegative = /avoid|don't/.test(line.toLowerCase());
        
        if (preferences[preference] !== undefined && preferences[preference] !== isNegative) {
          this.addIssue(
            IssueType.WARNING,
            'content',
            `Potential contradiction about "${preference}"`,
            index + 1,
            'Review and clarify your preferences'
          );
        }
        preferences[preference] = isNegative;
      }
    });
  }

  /**
   * Validate tech versions
   */
  async validateTechVersions(content) {
    for (const [tech, pattern] of Object.entries(VALIDATION_RULES.techVersionPatterns)) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const mentionedVersion = match[1];
        const latestVersion = await this.getLatestVersion(tech.toLowerCase());
        
        if (latestVersion) {
          try {
            if (semver.lt(mentionedVersion, latestVersion)) {
              this.addIssue(
                IssueType.SUGGESTION,
                'versions',
                `${tech} version ${mentionedVersion} is outdated`,
                null,
                `Latest stable version is ${latestVersion}`
              );
            }
          } catch (error) {
            // Version comparison failed, skip
          }
        }
      }
    }
  }

  /**
   * Check for sensitive information
   */
  validateSensitiveInfo(content, lines) {
    lines.forEach((line, index) => {
      VALIDATION_RULES.sensitivePatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          const isEmail = pattern.source.includes('@');
          const type = isEmail ? IssueType.WARNING : IssueType.ERROR;
          const message = isEmail 
            ? 'Email address detected - consider if this should be public'
            : 'Potential sensitive information detected';
          
          this.addIssue(
            type,
            'security',
            message,
            index + 1,
            'Remove or redact sensitive information'
          );
        }
      });
    });
  }

  /**
   * Check best practices
   */
  checkBestPractices(content, lines) {
    // Check for actionable instructions
    const actionWords = ['use', 'prefer', 'avoid', 'always', 'never', 'should', 'must'];
    const hasActionableInstructions = actionWords.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(content)
    );
    
    if (!hasActionableInstructions) {
      this.addIssue(
        IssueType.SUGGESTION,
        'best-practices',
        'Memory file lacks actionable instructions',
        null,
        'Add specific preferences using words like "prefer", "use", "avoid"'
      );
    }

    // Check for specific tool mentions
    const toolSections = ['Tech Stack Preferences', 'Development Environment'];
    toolSections.forEach(section => {
      const sectionRegex = new RegExp(`## ${section}[\\s\\S]*?(?=##|$)`, 'm');
      const sectionMatch = content.match(sectionRegex);
      
      if (sectionMatch) {
        const sectionContent = sectionMatch[0];
        const toolCount = (sectionContent.match(/[-*]\s+\*\*[^*]+\*\*/g) || []).length;
        
        if (toolCount < 3) {
          this.addIssue(
            IssueType.SUGGESTION,
            'best-practices',
            `"${section}" section could be more specific`,
            null,
            'List specific tools, frameworks, and versions you use'
          );
        }
      }
    });

    // Check for organization
    const bulletPoints = (content.match(/^[-*]\s+/gm) || []).length;
    const totalLines = lines.filter(line => line.trim() && !line.startsWith('#')).length;
    
    if (bulletPoints < totalLines * 0.3) {
      this.addIssue(
        IssueType.SUGGESTION,
        'best-practices',
        'Consider using more bullet points for better organization',
        null,
        'Use bullet points to list preferences, tools, and guidelines'
      );
    }
  }

  /**
   * Fix markdown syntax issues
   */
  fixMarkdownSyntax(content) {
    // Fix heading hierarchy
    const lines = content.split('\n');
    let lastLevel = 0;
    
    const fixedLines = lines.map(line => {
      const headingMatch = line.match(/^(#+)\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        if (level > lastLevel + 1 && lastLevel !== 0) {
          // Fix the jump
          const newLevel = lastLevel + 1;
          return '#'.repeat(newLevel) + ' ' + headingMatch[2];
        }
        lastLevel = level;
      }
      return line;
    });

    return fixedLines.join('\n');
  }

  /**
   * Fix structure issues
   */
  fixStructure(content) {
    let fixed = content;

    // Ensure proper header
    if (!fixed.startsWith('# User Memory for')) {
      const nameMatch = content.match(/name[:\s]+([^\n]+)/i);
      const name = nameMatch ? nameMatch[1].trim() : 'User';
      // Remove any existing h1 header first
      fixed = fixed.replace(/^#\s+[^\n]+\n?/, '');
      fixed = `# User Memory for ${name}\n\n${fixed}`;
    }

    // Add missing required sections
    for (const section of VALIDATION_RULES.requiredSections) {
      const regex = new RegExp(`^##\\s+${section}`, 'm');
      if (!regex.test(fixed)) {
        // Find appropriate place to insert
        const sections = ['Personal Information', 'Development Environment', 'Tech Stack Preferences', 'Work Style & Preferences'];
        const currentIndex = sections.indexOf(section);
        
        // Find the next section that exists
        let insertBefore = null;
        for (let i = currentIndex + 1; i < sections.length; i++) {
          const nextRegex = new RegExp(`^##\\s+${sections[i]}`, 'm');
          if (nextRegex.test(fixed)) {
            insertBefore = sections[i];
            break;
          }
        }

        if (insertBefore) {
          const insertRegex = new RegExp(`(^##\\s+${insertBefore})`, 'm');
          fixed = fixed.replace(insertRegex, `## ${section}\n\n[Add ${section.toLowerCase()} here]\n\n$1`);
        } else {
          fixed += `\n\n## ${section}\n\n[Add ${section.toLowerCase()} here]`;
        }
      }
    }

    return fixed;
  }

  /**
   * Fix content issues
   */
  fixContent(content) {
    let fixed = content;

    // Remove trailing etc.
    fixed = fixed.replace(/\betc\.?\s*$/gim, '');

    // Remove vague language (conservative approach)
    // Don't auto-fix vague language as it requires user input

    // Trim empty lines in sections
    const sections = fixed.split(/^(##\s+.+)$/m);
    const fixedSections = [];
    
    for (let i = 0; i < sections.length; i++) {
      if (i % 2 === 0) {
        // Content part
        const trimmed = sections[i].split('\n')
          .filter((line, index, arr) => {
            // Keep line if it's not empty or if it's a single empty line between content
            return line.trim() !== '' || 
                   (index > 0 && index < arr.length - 1 && 
                    arr[index - 1].trim() !== '' && arr[index + 1].trim() !== '');
          })
          .join('\n');
        fixedSections.push(trimmed);
      } else {
        // Heading part
        fixedSections.push(sections[i]);
      }
    }

    return fixedSections.join('');
  }

  /**
   * Get latest version from npm
   */
  async getLatestVersion(packageName) {
    // Check cache first
    if (this.techVersionCache.has(packageName)) {
      return this.techVersionCache.get(packageName);
    }

    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`, {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        const version = data.version;
        this.techVersionCache.set(packageName, version);
        return version;
      }
    } catch (error) {
      // Silently fail - don't block validation
    }

    return null;
  }

  /**
   * Generate anchor from heading text
   */
  generateAnchor(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  /**
   * Add validation issue
   */
  addIssue(type, category, message, line = null, suggestion = null) {
    this.issues.push(new ValidationIssue(type, category, message, line, suggestion));
  }

  /**
   * Get validation results
   */
  getResults() {
    const errors = this.issues.filter(i => i.type === IssueType.ERROR);
    const warnings = this.issues.filter(i => i.type === IssueType.WARNING);
    const suggestions = this.issues.filter(i => i.type === IssueType.SUGGESTION);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      summary: {
        errors: errors.length,
        warnings: warnings.length,
        suggestions: suggestions.length,
        total: this.issues.length
      }
    };
  }
}

/**
 * Format validation results for console output
 */
export function formatValidationResults(results, filePath) {
  const output = [];
  
  output.push(chalk.blue(`\n📋 Validating: ${filePath}\n`));

  // Errors
  if (results.errors.length > 0) {
    output.push(chalk.red('❌ Errors:'));
    results.errors.forEach(issue => {
      output.push(formatIssue(issue, 'red'));
    });
    output.push('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    output.push(chalk.yellow('⚠️  Warnings:'));
    results.warnings.forEach(issue => {
      output.push(formatIssue(issue, 'yellow'));
    });
    output.push('');
  }

  // Suggestions
  if (results.suggestions.length > 0) {
    output.push(chalk.blue('💡 Suggestions:'));
    results.suggestions.forEach(issue => {
      output.push(formatIssue(issue, 'blue'));
    });
    output.push('');
  }

  // Summary
  output.push(chalk.white('📊 Summary:'));
  if (results.valid) {
    output.push(chalk.green(`   ✅ Valid memory file`));
  } else {
    output.push(chalk.red(`   ❌ Invalid memory file`));
  }
  
  output.push(chalk.gray(`   Errors: ${results.summary.errors}`));
  output.push(chalk.gray(`   Warnings: ${results.summary.warnings}`));
  output.push(chalk.gray(`   Suggestions: ${results.summary.suggestions}`));

  return output.join('\n');
}

/**
 * Format individual issue
 */
function formatIssue(issue, color) {
  const lines = [];
  const prefix = issue.line ? `Line ${issue.line}: ` : '';
  
  lines.push(chalk[color](`   ${prefix}${issue.message}`));
  
  if (issue.suggestion) {
    lines.push(chalk.gray(`   → ${issue.suggestion}`));
  }
  
  return lines.join('\n');
}