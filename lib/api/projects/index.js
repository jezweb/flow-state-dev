/**
 * Projects API
 * 
 * API for discovering and managing existing Flow State Dev projects
 */

import { ProjectScanner } from './scanner.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);

export class ProjectsAPI extends EventEmitter {
  constructor(flowStateAPI) {
    super();
    this.api = flowStateAPI;
    this.scanner = new ProjectScanner();
    this.configPath = join(homedir(), '.fsd', 'projects.json');
    this.projects = new Map();
    
    // Forward scanner events
    this.scanner.on('scan:start', data => this.emit('scan:start', data));
    this.scanner.on('scan:directory', data => this.emit('scan:directory', data));
    this.scanner.on('scan:complete', data => this.emit('scan:complete', data));
    this.scanner.on('scan:error', data => this.emit('scan:error', data));
  }
  
  /**
   * Initialize the projects API
   */
  async initialize() {
    await this.loadProjects();
  }
  
  /**
   * Scan for projects
   * @param {Object} options - Scan options
   * @returns {Promise<Array>} Found projects
   */
  async scan(options = {}) {
    try {
      this.emit('progress', { 
        type: 'scan:start', 
        message: 'Scanning for projects...' 
      });
      
      const paths = options.paths || this.getSearchPaths();
      const projects = await this.scanner.scanDirectories(paths);
      
      // Update stored projects
      projects.forEach(project => {
        this.projects.set(project.path, project);
      });
      
      // Save to disk
      await this.saveProjects();
      
      this.emit('progress', { 
        type: 'scan:complete', 
        message: `Found ${projects.length} projects` 
      });
      
      return projects;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
  
  /**
   * Get all projects
   * @param {Object} filters - Optional filters
   * @returns {Array} Projects
   */
  async list(filters = {}) {
    const projects = Array.from(this.projects.values());
    
    if (!filters || Object.keys(filters).length === 0) {
      return projects;
    }
    
    return projects.filter(project => {
      if (filters.framework && project.framework.name !== filters.framework) {
        return false;
      }
      
      if (filters.hasGit !== undefined && project.hasGit !== filters.hasGit) {
        return false;
      }
      
      if (filters.healthy !== undefined) {
        const isHealthy = project.health.status === 'healthy';
        if (filters.healthy !== isHealthy) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Get a single project
   * @param {string} path - Project path
   * @returns {Object|null} Project info
   */
  async get(path) {
    return this.projects.get(path) || null;
  }
  
  /**
   * Open project in editor
   * @param {string} path - Project path
   * @param {Object} options - Open options
   * @returns {Promise<Object>} Result
   */
  async open(path, options = {}) {
    const project = await this.get(path);
    if (!project) {
      throw new Error(`Project not found: ${path}`);
    }
    
    const editor = options.editor || (await this.detectEditor());
    
    try {
      this.emit('progress', { 
        type: 'open:start', 
        message: `Opening in ${editor}...` 
      });
      
      let command;
      switch (editor) {
        case 'code':
        case 'vscode':
          command = `code "${path}"`;
          break;
        case 'cursor':
          command = `cursor "${path}"`;
          break;
        case 'sublime':
          command = `subl "${path}"`;
          break;
        case 'atom':
          command = `atom "${path}"`;
          break;
        case 'webstorm':
          command = `webstorm "${path}"`;
          break;
        default:
          throw new Error(`Unknown editor: ${editor}`);
      }
      
      await execAsync(command);
      
      this.emit('progress', { 
        type: 'open:complete', 
        message: 'Project opened' 
      });
      
      return { success: true, editor, path };
    } catch (error) {
      this.emit('error', error);
      return { 
        success: false, 
        error: error.message,
        suggestion: 'Make sure the editor is installed and available in PATH'
      };
    }
  }
  
  /**
   * Run a command in a project
   * @param {string} path - Project path
   * @param {string} command - Command to run
   * @returns {Promise<Object>} Result
   */
  async runCommand(path, command) {
    const project = await this.get(path);
    if (!project) {
      throw new Error(`Project not found: ${path}`);
    }
    
    try {
      this.emit('progress', { 
        type: 'command:start', 
        message: `Running ${command}...` 
      });
      
      // Check if command exists in scripts
      const script = project.scripts[command];
      const actualCommand = script ? `npm run ${command}` : command;
      
      const { stdout, stderr } = await execAsync(actualCommand, { cwd: path });
      
      this.emit('progress', { 
        type: 'command:complete', 
        message: 'Command completed' 
      });
      
      return {
        success: true,
        command: actualCommand,
        stdout,
        stderr
      };
    } catch (error) {
      this.emit('error', error);
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      };
    }
  }
  
  /**
   * Get project health report
   * @param {string} path - Project path
   * @returns {Promise<Object>} Health report
   */
  async getHealth(path) {
    const project = await this.scanner.refreshProject(path);
    if (!project) {
      throw new Error(`Project not found: ${path}`);
    }
    
    const report = {
      project: {
        name: project.name,
        path: project.path,
        framework: project.framework
      },
      health: project.health,
      recommendations: []
    };
    
    // Add recommendations
    if (!project.health.hasNodeModules) {
      report.recommendations.push({
        type: 'warning',
        message: 'Dependencies not installed',
        action: 'Run npm install'
      });
    }
    
    if (!project.health.hasLockFile) {
      report.recommendations.push({
        type: 'info',
        message: 'No lock file found',
        action: 'Run npm install to generate package-lock.json'
      });
    }
    
    if (!project.health.hasTests) {
      report.recommendations.push({
        type: 'info',
        message: 'No test scripts found',
        action: 'Add test scripts to package.json'
      });
    }
    
    if (!project.health.hasLinter) {
      report.recommendations.push({
        type: 'info',
        message: 'No linter configured',
        action: 'Consider adding ESLint or Prettier'
      });
    }
    
    return report;
  }
  
  /**
   * Add a project manually
   * @param {string} path - Project path
   * @returns {Promise<Object>} Project info
   */
  async add(path) {
    const projectInfo = await this.scanner.getProjectInfo(path);
    if (!projectInfo) {
      throw new Error('Not a valid Flow State Dev project');
    }
    
    this.projects.set(path, projectInfo);
    await this.saveProjects();
    
    return projectInfo;
  }
  
  /**
   * Remove a project from the list
   * @param {string} path - Project path
   * @returns {Promise<boolean>} Success
   */
  async remove(path) {
    const deleted = this.projects.delete(path);
    if (deleted) {
      await this.saveProjects();
    }
    return deleted;
  }
  
  /**
   * Get search paths
   */
  getSearchPaths() {
    const settings = this.loadSettings();
    return settings.searchPaths || this.scanner.defaultPaths;
  }
  
  /**
   * Update search paths
   */
  async updateSearchPaths(paths) {
    const settings = this.loadSettings();
    settings.searchPaths = paths;
    await this.saveSettings(settings);
  }
  
  /**
   * Load projects from disk
   */
  async loadProjects() {
    if (!existsSync(this.configPath)) {
      return;
    }
    
    try {
      const data = JSON.parse(readFileSync(this.configPath, 'utf8'));
      this.projects.clear();
      
      data.projects.forEach(project => {
        this.projects.set(project.path, project);
      });
    } catch (error) {
      this.emit('error', { 
        message: 'Failed to load projects', 
        error: error.message 
      });
    }
  }
  
  /**
   * Save projects to disk
   */
  async saveProjects() {
    const dir = dirname(this.configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    const data = {
      version: '1.0',
      lastScan: new Date().toISOString(),
      projects: Array.from(this.projects.values())
    };
    
    writeFileSync(this.configPath, JSON.stringify(data, null, 2));
  }
  
  /**
   * Load settings
   */
  loadSettings() {
    const settingsPath = join(homedir(), '.fsd', 'settings.json');
    if (!existsSync(settingsPath)) {
      return {};
    }
    
    try {
      return JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch {
      return {};
    }
  }
  
  /**
   * Save settings
   */
  async saveSettings(settings) {
    const settingsPath = join(homedir(), '.fsd', 'settings.json');
    const dir = dirname(settingsPath);
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }
  
  /**
   * Detect available editor
   */
  async detectEditor() {
    const editors = ['code', 'cursor', 'subl', 'atom', 'webstorm'];
    
    for (const editor of editors) {
      try {
        await execAsync(`which ${editor}`);
        return editor;
      } catch {
        // Editor not found
      }
    }
    
    return 'code'; // Default to VS Code
  }
}