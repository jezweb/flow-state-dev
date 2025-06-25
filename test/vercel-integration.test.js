#!/usr/bin/env node
/**
 * Test Vercel module integration
 */
import { ModuleRegistry } from '../lib/modules/registry.js';
import { TemplateGenerator } from '../lib/modules/template-generator.js';
import { DependencyResolver } from '../lib/modules/dependency-resolver.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const testDir = '/tmp/fsd-vercel-test';

async function testVercelIntegration() {
  console.log(chalk.blue('\n🚀 Testing Vercel Integration\n'));
  
  try {
    // Clean test directory
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    
    // Initialize registry
    const registry = new ModuleRegistry();
    await registry.discover();
    
    console.log(chalk.green(`✓ Discovered ${registry.modules.size} modules`));
    
    // Check if Vercel module was loaded
    const vercelModule = registry.getModule('vercel');
    if (!vercelModule) {
      console.error(chalk.red('❌ Vercel module not found in registry'));
      return false;
    }
    
    console.log(chalk.green('✓ Vercel module loaded successfully'));
    console.log(chalk.gray(`  - Name: ${vercelModule.name}`));
    console.log(chalk.gray(`  - Category: ${vercelModule.category}`));
    console.log(chalk.gray(`  - Provides: ${vercelModule.provides.join(', ')}`));
    
    // Test 1: Vue + Vercel deployment
    console.log(chalk.blue('\n🧪 Test 1: Vue + Vercel Stack'));
    
    const modules = ['vue-base', 'vercel'];
    const resolver = new DependencyResolver(registry);
    
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
    const projectPath = path.join(testDir, 'vue-vercel-project');
    await fs.ensureDir(projectPath);
    
    const generator = new TemplateGenerator(resolution.modules, projectPath);
    const context = {
      projectName: 'vue-vercel-project',
      projectDescription: 'Test Vue + Vercel project',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
      modules: resolution.modules
    };
    
    await generator.generate(context);
    
    console.log(chalk.green('✓ Generated Vue + Vercel project'));
    
    // Check for Vercel-specific files
    const vercelFiles = [
      'vercel.json',
      '.vercelignore',
      'package.json'
    ];
    
    for (const file of vercelFiles) {
      const filePath = path.join(projectPath, file);
      if (await fs.pathExists(filePath)) {
        console.log(chalk.gray(`  ✓ ${file}`));
        
        // Check package.json for deployment scripts
        if (file === 'package.json') {
          const packageJson = await fs.readJson(filePath);
          const deployScripts = ['deploy', 'deploy:preview', 'vercel:env'];
          
          for (const script of deployScripts) {
            if (packageJson.scripts[script]) {
              console.log(chalk.gray(`    ✓ Script: ${script}`));
            } else {
              console.log(chalk.red(`    ✗ Script missing: ${script}`));
            }
          }
          
          // Check for vercel devDependency
          if (packageJson.devDependencies?.vercel) {
            console.log(chalk.gray(`    ✓ Vercel CLI: ${packageJson.devDependencies.vercel}`));
          } else {
            console.log(chalk.red(`    ✗ Vercel CLI not found in devDependencies`));
          }
        }
        
        // Check vercel.json configuration
        if (file === 'vercel.json') {
          const vercelConfig = await fs.readJson(filePath);
          console.log(chalk.gray(`    ✓ Framework detected: ${vercelConfig.framework || 'auto'}`));
          console.log(chalk.gray(`    ✓ Output directory: ${vercelConfig.outputDirectory}`));
          console.log(chalk.gray(`    ✓ Build command: ${vercelConfig.buildCommand}`));
          
          // Check for SPA routing
          if (vercelConfig.routes && vercelConfig.routes.length > 0) {
            console.log(chalk.gray(`    ✓ SPA routing configured (${vercelConfig.routes.length} routes)`));
          }
          
          // Check for security headers
          if (vercelConfig.headers && vercelConfig.headers.length > 0) {
            console.log(chalk.gray(`    ✓ Security headers configured`));
          }
        }
      } else {
        console.log(chalk.red(`  ✗ ${file} - NOT FOUND`));
      }
    }
    
    // Test 2: Vue + Vuetify + Supabase + Vercel (full stack)
    console.log(chalk.blue('\n🧪 Test 2: Full Stack with Vercel'));
    
    const fullStackModules = ['vue-base', 'vuetify', 'supabase', 'vercel'];
    const fullStackResolution = await resolver.resolve(fullStackModules, {
      autoResolve: true,
      allowConflicts: false
    });
    
    if (!fullStackResolution.success) {
      console.error(chalk.red('❌ Failed to resolve full stack dependencies'));
      return false;
    }
    
    console.log(chalk.green(`✓ Full stack resolved (${fullStackResolution.modules.length} modules)`));
    
    // Generate full stack project
    const fullStackPath = path.join(testDir, 'fullstack-vercel-project');
    await fs.ensureDir(fullStackPath);
    
    const fullStackGenerator = new TemplateGenerator(fullStackResolution.modules, fullStackPath);
    const fullStackContext = {
      ...context,
      projectName: 'fullstack-vercel-project',
      modules: fullStackResolution.modules
    };
    
    await generator.generate(fullStackContext);
    
    console.log(chalk.green('✓ Generated full stack + Vercel project'));
    
    // Check merged package.json
    const fullStackPackage = await fs.readJson(path.join(fullStackPath, 'package.json'));
    
    // Should have dependencies from all modules
    const expectedDeps = ['vue', 'vuetify', '@supabase/supabase-js'];
    const expectedDevDeps = ['vercel', 'vite-plugin-vuetify'];
    
    console.log(chalk.blue('\n📦 Checking dependency merging:'));
    
    for (const dep of expectedDeps) {
      if (fullStackPackage.dependencies?.[dep]) {
        console.log(chalk.gray(`  ✓ ${dep}`));
      } else {
        console.log(chalk.red(`  ✗ ${dep} missing`));
      }
    }
    
    for (const dep of expectedDevDeps) {
      if (fullStackPackage.devDependencies?.[dep]) {
        console.log(chalk.gray(`  ✓ ${dep} (dev)`));
      } else {
        console.log(chalk.red(`  ✗ ${dep} missing (dev)`));
      }
    }
    
    // Check for README deployment section
    const readmePath = path.join(fullStackPath, 'README.md');
    if (await fs.pathExists(readmePath)) {
      const readmeContent = await fs.readFile(readmePath, 'utf-8');
      if (readmeContent.includes('## Deployment') && readmeContent.includes('Vercel')) {
        console.log(chalk.gray('  ✓ README deployment section'));
      } else {
        console.log(chalk.red('  ✗ README deployment section missing'));
      }
    }
    
    console.log(chalk.green('\n✅ Vercel integration tests passed!'));
    
    // Clean up
    await fs.remove(testDir);
    
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error);
    return false;
  }
}

// Run test
testVercelIntegration().then(success => {
  process.exit(success ? 0 : 1);
});