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
**Solution**: 
1. Check that .env file exists and contains valid credentials
2. Verify VITE_SUPABASE_URL starts with https://
3. Ensure anon key is correct (check Supabase dashboard)
4. Check network connectivity

### Issue: Vue components not updating
**Solution**: 
1. Ensure you're using reactive refs/computed properties
2. Check for mutating props directly (use emit instead)
3. Verify v-model is used correctly
4. Use Vue Devtools to inspect reactivity

### Issue: Vuetify components not styling correctly
**Solution**:
1. Ensure Vuetify is properly imported in main.js
2. Check that component names are correct (v-btn not v-button)
3. Verify CSS import order
4. Clear browser cache

### Issue: Build errors
**Solution**: 
1. Clear caches: `rm -rf node_modules/.vite`
2. Reinstall deps: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run type-check`
4. Verify import paths are correct

### Issue: Authentication not persisting
**Solution**:
1. Check localStorage is not blocked
2. Verify Supabase session management in auth store
3. Ensure auth state is restored on app mount
4. Check for errors in browser console

## Development Guidelines

### Component Guidelines
1. Use Composition API with `<script setup>` syntax
2. Keep components under 200 lines
3. Extract reusable logic into composables
4. Use props validation and defaults
5. Emit events instead of mutating props
6. Name components with PascalCase

### State Management
1. Use Pinia stores for shared state
2. Keep stores focused on one domain
3. Use actions for async operations
4. Implement proper error handling in stores
5. Reset store state on logout

### Code Style
1. Use ESLint and Prettier consistently
2. Prefer const over let
3. Use template literals for string interpolation
4. Destructure objects and arrays when possible
5. Add JSDoc comments for complex functions
6. Keep functions small and focused

### Accessibility
1. Use semantic HTML elements
2. Add proper ARIA labels
3. Ensure keyboard navigation works
4. Test with screen readers
5. Maintain proper color contrast
6. Add alt text to images

## Best Practices

### Responsive Design with Vuetify
```vue
<!-- Use Vuetify's grid system for responsive layouts -->
<v-container>
  <v-row>
    <v-col cols="12" sm="6" md="4">
      <!-- Full width on mobile, half on tablet, third on desktop -->
    </v-col>
  </v-row>
</v-container>

<!-- Use display helpers for conditional visibility -->
<v-btn class="d-none d-md-flex">Desktop Only</v-btn>
<v-btn class="d-md-none">Mobile Only</v-btn>
```

### Performance Optimization
```javascript
// ✅ Use computed properties for derived state
const fullName = computed(() => `${user.value.firstName} ${user.value.lastName}`)

// ❌ Avoid methods for reactive values
const fullName = () => `${user.value.firstName} ${user.value.lastName}` // Re-runs on every render

// ✅ Debounce expensive operations
import { debounce } from 'lodash-es'
const searchQuery = ref('')
const debouncedSearch = debounce(async (query) => {
  // Perform search
}, 300)

// ✅ Use v-once for static content
<div v-once>{{ staticContent }}</div>

// ✅ Lazy load routes
const UserProfile = () => import('./views/UserProfile.vue')
```

### List Rendering Optimization
```vue
<!-- Always use :key with unique values -->
<template v-for="item in items" :key="item.id">
  <ItemComponent :item="item" />
</template>

<!-- Use v-memo for expensive list items (Vue 3.2+) -->
<div v-for="item in list" :key="item.id" v-memo="[item.id, item.updated]">
  <!-- Only re-renders when id or updated changes -->
</div>
```

### Proper Ref Usage
```javascript
// ✅ Use ref for primitives
const count = ref(0)
const name = ref('John')

// ✅ Use reactive for objects
const user = reactive({
  name: 'John',
  email: 'john@example.com'
})

// ⚠️ Be careful with destructuring reactive objects
const { name } = user // ❌ Loses reactivity
const { name } = toRefs(user) // ✅ Maintains reactivity
```

### Loading States Pattern
```vue
<template>
  <v-container>
    <!-- Loading state -->
    <v-progress-circular v-if="loading" indeterminate />
    
    <!-- Error state -->
    <v-alert v-else-if="error" type="error">
      {{ error.message }}
    </v-alert>
    
    <!-- Empty state -->
    <v-empty-state v-else-if="!data.length">
      No data found
    </v-empty-state>
    
    <!-- Success state -->
    <div v-else>
      <!-- Your content -->
    </div>
  </v-container>
</template>

<script setup>
const loading = ref(true)
const error = ref(null)
const data = ref([])
</script>
```

## Common Gotchas

### Authentication Redirect Loops
```javascript
// ❌ Avoid infinite redirects
router.beforeEach((to, from, next) => {
  if (!isAuthenticated) {
    next('/login') // Can cause loop if /login also has guard
  }
})

// ✅ Exclude auth pages from guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/signup', '/forgot-password']
  const authRequired = !publicPages.includes(to.path)
  
  if (authRequired && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

### Vuetify Theme Issues
```javascript
// ✅ Proper theme configuration in main.js
import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242'
        }
      }
    }
  }
})
```

### Supabase Row Level Security (RLS)
```javascript
// ⚠️ Remember RLS policies affect queries
// If getting empty results, check:
// 1. User is authenticated
// 2. RLS policies allow the operation
// 3. User has necessary permissions

// Always handle RLS errors
const { data, error } = await supabase
  .from('protected_table')
  .select('*')
  
if (error?.code === 'PGRST301') {
  console.error('No rows returned - check RLS policies')
}
```

## Testing Checklist

### Before Every Commit
- [ ] Run `npm run dev` and check for console errors
- [ ] Test on mobile viewport (iPhone/Android sizes)
- [ ] Verify all interactive elements work (buttons, forms, links)
- [ ] Check loading states appear correctly
- [ ] Ensure error states are user-friendly
- [ ] Run `npm run build` to catch build errors
- [ ] If using TypeScript: `npm run type-check`
- [ ] Test with slow network (Chrome DevTools)

### Authentication Testing
- [ ] Login flow works correctly
- [ ] Logout clears all user data
- [ ] Protected routes redirect when logged out
- [ ] Session persists on page refresh
- [ ] Password reset flow works

### Data Operations
- [ ] Create operations show success feedback
- [ ] Update operations reflect changes immediately
- [ ] Delete operations ask for confirmation
- [ ] List views handle empty states
- [ ] Pagination works correctly
- [ ] Search/filter functionality works

### Responsive Design
- [ ] Test on mobile (320px - 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Navigation works on all sizes
- [ ] Modals/dialogs are usable on mobile
- [ ] Touch interactions work properly

## Deployment Notes
- Remember to set environment variables in Netlify
- Enable SPA routing in Netlify (create _redirects file)
- Test authentication callback URLs in production
- Set NODE_VERSION environment variable if needed
- Enable deploy previews for pull requests

### Production Checklist
- [ ] Environment variables are set correctly
- [ ] Remove all console.log statements
- [ ] API endpoints use HTTPS
- [ ] Error tracking is configured
- [ ] Analytics are set up (if needed)
- [ ] Meta tags and SEO are configured
- [ ] Favicon and app icons are added
- [ ] Performance budget is met (<3s load time)

## Debugging Tips

### Vue Devtools
- Install Vue Devtools browser extension
- Use it to inspect component state
- Track Pinia store changes
- Monitor performance issues

### Common Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear all caches and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for conflicting dependencies
npm ls
```

## Current Focus
[Add current development focus here]

## Known Issues
[Track any known issues here]