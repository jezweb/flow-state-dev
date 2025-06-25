/**
 * Tests for BackupManager
 */
import { BackupManager } from '../../lib/migration/backup.js';
import { createTestDir } from '../utils/test-helpers.js';
import { join } from 'path';
import fs from 'fs-extra';

describe('BackupManager', () => {
  let testDir;
  let backupManager;
  
  beforeEach(async () => {
    testDir = await createTestDir('backup-test');
    backupManager = new BackupManager(testDir);
  });
  
  afterEach(async () => {
    // Clean up any backups created during tests
    try {
      await fs.remove(join(testDir, '.fsd-backups'));
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  
  describe('Backup Creation', () => {
    test('should create backup with default settings', async () => {
      // Create some test files
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-project',
        version: '1.0.0'
      });
      await fs.ensureDir(join(testDir, 'src'));
      await fs.writeFile(join(testDir, 'src/main.js'), 'console.log("test")');
      
      const backupId = await backupManager.createBackup();
      
      expect(backupId).toMatch(/^backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-z0-9]{6}$/);
      
      // Verify backup directory exists
      const backupPath = join(testDir, '.fsd-backups', backupId);
      expect(await fs.pathExists(backupPath)).toBe(true);
      
      // Verify files were copied
      expect(await fs.pathExists(join(backupPath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(join(backupPath, 'src/main.js'))).toBe(true);
      
      // Verify metadata
      const metadataPath = join(backupPath, 'backup-metadata.json');
      const metadata = await fs.readJson(metadataPath);
      expect(metadata.id).toBe(backupId);
      expect(metadata.fileCount).toBe(2);
      expect(metadata.files).toContain('package.json');
      expect(metadata.files).toContain('src/main.js');
    });
    
    test('should exclude node_modules by default', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      await fs.ensureDir(join(testDir, 'node_modules/some-package'));
      await fs.writeFile(join(testDir, 'node_modules/some-package/index.js'), 'module.exports = {}');
      
      const backupId = await backupManager.createBackup();
      
      const backupPath = join(testDir, '.fsd-backups', backupId);
      expect(await fs.pathExists(join(backupPath, 'node_modules'))).toBe(false);
    });
    
    test('should include node_modules when specified', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      await fs.ensureDir(join(testDir, 'node_modules/some-package'));
      await fs.writeFile(join(testDir, 'node_modules/some-package/index.js'), 'module.exports = {}');
      
      const backupId = await backupManager.createBackup({
        includeNodeModules: true
      });
      
      const backupPath = join(testDir, '.fsd-backups', backupId);
      expect(await fs.pathExists(join(backupPath, 'node_modules/some-package/index.js'))).toBe(true);
    });
    
    test('should exclude .git by default', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      await fs.ensureDir(join(testDir, '.git'));
      await fs.writeFile(join(testDir, '.git/config'), '[core]');
      
      const backupId = await backupManager.createBackup();
      
      const backupPath = join(testDir, '.fsd-backups', backupId);
      expect(await fs.pathExists(join(backupPath, '.git'))).toBe(false);
    });
    
    test('should include .git when specified', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      await fs.ensureDir(join(testDir, '.git'));
      await fs.writeFile(join(testDir, '.git/config'), '[core]');
      
      const backupId = await backupManager.createBackup({
        includeGit: true
      });
      
      const backupPath = join(testDir, '.fsd-backups', backupId);
      expect(await fs.pathExists(join(backupPath, '.git/config'))).toBe(true);
    });
    
    test('should handle backup creation failure', async () => {
      // Create a situation that would cause backup to fail
      // (e.g., no write permissions - simulate by trying to backup to read-only location)
      const badBackupManager = new BackupManager('/nonexistent/readonly/path');
      
      await expect(badBackupManager.createBackup()).rejects.toThrow();
    });
    
    test('should clean up on backup failure', async () => {
      // Mock a scenario where backup fails after directory creation
      const originalCopyProjectFiles = backupManager.copyProjectFiles;
      backupManager.copyProjectFiles = jest.fn().mockRejectedValue(new Error('Copy failed'));
      
      await expect(backupManager.createBackup()).rejects.toThrow('Copy failed');
      
      // Verify partial backup was cleaned up
      const backupDir = join(testDir, '.fsd-backups');
      if (await fs.pathExists(backupDir)) {
        const backups = await fs.readdir(backupDir);
        // Should only contain index.json, no partial backup directories
        expect(backups.filter(f => f.startsWith('backup-'))).toHaveLength(0);
      }
      
      // Restore original method
      backupManager.copyProjectFiles = originalCopyProjectFiles;
    });
  });
  
  describe('Backup Restoration', () => {
    test('should restore backup successfully', async () => {
      // Create original content
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'original-project',
        version: '1.0.0'
      });
      await fs.writeFile(join(testDir, 'README.md'), '# Original');
      
      // Create backup
      const backupId = await backupManager.createBackup();
      
      // Modify content
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'modified-project',
        version: '2.0.0'
      });
      await fs.writeFile(join(testDir, 'README.md'), '# Modified');
      await fs.writeFile(join(testDir, 'new-file.txt'), 'new content');
      
      // Restore backup
      await backupManager.restoreBackup(backupId, {
        confirmOverwrite: false,
        createCurrentBackup: false
      });
      
      // Verify restoration
      const restoredPackage = await fs.readJson(join(testDir, 'package.json'));
      expect(restoredPackage.name).toBe('original-project');
      expect(restoredPackage.version).toBe('1.0.0');
      
      const restoredReadme = await fs.readFile(join(testDir, 'README.md'), 'utf-8');
      expect(restoredReadme).toBe('# Original');
      
      // New file should be gone
      expect(await fs.pathExists(join(testDir, 'new-file.txt'))).toBe(false);
    });
    
    test('should create current backup before restore', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'original' });
      const backupId = await backupManager.createBackup();
      
      await fs.writeJson(join(testDir, 'package.json'), { name: 'modified' });
      
      const initialBackupCount = (await backupManager.listBackups()).length;
      
      await backupManager.restoreBackup(backupId, {
        confirmOverwrite: false,
        createCurrentBackup: true
      });
      
      const finalBackupCount = (await backupManager.listBackups()).length;
      expect(finalBackupCount).toBe(initialBackupCount + 1);
    });
    
    test('should fail for non-existent backup', async () => {
      await expect(
        backupManager.restoreBackup('non-existent-backup')
      ).rejects.toThrow('Backup not found: non-existent-backup');
    });
    
    test('should preserve backup directory during restore', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      const backupId = await backupManager.createBackup();
      
      await backupManager.restoreBackup(backupId, {
        confirmOverwrite: false,
        createCurrentBackup: false
      });
      
      // Backup directory should still exist
      expect(await fs.pathExists(join(testDir, '.fsd-backups'))).toBe(true);
      expect(await fs.pathExists(join(testDir, '.fsd-backups', backupId))).toBe(true);
    });
  });
  
  describe('Backup Management', () => {
    test('should list backups', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'test' });
      
      const backupId1 = await backupManager.createBackup({
        description: 'First backup'
      });
      
      const backupId2 = await backupManager.createBackup({
        description: 'Second backup'
      });
      
      const backups = await backupManager.listBackups();
      
      expect(backups).toHaveLength(2);
      expect(backups.map(b => b.id)).toContain(backupId1);
      expect(backups.map(b => b.id)).toContain(backupId2);
      expect(backups.find(b => b.id === backupId1)?.description).toBe('First backup');
    });
    
    test('should get backup info', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'info-test' });
      
      const backupId = await backupManager.createBackup({
        description: 'Info test backup'
      });
      
      const info = await backupManager.getBackupInfo(backupId);
      
      expect(info.id).toBe(backupId);
      expect(info.description).toBe('Info test backup');
      expect(info.projectPath).toBe(testDir);
      expect(info.fileCount).toBeGreaterThan(0);
      expect(info.files).toContain('package.json');
    });
    
    test('should delete backup', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'delete-test' });
      
      const backupId = await backupManager.createBackup();
      
      // Verify backup exists
      expect(await fs.pathExists(join(testDir, '.fsd-backups', backupId))).toBe(true);
      
      await backupManager.deleteBackup(backupId);
      
      // Verify backup is gone
      expect(await fs.pathExists(join(testDir, '.fsd-backups', backupId))).toBe(false);
      
      const backups = await backupManager.listBackups();
      expect(backups.find(b => b.id === backupId)).toBeUndefined();
    });
    
    test('should fail to delete non-existent backup', async () => {
      await expect(
        backupManager.deleteBackup('non-existent-backup')
      ).rejects.toThrow('Backup not found: non-existent-backup');
    });
  });
  
  describe('Backup Cleanup', () => {
    test('should cleanup old backups by age', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'cleanup-test' });
      
      // Create a backup
      const backupId = await backupManager.createBackup();
      
      // Manually modify backup timestamp to make it appear old
      const backupPath = join(testDir, '.fsd-backups', backupId);
      const metadataPath = join(backupPath, 'backup-metadata.json');
      const metadata = await fs.readJson(metadataPath);
      
      // Set timestamp to 35 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      metadata.timestamp = oldDate.toISOString();
      
      await fs.writeJson(metadataPath, metadata);
      
      // Update index with old timestamp
      const indexPath = join(testDir, '.fsd-backups', 'index.json');
      const index = await fs.readJson(indexPath);
      index.backups[0].timestamp = oldDate.toISOString();
      await fs.writeJson(indexPath, index);
      
      const result = await backupManager.cleanupOldBackups({
        maxAge: 30,
        maxCount: 10
      });
      
      expect(result.deleted).toBe(1);
      expect(result.message).toContain('Cleaned up 1 old backups');
      
      // Verify backup was deleted
      expect(await fs.pathExists(backupPath)).toBe(false);
    });
    
    test('should cleanup backups by count limit', async () => {
      await fs.writeJson(join(testDir, 'package.json'), { name: 'count-test' });
      
      // Create multiple backups
      const backupIds = [];
      for (let i = 0; i < 5; i++) {
        const backupId = await backupManager.createBackup({
          description: `Backup ${i}`
        });
        backupIds.push(backupId);
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const result = await backupManager.cleanupOldBackups({
        maxAge: 365, // Don't delete by age
        maxCount: 3   // Keep only 3 newest
      });
      
      expect(result.deleted).toBe(2);
      
      const remainingBackups = await backupManager.listBackups();
      expect(remainingBackups).toHaveLength(3);
      
      // Should keep the 3 newest backups
      const remainingIds = remainingBackups.map(b => b.id);
      expect(remainingIds).toContain(backupIds[4]); // Newest
      expect(remainingIds).toContain(backupIds[3]);
      expect(remainingIds).toContain(backupIds[2]);
      expect(remainingIds).not.toContain(backupIds[1]); // Oldest should be deleted
      expect(remainingIds).not.toContain(backupIds[0]);
    });
    
    test('should handle cleanup with no backups', async () => {
      const result = await backupManager.cleanupOldBackups();
      
      expect(result.deleted).toBe(0);
      expect(result.message).toBe('No backups to clean up');
    });
  });
  
  describe('Utility Functions', () => {
    test('should format file sizes correctly', () => {
      expect(backupManager.formatSize(0)).toBe('0 Bytes');
      expect(backupManager.formatSize(1024)).toBe('1.00 KB');
      expect(backupManager.formatSize(1048576)).toBe('1.00 MB');
      expect(backupManager.formatSize(1073741824)).toBe('1.00 GB');
    });
    
    test('should generate unique backup IDs', () => {
      const id1 = backupManager.generateBackupId();
      const id2 = backupManager.generateBackupId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-z0-9]{6}$/);
      expect(id2).toMatch(/^backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-z0-9]{6}$/);
    });
    
    test('should calculate relative time correctly', () => {
      const now = new Date();
      
      const hoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
      expect(backupManager.getRelativeTime(hoursAgo)).toBe('2 hours ago');
      
      const daysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
      expect(backupManager.getRelativeTime(daysAgo)).toBe('3 days ago');
      
      const minutesAgo = new Date(now.getTime() - (30 * 60 * 1000));
      expect(backupManager.getRelativeTime(minutesAgo)).toBe('30 minutes ago');
    });
    
    test('should exclude files based on patterns', () => {
      const patterns = ['*.log', 'node_modules', '.cache'];
      
      expect(backupManager.shouldExclude('error.log', '/path/error.log', patterns)).toBe(true);
      expect(backupManager.shouldExclude('node_modules', '/path/node_modules', patterns)).toBe(true);
      expect(backupManager.shouldExclude('.cache', '/path/.cache', patterns)).toBe(true);
      expect(backupManager.shouldExclude('package.json', '/path/package.json', patterns)).toBe(false);
      expect(backupManager.shouldExclude('src', '/path/src', patterns)).toBe(false);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle corrupt backup index', async () => {
      // Create corrupt index file
      const indexPath = join(testDir, '.fsd-backups', 'index.json');
      await fs.ensureDir(join(testDir, '.fsd-backups'));
      await fs.writeFile(indexPath, 'invalid json');
      
      const backups = await backupManager.listBackups();
      expect(backups).toEqual([]);
    });
    
    test('should handle missing backup index', async () => {
      const backups = await backupManager.listBackups();
      expect(backups).toEqual([]);
    });
    
    test('should handle missing backup metadata', async () => {
      await expect(
        backupManager.getBackupInfo('non-existent-backup')
      ).rejects.toThrow('Backup metadata not found: non-existent-backup');
    });
  });
});