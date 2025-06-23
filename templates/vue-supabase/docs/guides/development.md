# Development Guide

This guide covers development practices, conventions, and workflows for contributing to the project.

## Development Environment

### Required Tools

- **VS Code** (recommended) or your preferred editor
- **Vue DevTools** browser extension
- **Node.js** v18+ and npm
- **Git** for version control

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens"
  ]
}
```

### Environment Variables

Development environment variables:
```env
# Development
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:5173

# Optional
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

## Code Style & Conventions

### Vue Components

Follow Vue 3 Composition API with `<script setup>`:

```vue
<script setup>
import { ref, computed } from 'vue'
import { useStore } from '@/stores/main'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['update', 'delete'])

// State
const isLoading = ref(false)
const store = useStore()

// Computed
const formattedTitle = computed(() => 
  props.title.toUpperCase()
)

// Methods
const handleClick = async () => {
  isLoading.value = true
  try {
    await store.updateItem()
    emit('update')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="component-wrapper">
    <h1>{{ formattedTitle }}</h1>
    <v-btn 
      :loading="isLoading"
      @click="handleClick"
    >
      Update
    </v-btn>
  </div>
</template>

<style scoped>
.component-wrapper {
  padding: 1rem;
}
</style>
```

### Naming Conventions

#### Files & Folders
- **Components**: PascalCase (e.g., `UserProfile.vue`)
- **Composables**: camelCase with 'use' prefix (e.g., `useAuth.js`)
- **Views**: PascalCase with 'View' suffix (e.g., `DashboardView.vue`)
- **Stores**: camelCase (e.g., `userStore.js`)

#### Variables & Functions
```javascript
// Constants
const MAX_RETRIES = 3
const API_TIMEOUT = 5000

// Variables
let isLoading = false
const userData = ref({})

// Functions
function calculateTotal() {}
async function fetchUserData() {}

// Composables
const { user, login } = useAuth()
```

### Git Workflow

#### Branch Naming
- `feature/add-user-profile`
- `fix/login-validation`
- `chore/update-dependencies`
- `docs/api-documentation`

#### Commit Messages
Follow conventional commits:
```bash
feat: add user profile page
fix: resolve login validation error
docs: update API documentation
chore: upgrade Vue to 3.4.0
test: add unit tests for auth service
```

## Common Patterns

### API Calls

Use the service pattern:

```javascript
// src/services/userService.js
import { supabase } from './supabase'

export const userService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
```

### State Management

Use Pinia stores:

```javascript
// src/stores/user.js
import { defineStore } from 'pinia'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.profile,
    fullName: (state) => 
      `${state.profile?.firstName} ${state.profile?.lastName}`
  },

  actions: {
    async fetchProfile(userId) {
      this.isLoading = true
      try {
        this.profile = await userService.getProfile(userId)
      } finally {
        this.isLoading = false
      }
    }
  }
})
```

### Error Handling

Consistent error handling:

```javascript
// src/composables/useErrorHandler.js
import { useToast } from 'vue-toastification'

export function useErrorHandler() {
  const toast = useToast()

  const handleError = (error, customMessage) => {
    console.error('Error:', error)
    
    const message = customMessage || 
      error.message || 
      'An unexpected error occurred'
    
    toast.error(message)
  }

  return { handleError }
}
```

## Testing

### Unit Tests

```javascript
// src/components/__tests__/UserProfile.spec.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserProfile from '../UserProfile.vue'

describe('UserProfile', () => {
  it('renders user name', () => {
    const wrapper = mount(UserProfile, {
      props: {
        user: { name: 'John Doe' }
      }
    })
    
    expect(wrapper.text()).toContain('John Doe')
  })
})
```

### E2E Tests

```javascript
// e2e/login.spec.js
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

## Performance Guidelines

### Component Optimization
- Use `v-show` vs `v-if` appropriately
- Implement virtual scrolling for long lists
- Lazy load routes and components
- Optimize images and assets

### Bundle Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'ui': ['vuetify']
        }
      }
    }
  }
}
```

## Debugging

### Vue DevTools
1. Install browser extension
2. Open DevTools → Vue tab
3. Inspect component tree
4. Monitor Pinia stores
5. Track performance

### Debug Mode
```javascript
// Enable debug logging
if (import.meta.env.VITE_DEBUG === 'true') {
  console.log('Debug info:', data)
}
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Client and server side
3. **Sanitize user content** - Prevent XSS
4. **Use Supabase RLS** - Row Level Security
5. **HTTPS only** - In production

## Deployment Checklist

Before deploying:
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Performance acceptable
- [ ] Security review done

---

> 💻 Happy coding! Remember to follow these guidelines for consistent, maintainable code.