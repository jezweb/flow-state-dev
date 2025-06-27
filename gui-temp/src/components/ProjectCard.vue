<template>
  <v-card class="h-100 d-flex flex-column">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon
          :icon="getFrameworkIcon(project.framework?.name)"
          :color="getFrameworkColor(project.framework?.name)"
          class="mr-2"
        />
        <span>{{ project.displayName || project.name }}</span>
      </div>
      <v-chip
        :color="getHealthColor(project.health?.status)"
        size="x-small"
        variant="flat"
      >
        {{ project.health?.status || 'unknown' }}
      </v-chip>
    </v-card-title>
    
    <v-card-subtitle>
      {{ project.framework?.name || 'Unknown' }} 
      <span v-if="project.version" class="text-caption">(v{{ project.version }})</span>
    </v-card-subtitle>
    
    <v-card-text class="flex-grow-1">
      <p class="text-body-2 mb-3">
        {{ project.description || 'No description available' }}
      </p>
      
      <div class="text-caption text-grey">
        <v-icon icon="mdi-folder" size="x-small" /> {{ formatPath(project.path) }}
      </div>
      
      <div class="text-caption text-grey mt-1">
        <v-icon icon="mdi-clock-outline" size="x-small" /> 
        Last modified: {{ formatDate(project.lastModified) }}
      </div>
      
      <div class="d-flex align-center mt-2">
        <v-icon 
          v-if="project.hasGit"
          icon="mdi-git"
          size="small"
          color="orange"
          class="mr-2"
          title="Git repository"
        />
        <v-icon 
          v-if="project.health?.hasTests"
          icon="mdi-test-tube"
          size="small"
          color="green"
          class="mr-2"
          title="Has tests"
        />
        <v-icon 
          v-if="project.health?.hasTypeScript"
          icon="mdi-language-typescript"
          size="small"
          color="blue"
          class="mr-2"
          title="TypeScript"
        />
        <v-icon 
          v-if="project.health?.hasLinter"
          icon="mdi-check-decagram"
          size="small"
          color="purple"
          title="Has linter"
        />
      </div>
    </v-card-text>
    
    <v-divider />
    
    <v-card-actions>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            v-bind="props"
          >
            <v-icon start>mdi-open-in-app</v-icon>
            Open
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item @click="$emit('open', project, 'code')">
            <v-list-item-title>VS Code</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('open', project, 'cursor')">
            <v-list-item-title>Cursor</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('open', project, 'default')">
            <v-list-item-title>Default Editor</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      
      <v-menu v-if="hasScripts">
        <template v-slot:activator="{ props }">
          <v-btn
            variant="tonal"
            size="small"
            v-bind="props"
          >
            <v-icon start>mdi-play</v-icon>
            Run
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item 
            v-for="(script, name) in project.scripts"
            :key="name"
            @click="$emit('run', project, name)"
          >
            <v-list-item-title>{{ name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      
      <v-spacer />
      
      <v-btn
        icon="mdi-refresh"
        size="small"
        variant="text"
        @click="$emit('refresh', project)"
        title="Refresh project info"
      />
      
      <v-btn
        icon="mdi-dots-vertical"
        size="small"
        variant="text"
      >
        <!-- More actions menu -->
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

defineEmits(['open', 'run', 'refresh'])

// Computed
const hasScripts = computed(() => {
  return props.project.scripts && Object.keys(props.project.scripts).length > 0
})

// Helper functions
function getFrameworkIcon(framework) {
  const icons = {
    vue: 'mdi-vuejs',
    react: 'mdi-react',
    sveltekit: 'mdi-svelte',
    angular: 'mdi-angular',
    nextjs: 'mdi-react',
    nuxt: 'mdi-nuxt',
    vite: 'mdi-lightning-bolt',
    unknown: 'mdi-code-braces'
  }
  return icons[framework] || icons.unknown
}

function getFrameworkColor(framework) {
  const colors = {
    vue: 'green',
    react: 'blue',
    sveltekit: 'orange',
    angular: 'red',
    nextjs: 'black',
    nuxt: 'green-darken-2',
    vite: 'purple',
    unknown: 'grey'
  }
  return colors[framework] || colors.unknown
}

function getHealthColor(status) {
  const colors = {
    healthy: 'success',
    warning: 'warning',
    error: 'error',
    unknown: 'grey'
  }
  return colors[status] || colors.unknown
}

function formatPath(path) {
  // Shorten path for display
  const home = '/home/jez'
  if (path.startsWith(home)) {
    return '~' + path.slice(home.length)
  }
  return path
}

function formatDate(date) {
  if (!date) return 'Unknown'
  
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours === 0) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} minutes ago`
    }
    return `${hours} hours ago`
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} days ago`
  }
  
  // Format as date
  return d.toLocaleDateString()
}
</script>