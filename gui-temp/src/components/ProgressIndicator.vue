<template>
  <div class="progress-indicator">
    <!-- Linear Progress -->
    <v-progress-linear
      v-if="type === 'linear'"
      :model-value="progress"
      :indeterminate="indeterminate"
      :color="color"
      :height="height"
      :striped="striped"
      :rounded="rounded"
      class="mb-2"
    />
    
    <!-- Circular Progress -->
    <v-progress-circular
      v-else-if="type === 'circular'"
      :model-value="progress"
      :indeterminate="indeterminate"
      :color="color"
      :size="size"
      :width="width"
      :rotate="rotate"
    />
    
    <!-- Step Progress -->
    <v-stepper
      v-else-if="type === 'stepper'"
      :model-value="currentStep"
      :items="steps"
      hide-actions
      :elevation="0"
      class="step-progress"
    >
      <template v-for="step in steps" :key="step.value" v-slot:[`item.${step.value}`]>
        <div class="step-content">
          <div class="step-icon">
            <v-icon 
              v-if="getStepStatus(step.value) === 'completed'"
              icon="mdi-check"
              color="success"
            />
            <v-icon 
              v-else-if="getStepStatus(step.value) === 'current'"
              icon="mdi-clock-outline"
              color="primary"
            />
            <span v-else class="step-number">{{ step.value }}</span>
          </div>
          <div class="step-details">
            <div class="step-title">{{ step.title }}</div>
            <div v-if="step.subtitle" class="step-subtitle">{{ step.subtitle }}</div>
          </div>
        </div>
      </template>
    </v-stepper>
    
    <!-- Progress Text -->
    <div v-if="showText" class="progress-text">
      <div v-if="title" class="progress-title">{{ title }}</div>
      <div v-if="subtitle" class="progress-subtitle">{{ subtitle }}</div>
      <div v-if="showPercentage && !indeterminate" class="progress-percentage">
        {{ Math.round(progress) }}%
      </div>
      <div v-if="estimatedTime" class="progress-time">
        <v-icon icon="mdi-clock-outline" size="small" class="mr-1" />
        {{ formatTime(estimatedTime) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'linear', // linear, circular, stepper
    validator: (value) => ['linear', 'circular', 'stepper'].includes(value)
  },
  progress: {
    type: Number,
    default: 0
  },
  indeterminate: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'primary'
  },
  // Linear progress props
  height: {
    type: Number,
    default: 4
  },
  striped: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  },
  // Circular progress props
  size: {
    type: Number,
    default: 50
  },
  width: {
    type: Number,
    default: 4
  },
  rotate: {
    type: Number,
    default: -90
  },
  // Stepper progress props
  steps: {
    type: Array,
    default: () => []
  },
  currentStep: {
    type: Number,
    default: 1
  },
  // Text props
  showText: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  showPercentage: {
    type: Boolean,
    default: false
  },
  estimatedTime: {
    type: Number, // seconds
    default: null
  }
})

function getStepStatus(stepValue) {
  if (stepValue < props.currentStep) return 'completed'
  if (stepValue === props.currentStep) return 'current'
  return 'pending'
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}
</script>

<style scoped>
.progress-indicator {
  width: 100%;
}

.step-progress {
  background: transparent !important;
}

.step-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-surface-variant), 1);
  color: var(--v-theme-on-surface-variant);
}

.step-number {
  font-weight: 600;
  font-size: 14px;
}

.step-details {
  flex: 1;
}

.step-title {
  font-weight: 500;
  color: var(--v-theme-on-surface);
}

.step-subtitle {
  font-size: 0.875rem;
  color: var(--v-theme-on-surface-variant);
  margin-top: 2px;
}

.progress-text {
  margin-top: 8px;
  text-align: center;
}

.progress-title {
  font-weight: 500;
  color: var(--v-theme-on-surface);
}

.progress-subtitle {
  font-size: 0.875rem;
  color: var(--v-theme-on-surface-variant);
  margin-top: 2px;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--v-theme-primary);
  margin: 8px 0;
}

.progress-time {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: var(--v-theme-on-surface-variant);
}
</style>