<template>
  <ErrorBoundary
    :show-details="false"
    :fallback="fallbackMessage"
    @error="handleError"
    @reset="handleReset"
  >
    <Suspense>
      <template #default>
        <slot />
      </template>
      <template #fallback>
        <v-container>
          <v-row justify="center" align="center" :style="{ minHeight: minHeight }">
            <v-col cols="auto">
              <div class="text-center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  :size="loaderSize"
                />
                <p class="mt-3 text-body-2 text-medium-emphasis">{{ loadingMessage }}</p>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </Suspense>
  </ErrorBoundary>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import ErrorBoundary from './ErrorBoundary.vue'

const props = defineProps({
  fallbackMessage: {
    type: String,
    default: 'Failed to load component. Please try again.'
  },
  loadingMessage: {
    type: String,
    default: 'Loading...'
  },
  minHeight: {
    type: String,
    default: '200px'
  },
  loaderSize: {
    type: Number,
    default: 40
  }
})

const emit = defineEmits(['error', 'reset'])

function handleError(errorInfo) {
  console.error('Async component error:', errorInfo)
  emit('error', errorInfo)
}

function handleReset() {
  emit('reset')
}
</script>