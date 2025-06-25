/**
 * Backup Manager for project migration
 * Handles creating, storing, and restoring project backups
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname, basename, relative } from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import chalk from 'chalk';

export class BackupManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.backupDir = join(projectPath, '.fsd-backups');
    this.backupIndex = join(this.backupDir, 'index.json');
    
    this.ensureBackupDirectory();
  }

  /**
   * Ensure backup directory exists
   */
  ensureBackupDirectory() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a backup of the current project
   */
  async createBackup(options = {}) {
    const config = {
      includeNodeModules: false,
      includeGit: false,
      compression: false,
      description: 'Pre-migration backup',
      ...options
    };

    const backupId = this.generateBackupId();
    const backupPath = join(this.backupDir, backupId);
    
    console.log(chalk.blue(`Creating backup: ${backupId}`));
    
    try {
      // Create backup directory
      mkdirSync(backupPath, { recursive: true });
      
      // Create backup metadata
      const metadata = {
        id: backupId,
        timestamp: new Date().toISOString(),
        description: config.description,
        projectPath: this.projectPath,
        config,
        fileCount: 0,
        totalSize: 0,
        files: []
      };

      // Copy project files
      const stats = await this.copyProjectFiles(backupPath, config);
      metadata.fileCount = stats.fileCount;
      metadata.totalSize = stats.totalSize;
      metadata.files = stats.files;

      // Save metadata
      writeFileSync(
        join(backupPath, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      // Update backup index
      await this.updateBackupIndex(metadata);
      
      console.log(chalk.green(`✅ Backup created successfully`));
      console.log(chalk.gray(`   Files: ${metadata.fileCount}`));
      console.log(chalk.gray(`   Size: ${this.formatSize(metadata.totalSize)}`));
      
      return backupId;
      
    } catch (error) {
      console.error(chalk.red('Failed to create backup:'), error.message);
      
      // Cleanup failed backup
      if (existsSync(backupPath)) {
        await fs.remove(backupPath);
      }
      
      throw error;
    }
  }

  /**
   * Copy project files to backup location
   */
  async copyProjectFiles(backupPath, config) {
    const stats = {
      fileCount: 0,
      totalSize: 0,
      files: []
    };

    const excludePatterns = [
      'node_modules',
      '.git',
      '.fsd-backups',
      'dist',
      'build',
      '.cache',
      '.tmp',
      '.temp',
      '*.log'
    ];

    // Add conditional excludes
    if (!config.includeNodeModules) {
      excludePatterns.push('node_modules');
    }
    
    if (!config.includeGit) {
      excludePatterns.push('.git');
    }

    await this.copyDirectory(this.projectPath, backupPath, excludePatterns, stats);
    
    return stats;
  }

  /**
   * Recursively copy directory with exclusions
   */
  async copyDirectory(sourcePath, targetPath, excludePatterns, stats) {
    const items = readdirSync(sourcePath);
    
    for (const item of items) {
      const sourceItemPath = join(sourcePath, item);
      const targetItemPath = join(targetPath, item);
      
      // Check if item should be excluded
      if (this.shouldExclude(item, sourceItemPath, excludePatterns)) {
        continue;
      }
      
      const itemStat = statSync(sourceItemPath);
      
      if (itemStat.isDirectory()) {
        mkdirSync(targetItemPath, { recursive: true });
        await this.copyDirectory(sourceItemPath, targetItemPath, excludePatterns, stats);
      } else {
        // Copy file
        copyFileSync(sourceItemPath, targetItemPath);
        
        stats.fileCount++;
        stats.totalSize += itemStat.size;
        stats.files.push(relative(this.projectPath, sourceItemPath));
      }
    }
  }

  /**
   * Check if item should be excluded from backup
   */
  shouldExclude(itemName, itemPath, excludePatterns) {
    return excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        // Simple glob pattern matching
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(itemName);
      }
      return itemName === pattern || itemPath.includes(pattern);
    });
  }

  /**
   * Restore a backup
   */
  async restoreBackup(backupId, options = {}) {
    const config = {
      confirmOverwrite: true,
      createCurrentBackup: true,
      ...options
    };

    const backupPath = join(this.backupDir, backupId);
    
    if (!existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    console.log(chalk.blue(`Restoring backup: ${backupId}`));

    try {
      // Read backup metadata
      const metadataPath = join(backupPath, 'backup-metadata.json');
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
      
      // Create backup of current state if requested
      if (config.createCurrentBackup) {
        console.log(chalk.blue('Creating backup of current state...'));
        await this.createBackup({
          description: `Pre-restore backup (before restoring ${backupId})`
        });
      }

      // Clear current project (except backups)
      console.log(chalk.blue('Clearing current project files...'));
      await this.clearProject();

      // Restore files
      console.log(chalk.blue('Restoring files...'));
      await this.restoreFiles(backupPath);
      
      console.log(chalk.green('✅ Backup restored successfully'));
      console.log(chalk.gray(`   Restored: ${metadata.fileCount} files`));
      
    } catch (error) {
      console.error(chalk.red('Failed to restore backup:'), error.message);
      throw error;
    }
  }

  /**
   * Clear current project files (except backups)
   */
  async clearProject() {
    const items = readdirSync(this.projectPath);
    
    for (const item of items) {
      if (item === '.fsd-backups') {
        continue; // Don't delete backups
      }
      
      const itemPath = join(this.projectPath, item);
      await fs.remove(itemPath);
    }
  }

  /**
   * Restore files from backup
   */
  async restoreFiles(backupPath) {
    const items = readdirSync(backupPath);
    
    for (const item of items) {
      if (item === 'backup-metadata.json') {
        continue; // Skip metadata file
      }
      
      const sourceItemPath = join(backupPath, item);
      const targetItemPath = join(this.projectPath, item);
      
      await fs.copy(sourceItemPath, targetItemPath);
    }
  }

  /**
   * List all backups
   */
  async listBackups() {
    if (!existsSync(this.backupIndex)) {
      return [];
    }

    try {
      const index = JSON.parse(readFileSync(this.backupIndex, 'utf-8'));
      return index.backups || [];
    } catch (error) {
      console.error('Failed to read backup index:', error.message);
      return [];
    }
  }

  /**
   * Get backup information
   */
  async getBackupInfo(backupId) {
    const backupPath = join(this.backupDir, backupId);
    const metadataPath = join(backupPath, 'backup-metadata.json');
    
    if (!existsSync(metadataPath)) {
      throw new Error(`Backup metadata not found: ${backupId}`);
    }

    return JSON.parse(readFileSync(metadataPath, 'utf-8'));
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId) {
    const backupPath = join(this.backupDir, backupId);
    
    if (!existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    console.log(chalk.blue(`Deleting backup: ${backupId}`));
    
    try {
      await fs.remove(backupPath);
      await this.removeFromBackupIndex(backupId);
      
      console.log(chalk.green('✅ Backup deleted successfully'));
      
    } catch (error) {
      console.error(chalk.red('Failed to delete backup:'), error.message);
      throw error;
    }
  }

  /**
   * Cleanup old backups
   */
  async cleanupOldBackups(options = {}) {
    const config = {
      maxAge: 30, // days
      maxCount: 10,
      ...options
    };

    const backups = await this.listBackups();
    
    if (backups.length === 0) {
      return { deleted: 0, message: 'No backups to clean up' };
    }

    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (config.maxAge * 24 * 60 * 60 * 1000));
    
    let deletedCount = 0;
    
    for (let i = 0; i < backups.length; i++) {
      const backup = backups[i];
      const backupDate = new Date(backup.timestamp);
      
      // Delete if too old or exceeds max count
      if (backupDate < cutoffDate || i >= config.maxCount) {
        try {
          await this.deleteBackup(backup.id);
          deletedCount++;
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to delete backup ${backup.id}: ${error.message}`));
        }
      }
    }

    return {
      deleted: deletedCount,
      message: `Cleaned up ${deletedCount} old backups`
    };
  }

  /**
   * Update backup index
   */
  async updateBackupIndex(metadata) {
    let index = { backups: [] };
    
    if (existsSync(this.backupIndex)) {
      try {
        index = JSON.parse(readFileSync(this.backupIndex, 'utf-8'));
      } catch (error) {
        console.warn('Failed to read backup index, creating new one');
      }
    }

    // Add new backup (keep only essential info in index)
    index.backups.push({
      id: metadata.id,
      timestamp: metadata.timestamp,
      description: metadata.description,
      fileCount: metadata.fileCount,
      totalSize: metadata.totalSize
    });

    writeFileSync(this.backupIndex, JSON.stringify(index, null, 2));
  }

  /**
   * Remove backup from index
   */
  async removeFromBackupIndex(backupId) {
    if (!existsSync(this.backupIndex)) {
      return;
    }

    try {
      const index = JSON.parse(readFileSync(this.backupIndex, 'utf-8'));
      index.backups = index.backups.filter(backup => backup.id !== backupId);
      writeFileSync(this.backupIndex, JSON.stringify(index, null, 2));
    } catch (error) {
      console.warn('Failed to update backup index:', error.message);
    }
  }

  /**
   * Generate backup ID
   */
  generateBackupId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `backup-${timestamp}-${random}`;
  }

  /**
   * Format file size for display
   */
  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    
    return `${size} ${sizes[i]}`;
  }

  /**
   * Display backup information
   */
  async displayBackups() {
    const backups = await this.listBackups();
    
    if (backups.length === 0) {
      console.log(chalk.gray('No backups found.'));
      return;
    }

    console.log(chalk.cyan('📦 Available Backups:\n'));
    
    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    for (const backup of backups) {
      const age = this.getRelativeTime(new Date(backup.timestamp));
      
      console.log(chalk.blue(`${backup.id}`));
      console.log(`  Description: ${backup.description}`);
      console.log(`  Created: ${age}`);
      console.log(`  Files: ${backup.fileCount}`);
      console.log(`  Size: ${this.formatSize(backup.totalSize)}`);
      console.log('');
    }
  }

  /**
   * Get relative time from timestamp
   */
  getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  }
}