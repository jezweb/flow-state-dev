import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getModules as apiGetModules } from '../services/flowStateApi'
import { useDelayedLoading, loadingPresets } from '../composables/useDelayedLoading'

export const useModulesStore = defineStore('modules', () => {
  // State
  const modules = ref([])
  const categories = ref([])
  const error = ref(null)
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  
  // Loading management
  const { loading: isLoading, withDelayedLoading } = useDelayedLoading()
  
  // Actions
  async function loadModules() {
    return withDelayedLoading(async () => {
      error.value = null
      
      const allModules = await apiGetModules()
      modules.value = allModules
      
      // Extract unique categories
      const uniqueCategories = new Set()
      allModules.forEach(module => {
        if (module.category) {
          uniqueCategories.add(module.category)
        }
      })
      
      categories.value = [
        { value: 'all', title: 'All Modules' },
        ...Array.from(uniqueCategories).map(cat => ({
          value: cat,
          title: cat.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        }))
      ]
    }, loadingPresets.api)
  }
  
  function getFilteredModules() {
    let filtered = modules.value
    
    // Filter by category
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory.value)
    }
    
    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return filtered
  }
  
  function getModulesByCategory() {
    const grouped = {}
    
    getFilteredModules().forEach(module => {
      const category = module.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(module)
    })
    
    return grouped
  }
  
  return {
    // State
    modules,
    categories,
    isLoading,
    error,
    selectedCategory,
    searchQuery,
    
    // Actions
    loadModules,
    getFilteredModules,
    getModulesByCategory
  }
})