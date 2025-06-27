<template>
  <v-app>
    <v-app-bar app elevation="2">
      <v-app-bar-title>
        <v-icon icon="mdi-rocket-launch" class="mr-2" />
        Flow State Dev GUI
      </v-app-bar-title>
      
      <v-spacer />
      
      <div class="mr-4" style="width: 300px;">
        <SearchBar />
      </div>
      
      <v-btn
        icon="mdi-help-circle"
        @click="showHelp"
        title="Help (F1 or Ctrl+?)"
      />
      
      <v-btn
        :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
        :title="`Switch to ${isDark ? 'light' : 'dark'} mode (Ctrl+Shift+D)`"
      />
      
      <v-btn 
        icon="mdi-github"
        href="https://github.com/jezweb/flow-state-dev"
        target="_blank"
        title="View on GitHub"
      />
    </v-app-bar>

    <v-main>
      <ErrorBoundary 
        :show-details="isDev"
        @error="handleAppError"
        @reset="handleErrorReset"
      >
        <router-view />
      </ErrorBoundary>
      <FloatingHelp />
    </v-main>
    
    <HelpDialog />
    <NotificationStack />
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import HelpDialog from './components/HelpDialog.vue'
import FloatingHelp from './components/FloatingHelp.vue'
import SearchBar from './components/SearchBar.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import NotificationStack from './components/NotificationStack.vue'
import { getSettings, updateSettings } from './services/flowStateApi'
import { useNotificationsStore } from './stores/notifications'

const theme = useTheme()
const isDark = ref(false)
const isDev = computed(() => import.meta.env.DEV)
const notifications = useNotificationsStore()

// Initialize keyboard shortcuts
useKeyboardShortcuts()

// Theme functions
function toggleTheme() {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
  
  // Save theme preference
  updateSettings({ darkMode: isDark.value }).catch(console.error)
}

function showHelp() {
  window.dispatchEvent(new CustomEvent('show-help'))
}

// Load initial theme from settings
async function loadTheme() {
  try {
    const settings = await getSettings()
    if (settings.darkMode) {
      isDark.value = true
      theme.global.name.value = 'dark'
    }
  } catch (error) {
    console.error('Failed to load theme settings:', error)
  }
}

// Listen for theme toggle events
function handleToggleTheme() {
  toggleTheme()
}

// Error handling functions
function handleAppError({ error, instance, info }) {
  console.error('Application error:', error)
  notifications.showError(error.message || 'An unexpected error occurred', {
    title: 'Application Error',
    action: {
      label: 'Report',
      handler: () => {
        window.open(`https://github.com/jezweb/flow-state-dev/issues/new?title=GUI%20Error&labels=bug`, '_blank')
      }
    }
  })
}

function handleErrorReset() {
  console.log('Error boundary reset')
  notifications.showInfo('Application recovered from error')
}

onMounted(() => {
  loadTheme()
  window.addEventListener('toggle-theme', handleToggleTheme)
})

onUnmounted(() => {
  window.removeEventListener('toggle-theme', handleToggleTheme)
})
</script>