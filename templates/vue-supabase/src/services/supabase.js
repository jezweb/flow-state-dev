import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create client only if configured, otherwise null
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Show warning in development if not configured
if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn('⚠️ Supabase is not configured. The app will run in offline mode.')
  console.warn('To enable Supabase:')
  console.warn('1. Copy .env.example to .env')
  console.warn('2. Add your Supabase URL and anon key')
  console.warn('3. Restart the dev server')
}

// Helper to check if Supabase is available
export const requireSupabase = () => {
  if (!isSupabaseConfigured) {
    console.warn('This feature requires Supabase to be configured.')
    return false
  }
  return true
}

// Helper function to handle Supabase errors
export const handleError = (error) => {
  if (error) {
    console.error('Supabase error:', error.message)
    throw error
  }
}

// Mock response for when Supabase is not configured
const mockResponse = {
  data: null,
  error: { message: 'Supabase is not configured' }
}

// Auth helpers with graceful fallbacks
export const auth = {
  // Get current user
  getUser: () => supabase?.auth.getUser() || Promise.resolve(mockResponse),
  
  // Get session
  getSession: () => supabase?.auth.getSession() || Promise.resolve(mockResponse),
  
  // Sign in with email
  signIn: (email, password) => 
    supabase?.auth.signInWithPassword({ email, password }) || Promise.resolve(mockResponse),
  
  // Sign up
  signUp: (email, password) => 
    supabase?.auth.signUp({ email, password }) || Promise.resolve(mockResponse),
  
  // Sign out
  signOut: () => supabase?.auth.signOut() || Promise.resolve({ error: null }),
  
  // Listen to auth changes
  onAuthStateChange: (callback) => 
    supabase?.auth.onAuthStateChange(callback) || { data: { subscription: { unsubscribe: () => {} } } }
}