<template>
  <v-card 
    :variant="selected ? 'elevated' : 'outlined'"
    :color="selected ? 'primary' : undefined"
    class="h-100 cursor-pointer module-card"
    @click="$emit('toggle')"
  >
    <v-card-title class="d-flex align-center">
      <v-checkbox
        :model-value="selected"
        hide-details
        density="compact"
        class="flex-grow-0 mr-2"
        @click.stop="$emit('toggle')"
      />
      {{ module.displayName || module.name }}
    </v-card-title>
    
    <v-card-subtitle>
      {{ formatCategory(module.category) }}
    </v-card-subtitle>
    
    <v-card-text>
      <p class="text-body-2 mb-2">{{ module.description }}</p>
      
      <div v-if="module.tags?.length" class="d-flex flex-wrap ga-1">
        <v-chip 
          v-for="tag in module.tags" 
          :key="tag"
          size="x-small"
          :color="selected ? 'white' : 'default'"
          :variant="selected ? 'flat' : 'tonal'"
        >
          {{ tag }}
        </v-chip>
      </div>
      
      <div class="mt-2 text-caption">
        v{{ module.version }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  module: {
    type: Object,
    required: true
  },
  selected: Boolean
})

defineEmits(['toggle'])

function formatCategory(category) {
  if (!category) return 'Other'
  return category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.module-card {
  transition: all 0.2s ease;
}

.module-card:hover {
  transform: translateY(-2px);
}
</style>