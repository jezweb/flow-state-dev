<template>
  <div>
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      label="Search modules"
      clearable
      variant="outlined"
      density="compact"
      class="mb-4"
    />
    
    <v-select
      v-model="selectedCategory"
      :items="categories"
      label="Category"
      variant="outlined"
      density="compact"
      class="mb-4"
    />
    
    <v-progress-linear v-if="modulesStore.isLoading" indeterminate />
    
    <div v-else>
      <v-alert
        v-if="filteredModules.length === 0"
        type="info"
        variant="tonal"
      >
        No modules found matching your criteria
      </v-alert>
      
      <v-row v-else>
        <v-col 
          v-for="module in filteredModules" 
          :key="module.name"
          cols="12" 
          sm="6" 
          md="4"
        >
          <ModuleCard 
            :module="module"
            :selected="isSelected(module)"
            @toggle="$emit('toggle', module)"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useModulesStore } from '../stores/modules'
import ModuleCard from './ModuleCard.vue'

const props = defineProps({
  selectedModules: {
    type: Array,
    default: () => []
  }
})

defineEmits(['toggle'])

const modulesStore = useModulesStore()

// Computed
const searchQuery = computed({
  get: () => modulesStore.searchQuery,
  set: (value) => modulesStore.searchQuery = value
})

const selectedCategory = computed({
  get: () => modulesStore.selectedCategory,
  set: (value) => modulesStore.selectedCategory = value
})

const categories = computed(() => modulesStore.categories)
const filteredModules = computed(() => modulesStore.getFilteredModules())

function isSelected(module) {
  return props.selectedModules.some(m => m.name === module.name)
}

// Load modules on mount
onMounted(() => {
  if (modulesStore.modules.length === 0) {
    modulesStore.loadModules()
  }
})
</script>