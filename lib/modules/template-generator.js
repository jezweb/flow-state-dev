/**
 * Template Generator - Generates project files from module templates
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import handlebars from 'handlebars';

export class TemplateGenerator {
  constructor(modules, projectPath) {
    this.modules = modules;
    this.projectPath = projectPath;
    this.templates = new Map();
    this.conflicts = [];
  }

  /**
   * Generate all templates from modules
   */
  async generate(context) {
    console.log(chalk.blue('\n📝 Generating project files...'));
    
    try {
      // Collect all templates from modules
      await this.collectTemplates(context);
      
      // Check for conflicts
      const conflicts = this.detectConflicts();
      if (conflicts.length > 0) {
        await this.resolveConflicts(conflicts);
      }
      
      // Generate files
      await this.generateFiles(context);
      
      // Run post-generation hooks
      await this.runPostGenerationHooks(context);
      
      console.log(chalk.green('✅ Project files generated successfully'));
      
      return {
        success: true,
        filesGenerated: this.templates.size,
        conflicts: conflicts.length
      };
    } catch (error) {
      console.error(chalk.red('❌ Template generation failed:'), error);
      throw error;
    }
  }

  /**
   * Collect templates from all modules
   */
  async collectTemplates(context) {
    for (const module of this.modules) {
      if (module.getFileTemplates) {
        // Class-based module with method
        const moduleTemplates = module.getFileTemplates(context);
        
        for (const [path, config] of Object.entries(moduleTemplates)) {
          if (!this.templates.has(path)) {
            this.templates.set(path, []);
          }
          
          this.templates.get(path).push({
            module: module.name,
            config,
            priority: module.priority || 0
          });
        }
      } else {
        // Configuration-only module - scan templates directory
        await this.collectConfigOnlyTemplates(module, context);
      }
    }
  }

  /**
   * Collect templates from configuration-only modules
   */
  async collectConfigOnlyTemplates(module, context) {
    if (!module.path) return;
    
    const templatesDir = join(module.path, 'templates');
    if (!existsSync(templatesDir)) return;
    
    // Scan templates directory
    await this.scanTemplateDirectory(templatesDir, '', module, context);
  }

  /**
   * Recursively scan template directory
   */
  async scanTemplateDirectory(dirPath, relativePath, module, context) {
    const fs = await import('fs');
    
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = join(dirPath, item.name);
        const itemRelativePath = relativePath ? join(relativePath, item.name) : item.name;
        
        if (item.isDirectory()) {
          await this.scanTemplateDirectory(itemPath, itemRelativePath, module, context);
        } else if (item.isFile() && (item.name.endsWith('.template') || item.name.endsWith('.merge'))) {
          // Template file - remove .template/.merge extension for target path
          const targetPath = itemRelativePath.replace(/\.(template|merge)$/, '');
          const mergeStrategy = item.name.endsWith('.merge') ? 'merge-json' : this.getMergeStrategy(module, targetPath);
          
          if (!this.templates.has(targetPath)) {
            this.templates.set(targetPath, []);
          }
          
          this.templates.get(targetPath).push({
            module: module.name,
            config: {
              source: itemPath,
              merge: mergeStrategy
            },
            priority: 0
          });
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not scan templates for ${module.name}:`, error.message));
    }
  }

  /**
   * Get merge strategy for a file path from module configuration
   */
  getMergeStrategy(module, filePath) {
    if (module.mergeStrategies && module.mergeStrategies[filePath]) {
      return module.mergeStrategies[filePath];
    }
    return 'replace'; // default strategy
  }

  /**
   * Detect template conflicts
   */
  detectConflicts() {
    const conflicts = [];
    
    for (const [path, sources] of this.templates) {
      if (sources.length > 1) {
        // Check if they have different merge strategies
        const strategies = new Set(sources.map(s => s.config.merge || 'replace'));
        
        if (strategies.size > 1 || !strategies.has('merge-json')) {
          conflicts.push({
            path,
            sources,
            strategies: Array.from(strategies)
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Resolve template conflicts
   */
  async resolveConflicts(conflicts) {
    console.log(chalk.yellow('\n⚠️  Template conflicts detected:'));
    
    for (const conflict of conflicts) {
      console.log(chalk.yellow(`\n  File: ${conflict.path}`));
      console.log(chalk.gray('  Sources:'));
      
      for (const source of conflict.sources) {
        console.log(chalk.gray(`    - ${source.module} (${source.config.merge || 'replace'})`));
      }
      
      // Check if any sources have merge-json strategy AND this is a JSON file
      const hasMergeJson = conflict.sources.some(s => s.config.merge === 'merge-json');
      const isJsonFile = conflict.path.endsWith('.json');
      
      if (hasMergeJson && isJsonFile) {
        // Update primary source merge strategy to merge-json
        conflict.sources[0].config.merge = 'merge-json';
        console.log(chalk.blue(`  → Will merge all JSON sources`));
      } else {
        // For now, use priority-based resolution
        // Higher priority modules win
        conflict.sources.sort((a, b) => b.priority - a.priority);
        console.log(chalk.blue(`  → Using template from: ${conflict.sources[0].module}`));
      }
    }
  }

  /**
   * Generate files from templates
   */
  async generateFiles(context) {
    const processedPaths = new Set();
    
    for (const [path, sources] of this.templates) {
      if (processedPaths.has(path)) continue;
      
      const targetPath = join(this.projectPath, path);
      
      // Sort by priority
      sources.sort((a, b) => b.priority - a.priority);
      
      // Process based on merge strategy
      const primarySource = sources[0];
      const mergeStrategy = primarySource.config.merge || 'replace';
      
      switch (mergeStrategy) {
        case 'merge-json':
          await this.generateMergedJson(targetPath, sources, context);
          break;
          
        case 'merge-routes':
          await this.generateMergedRoutes(targetPath, sources, context);
          break;
          
        case 'append':
        case 'append-unique':
          await this.generateAppended(targetPath, sources, context, mergeStrategy === 'append-unique');
          break;
          
        default:
          await this.generateSingle(targetPath, primarySource, context);
      }
      
      processedPaths.add(path);
    }
  }

  /**
   * Generate a single file
   */
  async generateSingle(targetPath, source, context) {
    const { config } = source;
    let content;
    
    if (config.src || config.source) {
      // Read from source file
      const sourcePath = config.src || config.source;
      content = readFileSync(sourcePath, 'utf-8');
      
      if (config.template !== false) {
        // Process as template (default behavior)
        content = this.processTemplate(content, context);
      }
    } else if (config.content) {
      // Use inline content
      content = config.content;
      
      if (config.template) {
        content = this.processTemplate(content, context);
      }
    }
    
    // Ensure directory exists
    const dir = dirname(targetPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    writeFileSync(targetPath, content);
    console.log(chalk.gray(`  ✓ ${targetPath}`));
  }

  /**
   * Generate merged JSON file
   */
  async generateMergedJson(targetPath, sources, context) {
    const merged = {};
    
    for (const source of sources) {
      let data;
      
      if (source.config.source) {
        const content = readFileSync(source.config.source, 'utf-8');
        data = JSON.parse(this.processTemplate(content, context));
      } else if (source.config.src) {
        const content = readFileSync(source.config.src, 'utf-8');
        data = JSON.parse(this.processTemplate(content, context));
      } else if (source.config.content) {
        data = source.config.content;
        if (typeof data === 'string') {
          data = JSON.parse(this.processTemplate(data, context));
        }
      }
      
      if (data) {
        // Deep merge
        this.deepMerge(merged, data);
      }
    }
    
    // Ensure directory exists
    const dir = dirname(targetPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // Write merged JSON
    writeFileSync(targetPath, JSON.stringify(merged, null, 2));
    console.log(chalk.gray(`  ✓ ${targetPath} (merged from ${sources.length} sources)`));
  }

  /**
   * Generate merged routes file
   */
  async generateMergedRoutes(targetPath, sources, context) {
    const routes = [];
    
    for (const source of sources) {
      let routeData;
      
      if (source.config.src) {
        const content = readFileSync(source.config.src, 'utf-8');
        // Extract routes array from the template
        const processed = this.processTemplate(content, context);
        // Simple extraction - might need more sophisticated parsing
        const match = processed.match(/export\s+(?:const|default)\s+routes\s*=\s*(\[[\s\S]+?\]);/);
        if (match) {
          routeData = eval(match[1]); // Note: eval is dangerous, consider safer alternatives
        }
      } else if (source.config.routes) {
        routeData = source.config.routes;
      }
      
      if (routeData && Array.isArray(routeData)) {
        routes.push(...routeData);
      }
    }
    
    // Generate routes file
    const routesContent = `import { createRouter, createWebHistory } from 'vue-router'

${this.generateImports(routes)}

const routes = ${JSON.stringify(routes, null, 2)}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router`;
    
    // Ensure directory exists
    const dir = dirname(targetPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(targetPath, routesContent);
    console.log(chalk.gray(`  ✓ ${targetPath} (merged ${routes.length} routes)`));
  }

  /**
   * Generate appended content
   */
  async generateAppended(targetPath, sources, context, unique = false) {
    const contents = [];
    const seen = new Set();
    
    for (const source of sources) {
      let content;
      
      if (source.config.src) {
        content = readFileSync(source.config.src, 'utf-8');
        if (source.config.template) {
          content = this.processTemplate(content, context);
        }
      } else if (source.config.content) {
        content = source.config.content;
        if (source.config.template) {
          content = this.processTemplate(content, context);
        }
      }
      
      if (content) {
        if (unique) {
          // Split by lines and only add unique lines
          const lines = content.split('\n');
          for (const line of lines) {
            if (!seen.has(line.trim()) && line.trim()) {
              seen.add(line.trim());
              contents.push(line);
            }
          }
        } else {
          contents.push(content);
        }
      }
    }
    
    // Ensure directory exists
    const dir = dirname(targetPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    const finalContent = unique ? contents.join('\n') : contents.join('\n\n');
    writeFileSync(targetPath, finalContent);
    console.log(chalk.gray(`  ✓ ${targetPath} (appended from ${sources.length} sources)`));
  }

  /**
   * Process template with context
   */
  processTemplate(template, context) {
    const compiled = handlebars.compile(template);
    return compiled(context);
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          this.deepMerge(target[key], source[key]);
        } else if (Array.isArray(source[key])) {
          if (!target[key]) target[key] = [];
          target[key].push(...source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  /**
   * Generate imports from routes
   */
  generateImports(routes) {
    const imports = new Set();
    
    for (const route of routes) {
      if (route.component && typeof route.component === 'string') {
        const componentName = route.component.split('/').pop().replace('.vue', '');
        imports.add(`import ${componentName} from '${route.component}'`);
      }
    }
    
    return Array.from(imports).join('\n');
  }

  /**
   * Run post-generation hooks
   */
  async runPostGenerationHooks(context) {
    for (const module of this.modules) {
      if (module.hooks && module.hooks.afterinstall) {
        console.log(chalk.blue(`\n🪝 Running post-install hook for ${module.name}...`));
        await module.hooks.afterinstall(context);
      }
    }
  }
}