<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate />
    
    <v-row v-else>
      <v-col 
        v-for="preset in presets" 
        :key="preset.id"
        cols="12" 
        md="6"
      >
        <v-card 
          :variant="isSelected(preset) ? 'elevated' : 'outlined'"
          :color="isSelected(preset) ? 'primary' : undefined"
          class="h-100 cursor-pointer"
          @click="$emit('select', preset)"
        >
          <v-card-title class="d-flex align-center">
            <v-icon 
              v-if="preset.recommended" 
              start 
              color="warning"
            >
              mdi-star
            </v-icon>
            {{ preset.name }}
          </v-card-title>
          
          <v-card-subtitle>
            {{ preset.useCase }}
          </v-card-subtitle>
          
          <v-card-text>
            <p class="mb-3">{{ preset.description }}</p>
            
            <div class="d-flex flex-wrap ga-2">
              <v-chip 
                v-for="module in preset.modules" 
                :key="module"
                size="small"
                :color="isSelected(preset) ? 'white' : 'primary'"
                :variant="isSelected(preset) ? 'flat' : 'tonal'"
              >
                {{ module }}
              </v-chip>
            </div>
            
            <div class="mt-3">
              <v-chip 
                size="small" 
                :color="getDifficultyColor(preset.difficulty)"
                variant="tonal"
              >
                {{ preset.difficulty }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useProjectStore } from '../stores/project'

const props = defineProps({
  presets: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

defineEmits(['select'])

const projectStore = useProjectStore()

function isSelected(preset) {
  return projectStore.selectedPreset?.id === preset.id
}

function getDifficultyColor(difficulty) {
  const colors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'error'
  }
  return colors[difficulty] || 'grey'
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>