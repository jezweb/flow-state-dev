/**
 * Project Scanner
 * 
 * Discovers and indexes Flow State Dev projects on the filesystem
 */

import { existsSync, readFileSync, statSync, readdirSync } from 'fs';
import { join, basename, resolve } from 'path';
import { homedir } from 'os';
import EventEmitter from 'events';

export class ProjectScanner extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Default search paths
    this.defaultPaths = [
      join(homedir(), 'claude'),
      join(homedir(), 'projects'),
      join(homedir(), 'dev'),
      join(homedir(), 'code'),
      join(homedir(), 'workspace'),
      join(homedir(), 'Documents', 'projects'),
      join(homedir(), 'Desktop', 'projects')
    ];
    
    // Configuration
    this.searchPaths = options.searchPaths || this.defaultPaths;
    this.maxDepth = options.maxDepth || 3;
    this.excludePatterns = options.excludePatterns || [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.cache',
      'coverage',
      'tmp',
      'temp'
    ];
    
    // Cache
    this.cache = new Map();
    this.lastScanTime = null;
  }
  
  /**
   * Scan directories for Flow State Dev projects
   * @param {string[]} paths - Optional paths to scan
   * @returns {Promise<Array>} Found projects
   */
  async scanDirectories(paths) {
    const searchPaths = paths || this.searchPaths;
    const projects = [];
    const visited = new Set();
    
    this.emit('scan:start', { paths: searchPaths });
    
    for (const searchPath of searchPaths) {
      if (!existsSync(searchPath)) continue;
      
      const resolvedPath = resolve(searchPath);
      if (visited.has(resolvedPath)) continue;
      visited.add(resolvedPath);
      
      this.emit('scan:directory', { path: searchPath });
      
      try {
        const foundProjects = await this.scanDirectory(resolvedPath, 0);
        projects.push(...foundProjects);
      } catch (error) {
        this.emit('scan:error', { path: searchPath, error: error.message });
      }
    }
    
    // Update cache
    this.lastScanTime = Date.now();
    projects.forEach(project => {
      this.cache.set(project.path, project);
    });
    
    this.emit('scan:complete', { 
      projectCount: projects.length,
      duration: Date.now() - this.lastScanTime 
    });
    
    return projects;
  }
  
  /**
   * Scan a single directory recursively
   */
  async scanDirectory(dirPath, depth) {
    const projects = [];
    
    // Check if this directory is a project
    const projectInfo = await this.checkIfProject(dirPath);
    if (projectInfo) {
      projects.push(projectInfo);
      return projects; // Don't scan inside projects
    }
    
    // Don't go too deep
    if (depth >= this.maxDepth) {
      return projects;
    }
    
    // Scan subdirectories
    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        // Skip excluded directories
        if (this.excludePatterns.includes(entry.name)) continue;
        if (entry.name.startsWith('.') && entry.name !== '.fsd') continue;
        
        const subPath = join(dirPath, entry.name);
        const subProjects = await this.scanDirectory(subPath, depth + 1);
        projects.push(...subProjects);
      }
    } catch (error) {
      // Ignore permission errors
      if (error.code !== 'EACCES' && error.code !== 'EPERM') {
        this.emit('scan:error', { path: dirPath, error: error.message });
      }
    }
    
    return projects;
  }
  
  /**
   * Check if a directory is a Flow State Dev project
   */
  async checkIfProject(dirPath) {
    // Check for Flow State Dev markers
    const markers = [
      'CLAUDE.md',
      '.fsd-project',
      join('.claude', 'settings.json')
    ];
    
    for (const marker of markers) {
      if (existsSync(join(dirPath, marker))) {
        return this.getProjectInfo(dirPath);
      }
    }
    
    // Check package.json for flow-state-dev
    const packageJsonPath = join(dirPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        if (deps['flow-state-dev'] || packageJson.name === 'flow-state-dev') {
          return this.getProjectInfo(dirPath);
        }
      } catch (error) {
        // Invalid package.json
      }
    }
    
    return null;
  }
  
  /**
   * Get detailed information about a project
   */
  async getProjectInfo(projectPath) {
    try {
      const stats = statSync(projectPath);
      const name = basename(projectPath);
      
      // Read package.json if available
      let packageInfo = {};
      const packageJsonPath = join(projectPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          packageInfo = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        } catch {}
      }
      
      // Detect framework
      const framework = this.detectFramework(projectPath, packageInfo);
      
      // Check for git
      const hasGit = existsSync(join(projectPath, '.git'));
      
      // Get last modified time
      const lastModified = stats.mtime;
      
      // Check health indicators
      const health = await this.checkProjectHealth(projectPath, packageInfo);
      
      return {
        name: packageInfo.name || name,
        displayName: this.formatProjectName(packageInfo.name || name),
        path: projectPath,
        framework,
        version: packageInfo.version || '0.0.0',
        description: packageInfo.description || '',
        lastModified,
        hasGit,
        health,
        scripts: packageInfo.scripts || {},
        dependencies: Object.keys(packageInfo.dependencies || {}),
        devDependencies: Object.keys(packageInfo.devDependencies || {})
      };
    } catch (error) {
      this.emit('project:error', { path: projectPath, error: error.message });
      return null;
    }
  }
  
  /**
   * Detect the framework used in a project
   */
  detectFramework(projectPath, packageInfo) {
    const deps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies
    };
    
    // Check for frameworks
    if (deps.vue) return { name: 'vue', version: deps.vue };
    if (deps.react) return { name: 'react', version: deps.react };
    if (deps.svelte || deps['@sveltejs/kit']) return { name: 'sveltekit', version: deps['@sveltejs/kit'] };
    if (deps.next) return { name: 'nextjs', version: deps.next };
    if (deps.nuxt) return { name: 'nuxt', version: deps.nuxt };
    if (deps.angular) return { name: 'angular', version: deps.angular };
    
    // Check for Vite
    if (deps.vite) return { name: 'vite', version: deps.vite };
    
    return { name: 'unknown', version: null };
  }
  
  /**
   * Check project health indicators
   */
  async checkProjectHealth(projectPath, packageInfo) {
    const health = {
      hasNodeModules: existsSync(join(projectPath, 'node_modules')),
      hasLockFile: existsSync(join(projectPath, 'package-lock.json')) || 
                   existsSync(join(projectPath, 'yarn.lock')) ||
                   existsSync(join(projectPath, 'pnpm-lock.yaml')),
      hasTests: this.hasTests(packageInfo),
      hasLinter: this.hasLinter(packageInfo),
      hasTypeScript: existsSync(join(projectPath, 'tsconfig.json')),
      hasDocs: existsSync(join(projectPath, 'README.md')) || 
                existsSync(join(projectPath, 'docs')),
      status: 'healthy' // Can be: healthy, warning, error
    };
    
    // Determine overall status
    if (!health.hasNodeModules) {
      health.status = 'warning';
      health.message = 'Dependencies not installed';
    } else if (!health.hasLockFile) {
      health.status = 'warning';
      health.message = 'No lock file found';
    }
    
    return health;
  }
  
  /**
   * Check if project has tests
   */
  hasTests(packageInfo) {
    const scripts = packageInfo.scripts || {};
    return !!(scripts.test || scripts['test:unit'] || scripts['test:e2e']);
  }
  
  /**
   * Check if project has linter
   */
  hasLinter(packageInfo) {
    const scripts = packageInfo.scripts || {};
    const deps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies
    };
    
    return !!(scripts.lint || deps.eslint || deps.prettier);
  }
  
  /**
   * Format project name for display
   */
  formatProjectName(name) {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Get cached projects
   */
  getCachedProjects() {
    return Array.from(this.cache.values());
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.lastScanTime = null;
  }
  
  /**
   * Refresh a single project
   */
  async refreshProject(projectPath) {
    const projectInfo = await this.getProjectInfo(projectPath);
    if (projectInfo) {
      this.cache.set(projectPath, projectInfo);
    } else {
      this.cache.delete(projectPath);
    }
    return projectInfo;
  }
}