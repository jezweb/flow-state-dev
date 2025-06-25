# CLI Reference

Complete reference for all Flow State Dev commands and options.

## Global Options

Available for all commands:

```bash
-V, --version    # Output the version number
-h, --help       # Display help for command
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `init` | Create a new project with modular stack selection |
| `modules` | Manage project modules and stacks |
| `presets` | Manage stack presets |
| `labels` | Set up GitHub labels for the current repository |
| `memory` | Manage Claude Code user memory file |
| `doctor` | Run diagnostics on your Flow State Dev project |
| `security` | Security tools and scanning |
| `setup-local` | Set up local Supabase development environment |
| `supabase` | Manage local Supabase development |
| `store` | Generate a new Pinia store |
| `slash` | Execute project management slash commands |
| `upgrade` | Safely add Flow State Dev features to existing project |
| `migrate` | Migrate existing projects to Flow State Dev |
| `test` | Run project tests with comprehensive coverage |
| `help` | Show help information |

## init

Create a new project with modular stack selection.

```bash
fsd init [options] [project-name]
```

### Options

```bash
-m, --modules <modules>     # Comma-separated list of modules to include
--no-interactive           # Skip interactive prompts (use defaults)
--subfolder                 # Create project in a subfolder (default)
--here                      # Create project in current directory
--force                     # Overwrite existing files if they exist
--memory                    # Set up Claude Code memory during init
-h, --help                  # Display help for init command
```

### Examples

```bash
# Interactive setup (default)
fsd init my-app

# Quick Vue + Vuetify project
fsd init my-app --modules vue-base,vuetify --no-interactive

# Create in current directory
fsd init . --here --modules vue-base

# Full-stack app with memory setup
fsd init fullstack-app --modules vue-base,vuetify,supabase,pinia --memory
```

### Modules Available

- `vue-base` - Vue 3 framework with Composition API, Vue Router, and Vite
- `vuetify` - Vuetify 3 Material Design component library for Vue 3
- `supabase` - Supabase backend-as-a-service with authentication and database
- `pinia` - Pinia state management library for Vue 3

## modules

Manage project modules and stacks.

```bash
fsd modules [command]
```

### Sub-commands

#### list

List available modules.

```bash
fsd modules list [options]

Options:
  --category <category>   # Filter by category (frontend-framework, ui-library, etc.)
  --format <format>       # Output format: table, json, markdown (default: table)
```

#### info

Show detailed information about a module.

```bash
fsd modules info <module>

Arguments:
  module                  # Module name to get information about
```

#### search

Search for modules by name, description, or tags.

```bash
fsd modules search [options] <query>

Arguments:
  query                   # Search term

Options:
  --category <category>   # Filter results by category
  --limit <number>        # Maximum number of results (default: 10)
```

#### validate

Validate a module implementation.

```bash
fsd modules validate <module>

Arguments:
  module                  # Module name to validate
```

#### docs

Generate module documentation.

```bash
fsd modules docs [options]

Options:
  --output <path>         # Output file path (default: modules-docs.md)
  --format <format>       # Documentation format: markdown, json (default: markdown)
```

### Examples

```bash
# List all modules
fsd modules list

# Search for Vue-related modules
fsd modules search vue

# Get detailed info about vue-base module
fsd modules info vue-base

# Validate a module
fsd modules validate vue-base

# Generate documentation
fsd modules docs --output ./docs/modules.md
```

## memory

Manage Claude Code user memory file.

```bash
fsd memory [command]
```

### Sub-commands

```bash
init              # Interactive memory file creation
show              # Display current memory file
edit              # Open memory file in default editor
import [file]     # Import from existing memory file
validate          # Validate memory file structure
fix               # Auto-fix common memory file issues
```

### Examples

```bash
# Set up new memory file
fsd memory init

# View current memory
fsd memory show

# Validate memory file
fsd memory validate
```

## labels

Set up GitHub labels for the current repository.

```bash
fsd labels [options]

Options:
  --dry-run             # Show what would be created without making changes
  --force               # Replace existing labels
  --collection <name>   # Use specific label collection
```

### Examples

```bash
# Set up default labels
fsd labels

# Preview what would be created
fsd labels --dry-run

# Force update existing labels
fsd labels --force
```

## doctor

Run diagnostics on your Flow State Dev project.

```bash
fsd doctor [options]

Options:
  --fix                 # Automatically fix issues where possible
  --verbose             # Show detailed diagnostic information
  --output <file>       # Save diagnostic report to file
```

### Examples

```bash
# Run basic diagnostics
fsd doctor

# Run with auto-fix
fsd doctor --fix

# Verbose diagnostics with report
fsd doctor --verbose --output diagnostic-report.md
```

## security

Security tools and scanning.

```bash
fsd security <command>

Commands:
  scan [options]        # Scan project for security issues
  setup                 # Set up security tools and hooks
  audit                 # Run security audit
```

### Examples

```bash
# Scan for security issues
fsd security scan

# Set up security tools
fsd security setup

# Run security audit
fsd security audit
```

## test

Run project tests with comprehensive coverage.

```bash
fsd test [options] [pattern]

Arguments:
  pattern               # Test pattern to match

Options:
  --unit                # Run unit tests only
  --integration         # Run integration tests only
  --coverage            # Generate coverage report
  --watch               # Watch mode for continuous testing
  --verbose             # Verbose test output
```

### Examples

```bash
# Run all tests
fsd test

# Run unit tests with coverage
fsd test --unit --coverage

# Run specific test pattern
fsd test "user-scenarios"

# Watch mode
fsd test --watch
```

## store

Generate a new Pinia store.

```bash
fsd store [options] <name>

Arguments:
  name                  # Store name

Options:
  --composition         # Use Composition API style (default)
  --options             # Use Options API style
  --path <path>         # Custom output path
```

### Examples

```bash
# Generate a new store
fsd store user

# Generate with options API
fsd store cart --options

# Custom output path
fsd store products --path ./src/stores/products/
```

## Global Installation vs npx

### Global Installation

```bash
npm install -g flow-state-dev
fsd init my-app
```

**Benefits:**
- Shorter commands (`fsd` instead of `npx flow-state-dev`)
- Faster execution (no download time)
- Offline usage after installation

### Using npx (Recommended)

```bash
npx flow-state-dev init my-app
```

**Benefits:**
- No global installation required
- Always uses latest version
- No PATH configuration needed
- Perfect for trying out Flow State Dev

## Configuration

Flow State Dev can be configured through:

1. **Command-line flags** (highest priority)
2. **Environment variables**
3. **Project configuration files**
4. **Global configuration**

### Environment Variables

```bash
FSD_DEFAULT_MODULES=vue-base,vuetify    # Default modules for init
FSD_NO_TELEMETRY=true                   # Disable telemetry
FSD_VERBOSE=true                        # Enable verbose output
NODE_ENV=development                    # Environment mode
```

### Project Configuration

Create a `fsd.config.js` file in your project root:

```javascript
export default {
  modules: {
    defaultStack: ['vue-base', 'vuetify'],
    registry: './custom-modules'
  },
  security: {
    scanOnBuild: true,
    requireSecureCredentials: true
  },
  documentation: {
    autoGenerate: true,
    includeADRs: true
  }
};
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | File system error |
| 4 | Network error |
| 5 | Validation error |

## Getting Help

```bash
# General help
fsd --help

# Command-specific help
fsd init --help
fsd modules --help

# Show version
fsd --version

# Online documentation
# Visit: https://github.com/jezweb/flow-state-dev
```

## Common Workflows

### New Project Setup

```bash
# 1. Create project
fsd init my-app --modules vue-base,vuetify

# 2. Navigate to project
cd my-app

# 3. Set up development environment
npm install

# 4. Set up GitHub labels
fsd labels

# 5. Run diagnostics
fsd doctor

# 6. Start development
npm run dev
```

### Adding to Existing Project

```bash
# 1. Navigate to existing project
cd existing-project

# 2. Upgrade with Flow State Dev features
fsd upgrade --modules supabase,pinia

# 3. Set up security tools
fsd security setup

# 4. Run diagnostics
fsd doctor --fix
```

### Development Workflow

```bash
# Run tests
fsd test --watch

# Generate new store
fsd store shopping-cart

# Check security
fsd security scan

# Run diagnostics
fsd doctor
```