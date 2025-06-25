#!/usr/bin/env node
/**
 * Debug JSON parsing error
 */
import { ModuleRegistry } from '../lib/modules/registry.js';
import { TemplateGenerator } from '../lib/modules/template-generator.js';
import { DependencyResolver } from '../lib/modules/dependency-resolver.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const testDir = '/tmp/fsd-json-debug';

async function debugJsonError() {
  console.log(chalk.blue('\n🔍 Debugging JSON Error\n'));
  
  try {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
    
    const registry = new ModuleRegistry();
    await registry.discover();
    
    // Test just React module first
    console.log(chalk.blue('Testing React module alone...'));
    const modules = ['react'];
    const resolver = new DependencyResolver(registry);
    const resolution = await resolver.resolve(modules, { autoResolve: true });
    
    if (!resolution.success) {
      console.error(chalk.red('Failed to resolve React module'));
      return;
    }
    
    const projectPath = path.join(testDir, 'react-only');
    await fs.ensureDir(projectPath);
    
    const generator = new TemplateGenerator(resolution.modules, projectPath);
    const context = {
      projectName: 'test-react',
      projectDescription: 'Test project',
      authorName: 'Test',
      authorEmail: 'test@example.com',
      modules: resolution.modules
    };
    
    try {
      await generator.generate(context);
      console.log(chalk.green('✓ React module generated successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Error generating React module:'), error.message);
      throw error;
    }
    
    // Now test React + Tailwind
    console.log(chalk.blue('\nTesting React + Tailwind...'));
    const modules2 = ['react', 'tailwind'];
    const resolution2 = await resolver.resolve(modules2, { autoResolve: true });
    
    const projectPath2 = path.join(testDir, 'react-tailwind');
    await fs.ensureDir(projectPath2);
    
    const generator2 = new TemplateGenerator(resolution2.modules, projectPath2);
    
    try {
      await generator2.generate(context);
      console.log(chalk.green('✓ React + Tailwind generated successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Error generating React + Tailwind:'), error.message);
      throw error;
    }
    
    // Finally test all three
    console.log(chalk.blue('\nTesting React + Tailwind + Vercel...'));
    const modules3 = ['react', 'tailwind', 'vercel'];
    const resolution3 = await resolver.resolve(modules3, { autoResolve: true });
    
    const projectPath3 = path.join(testDir, 'react-tailwind-vercel');
    await fs.ensureDir(projectPath3);
    
    const generator3 = new TemplateGenerator(resolution3.modules, projectPath3);
    
    try {
      await generator3.generate(context);
      console.log(chalk.green('✓ React + Tailwind + Vercel generated successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Error generating React + Tailwind + Vercel:'), error.message);
      throw error;
    }
    
    console.log(chalk.green('\n✅ All combinations work!'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Debug test failed:'), error);
    console.error(error.stack);
  }
}

debugJsonError();