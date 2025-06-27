// Global error handling utilities

class ErrorHandler {
  constructor() {
    this.errors = []
    this.maxErrors = 50
    this.listeners = new Set()
    this.notificationsStore = null
  }

  // Initialize global error handlers
  init(app) {
    // Set up notifications store reference after app is created
    app.config.globalProperties.$errorHandler = this
    
    // Vue app error handler
    app.config.errorHandler = (error, instance, info) => {
      this.handleError(error, { instance, info, source: 'vue' })
    }

    // Global unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), { 
        source: 'unhandledRejection',
        promise: event.promise 
      })
      event.preventDefault()
    })

    // Global error event
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        source: 'window',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
  }

  // Set notifications store
  setNotificationsStore(store) {
    this.notificationsStore = store
  }

  // Handle an error
  handleError(error, context = {}) {
    const errorInfo = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // Add to error log
    this.errors.unshift(errorInfo)
    if (this.errors.length > this.maxErrors) {
      this.errors.pop()
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error Handler:', errorInfo)
    }

    // Show notification if store is available and not a duplicate
    if (this.notificationsStore && context.source !== 'manual') {
      const userMessage = this.getUserMessage(error)
      this.notificationsStore.showError(userMessage, {
        title: 'Error',
        timeout: 8000
      })
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(errorInfo)
      } catch (e) {
        console.error('Error in error listener:', e)
      }
    })

    // Send to monitoring service in production
    if (!import.meta.env.DEV) {
      this.sendToMonitoring(errorInfo)
    }

    return errorInfo
  }

  // Subscribe to error events
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Get recent errors
  getErrors() {
    return [...this.errors]
  }

  // Clear error log
  clearErrors() {
    this.errors = []
  }

  // Send error to monitoring service
  sendToMonitoring(errorInfo) {
    // Placeholder for integration with services like Sentry
    // In a real app, you would send to your monitoring service here
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorInfo)
    }).catch(() => {
      // Silently fail if error reporting fails
    })
  }

  // Check if error is recoverable
  isRecoverable(error) {
    // Network errors are often recoverable
    if (error.message?.includes('fetch')) return true
    if (error.message?.includes('Network')) return true
    
    // Chunk load errors (code splitting)
    if (error.message?.includes('Failed to fetch dynamically imported module')) return true
    
    // Add more recoverable error patterns as needed
    return false
  }

  // Create user-friendly error messages
  getUserMessage(error) {
    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('Network')) {
      return 'Connection error. Please check your internet connection and try again.'
    }
    
    // Chunk load errors
    if (error.message?.includes('Failed to fetch dynamically imported module')) {
      return 'Loading error. Please refresh the page to get the latest version.'
    }
    
    // API errors
    if (error.response?.status === 401) {
      return 'Authentication required. Please log in again.'
    }
    
    if (error.response?.status === 403) {
      return 'Access denied. You don\'t have permission to perform this action.'
    }
    
    if (error.response?.status >= 500) {
      return 'Server error. Please try again later or contact support.'
    }
    
    // Default message
    return 'An unexpected error occurred. Please try again.'
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler()

// Helper function to wrap async operations with error handling
export function withErrorHandling(fn, options = {}) {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      const errorInfo = errorHandler.handleError(error, {
        function: fn.name,
        arguments: args,
        ...options
      })
      
      if (options.fallback !== undefined) {
        return options.fallback
      }
      
      throw error
    }
  }
}

// Error boundary component helper
export function createErrorBoundary(component, options = {}) {
  return {
    name: `${component.name}ErrorBoundary`,
    components: { WrappedComponent: component },
    setup() {
      return {
        hasError: false,
        error: null
      }
    },
    errorCaptured(error, instance, info) {
      this.hasError = true
      this.error = error
      errorHandler.handleError(error, { instance, info, component: component.name })
      return false
    },
    render() {
      if (this.hasError) {
        return h('div', { class: 'error-boundary-fallback' }, [
          h('p', options.fallbackMessage || 'Component failed to load'),
          options.showRetry && h('button', {
            onClick: () => {
              this.hasError = false
              this.error = null
            }
          }, 'Retry')
        ])
      }
      return h(this.$options.components.WrappedComponent, this.$attrs)
    }
  }
}