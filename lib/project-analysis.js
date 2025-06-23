/**
 * Project Analysis Engine for Flow State Dev Retrofit System
 * 
 * Analyzes existing projects to determine current state, version,
 * and what Flow State Dev features are missing or outdated.
 */
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { analyzeDirectory } from './directory-utils.js';

export class ProjectAnalyzer {
  constructor(projectPath = process.cwd()) {
    this.projectPath = path.resolve(projectPath);
    this.analysis = null;
  }

  /**
   * Performs comprehensive analysis of existing project
   * @returns {Object} Complete project analysis
   */
  async analyzeProject() {
    console.log(chalk.blue('🔍 Analyzing project structure...'));
    
    // Basic directory analysis
    const directoryAnalysis = analyzeDirectory(this.projectPath);
    
    // Flow State Dev specific analysis
    const fsdAnalysis = await this.analyzeFlowStateDevFeatures();
    
    // Framework and dependency analysis
    const frameworkAnalysis = await this.analyzeFramework();
    
    // Git repository analysis
    const gitAnalysis = await this.analyzeGitRepository();
    
    this.analysis = {
      projectPath: this.projectPath,
      directory: directoryAnalysis,
      flowStateDev: fsdAnalysis,
      framework: frameworkAnalysis,
      git: gitAnalysis,
      analyzedAt: new Date().toISOString()
    };

    return this.analysis;
  }

  /**
   * Detects current Flow State Dev version and features
   * @returns {Object} Flow State Dev analysis
   */
  async analyzeFlowStateDevFeatures() {
    const features = {
      version: null,
      isFlowStateDevProject: false,
      hasDocumentation: false,
      hasSecurity: false,
      hasAIContext: false,
      hasGitHubIntegration: false,
      hasMemorySystem: false,
      hasModularOnboarding: false,
      hasSlashCommands: false,
      hasStoreGenerator: false,
      details: {}
    };

    // Check for Flow State Dev markers
    const claudeFile = path.join(this.projectPath, 'CLAUDE.md');
    const packageFile = path.join(this.projectPath, 'package.json');
    
    // Check CLAUDE.md for Flow State Dev signature
    if (fs.existsSync(claudeFile)) {
      const claudeContent = fs.readFileSync(claudeFile, 'utf8');
      const versionMatch = claudeContent.match(/Flow State Dev v([\d.]+)/);
      if (versionMatch) {
        features.version = versionMatch[1];
        features.isFlowStateDevProject = true;
      }
    }

    // Check package.json for Flow State Dev metadata
    if (fs.existsSync(packageFile)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        if (pkg.flowStateDev) {
          features.isFlowStateDevProject = true;
          features.version = pkg.flowStateDev.version || features.version;
        }
      } catch (error) {
        // Invalid package.json, continue
      }
    }

    // Analyze individual features
    features.hasDocumentation = this.checkDocumentationFeature();
    features.hasSecurity = this.checkSecurityFeature();
    features.hasAIContext = this.checkAIContextFeature();
    features.hasGitHubIntegration = this.checkGitHubIntegrationFeature();
    features.hasMemorySystem = this.checkMemorySystemFeature();

    return features;
  }

  /**
   * Analyzes project framework and dependencies
   * @returns {Object} Framework analysis
   */
  async analyzeFramework() {
    const framework = {
      type: 'unknown',
      version: null,
      dependencies: {},
      devDependencies: {},
      scripts: {},
      hasVue: false,
      hasReact: false,
      hasSupabase: false,
      hasVuetify: false,
      hasTailwind: false
    };

    const packageFile = path.join(this.projectPath, 'package.json');
    if (!fs.existsSync(packageFile)) {
      return framework;
    }

    try {
      const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      framework.dependencies = pkg.dependencies || {};
      framework.devDependencies = pkg.devDependencies || {};
      framework.scripts = pkg.scripts || {};

      // Detect framework type
      if (framework.dependencies.vue || framework.devDependencies.vue) {
        framework.type = 'vue';
        framework.hasVue = true;
        framework.version = framework.dependencies.vue || framework.devDependencies.vue;
      } else if (framework.dependencies.react || framework.devDependencies.react) {
        framework.type = 'react';
        framework.hasReact = true;
        framework.version = framework.dependencies.react || framework.devDependencies.react;
      }

      // Detect specific libraries
      framework.hasSupabase = !!(framework.dependencies['@supabase/supabase-js']);
      framework.hasVuetify = !!(framework.dependencies.vuetify);
      framework.hasTailwind = !!(framework.devDependencies.tailwindcss || 
                                framework.dependencies.tailwindcss);

    } catch (error) {
      console.warn(chalk.yellow('⚠️  Could not parse package.json'));
    }

    return framework;
  }

  /**
   * Analyzes Git repository state
   * @returns {Object} Git analysis
   */
  async analyzeGitRepository() {
    const git = {
      isGitRepo: false,
      hasRemote: false,
      isGitHub: false,
      hasCommits: false,
      currentBranch: null,
      remoteUrl: null,
      isDirty: false
    };

    const gitDir = path.join(this.projectPath, '.git');
    if (!fs.existsSync(gitDir)) {
      return git;
    }

    git.isGitRepo = true;

    try {
      // Check for commits
      execSync('git rev-parse HEAD', { cwd: this.projectPath, stdio: 'pipe' });
      git.hasCommits = true;

      // Get current branch
      const branch = execSync('git branch --show-current', {
        cwd: this.projectPath,
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim();
      git.currentBranch = branch;

      // Check for remote
      const remotes = execSync('git remote -v', {
        cwd: this.projectPath,
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim();
      
      if (remotes) {
        git.hasRemote = true;
        const remoteMatch = remotes.match(/origin\s+(.+?)\s+\(fetch\)/);
        if (remoteMatch) {
          git.remoteUrl = remoteMatch[1];
          git.isGitHub = git.remoteUrl.includes('github.com');
        }
      }

      // Check if working directory is dirty
      const status = execSync('git status --porcelain', {
        cwd: this.projectPath,
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim();
      git.isDirty = status.length > 0;

    } catch (error) {
      // Git commands failed, but repo exists
    }

    return git;
  }

  /**
   * Identifies missing or outdated features
   * @returns {Object} Missing features analysis
   */
  async identifyMissingFeatures() {
    if (!this.analysis) {
      await this.analyzeProject();
    }

    const currentVersion = this.analysis.flowStateDev.version;
    const latestVersion = '0.11.1'; // This should come from package.json
    
    const missing = {
      canUpgrade: false,
      currentVersion,
      latestVersion,
      versionBehind: this.compareVersions(latestVersion, currentVersion || '0.0.0'),
      features: []
    };

    // Documentation system (v0.5.0+)
    if (!this.analysis.flowStateDev.hasDocumentation) {
      missing.features.push({
        name: 'Documentation System',
        description: '21+ comprehensive documentation templates',
        sinceVersion: '0.5.0',
        impact: 'high',
        files: ['docs/', 'docs/context/', 'docs/guides/', 'docs/api/', 'docs/architecture/'],
        benefits: ['Complete project documentation', 'AI-optimized context', 'Architecture decision records']
      });
    }

    // Security features (v0.6.0+)
    if (!this.analysis.flowStateDev.hasSecurity) {
      missing.features.push({
        name: 'Security Features',
        description: 'Built-in secret protection and security scanning',
        sinceVersion: '0.6.0',
        impact: 'high',
        files: ['.security/', '.githooks/', 'enhanced .gitignore'],
        benefits: ['Secret detection', 'Pre-commit hooks', 'Security documentation']
      });
    }

    // AI Context (v0.5.0+)
    if (!this.analysis.flowStateDev.hasAIContext) {
      missing.features.push({
        name: 'AI Context Files',
        description: 'Claude Code optimization with .claude/ folder',
        sinceVersion: '0.5.0',
        impact: 'medium',
        files: ['.claude/', '.claude/personality.md', '.claude/code-style.md', '.claude/avoid.md'],
        benefits: ['Better AI assistance', 'Consistent code style', 'Project-specific AI behavior']
      });
    }

    // GitHub Integration (v0.4.0+)
    if (!this.analysis.flowStateDev.hasGitHubIntegration && this.analysis.git.isGitHub) {
      missing.features.push({
        name: 'GitHub Integration',
        description: '66 labels for comprehensive project management',
        sinceVersion: '0.4.0',
        impact: 'medium',
        files: ['GitHub labels', 'issue templates'],
        benefits: ['Better issue tracking', 'Sprint management', 'Project organization']
      });
    }

    // Store Generator (v0.8.0+)
    if (this.analysis.framework.hasVue && !this.checkStoreGeneratorFeature()) {
      missing.features.push({
        name: 'Store Generator',
        description: 'Pinia store generation with fsd store command',
        sinceVersion: '0.8.0',
        impact: 'low',
        files: ['Enhanced CLI capabilities'],
        benefits: ['Rapid store creation', 'Supabase integration', 'Consistent patterns']
      });
    }

    missing.canUpgrade = missing.features.length > 0 || missing.versionBehind > 0;

    return missing;
  }

  /**
   * Generates detailed upgrade plan
   * @returns {Object} Upgrade plan with steps and recommendations
   */
  async generateUpgradePlan() {
    const missingFeatures = await this.identifyMissingFeatures();
    
    const plan = {
      canUpgrade: missingFeatures.canUpgrade,
      totalFeatures: missingFeatures.features.length,
      estimatedTime: this.estimateUpgradeTime(missingFeatures.features),
      recommendations: [],
      phases: [],
      warnings: [],
      requirements: []
    };

    if (!plan.canUpgrade) {
      plan.recommendations.push('✅ Your project is already up to date with Flow State Dev!');
      return plan;
    }

    // Group features by impact and dependencies
    const highImpact = missingFeatures.features.filter(f => f.impact === 'high');
    const mediumImpact = missingFeatures.features.filter(f => f.impact === 'medium');
    const lowImpact = missingFeatures.features.filter(f => f.impact === 'low');

    // Create upgrade phases
    if (highImpact.length > 0) {
      plan.phases.push({
        phase: 1,
        name: 'Core Features',
        description: 'Essential Flow State Dev features',
        features: highImpact,
        estimatedTime: '5-10 minutes'
      });
    }

    if (mediumImpact.length > 0) {
      plan.phases.push({
        phase: 2,
        name: 'Enhancement Features',
        description: 'Productivity and workflow improvements',
        features: mediumImpact,
        estimatedTime: '2-5 minutes'
      });
    }

    if (lowImpact.length > 0) {
      plan.phases.push({
        phase: 3,
        name: 'Optional Features',
        description: 'Nice-to-have additions',
        features: lowImpact,
        estimatedTime: '1-2 minutes'
      });
    }

    // Add recommendations
    plan.recommendations.push(
      '💾 A backup will be created before any changes',
      '🔍 You can preview all changes before applying them',
      '↩️  Full rollback capability is available if needed'
    );

    // Add warnings if needed
    if (this.analysis.git.isDirty) {
      plan.warnings.push('⚠️  Working directory has uncommitted changes. Consider committing first.');
    }

    if (!this.analysis.git.hasRemote) {
      plan.warnings.push('⚠️  No git remote configured. GitHub features will be limited.');
    }

    // Add requirements
    plan.requirements.push('✅ Node.js project detected');
    if (this.analysis.framework.hasVue) {
      plan.requirements.push('✅ Vue.js framework detected');
    }

    return plan;
  }

  // Helper methods for feature detection
  checkDocumentationFeature() {
    const docsDir = path.join(this.projectPath, 'docs');
    const contextDir = path.join(this.projectPath, 'docs', 'context');
    return fs.existsSync(docsDir) && fs.existsSync(contextDir);
  }

  checkSecurityFeature() {
    const securityDir = path.join(this.projectPath, '.security');
    const hooksDir = path.join(this.projectPath, '.githooks');
    return fs.existsSync(securityDir) || fs.existsSync(hooksDir);
  }

  checkAIContextFeature() {
    const claudeDir = path.join(this.projectPath, '.claude');
    return fs.existsSync(claudeDir);
  }

  checkGitHubIntegrationFeature() {
    // This is harder to detect - could check for specific label patterns
    // For now, assume missing unless explicitly marked
    return false;
  }

  checkMemorySystemFeature() {
    // Check if memory integration is configured
    const claudeFile = path.join(this.projectPath, 'CLAUDE.md');
    if (fs.existsSync(claudeFile)) {
      const content = fs.readFileSync(claudeFile, 'utf8');
      return content.includes('Memory System') || content.includes('fsd memory');
    }
    return false;
  }

  checkStoreGeneratorFeature() {
    // Check if project has store generation capability
    const packageFile = path.join(this.projectPath, 'package.json');
    if (fs.existsSync(packageFile)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        return pkg.scripts && pkg.scripts['fsd'] !== undefined;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  // Utility methods
  compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }
    
    return 0;
  }

  estimateUpgradeTime(features) {
    const baseTime = 2; // Base overhead in minutes
    const featureTime = features.length * 1.5; // 1.5 minutes per feature
    return Math.ceil(baseTime + featureTime);
  }
}

/**
 * Convenience function to analyze a project
 * @param {string} projectPath - Path to project to analyze
 * @returns {Object} Complete analysis results
 */
export async function analyzeProject(projectPath = process.cwd()) {
  const analyzer = new ProjectAnalyzer(projectPath);
  return analyzer.analyzeProject();
}

/**
 * Quick function to check if project can be upgraded
 * @param {string} projectPath - Path to project
 * @returns {boolean} Whether upgrade is possible/beneficial
 */
export async function canUpgradeProject(projectPath = process.cwd()) {
  const analyzer = new ProjectAnalyzer(projectPath);
  await analyzer.analyzeProject();
  const missing = await analyzer.identifyMissingFeatures();
  return missing.canUpgrade;
}