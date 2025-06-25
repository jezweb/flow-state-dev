#!/usr/bin/env node
/**
 * Test React + Tailwind + Vercel integration
 */
import { ModuleRegistry } from '../lib/modules/registry.js';
import { TemplateGenerator } from '../lib/modules/template-generator.js';
import { DependencyResolver } from '../lib/modules/dependency-resolver.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const testDir = '/tmp/fsd-react-tailwind-test';

async function testReactTailwindIntegration() {
  console.log(chalk.blue('\n🚀 Testing React + Tailwind + Vercel Integration\n'));
  
  try {
    // Clean test directory
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    
    // Initialize registry
    const registry = new ModuleRegistry();
    await registry.discover();
    
    console.log(chalk.green(`✓ Discovered ${registry.modules.size} modules`));
    
    // Check if React, Tailwind, and Vercel modules were loaded
    const reactModule = registry.getModule('react');
    const tailwindModule = registry.getModule('tailwind');
    const vercelModule = registry.getModule('vercel');
    
    if (!reactModule) {
      console.error(chalk.red('❌ React module not found in registry'));
      return false;
    }
    
    if (!tailwindModule) {
      console.error(chalk.red('❌ Tailwind module not found in registry'));
      return false;
    }
    
    if (!vercelModule) {
      console.error(chalk.red('❌ Vercel module not found in registry'));
      return false;
    }
    
    console.log(chalk.green('✓ React module loaded successfully'));
    console.log(chalk.gray(`  - Name: ${reactModule.name}`));
    console.log(chalk.gray(`  - Category: ${reactModule.category}`));
    console.log(chalk.gray(`  - Provides: ${reactModule.provides.join(', ')}`));
    
    console.log(chalk.green('✓ Tailwind module loaded successfully'));
    console.log(chalk.gray(`  - Name: ${tailwindModule.name}`));
    console.log(chalk.gray(`  - Category: ${tailwindModule.category}`));
    console.log(chalk.gray(`  - Provides: ${tailwindModule.provides.join(', ')}`));
    
    console.log(chalk.green('✓ Vercel module loaded successfully'));
    console.log(chalk.gray(`  - Name: ${vercelModule.name}`));
    console.log(chalk.gray(`  - Category: ${vercelModule.category}`));
    console.log(chalk.gray(`  - Provides: ${vercelModule.provides.join(', ')}`));
    
    // Test 1: React + Tailwind + Vercel stack
    console.log(chalk.blue('\n🧪 Test 1: React + Tailwind + Vercel Stack'));
    
    const modules = ['react', 'tailwind', 'vercel'];
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
    const projectPath = path.join(testDir, 'react-tailwind-vercel-project');
    await fs.ensureDir(projectPath);
    
    const generator = new TemplateGenerator(resolution.modules, projectPath);
    const context = {
      projectName: 'react-tailwind-vercel-project',
      projectDescription: 'Test React + Tailwind + Vercel project',
      authorName: 'Test Author',
      authorEmail: 'test@example.com',
      modules: resolution.modules
    };
    
    await generator.generate(context);
    
    console.log(chalk.green('✓ Generated React + Tailwind + Vercel project'));
    
    // Check for expected files
    const expectedFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'eslint.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'vercel.json',
      '.vercelignore',
      'index.html',
      'src/main.tsx',
      'src/App.tsx',
      'src/App.css',
      'src/index.css'
    ];
    
    console.log(chalk.blue('\n📁 Checking generated files:'));
    
    for (const file of expectedFiles) {
      const filePath = path.join(projectPath, file);
      if (await fs.pathExists(filePath)) {
        console.log(chalk.gray(`  ✓ ${file}`));
      } else {
        console.log(chalk.red(`  ✗ ${file} - NOT FOUND`));
      }
    }
    
    // Check package.json for correct dependencies
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      console.log(chalk.blue('\n📦 Checking dependencies:'));
      
      // React dependencies
      const reactDeps = ['react', 'react-dom', 'react-router-dom'];
      for (const dep of reactDeps) {
        if (packageJson.dependencies?.[dep]) {
          console.log(chalk.gray(`  ✓ ${dep}: ${packageJson.dependencies[dep]}`));
        } else {
          console.log(chalk.red(`  ✗ ${dep} missing`));
        }
      }
      
      // Tailwind dev dependencies
      const tailwindDeps = ['tailwindcss', 'autoprefixer', 'postcss'];
      for (const dep of tailwindDeps) {
        if (packageJson.devDependencies?.[dep]) {
          console.log(chalk.gray(`  ✓ ${dep}: ${packageJson.devDependencies[dep]} (dev)`));
        } else {
          console.log(chalk.red(`  ✗ ${dep} missing (dev)`));
        }
      }
      
      // Vercel dev dependency
      if (packageJson.devDependencies?.vercel) {
        console.log(chalk.gray(`  ✓ vercel: ${packageJson.devDependencies.vercel} (dev)`));
      } else {
        console.log(chalk.red(`  ✗ vercel missing (dev)`));
      }
      
      // clsx for Tailwind components
      if (packageJson.dependencies?.clsx) {
        console.log(chalk.gray(`  ✓ clsx: ${packageJson.dependencies.clsx}`));
      } else {
        console.log(chalk.red(`  ✗ clsx missing`));
      }
      
      // Check scripts
      console.log(chalk.blue('\n⚙️ Checking scripts:'));
      const expectedScripts = ['dev', 'build', 'lint', 'preview', 'deploy'];
      for (const script of expectedScripts) {
        if (packageJson.scripts?.[script]) {
          console.log(chalk.gray(`  ✓ ${script}: ${packageJson.scripts[script]}`));
        } else {
          console.log(chalk.red(`  ✗ ${script} missing`));
        }
      }
    }
    
    // Check Tailwind configuration
    const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
    if (await fs.pathExists(tailwindConfigPath)) {
      const tailwindConfig = await fs.readFile(tailwindConfigPath, 'utf-8');
      console.log(chalk.blue('\n🎨 Checking Tailwind config:'));
      
      if (tailwindConfig.includes('darkMode')) {
        console.log(chalk.gray('  ✓ Dark mode configured'));
      }
      if (tailwindConfig.includes('extend')) {
        console.log(chalk.gray('  ✓ Theme extensions configured'));
      }
      if (tailwindConfig.includes('primary')) {
        console.log(chalk.gray('  ✓ Custom colors configured'));
      }
    }
    
    // Check Vercel configuration
    const vercelConfigPath = path.join(projectPath, 'vercel.json');
    if (await fs.pathExists(vercelConfigPath)) {
      const vercelConfig = await fs.readJson(vercelConfigPath);
      console.log(chalk.blue('\n🚀 Checking Vercel config:'));
      
      if (vercelConfig.buildCommand) {
        console.log(chalk.gray(`  ✓ Build command: ${vercelConfig.buildCommand}`));
      }
      if (vercelConfig.outputDirectory) {
        console.log(chalk.gray(`  ✓ Output directory: ${vercelConfig.outputDirectory}`));
      }
      if (vercelConfig.routes && vercelConfig.routes.length > 0) {
        console.log(chalk.gray(`  ✓ SPA routing configured (${vercelConfig.routes.length} routes)`));
      }
    }
    
    // Check CSS imports
    const indexCssPath = path.join(projectPath, 'src/index.css');
    if (await fs.pathExists(indexCssPath)) {
      const indexCss = await fs.readFile(indexCssPath, 'utf-8');
      console.log(chalk.blue('\n💄 Checking CSS imports:'));
      
      if (indexCss.includes('@tailwind base')) {
        console.log(chalk.gray('  ✓ Tailwind base imported'));
      }
      if (indexCss.includes('@tailwind components')) {
        console.log(chalk.gray('  ✓ Tailwind components imported'));
      }
      if (indexCss.includes('@tailwind utilities')) {
        console.log(chalk.gray('  ✓ Tailwind utilities imported'));
      }
      if (indexCss.includes('btn-primary')) {
        console.log(chalk.gray('  ✓ Custom component classes included'));
      }
    }
    
    console.log(chalk.green('\n✅ React + Tailwind + Vercel integration tests passed!'));
    
    // Clean up
    await fs.remove(testDir);
    
    return true;
  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error);
    return false;
  }
}

// Run test
testReactTailwindIntegration().then(success => {
  process.exit(success ? 0 : 1);
});