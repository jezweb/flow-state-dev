# Flow State Dev Memory Commands

The `fsd memory` commands help you create and manage your Claude Code user memory file, which stores your preferences and helps Claude understand your development style across all projects.

## Quick Start

```bash
# Quick setup (< 1 minute)
fsd memory init

# Minimal setup (uses all defaults)
fsd memory init --minimal
```

## Commands

### `fsd memory init`

Creates a new user memory file at `~/.claude/CLAUDE.md`.

**Options:**
- `-m, --minimal` - Skip all questions and use defaults
- `-f, --force` - Overwrite existing memory file

**Setup Modes:**
1. **Quick Setup** (default) - 4 essential questions:
   - Your name (auto-filled with username)
   - Tech stack selection (multi-select)
   - Work style preference
   - Optional role/title

2. **Minimal Setup** - No questions, uses:
   - System username as name
   - Vue 3 + Vuetify + Supabase stack
   - Rapid prototyping work style

**Auto-detected Information:**
- Operating system and version
- Shell type
- Node.js version
- Project directories
- System username

### `fsd memory show`

Displays your current memory file content.

```bash
fsd memory show
```

### `fsd memory edit`

Opens your memory file in your default editor.

```bash
fsd memory edit
```

Uses the `$EDITOR` environment variable, falls back to `nano`.

### `fsd memory import`

Import an existing memory file from another location.

```bash
# Scan for existing files
fsd memory import

# Import specific file
fsd memory import /path/to/CLAUDE.md
```

**Features:**
- Preview source file before importing
- Multiple import modes:
  - **Replace completely** - Overwrite existing memory
  - **Selective import** - Choose which sections to import
  - **View differences** - Compare files before deciding
- Smart conflict resolution
- Automatic validation of memory file format

**Automatically scans:**
- Current directory (./CLAUDE.md)
- Home directory (~/CLAUDE.md)
- Claude projects (~/claude/*/CLAUDE.md)
- Recent git repositories
- Common development directories

**Import Options:**
1. **Replace Mode**: Complete replacement of existing memory
2. **Selective Mode**: Choose specific sections to import
3. **Diff Mode**: View side-by-side comparison before importing

**Selective Import Example:**
```
🧩 Selective Import

Select sections to import:
◉ Personal Information (will replace existing)
◯ Development Environment (unchanged)
◉ Custom Workflow (new section)
◯ Tech Stack Preferences (unchanged)
```

## Memory File Structure

A typical memory file includes:

```markdown
# User Memory for [Name]

## Personal Information
- **Name**: Your name
- **Role**: Your title (optional)

## Development Environment
- **OS**: Detected OS and version
- **Shell**: Your shell type
- **Project Location**: Where you keep projects
- **Node.js**: Node version

## Tech Stack Preferences
### Frontend
- Vue 3, React, etc.

### Backend
- Node.js, Supabase, etc.

## Work Style & Preferences
- Your development approach
- Speed vs quality preferences

## Claude Interaction Preferences
- How you like responses
- Code style preferences
```

## Best Practices

1. **Keep it concise** - Claude reads this on every interaction
2. **Be specific** - "Use 2-space indentation" not "proper formatting"
3. **Update regularly** - As your preferences change
4. **Project-specific overrides** - Use project `CLAUDE.md` for project details

## Tips

- Run setup again anytime to update preferences
- Use `--minimal` for quick testing or CI environments
- Memory files support markdown formatting
- Can include custom sections for your workflow

## Example Workflows

### First Time Setup
```bash
npm install -g flow-state-dev
fsd memory init  # Takes < 1 minute
fsd init my-app  # Memory preferences automatically applied
```

### Update Existing Memory
```bash
fsd memory edit  # Direct editing
# OR
fsd memory init --force  # Re-run setup
```

### Share Memory Between Machines
```bash
# On machine 1
fsd memory show > my-memory.md

# On machine 2
fsd memory import my-memory.md
```