# Slash Command Development Guide

This guide explains how to create new slash commands for Flow State Dev using the modular architecture.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Creating a New Command](#creating-a-new-command)
- [Command Structure](#command-structure)
- [Command Categories](#command-categories)
- [Best Practices](#best-practices)
- [Testing Commands](#testing-commands)
- [Publishing Commands](#publishing-commands)
- [Example Commands](#example-commands)

## Architecture Overview

The slash command system uses a modular architecture where each command is a separate file that exports a class extending `BaseSlashCommand` or `GitHubSlashCommand`.

### Key Components

1. **BaseSlashCommand** - Base class for all commands
2. **GitHubSlashCommand** - Extended base class with GitHub CLI integration
3. **SlashCommandRegistry** - Dynamic command discovery and registration
4. **SlashCommandExecutor** - Command parsing and execution

### Directory Structure

```
lib/commands/
├── base.js                    # Base command classes
├── executor.js                # Command executor
├── registry.js                # Command registry
├── utility/                   # Utility commands
│   ├── help.js
│   ├── sync.js
│   └── clean.js
├── quick-action/              # Quick action commands
│   ├── build.js
│   ├── test.js
│   └── ...
├── project/                   # Project management
├── analysis/                  # Analysis commands
├── workflow/                  # CI/CD commands
├── sprint/                    # Sprint management
├── issue/                     # Issue operations
├── estimation/                # Estimation commands
├── planning/                  # Planning commands
└── thinking/                  # Extended thinking
```

## Creating a New Command

### Step 1: Choose a Category

Determine which category your command belongs to:

- `utility` - System and help commands
- `quick-action` - Daily development tasks
- `project` - Project management
- `analysis` - Code and project analysis
- `workflow` - CI/CD and deployment
- `sprint` - Sprint management
- `issue` - Issue operations
- `estimation` - Work estimation
- `planning` - Feature planning
- `thinking` - Extended analysis

### Step 2: Create Command File

Create a new file in the appropriate category directory:

```javascript
// lib/commands/quick-action/example.js
import { BaseSlashCommand } from '../base.js';

export default class ExampleCommand extends BaseSlashCommand {
  constructor() {
    super('/example', 'Short description of your command', {
      aliases: ['/ex'],              // Optional: Short aliases
      category: 'quick-action',      // Required: Command category
      requiresAuth: false,           // Optional: Needs GitHub auth
      usage: '/example [options]',   // Optional: Usage string
      examples: [                    // Optional: Usage examples
        'fsd slash "/example"',
        'fsd slash "/example --flag"'
      ]
    });
  }

  async execute(options) {
    const { args, flags } = options;
    
    // Your command logic here
    console.log('Example command executed!');
    
    // Use built-in utilities
    this.log('Processing...', 'info');
    
    // Handle errors
    if (!args || args.length === 0) {
      this.log('No arguments provided', 'error');
      return;
    }
    
    // Success
    this.log('Command completed successfully', 'success');
  }
}
```

### Step 3: Use GitHubSlashCommand for GitHub Integration

For commands that interact with GitHub:

```javascript
// lib/commands/project/github-example.js
import { GitHubSlashCommand } from '../base.js';

export default class GitHubExampleCommand extends GitHubSlashCommand {
  constructor() {
    super('/github-example', 'Interact with GitHub', {
      aliases: ['/ghe'],
      category: 'project',
      requiresAuth: true,  // Ensures GitHub CLI is authenticated
    });
  }

  async execute(options) {
    // Check GitHub authentication
    const isAuthenticated = await this.checkGitHubAuth();
    if (!isAuthenticated) {
      return;
    }

    // Use GitHub CLI
    const issues = await this.exec('gh issue list --json number,title');
    const parsedIssues = JSON.parse(issues);
    
    // Use interactive prompts
    const { selectedIssue } = await this.prompt([{
      type: 'list',
      name: 'selectedIssue',
      message: 'Select an issue:',
      choices: parsedIssues.map(i => ({
        name: `#${i.number} - ${i.title}`,
        value: i.number
      }))
    }]);
    
    // Process selection
    console.log(`Selected issue #${selectedIssue}`);
  }
}
```

## Command Structure

### Constructor Options

```javascript
{
  aliases: ['/alias1', '/alias2'],    // Alternative command names
  category: 'category-name',          // Required: Command category
  requiresAuth: true,                 // Requires GitHub authentication
  requiresRepo: true,                 // Must be in a git repository
  usage: 'Usage string',              // Help text for usage
  examples: ['Example 1', 'Example 2'], // Usage examples
  options: {                          // Command-specific options
    customFlag: {
      type: 'boolean',
      description: 'Custom flag description'
    }
  }
}
```

### Built-in Methods

#### BaseSlashCommand Methods

```javascript
// Logging with colors
this.log(message, level)  // level: 'info', 'success', 'warning', 'error'

// Interactive prompts (uses inquirer.js)
const answers = await this.prompt(questions)

// File system operations
const exists = await this.fileExists(path)
const content = await this.readFile(path)
await this.writeFile(path, content)

// JSON operations
const data = await this.readJSON(path)
await this.writeJSON(path, data)

// Package.json access
const pkg = await this.getPackageJson()
```

#### GitHubSlashCommand Methods

```javascript
// Execute shell commands
const output = await this.exec(command, options)

// GitHub CLI wrapper
const data = await this.gh(command, options)

// Check GitHub authentication
const isAuth = await this.checkGitHubAuth()

// Get current repository info
const repo = await this.getRepoInfo()

// Issue operations
const issues = await this.getIssues(filter)
await this.createIssue(title, body, labels)

// Label operations
const labels = await this.getLabels()
await this.createLabel(name, color, description)
```

## Command Categories

### utility
System commands for help, configuration, and maintenance.

### quick-action
Daily workflow commands that developers use frequently:
- Build, test, lint operations
- Git operations (add, commit, push)
- Quick file operations

### project
Project-level management:
- Issue management
- Milestone management
- Label management

### analysis
Code and project analysis:
- Metrics collection
- Quality analysis
- Dependency analysis

### workflow
CI/CD and deployment:
- Pipeline management
- Deployment operations
- Environment management

### sprint
Agile sprint management:
- Sprint planning
- Sprint reviews
- Velocity tracking

### issue
Issue-specific operations:
- Bulk operations
- Dependency analysis
- Issue templates

### estimation
Work estimation:
- Story point estimation
- Capacity planning
- Velocity calculations

### planning
Feature and scope planning:
- Epic breakdown
- Feature planning
- Scope analysis

### thinking
Extended analysis commands:
- Deep planning
- Research
- Decision making

## Best Practices

### 1. Command Naming

- Use descriptive names starting with `/`
- Support both verbose and short aliases
- Use colons for sub-commands: `/sprint:plan`

### 2. Error Handling

```javascript
async execute(options) {
  try {
    // Validate inputs
    if (!options.args || options.args.length === 0) {
      this.log('Missing required argument', 'error');
      this.log('Usage: ' + this.usage, 'info');
      return;
    }

    // Your logic here
    
  } catch (error) {
    this.log(`Error: ${error.message}`, 'error');
    if (this.verbose) {
      console.error(error.stack);
    }
  }
}
```

### 3. Interactive Mode

Always provide interactive fallbacks:

```javascript
async execute(options) {
  let title = options.args?.[0];
  
  if (!title) {
    const answers = await this.prompt([{
      type: 'input',
      name: 'title',
      message: 'Enter title:',
      validate: input => input.length > 0 || 'Title is required'
    }]);
    title = answers.title;
  }
  
  // Continue with title...
}
```

### 4. Progress Indicators

For long-running operations:

```javascript
async execute(options) {
  this.log('Starting analysis...', 'info');
  
  // Step 1
  this.log('  ✓ Collecting data', 'success');
  
  // Step 2
  this.log('  ✓ Processing results', 'success');
  
  // Step 3
  this.log('  ✓ Generating report', 'success');
  
  this.log('Analysis complete!', 'success');
}
```

### 5. Configuration Detection

Use smart defaults:

```javascript
async execute(options) {
  // Detect package manager
  const hasYarn = await this.fileExists('yarn.lock');
  const hasPnpm = await this.fileExists('pnpm-lock.yaml');
  
  const pm = hasYarn ? 'yarn' : hasPnpm ? 'pnpm' : 'npm';
  
  // Detect scripts
  const pkg = await this.getPackageJson();
  const buildScript = pkg.scripts?.build || 'build';
  
  // Execute with detected values
  await this.exec(`${pm} run ${buildScript}`);
}
```

## Testing Commands

### Unit Tests

Create a test file for your command:

```javascript
// test/commands/quick-action/example.test.js
import { jest } from '@jest/globals';
import ExampleCommand from '../../../lib/commands/quick-action/example.js';

describe('ExampleCommand', () => {
  let command;
  
  beforeEach(() => {
    command = new ExampleCommand();
  });
  
  test('should have correct metadata', () => {
    expect(command.name).toBe('/example');
    expect(command.category).toBe('quick-action');
    expect(command.aliases).toContain('/ex');
  });
  
  test('should execute successfully', async () => {
    const mockLog = jest.spyOn(command, 'log');
    
    await command.execute({ args: ['test'] });
    
    expect(mockLog).toHaveBeenCalledWith(
      'Command completed successfully',
      'success'
    );
  });
  
  test('should handle missing arguments', async () => {
    const mockLog = jest.spyOn(command, 'log');
    
    await command.execute({ args: [] });
    
    expect(mockLog).toHaveBeenCalledWith(
      'No arguments provided',
      'error'
    );
  });
});
```

### Integration Tests

Test the command through the executor:

```javascript
// test/integration/example-command.test.js
import { SlashCommandExecutor } from '../../lib/commands/executor.js';

describe('Example Command Integration', () => {
  let executor;
  
  beforeEach(() => {
    executor = new SlashCommandExecutor();
  });
  
  test('should execute via executor', async () => {
    await executor.execute('/example test-arg');
    // Assert expected outcomes
  });
  
  test('should work with aliases', async () => {
    await executor.execute('/ex test-arg');
    // Assert same outcome as full command
  });
});
```

### Manual Testing

```bash
# Test your command locally
npm link
fsd slash "/example"
fsd slash "/example --flag value"

# Test with verbose output
fsd slash "/example" --verbose
```

## Publishing Commands

### As Part of Flow State Dev

1. Create your command in the appropriate category
2. Add tests
3. Update documentation
4. Submit a pull request

### As a Plugin Package

Create a separate npm package:

```json
{
  "name": "fsd-plugin-mycommands",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    "./commands": "./lib/commands/index.js"
  },
  "peerDependencies": {
    "flow-state-dev": "^2.0.0"
  }
}
```

Export your commands:

```javascript
// lib/commands/index.js
export { default as MyCommand } from './my-command.js';
export { default as AnotherCommand } from './another-command.js';
```

Users can then install and use:

```bash
npm install fsd-plugin-mycommands
fsd slash "/my-command"
```

## Example Commands

### Simple Utility Command

```javascript
import { BaseSlashCommand } from '../base.js';
import chalk from 'chalk';

export default class ClearCommand extends BaseSlashCommand {
  constructor() {
    super('/clear', 'Clear the terminal screen', {
      aliases: ['/cls'],
      category: 'utility'
    });
  }

  async execute() {
    console.clear();
    this.log('Terminal cleared', 'success');
  }
}
```

### GitHub Integration Command

```javascript
import { GitHubSlashCommand } from '../base.js';
import chalk from 'chalk';

export default class PrListCommand extends GitHubSlashCommand {
  constructor() {
    super('/pr:list', 'List open pull requests', {
      aliases: ['/prs'],
      category: 'project',
      requiresAuth: true,
      requiresRepo: true
    });
  }

  async execute(options) {
    const { flags } = options;
    
    this.log('Fetching pull requests...', 'info');
    
    const prs = await this.gh(
      'pr list --json number,title,author,state',
      { parseJSON: true }
    );
    
    if (prs.length === 0) {
      this.log('No open pull requests', 'info');
      return;
    }
    
    console.log(chalk.cyan('\nOpen Pull Requests:'));
    prs.forEach(pr => {
      console.log(
        chalk.green(`  #${pr.number}`) +
        chalk.white(` - ${pr.title}`) +
        chalk.gray(` (@${pr.author.login})`)
      );
    });
    
    this.log(`\nTotal: ${prs.length} open PRs`, 'info');
  }
}
```

### Interactive Command with Prompts

```javascript
import { GitHubSlashCommand } from '../base.js';
import chalk from 'chalk';

export default class IssueCreateCommand extends GitHubSlashCommand {
  constructor() {
    super('/issue:create', 'Create a new issue interactively', {
      aliases: ['/ic'],
      category: 'project',
      requiresAuth: true,
      requiresRepo: true
    });
  }

  async execute(options) {
    // Get labels for selection
    const labels = await this.getLabels();
    
    // Interactive prompts
    const answers = await this.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Issue title:',
        validate: input => input.length > 0 || 'Title is required'
      },
      {
        type: 'editor',
        name: 'body',
        message: 'Issue description (opens editor):'
      },
      {
        type: 'checkbox',
        name: 'labels',
        message: 'Select labels:',
        choices: labels.map(l => ({
          name: `${l.name} - ${l.description || 'No description'}`,
          value: l.name,
          checked: l.name === 'enhancement'
        }))
      },
      {
        type: 'confirm',
        name: 'assignSelf',
        message: 'Assign to yourself?',
        default: false
      }
    ]);
    
    // Create the issue
    this.log('Creating issue...', 'info');
    
    const issueData = {
      title: answers.title,
      body: answers.body,
      labels: answers.labels
    };
    
    if (answers.assignSelf) {
      const user = await this.gh('api user --jq .login');
      issueData.assignees = [user.trim()];
    }
    
    const result = await this.gh(
      `issue create ${this.buildGHArgs(issueData)}`,
      { parseJSON: true }
    );
    
    this.log(`Issue created: ${result.url}`, 'success');
  }
  
  buildGHArgs(data) {
    const args = [`--title "${data.title}"`];
    
    if (data.body) {
      args.push(`--body "${data.body}"`);
    }
    
    if (data.labels?.length > 0) {
      args.push(`--label ${data.labels.join(',')}`);
    }
    
    if (data.assignees?.length > 0) {
      args.push(`--assignee ${data.assignees.join(',')}`);
    }
    
    return args.join(' ');
  }
}
```

## Summary

Creating slash commands for Flow State Dev is straightforward:

1. Choose the appropriate category
2. Extend BaseSlashCommand or GitHubSlashCommand
3. Implement the execute method
4. Add proper error handling and interactive fallbacks
5. Test thoroughly
6. Document your command

The modular architecture makes it easy to add new functionality while maintaining consistency across all commands.