# Pinia Store Generator

Flow State Dev includes a powerful Pinia store generator that helps you quickly scaffold state management stores for your Vue 3 applications.

## Quick Start

```bash
# Generate a basic store
fsd store user

# Generate a Supabase-connected store
fsd store product --supabase

# Generate an authentication store
fsd store auth --auth

# Generate a minimal store
fsd store counter --minimal
```

## Command Syntax

```bash
fsd store <name> [options]
```

### Arguments
- `name` (required) - The name of your store (e.g., `user`, `product`, `cart`)

### Options
- `-m, --minimal` - Generate a minimal store template with basic counter logic
- `-a, --auth` - Generate a complete authentication store with Supabase integration
- `-s, --supabase` - Generate a Supabase-connected store with CRUD operations
- `-t, --table <table>` - Specify custom Supabase table name (default: pluralized store name)
- `-f, --force` - Overwrite existing store file

## Store Templates

### 1. Default Store Template

The default template provides a complete CRUD store with:
- State management (items, loading, error, currentItem)
- Computed properties (itemCount, hasItems, hasError)
- CRUD actions (fetch, add, update, delete)
- Error handling
- Loading states

```bash
fsd store product
```

Creates `src/stores/product.js`:

```javascript
export const useProductStore = defineStore('product', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Actions for CRUD operations
  const fetchItems = async () => { ... }
  const addItem = async (item) => { ... }
  const updateItem = async (id, updates) => { ... }
  const deleteItem = async (id) => { ... }
  
  // ... more functionality
})
```

### 2. Supabase Store Template

A fully-integrated Supabase store with:
- Automatic Supabase client integration
- Real-time subscriptions
- Row-level security aware
- Optimistic updates
- Comprehensive error handling

```bash
fsd store product --supabase
fsd store product --supabase --table products_table
```

Features:
- Complete CRUD operations using Supabase
- Real-time change subscriptions
- Filter support in fetch operations
- Proper TypeScript typing ready
- RLS-aware error messages

### 3. Authentication Store Template

A complete authentication store with:
- User session management
- Sign in/up/out functionality
- Password reset flows
- Profile updates
- Auth state persistence
- Route guard integration

```bash
fsd store auth --auth
```

Includes:
- Session initialization and monitoring
- Complete auth flows (login, register, logout)
- Password reset via email
- User metadata management
- Automatic redirects on auth changes

### 4. Minimal Store Template

A lightweight store for simple use cases:
- Basic counter example
- Minimal boilerplate
- Easy to extend

```bash
fsd store counter --minimal
```

Perfect for:
- Simple UI state
- Learning Pinia basics
- Quick prototypes

## Usage in Components

After generating a store, use it in your Vue components:

```vue
<script setup>
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()

// Use store state
const products = computed(() => productStore.items)
const loading = computed(() => productStore.loading)

// Call store actions
onMounted(() => {
  productStore.fetchItems()
})

const handleAdd = async (product) => {
  await productStore.addItem(product)
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <ProductCard 
      v-for="product in products" 
      :key="product.id"
      :product="product"
    />
  </div>
</template>
```

## Best Practices

### 1. Naming Conventions
- Use singular names: `fsd store user` (not `users`)
- The generator will handle pluralization for table names
- Store names become: `useUserStore`, `useProductStore`, etc.

### 2. Store Organization
```
src/stores/
├── auth.js        # Authentication store
├── user.js        # User profile store
├── product.js     # Product management
├── cart.js        # Shopping cart
└── ui.js          # UI state (minimal template)
```

### 3. Supabase Integration
When using `--supabase`:
1. Ensure your Supabase client is configured in `@/services/supabase`
2. Create corresponding database tables
3. Set up Row Level Security policies
4. Handle RLS errors appropriately

### 4. Real-time Subscriptions
The Supabase template includes real-time support:

```javascript
// In your component
onMounted(() => {
  // Start listening to changes
  const unsubscribe = productStore.subscribeToChanges()
  
  // Clean up on unmount
  onUnmounted(() => {
    unsubscribe()
  })
})
```

### 5. Error Handling
All templates include proper error handling:

```javascript
try {
  await productStore.addItem(newProduct)
  // Success notification
} catch (error) {
  // Error is already stored in productStore.error
  console.error('Failed to add product:', error)
}
```

## Common Patterns

### Loading States
```vue
<template>
  <v-progress-circular v-if="productStore.loading" />
  <v-alert v-else-if="productStore.error" type="error">
    {{ productStore.error }}
  </v-alert>
  <ProductList v-else :products="productStore.items" />
</template>
```

### Filtering Data
```javascript
// Supabase stores support filters
await productStore.fetchItems({ 
  category: 'electronics',
  active: true 
})
```

### Optimistic Updates
The generated stores handle optimistic updates for better UX:
```javascript
// Updates local state immediately, syncs with server
await productStore.updateItem(id, { name: 'New Name' })
```

## Troubleshooting

### "Pinia is not installed"
Run `npm install pinia` and ensure it's configured in your main.js:
```javascript
import { createPinia } from 'pinia'
app.use(createPinia())
```

### "Store already exists"
Use the `--force` flag to overwrite:
```bash
fsd store user --force
```

### Supabase Connection Issues
1. Check your `.env` file has correct Supabase credentials
2. Ensure Supabase client is properly configured
3. Verify table exists and RLS policies are set

### Import Errors
Ensure your `vite.config.js` has the `@` alias configured:
```javascript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

## Advanced Usage

### Custom Table Names
```bash
# Store name: orderItem, Table name: order_items_table
fsd store orderItem --supabase --table order_items_table
```

### Combining with Other Tools
```bash
# Generate store and component together
fsd store product --supabase
fsd component ProductList
fsd component ProductCard
```

### Type Safety
For TypeScript projects, generate types from Supabase:
```bash
supabase gen types typescript > src/types/supabase.ts
```

Then update your store imports to use the generated types.

## Examples

### E-commerce Cart Store
```bash
fsd store cart --supabase --table shopping_carts
```

### User Preferences Store
```bash
fsd store preferences --minimal
```

### Multi-tenant Store
```bash
fsd store tenant --supabase --table organizations
```

### Real-time Chat Store
```bash
fsd store messages --supabase --table chat_messages
```

## Integration with Claude Code

The generated stores are optimized for AI assistance:
1. Clear function names and documentation
2. Consistent patterns across all templates
3. TODO comments for customization points
4. Error messages that guide fixes

When working with Claude Code, you can:
- Ask to modify the generated store
- Request additional actions or getters
- Add complex business logic
- Integrate with other services

## Next Steps

1. Generate your first store: `fsd store myStore`
2. Review the generated code in `src/stores/`
3. Customize the store for your needs
4. Import and use in your components
5. Add real-time features if using Supabase

For more help:
- Run `fsd store --help`
- Check the generated store files for inline documentation
- Review example usage in comments