<template>
  <div>
    <v-list>
      <v-list-item>
        <v-list-item-title>Project Name</v-list-item-title>
        <v-list-item-subtitle class="text-h6">{{ projectName }}</v-list-item-subtitle>
      </v-list-item>
      
      <v-divider class="my-2" />
      
      <v-list-item>
        <v-list-item-title>Stack Configuration</v-list-item-title>
        <v-list-item-subtitle>
          <div v-if="selectedPreset" class="mt-2">
            <v-chip color="primary" variant="tonal">
              <v-icon start>mdi-package-variant</v-icon>
              {{ selectedPreset.name }}
            </v-chip>
          </div>
          
          <div v-else-if="selectedModules.length > 0" class="mt-2">
            <p class="text-caption mb-2">Custom Stack ({{ selectedModules.length }} modules)</p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip 
                v-for="module in selectedModules" 
                :key="module.name"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ module.displayName || module.name }}
              </v-chip>
            </div>
          </div>
          
          <div v-else class="mt-2 text-error">
            No stack selected
          </div>
        </v-list-item-subtitle>
      </v-list-item>
      
      <v-divider class="my-2" />
      
      <v-list-item>
        <v-list-item-title>What will be created</v-list-item-title>
        <v-list-item-subtitle>
          <ul class="mt-2">
            <li>Project directory: <code>{{ projectName }}</code></li>
            <li>Git repository will be initialized</li>
            <li>Dependencies will be installed</li>
            <li v-if="hasSupabase">Supabase configuration files</li>
            <li v-if="hasVue">Vue 3 application with Vite</li>
            <li v-if="hasReact">React application with Vite</li>
            <li v-if="hasSvelteKit">SvelteKit application</li>
          </ul>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  projectName: String,
  selectedPreset: Object,
  selectedModules: {
    type: Array,
    default: () => []
  }
})

// Computed properties to check for specific modules
const allModules = computed(() => {
  if (props.selectedPreset) {
    return props.selectedPreset.modules || []
  }
  return props.selectedModules.map(m => m.name)
})

const hasSupabase = computed(() => 
  allModules.value.some(m => m.includes('supabase'))
)

const hasVue = computed(() => 
  allModules.value.some(m => m.includes('vue'))
)

const hasReact = computed(() => 
  allModules.value.some(m => m.includes('react'))
)

const hasSvelteKit = computed(() => 
  allModules.value.some(m => m.includes('sveltekit'))
)
</script>

<style scoped>
code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}
</style>