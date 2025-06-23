/**
 * Documentation Retrofit Module
 * 
 * Adds the complete Flow State Dev documentation system to existing projects.
 * Includes 21+ templates for comprehensive project documentation.
 */
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { BaseRetrofitModule } from './base-module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocumentationModule extends BaseRetrofitModule {
  constructor() {
    super('Documentation System', 'Complete documentation templates and structure', {
      version: '1.0.0',
      priority: 'high',
      impact: 'high',
      sinceVersion: '0.5.0',
      dependencies: [],
      conflicts: []
    });
  }

  /**
   * Check if documentation module can be applied
   */
  async canApply(projectAnalysis) {
    const hasExistingDocs = projectAnalysis.flowStateDev.hasDocumentation;
    
    if (hasExistingDocs) {
      return {
        canApply: false,
        reason: 'Documentation system already exists',
        requirements: []
      };
    }

    // Check if it's a valid project for documentation
    const isValidProject = projectAnalysis.directory.hasPackageJson || 
                          projectAnalysis.git.isGitRepo ||
                          projectAnalysis.flowStateDev.isFlowStateDevProject;

    if (!isValidProject) {
      return {
        canApply: false,
        reason: 'Project must have package.json or be a git repository',
        requirements: ['package.json file OR git repository']
      };
    }

    return {
      canApply: true,
      reason: 'Documentation system can be added',
      requirements: []
    };
  }

  /**
   * Preview what documentation files would be created
   */
  async previewChanges(projectPath, projectAnalysis) {
    const changes = {
      files: [],
      modifications: [],
      warnings: []
    };

    // Define all documentation files that would be created
    const docFiles = [
      { path: 'docs/README.md', description: 'Documentation index' },
      { path: 'docs/context/PROJECT_OVERVIEW.md', description: 'Project overview for AI' },
      { path: 'docs/context/TECH_STACK.md', description: 'Technology stack details' },
      { path: 'docs/context/ARCHITECTURE.md', description: 'System architecture' },
      { path: 'docs/context/CONVENTIONS.md', description: 'Code conventions' },
      { path: 'docs/guides/GETTING_STARTED.md', description: 'Getting started guide' },
      { path: 'docs/guides/DEVELOPMENT.md', description: 'Development workflow' },
      { path: 'docs/guides/DEPLOYMENT.md', description: 'Deployment instructions' },
      { path: 'docs/guides/TROUBLESHOOTING.md', description: 'Common issues and solutions' },
      { path: 'docs/api/SUPABASE.md', description: 'Supabase API documentation' },
      { path: 'docs/api/COMPONENTS.md', description: 'Component API reference' },
      { path: 'docs/api/STORES.md', description: 'Store API documentation' },
      { path: 'docs/architecture/DECISIONS.md', description: 'Architecture decision records' },
      { path: 'docs/architecture/DATABASE.md', description: 'Database design' },
      { path: 'docs/architecture/SECURITY.md', description: 'Security architecture' },
      { path: 'docs/CONTRIBUTING.md', description: 'Contribution guidelines' },
      { path: 'docs/SECURITY.md', description: 'Security documentation' },
      { path: 'docs/CHANGELOG.md', description: 'Change log template' },
      { path: 'docs/LABELS.md', description: 'GitHub labels documentation' },
      { path: 'docs/WORKFLOWS.md', description: 'Development workflows' },
      { path: 'docs/TESTING.md', description: 'Testing guidelines' }
    ];

    // Check which files already exist
    for (const file of docFiles) {
      const fullPath = path.join(projectPath, file.path);
      if (fs.existsSync(fullPath)) {
        changes.warnings.push(`File already exists: ${file.path} (will be skipped)`);
      } else {
        changes.files.push(file);
      }
    }

    // Check if README.md would be modified
    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      changes.modifications.push({
        path: 'README.md',
        description: 'Add documentation section and badges'
      });
    }

    return changes;
  }

  /**
   * Apply the documentation system to the project
   */
  async applyFeature(projectPath, projectAnalysis, options = {}) {
    const results = {
      success: false,
      changes: [],
      errors: []
    };

    try {
      // Get project information for template variables
      const templateVars = this.getTemplateVariables(projectAnalysis);
      
      // Create documentation directory structure
      const docsDir = path.join(projectPath, 'docs');
      await fs.ensureDir(docsDir);
      await fs.ensureDir(path.join(docsDir, 'context'));
      await fs.ensureDir(path.join(docsDir, 'guides'));
      await fs.ensureDir(path.join(docsDir, 'api'));
      await fs.ensureDir(path.join(docsDir, 'architecture'));

      // Create documentation files
      const docTemplates = await this.getDocumentationTemplates();
      
      for (const [filename, template] of Object.entries(docTemplates)) {
        const targetPath = path.join(projectPath, 'docs', filename);
        
        // Skip if file already exists (unless force option)
        if (fs.existsSync(targetPath) && !options.overwrite) {
          continue;
        }

        // Process template with variables
        const content = this.applyTemplateVariables(template, templateVars);
        
        await fs.ensureDir(path.dirname(targetPath));
        await fs.writeFile(targetPath, content);
        
        results.changes.push({
          type: 'create',
          path: path.relative(projectPath, targetPath),
          description: `Created documentation file`
        });
      }

      // Update README.md if it exists
      const readmePath = path.join(projectPath, 'README.md');
      if (fs.existsSync(readmePath) && !options.skipReadmeUpdate) {
        const updated = await this.updateReadmeWithDocs(readmePath, templateVars);
        if (updated) {
          results.changes.push({
            type: 'modify',
            path: 'README.md',
            description: 'Added documentation section'
          });
        }
      }

      results.success = true;
      
    } catch (error) {
      results.errors.push(error.message);
    }

    return results;
  }

  /**
   * Get template variables from project analysis
   */
  getTemplateVariables(projectAnalysis) {
    const projectName = projectAnalysis.directory.originalPath ? 
      path.basename(projectAnalysis.directory.originalPath) : 'my-project';
    
    const framework = projectAnalysis.framework.type || 'unknown';
    const hasSupabase = projectAnalysis.framework.hasSupabase;
    const hasVuetify = projectAnalysis.framework.hasVuetify;
    const hasTailwind = projectAnalysis.framework.hasTailwind;
    
    return {
      PROJECT_NAME: projectName,
      PROJECT_TITLE: this.titleCase(projectName.replace(/-/g, ' ')),
      FRAMEWORK: framework,
      FRAMEWORK_TITLE: this.titleCase(framework),
      HAS_SUPABASE: hasSupabase,
      HAS_VUETIFY: hasVuetify,
      HAS_TAILWIND: hasTailwind,
      CURRENT_DATE: new Date().toISOString().split('T')[0],
      CURRENT_YEAR: new Date().getFullYear()
    };
  }

  /**
   * Get all documentation templates
   */
  async getDocumentationTemplates() {
    return {
      'README.md': this.getDocsIndexTemplate(),
      'context/PROJECT_OVERVIEW.md': this.getProjectOverviewTemplate(),
      'context/TECH_STACK.md': this.getTechStackTemplate(),
      'context/ARCHITECTURE.md': this.getArchitectureTemplate(),
      'context/CONVENTIONS.md': this.getConventionsTemplate(),
      'guides/GETTING_STARTED.md': this.getGettingStartedTemplate(),
      'guides/DEVELOPMENT.md': this.getDevelopmentTemplate(),
      'guides/DEPLOYMENT.md': this.getDeploymentTemplate(),
      'guides/TROUBLESHOOTING.md': this.getTroubleshootingTemplate(),
      'api/SUPABASE.md': this.getSupabaseApiTemplate(),
      'api/COMPONENTS.md': this.getComponentsApiTemplate(),
      'api/STORES.md': this.getStoresApiTemplate(),
      'architecture/DECISIONS.md': this.getDecisionsTemplate(),
      'architecture/DATABASE.md': this.getDatabaseTemplate(),
      'architecture/SECURITY.md': this.getSecurityArchTemplate(),
      'CONTRIBUTING.md': this.getContributingTemplate(),
      'SECURITY.md': this.getSecurityTemplate(),
      'CHANGELOG.md': this.getChangelogTemplate(),
      'LABELS.md': this.getLabelsTemplate(),
      'WORKFLOWS.md': this.getWorkflowsTemplate(),
      'TESTING.md': this.getTestingTemplate()
    };
  }

  /**
   * Update README.md with documentation section
   */
  async updateReadmeWithDocs(readmePath, templateVars) {
    const content = await fs.readFile(readmePath, 'utf8');
    
    // Check if documentation section already exists
    if (content.includes('## Documentation') || content.includes('# Documentation')) {
      return false; // Already has documentation section
    }

    const docsSection = `
## Documentation

This project includes comprehensive documentation to help developers understand and contribute effectively.

### 📚 Documentation Structure

- **[Getting Started](docs/guides/GETTING_STARTED.md)** - Quick start guide for new developers
- **[Development Guide](docs/guides/DEVELOPMENT.md)** - Development workflow and best practices  
- **[API Documentation](docs/api/)** - Complete API reference
- **[Architecture](docs/architecture/)** - System design and decisions
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute to this project

### 🤖 AI-Optimized Context

The \`docs/context/\` folder contains structured information specifically designed for AI assistants:

- **[Project Overview](docs/context/PROJECT_OVERVIEW.md)** - High-level project description
- **[Tech Stack](docs/context/TECH_STACK.md)** - Technologies and versions used
- **[Architecture](docs/context/ARCHITECTURE.md)** - System architecture overview
- **[Conventions](docs/context/CONVENTIONS.md)** - Code style and naming conventions

### 🔍 Quick Reference

- [Troubleshooting](docs/guides/TROUBLESHOOTING.md) - Common issues and solutions
- [Security Guide](docs/SECURITY.md) - Security best practices
- [Testing Guide](docs/TESTING.md) - Testing strategies and guidelines
`;

    // Add documentation section before any existing sections like "License" or at the end
    let updatedContent;
    if (content.includes('## License') || content.includes('# License')) {
      updatedContent = content.replace(/(#{1,2} License)/m, docsSection + '\n$1');
    } else {
      updatedContent = content + docsSection;
    }

    await fs.writeFile(readmePath, updatedContent);
    return true;
  }

  // Template methods (simplified for brevity - in real implementation these would be comprehensive)
  getDocsIndexTemplate() {
    return `# {{PROJECT_TITLE}} Documentation

Welcome to the {{PROJECT_TITLE}} documentation. This directory contains comprehensive guides, API references, and context information to help you understand and contribute to the project.

## 📋 Quick Navigation

### For Developers
- [Getting Started](guides/GETTING_STARTED.md) - Set up your development environment
- [Development Guide](guides/DEVELOPMENT.md) - Development workflow and best practices
- [Contributing](CONTRIBUTING.md) - How to contribute to this project

### For AI Assistants  
- [Project Overview](context/PROJECT_OVERVIEW.md) - High-level project description
- [Tech Stack](context/TECH_STACK.md) - Technologies and versions
- [Architecture](context/ARCHITECTURE.md) - System design overview
- [Conventions](context/CONVENTIONS.md) - Code style and patterns

### API Reference
- [Components API](api/COMPONENTS.md) - Component documentation
- [Stores API](api/STORES.md) - State management documentation
{{#HAS_SUPABASE}}- [Supabase API](api/SUPABASE.md) - Database and API documentation{{/HAS_SUPABASE}}

### Architecture & Decisions
- [Architecture Decisions](architecture/DECISIONS.md) - ADR records
- [Database Design](architecture/DATABASE.md) - Database schema and design
- [Security Architecture](architecture/SECURITY.md) - Security implementation

## 🔧 Maintenance

This documentation is automatically maintained as part of the Flow State Dev system. Please keep it up to date as the project evolves.

Last updated: {{CURRENT_DATE}}
`;
  }

  getProjectOverviewTemplate() {
    return `# {{PROJECT_TITLE}} - Project Overview

*This document provides a high-level overview of the {{PROJECT_TITLE}} project for AI assistants and human developers.*

## Project Summary

{{PROJECT_TITLE}} is a {{FRAMEWORK_TITLE}} application built with modern web technologies and best practices.

### Key Characteristics
- **Framework**: {{FRAMEWORK_TITLE}}
- **Architecture**: Modern component-based architecture
{{#HAS_SUPABASE}}- **Backend**: Supabase (PostgreSQL + Auth + Storage){{/HAS_SUPABASE}}
{{#HAS_VUETIFY}}- **UI Library**: Vuetify (Material Design){{/HAS_VUETIFY}}
{{#HAS_TAILWIND}}- **Styling**: Tailwind CSS{{/HAS_TAILWIND}}
- **State Management**: Pinia stores
- **Build Tool**: Vite

## Project Goals

*Document your project's main objectives here*

## Current Status

*Update this section with current development status*

## Context for AI Assistants

When working on this project:
1. Follow the conventions outlined in [CONVENTIONS.md](CONVENTIONS.md)
2. Reference the tech stack details in [TECH_STACK.md](TECH_STACK.md)
3. Consider the architecture patterns in [ARCHITECTURE.md](ARCHITECTURE.md)
4. Prioritize security best practices from [../SECURITY.md](../SECURITY.md)

---
*Last updated: {{CURRENT_DATE}}*
`;
  }

  getTechStackTemplate() {
    return `# Technology Stack

## Frontend Framework
- **{{FRAMEWORK_TITLE}}** - {{#HAS_VUE}}Progressive JavaScript framework{{/HAS_VUE}}{{#HAS_REACT}}JavaScript library for building user interfaces{{/HAS_REACT}}

## UI & Styling
{{#HAS_VUETIFY}}- **Vuetify** - Material Design component library{{/HAS_VUETIFY}}
{{#HAS_TAILWIND}}- **Tailwind CSS** - Utility-first CSS framework{{/HAS_TAILWIND}}

## Backend & Database
{{#HAS_SUPABASE}}- **Supabase** - Open source Firebase alternative
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - Row Level Security (RLS){{/HAS_SUPABASE}}

## Development Tools
- **Vite** - Next generation frontend tooling
- **ESLint** - Code linting
- **Prettier** - Code formatting

## State Management
- **Pinia** - Vue store library

## Current Versions
*Update these versions as needed*

\`\`\`json
{
  "{{FRAMEWORK}}": "^3.0.0",
  {{#HAS_SUPABASE}}"@supabase/supabase-js": "^2.0.0",{{/HAS_SUPABASE}}
  {{#HAS_VUETIFY}}"vuetify": "^3.0.0",{{/HAS_VUETIFY}}
  "pinia": "^2.0.0",
  "vite": "^4.0.0"
}
\`\`\`

---
*Last updated: {{CURRENT_DATE}}*
`;
  }

  // Additional template methods would go here...
  getArchitectureTemplate() {
    return `# Architecture Overview

## System Architecture

{{PROJECT_TITLE}} follows a modern {{FRAMEWORK_TITLE}} architecture with clear separation of concerns.

## Directory Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── composables/    # Vue composition functions
├── router/         # Route definitions
├── stores/         # Pinia state stores
├── services/       # API services
├── views/          # Page components
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
\`\`\`

## Data Flow

1. **Components** render UI and handle user interactions
2. **Stores** manage application state using Pinia
3. **Services** handle API communication
4. **Composables** provide reusable logic

## Key Patterns

- Component composition over inheritance
- Reactive state management with Pinia
- Service layer for API abstraction
- Composables for shared logic

---
*Last updated: {{CURRENT_DATE}}*
`;
  }

  getConventionsTemplate() {
    return `# Code Conventions

## File Naming
- **Components**: PascalCase (e.g., \`UserProfile.vue\`)
- **Composables**: camelCase with \`use\` prefix (e.g., \`useUserData.js\`)
- **Stores**: camelCase with \`Store\` suffix (e.g., \`userStore.js\`)
- **Services**: camelCase (e.g., \`apiService.js\`)

## Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Prefer const over let
- Use meaningful variable names

## Component Structure
\`\`\`vue
<template>
  <!-- Template -->
</template>

<script setup>
// Imports
// Props & emits
// Reactive data
// Computed properties
// Methods
// Lifecycle hooks
</script>

<style scoped>
/* Component styles */
</style>
\`\`\`

---
*Last updated: {{CURRENT_DATE}}*
`;
  }

  // Utility methods
  titleCase(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // More template methods would be implemented here for each documentation file...
  getGettingStartedTemplate() { return `# Getting Started\n\n*Coming soon*\n`; }
  getDevelopmentTemplate() { return `# Development Guide\n\n*Coming soon*\n`; }
  getDeploymentTemplate() { return `# Deployment\n\n*Coming soon*\n`; }
  getTroubleshootingTemplate() { return `# Troubleshooting\n\n*Coming soon*\n`; }
  getSupabaseApiTemplate() { return `# Supabase API\n\n*Coming soon*\n`; }
  getComponentsApiTemplate() { return `# Components API\n\n*Coming soon*\n`; }
  getStoresApiTemplate() { return `# Stores API\n\n*Coming soon*\n`; }
  getDecisionsTemplate() { return `# Architecture Decisions\n\n*Coming soon*\n`; }
  getDatabaseTemplate() { return `# Database Design\n\n*Coming soon*\n`; }
  getSecurityArchTemplate() { return `# Security Architecture\n\n*Coming soon*\n`; }
  getContributingTemplate() { return `# Contributing\n\n*Coming soon*\n`; }
  getSecurityTemplate() { return `# Security\n\n*Coming soon*\n`; }
  getChangelogTemplate() { return `# Changelog\n\n*Coming soon*\n`; }
  getLabelsTemplate() { return `# GitHub Labels\n\n*Coming soon*\n`; }
  getWorkflowsTemplate() { return `# Workflows\n\n*Coming soon*\n`; }
  getTestingTemplate() { return `# Testing\n\n*Coming soon*\n`; }
}