<template>
  <v-card :elevation="elevation" :class="cardClass">
    <v-card-title v-if="showTitle">
      <v-skeleton-loader
        type="heading"
        :width="titleWidth"
      />
    </v-card-title>
    
    <v-card-subtitle v-if="showSubtitle">
      <v-skeleton-loader
        type="subtitle"
        :width="subtitleWidth"
      />
    </v-card-subtitle>
    
    <v-card-text v-if="showContent">
      <v-skeleton-loader
        :type="contentType"
        :loading="true"
      />
    </v-card-text>
    
    <v-card-actions v-if="showActions">
      <v-skeleton-loader
        type="button, button"
        class="ml-auto"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  },
  showSubtitle: {
    type: Boolean,
    default: false
  },
  showContent: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  titleWidth: {
    type: [String, Number],
    default: '60%'
  },
  subtitleWidth: {
    type: [String, Number],
    default: '40%'
  },
  contentType: {
    type: String,
    default: 'paragraph@3'
  },
  elevation: {
    type: Number,
    default: 1
  },
  flat: {
    type: Boolean,
    default: false
  }
})

const cardClass = computed(() => ({
  'skeleton-card': true,
  'v-card--flat': props.flat
}))
</script>

<style scoped>
.skeleton-card {
  transition: all 0.3s ease;
}

:deep(.v-skeleton-loader__bone) {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-surface-variant), 0.8) 25%, 
    rgba(var(--v-theme-surface-variant), 0.4) 50%, 
    rgba(var(--v-theme-surface-variant), 0.8) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>