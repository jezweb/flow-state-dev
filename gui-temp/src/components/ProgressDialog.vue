<template>
  <v-dialog 
    :model-value="modelValue" 
    persistent
    max-width="600"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon 
          v-if="!result"
          class="mr-2 rotating" 
          color="primary"
        >
          mdi-cog
        </v-icon>
        <v-icon 
          v-else-if="result.success"
          class="mr-2" 
          color="success"
        >
          mdi-check-circle
        </v-icon>
        <v-icon 
          v-else
          class="mr-2" 
          color="error"
        >
          mdi-alert-circle
        </v-icon>
        
        {{ title }}
      </v-card-title>
      
      <v-card-text>
        <!-- Enhanced Progress with ProgressIndicator -->
        <ProgressIndicator
          v-if="!result && progress.length > 0"
          type="stepper"
          :steps="progressSteps"
          :current-step="currentProgressStep"
          show-text
          :title="currentStepTitle"
          :subtitle="currentStepSubtitle"
        />
        
        <!-- Fallback timeline for completed/result state -->
        <v-timeline 
          v-else-if="progress.length > 0"
          density="compact"
          side="end"
        >
          <v-timeline-item
            v-for="(step, index) in progress"
            :key="index"
            :dot-color="getDotColor(step)"
            size="small"
          >
            <div class="text-body-2">
              {{ step.message }}
            </div>
            <div class="text-caption text-grey">
              {{ formatTime(step.timestamp) }}
            </div>
          </v-timeline-item>
        </v-timeline>
        
        <!-- Result display -->
        <div v-if="result" class="mt-4">
          <v-alert 
            :type="result.success ? 'success' : 'error'"
            variant="tonal"
          >
            <div v-if="result.success">
              Project created successfully!
              <div class="text-caption mt-2">
                Duration: {{ result.duration }}ms
              </div>
            </div>
            <div v-else>
              {{ result.error || 'Project creation failed' }}
            </div>
          </v-alert>
          
          <!-- Next steps -->
          <div v-if="result.success && result.nextSteps" class="mt-4">
            <h4 class="text-subtitle-1 mb-2">Next Steps:</h4>
            <ol class="pl-4">
              <li v-for="(step, index) in result.nextSteps" :key="index" class="mb-2">
                <code>{{ step.command }}</code>
                <div class="text-caption text-grey">{{ step.description }}</div>
              </li>
            </ol>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="!result"
          color="primary"
          variant="flat"
          @click="$emit('close')"
        >
          {{ result?.success ? 'Start New Project' : 'Close' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import ProgressIndicator from './ProgressIndicator.vue'

const props = defineProps({
  modelValue: Boolean,
  progress: {
    type: Array,
    default: () => []
  },
  result: Object
})

defineEmits(['update:modelValue', 'close'])

const title = computed(() => {
  if (!props.result) return 'Creating Project...'
  return props.result.success ? 'Project Created!' : 'Creation Failed'
})

// Convert progress steps for ProgressIndicator
const progressSteps = computed(() => {
  if (!props.progress.length) return []
  
  return props.progress.map((step, index) => ({
    value: index + 1,
    title: step.step || step.message,
    subtitle: step.message !== step.step ? step.message : ''
  }))
})

const currentProgressStep = computed(() => {
  return Math.min(props.progress.length, progressSteps.value.length)
})

const currentStepTitle = computed(() => {
  if (!props.progress.length) return ''
  const current = props.progress[props.progress.length - 1]
  return current.step || current.message
})

const currentStepSubtitle = computed(() => {
  if (!props.progress.length) return ''
  const current = props.progress[props.progress.length - 1]
  return current.message !== current.step ? current.message : ''
})

function getDotColor(step) {
  if (step.type === 'error') return 'error'
  if (step.type === 'warning') return 'warning'
  if (step.type === 'step:complete') return 'success'
  return 'primary'
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: rotate 2s linear infinite;
}

code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}
</style>