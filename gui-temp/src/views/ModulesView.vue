<template>
  <v-container>
    <h1 class="text-h3 mb-6">Module Explorer</h1>
    
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>Filters</v-card-title>
          <v-card-text>
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
            />
            
            <v-divider class="my-4" />
            
            <div class="text-caption text-grey mb-2">
              Total Modules: {{ totalModules }}
            </div>
            <div class="text-caption text-grey">
              Showing: {{ filteredCount }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="9">
        <LoadingWrapper 
          :loading="modulesStore.isLoading"
          type="list"
          :skeleton-props="{ count: 6, showAvatar: true, showSubtitle: true }"
        >
          <v-alert
            v-if="modulesStore.error"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ modulesStore.error }}
          </v-alert>
        
        <div v-else>
          <div 
            v-for="(modules, category) in groupedModules" 
            :key="category"
            class="mb-6"
          >
            <h3 class="text-h5 mb-3">
              {{ formatCategory(category) }}
              <span class="text-caption text-grey">({{ modules.length }})</span>
            </h3>
            
            <v-row>
              <v-col 
                v-for="module in modules" 
                :key="module.name"
                cols="12" 
                sm="6" 
                lg="4"
              >
                <ModuleDetailCard :module="module" />
              </v-col>
            </v-row>
          </div>
        </div>
        </LoadingWrapper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useModulesStore } from '../stores/modules'
import ModuleDetailCard from '../components/ModuleDetailCard.vue'
import LoadingWrapper from '../components/LoadingWrapper.vue'

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
const groupedModules = computed(() => modulesStore.getModulesByCategory())
const totalModules = computed(() => modulesStore.modules.length)
const filteredCount = computed(() => {
  const filtered = modulesStore.getFilteredModules()
  return filtered.length
})

function formatCategory(category) {
  if (!category) return 'Other'
  return category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Load modules on mount
onMounted(() => {
  modulesStore.loadModules()
})
</script>