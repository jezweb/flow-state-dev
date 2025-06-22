# Flow State Dev 🚀

[![npm version](https://badge.fury.io/js/flow-state-dev.svg)](https://www.npmjs.com/package/flow-state-dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> The fastest way to start a modern web project that both you and Claude Code will love.

## What is Flow State Dev?

Flow State Dev (FSD) provides simple, opinionated project templates and workflows for building modern web applications. It's designed to eliminate the friction between human developers and AI coding assistants by standardizing project structure and documentation.

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

The interactive setup will guide you through:
- 🎨 Choosing your framework (Vue, React, and more coming soon)
- ✅ Configuring Supabase credentials
- ✅ Connecting to GitHub repository
- ✅ Setting up GitHub labels

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
- ✅ Proper project structure
- ✅ Claude-ready documentation
- ✅ Supabase integration
- ✅ Modern UI components
- ✅ Type-safe development
- ✅ GitHub-ready with proper .gitignore

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
```

### Using global installation

```bash
fsd init                # Create a new project (interactive)
fsd init --no-interactive  # Skip interactive setup
fsd labels              # Set up GitHub labels for current repo
fsd doctor              # Run diagnostics on your project
fsd doctor --fix        # Auto-fix common issues
fsd memory init         # Create your Claude Code memory file
fsd memory show         # Display your memory file
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
├── public/             # Static assets
├── .env.example        # Environment template
├── CLAUDE.md          # AI assistant instructions
└── README.md          # Your project docs
```

## Setting Up GitHub Labels

After creating your GitHub repository:

```bash
cd my-awesome-app
fsd labels
```

This will create a comprehensive set of labels for better issue tracking:
- **Priority**: 🔴 `priority:high` / 🟡 `priority:medium` / 🟢 `priority:low`
- **Types**: 🐛 `bug`, ✨ `feature`, 📝 `documentation`, ♻️ `refactor`
- **Components**: 🎨 `frontend`, 🔧 `backend`, 🗄️ `database`, 💻 `cli`
- **Workflow**: 🚧 `in-progress`, 🚫 `blocked`, ✅ `ready-for-review`
- **And more**: `ux`, `testing`, `security`, `performance`, etc.

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

The generated `CLAUDE.md` file helps Claude Code understand your project immediately:
- Your tech stack and versions
- Project structure and conventions
- Common patterns and utilities
- How to run and test the project

Just open your project in Claude Code and start building!

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

- **Zero Configuration**: Start coding immediately
- **Best Practices Built-in**: Proper structure from day one
- **AI-Friendly**: Claude Code understands your project instantly
- **Multiple Frameworks**: Choose the stack that works for you
- **Minimal**: Just what you need, nothing more
- **Future-Ready**: Easy to add new frameworks and templates

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

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/jezweb/flow-state-dev/issues)
- **Docs**: [Full Documentation](https://github.com/jezweb/flow-state-dev/tree/main/docs)

## License

MIT © [Jezweb](https://jezweb.com.au)

---

Made with ❤️ in Newcastle, Australia by [Jez](https://www.linkedin.com/in/jeremydawes/)