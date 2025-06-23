/**
 * Environment Detector
 * Automatically detects development environment, tools, and patterns
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for detection results
const detectionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class EnvironmentDetector {
  constructor() {
    this.results = {};
    this.silent = false;
  }

  /**
   * Run all detections
   */
  async detect(options = {}) {
    this.silent = options.silent || false;
    
    // Check cache first
    const cacheKey = 'full-detection';
    const cached = this.getCached(cacheKey);
    if (cached && !options.force) {
      return cached;
    }
    
    if (!this.silent) {
      console.log(chalk.blue('\n🔍 Analyzing your development environment...\n'));
    }
    
    // Run detections in parallel where possible
    const [system, tools, project, editor] = await Promise.all([
      this.detectSystem(),
      this.detectDevelopmentTools(),
      this.detectProjectPatterns(options.projectPath),
      this.detectEditor()
    ]);
    
    // Git detection needs to be separate as it might fail
    const git = await this.detectGitConfig();
    
    this.results = {
      system,
      tools,
      project,
      editor,
      git,
      timestamp: new Date().toISOString()
    };
    
    // Cache results
    this.setCache(cacheKey, this.results);
    
    return this.results;
  }

  /**
   * Detect system information
   */
  async detectSystem() {
    const system = {
      os: this.getOSDetails(),
      arch: process.arch,
      nodeVersion: process.version,
      npmVersion: this.getCommandOutput('npm --version'),
      shell: this.getShellInfo(),
      username: os.userInfo().username,
      homedir: os.homedir(),
      cpus: os.cpus().length,
      memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + 'GB'
    };
    
    return system;
  }

  /**
   * Get detailed OS information
   */
  getOSDetails() {
    const platform = process.platform;
    let details = { platform, name: platform, version: '' };
    
    try {
      if (platform === 'darwin') {
        details.name = 'macOS';
        details.version = this.getCommandOutput('sw_vers -productVersion');
      } else if (platform === 'win32') {
        details.name = 'Windows';
        details.version = os.release();
      } else if (platform === 'linux') {
        // Try to get distribution info
        if (fs.existsSync('/etc/os-release')) {
          const osRelease = fs.readFileSync('/etc/os-release', 'utf-8');
          const nameMatch = osRelease.match(/PRETTY_NAME="(.+)"/);
          const versionMatch = osRelease.match(/VERSION_ID="(.+)"/);
          if (nameMatch) {
            details.name = nameMatch[1];
          }
          if (versionMatch) {
            details.version = versionMatch[1];
          }
        } else {
          details.name = 'Linux';
        }
      }
    } catch (error) {
      // Fallback to basic info
    }
    
    return details;
  }

  /**
   * Get shell information
   */
  getShellInfo() {
    const shell = process.env.SHELL ? path.basename(process.env.SHELL) : 'unknown';
    const info = { name: shell };
    
    // Detect shell enhancements
    if (shell === 'zsh' && process.env.ZSH) {
      info.enhancement = 'oh-my-zsh';
    } else if (shell === 'bash' && fs.existsSync(path.join(os.homedir(), '.bashrc'))) {
      const bashrc = fs.readFileSync(path.join(os.homedir(), '.bashrc'), 'utf-8');
      if (bashrc.includes('bash-it')) {
        info.enhancement = 'bash-it';
      }
    }
    
    return info;
  }

  /**
   * Detect development tools
   */
  async detectDevelopmentTools() {
    const tools = {
      packageManagers: {},
      versionControl: {},
      databases: {},
      containers: {},
      cloudCLIs: {},
      languages: {},
      buildTools: {}
    };
    
    // Package managers
    const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'];
    for (const pm of packageManagers) {
      const version = this.getCommandVersion(pm);
      if (version) {
        tools.packageManagers[pm] = version;
      }
    }
    
    // Version control
    tools.versionControl.git = this.getCommandVersion('git');
    tools.versionControl.gh = this.getCommandVersion('gh');
    
    // Databases
    const databases = [
      { cmd: 'psql', name: 'postgresql' },
      { cmd: 'mysql', name: 'mysql' },
      { cmd: 'mongosh', name: 'mongodb' },
      { cmd: 'redis-cli', name: 'redis' }
    ];
    
    for (const db of databases) {
      const version = this.getCommandVersion(db.cmd);
      if (version) {
        tools.databases[db.name] = version;
      }
    }
    
    // Containers
    tools.containers.docker = this.getCommandVersion('docker');
    tools.containers.podman = this.getCommandVersion('podman');
    
    // Cloud CLIs
    tools.cloudCLIs.aws = this.getCommandVersion('aws');
    tools.cloudCLIs.gcloud = this.getCommandVersion('gcloud');
    tools.cloudCLIs.az = this.getCommandVersion('az');
    tools.cloudCLIs.supabase = this.getCommandVersion('supabase');
    
    // Programming languages
    tools.languages.python = this.getCommandVersion('python3') || this.getCommandVersion('python');
    tools.languages.go = this.getCommandVersion('go');
    tools.languages.rust = this.getCommandVersion('rustc');
    tools.languages.java = this.getCommandVersion('java');
    
    // Build tools
    tools.buildTools.make = this.getCommandVersion('make');
    tools.buildTools.gradle = this.getCommandVersion('gradle');
    tools.buildTools.maven = this.getCommandVersion('mvn');
    
    return tools;
  }

  /**
   * Detect project patterns
   */
  async detectProjectPatterns(projectPath = process.cwd()) {
    const patterns = {
      framework: null,
      language: null,
      testing: null,
      linting: null,
      bundler: null,
      dependencies: [],
      structure: {}
    };
    
    // Check package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        
        // Detect framework
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.vue) {
          patterns.framework = 'vue' + (deps.vue.startsWith('^3') ? '3' : '2');
        } else if (deps.react) {
          patterns.framework = 'react';
        } else if (deps.svelte) {
          patterns.framework = 'svelte';
        } else if (deps.angular) {
          patterns.framework = 'angular';
        }
        
        // Detect UI libraries
        if (deps.vuetify) patterns.dependencies.push('vuetify');
        if (deps['tailwindcss']) patterns.dependencies.push('tailwind');
        if (deps['@mui/material']) patterns.dependencies.push('material-ui');
        
        // Detect testing
        if (deps.vitest) patterns.testing = 'vitest';
        else if (deps.jest) patterns.testing = 'jest';
        else if (deps.mocha) patterns.testing = 'mocha';
        
        // Detect bundler
        if (deps.vite) patterns.bundler = 'vite';
        else if (deps.webpack) patterns.bundler = 'webpack';
        else if (deps.parcel) patterns.bundler = 'parcel';
        
        // Detect linting
        if (deps.eslint) patterns.linting = 'eslint';
        if (deps.prettier) patterns.dependencies.push('prettier');
      } catch (error) {
        // Invalid package.json
      }
    }
    
    // Check for TypeScript
    if (fs.existsSync(path.join(projectPath, 'tsconfig.json'))) {
      patterns.language = 'typescript';
    }
    
    // Check project structure
    const dirs = ['src', 'components', 'pages', 'views', 'api', 'lib', 'utils', 'tests', 'docs'];
    for (const dir of dirs) {
      if (fs.existsSync(path.join(projectPath, dir))) {
        patterns.structure[dir] = true;
      }
    }
    
    return patterns;
  }

  /**
   * Detect editor/IDE
   */
  async detectEditor() {
    const editors = {
      primary: null,
      installed: []
    };
    
    // Check for editor config files
    const configChecks = [
      { file: '.vscode', editor: 'vscode' },
      { file: '.idea', editor: 'intellij' },
      { file: '.sublime-project', editor: 'sublime' },
      { file: '.atom', editor: 'atom' }
    ];
    
    for (const check of configChecks) {
      if (fs.existsSync(path.join(process.cwd(), check.file))) {
        editors.installed.push(check.editor);
        if (!editors.primary) {
          editors.primary = check.editor;
        }
      }
    }
    
    // Check running processes (platform specific)
    if (process.platform === 'darwin') {
      const processes = this.getCommandOutput('ps aux | grep -E "(Visual Studio Code|WebStorm|Sublime|Atom)" | grep -v grep') || '';
      if (processes.includes('Visual Studio Code')) editors.primary = 'vscode';
      else if (processes.includes('WebStorm')) editors.primary = 'webstorm';
    }
    
    // Check environment variables
    if (process.env.VSCODE_PID) editors.primary = 'vscode';
    if (process.env.IDEA_INITIAL_DIRECTORY) editors.primary = 'intellij';
    
    return editors;
  }

  /**
   * Detect Git configuration
   */
  async detectGitConfig() {
    const gitConfig = {
      user: {},
      remote: null,
      branch: null
    };
    
    try {
      // Get user info
      gitConfig.user.name = this.getCommandOutput('git config user.name');
      gitConfig.user.email = this.getCommandOutput('git config user.email');
      
      // Get current branch
      gitConfig.branch = this.getCommandOutput('git branch --show-current');
      
      // Get remote URL
      gitConfig.remote = this.getCommandOutput('git config --get remote.origin.url');
      
      // Parse GitHub username from remote
      if (gitConfig.remote && gitConfig.remote.includes('github.com')) {
        const match = gitConfig.remote.match(/github\.com[:/]([^/]+)/);
        if (match) {
          gitConfig.user.github = match[1];
        }
      }
    } catch (error) {
      // Not a git repository or git not installed
    }
    
    return gitConfig;
  }

  /**
   * Get command output
   */
  getCommandOutput(command) {
    try {
      return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get command version
   */
  getCommandVersion(command) {
    const versionFlags = ['--version', '-v', 'version', '-V'];
    
    for (const flag of versionFlags) {
      try {
        const output = execSync(`${command} ${flag}`, { encoding: 'utf-8', stdio: 'pipe' }).trim();
        // Extract version number
        const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          return versionMatch[1];
        }
        return output.split('\n')[0]; // Return first line as fallback
      } catch (error) {
        // Try next flag
      }
    }
    
    return null;
  }

  /**
   * Format detection results for display
   */
  formatResults(results = this.results) {
    const output = [];
    
    // System info
    output.push(chalk.white('System:'));
    output.push(`  • OS: ${results.system.os.name} ${results.system.os.version}`);
    output.push(`  • Shell: ${results.system.shell.name}${results.system.shell.enhancement ? ' with ' + results.system.shell.enhancement : ''}`);
    output.push(`  • Node.js: ${results.system.nodeVersion}`);
    
    // Development tools
    if (Object.keys(results.tools.packageManagers).length > 0) {
      output.push(chalk.white('\nPackage Managers:'));
      for (const [pm, version] of Object.entries(results.tools.packageManagers)) {
        output.push(`  • ${pm}: v${version}`);
      }
    }
    
    // Editor
    if (results.editor.primary) {
      output.push(chalk.white('\nEditor:'));
      output.push(`  • ${this.formatEditorName(results.editor.primary)}`);
    }
    
    // Project info
    if (results.project.framework) {
      output.push(chalk.white('\nProject:'));
      output.push(`  • Framework: ${results.project.framework}`);
      if (results.project.language) {
        output.push(`  • Language: ${results.project.language}`);
      }
      if (results.project.testing) {
        output.push(`  • Testing: ${results.project.testing}`);
      }
    }
    
    // Git
    if (results.git.user.email) {
      output.push(chalk.white('\nGit:'));
      output.push(`  • User: ${results.git.user.name} <${results.git.user.email}>`);
      if (results.git.user.github) {
        output.push(`  • GitHub: ${results.git.user.github}`);
      }
    }
    
    return output.join('\n');
  }

  /**
   * Format editor name for display
   */
  formatEditorName(editor) {
    const names = {
      vscode: 'Visual Studio Code',
      intellij: 'IntelliJ IDEA',
      webstorm: 'WebStorm',
      sublime: 'Sublime Text',
      atom: 'Atom',
      vim: 'Vim',
      emacs: 'Emacs'
    };
    
    return names[editor] || editor;
  }

  /**
   * Get suggested tech stack based on detection
   */
  getSuggestedTechStack(results = this.results) {
    const stack = [];
    
    // Add framework
    if (results.project.framework) {
      stack.push(results.project.framework);
    }
    
    // Add UI libraries
    if (results.project.dependencies.includes('vuetify')) {
      stack.push('vuetify');
    }
    if (results.project.dependencies.includes('tailwind')) {
      stack.push('tailwind');
    }
    
    // Add language
    if (results.project.language === 'typescript') {
      stack.push('typescript');
    }
    
    // Add backend suggestions based on tools
    if (results.tools.databases.postgresql) {
      stack.push('postgresql');
    }
    if (results.tools.cloudCLIs.supabase) {
      stack.push('supabase');
    }
    
    // Add container tools
    if (results.tools.containers.docker) {
      stack.push('docker');
    }
    
    return stack;
  }

  /**
   * Get cache with TTL
   */
  getCached(key) {
    const cached = detectionCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      detectionCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set cache
   */
  setCache(key, data) {
    detectionCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const environmentDetector = new EnvironmentDetector();