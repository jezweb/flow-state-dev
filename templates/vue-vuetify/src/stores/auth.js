import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, isSupabaseConfigured } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id)
  const userEmail = computed(() => user.value?.email)

  // Actions
  const initialize = async () => {
    try {
      // Skip initialization if Supabase is not configured
      if (!isSupabaseConfigured) {
        console.warn('Auth: Running without Supabase - authentication disabled')
        loading.value = false
        return
      }

      // Get initial session
      const { data: { session: currentSession } } = await auth.getSession()
      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
      }

      // Listen for auth changes
      auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      console.warn('Cannot sign in: Supabase is not configured')
      return { data: null, error: new Error('Supabase is not configured') }
    }

    try {
      loading.value = true
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) {
      console.warn('Cannot sign up: Supabase is not configured')
      return { data: null, error: new Error('Supabase is not configured') }
    }

    try {
      loading.value = true
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      console.warn('Cannot sign out: Supabase is not configured')
      return
    }

    try {
      loading.value = true
      const { error } = await auth.signOut()
      if (error) throw error
      user.value = null
      session.value = null
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    session,
    loading,
    // Getters
    isAuthenticated,
    userId,
    userEmail,
    // Actions
    initialize,
    signIn,
    signUp,
    signOut
  }
})