# Project Code Style Preferences

## Vue Components

### Script Setup Syntax
Always use `<script setup>` for Vue 3 components:
```vue
<script setup>
// ✅ Preferred
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- ❌ Avoid Options API -->
<script>
export default {
  data() {
    return { count: 0 }
  }
}
</script>
```

### Component Organization
Order elements consistently:
1. `<script setup>`
2. `<template>`
3. `<style scoped>`

### Props and Emits
```javascript
// ✅ Use TypeScript-style props with defaults
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

// ✅ Define emits explicitly
const emit = defineEmits(['update', 'delete'])
```

## JavaScript/TypeScript

### Variable Declarations
```javascript
// ✅ Prefer const
const userName = 'John'
const config = { theme: 'dark' }

// ✅ Use let only when reassigning
let count = 0
count++

// ❌ Avoid var
var oldStyle = 'no'
```

### Async/Await
```javascript
// ✅ Use async/await
async function fetchUser() {
  try {
    const user = await userService.getProfile()
    return user
  } catch (error) {
    handleError(error)
  }
}

// ❌ Avoid promise chains for complex logic
fetchUser()
  .then(user => {})
  .catch(error => {})
```

### Destructuring
```javascript
// ✅ Use destructuring
const { name, email } = user
const [first, second] = items

// ✅ With defaults
const { theme = 'light' } = settings
```

## Naming Conventions

### Files
- Components: `UserProfile.vue` (PascalCase)
- Composables: `useAuth.js` (camelCase with 'use' prefix)
- Services: `userService.js` (camelCase with 'Service' suffix)
- Stores: `user.js` (camelCase, noun)

### Variables and Functions
```javascript
// ✅ Descriptive names
const isLoggedIn = true
const userPreferences = {}
function calculateTotalPrice() {}

// ❌ Avoid single letters or abbreviations
const u = {} // user
const calc = () => {} // calculate
```

## Vuetify Specific

### Component Usage
```vue
<!-- ✅ Use Vuetify components consistently -->
<v-btn color="primary" @click="handleClick">
  Click Me
</v-btn>

<!-- ❌ Don't mix with plain HTML unnecessarily -->
<button class="primary-button">Click Me</button>
```

### Styling
```vue
<!-- ✅ Use Vuetify's utility classes -->
<v-card class="pa-4 ma-2">

<!-- ✅ Use scoped styles for custom styling -->
<style scoped>
.custom-card {
  border-radius: 12px;
}
</style>

<!-- ❌ Avoid inline styles -->
<div style="padding: 16px">
```

## Supabase Patterns

### Query Pattern
```javascript
// ✅ Consistent error handling
const { data, error } = await supabase
  .from('table')
  .select('*')
  
if (error) throw error
return data

// ✅ Use query builders effectively
const { data } = await supabase
  .from('posts')
  .select('*, author:users(name, avatar)')
  .order('created_at', { ascending: false })
  .limit(10)
```

### Real-time Subscriptions
```javascript
// ✅ Clean up subscriptions
onMounted(() => {
  const subscription = supabase
    .channel('posts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'posts'
    }, handleNewPost)
    .subscribe()
    
  onUnmounted(() => {
    subscription.unsubscribe()
  })
})
```

## Error Handling

### Consistent Pattern
```javascript
// ✅ Try-catch with meaningful errors
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Failed to perform operation:', error)
  toast.error('Something went wrong. Please try again.')
  throw error // Re-throw if needed upstream
}

// ✅ Loading states
const isLoading = ref(false)
const loadData = async () => {
  isLoading.value = true
  try {
    const data = await fetchData()
    // process data
  } finally {
    isLoading.value = false
  }
}
```

## Comments and Documentation

### When to Comment
```javascript
// ✅ Complex business logic
// Calculate compound interest using the formula: A = P(1 + r/n)^(nt)
function calculateCompoundInterest(principal, rate, time, n = 12) {
  return principal * Math.pow(1 + rate / n, n * time)
}

// ❌ Obvious code
// Set user name
user.name = 'John' // Don't do this
```

### JSDoc for Public APIs
```javascript
/**
 * Fetches user profile data from Supabase
 * @param {string} userId - The user's UUID
 * @returns {Promise<UserProfile>} The user profile object
 * @throws {Error} If user is not found
 */
async function getUserProfile(userId) {
  // implementation
}
```

## Performance Considerations

### Component Optimization
```vue
<script setup>
// ✅ Computed for derived state
const fullName = computed(() => 
  `${user.value.firstName} ${user.value.lastName}`
)

// ✅ Use shallowRef for large objects that don't need deep reactivity
const largeDataSet = shallowRef([])

// ✅ Debounce expensive operations
const searchQuery = ref('')
const debouncedSearch = debounce(performSearch, 300)
watch(searchQuery, debouncedSearch)
</script>
```

---

> 📝 These style preferences ensure consistency across the codebase. When in doubt, prioritize readability and maintainability.