/**
 * Base Configuration Module for Flow State Dev
 * 
 * Provides common configuration files and settings that are shared
 * across all projects regardless of framework or stack choice.
 */
import { BaseStackModule } from '../types/base-stack-module.js';
import { MODULE_TYPES, MODULE_CATEGORIES, MODULE_PROVIDES, MERGE_STRATEGIES } from '../types/index.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class BaseConfigModule extends BaseStackModule {
  constructor() {
    super('base-config', 'Base Configuration Files', {
      version: '1.0.0',
      moduleType: MODULE_TYPES.BASE,
      category: MODULE_CATEGORIES.OTHER,
      provides: [
        MODULE_PROVIDES.CONFIG,
        MODULE_PROVIDES.LINTING,
        MODULE_PROVIDES.FORMATTING
      ],
      requires: [],
      compatibleWith: [],  // Compatible with everything
      incompatibleWith: [],  // No conflicts
      priority: 100,  // Should be applied first
      templatePath: join(__dirname, '../../../templates/modules/base-config')
    });

    this.defaultConfig = {
      prettier: true,
      eslint: true,
      editorconfig: true,
      gitignore: true,
      claude: true
    };

    this.mergeStrategies = {
      '.gitignore': MERGE_STRATEGIES.APPEND_UNIQUE,
      '.prettierrc.json': MERGE_STRATEGIES.MERGE_JSON,
      '.eslintrc.cjs': MERGE_STRATEGIES.REPLACE,
      '.editorconfig': MERGE_STRATEGIES.REPLACE,
      '.claude/settings.json': MERGE_STRATEGIES.MERGE_JSON
    };

    this.setupInstructions = [
      'Your project includes standard configuration files:',
      '  • ESLint for code linting',
      '  • Prettier for code formatting',
      '  • EditorConfig for consistent coding styles',
      '  • Claude settings for AI-assisted development'
    ];
  }

  /**
   * Base config can always be applied
   */
  async canApply(projectAnalysis) {
    return { canApply: true };
  }

  /**
   * Get files to copy for this module
   */
  async getFilesToCopy() {
    const files = await this.getTemplateFiles();
    
    // Filter based on config
    return files.files.filter(file => {
      if (file.path.includes('.prettier') && !this.config.prettier) return false;
      if (file.path.includes('.eslint') && !this.config.eslint) return false;
      if (file.path.includes('.editorconfig') && !this.config.editorconfig) return false;
      if (file.path.includes('.gitignore') && !this.config.gitignore) return false;
      if (file.path.includes('.claude') && !this.config.claude) return false;
      return true;
    });
  }

  /**
   * Transform template content for base files
   */
  transformTemplate(content, variables) {
    // Most base config files don't need transformation
    // But still apply standard replacements
    return super.transformTemplate(content, variables);
  }

  /**
   * Hooks for module lifecycle
   */
  async beforeInstall(context) {
    console.log('Setting up base configuration files...');
    return context;
  }

  async afterInstall(context) {
    if (this.config.prettier || this.config.eslint) {
      console.log('Run "npm run lint" to check code quality');
      console.log('Run "npm run format" to format code');
    }
    return context;
  }

  /**
   * Get module name
   */
  getName() {
    return this.name;
  }

  /**
   * Get module description
   */
  getDescription() {
    return this.description;
  }

  /**
   * Get file templates
   */
  getFileTemplates(context) {
    // Base module uses file scanning approach
    return {};
  }
}

// Export class
export default BaseConfigModule;