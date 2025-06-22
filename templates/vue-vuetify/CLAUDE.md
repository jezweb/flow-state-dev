# Claude Project Instructions - [PROJECT_NAME]

## Project Overview
**Project Name**: [PROJECT_NAME]
**Type**: Vue 3 + Supabase Application
**Status**: Development
**Created with**: Flow State Dev

## Tech Stack
- **Frontend**: Vue 3 (Composition API)
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **Router**: Vue Router 4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite
- **Deployment**: Netlify (recommended)

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint and fix code
npm run format   # Format code with Prettier
```

## Claude Code Settings
This project includes `.claude/settings.json` with pre-approved commands for a smoother development experience. Common npm and git commands are pre-approved so you won't need to confirm them each time.

You can create your own `.claude/settings.local.json` for personal overrides - this file is automatically ignored by git.

## Project Structure
```
src/
├── components/    # Reusable Vue components
├── composables/   # Composition API utilities
├── router/        # Vue Router configuration
├── stores/        # Pinia stores
├── services/      # API services (Supabase client)
├── views/         # Page components
├── App.vue        # Root component
└── main.js        # Application entry point
```

## Key Patterns

### Supabase Client Usage
```javascript
// Always use the client from services/supabase.js
import { supabase } from '@/services/supabase'

// Example query
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

### Authentication Pattern
```javascript
// Check auth state in components
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isLoggedIn = computed(() => auth.user !== null)
```

### Error Handling
```javascript
// Standard error handling pattern
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  // Handle success
} catch (error) {
  console.error('Error:', error.message)
  // Show user-friendly error
}
```

## Environment Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_APP_NAME` - Application name
- `VITE_APP_ENV` - Environment (development/production)

## Common Issues & Solutions

### Issue: Supabase connection error
**Solution**: Check that .env file exists and contains valid Supabase credentials

### Issue: Vue components not updating
**Solution**: Ensure you're using reactive refs/computed properties correctly

### Issue: Build errors
**Solution**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Development Guidelines
1. Use Composition API for all new components
2. Keep components small and focused
3. Use Pinia stores for shared state
4. Always handle loading and error states
5. Follow Vue 3 best practices
6. Use Vuetify components for consistent UI

## Testing Checklist
- [ ] Authentication flow works
- [ ] Data loads correctly from Supabase
- [ ] Error states display properly
- [ ] Responsive design works on mobile
- [ ] No console errors in production build

## Deployment Notes
- Remember to set environment variables in Netlify
- Enable SPA routing in Netlify (create _redirects file)
- Test authentication callback URLs in production

## Current Focus
[Add current development focus here]

## Known Issues
[Track any known issues here]