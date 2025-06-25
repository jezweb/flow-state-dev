# Template Generator Documentation

The Template Generator is a sophisticated engine that merges multiple module templates intelligently to produce a cohesive project structure. It's a critical component of Flow State Dev's modular stack selection architecture.

## Overview

The Template Generator handles:
- Loading templates from multiple modules
- Resolving conflicts between templates
- Merging files intelligently based on file type
- Variable substitution using Handlebars
- Performance tracking and optimization

## Architecture

### Core Components

1. **TemplateGenerator** - Main class that orchestrates template generation
2. **MergeStrategies** - Defines how to merge files when multiple modules provide the same file
3. **ConflictResolver** - Handles conflicts with various resolution strategies
4. **Handlebars Helpers** - Custom helpers for template processing

## Usage

### Basic Usage

```javascript
import { TemplateGenerator } from './lib/modules/template-generator.js';

const generator = new TemplateGenerator();

const result = await generator.generate({
  modules: [vue3Module, vuetifyModule, supabaseModule],
  projectPath: './my-app',
  projectName: 'my-app',
  variables: {
    author: 'John Doe',
    description: 'My awesome app'
  }
});
```

### Module Requirements

Modules must provide:
- `templatePath` - Directory containing template files
- `priority` - Higher priority modules win in conflicts (default: 50)
- `mergeStrategies` (optional) - Custom merge strategies for specific files

## Template Files

### File Naming

Template files should have `.template` extension:
```
templates/
├── package.json.template
├── src/
│   ├── main.js.template
│   └── App.vue.template
└── .env.example.template
```

### Variable Substitution

Templates use Handlebars syntax:

```javascript
// package.json.template
{
  "name": "{{projectName}}",
  "version": "{{projectVersion}}",
  "description": "{{description}}",
  "author": "{{author}}"
}
```

## Merge Strategies

### Built-in Strategies

1. **replace** (default) - Use highest priority template
2. **merge** - Intelligently merge files
3. **append** - Concatenate all templates
4. **prepend** - Add to beginning
5. **merge-package** - Special handling for package.json
6. **merge-env** - Special handling for environment files

### Strategy Selection

Default strategies by file type:
- `package.json` → merge-package
- `.env`, `.env.example` → append (unique lines)
- `.json` → merge
- `.yml`, `.yaml` → merge
- `.gitignore` → append (unique lines)
- All others → replace

### Custom Strategies

Modules can define custom strategies:

```javascript
export class MyModule extends BaseStackModule {
  constructor() {
    super('my-module', 'My Module', {
      mergeStrategies: {
        'config/custom.json': {
          strategy: 'merge',
          type: 'json',
          arrayStrategy: 'unique' // or 'concat', 'replace'
        },
        'src/index.js': {
          strategy: 'custom',
          merge: (templates, render) => {
            // Custom merge logic
            return mergedContent;
          }
        }
      }
    });
  }
}
```

## Handlebars Helpers

### Module Helpers

```handlebars
{{#ifModule "vue3"}}
  // Vue-specific code
{{else}}
  // Alternative code
{{/ifModule}}

{{moduleProperty "vue3" "version"}}
{{moduleByType "frontend-framework" "name"}}
```

### String Helpers

```handlebars
{{camelCase projectName}}     // myAwesomeApp
{{pascalCase projectName}}    // MyAwesomeApp
{{kebabCase "myAwesomeApp"}}  // my-awesome-app
{{snakeCase "myAwesomeApp"}}  // my_awesome_app
{{capitalize "hello"}}        // Hello
{{uppercase "hello"}}         // HELLO
{{lowercase "HELLO"}}         // hello
```

### Comparison Helpers

```handlebars
{{#if (eq version "1.0.0")}}
  // Version is 1.0.0
{{/if}}

{{#if (gt count 5)}}
  // Count is greater than 5
{{/if}}
```

### Logic Helpers

```handlebars
{{#if (and isProduction (not debug))}}
  // Production mode without debug
{{/if}}

{{#if (or isDev isTest)}}
  // Development or test mode
{{/if}}
```

### Array Helpers

```handlebars
{{#if (includes features "auth")}}
  // Auth feature is enabled
{{/if}}

{{join keywords ", "}}  // keyword1, keyword2, keyword3
```

### JSON Helpers

```handlebars
<script>
const config = {{{json config}}};
const inline = {{{jsonInline data}}};
</script>
```

### Date/Time Helpers

```handlebars
Copyright © {{year}} {{author}}
Generated on {{date}}
Last updated: {{timestamp}}
```

## Conflict Resolution

### Resolution Strategies

1. **priority** (default) - Use highest priority module
2. **interactive** - Ask user to choose
3. **merge** - Attempt to merge if possible
4. **report** - Report conflicts without resolving

### Priority System

Module priority determines conflict resolution:
- Higher number = higher priority
- Default priority: 50
- Core modules: 100
- User modules: 75
- Community modules: 25

### Interactive Resolution

When `interactive: true`:
```
⚠️  Conflict detected in: package.json

┌────────────┬──────────┬──────┬──────────────┐
│ Module     │ Priority │ Size │ Description  │
├────────────┼──────────┼──────┼──────────────┤
│ vue3       │ 100      │ 512b │ Vue config   │
│ react      │ 100      │ 489b │ React config │
└────────────┴──────────┴──────┴──────────────┘

? Which version would you like to use?
> vue3 (priority: 100)
  react (priority: 100)
  ──────────────
  Merge files if possible
  View differences
  Skip this file
```

## Performance

### Optimization Features

1. **Template Caching** - Templates cached in memory
2. **Parallel Processing** - Multiple files processed concurrently
3. **Performance Tracking** - Metrics collected for analysis
4. **Lazy Loading** - Templates loaded on-demand

### Performance Metrics

```javascript
{
  moduleCount: 5,
  fileCount: 42,
  conflictCount: 3,
  duration: 250.5 // ms
}
```

## Advanced Features

### Static Files

Modules can include static files (not processed as templates):

```javascript
export class MyModule extends BaseStackModule {
  constructor() {
    super('my-module', 'My Module', {
      templatePath: './templates',
      staticPath: './static' // Copied as-is
    });
  }
}
```

### Module Hooks

```javascript
export class MyModule extends BaseStackModule {
  async beforeGenerate(context) {
    // Prepare for generation
  }
  
  async afterGenerate(context, result) {
    // Post-processing
  }
}
```

### Custom Variables

```javascript
const result = await generator.generate({
  modules,
  projectPath,
  projectName,
  variables: {
    // Built-in variables
    projectName: 'my-app',
    projectVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    
    // Custom variables
    apiUrl: 'https://api.example.com',
    features: ['auth', 'dashboard', 'api'],
    config: {
      theme: 'dark',
      locale: 'en'
    }
  }
});
```

## Error Handling

### Common Errors

1. **Template Not Found**
   ```
   Template path not found for vue3: /path/to/templates
   ```

2. **Invalid Template Syntax**
   ```
   Template rendering error: Expected closing tag
   ```

3. **Merge Conflict**
   ```
   Cannot merge files with incompatible strategies
   ```

### Error Recovery

The generator continues processing even with errors:
- Failed templates are skipped
- Conflicts are reported
- Generation completes with partial results

## Best Practices

### Template Design

1. **Use Variables** - Make templates flexible
2. **Module Conditionals** - Handle optional features
3. **Clear Structure** - Organize templates logically
4. **Documentation** - Comment complex templates

### Module Integration

1. **Set Priorities** - Define clear priority levels
2. **Merge Strategies** - Choose appropriate strategies
3. **Test Combinations** - Verify module compatibility
4. **Handle Edge Cases** - Account for missing modules

### Performance

1. **Minimize Templates** - Only include necessary files
2. **Optimize Merging** - Use efficient merge strategies
3. **Cache Results** - Reuse processed templates
4. **Profile Generation** - Monitor performance

## Examples

### Simple Module Template

```javascript
// templates/package.json.template
{
  "name": "{{projectName}}",
  "version": "{{projectVersion}}",
  "scripts": {
    {{#ifModule "vue3"}}
    "dev": "vite",
    "build": "vite build",
    {{/ifModule}}
    {{#ifModule "react"}}
    "dev": "vite",
    "build": "tsc && vite build",
    {{/ifModule}}
    "test": "vitest"
  },
  "dependencies": {
    {{#ifModule "vue3"}}
    "vue": "^{{moduleProperty "vue3" "version"}}"
    {{/ifModule}}
  }
}
```

### Complex Merge Example

```javascript
// Module A - package.json.template
{
  "name": "{{projectName}}",
  "dependencies": {
    "express": "^4.18.0"
  },
  "scripts": {
    "start": "node server.js"
  }
}

// Module B - package.json.template
{
  "dependencies": {
    "cors": "^2.8.5"
  },
  "scripts": {
    "test": "jest"
  }
}

// Result (merged)
{
  "name": "my-app",
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node server.js",
    "test": "jest"
  }
}
```

## API Reference

### TemplateGenerator

```javascript
class TemplateGenerator {
  async generate(options: GenerateOptions): Promise<GenerateResult>
  async renderTemplate(content: string): Promise<string>
  async copyStaticFiles(module: Module, projectPath: string): Promise<void>
}

interface GenerateOptions {
  modules: Module[]
  projectPath: string
  projectName: string
  variables?: Record<string, any>
  interactive?: boolean
}

interface GenerateResult {
  success: boolean
  generated: string[]
  conflicts: Conflict[]
  duration: number
}
```

### MergeStrategies

```javascript
class MergeStrategies {
  static replace(templates, render): Promise<string>
  static append(templates, render, options): Promise<string>
  static mergeJson(templates, render): Promise<string>
  static mergePackageJson(templates, render): Promise<string>
  static getStrategy(name: string): MergeFunction
}
```

### ConflictResolver

```javascript
class ConflictResolver {
  async resolve(filePath, templates, options): Promise<Resolution>
  generateReport(conflicts: Conflict[]): Report
  printReport(conflicts: Conflict[]): void
}
```