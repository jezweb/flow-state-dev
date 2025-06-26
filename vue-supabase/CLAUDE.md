# Claude Code Context

This file helps Claude Code understand your project structure and provide better assistance.

## 📚 Documentation Structure

This project includes comprehensive documentation in the `docs/` folder:

- **[docs/context/](docs/context/)** - Essential project context for AI assistants
  - `project-overview.md` - What this project is and does
  - `architecture.md` - System design and technical decisions  
  - `business-rules.md` - Core domain logic
  - `user-personas.md` - Who uses this and why
  - `technical-debt.md` - Known issues and improvements needed

- **[docs/guides/](docs/guides/)** - How-to guides for developers
  - `getting-started.md` - Quick setup instructions
  - `development.md` - Development practices and patterns

- **[.claude/](.claude/)** - AI-specific preferences and context
  - `personality.md` - How to interact with the team
  - `code-style.md` - Project coding preferences
  - `avoid.md` - Anti-patterns to avoid
  - `project-glossary.md` - Domain-specific terms
  - `current-focus.md` - What's being worked on now

## 🛠 Tech Stack

- **Frontend Framework**: Vue 3 (Composition API with `<script setup>`)
- **UI Library**: Vuetify 3 (Material Design components)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: Pinia
- **Router**: Vue Router
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── components/      # Reusable Vue components
├── composables/     # Shared composition functions
├── views/          # Page-level components
├── stores/         # Pinia state stores
├── services/       # API and external services
├── router/         # Route definitions
├── plugins/        # Vue plugins (Vuetify, etc.)
├── assets/         # Static assets
└── main.js         # App entry point
```

## 🔑 Key Patterns

### Component Structure
```vue
<script setup>
import { ref, computed } from 'vue'
import { useStore } from '@/stores/main'

// Component logic here
</script>

<template>
  <!-- Template here -->
</template>

<style scoped>
/* Styles here */
</style>
```

### API Calls
```javascript
// Always use services for API calls
import { userService } from '@/services/userService'

const user = await userService.getProfile(userId)
```

### State Management
```javascript
// Use Pinia stores for global state
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
```

## 🚀 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript checking

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

## ⚠️ Important Notes

1. **Never commit secrets** - Use `.env` for sensitive data
2. **Always use Supabase RLS** - Row Level Security is crucial
3. **Follow Vue 3 patterns** - No Options API, use Composition API
4. **Test your changes** - Write tests for new features
5. **Update documentation** - Keep docs in sync with code

## 🐛 Common Issues

### Supabase Connection
- Check `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure Supabase project is active
- Verify RLS policies aren't blocking queries

### Build Issues
- Clear `node_modules` and reinstall if needed
- Check for TypeScript errors with `npm run type-check`
- Ensure all imports use correct paths

## 📖 Where to Find More

- API Documentation: `docs/api/README.md`
- Architecture Decisions: `docs/architecture/decisions/`
- Team Conventions: `docs/team/conventions.md`
- Troubleshooting: `docs/guides/troubleshooting.md`

---

> 💡 For AI assistants: Start by reading the files in `.claude/` for specific guidance on helping with this project!