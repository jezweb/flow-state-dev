/**
 * Tests for ProjectMigrator
 */
import { ProjectMigrator } from '../../lib/migration/migrator.js';
import { ProjectAnalyzer } from '../../lib/migration/analyzer.js';
import { BackupManager } from '../../lib/migration/backup.js';
import { createTestDir } from '../utils/test-helpers.js';
import { join } from 'path';
import fs from 'fs-extra';

describe('ProjectMigrator', () => {
  let testDir;
  let migrator;
  
  beforeEach(async () => {
    testDir = await createTestDir('migrator-test');
    migrator = new ProjectMigrator(testDir, {
      dryRun: true, // Use dry run for most tests
      autoBackup: false,
      confirmSteps: false,
      verbose: false
    });
  });
  
  describe('Transformer Registration', () => {
    test('should register transformers by project type', () => {
      const mockTransformer = {
        migratePreMigration: jest.fn(),
        migrateDependencies: jest.fn()
      };
      
      migrator.registerTransformer('vue-vuetify', mockTransformer);
      
      const transformer = migrator.getTransformer('vue-vuetify');
      expect(transformer).toBe(mockTransformer);
    });
    
    test('should find transformers with partial matches', () => {
      const mockTransformer = {
        migratePreMigration: jest.fn()
      };
      
      migrator.registerTransformer('vue', mockTransformer);
      
      const transformer = migrator.getTransformer('vue-vuetify');
      expect(transformer).toBe(mockTransformer);
    });
    
    test('should find transformers with framework fallback', () => {
      const mockTransformer = {
        migratePreMigration: jest.fn()
      };
      
      migrator.registerTransformer('vue', mockTransformer);
      
      const transformer = migrator.getTransformer('vue-custom-variant');
      expect(transformer).toBe(mockTransformer);
    });
    
    test('should return null for unknown transformers', () => {
      const transformer = migrator.getTransformer('unknown-framework');
      expect(transformer).toBeNull();
    });
  });
  
  describe('Migration Process', () => {
    test('should execute complete migration process in dry run', async () => {
      // Create a simple Vue project
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-migration',
        dependencies: {
          vue: '^3.4.0'
        }
      });
      
      // Mock transformer
      const mockTransformer = {
        migratePreMigration: jest.fn().mockResolvedValue(undefined),
        migrateDependencies: jest.fn().mockResolvedValue(undefined),
        migrateConfiguration: jest.fn().mockResolvedValue(undefined),
        migrateFileStructure: jest.fn().mockResolvedValue(undefined),
        migrateSourceCode: jest.fn().mockResolvedValue(undefined),
        migratePostMigration: jest.fn().mockResolvedValue(undefined)
      };
      
      migrator.registerTransformer('vue-basic', mockTransformer);
      
      const result = await migrator.migrate();
      
      expect(result.success).toBe(true);
      expect(mockTransformer.migratePreMigration).toHaveBeenCalled();
      expect(mockTransformer.migrateDependencies).toHaveBeenCalled();
      expect(mockTransformer.migrateConfiguration).toHaveBeenCalled();
      expect(mockTransformer.migrateFileStructure).toHaveBeenCalled();
      expect(mockTransformer.migrateSourceCode).toHaveBeenCalled();
      expect(mockTransformer.migratePostMigration).toHaveBeenCalled();
    });
    
    test('should handle transformer errors', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-migration',
        dependencies: {
          vue: '^3.4.0'
        }
      });
      
      const mockTransformer = {
        migratePreMigration: jest.fn().mockResolvedValue(undefined),
        migrateDependencies: jest.fn().mockRejectedValue(new Error('Dependencies migration failed'))
      };
      
      migrator.registerTransformer('vue-basic', mockTransformer);
      
      const result = await migrator.migrate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Dependencies migration failed');
      expect(result.phase).toBe('dependencies');
    });
    
    test('should skip non-existent transformer methods', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-migration',
        dependencies: {
          vue: '^3.4.0'
        }
      });
      
      const mockTransformer = {
        migratePreMigration: jest.fn().mockResolvedValue(undefined)
        // Other methods missing - should be skipped
      };
      
      migrator.registerTransformer('vue-basic', mockTransformer);
      
      const result = await migrator.migrate();
      
      expect(result.success).toBe(true);
      expect(mockTransformer.migratePreMigration).toHaveBeenCalled();
    });
    
    test('should fail if no transformer available', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'test-migration',
        dependencies: {
          'unknown-framework': '^1.0.0'
        }
      });
      
      const result = await migrator.migrate();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No transformer available');
    });
  });
  
  describe('Backup Management', () => {
    test('should create backup when autoBackup is enabled', async () => {
      const migratorWithBackup = new ProjectMigrator(testDir, {
        dryRun: false,
        autoBackup: true,
        confirmSteps: false
      });
      
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'backup-test'
      });
      
      const backupId = await migratorWithBackup.createBackup();
      
      expect(backupId).toBeDefined();
      expect(backupId).toContain('backup-');
      expect(migratorWithBackup.migrationLog.some(log => 
        log.type === 'backup_created'
      )).toBe(true);
    });
    
    test('should skip backup in dry run mode', async () => {
      const backupId = await migrator.createBackup();
      
      expect(backupId).toBe('dry-run-backup');
    });
  });
  
  describe('Migration Validation', () => {
    test('should validate package.json after migration', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'validation-test',
        version: '1.0.0'
      });
      
      const validation = await migrator.validateMigration();
      
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
    
    test('should detect invalid package.json', async () => {
      await fs.writeFile(join(testDir, 'package.json'), 'invalid json');
      
      const validation = await migrator.validateMigration();
      
      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain('Invalid package.json after migration');
    });
    
    test('should warn about missing expected files', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'missing-files-test'
      });
      
      const validation = await migrator.validateMigration();
      
      expect(validation.warnings.some(warning => 
        warning.includes('Missing expected file: src/main.js')
      )).toBe(true);
    });
  });
  
  describe('Rollback Functionality', () => {
    test('should rollback to backup successfully', async () => {
      const realMigrator = new ProjectMigrator(testDir, {
        dryRun: false,
        confirmSteps: false
      });
      
      // Create some initial content
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'rollback-test',
        version: '1.0.0'
      });
      
      // Create backup
      const backupManager = new BackupManager(testDir);
      const backupId = await backupManager.createBackup();
      
      // Modify content
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'modified-project',
        version: '2.0.0'
      });
      
      // Rollback
      const success = await realMigrator.rollback(backupId);
      
      expect(success).toBe(true);
      
      // Verify rollback
      const restoredPackage = await fs.readJson(join(testDir, 'package.json'));
      expect(restoredPackage.name).toBe('rollback-test');
      expect(restoredPackage.version).toBe('1.0.0');
    });
    
    test('should skip rollback in dry run mode', async () => {
      const success = await migrator.rollback('test-backup-id');
      
      expect(success).toBe(true); // Dry run always succeeds
    });
  });
  
  describe('Logging and Reporting', () => {
    test('should log migration steps', () => {
      migrator.logStep('test_step', { message: 'Test message' });
      
      const log = migrator.getMigrationLog();
      expect(log).toHaveLength(1);
      expect(log[0].type).toBe('test_step');
      expect(log[0].message).toBe('Test message');
      expect(log[0].timestamp).toBeDefined();
    });
    
    test('should export migration report', async () => {
      migrator.logStep('test_step', { data: 'test' });
      
      const reportPath = join(testDir, 'migration-report.json');
      const report = await migrator.exportMigrationReport(reportPath);
      
      expect(report.timestamp).toBeDefined();
      expect(report.projectPath).toBe(testDir);
      expect(report.migrationLog).toHaveLength(1);
      expect(report.options.dryRun).toBe(true);
    });
    
    test('should output report to console in dry run', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await migrator.exportMigrationReport('/fake/path');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Migration report:',
        expect.stringContaining('"projectPath"')
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Phase Execution', () => {
    test('should call correct transformer methods for each phase', async () => {
      const mockTransformer = {
        migratePreMigration: jest.fn().mockResolvedValue(undefined),
        migrateDependencies: jest.fn().mockResolvedValue(undefined),
        migrateConfiguration: jest.fn().mockResolvedValue(undefined),
        migrateFileStructure: jest.fn().mockResolvedValue(undefined),
        migrateSourceCode: jest.fn().mockResolvedValue(undefined),
        migratePostMigration: jest.fn().mockResolvedValue(undefined)
      };
      
      const mockAnalysis = {
        projectType: 'vue-basic'
      };
      
      await migrator.executePhase('pre-migration', mockTransformer, mockAnalysis);
      expect(mockTransformer.migratePreMigration).toHaveBeenCalled();
      
      await migrator.executePhase('dependencies', mockTransformer, mockAnalysis);
      expect(mockTransformer.migrateDependencies).toHaveBeenCalled();
      
      await migrator.executePhase('configuration', mockTransformer, mockAnalysis);
      expect(mockTransformer.migrateConfiguration).toHaveBeenCalled();
      
      await migrator.executePhase('file-structure', mockTransformer, mockAnalysis);
      expect(mockTransformer.migrateFileStructure).toHaveBeenCalled();
      
      await migrator.executePhase('source-code', mockTransformer, mockAnalysis);
      expect(mockTransformer.migrateSourceCode).toHaveBeenCalled();
      
      await migrator.executePhase('post-migration', mockTransformer, mockAnalysis);
      expect(mockTransformer.migratePostMigration).toHaveBeenCalled();
    });
    
    test('should pass correct context to transformer methods', async () => {
      const mockTransformer = {
        migratePreMigration: jest.fn().mockResolvedValue(undefined)
      };
      
      const mockAnalysis = {
        projectType: 'vue-basic'
      };
      
      await migrator.executePhase('pre-migration', mockTransformer, mockAnalysis);
      
      const callArgs = mockTransformer.migratePreMigration.mock.calls[0];
      expect(callArgs[0]).toBe(mockAnalysis);
      expect(callArgs[1]).toMatchObject({
        dryRun: true,
        verbose: false,
        projectPath: testDir
      });
      expect(callArgs[1].logger).toBeInstanceOf(Function);
    });
    
    test('should handle phase errors with context', async () => {
      const mockTransformer = {
        migrateDependencies: jest.fn().mockRejectedValue(new Error('Phase error'))
      };
      
      const mockAnalysis = {
        projectType: 'vue-basic'
      };
      
      await expect(
        migrator.executePhase('dependencies', mockTransformer, mockAnalysis)
      ).rejects.toThrow('Phase error');
    });
  });
  
  describe('Integration with Analysis', () => {
    test('should integrate with ProjectAnalyzer', async () => {
      await fs.writeJson(join(testDir, 'package.json'), {
        name: 'integration-test',
        dependencies: {
          vue: '^3.4.0',
          vuetify: '^3.4.0'
        }
      });
      
      const mockTransformer = {
        migratePreMigration: jest.fn().mockResolvedValue(undefined),
        migrateDependencies: jest.fn().mockResolvedValue(undefined),
        migrateConfiguration: jest.fn().mockResolvedValue(undefined),
        migrateFileStructure: jest.fn().mockResolvedValue(undefined),
        migrateSourceCode: jest.fn().mockResolvedValue(undefined),
        migratePostMigration: jest.fn().mockResolvedValue(undefined)
      };
      
      migrator.registerTransformer('vue-vuetify', mockTransformer);
      
      const result = await migrator.migrate();
      
      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.projectType).toBe('vue-vuetify');
      expect(result.analysis.framework).toBe('vue');
      expect(result.analysis.uiLibrary).toBe('vuetify');
    });
  });
});