/**
 * System Diagnostics Utility
 * 
 * Simple diagnostics for checking system requirements
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import os from 'os';

export class SystemDiagnostics {
  /**
   * Get system information
   */
  async getSystemInfo() {
    return {
      platform: process.platform,
      version: os.release(),
      arch: process.arch,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: os.cpus()[0].model
    };
  }
  
  /**
   * Get npm version
   */
  async getNpmVersion() {
    try {
      return execSync('npm --version', { encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  }
  
  /**
   * Get git version
   */
  async getGitVersion() {
    try {
      const output = execSync('git --version', { encoding: 'utf8' }).trim();
      return output.replace('git version ', '');
    } catch {
      return null;
    }
  }
  
  /**
   * Check if current directory is a git repository
   */
  async isGitRepository() {
    return existsSync('.git');
  }
  
  /**
   * Get npm registry URL
   */
  async getNpmRegistry() {
    try {
      return execSync('npm config get registry', { encoding: 'utf8' }).trim();
    } catch {
      return 'https://registry.npmjs.org/';
    }
  }
  
  /**
   * Check npm registry access
   */
  async checkNpmAccess() {
    try {
      execSync('npm ping', { encoding: 'utf8' });
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Check if in a Flow State Dev project
   */
  async isFlowStateProject() {
    if (!existsSync('package.json')) return false;
    
    try {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
      return pkg.devDependencies?.['flow-state-dev'] || 
             pkg.dependencies?.['flow-state-dev'] ||
             pkg.name === 'flow-state-dev';
    } catch {
      return false;
    }
  }
  
  /**
   * Get project information
   */
  async getProjectInfo() {
    const info = {
      packageJson: null,
      hasNodeModules: existsSync('node_modules'),
      hasLockFile: existsSync('package-lock.json') || existsSync('yarn.lock'),
      hasGit: existsSync('.git')
    };
    
    if (existsSync('package.json')) {
      try {
        info.packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      } catch {}
    }
    
    return info;
  }
  
  /**
   * Check network connectivity
   */
  async checkConnection(url) {
    try {
      // Simple connectivity check using curl or wget
      const command = process.platform === 'win32' ? 
        `powershell -Command "Invoke-WebRequest -Uri ${url} -UseBasicParsing -TimeoutSec 5"` :
        `curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 ${url}`;
      
      execSync(command, { encoding: 'utf8' });
      return true;
    } catch {
      return false;
    }
  }
}