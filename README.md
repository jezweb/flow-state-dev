# Flow State Dev 🚀

[![npm version](https://badge.fury.io/js/flow-state-dev.svg)](https://www.npmjs.com/package/flow-state-dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security: Built-in](https://img.shields.io/badge/Security-Built--in-green.svg)](https://github.com/jezweb/flow-state-dev/blob/main/docs/MODULAR_ONBOARDING.md)

> The fastest way to start a modern web project that both you and Claude Code will love.

## What is Flow State Dev?

Flow State Dev (FSD) is an intelligent project scaffolding tool that creates production-ready web applications with **built-in security**, comprehensive documentation, and AI-optimized workflows. It's designed to eliminate the friction between human developers and AI coding assistants while ensuring your projects start with security best practices from day one.

### ✨ Key Features

- 🔒 **Security-First** - Automatic repository detection, secret protection, pre-commit hooks
- 🤖 **AI-Optimized** - Claude Code ready with comprehensive context files
- 📚 **Documentation Rich** - 21+ templates included from day one
- 🔧 **Modular Architecture** - Extensible plugin-based onboarding system
- 🏷️ **GitHub Integration** - 66 labels for comprehensive project management
- ⚡ **Slash Commands** - Powerful project management commands for sprints, epics, and issues
- 🚀 **Modern Stack** - Vue 3, Vuetify, Supabase, Vite (React coming soon)

## 🎉 What's New

### v0.11.0 - Smart Environment Detection
- 🔍 **Auto-Detection** - Automatically detects development environment and tools
- 🛠️ **Tool Discovery** - Finds installed package managers, databases, CLI tools
- 📊 **Project Analysis** - Detects frameworks, testing tools, project patterns
- 🎯 **Smart Defaults** - Pre-fills memory setup with detected values
- ⚡ **Faster Setup** - Reduces manual input with intelligent suggestions
- 🔒 **Privacy First** - Opt-in detection with transparent results

### v0.10.0 - Enhanced Memory System
- 🧠 **Enhanced Memory Setup** - Comprehensive section-by-section configuration
- 📄 **Template System** - Pre-built personas (Vue Developer, Full Stack, AI Engineer)
- 🧩 **Section Library** - Modular, reusable configuration blocks
- 🔄 **Project Integration** - Memory setup during `fsd init` with `--memory` flag
- 💾 **Progress Saving** - Resume interrupted setup sessions
- ✨ **Variable Substitution** - Dynamic templates with smart defaults

### v0.9.0 - Slash Commands for Project Management
- ⚡ **Slash Commands** - Powerful project management with `fsd slash "/command"`
- 🎯 **Sprint Management** - Plan, review, and close sprints with capacity tracking
- 📋 **Epic Management** - Create and track epics with automated templates
- 🔄 **Issue Operations** - Bulk operations and dependency analysis
- 📊 **Progress Reporting** - Generate weekly/monthly reports with metrics
- 🔗 **GitHub Integration** - Deep integration with GitHub CLI and API

### v0.8.0 - Pinia Store Generator
- 🏪 **Store Generator** - `fsd store <name>` generates complete Pinia stores
- 🔄 **Multiple Templates** - Default, Supabase, Auth, and Minimal templates
- 🔌 **Supabase Integration** - Real-time subscriptions and RLS support
- 🎯 **Smart Defaults** - Includes loading states, error handling, and CRUD operations
- 📚 **Comprehensive Docs** - Complete guide with examples and best practices

### v0.7.0 - Local Supabase Development
- 🐳 **Local Development Setup** - Automated Docker & Supabase CLI installation
- 🚀 **Supabase Commands** - `fsd supabase start/stop/reset/migrate/seed`
- 🏠 **Offline Development** - Work without internet, full database control
- 🔧 **Enhanced Doctor** - Checks for local development prerequisites
- 📚 **Local Dev Guide** - Comprehensive documentation for local workflows

### v0.6.0 - Security & Modular Architecture
- 🔒 **Automatic Security Detection** - Detects public/private repositories and adapts configuration
- 🛡️ **Built-in Secret Protection** - Prevents accidental credential exposure with smart validation
- 🔧 **Modular Onboarding System** - Extensible, plugin-based project initialization
- 🔍 **Security Scanner** - Built-in tools to scan for exposed secrets
- 📝 **Security Templates** - Enhanced .gitignore, pre-commit hooks, and security docs

### v0.5.0 - Comprehensive Documentation
- 📚 Complete `docs/` folder with context, guides, API docs, and architecture decisions
- 🤖 AI-specific `.claude/` folder with personality, code style, and avoid patterns
- 📝 21 pre-filled documentation templates following best practices
- 🏗️ Architecture Decision Records (ADR) system built-in

## Quick Start (2 minutes)

### Option 1: Use without installation (recommended)

```bash
npx flow-state-dev init
```
*No installation needed! Just run and create your project*

### Option 2: Install globally for frequent use

```bash
npm install -g flow-state-dev
fsd init
```
*The `-g` flag installs globally so you can use `fsd` from anywhere*

The intelligent setup will guide you through:
- 🔍 **Security Analysis** - Automatic detection of repository visibility
- 🎨 **Framework Selection** - Choose Vue, React, and more (coming soon)
- 🔒 **Secure Configuration** - Context-aware Supabase credential setup
- ✅ **GitHub Integration** - Repository connection and label management
- 🛡️ **Security Templates** - Auto-generated .gitignore and security docs

#### Example: Security-Aware Setup

```bash
$ fsd init my-app

🔍 Repository Analysis
⚠️  PUBLIC repository detected: github.com/user/my-app

🚨 SECURITY WARNING: This is a PUBLIC repository!
   Anyone can see your code and any secrets you commit.

🔒 Using placeholder values for security
📄 Created .env.example with safe templates
📚 Created security documentation
```

### 3. Start developing

```bash
cd your-project-name
npm install
npm run dev
```

That's it! Your project is configured and ready to run.

### Where Do Files Go?

By default, Flow State Dev creates a new subfolder for your project. You'll be asked where to put files:
- **Subfolder** (default): Creates `./my-app/` in current directory
- **Current directory**: Adds files to where you are now

Use flags to skip the prompt:
```bash
fsd init my-app --subfolder  # Always create subfolder
fsd init my-app --here       # Use current directory
```

You now have a fully configured project with:
- 🎨 Your choice of framework and UI library
- 🔒 Security-first configuration based on repository visibility
- 📚 Comprehensive documentation structure (21+ templates)
- 🤖 Claude-ready with AI-optimized context files
- ⚡ Supabase integration with secure credential handling
- 🛡️ Pre-commit hooks for secret detection
- ✅ GitHub-ready with enhanced .gitignore
- 🔍 Built-in security scanning tools

## What's Included?

### Available Frameworks

#### ✅ Vue 3 + Vuetify (Available Now)
- **Vue 3** with Composition API
- **Vuetify 3** for beautiful Material Design components
- **Supabase** for backend (auth, database, storage)
- **Vue Router** for navigation
- **Pinia** for state management
- **Vite** for lightning-fast builds

#### 🔜 Coming Soon
- **React + Material UI** - React with Material Design
- **Vue 3 + Tailwind** - Vue with utility-first CSS
- **SvelteKit + Skeleton UI** - Full-stack with SSR

### Developer Tools
- `CLAUDE.md` file pre-configured with project info
- `.claude/settings.json` with pre-approved commands for Claude Code
- Standard GitHub labels for consistent issue tracking
- Environment variable template
- Clear folder structure

## Commands

### Using npx (no installation needed)

```bash
npx flow-state-dev init           # Create a new project
npx flow-state-dev doctor         # Run diagnostics
npx flow-state-dev memory init    # Setup Claude memory
npx flow-state-dev labels         # Setup GitHub labels
npx flow-state-dev security scan  # Scan for exposed secrets
npx flow-state-dev store <name>   # Generate a Pinia store
```

### Using global installation

```bash
# Project Creation
fsd init                # Create a new project (interactive)
fsd init --no-interactive  # Skip interactive setup
fsd init --here         # Use current directory
fsd init --subfolder    # Create in subfolder (default)

# Local Development Setup
fsd setup-local         # Install Docker & Supabase CLI
fsd supabase init       # Initialize Supabase in project
fsd supabase start      # Start local Supabase
fsd supabase stop       # Stop local Supabase
fsd supabase reset      # Reset database
fsd supabase migrate    # Run migrations
fsd supabase seed       # Seed database
fsd supabase status     # Check status

# Security Tools
fsd security scan       # Scan project for exposed secrets
fsd security check      # Check repository security status
fsd security setup      # Configure security tools

# GitHub Integration
fsd labels              # Interactive label setup (choose collection)
fsd labels create       # Create labels with options
fsd labels list         # Show available label collections
fsd labels export       # Export current repo labels

# Development Tools
fsd doctor              # Run diagnostics on your project
fsd doctor --fix        # Auto-fix common issues

# Code Generation
fsd store <name>        # Generate a new Pinia store
fsd store user --supabase  # Generate Supabase-connected store
fsd store auth --auth   # Generate authentication store
fsd store ui --minimal  # Generate minimal store

# Claude Memory Management
fsd memory init         # Create your Claude Code memory file
fsd memory show         # Display your memory file
fsd memory edit         # Edit memory file in your editor
fsd memory validate     # Validate memory structure
fsd memory fix          # Auto-fix memory issues

# Help
fsd help               # Show all commands
```

## Project Structure

```
my-app/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── composables/    # Composition API utilities
│   ├── router/         # Route definitions
│   ├── stores/         # Pinia stores
│   ├── services/       # API services (Supabase)
│   ├── views/          # Page components
│   ├── App.vue         # Root component
│   └── main.js         # App entry point
├── docs/               # 📚 Comprehensive documentation
│   ├── context/        # Project context for AI & humans
│   ├── guides/         # How-to guides
│   ├── api/            # API documentation
│   ├── architecture/   # Technical decisions
│   └── SECURITY.md     # 🔒 Security best practices
├── .claude/            # 🤖 AI-specific context files
│   ├── personality.md  # How AI should interact
│   ├── code-style.md   # Coding preferences
│   └── avoid.md        # Anti-patterns to avoid
├── .security/          # 🛡️ Security configuration
│   └── secret-patterns.json  # Secret detection patterns
├── .githooks/          # 🪝 Git hooks for security
│   └── pre-commit      # Automatic secret scanning
├── public/             # Static assets
├── .env.example        # Environment template (safe to commit)
├── .gitignore          # Enhanced with 60+ security patterns
├── CLAUDE.md          # AI assistant instructions
└── README.md          # Your project docs
```

### 🔒 Security-First Approach

Flow State Dev automatically adapts to your repository's security context:

#### Public Repository Mode
- Uses placeholder values for all credentials
- Creates `.env.example` with safe templates
- Generates comprehensive security warnings
- Provides detailed setup instructions

#### Private Repository Mode
- Allows real credential configuration
- Creates `.env` files for immediate use
- Enables team collaboration features
- Supports production deployments

#### Built-in Security Features
- **Secret Detection**: 9 built-in patterns for common secrets
- **Pre-commit Hooks**: Automatic scanning before commits
- **Enhanced .gitignore**: 60+ patterns for sensitive files
- **Security Scanner**: `fsd security scan` command
- **Repository Analysis**: Automatic visibility detection

## 🔒 Security Tools

### Scan for Exposed Secrets
```bash
fsd security scan         # Scan entire project
fsd security scan --verbose  # Show detailed results
```

Detects:
- Supabase service keys and credentials
- Database URLs with passwords
- JWT secrets and API keys
- Private keys and certificates
- AWS/OpenAI/Stripe credentials

### Check Repository Security
```bash
fsd security check
```

Shows:
- Repository visibility (public/private)
- Security recommendations
- Configuration suggestions

### Setup Security Tools
```bash
fsd security setup
```

Creates:
- Enhanced .gitignore with 60+ patterns
- Pre-commit hooks for secret detection
- Security documentation
- Secret detection patterns

## Setting Up GitHub Labels

After creating your GitHub repository:

```bash
cd my-awesome-app
fsd labels
```

This will create a comprehensive set of labels for better issue tracking:
- **Epic/Feature/Task/Bug**: Issue type hierarchy
- **Status**: `planning`, `in-progress`, `review`, `done`, `blocked`
- **Priority**: `critical`, `high`, `medium`, `low`
- **Effort**: `tiny`, `small`, `medium`, `large`, `xlarge`
- **And 50+ more**: Components, tech stack, workflow states

See [docs/LABELS.md](docs/LABELS.md) for complete label usage guidelines.

## Managing Your Claude Code Memory

Flow State Dev includes tools to help you create and manage your Claude Code user memory file:

### Quick Setup (< 1 minute)
```bash
fsd memory init
```

This creates a personalized memory file at `~/.claude/CLAUDE.md` with:
- Your name and role
- Detected OS and environment
- Tech stack preferences
- Work style (prototyping, production, learning, etc.)

### Other Memory Commands
```bash
fsd memory show      # Display your current memory file
fsd memory edit      # Open memory file in your editor
fsd memory import    # Import from existing memory files
fsd memory validate  # Validate memory file structure
fsd memory fix       # Auto-fix common issues
```

### Why Use Memory Files?
Memory files help Claude Code understand your preferences across all projects:
- Consistent coding style
- Preferred tools and libraries
- Work approach and communication style

## Working with Claude Code

Flow State Dev creates multiple files to optimize AI assistance:

### CLAUDE.md - Project Instructions
- Tech stack and versions
- Project structure and conventions
- Common patterns and utilities
- Development commands
- Troubleshooting guides

### .claude/ Folder - AI Context
- **personality.md**: How Claude should communicate
- **code-style.md**: Preferred coding patterns
- **avoid.md**: Anti-patterns to prevent
- **settings.json**: Pre-approved commands for smoother workflow

### Security Integration
Claude Code automatically understands:
- Repository security context
- Safe credential handling
- Security best practices
- Project-specific security requirements

Just open your project in Claude Code and start building securely!

## Using npx (No Installation Needed!)

Don't want to install globally? Use npx to run Flow State Dev directly:

```bash
# Create a new project
npx flow-state-dev init my-app

# Run diagnostics
npx flow-state-dev doctor

# Set up GitHub labels
npx flow-state-dev labels

# Create memory file
npx flow-state-dev memory init
```

Benefits of using npx:
- ✅ No global installation required
- ✅ Always uses the latest version
- ✅ No PATH configuration needed
- ✅ Perfect for trying out Flow State Dev

## Requirements

- Node.js 18+ 
- npm or yarn
- Git
- A Supabase account (free tier works great)

## Why Flow State Dev?

### 🔒 Security First
- **Automatic Repository Detection**: Knows if your repo is public or private
- **Context-Aware Configuration**: Different behavior for different security contexts
- **Built-in Secret Protection**: Prevents accidental credential exposure
- **Pre-commit Security Hooks**: Catches secrets before they're committed

### 🚀 Developer Experience
- **Zero Configuration**: Start coding immediately
- **Best Practices Built-in**: Proper structure from day one
- **AI-Friendly**: Claude Code understands your project instantly
- **Comprehensive Documentation**: 21+ templates included
- **Local Development**: Full offline Supabase development support

### 🔧 Extensibility
- **Modular Architecture**: Plugin-based onboarding system
- **Multiple Frameworks**: Vue now, React/Svelte coming soon
- **Custom Steps**: Add your own onboarding modules
- **Future-Ready**: Easy to extend and customize

### 🏠 Local Development Power
- **Automated Setup**: One command to install all tools
- **Offline First**: Work without internet connection
- **Full Control**: Direct database access and modifications
- **Fast Iteration**: No API rate limits or network latency

## Troubleshooting

### Quick Diagnostic

If Flow State Dev isn't working, run our diagnostic tool:

```bash
curl -s https://raw.githubusercontent.com/jezweb/flow-state-dev/main/debug/diagnose.sh | bash
```

This will analyze your system and provide specific fix recommendations.

### Installation Issues

**Recommended: Use npx to avoid installation issues entirely:**
```bash
npx flow-state-dev init
```

If you prefer global installation and encounter permission errors:

```bash
# On macOS/Linux, you might need sudo
sudo npm install -g flow-state-dev

# Or configure npm to use a different directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Command Not Found

If `fsd` command is not found after global installation:

**Quick Solution: Use npx instead**
```bash
npx flow-state-dev init
```

Or fix your PATH:
1. Check npm global bin directory: `npm bin -g`
2. Make sure it's in your PATH
3. Try running with full path: `$(npm bin -g)/fsd`

**Linux Users**: See our comprehensive [Linux Troubleshooting Guide](docs/LINUX-TROUBLESHOOTING.md) for detailed PATH configuration instructions.

### GitHub CLI Not Installed

If you see "GitHub CLI not installed" warnings:

1. Visit: https://cli.github.com/
2. Install GitHub CLI for your platform
3. Run: `gh auth login`
4. Then retry: `fsd labels`

### Project Name Issues

Flow State Dev auto-fixes project names:
- Converts "My App" → "my-app"
- Removes special characters
- Only allows letters, numbers, and hyphens

### Folder Confusion

- `fsd init my-project` creates `./my-project/` subfolder
- If you're already in `my-project/` folder and it's empty, Flow State Dev will offer to use it
- Files always go where you expect them!

## Advanced Features

### Modular Onboarding System
Flow State Dev uses a plugin-based architecture for project initialization:
- Extensible step-based workflow
- Custom onboarding modules
- Context-aware execution
- Dependency resolution

See [docs/MODULAR_ONBOARDING.md](docs/MODULAR_ONBOARDING.md) for creating custom steps.

### Enhanced GitHub Project Management
Comprehensive label system with:
- Issue hierarchy (Epic → Feature → Task)
- Sprint and release tracking
- Effort and impact estimation
- Smart label combinations

See [docs/GITHUB_PROJECT_MANAGEMENT.md](docs/GITHUB_PROJECT_MANAGEMENT.md) for workflows.

## Security Documentation

Flow State Dev includes comprehensive security documentation to help you build secure applications:

- 📖 **[Security Guide](docs/SECURITY.md)** - Complete security documentation
- ✅ **[Security Checklist](docs/SECURITY_CHECKLIST.md)** - Actionable security checklist for every stage
- 🚀 **[Security Best Practices](docs/SECURITY_BEST_PRACTICES.md)** - Quick reference for secure coding
- 🔐 **[Supabase Security Guide](docs/SUPABASE_SECURITY_GUIDE.md)** - Supabase-specific security configuration

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/jezweb/flow-state-dev/issues)
- **Security**: [Security Documentation](https://github.com/jezweb/flow-state-dev/tree/main/docs#security)
- **Docs**: [Full Documentation](https://github.com/jezweb/flow-state-dev/tree/main/docs)
- **Examples**: [Custom Plugins](https://github.com/jezweb/flow-state-dev/tree/main/examples)

## License

MIT © [Jezweb](https://jezweb.com.au)

## Security Philosophy

Flow State Dev believes that security should be built-in, not bolted-on. Every project starts with:

- 🔍 **Automatic Detection** - Knows your security context before asking for credentials
- 🛡️ **Safe Defaults** - Placeholder values in public repos, real values only when safe
- 🚨 **Active Protection** - Pre-commit hooks and scanning tools prevent accidents
- 📚 **Education** - Clear warnings and documentation guide best practices

We make it nearly impossible to accidentally expose secrets while maintaining excellent developer experience.

---

Made with ❤️ in Newcastle, Australia by [Jez](https://www.linkedin.com/in/jeremydawes/)