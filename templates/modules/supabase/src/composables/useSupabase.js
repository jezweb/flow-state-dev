import { supabase, isSupabaseConfigured } from '../services/supabase'

export function useSupabase() {
  return {
    supabase,
    isSupabaseConfigured: isSupabaseConfigured()
  }
}