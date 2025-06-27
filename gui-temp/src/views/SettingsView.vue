<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" lg="6" class="mx-auto">
        <h1 class="text-h3 mb-6">Settings</h1>
        
        <v-card class="mb-6">
          <v-card-title>
            <v-icon start>mdi-folder-search</v-icon>
            Project Search Paths
          </v-card-title>
          <v-card-subtitle>
            Configure directories where Flow State Dev looks for projects
          </v-card-subtitle>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(path, index) in settings.searchPaths"
                :key="index"
                class="px-0"
              >
                <v-text-field
                  v-model="settings.searchPaths[index]"
                  :label="`Path ${index + 1}`"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mb-2"
                >
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      @click="removePath(index)"
                    />
                  </template>
                </v-text-field>
              </v-list-item>
            </v-list>
            
            <v-btn
              variant="outlined"
              size="small"
              @click="addPath"
              class="mt-2"
            >
              <v-icon start>mdi-plus</v-icon>
              Add Path
            </v-btn>
          </v-card-text>
        </v-card>
        
        <v-card class="mb-6">
          <v-card-title>
            <v-icon start>mdi-code-tags</v-icon>
            Editor Preferences
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="settings.defaultEditor"
              :items="editorOptions"
              label="Default Editor"
              variant="outlined"
              density="compact"
            />
            
            <v-text-field
              v-model="settings.customEditorCommand"
              label="Custom Editor Command"
              placeholder="e.g., /usr/local/bin/sublime"
              variant="outlined"
              density="compact"
              hint="Leave empty to use system default"
              persistent-hint
              :disabled="settings.defaultEditor !== 'custom'"
            />
          </v-card-text>
        </v-card>
        
        <v-card class="mb-6">
          <v-card-title>
            <v-icon start>mdi-palette</v-icon>
            Appearance
          </v-card-title>
          <v-card-text>
            <v-switch
              v-model="settings.darkMode"
              label="Dark Mode"
              color="primary"
              @update:model-value="toggleTheme"
            />
            
            <v-select
              v-model="settings.theme"
              :items="themeOptions"
              label="Color Theme"
              variant="outlined"
              density="compact"
            />
          </v-card-text>
        </v-card>
        
        <v-card class="mb-6">
          <v-card-title>
            <v-icon start>mdi-api</v-icon>
            API Connection
          </v-card-title>
          <v-card-text>
            <v-alert
              :type="connectionStatus.connected ? 'success' : 'warning'"
              variant="tonal"
              class="mb-4"
            >
              <div class="d-flex align-center justify-space-between">
                <div>
                  <strong>{{ connectionStatus.type === 'real' ? 'Real API' : 'Mock API' }}</strong>
                  <div class="text-caption">
                    {{ connectionStatus.connected ? 'Connected' : 'Disconnected' }}
                    {{ connectionStatus.server ? `(${connectionStatus.server})` : '' }}
                  </div>
                  <div v-if="connectionStatus.error" class="text-caption text-error">
                    {{ connectionStatus.error }}
                  </div>
                  <div v-if="connectionStatus.suggestion" class="text-caption">
                    {{ connectionStatus.suggestion }}
                  </div>
                </div>
                <v-btn
                  icon="mdi-refresh"
                  size="small"
                  variant="text"
                  @click="checkConnection"
                  :loading="checkingConnection"
                  title="Test connection"
                />
              </div>
            </v-alert>
            
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Connection Type</v-list-item-title>
                <v-list-item-subtitle>{{ connectionInfo.type }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Base URL</v-list-item-title>
                <v-list-item-subtitle>{{ connectionInfo.baseUrl }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="connectionInfo.usingRealApi">
                <v-list-item-title>Real API Mode</v-list-item-title>
                <v-list-item-subtitle>
                  To use mock API, stop the server and restart with <code>npm run dev</code>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-else>
                <v-list-item-title>Mock API Mode</v-list-item-title>
                <v-list-item-subtitle>
                  To use real API, run <code>npm run dev:real</code>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        
        <v-card class="mb-6">
          <v-card-title>
            <v-icon start>mdi-cog</v-icon>
            Project Discovery
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model.number="settings.maxSearchDepth"
              label="Maximum Search Depth"
              type="number"
              min="1"
              max="10"
              variant="outlined"
              density="compact"
              hint="How many levels deep to search for projects"
              persistent-hint
            />
            
            <v-switch
              v-model="settings.scanOnStartup"
              label="Scan for projects on startup"
              color="primary"
              class="mt-4"
            />
            
            <v-switch
              v-model="settings.showHiddenProjects"
              label="Show hidden projects (starting with .)"
              color="primary"
            />
          </v-card-text>
        </v-card>
        
        <div class="d-flex justify-end ga-2">
          <v-btn
            variant="outlined"
            @click="resetSettings"
          >
            Reset to Defaults
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveSettings"
          >
            Save Settings
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { getSettings, updateSettings, checkApiHealth, getConnectionInfo } from '../services/flowStateApi'

const theme = useTheme()

// State
const settings = ref({
  searchPaths: [
    '~/claude',
    '~/projects',
    '~/dev'
  ],
  defaultEditor: 'code',
  customEditorCommand: '',
  darkMode: false,
  theme: 'blue',
  maxSearchDepth: 3,
  scanOnStartup: true,
  showHiddenProjects: false
})

const saving = ref(false)
const checkingConnection = ref(false)
const connectionStatus = ref({
  connected: false,
  type: 'mock',
  error: null,
  suggestion: null
})
const connectionInfo = ref({
  usingRealApi: false,
  baseUrl: 'mock',
  type: 'mock'
})
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

// Options
const editorOptions = [
  { title: 'VS Code', value: 'code' },
  { title: 'Cursor', value: 'cursor' },
  { title: 'Sublime Text', value: 'subl' },
  { title: 'Vim', value: 'vim' },
  { title: 'Emacs', value: 'emacs' },
  { title: 'System Default', value: 'default' },
  { title: 'Custom', value: 'custom' }
]

const themeOptions = [
  { title: 'Blue', value: 'blue' },
  { title: 'Green', value: 'green' },
  { title: 'Purple', value: 'purple' },
  { title: 'Orange', value: 'orange' },
  { title: 'Red', value: 'red' }
]

// Methods
function addPath() {
  settings.value.searchPaths.push('')
}

function removePath(index) {
  settings.value.searchPaths.splice(index, 1)
}

function toggleTheme(isDark) {
  theme.global.name.value = isDark ? 'dark' : 'light'
}

async function checkConnection() {
  checkingConnection.value = true
  try {
    connectionStatus.value = await checkApiHealth()
  } catch (error) {
    connectionStatus.value = {
      connected: false,
      type: 'unknown',
      error: error.message,
      suggestion: 'Check console for more details'
    }
  } finally {
    checkingConnection.value = false
  }
}

async function loadSettings() {
  try {
    const savedSettings = await getSettings()
    if (savedSettings) {
      settings.value = { ...settings.value, ...savedSettings }
      // Apply theme
      theme.global.name.value = settings.value.darkMode ? 'dark' : 'light'
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

async function saveSettings() {
  saving.value = true
  
  try {
    // Filter out empty paths
    const cleanSettings = {
      ...settings.value,
      searchPaths: settings.value.searchPaths.filter(p => p.trim())
    }
    
    await updateSettings(cleanSettings)
    
    snackbar.value = {
      show: true,
      text: 'Settings saved successfully',
      color: 'success'
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      text: 'Failed to save settings',
      color: 'error'
    }
  } finally {
    saving.value = false
  }
}

function resetSettings() {
  settings.value = {
    searchPaths: [
      '~/claude',
      '~/projects',
      '~/dev'
    ],
    defaultEditor: 'code',
    customEditorCommand: '',
    darkMode: false,
    theme: 'blue',
    maxSearchDepth: 3,
    scanOnStartup: true,
    showHiddenProjects: false
  }
  
  // Apply theme
  theme.global.name.value = 'light'
  
  snackbar.value = {
    show: true,
    text: 'Settings reset to defaults',
    color: 'info'
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
  connectionInfo.value = getConnectionInfo()
  checkConnection()
})
</script>