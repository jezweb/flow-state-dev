import { ref, reactive } from 'vue'
import { errorHandler } from '../utils/errorHandler'

export function useErrorHandling() {
  const error = ref(null)
  const isLoading = ref(false)
  const errorState = reactive({
    hasError: false,
    message: '',
    canRetry: false,
    retryCount: 0
  })

  // Wrap an async operation with error handling
  async function withErrorHandling(operation, options = {}) {
    const {
      onError = null,
      retryable = true,
      maxRetries = 3,
      retryDelay = 1000,
      loadingMessage = 'Loading...',
      errorMessage = null
    } = options

    isLoading.value = true
    error.value = null
    errorState.hasError = false

    try {
      const result = await operation()
      errorState.retryCount = 0
      return result
    } catch (err) {
      error.value = err
      errorState.hasError = true
      errorState.message = errorMessage || errorHandler.getUserMessage(err)
      errorState.canRetry = retryable && errorHandler.isRecoverable(err)

      // Log error
      errorHandler.handleError(err, {
        operation: operation.name || 'unknown',
        options
      })

      // Call custom error handler
      if (onError) {
        onError(err)
      }

      // Auto-retry if configured
      if (retryable && errorState.retryCount < maxRetries && errorHandler.isRecoverable(err)) {
        errorState.retryCount++
        console.log(`Retrying operation (${errorState.retryCount}/${maxRetries})...`)
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * errorState.retryCount))
        
        // Recursive retry
        return withErrorHandling(operation, {
          ...options,
          maxRetries: maxRetries - errorState.retryCount
        })
      }

      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Clear error state
  function clearError() {
    error.value = null
    errorState.hasError = false
    errorState.message = ''
    errorState.canRetry = false
  }

  // Retry last failed operation
  function retry() {
    if (errorState.canRetry) {
      errorState.retryCount = 0
      clearError()
      // The operation should be stored and retried here
      // This is a simplified version
    }
  }

  return {
    error,
    isLoading,
    errorState,
    withErrorHandling,
    clearError,
    retry
  }
}

// Global error handling for unhandled promise rejections in components
export function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason)
    // Prevent default browser behavior
    event.preventDefault()
  })
}