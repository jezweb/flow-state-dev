<template>
  <div v-if="hasError" class="error-boundary">
    <v-container>
      <v-row justify="center" align="center" style="min-height: 400px;">
        <v-col cols="12" md="8" lg="6">
          <v-card elevation="4" class="pa-6">
            <v-card-title class="text-h5 text-center">
              <v-icon icon="mdi-alert-circle" color="error" size="x-large" class="mr-3" />
              Oops! Something went wrong
            </v-card-title>
            
            <v-card-text>
              <v-alert
                type="error"
                variant="tonal"
                class="mb-4"
              >
                {{ errorMessage }}
              </v-alert>
              
              <div v-if="showDetails" class="mt-4">
                <v-expansion-panels>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <v-icon icon="mdi-bug" class="mr-2" />
                      Error Details
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <pre class="error-stack">{{ errorStack }}</pre>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-card-text>
            
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="secondary"
                variant="text"
                @click="reportError"
                prepend-icon="mdi-bug-outline"
              >
                Report Issue
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                @click="resetError"
                prepend-icon="mdi-refresh"
              >
                Try Again
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured, defineProps, defineEmits } from 'vue'

const props = defineProps({
  fallback: {
    type: String,
    default: 'An unexpected error occurred. Please try refreshing the page.'
  },
  showDetails: {
    type: Boolean,
    default: import.meta.env.DEV // Show details in development only
  },
  onError: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['error', 'reset'])

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const errorInfo = ref(null)

// Capture errors from child components
onErrorCaptured((error, instance, info) => {
  console.error('Error caught by boundary:', error)
  
  hasError.value = true
  errorMessage.value = error.message || props.fallback
  errorStack.value = error.stack || 'No stack trace available'
  errorInfo.value = { error, instance, info }
  
  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error, instance, info)
  }
  
  // Emit error event
  emit('error', { error, instance, info })
  
  // Log to error reporting service in production
  if (!import.meta.env.DEV) {
    logErrorToService(error, instance, info)
  }
  
  // Prevent the error from propagating
  return false
})

function resetError() {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  errorInfo.value = null
  emit('reset')
}

function reportError() {
  const issueBody = encodeURIComponent(`
## Error Report

**Error Message:** ${errorMessage.value}

**Stack Trace:**
\`\`\`
${errorStack.value}
\`\`\`

**Environment:**
- Browser: ${navigator.userAgent}
- URL: ${window.location.href}
- Time: ${new Date().toISOString()}
`)
  
  window.open(
    `https://github.com/jezweb/flow-state-dev/issues/new?title=GUI%20Error%3A%20${encodeURIComponent(errorMessage.value)}&body=${issueBody}&labels=bug,component:frontend`,
    '_blank'
  )
}

function logErrorToService(error, instance, info) {
  // In production, send to error monitoring service
  // This is a placeholder for services like Sentry, LogRocket, etc.
  console.error('Production error:', {
    message: error.message,
    stack: error.stack,
    component: instance?.$options.name || 'Unknown',
    info: info,
    url: window.location.href,
    timestamp: new Date().toISOString()
  })
}
</script>

<style scoped>
.error-boundary {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-stack {
  font-size: 0.875rem;
  overflow-x: auto;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
}

:deep(.v-theme--dark) .error-stack {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>