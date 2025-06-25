# Slash Command Plugins

This guide explains how to create, publish, and use slash command plugins for Flow State Dev.

## Table of Contents

- [Overview](#overview)
- [Creating a Plugin](#creating-a-plugin)
- [Plugin Structure](#plugin-structure)
- [Publishing Plugins](#publishing-plugins)
- [Using Plugins](#using-plugins)
- [Plugin Discovery](#plugin-discovery)
- [Security Considerations](#security-considerations)
- [Best Practices](#best-practices)
- [Example Plugin](#example-plugin)

## Overview

The Flow State Dev slash command system supports plugins, allowing developers to create and share custom commands. Plugins are npm packages that export command classes compatible with the FSD command system.

### Benefits of Plugins

- **Extensibility** - Add domain-specific commands
- **Reusability** - Share commands across projects
- **Community** - Contribute to the ecosystem
- **Customization** - Tailor FSD to your workflow

## Creating a Plugin

### Step 1: Initialize Plugin Project

```bash
mkdir fsd-plugin-mycommands
cd fsd-plugin-mycommands
npm init -y
```

### Step 2: Configure package.json

```json
{
  "name": "fsd-plugin-mycommands",
  "version": "1.0.0",
  "description": "Custom slash commands for Flow State Dev",
  "type": "module",
  "main": "./lib/index.js",
  "exports": {
    ".": "./lib/index.js",
    "./commands": "./lib/commands/index.js"
  },
  "keywords": [
    "flow-state-dev",
    "fsd-plugin",
    "slash-commands"
  ],
  "peerDependencies": {
    "flow-state-dev": "^2.0.0"
  },
  "devDependencies": {
    "flow-state-dev": "^2.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 3: Create Command Classes

```javascript
// lib/commands/deploy.js
import { GitHubSlashCommand } from 'flow-state-dev/commands';

export default class DeployCommand extends GitHubSlashCommand {
  constructor() {
    super('/deploy:prod', 'Deploy to production environment', {
      aliases: ['/deploy:production'],
      category: 'workflow',
      requiresAuth: true
    });
  }

  async execute(options) {
    this.log('Starting production deployment...', 'info');
    
    // Your deployment logic here
    await this.exec('npm run build');
    await this.exec('npm run deploy:prod');
    
    this.log('Deployment complete!', 'success');
  }
}
```

### Step 4: Export Commands

```javascript
// lib/commands/index.js
export { default as DeployCommand } from './deploy.js';
export { default as BackupCommand } from './backup.js';
export { default as MigrateCommand } from './migrate.js';

// lib/index.js
export * from './commands/index.js';

// Optional: Export metadata
export const metadata = {
  name: 'fsd-plugin-mycommands',
  version: '1.0.0',
  commands: [
    '/deploy:prod',
    '/backup:db',
    '/migrate:data'
  ]
};
```

## Plugin Structure

### Recommended Directory Structure

```
fsd-plugin-mycommands/
├── lib/
│   ├── commands/
│   │   ├── deploy.js
│   │   ├── backup.js
│   │   ├── migrate.js
│   │   └── index.js
│   ├── utils/
│   │   └── helpers.js
│   └── index.js
├── test/
│   └── commands/
│       └── deploy.test.js
├── docs/
│   └── README.md
├── package.json
├── README.md
└── LICENSE
```

### Command Naming Convention

Plugin commands should use a namespace to avoid conflicts:

```javascript
// Good: Namespaced commands
'/mycompany:deploy'
'/mycompany:backup'
'/mycompany:sync'

// Avoid: Generic names that might conflict
'/deploy'  // Too generic
'/sync'    // Might conflict with core commands
```

## Publishing Plugins

### Step 1: Add Metadata

Include plugin metadata for discovery:

```javascript
// lib/metadata.js
export const pluginMetadata = {
  name: 'fsd-plugin-mycommands',
  displayName: 'My Commands Plugin',
  version: '1.0.0',
  author: 'Your Name',
  description: 'Custom commands for specific workflow',
  homepage: 'https://github.com/user/fsd-plugin-mycommands',
  commands: [
    {
      name: '/mycompany:deploy',
      description: 'Deploy to production',
      category: 'workflow'
    },
    {
      name: '/mycompany:backup',
      description: 'Backup database',
      category: 'utility'
    }
  ],
  requirements: {
    'flow-state-dev': '^2.0.0',
    node: '>=18.0.0'
  }
};
```

### Step 2: Add README

Create comprehensive documentation:

```markdown
# FSD Plugin: My Commands

Custom slash commands for Flow State Dev.

## Installation

```bash
npm install fsd-plugin-mycommands
```

## Commands

### /mycompany:deploy
Deploy application to production environment.

```bash
fsd slash "/mycompany:deploy"
fsd slash "/mycompany:deploy --skip-tests"
```

### /mycompany:backup
Create database backup.

```bash
fsd slash "/mycompany:backup"
fsd slash "/mycompany:backup --compress"
```

## Configuration

Add to your `fsd.config.js`:

```javascript
export default {
  plugins: [
    'fsd-plugin-mycommands'
  ]
};
```
```

### Step 3: Publish to npm

```bash
# Run tests
npm test

# Build if needed
npm run build

# Publish
npm publish
```

## Using Plugins

### Installation

```bash
# Install plugin
npm install fsd-plugin-mycommands

# Or install globally
npm install -g fsd-plugin-mycommands
```

### Configuration

Add to your project's `fsd.config.js`:

```javascript
// fsd.config.js
export default {
  plugins: [
    'fsd-plugin-mycommands',
    'fsd-plugin-other',
    // Local plugin
    './local-plugins/my-local-commands'
  ],
  
  // Plugin-specific configuration
  'fsd-plugin-mycommands': {
    apiKey: process.env.MY_API_KEY,
    environment: 'production'
  }
};
```

### Manual Registration

For one-off usage without configuration:

```javascript
// In your project
import { registerPlugin } from 'flow-state-dev';
import MyCommandsPlugin from 'fsd-plugin-mycommands';

registerPlugin(MyCommandsPlugin);
```

## Plugin Discovery

### Automatic Discovery

Flow State Dev automatically discovers plugins that:

1. Are installed in `node_modules`
2. Have `fsd-plugin` keyword in package.json
3. Export command classes from main entry

### Plugin Registry

Future enhancement: Central plugin registry

```bash
# Search for plugins (future)
fsd plugins search deployment

# Install from registry (future)
fsd plugins install deployment-tools
```

## Security Considerations

### Plugin Validation

Flow State Dev validates plugins for:

- Valid command structure
- No command name conflicts
- Proper exports
- Security patterns

### Best Practices for Security

1. **Validate Inputs**
   ```javascript
   async execute(options) {
     // Sanitize user input
     const safePath = path.normalize(options.args[0]);
     if (safePath.includes('..')) {
       this.log('Invalid path', 'error');
       return;
     }
   }
   ```

2. **Use Minimal Permissions**
   ```javascript
   // Only request needed permissions
   constructor() {
     super('/plugin:command', 'Description', {
       requiresAuth: false,  // Only if needed
       requiresRepo: false   // Only if needed
     });
   }
   ```

3. **Avoid Executing User Input**
   ```javascript
   // Bad: Direct execution
   await this.exec(userInput);
   
   // Good: Validated execution
   const allowedCommands = ['build', 'test'];
   if (allowedCommands.includes(userInput)) {
     await this.exec(`npm run ${userInput}`);
   }
   ```

## Best Practices

### 1. Namespace Your Commands

Always prefix commands to avoid conflicts:

```javascript
// Good
'/mycompany:deploy'
'/teamname:sync'
'/projectx:migrate'

// Bad
'/deploy'  // Too generic
'/d'       // Too short, might conflict
```

### 2. Provide Comprehensive Help

```javascript
constructor() {
  super('/plugin:command', 'Clear description here', {
    usage: '/plugin:command <required> [optional]',
    examples: [
      'fsd slash "/plugin:command input"',
      'fsd slash "/plugin:command input --flag"'
    ],
    options: {
      flag: {
        type: 'boolean',
        description: 'Enable special mode'
      },
      output: {
        type: 'string',
        description: 'Output format (json, text)',
        default: 'text'
      }
    }
  });
}
```

### 3. Handle Errors Gracefully

```javascript
async execute(options) {
  try {
    // Validate environment
    if (!process.env.REQUIRED_VAR) {
      this.log('Missing REQUIRED_VAR environment variable', 'error');
      this.log('Run: export REQUIRED_VAR=value', 'info');
      return;
    }
    
    // Your logic
    
  } catch (error) {
    this.log(`Error: ${error.message}`, 'error');
    
    // Provide helpful context
    if (error.code === 'ENOENT') {
      this.log('File not found. Check the path and try again.', 'info');
    }
  }
}
```

### 4. Support Configuration

```javascript
export default class ConfigurableCommand extends BaseSlashCommand {
  constructor() {
    super('/plugin:config', 'Configurable command');
  }
  
  async execute(options) {
    // Read from FSD config
    const config = await this.getPluginConfig('fsd-plugin-mycommands');
    
    // Or from environment
    const apiKey = process.env.PLUGIN_API_KEY || config?.apiKey;
    
    if (!apiKey) {
      this.log('API key required. Set PLUGIN_API_KEY or configure in fsd.config.js', 'error');
      return;
    }
    
    // Continue with apiKey
  }
  
  async getPluginConfig(pluginName) {
    try {
      const { default: config } = await import(
        path.join(process.cwd(), 'fsd.config.js')
      );
      return config[pluginName];
    } catch {
      return null;
    }
  }
}
```

## Example Plugin

Here's a complete example of a database management plugin:

### Package Structure

```
fsd-plugin-database/
├── lib/
│   ├── commands/
│   │   ├── backup.js
│   │   ├── restore.js
│   │   ├── migrate.js
│   │   └── index.js
│   ├── utils/
│   │   └── database.js
│   └── index.js
├── package.json
└── README.md
```

### Commands Implementation

```javascript
// lib/commands/backup.js
import { GitHubSlashCommand } from 'flow-state-dev/commands';
import { createBackup } from '../utils/database.js';

export default class BackupCommand extends GitHubSlashCommand {
  constructor() {
    super('/db:backup', 'Create database backup', {
      aliases: ['/database:backup'],
      category: 'utility',
      usage: '/db:backup [--compress] [--output <path>]',
      examples: [
        'fsd slash "/db:backup"',
        'fsd slash "/db:backup --compress"',
        'fsd slash "/db:backup --output ./backups/"'
      ]
    });
  }

  async execute(options) {
    const { compress, output } = options;
    
    this.log('Starting database backup...', 'info');
    
    try {
      // Check database connection
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        this.log('DATABASE_URL not set', 'error');
        return;
      }
      
      // Create backup
      const backupPath = await createBackup({
        url: dbUrl,
        compress: compress || false,
        outputDir: output || './backups'
      });
      
      this.log(`Backup created: ${backupPath}`, 'success');
      
      // Optional: Create GitHub issue to track backup
      if (options.createIssue) {
        await this.createIssue(
          'Database Backup Completed',
          `Backup created at: ${backupPath}\nSize: ${await this.getFileSize(backupPath)}`
        );
      }
      
    } catch (error) {
      this.log(`Backup failed: ${error.message}`, 'error');
    }
  }
}
```

### Plugin Entry Point

```javascript
// lib/index.js
export * from './commands/index.js';

export const metadata = {
  name: 'fsd-plugin-database',
  version: '1.0.0',
  description: 'Database management commands for Flow State Dev',
  commands: [
    '/db:backup',
    '/db:restore',
    '/db:migrate'
  ]
};

// Optional: Auto-registration
export function register(fsd) {
  // Any setup logic
  console.log('Database plugin registered');
}
```

### Usage

```bash
# Install plugin
npm install fsd-plugin-database

# Use commands
fsd slash "/db:backup"
fsd slash "/db:backup --compress --output ./backups/"
fsd slash "/db:restore --from backup-2024-01-15.sql"
fsd slash "/db:migrate --version latest"
```

## Summary

Creating Flow State Dev plugins allows you to:

1. **Extend** FSD with domain-specific commands
2. **Share** functionality across projects
3. **Contribute** to the FSD ecosystem
4. **Customize** your development workflow

Follow the security guidelines and best practices to create high-quality plugins that integrate seamlessly with Flow State Dev.