/**
 * Project Generation Step - Generates project from selected modules
 */
import chalk from 'chalk';
import { OnboardingStep } from '../base.js';
import { TemplateGenerator } from '../../modules/template-generator.js';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

export class ProjectGenerationStep extends OnboardingStep {
  constructor() {
    super('project-generation', 'Generate project', {
      priority: 10,
      required: true,
      dependencies: ['project-name', 'stack-selection']
    });
  }

  shouldRun(context) {
    return !!context.stackResolution && !!context.projectName;
  }

  async execute(context) {
    console.log(chalk.blue('\n🚀 Generating your project...\n'));
    
    const projectPath = this.getProjectPath(context);
    const modules = context.stackResolution.modules;
    
    // Create project directory
    if (!context.here && !existsSync(projectPath)) {
      console.log(chalk.blue(`📁 Creating project directory: ${projectPath}`));
      execSync(`mkdir -p "${projectPath}"`);
    }
    
    // Run pre-install hooks
    console.log(chalk.blue('\n🪝 Running pre-install hooks...'));
    for (const module of modules) {
      if (module.hooks && module.hooks.beforeinstall) {
        context = await module.hooks.beforeinstall(context);
      }
    }
    
    // Generate project files
    const generator = new TemplateGenerator(modules, projectPath);
    await generator.generate(context);
    
    // Initialize git repository
    if (!context.skipGit) {
      console.log(chalk.blue('\n📝 Initializing git repository...'));
      execSync('git init', { cwd: projectPath });
      execSync('git add .', { cwd: projectPath });
      execSync('git commit -m "Initial commit from Flow State Dev"', { cwd: projectPath });
    }
    
    // Install dependencies
    console.log(chalk.blue('\n📦 Installing dependencies...'));
    const packageManager = context.packageManager || 'npm';
    const installCommand = packageManager === 'npm' ? 'npm install' : `${packageManager} install`;
    
    try {
      execSync(installCommand, { 
        cwd: projectPath, 
        stdio: 'inherit'
      });
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Dependency installation had some warnings'));
    }
    
    // Run post-install hooks
    console.log(chalk.blue('\n🪝 Running post-install hooks...'));
    for (const module of modules) {
      if (module.hooks && module.hooks.afterinstall) {
        context = await module.hooks.afterinstall(context);
      }
    }
    
    // Set up memory file if requested
    if (context.memory && !context.noMemory) {
      console.log(chalk.blue('\n🧠 Setting up Claude memory file...'));
      const { initMemory } = await import('../../memory.js');
      await initMemory({ force: false }, projectPath);
    }
    
    // Show success message
    this.showSuccessMessage(context, projectPath);
    
    return {
      ...context,
      projectPath,
      generated: true
    };
  }

  getProjectPath(context) {
    if (context.here) {
      return process.cwd();
    }
    
    const projectName = context.projectName;
    return path.join(process.cwd(), projectName);
  }

  showSuccessMessage(context, projectPath) {
    console.log(chalk.green('\n✨ Project created successfully!\n'));
    
    const relativePath = path.relative(process.cwd(), projectPath);
    const cdCommand = context.here ? '' : `cd ${relativePath}`;
    
    console.log(chalk.cyan('📋 Your stack:'));
    for (const module of context.stackResolution.modules) {
      console.log(chalk.green(`  ✓ ${module.name} - ${module.description}`));
    }
    
    console.log(chalk.cyan('\n🚀 Next steps:'));
    
    if (!context.here) {
      console.log(chalk.white(`  1. Navigate to your project:`));
      console.log(chalk.gray(`     ${cdCommand}`));
    }
    
    console.log(chalk.white(`  ${context.here ? '1' : '2'}. Start development server:`));
    console.log(chalk.gray(`     npm run dev`));
    
    // Show module-specific commands
    const commands = this.getModuleCommands(context.stackResolution.modules);
    if (commands.length > 0) {
      console.log(chalk.white(`\n📚 Module-specific commands:`));
      for (const cmd of commands) {
        console.log(chalk.gray(`  ${cmd}`));
      }
    }
    
    console.log(chalk.cyan('\n📖 Documentation:'));
    console.log(chalk.gray('  https://github.com/Jezternz/flow-state-template'));
    console.log(chalk.gray('  Run: fsd doctor (to check project health)'));
    console.log(chalk.gray('  Run: fsd modules docs (to generate module docs)'));
    
    console.log(chalk.green('\n🎉 Happy coding!\n'));
  }

  getModuleCommands(modules) {
    const commands = [];
    
    for (const module of modules) {
      if (module.commands) {
        for (const [cmd, desc] of Object.entries(module.commands)) {
          commands.push(`${cmd} - ${desc}`);
        }
      }
    }
    
    return commands;
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        skipGit: {
          type: 'boolean',
          description: 'Skip git repository initialization'
        },
        packageManager: {
          type: 'string',
          enum: ['npm', 'yarn', 'pnpm'],
          description: 'Package manager to use'
        }
      }
    };
  }
}