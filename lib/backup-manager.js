/**
 * Backup Manager for Flow State Dev Project Retrofit
 * 
 * Creates timestamped backups before applying changes and provides
 * rollback capability for safe project modifications.
 */
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import crypto from 'crypto';

export class BackupManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = path.resolve(projectPath);
    this.backupDir = path.join(this.projectPath, '.fsd-backups');
  }

  /**
   * Creates a complete backup of the project
   * @param {string} description - Optional description for the backup
   * @returns {Object} Backup metadata
   */
  async createBackup(description = 'Pre-upgrade backup') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupId = `backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupId);

    console.log(chalk.blue(`💾 Creating backup: ${backupId}`));

    // Ensure backup directory exists
    await fs.ensureDir(this.backupDir);

    // Create backup metadata
    const metadata = {
      id: backupId,
      timestamp: new Date().toISOString(),
      description,
      projectPath: this.projectPath,
      files: [],
      gitCommit: null,
      size: 0
    };

    try {
      // Get current git commit if available
      try {
        metadata.gitCommit = execSync('git rev-parse HEAD', {
          cwd: this.projectPath,
          stdio: 'pipe',
          encoding: 'utf8'
        }).trim();
      } catch (error) {
        // Not a git repo or no commits
      }

      // Copy project files (excluding sensitive/large directories)
      const filesToBackup = await this.getFilesToBackup();
      
      for (const file of filesToBackup) {
        const sourcePath = path.join(this.projectPath, file);
        const destPath = path.join(backupPath, file);
        
        // Ensure destination directory exists
        await fs.ensureDir(path.dirname(destPath));
        
        // Copy file or directory
        await fs.copy(sourcePath, destPath, {
          filter: (src) => !this.shouldIgnoreFile(path.relative(this.projectPath, src))
        });
        
        metadata.files.push(file);
      }

      // Calculate backup size
      metadata.size = await this.calculateDirectorySize(backupPath);

      // Save metadata
      await fs.writeJson(path.join(backupPath, '.backup-metadata.json'), metadata, { spaces: 2 });

      // Update backup index
      await this.updateBackupIndex(metadata);

      console.log(chalk.green(`✅ Backup created: ${metadata.size} files, ${this.formatSize(metadata.size)} bytes`));
      
      return metadata;

    } catch (error) {
      // Clean up failed backup
      await fs.remove(backupPath);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Lists all available backups
   * @returns {Array} Array of backup metadata
   */
  async listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const backups = [];
    const entries = await fs.readdir(this.backupDir);

    for (const entry of entries) {
      if (entry.startsWith('backup-')) {
        const metadataPath = path.join(this.backupDir, entry, '.backup-metadata.json');
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = await fs.readJson(metadataPath);
            backups.push(metadata);
          } catch (error) {
            console.warn(chalk.yellow(`⚠️  Could not read backup metadata: ${entry}`));
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Restores project from a backup
   * @param {string} backupId - ID of backup to restore
   * @param {Object} options - Restore options
   * @returns {boolean} Success status
   */
  async restoreFromBackup(backupId, options = {}) {
    const backupPath = path.join(this.backupDir, backupId);
    const metadataPath = path.join(backupPath, '.backup-metadata.json');

    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    console.log(chalk.yellow(`🔄 Restoring from backup: ${backupId}`));

    try {
      const metadata = await fs.readJson(metadataPath);
      
      // Confirm restore if not forced
      if (!options.force) {
        console.log(chalk.yellow('⚠️  This will overwrite current project files!'));
        console.log(chalk.gray(`   Backup: ${metadata.description}`));
        console.log(chalk.gray(`   Created: ${new Date(metadata.timestamp).toLocaleString()}`));
        console.log(chalk.gray(`   Files: ${metadata.files.length}`));
        
        // In a real implementation, you'd want to prompt for confirmation here
        if (!options.skipConfirmation) {
          throw new Error('Restore cancelled - use --force to skip confirmation');
        }
      }

      // Create a backup of current state before restoring
      if (!options.skipBackup) {
        await this.createBackup(`Pre-restore backup before restoring ${backupId}`);
      }

      // Restore files
      let restoredCount = 0;
      for (const file of metadata.files) {
        const sourcePath = path.join(backupPath, file);
        const destPath = path.join(this.projectPath, file);
        
        if (fs.existsSync(sourcePath)) {
          await fs.ensureDir(path.dirname(destPath));
          await fs.copy(sourcePath, destPath);
          restoredCount++;
        }
      }

      console.log(chalk.green(`✅ Restored ${restoredCount} files from backup`));
      
      // If backup included git commit, show info
      if (metadata.gitCommit) {
        console.log(chalk.blue(`📝 Original git commit: ${metadata.gitCommit.slice(0, 7)}`));
      }

      return true;

    } catch (error) {
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  /**
   * Deletes old backups to save space
   * @param {Object} options - Cleanup options
   */
  async cleanupOldBackups(options = {}) {
    const { keepCount = 5, keepDays = 30 } = options;
    const backups = await this.listBackups();
    
    if (backups.length <= keepCount) {
      console.log(chalk.green(`✅ No cleanup needed (${backups.length} backups, keeping ${keepCount})`));
      return;
    }

    const cutoffDate = new Date(Date.now() - (keepDays * 24 * 60 * 60 * 1000));
    const toDelete = [];
    
    // Keep recent backups by count
    const recentBackups = backups.slice(0, keepCount);
    const oldBackups = backups.slice(keepCount);
    
    // From old backups, only delete those older than cutoff
    for (const backup of oldBackups) {
      const backupDate = new Date(backup.timestamp);
      if (backupDate < cutoffDate) {
        toDelete.push(backup);
      }
    }

    if (toDelete.length === 0) {
      console.log(chalk.green('✅ No old backups to cleanup'));
      return;
    }

    console.log(chalk.yellow(`🧹 Cleaning up ${toDelete.length} old backups...`));
    
    for (const backup of toDelete) {
      const backupPath = path.join(this.backupDir, backup.id);
      try {
        await fs.remove(backupPath);
        console.log(chalk.gray(`   Deleted: ${backup.id}`));
      } catch (error) {
        console.warn(chalk.yellow(`   Failed to delete: ${backup.id}`));
      }
    }

    console.log(chalk.green(`✅ Cleanup complete`));
  }

  /**
   * Gets the total size of all backups
   * @returns {Object} Size information
   */
  async getBackupInfo() {
    if (!fs.existsSync(this.backupDir)) {
      return { count: 0, totalSize: 0, formatted: '0 bytes' };
    }

    const backups = await this.listBackups();
    const totalSize = await this.calculateDirectorySize(this.backupDir);

    return {
      count: backups.length,
      totalSize,
      formatted: this.formatSize(totalSize),
      backups: backups.map(b => ({
        id: b.id,
        description: b.description,
        timestamp: b.timestamp,
        size: b.size
      }))
    };
  }

  /**
   * Determines which files should be backed up
   * @returns {Array} List of relative file paths
   */
  async getFilesToBackup() {
    const files = [];
    const items = await fs.readdir(this.projectPath);
    
    for (const item of items) {
      if (!this.shouldIgnoreFile(item)) {
        files.push(item);
      }
    }
    
    return files;
  }

  /**
   * Determines if a file/directory should be ignored in backups
   * @param {string} filePath - Relative path from project root
   * @returns {boolean} Whether to ignore
   */
  shouldIgnoreFile(filePath) {
    const ignorePatterns = [
      'node_modules',
      '.git',
      '.fsd-backups',
      'dist',
      'build',
      '.next',
      '.nuxt',
      'target',
      'bin',
      '*.log',
      '.DS_Store',
      'Thumbs.db',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local'
    ];

    const fileName = path.basename(filePath);
    
    return ignorePatterns.some(pattern => {
      if (pattern.includes('*')) {
        return fileName.endsWith(pattern.replace('*', ''));
      }
      return fileName === pattern || filePath.includes(pattern);
    });
  }

  /**
   * Updates the backup index file
   * @param {Object} metadata - Backup metadata
   */
  async updateBackupIndex(metadata) {
    const indexPath = path.join(this.backupDir, '.backup-index.json');
    let index = { backups: [] };
    
    if (fs.existsSync(indexPath)) {
      try {
        index = await fs.readJson(indexPath);
      } catch (error) {
        // Create new index if corrupted
      }
    }
    
    // Add new backup to index
    index.backups = index.backups || [];
    index.backups.push({
      id: metadata.id,
      timestamp: metadata.timestamp,
      description: metadata.description,
      fileCount: metadata.files.length,
      size: metadata.size
    });
    
    // Keep index sorted and limited
    index.backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    index.backups = index.backups.slice(0, 50); // Keep last 50 entries
    
    await fs.writeJson(indexPath, index, { spaces: 2 });
  }

  /**
   * Calculates total size of a directory
   * @param {string} dirPath - Directory path
   * @returns {number} Size in bytes
   */
  async calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    async function getSize(itemPath) {
      try {
        const stats = await fs.stat(itemPath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
        } else if (stats.isDirectory()) {
          const items = await fs.readdir(itemPath);
          for (const item of items) {
            await getSize(path.join(itemPath, item));
          }
        }
      } catch (error) {
        // Ignore errors (file might be deleted, etc.)
      }
    }
    
    await getSize(dirPath);
    return totalSize;
  }

  /**
   * Formats byte size for human reading
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

/**
 * Convenience function to create a backup
 * @param {string} projectPath - Project path
 * @param {string} description - Backup description
 * @returns {Object} Backup metadata
 */
export async function createBackup(projectPath = process.cwd(), description) {
  const manager = new BackupManager(projectPath);
  return manager.createBackup(description);
}

/**
 * Convenience function to restore from backup
 * @param {string} backupId - Backup ID to restore
 * @param {string} projectPath - Project path
 * @param {Object} options - Restore options
 */
export async function restoreBackup(backupId, projectPath = process.cwd(), options = {}) {
  const manager = new BackupManager(projectPath);
  return manager.restoreFromBackup(backupId, options);
}