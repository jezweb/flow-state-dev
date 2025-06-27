<template>
  <div class="search-container">
    <v-text-field
      v-model="searchQuery"
      placeholder="Search projects, modules..."
      variant="outlined"
      density="compact"
      hide-details
      clearable
      @keydown.enter="performSearch"
      @keydown.esc="clearSearch"
    >
      <template v-slot:prepend-inner>
        <v-icon>mdi-magnify</v-icon>
      </template>
      <template v-slot:append-inner>
        <KeyboardHint 
          shortcut="ctrl+k" 
          description="Focus search"
          v-if="!searchQuery"
        />
      </template>
    </v-text-field>
    
    <v-menu
      v-model="showResults"
      :close-on-content-click="false"
      location="bottom"
      width="100%"
    >
      <v-card v-if="results.length > 0" max-height="300" class="overflow-y-auto">
        <v-list>
          <v-list-subheader>Search Results</v-list-subheader>
          <v-list-item
            v-for="result in results"
            :key="result.id"
            @click="selectResult(result)"
          >
            <template v-slot:prepend>
              <v-icon :icon="getResultIcon(result.type)" />
            </template>
            <v-list-item-title>{{ result.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ result.subtitle }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import KeyboardHint from './KeyboardHint.vue'

const router = useRouter()
const searchQuery = ref('')
const showResults = ref(false)
const results = ref([])

// Mock search data
const searchableItems = [
  { id: 1, type: 'project', title: 'My Vue App', subtitle: '~/claude/my-vue-app', route: '/projects' },
  { id: 2, type: 'project', title: 'E-commerce Site', subtitle: '~/projects/shop', route: '/projects' },
  { id: 3, type: 'module', title: 'Vue 3', subtitle: 'Frontend Framework', route: '/modules' },
  { id: 4, type: 'module', title: 'Vuetify', subtitle: 'UI Library', route: '/modules' },
  { id: 5, type: 'page', title: 'Create Project', subtitle: 'Start a new project', route: '/create' },
  { id: 6, type: 'page', title: 'Settings', subtitle: 'Configure preferences', route: '/settings' }
]

function performSearch() {
  if (!searchQuery.value.trim()) {
    results.value = []
    showResults.value = false
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  results.value = searchableItems.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.subtitle.toLowerCase().includes(query)
  ).slice(0, 5)
  
  showResults.value = results.value.length > 0
}

function clearSearch() {
  searchQuery.value = ''
  results.value = []
  showResults.value = false
}

function selectResult(result) {
  router.push(result.route)
  clearSearch()
}

function getResultIcon(type) {
  const icons = {
    project: 'mdi-folder',
    module: 'mdi-view-module',
    page: 'mdi-file'
  }
  return icons[type] || 'mdi-help'
}

function focusSearch() {
  const input = document.querySelector('.search-container input')
  if (input) input.focus()
}

function handleKeyDown(event) {
  // Global Ctrl+K to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    focusSearch()
  }
}

watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    performSearch()
  } else {
    clearSearch()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}
</style>