import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createProject as apiCreateProject } from '../services/flowStateApi'

export const useProjectStore = defineStore('project', () => {
  // State
  const projectName = ref('')
  const selectedPreset = ref(null)
  const selectedModules = ref([])
  const creationProgress = ref([])
  const isCreating = ref(false)
  const error = ref(null)
  
  // Computed
  const hasSelection = computed(() => 
    selectedPreset.value || selectedModules.value.length > 0
  )
  
  // Actions
  function resetProject() {
    projectName.value = ''
    selectedPreset.value = null
    selectedModules.value = []
    creationProgress.value = []
    error.value = null
  }
  
  function selectPreset(preset) {
    selectedPreset.value = preset
    selectedModules.value = []
  }
  
  function toggleModule(module) {
    selectedPreset.value = null
    const index = selectedModules.value.findIndex(m => m.name === module.name)
    if (index >= 0) {
      selectedModules.value.splice(index, 1)
    } else {
      selectedModules.value.push(module)
    }
  }
  
  async function createProject() {
    isCreating.value = true
    error.value = null
    creationProgress.value = []
    
    // Define progress handler outside try block for cleanup access
    const progressHandler = (event) => {
      const data = event.detail
      creationProgress.value.push({
        step: data.step || data.type,
        message: data.message,
        timestamp: Date.now()
      })
    }
    
    try {
      // Set up progress tracking via event listener
      window.addEventListener('project-progress', progressHandler)
      
      // Prepare options
      const options = {
        preset: selectedPreset.value?.id,
        modules: selectedModules.value.map(m => m.name)
      }
      
      // Create the project
      const result = await apiCreateProject(projectName.value, options)
      
      if (result.success) {
        return result
      } else {
        throw new Error(result.error || 'Project creation failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isCreating.value = false
      // Clean up event listener
      window.removeEventListener('project-progress', progressHandler)
    }
  }
  
  // Error handling
  function setError(message) {
    error.value = message
  }
  
  function clearError() {
    error.value = null
  }
  
  return {
    // State
    projectName,
    selectedPreset,
    selectedModules,
    creationProgress,
    isCreating,
    error,
    
    // Computed
    hasSelection,
    
    // Actions
    resetProject,
    selectPreset,
    toggleModule,
    createProject,
    setError,
    clearError
  }
})