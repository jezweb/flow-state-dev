/**
 * Template Processing Step
 */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { OnboardingStep } from '../base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateProcessingStep extends OnboardingStep {
  constructor() {
    super('template-processing', 'Process project template', {
      priority: 10,
      required: true,
      dependencies: ['project-name', 'framework-selection', 'directory-selection']
    });
  }

  async validate(context) {
    const { framework, targetDir, projectName } = context;
    
    if (!framework) {
      return { valid: false, message: 'Framework selection is required' };
    }
    
    if (!targetDir) {
      return { valid: false, message: 'Target directory is required' };
    }
    
    if (!projectName) {
      return { valid: false, message: 'Project name is required' };
    }

    return { valid: true };
  }

  async execute(context) {
    const { framework, targetDir, projectName, useCurrentDir } = context;

    // Show where files will go
    if (useCurrentDir) {
      console.log(chalk.blue(`\n📁 Creating ${framework.short} project in current directory`));
    } else {
      console.log(chalk.blue(`\n📁 Creating ${framework.short} project: ${path.relative(process.cwd(), targetDir) || projectName}`));
    }

    // Check if target directory exists (only for subdirectory creation)
    if (!useCurrentDir && fs.existsSync(targetDir)) {
      throw new Error(`Directory ${projectName} already exists at ${targetDir}`);
    }

    // Copy template based on selected framework
    const templateDir = path.join(__dirname, '..', '..', '..', 'templates', framework.templateDir);
    
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template directory not found: ${framework.templateDir}`);
    }
    
    await fs.copy(templateDir, targetDir);

    // Update package.json with project name
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = projectName;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }

    // Update CLAUDE.md with project name
    const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
    if (fs.existsSync(claudeMdPath)) {
      let claudeMd = await fs.readFile(claudeMdPath, 'utf-8');
      claudeMd = claudeMd.replace(/\[PROJECT_NAME\]/g, projectName);
      await fs.writeFile(claudeMdPath, claudeMd);
    }

    // Update README.md with project name
    const readmePath = path.join(targetDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      let readme = await fs.readFile(readmePath, 'utf-8');
      readme = readme.replace(/\[PROJECT_NAME\]/g, projectName);
      await fs.writeFile(readmePath, readme);
    }

    return {
      ...context,
      templateProcessed: true
    };
  }

  async rollback(context, error) {
    const { targetDir, useCurrentDir } = context;
    
    // Only attempt cleanup for subfolder creation
    if (!useCurrentDir && targetDir && fs.existsSync(targetDir)) {
      try {
        await fs.remove(targetDir);
        console.log(chalk.yellow(`🧹 Cleaned up ${targetDir}`));
      } catch (cleanupError) {
        console.log(chalk.red(`Failed to cleanup ${targetDir}: ${cleanupError.message}`));
      }
    }
  }

  getConfigSchema() {
    return {
      type: 'object',
      properties: {
        templateDir: {
          type: 'string',
          description: 'Custom template directory to use'
        }
      }
    };
  }
}