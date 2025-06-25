# Quick Action Commands Guide

## Overview

Quick Action Commands are a game-changing feature in Flow State Dev v0.13.0 that provide instant access to common development tasks. With single-letter aliases and smart project detection, these commands eliminate the friction in your daily workflow.

## Why Quick Actions?

Traditional development workflows require remembering and typing complex commands:
```bash
# Traditional way
npm run build
npm test -- --coverage
npm run lint -- --fix
git status
git add -A && git commit
```

With Flow State Dev Quick Actions:
```bash
# Quick Action way
fsd slash "/b"          # Build
fsd slash "/t --coverage"  # Test with coverage
fsd slash "/l --fix"    # Lint and fix
fsd slash "/s"          # Status
fsd slash "/c"          # Commit
```

## Available Commands

### 1. `/build` (`/b`) - Run Build

Executes your project's build command with intelligent script detection.

**Usage:**
```bash
fsd slash "/build"
fsd slash "/b"
fsd slash "/b --prod"    # Production build
fsd slash "/b --watch"   # Watch mode
```

**Auto-detects:**
- `npm run build`
- `yarn build`
- `pnpm build`
- `make build`
- Custom build scripts

### 2. `/test` (`/t`) - Run Tests

Executes your test suite with optional coverage reporting.

**Usage:**
```bash
fsd slash "/test"
fsd slash "/t"
fsd slash "/t --coverage"       # With coverage report
fsd slash "/t --watch"          # Watch mode
fsd slash "/t --filter auth"    # Filter tests
```

**Features:**
- Coverage report generation
- Test filtering
- Watch mode support
- Failure summaries

### 3. `/lint` (`/l`) - Run Linter

Runs your project's linting tools with optional auto-fix.

**Usage:**
```bash
fsd slash "/lint"
fsd slash "/l"
fsd slash "/l --fix"   # Auto-fix issues
```

**Supports:**
- ESLint
- Prettier
- TSLint
- Custom linters

### 4. `/fix` (`/f`) - Auto-Fix Issues

One command to fix all linting and formatting issues.

**Usage:**
```bash
fsd slash "/fix"
fsd slash "/f"
```

**What it does:**
1. Runs linter with --fix
2. Applies Prettier formatting
3. Fixes import sorting
4. Shows remaining issues

### 5. `/typecheck` (`/tc`) - Type Checking

Runs TypeScript compiler for type checking without emitting files.

**Usage:**
```bash
fsd slash "/typecheck"
fsd slash "/tc"
```

**Features:**
- Full project type checking
- Error summaries
- Links to error locations
- No file emission

### 6. `/status` (`/s`) - Enhanced Git Status

Provides a beautiful, organized view of your repository status.

**Usage:**
```bash
fsd slash "/status"
fsd slash "/s"
```

**Shows:**
- Current branch and upstream
- Categorized file changes:
  - Modified files
  - New files
  - Deleted files
  - Untracked files
- Last commit info
- Stash count

**Example output:**
```
🌿 Branch: feature/new-ui → origin/feature/new-ui

📝 Modified:
  • src/components/Button.vue
  • src/styles/theme.css

✨ New files:
  • src/components/Modal.vue
  • tests/Modal.test.js

🗑️  Deleted:
  • src/old-component.vue

📦 Untracked:
  • .env.local
  • notes.md

Last commit: "feat: Add button component" (2 hours ago)
```

### 7. `/commit` (`/c`) - Interactive Commit

Guides you through creating well-formatted conventional commits.

**Usage:**
```bash
fsd slash "/commit"
fsd slash "/c"
```

**Interactive prompts:**
1. Commit type (feat, fix, docs, etc.)
2. Scope (optional)
3. Short description
4. Long description (optional)
5. Breaking changes (if any)
6. Issues to close

**Example flow:**
```
? Select commit type: feat
? Scope (optional): auth
? Short description: Add two-factor authentication
? Long description: (press enter to skip)
? Breaking changes? No
? Close issues: #123, #124

Created commit:
feat(auth): Add two-factor authentication

Closes: #123, #124
```

### 8. `/push` (`/p`) - Smart Push

Pushes your changes with intelligent branch handling.

**Usage:**
```bash
fsd slash "/push"
fsd slash "/p"
fsd slash "/p --set-upstream"   # Set upstream branch
fsd slash "/p --force"          # Force push (careful!)
```

**Features:**
- Auto-detects current branch
- Sets upstream if needed
- Shows push progress
- Displays PR creation hints

## Aliases Reference

| Command | Primary Alias | Usage |
|---------|---------------|-------|
| `/build` | `/b` | Build project |
| `/test` | `/t` | Run tests |
| `/lint` | `/l` | Run linter |
| `/fix` | `/f` | Auto-fix all |
| `/typecheck` | `/tc` | Type check |
| `/status` | `/s` | Git status |
| `/commit` | `/c` | Commit helper |
| `/push` | `/p` | Push changes |

## Smart Detection

Quick Actions automatically detect your project configuration:

### Build Tools
- Node.js: `package.json` scripts
- Python: `setup.py`, `Makefile`
- Go: `go.mod`, `Makefile`
- Rust: `Cargo.toml`
- Custom: `Makefile`, scripts

### Test Runners
- Jest
- Mocha
- Vitest
- Pytest
- Go test
- Cargo test

### Linters
- ESLint
- Prettier
- Ruff
- Black
- Golint
- Clippy

## Workflow Examples

### Daily Development Flow
```bash
# Start your day
fsd slash "/s"          # Check status

# Make changes and test
fsd slash "/t"          # Run tests
fsd slash "/l --fix"    # Fix linting

# Commit and push
fsd slash "/c"          # Create commit
fsd slash "/p"          # Push changes
```

### Before Pull Request
```bash
# Ensure quality
fsd slash "/tc"         # Type check
fsd slash "/t --coverage"  # Full test coverage
fsd slash "/l"          # Lint check
fsd slash "/b --prod"   # Production build

# Clean up
fsd slash "/f"          # Fix all issues
fsd slash "/c"          # Commit fixes
```

### Quick Fixes
```bash
# Someone reported an issue
fsd slash "/s"          # See what changed
fsd slash "/f"          # Quick fix formatting
fsd slash "/t"          # Verify tests pass
fsd slash "/c"          # Commit
fsd slash "/p"          # Push fix
```

## Configuration

### Custom Scripts

Quick Actions respect your project's configuration. Define custom scripts in `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:prod": "vite build --mode production",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext .js,.vue",
    "lint:fix": "eslint . --ext .js,.vue --fix"
  }
}
```

### Aliases in .claude/settings.json

You can add Quick Actions to Claude Code's allowed commands:

```json
{
  "allowedCommands": [
    {
      "command": "fsd slash \"/b\"",
      "description": "Build project"
    },
    {
      "command": "fsd slash \"/t --coverage\"",
      "description": "Run tests with coverage"
    },
    {
      "command": "fsd slash \"/l --fix\"",
      "description": "Lint and fix"
    }
  ]
}
```

## Pro Tips

### 1. Muscle Memory
Train yourself to use aliases:
- `/b` instead of `/build`
- `/t` instead of `/test`
- `/s` instead of `/status`

### 2. Chain Commands
```bash
# Test, fix, and commit in sequence
fsd slash "/t" && fsd slash "/f" && fsd slash "/c"
```

### 3. Use with Git Aliases
Add to your `.gitconfig`:
```ini
[alias]
    qs = !fsd slash \"/s\"
    qc = !fsd slash \"/c\"
    qp = !fsd slash \"/p\"
```

Then use:
```bash
git qs   # Quick status
git qc   # Quick commit
git qp   # Quick push
```

### 4. VS Code Tasks
Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Quick Build",
      "type": "shell",
      "command": "fsd slash \"/b\"",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Quick Test",
      "type": "shell",
      "command": "fsd slash \"/t\"",
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

### 5. Terminal Aliases
Add to your `.bashrc` or `.zshrc`:
```bash
alias b='fsd slash "/b"'
alias t='fsd slash "/t"'
alias l='fsd slash "/l"'
alias s='fsd slash "/s"'
alias c='fsd slash "/c"'
alias p='fsd slash "/p"'
```

## Troubleshooting

### Command Not Found
If Quick Actions can't find your build/test commands:
1. Check your `package.json` scripts
2. Ensure you're in the project root
3. Run `fsd doctor` to diagnose

### Wrong Command Executed
Quick Actions use this priority:
1. npm scripts (if package.json exists)
2. Makefile targets
3. Common conventions (cargo, go, etc.)

### Slow Performance
- Use specific flags instead of defaults
- Check if watch mode is accidentally enabled
- Ensure you're not in a large monorepo root

## Comparison with Traditional Commands

| Task | Traditional | Quick Action | Savings |
|------|------------|--------------|---------|
| Build | `npm run build` | `/b` | 11 chars |
| Test | `npm test -- --coverage` | `/t --coverage` | 8 chars |
| Lint fix | `npm run lint -- --fix` | `/l --fix` | 13 chars |
| Status | `git status` | `/s` | 8 chars |
| Commit | `git add -A && git commit` | `/c` | 22 chars |

Over a day, Quick Actions can save hundreds of keystrokes and several minutes of typing!

## Future Enhancements

Coming soon:
- `/run <script>` - Run any npm script
- `/clean` - Clean build artifacts
- `/install` - Smart dependency installation
- `/update` - Update dependencies safely
- `/deploy` - Quick deployment commands

---

Quick Action Commands transform your development workflow by making common tasks instant and effortless. Start using them today and experience the difference!