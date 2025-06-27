/**
 * Memory API
 * 
 * API for managing Claude AI memory files
 */

// TODO: Import MemoryInitCommand when implemented
// import { MemoryInitCommand } from '../../commands/memory-init.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import EventEmitter from 'events';

export class MemoryAPI extends EventEmitter {
  constructor(flowStateAPI) {
    super();
    this.api = flowStateAPI;
    this.memoryPath = 'CLAUDE.md';
    // TODO: Get templates path from config
    this.templatesPath = join(process.cwd(), 'templates', 'memory');
  }
  
  /**
   * Initialize memory file for a project
   * @param {Object} options - Memory initialization options
   * @returns {Object} Initialization result
   */
  async initialize(options = {}) {
    try {
      this.emit('progress', { 
        step: 'memory:init', 
        message: 'Initializing Claude memory...' 
      });
      
      // TODO: Use MemoryInitCommand when implemented
      // const command = new MemoryInitCommand();
      
      // Prepare context
      const context = {
        name: options.name || 'Developer',
        role: options.role,
        os: options.os || process.platform,
        shell: options.shell || process.env.SHELL || 'bash',
        nodeVersion: process.version,
        projectPath: process.cwd(),
        ...options.context
      };
      
      // Get template
      const template = await this.getTemplate(options.template || 'standard');
      
      // Render template
      const content = this.renderTemplate(template, context);
      
      // Write file
      const filePath = join(process.cwd(), this.memoryPath);
      writeFileSync(filePath, content, 'utf8');
      
      this.emit('progress', { 
        step: 'memory:complete', 
        message: 'Memory file created' 
      });
      
      return {
        success: true,
        path: filePath,
        template: options.template || 'standard',
        context
      };
      
    } catch (error) {
      this.emit('error', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Read existing memory file
   * @param {string} path - Optional custom path
   * @returns {Object} Memory content
   */
  async read(path) {
    try {
      const filePath = path || join(process.cwd(), this.memoryPath);
      
      if (!existsSync(filePath)) {
        return {
          exists: false,
          message: 'No memory file found'
        };
      }
      
      const content = readFileSync(filePath, 'utf8');
      const metadata = this.parseMetadata(content);
      
      return {
        exists: true,
        path: filePath,
        content,
        metadata,
        size: content.length
      };
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
  
  /**
   * Update memory file
   * @param {string} content - New content
   * @param {string} path - Optional custom path
   * @returns {Object} Update result
   */
  async update(content, path) {
    try {
      const filePath = path || join(process.cwd(), this.memoryPath);
      
      // Backup existing file
      if (existsSync(filePath)) {
        const backup = readFileSync(filePath, 'utf8');
        writeFileSync(`${filePath}.backup`, backup, 'utf8');
      }
      
      // Write new content
      writeFileSync(filePath, content, 'utf8');
      
      return {
        success: true,
        path: filePath,
        backupCreated: true
      };
      
    } catch (error) {
      this.emit('error', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get available templates
   * @returns {Array} Available templates
   */
  async getTemplates() {
    const templates = [
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Basic information only',
        sections: ['personal', 'environment']
      },
      {
        id: 'standard',
        name: 'Standard',
        description: 'Comprehensive developer profile',
        sections: ['personal', 'environment', 'tech-stack', 'work-style']
      },
      {
        id: 'vue-developer',
        name: 'Vue Developer',
        description: 'Optimized for Vue.js development',
        sections: ['personal', 'environment', 'vue-stack', 'work-style']
      },
      {
        id: 'full-stack',
        name: 'Full Stack',
        description: 'Frontend and backend developer',
        sections: ['personal', 'environment', 'full-stack', 'work-style']
      },
      {
        id: 'ai-engineer',
        name: 'AI Engineer',
        description: 'AI and machine learning focus',
        sections: ['personal', 'environment', 'ai-stack', 'work-style']
      },
      {
        id: 'comprehensive',
        name: 'Comprehensive',
        description: 'Maximum detail for complex projects',
        sections: ['personal', 'environment', 'tech-stack', 'work-style', 'preferences', 'goals']
      }
    ];
    
    return templates;
  }
  
  /**
   * Get template content
   * @param {string} templateId - Template ID
   * @returns {string} Template content
   */
  async getTemplate(templateId) {
    // TODO: Load from actual template files
    // For now, return a simple template
    return `# User Memory for {{name}}

## Personal Information
- **Name**: {{name}}
- **Role**: {{role}}
- **OS**: {{os}}

## Development Environment
- **Node Version**: {{nodeVersion}}
- **Shell**: {{shell}}
- **Project Path**: {{projectPath}}
`;
  }
  
  /**
   * Render template with context
   */
  renderTemplate(template, context) {
    // Simple template rendering (replace with Handlebars if needed)
    let rendered = template;
    
    // Replace all template variables
    Object.entries(context).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, value || '');
    });
    
    // Handle default values
    rendered = rendered.replace(/{{default\s+(\w+)\s+"([^"]+)"}}/g, (match, key, defaultValue) => {
      return context[key] || defaultValue;
    });
    
    // Remove any remaining template variables
    rendered = rendered.replace(/{{[^}]+}}/g, '');
    
    return rendered;
  }
  
  /**
   * Parse metadata from memory content
   */
  parseMetadata(content) {
    const metadata = {};
    
    // Extract name
    const nameMatch = content.match(/^#.*?for\s+(.+?)$/m);
    if (nameMatch) metadata.name = nameMatch[1];
    
    // Extract role
    const roleMatch = content.match(/\*\*Role\*\*:\s*(.+?)$/m);
    if (roleMatch) metadata.role = roleMatch[1];
    
    // Extract sections
    const sections = [];
    const sectionMatches = content.matchAll(/^##\s+(.+?)$/gm);
    for (const match of sectionMatches) {
      sections.push(match[1]);
    }
    metadata.sections = sections;
    
    // Extract tech stack
    const techStack = [];
    const techMatches = content.matchAll(/\*\*Framework\*\*:\s*(.+?)$/gm);
    for (const match of techMatches) {
      techStack.push(match[1]);
    }
    metadata.techStack = techStack;
    
    return metadata;
  }
  
  /**
   * Validate memory content
   * @param {string} content - Memory content to validate
   * @returns {Object} Validation result
   */
  async validate(content) {
    const issues = [];
    const warnings = [];
    
    // Check for required sections
    if (!content.includes('# User Memory') && !content.includes('# Claude Memory')) {
      issues.push('Missing header section');
    }
    
    if (!content.includes('## Personal Information')) {
      warnings.push('Missing personal information section');
    }
    
    if (!content.includes('## Development Environment')) {
      warnings.push('Missing development environment section');
    }
    
    // Check for template variables
    const unresolvedVars = content.match(/{{[^}]+}}/g);
    if (unresolvedVars) {
      issues.push(`Unresolved template variables: ${unresolvedVars.join(', ')}`);
    }
    
    // Check file size
    if (content.length > 50000) {
      warnings.push('File is very large (>50KB), consider being more concise');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }
}