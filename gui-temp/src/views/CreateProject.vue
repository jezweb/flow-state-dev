<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <h1 class="text-h3 mb-6">Create New Project</h1>
        
        <v-stepper v-model="step" :items="stepItems">
          <!-- Step 1: Project Name -->
          <template v-slot:item.1>
            <v-card flat>
              <v-card-title>Project Details</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="projectStore.projectName"
                  label="Project Name"
                  placeholder="my-awesome-app"
                  :rules="[rules.required, rules.projectName]"
                  hint="Lowercase letters, numbers, and hyphens only"
                  persistent-hint
                  variant="outlined"
                />
              </v-card-text>
            </v-card>
          </template>
          
          <!-- Step 2: Stack Selection -->
          <template v-slot:item.2>
            <v-card flat>
              <v-card-title>Choose Your Stack</v-card-title>
              <v-card-text>
                <v-tabs v-model="stackTab" class="mb-4">
                  <v-tab value="presets">Use Preset</v-tab>
                  <v-tab value="custom">Custom Stack</v-tab>
                </v-tabs>
                
                <v-window v-model="stackTab">
                  <!-- Presets Tab -->
                  <v-window-item value="presets">
                    <LoadingWrapper 
                      :loading="presetsLoading"
                      type="card"
                      :skeleton-props="{ showTitle: true, showContent: true, showActions: false, contentType: 'paragraph@2' }"
                    >
                      <PresetSelector 
                        :presets="presets" 
                        :loading="presetsLoading"
                        @select="projectStore.selectPreset"
                      />
                    </LoadingWrapper>
                  </v-window-item>
                  
                  <!-- Custom Stack Tab -->
                  <v-window-item value="custom">
                    <ModuleSelector 
                      :selected-modules="projectStore.selectedModules"
                      @toggle="projectStore.toggleModule"
                    />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </template>
          
          <!-- Step 3: Review & Create -->
          <template v-slot:item.3>
            <v-card flat>
              <v-card-title>Review & Create</v-card-title>
              <v-card-text>
                <ProjectReview 
                  :project-name="projectStore.projectName"
                  :selected-preset="projectStore.selectedPreset"
                  :selected-modules="projectStore.selectedModules"
                />
                
                <v-alert
                  v-if="projectStore.error"
                  type="error"
                  class="mt-4"
                  closable
                  @click:close="projectStore.error = null"
                >
                  {{ projectStore.error }}
                </v-alert>
                
                <div class="d-flex justify-end mt-6">
                  <v-btn
                    color="primary"
                    size="large"
                    :loading="projectStore.isCreating"
                    :disabled="!canCreate"
                    @click="handleCreate"
                  >
                    Create Project
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-stepper>
        
        <!-- Progress Dialog -->
        <ProgressDialog 
          v-model="showProgress"
          :progress="projectStore.creationProgress"
          :result="creationResult"
          @close="handleProgressClose"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import { getPresets } from '../services/flowStateApi'
import PresetSelector from '../components/PresetSelector.vue'
import ModuleSelector from '../components/ModuleSelector.vue'
import ProjectReview from '../components/ProjectReview.vue'
import ProgressDialog from '../components/ProgressDialog.vue'
import LoadingWrapper from '../components/LoadingWrapper.vue'

const projectStore = useProjectStore()

// Step control
const step = ref(1)
const stepItems = ['Project Details', 'Choose Stack', 'Review & Create']

// Stack selection
const stackTab = ref('presets')
const presets = ref([])
const presetsLoading = ref(false)

// Progress tracking
const showProgress = ref(false)
const creationResult = ref(null)

// Validation rules
const rules = {
  required: v => !!v || 'Required',
  projectName: v => /^[a-z0-9-]+$/.test(v) || 'Invalid project name format'
}

// Computed
const canCreate = computed(() => 
  projectStore.projectName && 
  rules.projectName(projectStore.projectName) === true &&
  projectStore.hasSelection
)

// Load presets on mount
onMounted(async () => {
  presetsLoading.value = true
  try {
    presets.value = await getPresets()
  } catch (error) {
    console.error('Failed to load presets:', error)
    // Show user-friendly error notification
    projectStore.setError('Failed to load project presets. Please try refreshing the page.')
  } finally {
    presetsLoading.value = false
  }
})

// Create project
async function handleCreate() {
  showProgress.value = true
  creationResult.value = null
  
  try {
    const result = await projectStore.createProject()
    creationResult.value = result
  } catch (error) {
    // Error is already handled in store
    console.error('Project creation failed:', error)
  }
}

function handleProgressClose() {
  showProgress.value = false
  if (creationResult.value?.success) {
    // Reset and go back to start
    projectStore.resetProject()
    step.value = 1
    creationResult.value = null
  }
}
</script>