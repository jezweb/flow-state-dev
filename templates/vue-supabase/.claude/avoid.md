# What to Avoid - AI Guidelines

This document outlines what AI assistants should NOT do when helping with this project.

## Code Practices to Avoid

### ❌ Don't Use Outdated Patterns
```javascript
// ❌ Don't use Vue 2 Options API
export default {
  data() {
    return { count: 0 }
  }
}

// ❌ Don't use old Vue 2 syntax
this.$emit('update')
this.$refs.myRef

// ❌ Don't suggest class components
class MyComponent extends Vue {}
```

### ❌ Don't Over-Engineer
```javascript
// ❌ Don't create unnecessary abstractions
class UserRepositoryFactoryInterface {
  // Just use a simple service
}

// ❌ Don't add patterns we don't use
// No Redux, MobX, or complex state patterns
// We use Pinia, keep it simple
```

### ❌ Don't Ignore Project Standards
```javascript
// ❌ Don't use different formatting
function myFunction(param1,param2){return param1+param2}

// ❌ Don't ignore naming conventions
const user_name = 'John' // Should be userName
const GetUserData = () => {} // Should be getUserData
```

## Architecture Anti-Patterns

### ❌ Don't Bypass Supabase RLS
```javascript
// ❌ Never expose service role key in frontend
const supabase = createClient(url, SERVICE_ROLE_KEY) // NEVER!

// ❌ Don't bypass Row Level Security
// Always respect RLS policies
```

### ❌ Don't Create Security Vulnerabilities
```javascript
// ❌ Don't use innerHTML with user content
element.innerHTML = userContent // XSS risk!

// ❌ Don't store sensitive data in localStorage
localStorage.setItem('apiKey', SECRET_KEY)

// ❌ Don't commit secrets
const API_KEY = 'sk_live_abcd1234' // Use env vars!
```

### ❌ Don't Mix Concerns
```vue
<!-- ❌ Don't put business logic in templates -->
<template>
  <div>
    {{ 
      users.filter(u => u.active)
        .map(u => u.name)
        .join(', ')
        .toUpperCase() 
    }}
  </div>
</template>

<!-- ✅ Use computed properties instead -->
```

## Communication Anti-Patterns

### ❌ Don't Be Vague
- "Just refactor the code" - Be specific about what and why
- "This might not work" - Explain why and provide alternatives
- "It's complicated" - Break it down into understandable parts

### ❌ Don't Assume Context
- Don't assume the user knows Vue/Supabase deeply
- Don't assume previous conversation context without confirmation
- Don't assume business requirements without asking

### ❌ Don't Provide Untested Code
- Don't generate code without considering imports
- Don't suggest solutions that conflict with our stack
- Don't provide partial solutions without noting what's missing

## Performance Anti-Patterns

### ❌ Don't Create Performance Issues
```javascript
// ❌ Don't fetch in loops
for (const userId of userIds) {
  await fetchUser(userId) // Makes N requests!
}

// ❌ Don't create memory leaks
// Always cleanup subscriptions, intervals, event listeners

// ❌ Don't trigger unnecessary re-renders
// Be careful with reactive dependencies
```

## Supabase Specific

### ❌ Don't Misuse Supabase
```javascript
// ❌ Don't make unnecessary requests
// Use select() to get only needed fields

// ❌ Don't ignore real-time subscription limits
// Don't subscribe to entire tables for large datasets

// ❌ Don't bypass authentication
// Always check user authentication state
```

## General Guidelines

### Things to Always Avoid:
1. **Deprecated features** - Check if features are current
2. **Complex solutions for simple problems** - KISS principle
3. **Ignoring error cases** - Always handle errors
4. **Breaking changes** - Consider backward compatibility
5. **Premature optimization** - Profile first, optimize later
6. **Copy-paste without understanding** - Explain the code
7. **Ignoring accessibility** - Keep a11y in mind
8. **Hard-coding values** - Use constants and config

### When Unsure:
- Ask for clarification rather than assuming
- Suggest multiple approaches with tradeoffs
- Reference documentation
- Admit uncertainty

---

> 🚫 This guide helps maintain code quality and consistency. When you see these patterns, suggest better alternatives!