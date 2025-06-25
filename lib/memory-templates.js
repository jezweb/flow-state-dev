/**
 * Memory Template System
 * Manages templates and sections for user memory files
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MemoryTemplateManager {
  constructor() {
    this.templatesDir = path.join(__dirname, '..', 'templates', 'memory');
    this.personasDir = path.join(this.templatesDir, 'personas');
    this.sectionsDir = path.join(this.templatesDir, 'sections');
  }

  /**
   * Get available persona templates
   */
  async getPersonaTemplates() {
    try {
      const files = await fs.readdir(this.personasDir);
      return files
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          name: path.basename(f, '.md'),
          path: path.join(this.personasDir, f),
          description: this.getTemplateDescription(f)
        }));
    } catch (error) {
      console.error(chalk.red('Error reading persona templates:'), error.message);
      return [];
    }
  }

  /**
   * Get template description based on filename
   */
  getTemplateDescription(filename) {
    const descriptions = {
      'minimal.md': 'Bare essentials only',
      'standard.md': 'Balanced configuration for most developers',
      'comprehensive.md': 'Detailed configuration with all options',
      'vue-developer.md': 'Optimized for Vue.js development',
      'full-stack.md': 'Full stack web development',
      'ai-engineer.md': 'AI/ML engineering and LLM development'
    };
    return descriptions[filename] || 'Custom template';
  }

  /**
   * Get available section templates by category
   */
  async getSectionTemplates() {
    const sections = {};
    
    try {
      const categories = await fs.readdir(this.sectionsDir);
      
      for (const category of categories) {
        const categoryPath = path.join(this.sectionsDir, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          sections[category] = files
            .filter(f => f.endsWith('.md'))
            .map(f => ({
              name: path.basename(f, '.md'),
              path: path.join(categoryPath, f),
              category
            }));
        }
      }
      
      return sections;
    } catch (error) {
      console.error(chalk.red('Error reading section templates:'), error.message);
      return {};
    }
  }

  /**
   * Load a template file
   */
  async loadTemplate(templatePath) {
    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load template: ${error.message}`);
    }
  }

  /**
   * Load a template from URL
   */
  async loadTemplateFromURL(url) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch template from URL: ${error.message}`);
    }
  }

  /**
   * Apply variable substitution to template
   */
  applyVariables(template, variables) {
    let result = template;
    
    // Replace variables with format {{variable}} or {{variable|default}}
    const variableRegex = /\{\{(\w+)(?:\|([^}]+))?\}\}/g;
    
    result = result.replace(variableRegex, (match, varName, defaultValue) => {
      if (variables[varName] !== undefined && variables[varName] !== '') {
        return variables[varName];
      }
      return defaultValue || match;
    });
    
    return result;
  }

  /**
   * Extract variables from a template
   */
  extractVariables(template) {
    const variables = new Set();
    const variableRegex = /\{\{(\w+)(?:\|[^}]+)?\}\}/g;
    
    let match;
    while ((match = variableRegex.exec(template)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }

  /**
   * Get default values for common variables
   */
  async getDefaultVariables() {
    // Try to use environment detector if available
    try {
      const { environmentDetector } = await import('./environment-detector.js');
      const detection = await environmentDetector.detect({ silent: true });
      
      return {
        name: detection.git?.user?.name || process.env.USER || 'User',
        os: `${detection.system.os.name} ${detection.system.os.version}`.trim() || this.detectOS(),
        shell: detection.system.shell.name || (process.env.SHELL ? path.basename(process.env.SHELL) : 'unknown'),
        projectPath: process.env.HOME + '/projects',
        nodeVersion: detection.system.nodeVersion || process.version,
        editor: environmentDetector.formatEditorName(detection.editor.primary) || 'VS Code',
        packageManager: Object.keys(detection.tools.packageManagers)[0] || 'npm',
        language: 'English',
        gitEmail: detection.git?.user?.email || '',
        github: detection.git?.user?.github || ''
      };
    } catch {
      // Fallback to basic detection
      return {
        name: process.env.USER || 'User',
        os: this.detectOS(),
        shell: process.env.SHELL ? path.basename(process.env.SHELL) : 'unknown',
        projectPath: process.env.HOME + '/projects',
        nodeVersion: process.version,
        editor: 'VS Code',
        packageManager: 'npm',
        language: 'English'
      };
    }
  }

  /**
   * Detect operating system with details
   */
  detectOS() {
    const platform = process.platform;
    
    if (platform === 'darwin') {
      return 'macOS';
    } else if (platform === 'win32') {
      return 'Windows';
    } else if (platform === 'linux') {
      // Try to get distribution info
      try {
        if (fs.existsSync('/etc/os-release')) {
          const osRelease = fs.readFileSync('/etc/os-release', 'utf-8');
          const match = osRelease.match(/PRETTY_NAME="(.+)"/);
          if (match) return match[1];
        }
      } catch {}
      return 'Linux';
    }
    
    return platform;
  }

  /**
   * Mix sections from different templates
   */
  async mixSections(sectionPaths) {
    const sections = [];
    
    for (const sectionPath of sectionPaths) {
      try {
        const content = await this.loadTemplate(sectionPath);
        sections.push(content.trim());
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not load section ${sectionPath}`));
      }
    }
    
    return sections.join('\n\n');
  }

  /**
   * Interactive template selection
   */
  async selectTemplate() {
    const personas = await this.getPersonaTemplates();
    
    if (personas.length === 0) {
      throw new Error('No templates found');
    }
    
    const { templateChoice } = await inquirer.prompt([{
      type: 'list',
      name: 'templateChoice',
      message: 'Choose a starting template:',
      choices: [
        ...personas.map(p => ({
          name: `${p.name} - ${p.description}`,
          value: p
        })),
        new inquirer.Separator(),
        { name: 'Custom URL', value: 'url' },
        { name: 'Mix sections', value: 'mix' }
      ]
    }]);
    
    if (templateChoice === 'url') {
      const { url } = await inquirer.prompt([{
        type: 'input',
        name: 'url',
        message: 'Enter template URL:',
        validate: input => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      }]);
      
      const content = await this.loadTemplateFromURL(url);
      return { content, isCustom: true };
    } else if (templateChoice === 'mix') {
      const sections = await this.selectSections();
      const content = await this.mixSections(sections);
      return { content, isMixed: true };
    } else {
      const content = await this.loadTemplate(templateChoice.path);
      return { content, template: templateChoice };
    }
  }

  /**
   * Interactive section selection
   */
  async selectSections() {
    const sectionsByCategory = await this.getSectionTemplates();
    const selectedSections = [];
    
    for (const [category, sections] of Object.entries(sectionsByCategory)) {
      if (sections.length === 0) continue;
      
      const { selected } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'selected',
        message: `Select ${category} sections:`,
        pageSize: 10,
        choices: sections.map(s => ({
          name: s.name.replace(/-/g, ' '),
          value: s.path
        }))
      }]);
      
      selectedSections.push(...selected);
    }
    
    return selectedSections;
  }

  /**
   * Collect variables for template
   */
  async collectVariables(template, providedVars = {}) {
    const requiredVars = this.extractVariables(template);
    const defaults = await this.getDefaultVariables();
    const variables = { ...defaults, ...providedVars };
    
    // Filter out variables that are already provided
    const missingVars = requiredVars.filter(v => 
      variables[v] === undefined || variables[v] === ''
    );
    
    if (missingVars.length === 0) {
      return variables;
    }
    
    console.log(chalk.blue('\n📝 Please provide values for template variables:\n'));
    
    const prompts = missingVars.map(varName => {
      const defaultValue = defaults[varName] || '';
      return {
        type: 'input',
        name: varName,
        message: `${this.formatVariableName(varName)}:`,
        default: defaultValue
      };
    });
    
    const answers = await inquirer.prompt(prompts);
    
    return { ...variables, ...answers };
  }

  /**
   * Format variable name for display
   */
  formatVariableName(varName) {
    return varName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * List all available templates
   */
  async listTemplates() {
    console.log(chalk.blue('\n📚 Available Memory Templates\n'));
    
    // List personas
    const personas = await this.getPersonaTemplates();
    console.log(chalk.white('Persona Templates:'));
    personas.forEach(p => {
      console.log(chalk.gray(`  • ${p.name} - ${p.description}`));
    });
    
    // List sections
    const sections = await this.getSectionTemplates();
    console.log(chalk.white('\nSection Templates:'));
    
    for (const [category, items] of Object.entries(sections)) {
      console.log(chalk.gray(`  ${category}:`));
      items.forEach(item => {
        console.log(chalk.gray(`    • ${item.name}`));
      });
    }
  }
}

// Export singleton instance
export const templateManager = new MemoryTemplateManager();