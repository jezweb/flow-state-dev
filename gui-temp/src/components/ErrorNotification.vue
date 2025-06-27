<template>
  <v-snackbar
    v-model="show"
    :timeout="timeout"
    :color="color"
    location="top"
    variant="flat"
  >
    <div class="d-flex align-center">
      <v-icon :icon="icon" class="mr-3" />
      <div>
        <div class="font-weight-medium">{{ title }}</div>
        <div v-if="message" class="text-caption">{{ message }}</div>
      </div>
    </div>
    
    <template v-slot:actions>
      <v-btn
        v-if="showRetry && onRetry"
        variant="text"
        @click="handleRetry"
      >
        Retry
      </v-btn>
      <v-btn
        variant="text"
        @click="show = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { errorHandler } from '../utils/errorHandler'

const props = defineProps({
  error: {
    type: Error,
    default: null
  },
  title: {
    type: String,
    default: 'An error occurred'
  },
  message: {
    type: String,
    default: ''
  },
  timeout: {
    type: Number,
    default: 6000
  },
  color: {
    type: String,
    default: 'error'
  },
  icon: {
    type: String,
    default: 'mdi-alert-circle'
  },
  showRetry: {
    type: Boolean,
    default: false
  },
  onRetry: {
    type: Function,
    default: null
  }
})

const show = ref(false)

// Watch for error changes
watch(() => props.error, (newError) => {
  if (newError) {
    show.value = true
    
    // Use error handler to get user-friendly message if no message provided
    if (!props.message && newError instanceof Error) {
      const userMessage = errorHandler.getUserMessage(newError)
      if (userMessage !== props.message) {
        // Update parent component about the user-friendly message
        console.log('User-friendly message:', userMessage)
      }
    }
  }
})

function handleRetry() {
  show.value = false
  if (props.onRetry) {
    props.onRetry()
  }
}

// Export show function for programmatic use
defineExpose({
  show: () => { show.value = true },
  hide: () => { show.value = false }
})
</script>