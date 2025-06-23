/**
 * Enhanced Memory Setup
 * Provides comprehensive section-by-section configuration
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { templateManager } from './memory-templates.js';
import { environmentDetector } from './environment-detector.js';

export class EnhancedMemorySetup {
  constructor() {
    this.sections = [
      {
        id: 'personal',
        name: 'Personal Information',
        required: true,
        fields: [
          { name: 'name', message: 'Your name', required: true },
          { name: 'role', message: 'Your role/title', required: false },
          { name: 'company', message: 'Company/Organization', required: false },
          { name: 'location', message: 'Location (City, Country)', required: false },
          { name: 'timezone', message: 'Timezone', required: false },
          { name: 'email', message: 'Email (optional)', required: false },
          { name: 'github', message: 'GitHub username', required: false },
          { name: 'linkedin', message: 'LinkedIn URL', required: false }
        ]
      },
      {
        id: 'environment',
        name: 'Development Environment',
        required: true,
        fields: [
          { name: 'os', message: 'Operating System', default: () => this.detectOS() },
          { name: 'shell', message: 'Preferred shell', default: () => this.detectShell() },
          { name: 'terminal', message: 'Terminal application', required: false },
          { name: 'editor', message: 'Primary editor', default: 'VS Code' },
          { name: 'secondaryEditor', message: 'Secondary editor', required: false },
          { name: 'projectPath', message: 'Main project directory', default: () => path.join(os.homedir(), 'projects') },
          { name: 'display', message: 'Display setup (e.g., 4K, dual monitors)', required: false }
        ]
      },
      {
        id: 'techStack',
        name: 'Tech Stack Preferences',
        required: true,
        subsections: [
          {
            id: 'frontend',
            name: 'Frontend Technologies',
            multiselect: true,
            choices: [
              { name: 'Vue 3', value: 'vue3' },
              { name: 'React', value: 'react' },
              { name: 'Angular', value: 'angular' },
              { name: 'Svelte', value: 'svelte' },
              { name: 'Vuetify', value: 'vuetify' },
              { name: 'Material UI', value: 'material-ui' },
              { name: 'Tailwind CSS', value: 'tailwind' },
              { name: 'Bootstrap', value: 'bootstrap' },
              { name: 'TypeScript', value: 'typescript' },
              { name: 'Next.js', value: 'nextjs' },
              { name: 'Nuxt', value: 'nuxt' }
            ]
          },
          {
            id: 'backend',
            name: 'Backend Technologies',
            multiselect: true,
            choices: [
              { name: 'Node.js', value: 'nodejs' },
              { name: 'Python', value: 'python' },
              { name: 'Go', value: 'go' },
              { name: 'Java', value: 'java' },
              { name: 'Express', value: 'express' },
              { name: 'FastAPI', value: 'fastapi' },
              { name: 'Django', value: 'django' },
              { name: 'Spring Boot', value: 'spring' },
              { name: 'GraphQL', value: 'graphql' },
              { name: 'REST APIs', value: 'rest' }
            ]
          },
          {
            id: 'database',
            name: 'Databases & Services',
            multiselect: true,
            choices: [
              { name: 'PostgreSQL', value: 'postgresql' },
              { name: 'MySQL', value: 'mysql' },
              { name: 'MongoDB', value: 'mongodb' },
              { name: 'Redis', value: 'redis' },
              { name: 'Supabase', value: 'supabase' },
              { name: 'Firebase', value: 'firebase' },
              { name: 'SQLite', value: 'sqlite' },
              { name: 'Elasticsearch', value: 'elasticsearch' }
            ]
          },
          {
            id: 'devops',
            name: 'DevOps & Tools',
            multiselect: true,
            choices: [
              { name: 'Docker', value: 'docker' },
              { name: 'Kubernetes', value: 'kubernetes' },
              { name: 'GitHub Actions', value: 'github-actions' },
              { name: 'GitLab CI', value: 'gitlab-ci' },
              { name: 'Jenkins', value: 'jenkins' },
              { name: 'AWS', value: 'aws' },
              { name: 'GCP', value: 'gcp' },
              { name: 'Azure', value: 'azure' },
              { name: 'Terraform', value: 'terraform' },
              { name: 'Ansible', value: 'ansible' }
            ]
          }
        ]
      },
      {
        id: 'workStyle',
        name: 'Work Style & Preferences',
        required: true,
        fields: [
          {
            name: 'approach',
            message: 'Development approach',
            type: 'list',
            choices: [
              { name: 'Rapid Prototyping', value: 'prototype' },
              { name: 'Production Ready', value: 'production' },
              { name: 'Learning Focused', value: 'learning' },
              { name: 'Balanced', value: 'balanced' }
            ]
          },
          {
            name: 'methodology',
            message: 'Preferred methodology',
            type: 'list',
            choices: [
              { name: 'Agile/Scrum', value: 'agile' },
              { name: 'Kanban', value: 'kanban' },
              { name: 'Waterfall', value: 'waterfall' },
              { name: 'Hybrid', value: 'hybrid' }
            ]
          },
          {
            name: 'testing',
            message: 'Testing approach',
            type: 'list',
            choices: [
              { name: 'TDD (Test-Driven)', value: 'tdd' },
              { name: 'BDD (Behavior-Driven)', value: 'bdd' },
              { name: 'Test after implementation', value: 'after' },
              { name: 'Minimal testing', value: 'minimal' }
            ]
          },
          { name: 'codeStyle', message: 'Preferred code style guide', required: false },
          { name: 'gitWorkflow', message: 'Git workflow (e.g., GitFlow, GitHub Flow)', required: false }
        ]
      },
      {
        id: 'claude',
        name: 'Claude Interaction Preferences',
        required: true,
        fields: [
          {
            name: 'style',
            message: 'Communication style',
            type: 'list',
            choices: [
              { name: 'Concise and direct', value: 'concise' },
              { name: 'Detailed explanations', value: 'detailed' },
              { name: 'Educational/Learning', value: 'educational' },
              { name: 'Conversational', value: 'conversational' }
            ]
          },
          {
            name: 'codeExamples',
            message: 'Code example preferences',
            type: 'list',
            choices: [
              { name: 'Minimal - just the essentials', value: 'minimal' },
              { name: 'Complete - full context', value: 'complete' },
              { name: 'Progressive - build step by step', value: 'progressive' }
            ]
          },
          {
            name: 'errorHandling',
            message: 'Error handling in examples',
            type: 'list',
            choices: [
              { name: 'Always include', value: 'always' },
              { name: 'Only when critical', value: 'critical' },
              { name: 'Skip unless asked', value: 'skip' }
            ]
          },
          { name: 'language', message: 'Preferred language', default: 'English' },
          { name: 'avoidPatterns', message: 'Patterns to avoid (comma-separated)', required: false }
        ]
      },
      {
        id: 'goals',
        name: 'Goals & Projects',
        required: false,
        fields: [
          { name: 'currentProjects', message: 'Current projects (brief description)', type: 'editor' },
          { name: 'learningGoals', message: 'Learning goals', required: false },
          { name: 'interests', message: 'Technical interests', required: false },
          { name: 'constraints', message: 'Any constraints or limitations', required: false }
        ]
      }
    ];
    
    this.progressFile = path.join(os.homedir(), '.claude', '.memory-setup-progress.json');
  }

  /**
   * Run enhanced setup
   */
  async run(options = {}) {
    console.log(chalk.blue('\n🧠 Enhanced Memory Setup\n'));
    console.log(chalk.gray('This comprehensive setup allows you to configure every aspect of your memory file.\n'));
    
    // Store detection results if provided
    this.detectionResults = options.detectionResults;

    // Check for saved progress
    const progress = await this.loadProgress();
    if (progress && !options.restart) {
      const { resume } = await inquirer.prompt([{
        type: 'confirm',
        name: 'resume',
        message: 'Found saved progress. Would you like to resume?',
        default: true
      }]);
      
      if (resume) {
        return await this.resumeSetup(progress);
      }
    }

    // Start from template or scratch
    const { startFrom } = await inquirer.prompt([{
      type: 'list',
      name: 'startFrom',
      message: 'How would you like to start?',
      choices: [
        { name: 'Start from a template', value: 'template' },
        { name: 'Build from scratch', value: 'scratch' },
        { name: 'Import and customize', value: 'import' }
      ]
    }]);

    let baseContent = '';
    let variables = {};

    if (startFrom === 'template') {
      const { content, template } = await templateManager.selectTemplate();
      baseContent = content;
      variables = await templateManager.collectVariables(content);
      baseContent = templateManager.applyVariables(content, variables);
    } else if (startFrom === 'import') {
      // Import existing file logic here
      console.log(chalk.yellow('Import feature coming soon...'));
    }

    // Section by section configuration
    const responses = {};
    
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i];
      
      // Show progress
      console.log(chalk.blue(`\n📋 Section ${i + 1}/${this.sections.length}: ${section.name}\n`));
      
      // Ask if user wants to configure this section
      if (!section.required) {
        const { configure } = await inquirer.prompt([{
          type: 'confirm',
          name: 'configure',
          message: `Configure ${section.name}?`,
          default: true
        }]);
        
        if (!configure) {
          continue;
        }
      }
      
      // Configure section
      if (section.subsections) {
        responses[section.id] = await this.configureSubsections(section);
      } else {
        responses[section.id] = await this.configureFields(section.fields);
      }
      
      // Save progress after each section
      await this.saveProgress({ sections: responses, currentSection: i + 1 });
      
      // Offer to skip remaining sections
      if (i < this.sections.length - 1) {
        const { continueSetup } = await inquirer.prompt([{
          type: 'list',
          name: 'continueSetup',
          message: 'Continue with setup?',
          choices: [
            { name: 'Continue to next section', value: 'continue' },
            { name: 'Skip remaining sections', value: 'skip' },
            { name: 'Save and exit', value: 'exit' }
          ],
          default: 'continue'
        }]);
        
        if (continueSetup === 'skip') {
          break;
        } else if (continueSetup === 'exit') {
          console.log(chalk.yellow('\n⏸️  Setup paused. Run the command again to resume.'));
          return null;
        }
      }
    }

    // Generate final content
    const content = this.generateContent(responses, baseContent);
    
    // Preview
    console.log(chalk.blue('\n📄 Preview of your memory file:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(content.split('\n').slice(0, 20).join('\n'));
    if (content.split('\n').length > 20) {
      console.log(chalk.gray('... (truncated)'));
    }
    console.log(chalk.gray('─'.repeat(60)));

    // Clear progress
    await this.clearProgress();

    return content;
  }

  /**
   * Configure fields for a section
   */
  async configureFields(fields) {
    const responses = {};
    
    for (const field of fields) {
      // Get detected value if available
      let detectedDefault = this.getDetectedValue(field.name);
      
      if (field.type === 'list') {
        const { [field.name]: value } = await inquirer.prompt([{
          type: 'list',
          name: field.name,
          message: field.message,
          choices: field.choices,
          default: detectedDefault || field.default
        }]);
        responses[field.name] = value;
      } else if (field.type === 'editor') {
        const { [field.name]: value } = await inquirer.prompt([{
          type: 'editor',
          name: field.name,
          message: field.message
        }]);
        responses[field.name] = value;
      } else {
        const defaultValue = detectedDefault || 
          (typeof field.default === 'function' ? field.default() : field.default);
        
        if (field.required) {
          const { [field.name]: value } = await inquirer.prompt([{
            type: 'input',
            name: field.name,
            message: field.message,
            default: defaultValue,
            validate: input => input.trim() !== '' || `${field.message} is required`
          }]);
          responses[field.name] = value;
        } else {
          const { [field.name]: value } = await inquirer.prompt([{
            type: 'input',
            name: field.name,
            message: `${field.message} (optional)`,
            default: defaultValue
          }]);
          if (value && value.trim()) {
            responses[field.name] = value;
          }
        }
      }
    }
    
    return responses;
  }

  /**
   * Configure subsections with multiselect
   */
  async configureSubsections(section) {
    const responses = {};
    
    for (const subsection of section.subsections) {
      const { [subsection.id]: values } = await inquirer.prompt([{
        type: 'checkbox',
        name: subsection.id,
        message: `Select ${subsection.name}:`,
        choices: subsection.choices,
        pageSize: 10
      }]);
      
      if (values.length > 0) {
        responses[subsection.id] = values;
      }
    }
    
    return responses;
  }

  /**
   * Generate content from responses
   */
  generateContent(responses, baseContent = '') {
    let content = '';
    
    // Header
    const name = responses.personal?.name || 'User';
    content += `# User Memory for ${name}\n\n`;
    
    // Personal Information
    if (responses.personal) {
      content += `## Personal Information\n`;
      if (responses.personal.name) content += `- **Name**: ${responses.personal.name}\n`;
      if (responses.personal.role) content += `- **Role**: ${responses.personal.role}\n`;
      if (responses.personal.company) content += `- **Company**: ${responses.personal.company}\n`;
      if (responses.personal.location) content += `- **Location**: ${responses.personal.location}\n`;
      if (responses.personal.timezone) content += `- **Timezone**: ${responses.personal.timezone}\n`;
      if (responses.personal.email) content += `- **Email**: ${responses.personal.email}\n`;
      if (responses.personal.github) content += `- **GitHub**: https://github.com/${responses.personal.github}\n`;
      if (responses.personal.linkedin) content += `- **LinkedIn**: ${responses.personal.linkedin}\n`;
      content += '\n';
    }
    
    // Development Environment
    if (responses.environment) {
      content += `## Development Environment\n`;
      Object.entries(responses.environment).forEach(([key, value]) => {
        if (value) {
          const label = this.formatFieldName(key);
          content += `- **${label}**: ${value}\n`;
        }
      });
      content += '\n';
    }
    
    // Tech Stack
    if (responses.techStack) {
      content += `## Tech Stack Preferences\n`;
      
      if (responses.techStack.frontend && responses.techStack.frontend.length > 0) {
        content += `### Frontend\n`;
        responses.techStack.frontend.forEach(tech => {
          content += `- ${this.getTechName(tech)}\n`;
        });
        content += '\n';
      }
      
      if (responses.techStack.backend && responses.techStack.backend.length > 0) {
        content += `### Backend\n`;
        responses.techStack.backend.forEach(tech => {
          content += `- ${this.getTechName(tech)}\n`;
        });
        content += '\n';
      }
      
      if (responses.techStack.database && responses.techStack.database.length > 0) {
        content += `### Databases & Services\n`;
        responses.techStack.database.forEach(tech => {
          content += `- ${this.getTechName(tech)}\n`;
        });
        content += '\n';
      }
      
      if (responses.techStack.devops && responses.techStack.devops.length > 0) {
        content += `### DevOps & Tools\n`;
        responses.techStack.devops.forEach(tech => {
          content += `- ${this.getTechName(tech)}\n`;
        });
        content += '\n';
      }
    }
    
    // Work Style
    if (responses.workStyle) {
      content += `## Work Style & Preferences\n`;
      if (responses.workStyle.approach) {
        content += `- **Development Approach**: ${this.getWorkStyleDescription(responses.workStyle.approach)}\n`;
      }
      if (responses.workStyle.methodology) {
        content += `- **Methodology**: ${responses.workStyle.methodology}\n`;
      }
      if (responses.workStyle.testing) {
        content += `- **Testing**: ${this.getTestingDescription(responses.workStyle.testing)}\n`;
      }
      if (responses.workStyle.codeStyle) {
        content += `- **Code Style**: ${responses.workStyle.codeStyle}\n`;
      }
      if (responses.workStyle.gitWorkflow) {
        content += `- **Git Workflow**: ${responses.workStyle.gitWorkflow}\n`;
      }
      content += '\n';
    }
    
    // Claude Interaction
    if (responses.claude) {
      content += `## Claude Interaction Preferences\n`;
      if (responses.claude.style) {
        content += `- **Communication Style**: ${this.getStyleDescription(responses.claude.style)}\n`;
      }
      if (responses.claude.codeExamples) {
        content += `- **Code Examples**: ${this.getExampleDescription(responses.claude.codeExamples)}\n`;
      }
      if (responses.claude.errorHandling) {
        content += `- **Error Handling**: ${responses.claude.errorHandling}\n`;
      }
      if (responses.claude.language) {
        content += `- **Language**: ${responses.claude.language}\n`;
      }
      if (responses.claude.avoidPatterns) {
        content += `- **Avoid**: ${responses.claude.avoidPatterns}\n`;
      }
      content += '\n';
    }
    
    // Goals
    if (responses.goals) {
      if (responses.goals.currentProjects) {
        content += `## Current Projects\n${responses.goals.currentProjects}\n\n`;
      }
      if (responses.goals.learningGoals || responses.goals.interests || responses.goals.constraints) {
        content += `## Goals & Interests\n`;
        if (responses.goals.learningGoals) content += `- **Learning**: ${responses.goals.learningGoals}\n`;
        if (responses.goals.interests) content += `- **Interests**: ${responses.goals.interests}\n`;
        if (responses.goals.constraints) content += `- **Constraints**: ${responses.goals.constraints}\n`;
        content += '\n';
      }
    }
    
    return content.trim();
  }

  /**
   * Format field names for display
   */
  formatFieldName(fieldName) {
    const formatted = fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    // Special cases
    const specialCases = {
      'Os': 'OS',
      'Project Path': 'Project Location',
      'Secondary Editor': 'Secondary Editor'
    };
    
    return specialCases[formatted] || formatted;
  }

  /**
   * Get technology display names
   */
  getTechName(tech) {
    const techNames = {
      'vue3': 'Vue 3',
      'react': 'React',
      'angular': 'Angular',
      'svelte': 'Svelte',
      'vuetify': 'Vuetify 3',
      'material-ui': 'Material UI',
      'tailwind': 'Tailwind CSS',
      'bootstrap': 'Bootstrap',
      'typescript': 'TypeScript',
      'nextjs': 'Next.js',
      'nuxt': 'Nuxt',
      'nodejs': 'Node.js',
      'python': 'Python',
      'go': 'Go',
      'java': 'Java',
      'express': 'Express.js',
      'fastapi': 'FastAPI',
      'django': 'Django',
      'spring': 'Spring Boot',
      'graphql': 'GraphQL',
      'rest': 'REST APIs',
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      'supabase': 'Supabase',
      'firebase': 'Firebase',
      'sqlite': 'SQLite',
      'elasticsearch': 'Elasticsearch',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'github-actions': 'GitHub Actions',
      'gitlab-ci': 'GitLab CI',
      'jenkins': 'Jenkins',
      'aws': 'AWS',
      'gcp': 'Google Cloud Platform',
      'azure': 'Microsoft Azure',
      'terraform': 'Terraform',
      'ansible': 'Ansible'
    };
    
    return techNames[tech] || tech;
  }

  /**
   * Get work style descriptions
   */
  getWorkStyleDescription(style) {
    const descriptions = {
      'prototype': 'Rapid prototyping - build fast, iterate quickly',
      'production': 'Production-ready code with proper testing',
      'learning': 'Learning-focused with detailed understanding',
      'balanced': 'Balanced mix of speed and quality'
    };
    
    return descriptions[style] || style;
  }

  /**
   * Get testing descriptions
   */
  getTestingDescription(testing) {
    const descriptions = {
      'tdd': 'Test-Driven Development',
      'bdd': 'Behavior-Driven Development',
      'after': 'Test after implementation',
      'minimal': 'Minimal testing for prototypes'
    };
    
    return descriptions[testing] || testing;
  }

  /**
   * Get style descriptions
   */
  getStyleDescription(style) {
    const descriptions = {
      'concise': 'Concise and direct',
      'detailed': 'Detailed explanations',
      'educational': 'Educational with learning focus',
      'conversational': 'Conversational and friendly'
    };
    
    return descriptions[style] || style;
  }

  /**
   * Get example descriptions
   */
  getExampleDescription(example) {
    const descriptions = {
      'minimal': 'Minimal - just the essentials',
      'complete': 'Complete with full context',
      'progressive': 'Progressive - build step by step'
    };
    
    return descriptions[example] || example;
  }

  /**
   * Get detected value for a field
   */
  getDetectedValue(fieldName) {
    if (!this.detectionResults) return null;
    
    const mappings = {
      // Personal info
      'name': this.detectionResults.git?.user?.name || this.detectionResults.system.username,
      'email': this.detectionResults.git?.user?.email,
      'github': this.detectionResults.git?.user?.github,
      
      // Environment
      'os': `${this.detectionResults.system.os.name} ${this.detectionResults.system.os.version}`.trim(),
      'shell': this.detectionResults.system.shell.name,
      'editor': environmentDetector.formatEditorName(this.detectionResults.editor.primary),
      'projectPath': path.join(os.homedir(), 'projects'),
      
      // Tech stack suggestions
      'packageManager': Object.keys(this.detectionResults.tools.packageManagers)[0],
      'versionControl': this.detectionResults.tools.versionControl.git ? 'Git' : null,
      'containerTool': this.detectionResults.tools.containers.docker ? 'Docker' : null,
      'cloudProvider': this.detectionResults.tools.cloudCLIs.aws ? 'AWS' :
                       this.detectionResults.tools.cloudCLIs.gcloud ? 'GCP' :
                       this.detectionResults.tools.cloudCLIs.az ? 'Azure' : null
    };
    
    return mappings[fieldName];
  }

  /**
   * Detect OS
   */
  detectOS() {
    return templateManager.detectOS();
  }

  /**
   * Detect shell
   */
  detectShell() {
    return process.env.SHELL ? path.basename(process.env.SHELL) : 'unknown';
  }

  /**
   * Save progress
   */
  async saveProgress(progress) {
    try {
      await fs.ensureDir(path.dirname(this.progressFile));
      await fs.writeJson(this.progressFile, {
        ...progress,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Silently fail - progress saving is not critical
    }
  }

  /**
   * Load progress
   */
  async loadProgress() {
    try {
      if (await fs.pathExists(this.progressFile)) {
        return await fs.readJson(this.progressFile);
      }
    } catch (error) {
      // Silently fail
    }
    return null;
  }

  /**
   * Clear progress
   */
  async clearProgress() {
    try {
      if (await fs.pathExists(this.progressFile)) {
        await fs.remove(this.progressFile);
      }
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Resume setup from saved progress
   */
  async resumeSetup(progress) {
    console.log(chalk.blue('\n📂 Resuming setup...\n'));
    
    const responses = progress.sections || {};
    const startFrom = progress.currentSection || 0;
    
    // Continue from where we left off
    for (let i = startFrom; i < this.sections.length; i++) {
      const section = this.sections[i];
      
      console.log(chalk.blue(`\n📋 Section ${i + 1}/${this.sections.length}: ${section.name}\n`));
      
      if (!section.required) {
        const { configure } = await inquirer.prompt([{
          type: 'confirm',
          name: 'configure',
          message: `Configure ${section.name}?`,
          default: true
        }]);
        
        if (!configure) {
          continue;
        }
      }
      
      if (section.subsections) {
        responses[section.id] = await this.configureSubsections(section);
      } else {
        responses[section.id] = await this.configureFields(section.fields);
      }
      
      await this.saveProgress({ sections: responses, currentSection: i + 1 });
    }
    
    const content = this.generateContent(responses);
    await this.clearProgress();
    
    return content;
  }
}

// Export singleton instance
export const enhancedSetup = new EnhancedMemorySetup();