/**
 * Doctor API
 * 
 * API for system diagnostics and health checks
 */

// TODO: Import DoctorCommand when implemented
// import { DoctorCommand } from '../../commands/doctor/index.js';
import { SystemDiagnostics } from '../../utils/system-diagnostics.js';
import EventEmitter from 'events';

export class DoctorAPI extends EventEmitter {
  constructor(flowStateAPI) {
    super();
    this.api = flowStateAPI;
    this.diagnostics = null;
  }
  
  /**
   * Initialize doctor API
   */
  async initialize() {
    this.diagnostics = new SystemDiagnostics();
  }
  
  /**
   * Run full diagnostics
   * @returns {Object} Diagnostic results
   */
  async runDiagnostics() {
    this.emit('progress', { 
      step: 'diagnostics:start', 
      message: 'Running system diagnostics...' 
    });
    
    const results = {
      timestamp: new Date().toISOString(),
      system: await this.checkSystem(),
      node: await this.checkNode(),
      git: await this.checkGit(),
      npm: await this.checkNpm(),
      project: await this.checkProject(),
      network: await this.checkNetwork(),
      summary: null
    };
    
    // Calculate summary
    results.summary = this.calculateSummary(results);
    
    this.emit('progress', { 
      step: 'diagnostics:complete', 
      message: 'Diagnostics complete' 
    });
    
    return results;
  }
  
  /**
   * Check system information
   */
  async checkSystem() {
    try {
      const info = await this.diagnostics.getSystemInfo();
      return {
        status: 'ok',
        platform: info.platform,
        version: info.version,
        arch: info.arch,
        memory: {
          total: info.memory.total,
          free: info.memory.free,
          used: info.memory.used
        },
        cpu: info.cpu
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Check Node.js installation
   */
  async checkNode() {
    try {
      const nodeVersion = process.version;
      const npmVersion = await this.diagnostics.getNpmVersion();
      
      // Check minimum version
      const minVersion = '18.0.0';
      const isSupported = this.compareVersions(nodeVersion.slice(1), minVersion) >= 0;
      
      return {
        status: isSupported ? 'ok' : 'warning',
        version: nodeVersion,
        npmVersion,
        supported: isSupported,
        minimum: minVersion,
        message: isSupported ? 
          'Node.js version is supported' : 
          `Node.js ${minVersion} or higher is recommended`
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Check Git installation
   */
  async checkGit() {
    try {
      const gitVersion = await this.diagnostics.getGitVersion();
      const isRepo = await this.diagnostics.isGitRepository();
      
      return {
        status: 'ok',
        version: gitVersion,
        isRepository: isRepo,
        message: 'Git is properly installed'
      };
    } catch (error) {
      return {
        status: 'warning',
        error: error.message,
        message: 'Git is not installed or not accessible'
      };
    }
  }
  
  /**
   * Check npm registry access
   */
  async checkNpm() {
    try {
      const registry = await this.diagnostics.getNpmRegistry();
      const canAccess = await this.diagnostics.checkNpmAccess();
      
      return {
        status: canAccess ? 'ok' : 'warning',
        registry,
        accessible: canAccess,
        message: canAccess ? 
          'npm registry is accessible' : 
          'Cannot access npm registry'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Check current project
   */
  async checkProject() {
    try {
      const isProject = await this.diagnostics.isFlowStateProject();
      
      if (!isProject) {
        return {
          status: 'info',
          isProject: false,
          message: 'Not in a Flow State Dev project directory'
        };
      }
      
      const projectInfo = await this.diagnostics.getProjectInfo();
      const healthChecks = await this.runProjectHealthChecks(projectInfo);
      
      return {
        status: healthChecks.hasErrors ? 'warning' : 'ok',
        isProject: true,
        info: projectInfo,
        health: healthChecks,
        message: healthChecks.hasErrors ? 
          'Project has some issues' : 
          'Project is healthy'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Check network connectivity
   */
  async checkNetwork() {
    try {
      const checks = {
        npm: await this.diagnostics.checkConnection('https://registry.npmjs.org'),
        github: await this.diagnostics.checkConnection('https://api.github.com'),
        google: await this.diagnostics.checkConnection('https://google.com')
      };
      
      const allGood = Object.values(checks).every(v => v);
      
      return {
        status: allGood ? 'ok' : 'warning',
        connectivity: checks,
        message: allGood ? 
          'Network connectivity is good' : 
          'Some network endpoints are unreachable'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Run project health checks
   */
  async runProjectHealthChecks(projectInfo) {
    const checks = [];
    const errors = [];
    const warnings = [];
    
    // Check package.json
    if (!projectInfo.packageJson) {
      errors.push('Missing package.json');
    } else {
      checks.push({
        name: 'package.json',
        status: 'ok',
        message: 'Valid package.json found'
      });
    }
    
    // Check dependencies
    if (projectInfo.hasNodeModules) {
      checks.push({
        name: 'dependencies',
        status: 'ok',
        message: 'Dependencies installed'
      });
    } else {
      warnings.push('Dependencies not installed');
    }
    
    // Check for common issues
    if (projectInfo.hasLockFile) {
      checks.push({
        name: 'lock-file',
        status: 'ok',
        message: 'Package lock file exists'
      });
    }
    
    return {
      checks,
      errors,
      warnings,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0
    };
  }
  
  /**
   * Calculate overall summary
   */
  calculateSummary(results) {
    const statuses = Object.values(results)
      .filter(r => r && r.status)
      .map(r => r.status);
    
    const hasErrors = statuses.includes('error');
    const hasWarnings = statuses.includes('warning');
    
    return {
      overallStatus: hasErrors ? 'error' : (hasWarnings ? 'warning' : 'ok'),
      errors: statuses.filter(s => s === 'error').length,
      warnings: statuses.filter(s => s === 'warning').length,
      message: hasErrors ? 
        'System has errors that need attention' :
        (hasWarnings ? 
          'System is functional with some warnings' : 
          'System is healthy and ready')
    };
  }
  
  /**
   * Compare semantic versions
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    
    return 0;
  }
}