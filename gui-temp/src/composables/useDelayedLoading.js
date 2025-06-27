import { ref, computed, watch } from 'vue'

export function useDelayedLoading(delay = 200) {
  const isActuallyLoading = ref(false)
  const shouldShowLoading = ref(false)
  let showTimeout = null
  let hideTimeout = null

  // Computed property that determines if we should show loading
  const loading = computed({
    get: () => shouldShowLoading.value,
    set: (value) => {
      isActuallyLoading.value = value
    }
  })

  // Watch for changes in actual loading state
  watch(isActuallyLoading, (newValue, oldValue) => {
    // Clear any existing timeouts
    if (showTimeout) {
      clearTimeout(showTimeout)
      showTimeout = null
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }

    if (newValue && !oldValue) {
      // Starting to load - delay showing the loading state
      showTimeout = setTimeout(() => {
        if (isActuallyLoading.value) {
          shouldShowLoading.value = true
        }
      }, delay)
    } else if (!newValue && oldValue) {
      // Finished loading
      if (shouldShowLoading.value) {
        // If we were showing loading, hide it immediately
        shouldShowLoading.value = false
      } else {
        // If we were still in delay period, just cancel the show timeout
        // (already cleared above)
      }
    }
  })

  // Manual control functions
  function startLoading() {
    loading.value = true
  }

  function stopLoading() {
    loading.value = false
  }

  function setLoading(value) {
    loading.value = value
  }

  // Wrap an async operation with delayed loading
  async function withDelayedLoading(operation, options = {}) {
    const localDelay = options.delay ?? delay
    const minDuration = options.minDuration ?? 0

    const startTime = Date.now()
    
    try {
      startLoading()
      const result = await operation()
      
      // Ensure minimum duration if specified
      if (minDuration > 0) {
        const elapsed = Date.now() - startTime
        if (elapsed < minDuration) {
          await new Promise(resolve => 
            setTimeout(resolve, minDuration - elapsed)
          )
        }
      }
      
      return result
    } finally {
      stopLoading()
    }
  }

  // Cleanup function
  function cleanup() {
    if (showTimeout) clearTimeout(showTimeout)
    if (hideTimeout) clearTimeout(hideTimeout)
  }

  return {
    loading,
    showLoading: shouldShowLoading,
    actuallyLoading: isActuallyLoading,
    startLoading,
    stopLoading,
    setLoading,
    withDelayedLoading,
    cleanup
  }
}

// Preset configurations for common scenarios
export const loadingPresets = {
  // For API calls that are usually fast
  api: { delay: 300, minDuration: 500 },
  
  // For navigation/route changes
  navigation: { delay: 100, minDuration: 200 },
  
  // For file operations
  file: { delay: 200, minDuration: 800 },
  
  // For data processing
  processing: { delay: 150, minDuration: 1000 },
  
  // For instant operations that might occasionally be slow
  instant: { delay: 500, minDuration: 0 }
}