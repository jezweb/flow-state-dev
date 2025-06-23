# Memory System Documentation

Flow State Dev includes a comprehensive memory system for Claude Code, allowing developers to create personalized AI interactions. This system offers multiple setup modes, pre-built templates, and modular sections for complete customization.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Setup Modes](#setup-modes)
- [Templates](#templates)
- [Section Library](#section-library)
- [Integration with Project Init](#integration-with-project-init)
- [Advanced Features](#advanced-features)
- [CLI Commands](#cli-commands)
- [Best Practices](#best-practices)

## Overview

The memory system creates a personalized context file (`~/.claude/CLAUDE.md`) that helps Claude understand:
- Your development environment and tools
- Preferred tech stacks and frameworks
- Work style and methodology
- Communication preferences
- Current projects and goals

### Smart Environment Detection (New!)
Flow State Dev now includes intelligent environment detection that automatically discovers:
- **System Information**: OS version, shell, hardware specs
- **Development Tools**: Installed package managers, CLI tools, databases
- **Project Patterns**: Frameworks, testing tools, project structure
- **Editor/IDE**: VS Code, WebStorm, and other editors
- **Git Configuration**: User info, GitHub username

## Quick Start

### Basic Setup

```bash
# Quick setup (recommended)
fsd memory init

# Minimal setup (all defaults)
fsd memory init --minimal

# Enhanced setup (comprehensive)
fsd memory init --enhanced

# Template-based setup
fsd memory init --template vue-developer

# Skip detection (use manual entry only)
fsd memory init --skip-detection
```

### Smart Detection Example

```bash
$ fsd memory init

🧠 Let's set up your Claude Code memory file
This will take less than a minute!

Would you like me to auto-detect your development environment? (Y/n) y

🔍 Analyzing your development environment...

✅ Detected:

System:
  • OS: Ubuntu 22.04 LTS
  • Shell: zsh with oh-my-zsh
  • Node.js: v20.11.0

Package Managers:
  • npm: v10.2.0
  • pnpm: v8.15.0

Editor:
  • Visual Studio Code

Project:
  • Framework: vue3
  • Language: typescript
  • Testing: vitest

Git:
  • User: John Doe <john@example.com>
  • GitHub: johndoe

Use these detected values? (Y/n) y
```

### View and Edit

```bash
# View current memory file
fsd memory show

# Edit in default editor
fsd memory edit

# Validate memory file
fsd memory validate

# Fix common issues
fsd memory fix
```

## Setup Modes

### 1. Quick Setup (Default)
The recommended mode for most users. Asks 4 essential questions:
- Your name
- Primary tech stack (multi-select)
- Work style preference
- Optional role/title

**When to use**: First-time setup or when you want a balanced configuration quickly.

### 2. Minimal Setup
Uses intelligent defaults with zero interaction:
- Auto-detects your environment
- Sets Vue 3 + Supabase as default stack
- Configures for rapid prototyping

**When to use**: When you need immediate setup or for CI/CD environments.

### 3. Template Setup
Start from pre-built persona templates:
- **minimal** - Bare essentials
- **standard** - Balanced configuration
- **vue-developer** - Vue.js focused development
- **full-stack** - Complete full-stack setup
- **ai-engineer** - AI/ML development focus
- **comprehensive** - All options available

**When to use**: When your role matches a template closely.

### 4. Enhanced Setup
Section-by-section configuration with:
- Personal information
- Development environment
- Tech stack preferences (detailed)
- Work style and methodology
- Claude interaction preferences
- Goals and projects
- Progress saving and resume capability

**When to use**: When you want complete control over every aspect.

## Templates

### Available Templates

#### Minimal Template
```markdown
# User Memory for {{name}}

## Personal Information
- **Name**: {{name}}

## Development Environment
- **OS**: {{os}}
- **Project Location**: `{{projectPath}}/`

## Work Style & Preferences
- **Approach**: Quick and efficient
- **Focus**: Working solutions

## Claude Interaction Preferences
- **Style**: Concise and direct
- **Code**: Minimal examples
- **Explanations**: Only when needed
```

#### Vue Developer Template
Comprehensive Vue.js development setup including:
- Vue 3 with Composition API preferences
- Vuetify and Tailwind CSS
- Pinia state management
- Supabase backend integration
- Component-driven development patterns

#### Full Stack Template
Complete full-stack configuration:
- Frontend: Vue, React, styling frameworks
- Backend: Node.js, Python, various frameworks
- Databases: PostgreSQL, MongoDB, Redis
- DevOps: Docker, CI/CD, cloud platforms
- Architecture patterns and best practices

#### AI Engineer Template
Specialized for AI/ML development:
- LLM integrations (OpenAI, Claude, local models)
- ML frameworks (PyTorch, TensorFlow)
- Vector databases and RAG systems
- Prompt engineering workflows
- MLOps and deployment strategies

### Using Templates

```bash
# Interactive template selection
fsd memory init --template

# Direct template usage
fsd memory init --template vue-developer

# List available templates
fsd memory templates

# Custom template from URL
fsd memory init --template https://example.com/my-template.md
```

### Template Variables

Templates support variable substitution with `{{variable}}` or `{{variable|default}}`:

Common variables:
- `{{name}}` - Your name
- `{{os}}` - Operating system
- `{{shell}}` - Shell type
- `{{projectPath}}` - Project directory
- `{{nodeVersion}}` - Node.js version
- `{{role|Developer}}` - Role with default

## Section Library

The section library provides modular, reusable configuration blocks:

### Tech Stack Sections

Located in `templates/memory/sections/tech-stacks/`:

- **mern-stack.md** - MongoDB, Express, React, Node.js
- **python-ml.md** - Python ML/AI stack with tools

### Work Style Sections

Located in `templates/memory/sections/work-styles/`:

- **agile-tdd.md** - Agile methodology with TDD
- **rapid-prototype.md** - Fast iteration approach

### Claude Interaction Sections

Located in `templates/memory/sections/claude-interaction/`:

- **concise-expert.md** - Direct, expert-level communication
- **learning-focused.md** - Educational, detailed explanations

### Mixing Sections

During enhanced or template setup, you can mix sections:

```bash
# Enhanced setup offers section selection
fsd memory init --enhanced

# Sections are presented by category
# Select multiple sections to combine
```

## Integration with Project Init

The memory system integrates seamlessly with project initialization:

### Automatic Prompt

```bash
# During project creation
fsd init my-project

# You'll be asked:
# "Would you like to set up a Claude memory file now?"
```

### Command Line Options

```bash
# Force memory setup during init
fsd init my-project --memory

# Skip memory setup
fsd init my-project --no-memory
```

### Setup Flow

1. Project creation completes
2. Memory setup prompt appears (if no memory exists)
3. Choose setup mode (quick/template/enhanced)
4. Complete memory configuration
5. Memory file created at `~/.claude/CLAUDE.md`

## Advanced Features

### Progress Saving

Enhanced setup mode automatically saves progress:
- Save point after each section
- Resume from where you left off
- Located at `~/.claude/.memory-setup-progress.json`

```bash
# Resume interrupted setup
fsd memory init --enhanced
# Select "Resume" when prompted
```

### Import and Export

```bash
# Import from another file
fsd memory import /path/to/CLAUDE.md

# Import with selective sections
fsd memory import
# Choose "Selective import" when prompted

# Export current memory (through validate command)
fsd memory validate --output memory-backup.md
```

### Validation and Fixing

```bash
# Validate structure and content
fsd memory validate

# Auto-fix common issues
fsd memory fix

# Validate specific file
fsd memory validate /path/to/memory.md
```

### Variable Detection

The system automatically detects:
- Operating system details
- Shell type
- Node.js version
- Project paths
- Git configuration
- Hardware information

## CLI Commands

### Main Commands

| Command | Description |
|---------|-------------|
| `fsd memory init` | Initialize new memory file |
| `fsd memory show` | Display current memory |
| `fsd memory edit` | Edit in default editor |
| `fsd memory validate` | Validate memory file |
| `fsd memory fix` | Auto-fix issues |
| `fsd memory import` | Import from file |
| `fsd memory templates` | List templates |

### Init Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Overwrite existing |
| `-m, --minimal` | Minimal setup |
| `-e, --enhanced` | Enhanced setup |
| `-t, --template <name>` | Use template |

### Integration Options

| Option | Description |
|--------|-------------|
| `--memory` | Include in init |
| `--no-memory` | Skip in init |

## Best Practices

### 1. Start Simple
Begin with quick setup and enhance over time:
```bash
fsd memory init  # Quick setup
fsd memory edit  # Refine later
```

### 2. Use Templates
If you match a persona, start there:
```bash
fsd memory init --template vue-developer
fsd memory edit  # Customize as needed
```

### 3. Keep Updated
Update your memory as your preferences evolve:
```bash
fsd memory edit
# Or use enhanced setup to update sections
fsd memory init --enhanced
```

### 4. Project-Specific Context
While the global memory provides defaults, use project-specific `CLAUDE.md` files for overrides:
```bash
cd my-project
echo "# Project-specific preferences" > CLAUDE.md
```

### 5. Team Alignment
For team projects, consider:
- Shared memory templates
- Consistent naming conventions
- Agreed interaction styles

### 6. Security Considerations
- Never include passwords or secrets
- Use placeholders for sensitive information
- Review before sharing memory files

## Examples

### Example 1: Vue Developer Setup

```bash
# Use Vue developer template
fsd memory init --template vue-developer

# When creating new projects
fsd init my-vue-app --memory
# Automatically uses Vue preferences
```

### Example 2: AI Engineer Setup

```bash
# Enhanced setup for AI development
fsd memory init --enhanced

# Select:
# - Tech Stack > Python ML tools
# - Work Style > Research-focused
# - Claude Interaction > Detailed explanations
```

### Example 3: Team Template

Create `team-template.md`:
```markdown
# Team Memory Template

## Tech Stack Preferences
- **Frontend**: {{framework|React}}
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **CI/CD**: GitHub Actions

## Work Style & Preferences
- **Methodology**: Agile with 2-week sprints
- **Code Review**: Required for all PRs
- **Testing**: Minimum 80% coverage

## Team Standards
- **Naming**: camelCase for variables
- **Git**: Conventional commits
- **Documentation**: JSDoc required
```

Use it:
```bash
fsd memory init --template ./team-template.md
```

## Troubleshooting

### Memory File Not Found
```bash
# Check location
ls ~/.claude/CLAUDE.md

# Initialize if missing
fsd memory init
```

### Template Loading Issues
```bash
# List available templates
fsd memory templates

# Check template directory
ls templates/memory/personas/
```

### Variable Substitution
Ensure variables use correct format:
- ✅ `{{variable}}`
- ✅ `{{variable|default}}`
- ❌ `{variable}`
- ❌ `$variable`

### Resume Not Working
```bash
# Clear progress file
rm ~/.claude/.memory-setup-progress.json

# Start fresh
fsd memory init --enhanced
```

## Future Enhancements

- Cloud sync for memory files
- Team memory sharing
- Project-specific memory inheritance
- AI-powered memory optimization
- Integration with more IDEs
- Memory versioning and history

---

For more information, see the [Flow State Dev documentation](https://github.com/jezweb/flow-state-dev) or run `fsd memory --help`.