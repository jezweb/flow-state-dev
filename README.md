# Flow State Dev 🚀

[![npm version](https://badge.fury.io/js/flow-state-dev.svg)](https://www.npmjs.com/package/flow-state-dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> The fastest way to start a Vue 3 + Supabase project that both you and Claude Code will love.

## What is Flow State Dev?

Flow State Dev (FSD) provides a simple, opinionated project template and workflow for building Vue 3 + Supabase applications. It's designed to eliminate the friction between human developers and AI coding assistants by standardizing project structure and documentation.

## Quick Start (2 minutes)

### 1. Install Flow State Dev

```bash
npm install -g flow-state-dev
```

Or install from GitHub for the latest development version:

```bash
npm install -g git+https://github.com/jezweb/flow-state-dev.git
```

### 2. Create a new project

```bash
fsd init my-awesome-app
cd my-awesome-app
```

### 3. Set up your environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Start developing

```bash
npm install
npm run dev
```

That's it! You now have a fully configured Vue 3 + Vuetify + Supabase project with:
- ✅ Proper project structure
- ✅ Claude-ready documentation
- ✅ Supabase integration
- ✅ Vuetify 3 UI components
- ✅ Type-safe development
- ✅ GitHub-ready with proper .gitignore

## What's Included?

### Project Template
- **Vue 3** with Composition API
- **Vuetify 3** for beautiful Material Design components
- **Supabase** for backend (auth, database, storage)
- **Vue Router** for navigation
- **Pinia** for state management
- **Vite** for lightning-fast builds

### Developer Tools
- `CLAUDE.md` file pre-configured with project info
- Standard GitHub labels for consistent issue tracking
- Environment variable template
- Clear folder structure

## Commands

```bash
fsd init [project-name]  # Create a new project
fsd labels              # Set up GitHub labels for current repo
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

This will create consistent labels across all your projects:
- 🐛 `bug` - Something isn't working
- ✨ `enhancement` - New features
- 🙋 `human-task` - Needs manual action
- 🎨 `frontend` / 🔧 `backend` - Component areas
- 🔴 `priority:high` / 🟡 `priority:medium` / 🟢 `priority:low`

## Working with Claude Code

The generated `CLAUDE.md` file helps Claude Code understand your project immediately:
- Your tech stack and versions
- Project structure and conventions
- Common patterns and utilities
- How to run and test the project

Just open your project in Claude Code and start building!

## Requirements

- Node.js 18+ 
- npm or yarn
- Git
- A Supabase account (free tier works great)

## Why Flow State Dev?

- **Zero Configuration**: Start coding immediately
- **Best Practices Built-in**: Proper structure from day one
- **AI-Friendly**: Claude Code understands your project instantly
- **Your Stack**: Optimized for Vue 3 + Supabase development
- **Minimal**: Just what you need, nothing more

## Troubleshooting

### Installation Issues

If you encounter permission errors during global installation:

```bash
# On macOS/Linux, you might need sudo
sudo npm install -g git+https://github.com/jezweb/flow-state-dev.git

# Or configure npm to use a different directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Command Not Found

After installation, if `fsd` command is not found:

1. Check npm global bin directory: `npm bin -g`
2. Make sure it's in your PATH
3. Try running with full path: `$(npm bin -g)/fsd`

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/jezweb/flow-state-dev/issues)
- **Docs**: [Full Documentation](https://github.com/jezweb/flow-state-dev/tree/main/docs)

## License

MIT © [Jezweb](https://jezweb.com.au)

---

Made with ❤️ in Newcastle, Australia by [Jez](https://www.linkedin.com/in/jeremydawes/)