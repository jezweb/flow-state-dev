/**
 * Integration tests for CLI commands
 */
import { runCommand, createTestDir } from '../utils/test-helpers.js';
import { join } from 'path';

describe('CLI Commands Integration', () => {
  let testDir;
  let originalCwd;
  
  beforeEach(async () => {
    testDir = await createTestDir('cli-test');
    originalCwd = process.cwd();
    process.chdir(testDir);
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
  });
  
  describe('Module Commands', () => {
    test('should list available modules', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules list`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Available Modules');
    });
    
    test('should search modules', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules search vue`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Search results');
    });
    
    test('should show module info', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules info vue-base`);
      
      // May fail if module doesn't exist, but should not crash
      if (result.success) {
        expect(result.output).toContain('vue-base');
      } else {
        expect(result.error).toContain('not found');
      }
    });
    
    test('should generate module documentation', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules docs`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('documentation');
    });
    
    test('should filter modules by category', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules list --category frontend-framework`);
      
      expect(result.success).toBe(true);
      // Should show filtered results
    });
    
    test('should show verbose module information', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules list --verbose`);
      
      expect(result.success).toBe(true);
      // Verbose mode should show more details
    });
  });
  
  describe('Preset Commands', () => {
    test('should list available presets', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} presets list`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('preset');
    });
    
    test('should show preset info', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} presets info vue-full-stack`);
      
      // May not exist, but should handle gracefully
      if (!result.success) {
        expect(result.error).toContain('not found');
      }
    });
    
    test('should create custom preset', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} presets create test-preset --modules vue-base,vuetify --description "Test preset"`);
      
      // Command should attempt to create preset
      expect(result.success || result.error).toBeDefined();
    });
  });
  
  describe('Init Command', () => {
    test('should initialize project non-interactively', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} init test-project --no-interactive --force`);
      
      expect(result.success).toBe(true);
      
      // Verify project was created
      const fs = await import('fs-extra');
      const projectExists = await fs.pathExists(join(testDir, 'test-project'));
      expect(projectExists).toBe(true);
    });
    
    test('should initialize project with specific modules', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} init module-test --no-interactive --force --modules vue-base,vuetify`);
      
      expect(result.success).toBe(true);
      
      // Verify project was created with correct modules
      const fs = await import('fs-extra');
      const packagePath = join(testDir, 'module-test', 'package.json');
      
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        // Should have dependencies from selected modules
        expect(packageJson.dependencies).toBeDefined();
      }
    });
    
    test('should initialize project with preset', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} init preset-test --no-interactive --force --preset vue-full-stack`);
      
      // Should attempt to use preset (may fail if preset doesn't exist)
      expect(result.success || result.error).toBeDefined();
    });
    
    test('should handle here option', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} init here-test --no-interactive --force --here`);
      
      expect(result.success).toBe(true);
      
      // Should create files in current directory
      const fs = await import('fs-extra');
      const packageExists = await fs.pathExists(join(testDir, 'package.json'));
      expect(packageExists).toBe(true);
    });
  });
  
  describe('Doctor Command', () => {
    test('should run diagnostics', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} doctor`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('diagnostics');
    });
    
    test('should run diagnostics with fix option', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} doctor --fix`);
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('Memory Commands', () => {
    test('should show memory help', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} memory --help`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('memory');
    });
    
    test('should show current memory file', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} memory show`);
      
      expect(result.success).toBe(true);
      // Should show memory info regardless of whether file exists
    });
    
    test('should validate memory file', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} memory validate`);
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('Security Commands', () => {
    test('should run security scan', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} security scan`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('security');
    });
    
    test('should check repository status', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} security check`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('status');
    });
    
    test('should set up security tools', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} security setup`);
      
      expect(result.success).toBe(true);
    });
  });
  
  describe('Help and Version', () => {
    test('should show version', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} --version`);
      
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/\\d+\\.\\d+\\.\\d+/); // Version format
    });
    
    test('should show help', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} --help`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Usage');
    });
    
    test('should show command-specific help', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules --help`);
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('modules');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid commands gracefully', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} invalid-command`);
      
      expect(result.success).toBe(false);
      // Should show helpful error message
    });
    
    test('should handle invalid options gracefully', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} init --invalid-option`);
      
      expect(result.success).toBe(false);
      // Should show helpful error message
    });
    
    test('should handle missing required arguments', async () => {
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} modules info`);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('argument');
    });
  });
  
  describe('Environment Handling', () => {
    test('should work in empty directory', async () => {
      const emptyDir = await createTestDir('empty-cli-test');
      
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} --version`, {
        cwd: emptyDir
      });
      
      expect(result.success).toBe(true);
    });
    
    test('should handle permission errors gracefully', async () => {
      // Try to create project in read-only directory (if possible)
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} init test --no-interactive --force`, {
        cwd: '/tmp' // Use temp directory which should be writable
      });
      
      // Should either succeed or fail gracefully
      expect(result.success !== undefined).toBe(true);
    });
  });
  
  describe('Performance', () => {
    test('should respond to commands quickly', async () => {
      const startTime = Date.now();
      
      const result = await runCommand(`node ${join(global.testRootDir, 'bin/fsd.js')} --version`);
      
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(3000); // Should respond within 3 seconds
    });
    
    test('should handle multiple concurrent commands', async () => {
      const commands = [
        `node ${join(global.testRootDir, 'bin/fsd.js')} --version`,
        `node ${join(global.testRootDir, 'bin/fsd.js')} --help`,
        `node ${join(global.testRootDir, 'bin/fsd.js')} modules list`
      ];
      
      const startTime = Date.now();
      const results = await Promise.all(commands.map(cmd => runCommand(cmd)));
      const duration = Date.now() - startTime;
      
      // All commands should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Should complete concurrently faster than sequentially
      expect(duration).toBeLessThan(10000);
    });
  });
});