<template>
  <div class="skeleton-list">
    <v-list :density="density">
      <template v-for="i in count" :key="i">
        <v-list-item>
          <template v-slot:prepend v-if="showAvatar">
            <v-skeleton-loader
              type="avatar"
              class="mr-3"
            />
          </template>
          
          <v-list-item-title>
            <v-skeleton-loader
              type="heading"
              :width="getTitleWidth(i)"
            />
          </v-list-item-title>
          
          <v-list-item-subtitle v-if="showSubtitle">
            <v-skeleton-loader
              type="text"
              :width="getSubtitleWidth(i)"
              class="mt-1"
            />
          </v-list-item-subtitle>
          
          <template v-slot:append v-if="showActions">
            <v-skeleton-loader
              type="button"
            />
          </template>
        </v-list-item>
        
        <v-divider v-if="i < count && showDividers" />
      </template>
    </v-list>
  </div>
</template>

<script setup>
const props = defineProps({
  count: {
    type: Number,
    default: 5
  },
  showAvatar: {
    type: Boolean,
    default: true
  },
  showSubtitle: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: false
  },
  showDividers: {
    type: Boolean,
    default: true
  },
  density: {
    type: String,
    default: 'default'
  },
  variant: {
    type: String,
    default: 'random' // 'random', 'uniform'
  }
})

// Create varied widths for more realistic loading appearance
function getTitleWidth(index) {
  if (props.variant === 'uniform') return '70%'
  
  const widths = ['85%', '65%', '75%', '90%', '60%', '80%', '70%']
  return widths[index % widths.length]
}

function getSubtitleWidth(index) {
  if (props.variant === 'uniform') return '50%'
  
  const widths = ['60%', '45%', '55%', '70%', '40%', '65%', '50%']
  return widths[index % widths.length]
}
</script>

<style scoped>
.skeleton-list {
  transition: opacity 0.3s ease;
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