import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { pascalCase, camelCase, kebabCase } from 'change-case';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class StoreGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.storesPath = path.join(this.projectRoot, 'src', 'stores');
  }

  async checkPrerequisites() {
    // Check if we're in a Vue project
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('No package.json found. Are you in a Vue project directory?');
    }

    const packageJson = await fs.readJson(packageJsonPath);
    
    // Check for Vue
    const hasVue = packageJson.dependencies?.vue || packageJson.devDependencies?.vue;
    if (!hasVue) {
      throw new Error('This doesn\'t appear to be a Vue project. Vue is not found in dependencies.');
    }

    // Check for Pinia
    const hasPinia = packageJson.dependencies?.pinia || packageJson.devDependencies?.pinia;
    if (!hasPinia) {
      throw new Error('Pinia is not installed. Run "npm install pinia" first.');
    }

    // Check if src/stores directory exists
    if (!await fs.pathExists(this.storesPath)) {
      console.log(chalk.yellow('Creating src/stores directory...'));
      await fs.ensureDir(this.storesPath);
    }

    return true;
  }

  generateStoreContent(name, options = {}) {
    const storeName = camelCase(name);
    const storeNamePascal = pascalCase(name);
    const fileName = kebabCase(name);
    
    let template = `import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const use${storeNamePascal}Store = defineStore('${storeName}', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentItem = ref(null)

  // Getters
  const itemCount = computed(() => items.value.length)
  const hasItems = computed(() => items.value.length > 0)
  const hasError = computed(() => error.value !== null)

  // Actions
  const fetchItems = async () => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.getItems()
      // items.value = response.data
      
      // Placeholder data
      items.value = [
        { id: 1, name: 'Sample Item 1' },
        { id: 2, name: 'Sample Item 2' }
      ]
    } catch (err) {
      error.value = err.message || 'Failed to fetch items'
      console.error('Error fetching items:', err)
    } finally {
      loading.value = false
    }
  }

  const getItemById = (id) => {
    return items.value.find(item => item.id === id)
  }

  const addItem = async (item) => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.createItem(item)
      // items.value.push(response.data)
      
      // Placeholder implementation
      const newItem = {
        ...item,
        id: Date.now()
      }
      items.value.push(newItem)
      return newItem
    } catch (err) {
      error.value = err.message || 'Failed to add item'
      console.error('Error adding item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (id, updates) => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.updateItem(id, updates)
      
      // Placeholder implementation
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...updates }
        return items.value[index]
      }
      throw new Error('Item not found')
    } catch (err) {
      error.value = err.message || 'Failed to update item'
      console.error('Error updating item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // await api.deleteItem(id)
      
      // Placeholder implementation
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete item'
      console.error('Error deleting item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentItem = (item) => {
    currentItem.value = item
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    items.value = []
    loading.value = false
    error.value = null
    currentItem.value = null
  }

  return {
    // State
    items,
    loading,
    error,
    currentItem,
    
    // Getters
    itemCount,
    hasItems,
    hasError,
    
    // Actions
    fetchItems,
    getItemById,
    addItem,
    updateItem,
    deleteItem,
    setCurrentItem,
    clearError,
    reset
  }
})
`;

    // If Supabase option is enabled, generate Supabase-specific template
    if (options.supabase) {
      template = this.generateSupabaseStoreContent(name, options);
    } else if (options.auth) {
      template = this.generateAuthStoreContent(name);
    } else if (options.minimal) {
      template = this.generateMinimalStoreContent(name);
    }

    return template;
  }

  generateSupabaseStoreContent(name, options) {
    const storeName = camelCase(name);
    const storeNamePascal = pascalCase(name);
    const tableName = options.table || kebabCase(name) + 's';
    
    return `import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export const use${storeNamePascal}Store = defineStore('${storeName}', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentItem = ref(null)

  // Getters
  const itemCount = computed(() => items.value.length)
  const hasItems = computed(() => items.value.length > 0)
  const hasError = computed(() => error.value !== null)

  // Actions
  const fetchItems = async (filters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase.from('${tableName}').select('*')
      
      // Apply filters if provided
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
      
      const { data, error: supabaseError } = await query
      
      if (supabaseError) throw supabaseError
      
      items.value = data || []
    } catch (err) {
      error.value = err.message || 'Failed to fetch items'
      console.error('Error fetching items:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchItemById = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('${tableName}')
        .select('*')
        .eq('id', id)
        .single()
      
      if (supabaseError) throw supabaseError
      
      currentItem.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Failed to fetch item'
      console.error('Error fetching item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createItem = async (item) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('${tableName}')
        .insert([item])
        .select()
        .single()
      
      if (supabaseError) throw supabaseError
      
      items.value.push(data)
      return data
    } catch (err) {
      error.value = err.message || 'Failed to create item'
      console.error('Error creating item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (id, updates) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('${tableName}')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (supabaseError) throw supabaseError
      
      // Update in local state
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = data
      }
      
      // Update current item if it's the same
      if (currentItem.value?.id === id) {
        currentItem.value = data
      }
      
      return data
    } catch (err) {
      error.value = err.message || 'Failed to update item'
      console.error('Error updating item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: supabaseError } = await supabase
        .from('${tableName}')
        .delete()
        .eq('id', id)
      
      if (supabaseError) throw supabaseError
      
      // Remove from local state
      items.value = items.value.filter(item => item.id !== id)
      
      // Clear current item if it was deleted
      if (currentItem.value?.id === id) {
        currentItem.value = null
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete item'
      console.error('Error deleting item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('${tableName}_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: '${tableName}' },
        (payload) => {
          console.log('Change received:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              items.value.push(payload.new)
              break
            case 'UPDATE':
              const updateIndex = items.value.findIndex(item => item.id === payload.new.id)
              if (updateIndex !== -1) {
                items.value[updateIndex] = payload.new
              }
              if (currentItem.value?.id === payload.new.id) {
                currentItem.value = payload.new
              }
              break
            case 'DELETE':
              items.value = items.value.filter(item => item.id !== payload.old.id)
              if (currentItem.value?.id === payload.old.id) {
                currentItem.value = null
              }
              break
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    items.value = []
    loading.value = false
    error.value = null
    currentItem.value = null
  }

  return {
    // State
    items,
    loading,
    error,
    currentItem,
    
    // Getters
    itemCount,
    hasItems,
    hasError,
    
    // Actions
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    subscribeToChanges,
    clearError,
    reset
  }
})
`;
  }

  generateAuthStoreContent(name) {
    return `import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id)
  const userEmail = computed(() => user.value?.email)
  const userMetadata = computed(() => user.value?.user_metadata || {})

  // Actions
  const initialize = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Get initial session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
        
        if (_event === 'SIGNED_OUT') {
          // Redirect to login
          router.push('/login')
        }
      })
    } catch (err) {
      error.value = err.message || 'Failed to initialize auth'
      console.error('Error initializing auth:', err)
    } finally {
      loading.value = false
    }
  }

  const signIn = async ({ email, password }) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      session.value = data.session
      user.value = data.user
      
      return data
    } catch (err) {
      error.value = err.message || 'Failed to sign in'
      console.error('Error signing in:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const signUp = async ({ email, password, metadata = {} }) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (signUpError) throw signUpError
      
      return data
    } catch (err) {
      error.value = err.message || 'Failed to sign up'
      console.error('Error signing up:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError
      
      session.value = null
      user.value = null
    } catch (err) {
      error.value = err.message || 'Failed to sign out'
      console.error('Error signing out:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: \`\${window.location.origin}/reset-password\`
      })
      
      if (resetError) throw resetError
    } catch (err) {
      error.value = err.message || 'Failed to send reset email'
      console.error('Error resetting password:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePassword = async (newPassword) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) throw updateError
    } catch (err) {
      error.value = err.message || 'Failed to update password'
      console.error('Error updating password:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (updateError) throw updateError
      
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message || 'Failed to update profile'
      console.error('Error updating profile:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    session,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userId,
    userEmail,
    userMetadata,
    
    // Actions
    initialize,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError
  }
})
`;
  }

  generateMinimalStoreContent(name) {
    const storeName = camelCase(name);
    const storeNamePascal = pascalCase(name);
    
    return `import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const use${storeNamePascal}Store = defineStore('${storeName}', () => {
  // State
  const count = ref(0)
  
  // Getters
  const doubleCount = computed(() => count.value * 2)
  
  // Actions
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = 0
  }
  
  return {
    // State
    count,
    
    // Getters
    doubleCount,
    
    // Actions
    increment,
    decrement,
    reset
  }
})
`;
  }

  async generateStore(name, options = {}) {
    try {
      // Validate name
      if (!name || typeof name !== 'string') {
        throw new Error('Store name is required');
      }

      // Check prerequisites
      await this.checkPrerequisites();

      // Generate file name and path
      const fileName = kebabCase(name) + '.js';
      const filePath = path.join(this.storesPath, fileName);

      // Check if store already exists
      if (await fs.pathExists(filePath)) {
        const overwrite = options.force || false;
        if (!overwrite) {
          throw new Error(`Store "${fileName}" already exists. Use --force to overwrite.`);
        }
        console.log(chalk.yellow(`Overwriting existing store: ${fileName}`));
      }

      // Generate store content
      const content = this.generateStoreContent(name, options);

      // Write the store file
      await fs.writeFile(filePath, content);

      console.log(chalk.green(`✓ Created store: ${filePath}`));

      // Additional guidance
      console.log('\n' + chalk.cyan('Next steps:'));
      console.log('1. Import and use your store in a component:');
      console.log(chalk.gray(`   import { use${pascalCase(name)}Store } from '@/stores/${kebabCase(name)}'`));
      console.log(chalk.gray(`   const ${camelCase(name)}Store = use${pascalCase(name)}Store()`));
      
      if (options.supabase) {
        console.log('\n2. Make sure your Supabase table "' + (options.table || kebabCase(name) + 's') + '" exists');
        console.log('3. Set up Row Level Security (RLS) policies if needed');
      }

      return filePath;
    } catch (error) {
      console.error(chalk.red('Error generating store:'), error.message);
      throw error;
    }
  }
}

export async function generateStore(name, options) {
  const generator = new StoreGenerator();
  return await generator.generateStore(name, options);
}