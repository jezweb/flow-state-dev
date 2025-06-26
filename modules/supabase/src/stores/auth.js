import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  async function initialize() {
    if (!supabase) {
      loading.value = false
      return
    }

    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async function signUp(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  async function signOut() {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    user.value = null
  }

  async function resetPassword(email) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) throw error
    return data
  }

  async function updatePassword(newPassword) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
    return data
  }

  return {
    user,
    loading,
    isAuthenticated,
    initialize,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }
})