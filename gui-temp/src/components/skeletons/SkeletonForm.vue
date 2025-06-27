<template>
  <div class="skeleton-form">
    <v-form>
      <template v-for="i in fieldCount" :key="i">
        <div class="mb-4">
          <!-- Field Label -->
          <v-skeleton-loader
            type="text"
            :width="getLabelWidth(i)"
            class="mb-2"
          />
          
          <!-- Field Input -->
          <v-skeleton-loader
            :type="getFieldType(i)"
            width="100%"
            height="56px"
          />
          
          <!-- Help Text -->
          <v-skeleton-loader
            v-if="showHelpText && Math.random() > 0.5"
            type="text"
            :width="getHelpWidth(i)"
            class="mt-1"
          />
        </div>
      </template>
      
      <!-- Form Actions -->
      <div v-if="showActions" class="mt-6">
        <v-skeleton-loader
          type="button, button"
          class="d-flex justify-end ga-2"
        />
      </div>
    </v-form>
  </div>
</template>

<script setup>
const props = defineProps({
  fieldCount: {
    type: Number,
    default: 5
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showHelpText: {
    type: Boolean,
    default: true
  },
  fieldTypes: {
    type: Array,
    default: () => ['text-field', 'text-field', 'select', 'text-field', 'textarea']
  }
})

function getLabelWidth(index) {
  const widths = ['120px', '80px', '150px', '100px', '130px', '90px']
  return widths[index % widths.length]
}

function getFieldType(index) {
  if (props.fieldTypes[index - 1]) {
    return props.fieldTypes[index - 1]
  }
  
  const types = ['text-field', 'text-field', 'select', 'textarea', 'text-field']
  return types[index % types.length]
}

function getHelpWidth(index) {
  const widths = ['200px', '180px', '220px', '160px', '240px']
  return widths[index % widths.length]
}
</script>

<style scoped>
.skeleton-form {
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