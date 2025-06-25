import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabase
}

// Helper to check Supabase connection
export const checkSupabaseConnection = async () => {
  if (!supabase) {
    return { connected: false, error: 'Supabase not configured' }
  }
  
  try {
    const { data, error } = await supabase.from('_test_connection').select('count')
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "table not found" which is expected
      throw error
    }
    return { connected: true }
  } catch (error) {
    return { connected: false, error: error.message }
  }
}