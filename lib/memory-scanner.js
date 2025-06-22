import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Scanner to find existing memory files
 */
export class MemoryScanner {
  constructor() {
    this.foundFiles = [];
    this.homeDir = os.homedir();
  }

  /**
   * Scan for existing memory files
   */
  async scan() {
    this.foundFiles = [];
    
    // Common locations for Claude memory files
    const searchPaths = [
      path.join(this.homeDir, '.claude', 'CLAUDE.md'),
      path.join(this.homeDir, 'CLAUDE.md'),
      path.join(this.homeDir, '.config', 'claude', 'memory.md'),
      path.join(this.homeDir, 'Documents', 'CLAUDE.md'),
      path.join(this.homeDir, 'claude', 'CLAUDE.md'),
    ];

    // Check each path
    for (const filePath of searchPaths) {
      if (await fs.pathExists(filePath)) {
        const stats = await fs.stat(filePath);
        this.foundFiles.push({
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    }

    // Search recent git repositories
    try {
      const gitDirs = await this.findRecentGitRepos();
      for (const dir of gitDirs) {
        const claudeMd = path.join(dir, 'CLAUDE.md');
        if (await fs.pathExists(claudeMd)) {
          const stats = await fs.stat(claudeMd);
          this.foundFiles.push({
            path: claudeMd,
            size: stats.size,
            modified: stats.mtime,
            isProjectFile: true
          });
        }
      }
    } catch (error) {
      // Silently fail if git search doesn't work
    }

    return this.foundFiles;
  }

  /**
   * Find recent git repositories
   */
  async findRecentGitRepos() {
    const repos = [];
    const searchDirs = [
      path.join(this.homeDir, 'projects'),
      path.join(this.homeDir, 'code'),
      path.join(this.homeDir, 'dev'),
      path.join(this.homeDir, 'workspace'),
      path.join(this.homeDir, 'claude'),
    ];

    for (const dir of searchDirs) {
      if (await fs.pathExists(dir)) {
        try {
          const subdirs = await fs.readdir(dir);
          for (const subdir of subdirs) {
            const fullPath = path.join(dir, subdir);
            const gitPath = path.join(fullPath, '.git');
            if (await fs.pathExists(gitPath)) {
              repos.push(fullPath);
            }
          }
        } catch (error) {
          // Skip directories we can't read
        }
      }
    }

    // Sort by most recently modified
    const repoStats = await Promise.all(
      repos.map(async (repo) => {
        try {
          const stats = await fs.stat(repo);
          return { path: repo, mtime: stats.mtime };
        } catch {
          return null;
        }
      })
    );

    return repoStats
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 10) // Top 10 most recent
      .map(r => r.path);
  }

  /**
   * Format found files for display
   */
  formatResults() {
    if (this.foundFiles.length === 0) {
      return chalk.yellow('No existing memory files found.');
    }

    const lines = [chalk.blue('\nFound memory files:')];
    
    this.foundFiles.forEach((file, index) => {
      const size = (file.size / 1024).toFixed(1) + 'KB';
      const modified = file.modified.toLocaleDateString();
      const type = file.isProjectFile ? chalk.gray(' (project)') : '';
      
      lines.push(
        chalk.white(`${index + 1}. ${file.path}${type}`) +
        chalk.gray(` - ${size}, modified ${modified}`)
      );
    });

    return lines.join('\n');
  }
}