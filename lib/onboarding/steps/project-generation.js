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
    const generator = new TemplateGenerator();
    await generator.generate({
      modules: modules,
      projectPath: projectPath,
      projectName: context.projectName,
      variables: {
        ...context,
        supabaseUrl: context.supabaseUrl || '',
        supabaseAnonKey: context.supabaseAnonKey || '',
        githubUsername: context.githubUsername || '',
        githubRepo: context.githubRepo || ''
      },
      interactive: context.interactive
    });
    
    // Initialize git repository
    if (!context.skipGit) {
      console.log(chalk.blue('\n📝 Initializing git repository...'));
      execSync('git init', { cwd: projectPath, stdio: 'pipe' });
      
      // Check if there are files to commit
      try {
        const status = execSync('git status --porcelain', { cwd: projectPath, encoding: 'utf-8' });
        if (status.trim()) {
          execSync('git add .', { cwd: projectPath });
          execSync('git commit -m "Initial commit from Flow State Dev"', { cwd: projectPath, stdio: 'pipe' });
        } else {
          console.log(chalk.yellow('⚠️  No files to commit yet'));
        }
      } catch (error) {
        console.log(chalk.yellow('⚠️  Git initialization skipped'));
      }
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
      generated: true,
      dependenciesInstalled: true
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
    
    // Show selected stack
    console.log(chalk.cyan('📋 Your stack:'));
    const modules = context.stackResolution.modules;
    for (const module of modules) {
      console.log(chalk.green(`  ✓ ${module.name} - ${module.description}`));
    }
    
    // Check what features are included
    const hasSupabase = modules.some(m => 
      m.name?.toLowerCase().includes('supabase') || 
      m.id?.toLowerCase().includes('supabase')
    );
    const hasAuth = modules.some(m => 
      m.name?.toLowerCase().includes('auth') || 
      m.provides?.includes('authentication')
    );
    const hasTesting = modules.some(m => 
      m.provides?.includes('testing') ||
      m.name?.toLowerCase().includes('test')
    );
    
    console.log(chalk.cyan('\n🚀 Next steps:'));
    
    let stepNum = 1;
    if (!context.here) {
      console.log(chalk.white(`  ${stepNum}. Navigate to your project:`));
      console.log(chalk.gray(`     cd ${relativePath}`));
      stepNum++;
    }
    
    // Supabase setup if needed
    if (hasSupabase && !context.supabaseConfigured) {
      console.log(chalk.white(`  ${stepNum}. Configure Supabase:`));
      console.log(chalk.gray(`     cp .env.example .env`));
      console.log(chalk.gray(`     # Edit .env with your Supabase credentials`));
      stepNum++;
    }
    
    console.log(chalk.white(`  ${stepNum}. Start development server:`));
    console.log(chalk.gray(`     npm run dev`));
    stepNum++;
    
    // Show module-specific commands
    const commands = this.getModuleCommands(modules);
    if (commands.length > 0) {
      console.log(chalk.white(`\n📚 Available commands:`));
      for (const cmd of commands) {
        console.log(chalk.gray(`  ${cmd}`));
      }
    }
    
    // Context-aware tips
    console.log(chalk.cyan('\n💡 Tips:'));
    
    if (!context.gitHubConfigured) {
      console.log(chalk.gray('  • Run "fsd labels" after creating your GitHub repo'));
    }
    
    if (!context.memoryConfigured) {
      console.log(chalk.gray('  • Run "fsd memory init" for personalized Claude AI assistance'));
    }
    
    if (hasAuth && hasSupabase) {
      console.log(chalk.gray('  • Authentication is pre-configured with Supabase'));
    }
    
    if (hasTesting) {
      console.log(chalk.gray('  • Run "npm test" to execute your test suite'));
    }
    
    if (context.framework?.value === 'minimal') {
      console.log(chalk.gray('  • Read CHOOSING_A_FRAMEWORK.md to add a framework later'));
    }
    
    console.log(chalk.cyan('\n📖 Resources:'));
    console.log(chalk.gray('  • Documentation: https://github.com/jezweb/flow-state-dev'));
    console.log(chalk.gray('  • Check health: fsd doctor'));
    console.log(chalk.gray('  • View modules: fsd modules list'));
    
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