<template>
  <v-list-item class="mb-2">
    <template v-slot:prepend>
      <v-icon
        :icon="getFrameworkIcon(project.framework?.name)"
        :color="getFrameworkColor(project.framework?.name)"
        size="large"
      />
    </template>
    
    <v-list-item-title class="d-flex align-center">
      {{ project.displayName || project.name }}
      <v-chip
        :color="getHealthColor(project.health?.status)"
        size="x-small"
        variant="flat"
        class="ml-2"
      >
        {{ project.health?.status || 'unknown' }}
      </v-chip>
    </v-list-item-title>
    
    <v-list-item-subtitle>
      <div>{{ project.description || 'No description available' }}</div>
      <div class="text-caption mt-1">
        <span class="text-grey">{{ formatPath(project.path) }}</span>
        <span class="mx-2">•</span>
        <span class="text-grey">Last modified: {{ formatDate(project.lastModified) }}</span>
        <template v-if="project.hasGit">
          <span class="mx-2">•</span>
          <v-icon icon="mdi-git" size="x-small" /> Git
        </template>
      </div>
    </v-list-item-subtitle>
    
    <template v-slot:append>
      <div class="d-flex ga-1">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              v-bind="props"
            >
              Open
              <v-icon end>mdi-chevron-down</v-icon>
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
              Run
              <v-icon end>mdi-chevron-down</v-icon>
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
        
        <v-btn
          icon="mdi-refresh"
          size="small"
          variant="text"
          @click="$emit('refresh', project)"
        />
      </div>
    </template>
  </v-list-item>
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

// Helper functions (same as ProjectCard)
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
  
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours === 0) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} minutes ago`
    }
    return `${hours} hours ago`
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} days ago`
  }
  
  return d.toLocaleDateString()
}
</script>