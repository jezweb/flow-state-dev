# Flow State Dev v2.0.0 Migration Guide

## Overview

Flow State Dev v2.0.0 represents a complete architectural overhaul of the slash command system. While all commands maintain backward compatibility for end users, developers who have extended or modified the slash command system will need to update their code.

## What Changed

### Architecture Changes

**Before (v1.x)**
- Single monolithic file: `lib/slash-commands.js` (3000+ lines)
- All commands defined in one `SlashCommandFramework` class
- Difficult to maintain, test, or extend

**After (v2.0)**
- Modular architecture: Each command in its own file
- Commands organized by category in `lib/commands/`
- Auto-discovery system finds commands automatically
- Base classes ensure consistency

### File Structure

```
lib/
├── commands/
│   ├── base.js                 # Base command classes
│   ├── executor.js             # Command executor
│   ├── registry.js             # Command registry
│   ├── utility/                # Utility commands
│   │   ├── help.js
│   │   ├── sync.js
│   │   └── clean.js
│   ├── quick-action/           # Quick action commands
│   │   ├── build.js
│   │   ├── test.js
│   │   └── ...
│   ├── project/                # Project management
│   ├── analysis/               # Analysis commands
│   ├── workflow/               # Workflow automation
│   ├── sprint/                 # Sprint management
│   ├── issue/                  # Issue operations
│   ├── estimation/             # Estimation commands
│   ├── planning/               # Planning commands
│   └── thinking/               # Extended thinking
└── slash-commands-wrapper.js   # Simple router to new system
```

## For End Users

**No changes required!** All commands work exactly the same:

```bash
# These all work the same as before
fsd slash "/help"
fsd slash "/build --watch"
fsd slash "/sprint:plan --weeks 2"
fsd slash "/plan 'API architecture' --create-adr"
```

## For Developers

### Creating a New Command

**Old Way (v1.x)**
```javascript
// In lib/slash-commands.js
this.registerCommand('mycommand', {
  description: 'My command description',
  handler: this.myCommandHandler.bind(this),
  options: [...]
});

async myCommandHandler(options) {
  // Implementation
}
```

**New Way (v2.0)**
```javascript
// In lib/commands/category/mycommand.js
import { BaseSlashCommand } from '../base.js';

export default class MyCommand extends BaseSlashCommand {
  constructor() {
    super('/mycommand', 'My command description', {
      category: 'category-name',
      usage: '/mycommand [options]',
      examples: ['fsd slash "/mycommand --option value"'],
      options: [
        { name: 'option', type: 'string', description: 'Option description' }
      ]
    });
  }

  async execute(options) {
    // Implementation
  }
}
```

### Using Base Classes

**BaseSlashCommand** - For general commands
```javascript
import { BaseSlashCommand } from '../base.js';

export default class MyCommand extends BaseSlashCommand {
  async execute(options) {
    // Available methods:
    await this.prompt([...]); // Interactive prompts
    await this.confirm('Question?'); // Yes/no confirmation
    this.log('message', 'info'); // Colored logging
    await this.exec('command'); // Execute shell commands
  }
}
```

**GitHubSlashCommand** - For GitHub-integrated commands
```javascript
import { GitHubSlashCommand } from '../base.js';

export default class MyGitHubCommand extends GitHubSlashCommand {
  async execute(options) {
    // All BaseSlashCommand methods plus:
    await this.checkGitHubCLI(); // Verify gh CLI
    const repo = await this.getRepoInfo(); // Get repo details
    // Auto-wrapped exec() adds GitHub context
  }
}
```

### Command Discovery

Commands are automatically discovered if they:
1. Are in a `.js` file under `lib/commands/`
2. Export a default class extending `BaseSlashCommand`
3. Have a valid constructor calling `super()`

No manual registration needed!

### Handling Options

```javascript
export default class MyCommand extends BaseSlashCommand {
  constructor() {
    super('/mycommand', 'Description', {
      options: [
        { name: 'required', type: 'string', required: true },
        { name: 'optional', type: 'number', default: 42 },
        { name: 'flag', type: 'boolean' }
      ]
    });
  }

  async execute(options) {
    // Options are parsed and validated automatically
    const { required, optional, flag } = options;
    
    // Args are available for positional arguments
    const firstArg = options.args?.[0];
  }
}
```

### Interactive Mode

Commands automatically support interactive mode when required args are missing:

```javascript
async execute(options) {
  const { args } = options;
  const input = args?.[0] || options.input;
  
  if (!input) {
    // Show help when no input provided
    console.log('Usage information...');
    return;
  }
  
  // Process input
}
```

## Migration Checklist

- [ ] Remove any custom modifications to `lib/slash-commands.js`
- [ ] Move custom commands to individual files in `lib/commands/`
- [ ] Update commands to extend `BaseSlashCommand` or `GitHubSlashCommand`
- [ ] Update any imports from the old system
- [ ] Test all custom commands still work
- [ ] Remove any references to `SlashCommandFramework`

## Breaking Changes

### Internal API Changes
- `SlashCommandFramework` class no longer exists
- Command registration is now automatic via discovery
- `markCommandAsMigrated()` function removed
- Direct access to command internals changed

### Import Changes
```javascript
// Old
import { SlashCommandFramework } from './lib/slash-commands.js';

// New
import { slashCommandExecutor } from './lib/commands/executor.js';
```

## Benefits of v2.0

1. **Maintainability**: Each command is self-contained
2. **Testability**: Commands can be unit tested individually
3. **Extensibility**: Easy to add new commands
4. **Consistency**: Base classes ensure uniform behavior
5. **Performance**: Commands can be lazy-loaded (future enhancement)
6. **Discoverability**: Auto-discovery reduces boilerplate

## Getting Help

If you encounter issues migrating:

1. Check the example commands in `lib/commands/`
2. Review the base classes in `lib/commands/base.js`
3. Open an issue on GitHub with migration questions

## Summary

While v2.0 is a major internal change, we've maintained 100% backward compatibility for users. The new architecture provides a much better foundation for future development and makes it easier to contribute new commands.

---

*Generated for Flow State Dev v2.0.0*