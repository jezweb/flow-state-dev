# Slash Command API Reference

Complete API documentation for the Flow State Dev slash command system.

## Table of Contents

- [BaseSlashCommand](#baseslashcommand)
- [GitHubSlashCommand](#githubslashcommand)
- [SlashCommandExecutor](#slashcommandexecutor)
- [SlashCommandRegistry](#slashcommandregistry)
- [Command Options](#command-options)
- [Built-in Methods](#built-in-methods)
- [Event Hooks](#event-hooks)

## BaseSlashCommand

Base class for all slash commands. Provides common functionality and enforces consistent interface.

### Constructor

```javascript
constructor(name, description, options = {})
```

**Parameters:**
- `name` (string) - Command name starting with `/`
- `description` (string) - Short description of the command
- `options` (object) - Configuration options

**Options:**
- `aliases` (string[]) - Alternative command names
- `category` (string) - Command category for organization
- `usage` (string) - Usage string for help
- `examples` (string[]) - Example usage strings
- `options` (object) - Command-specific option definitions
- `requiresAuth` (boolean) - Requires GitHub CLI authentication (default: true)
- `requiresRepo` (boolean) - Must be in git repository (default: true)

### Methods

#### validate()
```javascript
async validate(): Promise<{valid: boolean, error?: string}>
```
Validates command can be executed in current context.

#### execute(options)
```javascript
async execute(options: {args: string[], flags: object}): Promise<void>
```
Main command execution method. Must be implemented by subclasses.

#### log(message, level)
```javascript
log(message: string, level: 'info'|'success'|'warning'|'error'): void
```
Logs colored output to console.

#### prompt(questions)
```javascript
async prompt(questions: inquirer.Question[]): Promise<object>
```
Shows interactive prompts using inquirer.js.

#### fileExists(path)
```javascript
async fileExists(path: string): Promise<boolean>
```
Checks if file exists at given path.

#### readFile(path)
```javascript
async readFile(path: string): Promise<string>
```
Reads file content as string.

#### writeFile(path, content)
```javascript
async writeFile(path: string, content: string): Promise<void>
```
Writes content to file.

#### readJSON(path)
```javascript
async readJSON(path: string): Promise<object>
```
Reads and parses JSON file.

#### writeJSON(path, data)
```javascript
async writeJSON(path: string, data: object): Promise<void>
```
Writes object as formatted JSON.

#### getPackageJson()
```javascript
async getPackageJson(): Promise<object>
```
Gets current project's package.json.

### Example

```javascript
import { BaseSlashCommand } from 'flow-state-dev/commands';

export default class HelloCommand extends BaseSlashCommand {
  constructor() {
    super('/hello', 'Say hello', {
      aliases: ['/hi'],
      category: 'utility',
      usage: '/hello [name]',
      examples: [
        'fsd slash "/hello"',
        'fsd slash "/hello World"'
      ]
    });
  }

  async execute(options) {
    const name = options.args?.[0] || 'there';
    this.log(`Hello, ${name}!`, 'success');
  }
}
```

## GitHubSlashCommand

Extended base class with GitHub CLI integration and shell command execution.

### Constructor

Inherits from BaseSlashCommand with same parameters.

### Additional Methods

#### exec(command, options)
```javascript
async exec(command: string, options?: ExecOptions): Promise<string>
```
Executes shell command and returns output.

**Options:**
- `silent` (boolean) - Suppress command output
- `cwd` (string) - Working directory
- `env` (object) - Environment variables
- `interactive` (boolean) - Allow interactive input

#### gh(command, options)
```javascript
async gh(command: string, options?: GHOptions): Promise<string|object>
```
Executes GitHub CLI command.

**Options:**
- `parseJSON` (boolean) - Parse output as JSON
- `silent` (boolean) - Suppress output

#### checkGitHubAuth()
```javascript
async checkGitHubAuth(): Promise<boolean>
```
Verifies GitHub CLI is authenticated.

#### getRepoInfo()
```javascript
async getRepoInfo(): Promise<{owner: string, repo: string}>
```
Gets current repository owner and name.

#### getIssues(filter)
```javascript
async getIssues(filter?: string): Promise<Issue[]>
```
Gets repository issues with optional filter.

#### createIssue(title, body, labels)
```javascript
async createIssue(title: string, body: string, labels?: string[]): Promise<Issue>
```
Creates new issue in repository.

#### getLabels()
```javascript
async getLabels(): Promise<Label[]>
```
Gets all repository labels.

#### createLabel(name, color, description)
```javascript
async createLabel(name: string, color: string, description?: string): Promise<Label>
```
Creates new label in repository.

### Example

```javascript
import { GitHubSlashCommand } from 'flow-state-dev/commands';

export default class IssueListCommand extends GitHubSlashCommand {
  constructor() {
    super('/issues:list', 'List repository issues', {
      aliases: ['/il'],
      category: 'project',
      requiresAuth: true,
      requiresRepo: true
    });
  }

  async execute(options) {
    const issues = await this.getIssues('state:open');
    
    if (issues.length === 0) {
      this.log('No open issues', 'info');
      return;
    }
    
    issues.forEach(issue => {
      console.log(`#${issue.number} - ${issue.title}`);
    });
  }
}
```

## SlashCommandExecutor

Handles command parsing and execution.

### Methods

#### execute(commandString)
```javascript
async execute(commandString: string): Promise<void>
```
Parses and executes a command string.

#### parseCommand(commandString)
```javascript
parseCommand(commandString: string): {name: string, args: string[], flags: object}
```
Parses command string into components.

#### findCommand(name)
```javascript
async findCommand(name: string): Promise<BaseSlashCommand|null>
```
Finds command by name or alias.

### Usage

```javascript
import { SlashCommandExecutor } from 'flow-state-dev/commands';

const executor = new SlashCommandExecutor();
await executor.execute('/build --prod');
```

## SlashCommandRegistry

Manages command discovery and registration.

### Methods

#### discover()
```javascript
async discover(): Promise<void>
```
Discovers all commands in the commands directory.

#### register(CommandClass)
```javascript
register(CommandClass: typeof BaseSlashCommand): void
```
Registers a command class.

#### get(name)
```javascript
get(name: string): BaseSlashCommand|null
```
Gets command by name or alias.

#### getAll()
```javascript
getAll(): BaseSlashCommand[]
```
Gets all registered commands.

#### getByCategory(category)
```javascript
getByCategory(category: string): BaseSlashCommand[]
```
Gets commands in specific category.

#### getCategories()
```javascript
getCategories(): string[]
```
Gets all command categories.

#### getSuggestions(partial)
```javascript
getSuggestions(partial: string): string[]
```
Gets command name suggestions for partial input.

### Usage

```javascript
import { SlashCommandRegistry } from 'flow-state-dev/commands';

const registry = new SlashCommandRegistry();
await registry.discover();

const command = registry.get('/build');
const suggestions = registry.getSuggestions('/bu');
```

## Command Options

### Option Definition Format

```javascript
{
  options: {
    production: {
      type: 'boolean',
      alias: 'p',
      description: 'Build for production',
      default: false
    },
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output directory',
      required: true,
      validate: (value) => {
        if (!value.startsWith('/')) {
          return 'Output must be absolute path';
        }
        return true;
      }
    },
    level: {
      type: 'number',
      description: 'Compression level',
      choices: [1, 2, 3, 4, 5],
      default: 3
    }
  }
}
```

### Option Types

- `boolean` - True/false flag
- `string` - Text value
- `number` - Numeric value
- `array` - Multiple values

### Option Properties

- `type` - Data type
- `alias` - Short version
- `description` - Help text
- `default` - Default value
- `required` - Must be provided
- `choices` - Allowed values
- `validate` - Custom validation function

## Built-in Methods

### File System Utilities

```javascript
// Check existence
await this.fileExists(path)
await this.directoryExists(path)

// Read operations
await this.readFile(path)
await this.readJSON(path)
await this.readYAML(path)

// Write operations
await this.writeFile(path, content)
await this.writeJSON(path, data)
await this.writeYAML(path, data)

// Directory operations
await this.createDirectory(path)
await this.copyFile(source, dest)
await this.moveFile(source, dest)
await this.deleteFile(path)

// Path utilities
this.resolvePath(path)
this.joinPath(...parts)
this.getBasename(path)
this.getDirname(path)
```

### Process Utilities

```javascript
// Execute commands
await this.exec(command, options)
await this.spawn(command, args, options)

// Environment
this.getEnv(key, defaultValue)
this.setEnv(key, value)

// Working directory
this.getCwd()
await this.setCwd(path)
```

### GitHub Utilities

```javascript
// Repository
await this.getRepoInfo()
await this.getCurrentBranch()
await this.getRemoteUrl()

// Issues
await this.getIssues(filter)
await this.getIssue(number)
await this.createIssue(title, body, options)
await this.updateIssue(number, updates)
await this.closeIssue(number)

// Pull Requests
await this.getPullRequests(filter)
await this.createPullRequest(options)
await this.mergePullRequest(number)

// Labels
await this.getLabels()
await this.createLabel(name, color, description)
await this.updateLabel(name, updates)
await this.deleteLabel(name)

// Milestones
await this.getMilestones()
await this.createMilestone(title, options)
await this.updateMilestone(number, updates)
```

### Utility Methods

```javascript
// Logging
this.log(message, level)
this.debug(message)
this.verbose(message)

// Formatting
this.formatTable(data, columns)
this.formatList(items)
this.formatTree(data)

// Time
this.formatDuration(ms)
this.formatDate(date)
this.sleep(ms)

// Validation
this.validateEmail(email)
this.validateUrl(url)
this.validateSemver(version)
```

## Event Hooks

Commands can implement lifecycle hooks:

```javascript
export default class MyCommand extends BaseSlashCommand {
  async beforeExecute(options) {
    // Called before execute
    this.log('Starting...', 'info');
  }

  async execute(options) {
    // Main execution
  }

  async afterExecute(result) {
    // Called after successful execution
    this.log('Complete!', 'success');
  }

  async onError(error) {
    // Called on execution error
    this.log(`Error: ${error.message}`, 'error');
  }
}
```

## Error Handling

Commands should handle errors gracefully:

```javascript
async execute(options) {
  try {
    // Validate inputs
    if (!options.args?.[0]) {
      throw new CommandError(
        'Missing required argument',
        'MISSING_ARG',
        { usage: this.usage }
      );
    }

    // Main logic
    await this.doWork();
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      this.log('File not found', 'error');
    } else if (error instanceof CommandError) {
      this.log(error.message, 'error');
      if (error.details.usage) {
        this.log(`Usage: ${error.details.usage}`, 'info');
      }
    } else {
      this.log(`Unexpected error: ${error.message}`, 'error');
      if (this.verbose) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}
```

## Type Definitions

```typescript
interface CommandOptions {
  args: string[];
  flags: Record<string, any>;
  raw: string;
}

interface ExecOptions {
  silent?: boolean;
  cwd?: string;
  env?: Record<string, string>;
  interactive?: boolean;
  timeout?: number;
}

interface Issue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Label[];
  assignees: User[];
  milestone?: Milestone;
  created_at: string;
  updated_at: string;
}

interface Label {
  name: string;
  color: string;
  description?: string;
}

interface User {
  login: string;
  id: number;
  avatar_url: string;
}

interface Milestone {
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  due_on?: string;
}
```

## Summary

The Flow State Dev slash command API provides:

1. **Base Classes** - Extensible command foundation
2. **GitHub Integration** - Built-in GitHub CLI wrapper
3. **File Operations** - Comprehensive file system utilities
4. **Interactive UI** - Prompts and formatting helpers
5. **Error Handling** - Consistent error management
6. **Type Safety** - TypeScript definitions available

Use these APIs to create powerful, consistent slash commands that integrate seamlessly with Flow State Dev.