import { ref } from 'vue'
import { supabase } from '@/services/supabase'

/**
 * Composable for common Supabase operations
 * This demonstrates the composable pattern for Vue 3
 */
export function useSupabase() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Generic query function with error handling
   */
  const query = async (queryFn) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: queryError } = await queryFn()
      
      if (queryError) {
        throw queryError
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Supabase query error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch data from a table
   */
  const fetchData = async (table, options = {}) => {
    return query(async () => {
      let query = supabase.from(table).select(options.select || '*')
      
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      return query
    })
  }

  /**
   * Insert data into a table
   */
  const insertData = async (table, data) => {
    return query(() => supabase.from(table).insert(data).select())
  }

  /**
   * Update data in a table
   */
  const updateData = async (table, id, updates) => {
    return query(() => 
      supabase.from(table).update(updates).eq('id', id).select()
    )
  }

  /**
   * Delete data from a table
   */
  const deleteData = async (table, id) => {
    return query(() => supabase.from(table).delete().eq('id', id))
  }

  return {
    loading,
    error,
    fetchData,
    insertData,
    updateData,
    deleteData
  }
}