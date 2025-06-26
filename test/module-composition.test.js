#!/usr/bin/env node
/**
 * Test module composition functionality
 */
import { ModuleRegistry } from '../lib/modules/registry.js';
import { TemplateGenerator } from '../lib/modules/template-generator.js';
import { ModuleDependencyResolver } from '../lib/modules/dependency-resolver.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const testDir = '/tmp/fsd-module-test';

async function testModuleComposition() {
  console.log(chalk.blue('\n📦 Testing Module Composition\n'));
  
  try {
    // Clean test directory
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    
    // Initialize registry
    const registry = new ModuleRegistry();
    await registry.discover();
    
    console.log(chalk.green(`✓ Discovered ${registry.modules.size} modules`));
    
    // Test 1: Vue + Vuetify + Supabase composition
    console.log(chalk.blue('\n🧪 Test 1: Vue + Vuetify + Supabase'));
    
    const modules = ['vue-base', 'vuetify', 'supabase', 'base-config'];
    const resolver = new ModuleDependencyResolver(registry);
    
    // Resolve dependencies
    const resolution = await resolver.resolve(modules, {
      autoResolve: true,
      allowConflicts: false
    });
    
    if (!resolution.success) {
      console.error(chalk.red('❌ Failed to resolve dependencies:'));
      resolution.errors.forEach(err => console.error(chalk.red(`  - ${err}`)));
      return false;
    }
    
    console.log(chalk.green(`✓ Resolved ${resolution.modules.length} modules`));
    
    // Generate project
    const projectPath = path.join(testDir, 'test-project');
    await fs.ensureDir(projectPath);
    
    const generator = new TemplateGenerator(resolution.modules, projectPath);
    const context = {
      projectName: 'test-project',
      projectDescription: 'Test project for module composition',
      authorName: 'Test Author',
      authorEmail: 'test@example.com'
    };
    
    await generator.generate(context);
    
    console.log(chalk.green('✓ Generated project files'));
    
    // Verify key files exist
    const expectedFiles = [
      'package.json',
      'vite.config.js',
      'src/main.js',
      'src/App.vue',
      'src/router/index.js',
      'src/plugins/vuetify.js',
      'src/services/supabase.js',
      '.gitignore',
      '.prettierrc.json',
      '.eslintrc.cjs'
    ];
    
    let allFilesExist = true;
    for (const file of expectedFiles) {
      const filePath = path.join(projectPath, file);
      if (await fs.pathExists(filePath)) {
        console.log(chalk.gray(`  ✓ ${file}`));
      } else {
        console.log(chalk.red(`  ✗ ${file} - NOT FOUND`));
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      console.error(chalk.red('\n❌ Some expected files were not generated'));
      return false;
    }
    
    // Check package.json merge
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
    console.log(chalk.blue('\n📄 Checking package.json merge:'));
    
    const expectedDeps = ['vue', 'vuetify', '@supabase/supabase-js', 'pinia'];
    for (const dep of expectedDeps) {
      if (packageJson.dependencies[dep]) {
        console.log(chalk.gray(`  ✓ ${dep}: ${packageJson.dependencies[dep]}`));
      } else {
        console.log(chalk.red(`  ✗ ${dep} - NOT FOUND`));
      }
    }
    
    console.log(chalk.green('\n✅ Module composition test passed!'));
    
    // Clean up
    await fs.remove(testDir);
    
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error);
    return false;
  }
}

// Run test
testModuleComposition().then(success => {
  process.exit(success ? 0 : 1);
});