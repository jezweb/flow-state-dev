import { ref, reactive, computed } from 'vue'

export function useLoading(initialStates = {}) {
  const loadingStates = reactive({
    global: false,
    ...initialStates
  })
  
  const isLoading = computed(() => 
    Object.values(loadingStates).some(state => state)
  )
  
  const hasAnyLoading = computed(() => 
    Object.keys(loadingStates).some(key => loadingStates[key])
  )

  // Set loading state for a specific operation
  function setLoading(operation, value = true) {
    loadingStates[operation] = value
  }

  // Get loading state for specific operation
  function getLoading(operation) {
    return loadingStates[operation] || false
  }

  // Wrap an async operation with loading state
  async function withLoading(operation, operationName = 'global') {
    setLoading(operationName, true)
    try {
      return await operation()
    } finally {
      setLoading(operationName, false)
    }
  }

  // Create a loading wrapper for multiple operations
  function createLoadingWrapper(operationName) {
    return {
      loading: computed(() => getLoading(operationName)),
      async execute(operation) {
        return withLoading(operation, operationName)
      },
      start() {
        setLoading(operationName, true)
      },
      stop() {
        setLoading(operationName, false)
      }
    }
  }

  // Clear all loading states
  function clearAll() {
    Object.keys(loadingStates).forEach(key => {
      loadingStates[key] = false
    })
  }

  return {
    loadingStates: readonly(loadingStates),
    isLoading,
    hasAnyLoading,
    setLoading,
    getLoading,
    withLoading,
    createLoadingWrapper,
    clearAll
  }
}

// Global loading store
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const { 
    loadingStates, 
    isLoading, 
    hasAnyLoading, 
    setLoading, 
    getLoading, 
    withLoading, 
    createLoadingWrapper, 
    clearAll 
  } = useLoading({
    app: false,
    api: false,
    navigation: false,
    data: false
  })

  return {
    loadingStates,
    isLoading,
    hasAnyLoading,
    setLoading,
    getLoading,
    withLoading,
    createLoadingWrapper,
    clearAll
  }
})