import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please check your .env file')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Helper function to handle Supabase errors
export const handleError = (error) => {
  if (error) {
    console.error('Supabase error:', error.message)
    throw error
  }
}

// Auth helpers
export const auth = {
  // Get current user
  getUser: () => supabase.auth.getUser(),
  
  // Get session
  getSession: () => supabase.auth.getSession(),
  
  // Sign in with email
  signIn: (email, password) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  // Sign up
  signUp: (email, password) => 
    supabase.auth.signUp({ email, password }),
  
  // Sign out
  signOut: () => supabase.auth.signOut(),
  
  // Listen to auth changes
  onAuthStateChange: (callback) => 
    supabase.auth.onAuthStateChange(callback)
}