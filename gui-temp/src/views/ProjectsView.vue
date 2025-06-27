<template>
  <v-container>
    <v-row align="center" justify="space-between" class="mb-6">
      <v-col cols="auto">
        <h1 class="text-h3">My Projects</h1>
      </v-col>
      <v-col cols="auto">
        <LoadingButton
          color="primary"
          variant="flat"
          @click="scanProjects"
          :loading="isScanning"
          loading-text="Scanning..."
          prepend-icon="mdi-refresh"
        >
          Scan for Projects
        </LoadingButton>
      </v-col>
    </v-row>
    
    <!-- Search and Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search projects"
          clearable
          variant="outlined"
          density="compact"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="frameworkFilter"
          :items="frameworkOptions"
          label="Framework"
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          density="compact"
        >
          <v-btn value="grid" icon="mdi-view-grid" />
          <v-btn value="list" icon="mdi-view-list" />
        </v-btn-toggle>
      </v-col>
    </v-row>
    
    <!-- Loading and Content -->
    <LoadingWrapper 
      :loading="isLoading"
      :type="viewMode === 'grid' ? 'card' : 'table'"
      :skeleton-props="viewMode === 'grid' ? 
        { count: 6, showTitle: true, showContent: true, showActions: true } : 
        { rows: 8, columns: [
          { key: 'name', title: 'Name', type: 'text' },
          { key: 'framework', title: 'Framework', type: 'chip' },
          { key: 'lastModified', title: 'Last Modified', type: 'text' },
          { key: 'actions', title: 'Actions', type: 'button' }
        ]}"
    >
      <!-- Error State -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        closable
        class="mb-4"
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>
      
      <!-- Empty State -->
      <v-card v-if="filteredProjects.length === 0" class="text-center py-12">
        <v-icon size="64" color="grey" class="mb-4">mdi-folder-open-outline</v-icon>
        <h3 class="text-h5 mb-2">No projects found</h3>
        <p class="text-grey mb-4">
          {{ searchQuery || frameworkFilter ? 'Try adjusting your filters' : 'Click "Scan for Projects" to discover your Flow State Dev projects' }}
        </p>
        <LoadingButton
          v-if="!searchQuery && !frameworkFilter"
          color="primary"
          @click="scanProjects"
          :loading="isScanning"
          loading-text="Scanning..."
        >
          Scan for Projects
        </LoadingButton>
      </v-card>
      
      <!-- Projects Grid View -->
      <v-row v-else-if="viewMode === 'grid'">
      <v-col
        v-for="project in filteredProjects"
        :key="project.path"
        cols="12"
        sm="6"
        lg="4"
      >
        <ProjectCard
          :project="project"
          @open="openProject"
          @run="runCommand"
          @refresh="refreshProject"
        />
      </v-col>
    </v-row>
    
      <!-- Projects List View -->
      <v-list v-else>
        <ProjectListItem
          v-for="project in filteredProjects"
          :key="project.path"
          :project="project"
          @open="openProject"
          @run="runCommand"
          @refresh="refreshProject"
        />
      </v-list>
    </LoadingWrapper>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getProjects, 
  scanProjects as apiScanProjects,
  openProject as apiOpenProject,
  runProjectCommand,
  getProjectHealth
} from '../services/flowStateApi'
import ProjectCard from '../components/ProjectCard.vue'
import ProjectListItem from '../components/ProjectListItem.vue'
import LoadingWrapper from '../components/LoadingWrapper.vue'
import LoadingButton from '../components/LoadingButton.vue'

const router = useRouter()

// State
const projects = ref([])
const isLoading = ref(false)
const isScanning = ref(false)
const error = ref(null)
const searchQuery = ref('')
const frameworkFilter = ref(null)
const viewMode = ref('grid')

// Computed
const frameworkOptions = computed(() => {
  const frameworks = new Set()
  projects.value.forEach(p => {
    if (p.framework?.name) {
      frameworks.add(p.framework.name)
    }
  })
  
  return Array.from(frameworks).map(f => ({
    title: f.charAt(0).toUpperCase() + f.slice(1),
    value: f
  }))
})

const filteredProjects = computed(() => {
  let filtered = projects.value
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.displayName.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.path.toLowerCase().includes(query)
    )
  }
  
  // Apply framework filter
  if (frameworkFilter.value) {
    filtered = filtered.filter(p => p.framework?.name === frameworkFilter.value)
  }
  
  // Sort by last modified
  return filtered.sort((a, b) => 
    new Date(b.lastModified) - new Date(a.lastModified)
  )
})

// Methods
async function loadProjects() {
  isLoading.value = true
  error.value = null
  
  try {
    projects.value = await getProjects()
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

async function scanProjects() {
  isScanning.value = true
  error.value = null
  
  try {
    const scannedProjects = await apiScanProjects()
    projects.value = scannedProjects
  } catch (err) {
    error.value = err.message
  } finally {
    isScanning.value = false
  }
}

async function openProject(project, editor) {
  try {
    const result = await apiOpenProject(project.path, { editor })
    if (!result.success) {
      error.value = result.error || 'Failed to open project'
    }
  } catch (err) {
    error.value = err.message
  }
}

async function runCommand(project, command) {
  try {
    const result = await runProjectCommand(project.path, command)
    if (!result.success) {
      error.value = result.error || 'Command failed'
    }
  } catch (err) {
    error.value = err.message
  }
}

async function refreshProject(project) {
  try {
    const health = await getProjectHealth(project.path)
    // Update project in list
    const index = projects.value.findIndex(p => p.path === project.path)
    if (index >= 0) {
      projects.value[index] = {
        ...projects.value[index],
        health: health.health
      }
    }
  } catch (err) {
    error.value = err.message
  }
}

// Load projects on mount
onMounted(() => {
  loadProjects()
})
</script>