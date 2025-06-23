/**
 * Security Validation and Templates Step
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { OnboardingStep } from '../base.js';

export class SecurityValidationStep extends OnboardingStep {
  constructor() {
    super('security-validation', 'Set up security templates and validation', {
      priority: 12, // After template processing, before git init
      required: false,
      dependencies: ['template-processing', 'repository-security']
    });
  }

  async validate(context) {
    const { targetDir } = context;
    
    if (!targetDir) {
      return { valid: false, message: 'Target directory is required' };
    }

    return { valid: true };
  }

  async execute(context) {
    const { targetDir, securityMode } = context;

    console.log(chalk.blue('\n🔒 Setting up security templates and validation...'));

    // Create or enhance .gitignore
    await this.createSecureGitignore(targetDir, securityMode);

    // Create security validation patterns
    await this.createSecurityPatterns(targetDir);

    // Create security documentation
    await this.createSecurityDocumentation(targetDir, securityMode);

    // Set up pre-commit hook template (optional)
    if (securityMode === 'private-secure' || securityMode === 'local-development') {
      await this.createPreCommitHookTemplate(targetDir);
    }

    console.log(chalk.green('✅ Security templates and validation configured'));

    return {
      ...context,
      securityValidationConfigured: true
    };
  }

  /**
   * Create comprehensive .gitignore file
   */
  async createSecureGitignore(targetDir, securityMode) {
    const gitignorePath = path.join(targetDir, '.gitignore');
    
    // Check if .gitignore already exists
    let existingContent = '';
    if (fs.existsSync(gitignorePath)) {
      existingContent = await fs.readFile(gitignorePath, 'utf-8');
    }

    const securityGitignore = this.generateSecureGitignore(securityMode, existingContent);
    await fs.writeFile(gitignorePath, securityGitignore);
    
    console.log(chalk.green('📄 Enhanced .gitignore with security patterns'));
  }

  /**
   * Generate comprehensive .gitignore content
   */
  generateSecureGitignore(securityMode, existingContent = '') {
    const securityNotice = securityMode === 'public-demo' 
      ? '# 🔒 SECURITY: This is a PUBLIC repository - extra protection for sensitive files'
      : '# 🔒 Security-focused .gitignore - protects sensitive data';

    const gitignoreContent = `${securityNotice}

# Environment files - NEVER commit these
.env
.env.local
.env.*.local
.env.development
.env.staging
.env.production

# Supabase secrets and config
supabase/.env
supabase/config.toml.local
supabase/.temp
.supabase/

# Database files
*.db
*.sqlite
*.sqlite3
*.db-journal

# Private keys and certificates
*.key
*.pem
*.p12
*.jks
*.pfx
*.cert
*.crt
*.ca-bundle

# IDE and system files
.DS_Store
Thumbs.db
.vscode/settings.json
.vscode/launch.json
.idea/
*.swp
*.swo
*~

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
.next/
.nuxt/
.output/
.cache/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov
.nyc_output/

# Temporary folders
tmp/
temp/

# Local development files
.local
*.local

# Backup files
*.backup
*.bak
*.tmp

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

${existingContent ? '\n# Previous .gitignore content:\n' + existingContent : ''}
`;

    return gitignoreContent;
  }

  /**
   * Create security patterns for validation
   */
  async createSecurityPatterns(targetDir) {
    const securityConfigPath = path.join(targetDir, '.security');
    await fs.ensureDir(securityConfigPath);

    // Create secret detection patterns
    const secretPatterns = {
      name: "Flow State Dev Secret Detection",
      version: "1.0.0",
      patterns: [
        {
          name: "Supabase Service Key",
          pattern: "SUPABASE_SERVICE_KEY\\s*=\\s*['\"]?eyJ[A-Za-z0-9_-]+",
          description: "Supabase service key (should never be in client code)"
        },
        {
          name: "Supabase Anon Key (Real)",
          pattern: "SUPABASE_ANON_KEY\\s*=\\s*['\"]?eyJ[A-Za-z0-9_-]{100,}",
          description: "Real Supabase anon key (check if in public repo)"
        },
        {
          name: "Database URL with Credentials",
          pattern: "DATABASE_URL\\s*=\\s*['\"]?postgres:\\/\\/.*:.*@",
          description: "Database connection string with embedded credentials"
        },
        {
          name: "JWT Secret",
          pattern: "JWT_SECRET\\s*=\\s*['\"]?[A-Za-z0-9+/=]{32,}",
          description: "JWT signing secret"
        },
        {
          name: "API Keys",
          pattern: "(API_KEY|OPENAI_API_KEY|STRIPE_SECRET_KEY)\\s*=\\s*['\"]?[a-zA-Z0-9_-]{20,}",
          description: "Various API keys"
        },
        {
          name: "Private Keys",
          pattern: "-----BEGIN (RSA )?PRIVATE KEY-----",
          description: "PEM encoded private keys"
        },
        {
          name: "AWS Credentials",
          pattern: "(AWS_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID)\\s*=\\s*['\"]?[A-Za-z0-9+/=]{20,}",
          description: "AWS access credentials"
        }
      ]
    };

    await fs.writeJson(
      path.join(securityConfigPath, 'secret-patterns.json'), 
      secretPatterns, 
      { spaces: 2 }
    );

    console.log(chalk.green('🔍 Created secret detection patterns'));
  }

  /**
   * Create security documentation
   */
  async createSecurityDocumentation(targetDir, securityMode) {
    const securityDocsPath = path.join(targetDir, 'docs');
    await fs.ensureDir(securityDocsPath);

    const securityGuide = this.generateSecurityGuide(securityMode);
    await fs.writeFile(
      path.join(securityDocsPath, 'SECURITY.md'), 
      securityGuide
    );

    console.log(chalk.green('📚 Created security documentation'));
  }

  /**
   * Generate security guide content
   */
  generateSecurityGuide(securityMode) {
    const modeSpecificGuidance = {
      'public-demo': `## 🚨 PUBLIC REPOSITORY SECURITY

**CRITICAL**: This is a public repository. Anyone can see your code and any secrets you accidentally commit.

### Mandatory Security Practices

1. **NEVER commit real credentials**
   - Use only placeholder values in committed files
   - Real credentials go in \`.env.local\` only
   - Double-check before every commit

2. **Environment File Strategy**
   - \`.env.example\` - Placeholder values (safe to commit)
   - \`.env.local\` - Real values (never commit)
   - Never commit any \`.env\` files with real data

3. **Code Review Checklist**
   - [ ] No hardcoded API keys or passwords
   - [ ] No real database URLs
   - [ ] No production secrets
   - [ ] All examples use placeholder values`,

      'private-secure': `## 🔒 PRIVATE REPOSITORY SECURITY

Your repository is private, providing better security for sensitive data.

### Security Best Practices

1. **Environment Management**
   - Use \`.env\` files for development credentials
   - Separate staging and production configurations
   - Regular credential rotation

2. **Team Collaboration**
   - Share credentials through secure channels
   - Document credential access procedures
   - Regular security audits

3. **Deployment Security**
   - Use environment variables in production
   - Never log sensitive data
   - Implement proper access controls`,

      'unknown-cautious': `## ⚠️ UNKNOWN REPOSITORY SECURITY

Repository visibility could not be determined. Following cautious security practices.

### Recommended Actions

1. **Verify Repository Visibility**
   - Check if your repository is public or private
   - Install GitHub CLI for better detection
   - Review repository settings

2. **Defensive Security**
   - Assume public until verified otherwise
   - Use placeholder values by default
   - Implement strict gitignore rules`,

      'local-development': `## 📁 LOCAL DEVELOPMENT SECURITY

No remote repository detected. Security considerations for local development.

### Before Publishing

1. **Repository Setup**
   - Choose public vs private carefully
   - Review all files for sensitive data
   - Set up appropriate .gitignore

2. **Security Preparation**
   - Use placeholder values for examples
   - Document real credential procedures
   - Test with security scanning tools`
    };

    const guidance = modeSpecificGuidance[securityMode] || modeSpecificGuidance['unknown-cautious'];

    return `# Security Guide

This document outlines security best practices for your Flow State Dev project.

${guidance}

## General Security Practices

### Environment Variables

#### Safe Patterns ✅
\`\`\`bash
# .env.example (safe to commit)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# .env.local (never commit)
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

#### Dangerous Patterns ❌
\`\`\`bash
# Never do this
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

# Never commit this
# .env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### Git Security

#### Pre-commit Checklist
- [ ] No real API keys in code
- [ ] No hardcoded passwords
- [ ] No production URLs
- [ ] \`.env\` files properly ignored
- [ ] No database credentials

#### File Protection
- Use \`.gitignore\` comprehensively
- Regularly audit committed files
- Use git hooks for validation
- Scan for secrets before pushing

### Supabase Security

#### Anon Key Usage
- Safe for client-side code
- Enable Row Level Security (RLS)
- Configure appropriate policies
- Monitor usage patterns

#### Service Key Protection
- Never expose in client code
- Use only in server environments
- Store in secure environment variables
- Rotate regularly

### Development Workflow

1. **Setup Phase**
   - Copy \`.env.example\` to \`.env.local\`
   - Replace placeholder values
   - Verify \`.gitignore\` rules

2. **Development Phase**
   - Never hardcode secrets
   - Use environment variables consistently
   - Regular security audits

3. **Deployment Phase**
   - Use production environment variables
   - Enable security monitoring
   - Regular credential rotation

### Incident Response

If you accidentally commit secrets:

1. **Immediate Actions**
   - Revoke compromised credentials immediately
   - Remove from git history: \`git filter-branch\`
   - Force push changes: \`git push --force\`

2. **Recovery Steps**
   - Generate new credentials
   - Update all environments
   - Audit for unauthorized access
   - Document incident

### Security Tools

- **Secret Scanning**: Use GitHub's secret scanning
- **Pre-commit Hooks**: Validate before commits
- **Security Audits**: Regular dependency checks
- **Monitoring**: Track unusual access patterns

### Getting Help

- [Supabase Security Docs](https://supabase.com/docs/guides/platform/security)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Remember**: Security is a continuous process, not a one-time setup. Regular reviews and updates are essential.
`;
  }

  /**
   * Create pre-commit hook template
   */
  async createPreCommitHookTemplate(targetDir) {
    const hooksDir = path.join(targetDir, '.githooks');
    await fs.ensureDir(hooksDir);

    const preCommitHook = `#!/bin/sh
# Pre-commit hook to check for secrets
# To enable: git config core.hooksPath .githooks

echo "🔍 Checking for secrets before commit..."

# Check for common secret patterns
if git diff --cached --name-only | xargs grep -l "eyJ[A-Za-z0-9_-]\\{100,\\}" 2>/dev/null; then
    echo "❌ Potential JWT token found in staged files"
    echo "Please remove secrets before committing"
    exit 1
fi

if git diff --cached --name-only | xargs grep -l "sk-[A-Za-z0-9]\\{48\\}" 2>/dev/null; then
    echo "❌ Potential OpenAI API key found in staged files"
    echo "Please remove secrets before committing"
    exit 1
fi

if git diff --cached --name-only | xargs grep -l "postgres://.*:.*@" 2>/dev/null; then
    echo "❌ Potential database URL with credentials found"
    echo "Please remove secrets before committing"
    exit 1
fi

echo "✅ No obvious secrets detected"
`;

    await fs.writeFile(path.join(hooksDir, 'pre-commit'), preCommitHook, { mode: 0o755 });

    const hookSetupInstructions = `# Git Hooks Setup

To enable the pre-commit secret detection hook:

\`\`\`bash
git config core.hooksPath .githooks
\`\`\`

This will automatically check for common secret patterns before each commit.
`;

    await fs.writeFile(path.join(hooksDir, 'README.md'), hookSetupInstructions);

    console.log(chalk.blue('🪝 Created pre-commit hook template'));
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        security: {
          type: 'object',
          properties: {
            skipValidation: {
              type: 'boolean',
              description: 'Skip security validation setup'
            },
            enablePreCommitHooks: {
              type: 'boolean',
              description: 'Set up pre-commit security hooks'
            },
            customPatterns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  pattern: { type: 'string' },
                  description: { type: 'string' }
                }
              },
              description: 'Custom secret detection patterns'
            }
          }
        }
      }
    };
  }
}