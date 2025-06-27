<template>
  <div class="loading-wrapper">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-content">
      <!-- Custom skeleton slot -->
      <slot v-if="$slots.skeleton" name="skeleton" />
      
      <!-- Auto skeleton based on type -->
      <component 
        v-else
        :is="skeletonComponent"
        v-bind="skeletonProps"
      />
      
      <!-- Loading overlay for existing content -->
      <div v-if="showOverlay" class="loading-overlay">
        <div class="loading-overlay-content">
          <v-progress-circular
            :size="overlaySize"
            :width="overlayWidth"
            :color="overlayColor"
            indeterminate
          />
          <p v-if="overlayText" class="mt-3 text-body-2">{{ overlayText }}</p>
        </div>
      </div>
    </div>
    
    <!-- Loaded Content -->
    <div 
      v-else 
      class="loaded-content"
      :class="{ 'fade-in': fadeIn }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'

// Lazy load skeleton components
const SkeletonCard = defineAsyncComponent(() => import('./skeletons/SkeletonCard.vue'))
const SkeletonList = defineAsyncComponent(() => import('./skeletons/SkeletonList.vue'))
const SkeletonTable = defineAsyncComponent(() => import('./skeletons/SkeletonTable.vue'))
const SkeletonForm = defineAsyncComponent(() => import('./skeletons/SkeletonForm.vue'))

const props = defineProps({
  loading: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: 'card', // card, list, table, form, custom
    validator: (value) => ['card', 'list', 'table', 'form', 'custom'].includes(value)
  },
  skeletonProps: {
    type: Object,
    default: () => ({})
  },
  showOverlay: {
    type: Boolean,
    default: false
  },
  overlayText: {
    type: String,
    default: ''
  },
  overlaySize: {
    type: Number,
    default: 50
  },
  overlayWidth: {
    type: Number,
    default: 4
  },
  overlayColor: {
    type: String,
    default: 'primary'
  },
  fadeIn: {
    type: Boolean,
    default: true
  },
  minHeight: {
    type: String,
    default: 'auto'
  },
  // Delay showing skeleton to avoid flash for fast operations
  delay: {
    type: Number,
    default: 0
  }
})

const isLoading = computed(() => {
  if (props.delay > 0) {
    // TODO: Implement delay logic
    return props.loading
  }
  return props.loading
})

const skeletonComponent = computed(() => {
  const components = {
    card: SkeletonCard,
    list: SkeletonList,
    table: SkeletonTable,
    form: SkeletonForm
  }
  return components[props.type] || SkeletonCard
})
</script>

<style scoped>
.loading-wrapper {
  position: relative;
  min-height: v-bind(minHeight);
}

.loading-content {
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(2px);
  z-index: 10;
}

.loading-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loaded-content {
  transition: opacity 0.3s ease;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>