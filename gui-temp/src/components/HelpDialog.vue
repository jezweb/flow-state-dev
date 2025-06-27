<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-help-circle</v-icon>
        Keyboard Shortcuts
      </v-card-title>
      
      <v-card-text>
        <p class="text-body-2 mb-4">
          Use these keyboard shortcuts to navigate quickly through Flow State Dev GUI:
        </p>
        
        <v-list density="compact">
          <v-list-subheader>Navigation</v-list-subheader>
          <v-list-item
            v-for="shortcut in navigationShortcuts"
            :key="shortcut.key"
          >
            <template v-slot:prepend>
              <v-chip
                size="small"
                variant="outlined"
                class="font-monospace"
              >
                {{ formatShortcut(shortcut.key) }}
              </v-chip>
            </template>
            <v-list-item-title>{{ shortcut.description }}</v-list-item-title>
          </v-list-item>
          
          <v-list-subheader class="mt-4">Actions</v-list-subheader>
          <v-list-item
            v-for="shortcut in actionShortcuts"
            :key="shortcut.key"
          >
            <template v-slot:prepend>
              <v-chip
                size="small"
                variant="outlined"
                class="font-monospace"
              >
                {{ formatShortcut(shortcut.key) }}
              </v-chip>
            </template>
            <v-list-item-title>{{ shortcut.description }}</v-list-item-title>
          </v-list-item>
        </v-list>
        
        <v-alert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          <template v-slot:prepend>
            <v-icon>mdi-lightbulb</v-icon>
          </template>
          <strong>Tip:</strong> On Mac, use ⌘ instead of Ctrl for all shortcuts.
        </v-alert>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn
          text="Close"
          @click="dialog = false"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { formatShortcut } from '../composables/useKeyboardShortcuts'

const dialog = ref(false)

const navigationShortcuts = [
  { key: 'ctrl+h', description: 'Go to Home' },
  { key: 'ctrl+n', description: 'Create New Project' },
  { key: 'ctrl+m', description: 'Browse Modules' },
  { key: 'ctrl+p', description: 'My Projects' },
  { key: 'ctrl+d', description: 'Diagnostics' },
  { key: 'ctrl+,', description: 'Settings' }
]

const actionShortcuts = [
  { key: 'ctrl+r', description: 'Reload Page' },
  { key: 'ctrl+shift+d', description: 'Toggle Dark Mode' },
  { key: 'ctrl+k', description: 'Focus Search' },
  { key: 'escape', description: 'Close Dialog/Modal' },
  { key: 'ctrl+?', description: 'Show This Help' },
  { key: 'f1', description: 'Show This Help' }
]

function showHelp() {
  dialog.value = true
}

function handleEscape() {
  if (dialog.value) {
    dialog.value = false
  }
}

onMounted(() => {
  window.addEventListener('show-help', showHelp)
  window.addEventListener('escape-pressed', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('show-help', showHelp)
  window.removeEventListener('escape-pressed', handleEscape)
})
</script>

<style scoped>
.font-monospace {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>