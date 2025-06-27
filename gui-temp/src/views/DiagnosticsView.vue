<template>
  <v-container>
    <h1 class="text-h3 mb-6">System Diagnostics</h1>
    
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>System Health Check</span>
            <v-btn
              color="primary"
              variant="flat"
              :loading="isRunning"
              @click="runDiagnostics"
            >
              <v-icon start>mdi-play</v-icon>
              Run Diagnostics
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              closable
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>
            
            <div v-if="results">
              <!-- Overall Status -->
              <v-alert
                :type="getOverallType()"
                variant="tonal"
                class="mb-4"
              >
                <div class="d-flex align-center">
                  <v-icon 
                    :icon="getOverallIcon()"
                    class="mr-2"
                  />
                  <div>
                    <div class="font-weight-bold">{{ results.summary.message }}</div>
                    <div class="text-caption">
                      {{ results.summary.errors }} errors, 
                      {{ results.summary.warnings }} warnings
                    </div>
                  </div>
                </div>
              </v-alert>
              
              <!-- Individual Checks -->
              <v-list>
                <v-list-item 
                  v-for="(check, key) in getChecks()" 
                  :key="key"
                >
                  <template v-slot:prepend>
                    <v-icon 
                      :icon="getCheckIcon(check)"
                      :color="getCheckColor(check)"
                    />
                  </template>
                  
                  <v-list-item-title>{{ check.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <span :class="`text-${getCheckColor(check)}`">
                      {{ check.message }}
                    </span>
                    <div v-if="check.details" class="text-caption mt-1">
                      {{ check.details }}
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              
              <!-- System Info -->
              <v-divider class="my-4" />
              
              <h3 class="text-h6 mb-3">System Information</h3>
              
              <v-simple-table density="compact">
                <tbody>
                  <tr>
                    <td class="text-grey">Node.js</td>
                    <td>{{ results.node?.version || 'Unknown' }}</td>
                  </tr>
                  <tr>
                    <td class="text-grey">Platform</td>
                    <td>{{ results.system?.platform || 'Unknown' }}</td>
                  </tr>
                  <tr>
                    <td class="text-grey">Architecture</td>
                    <td>{{ results.system?.arch || 'Unknown' }}</td>
                  </tr>
                  <tr>
                    <td class="text-grey">Git</td>
                    <td>{{ results.git?.version || 'Not installed' }}</td>
                  </tr>
                  <tr>
                    <td class="text-grey">npm</td>
                    <td>{{ results.npm?.version || 'Unknown' }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </div>
            
            <div v-else class="text-center py-8 text-grey">
              <v-icon size="48" class="mb-4">mdi-stethoscope</v-icon>
              <p>Click "Run Diagnostics" to check your system</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                prepend-icon="mdi-folder-plus"
                title="Create Project"
                subtitle="Start a new Flow State Dev project"
                :to="{ name: 'create' }"
              />
              <v-list-item
                prepend-icon="mdi-view-module"
                title="Browse Modules"
                subtitle="Explore available modules"
                :to="{ name: 'modules' }"
              />
              <v-list-item
                prepend-icon="mdi-github"
                title="Documentation"
                subtitle="View Flow State Dev docs"
                href="https://github.com/jezweb/flow-state-dev"
                target="_blank"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { runDiagnostics as apiRunDiagnostics } from '../services/flowStateApi'

const isRunning = ref(false)
const error = ref(null)
const results = ref(null)

async function runDiagnostics() {
  isRunning.value = true
  error.value = null
  
  try {
    results.value = await apiRunDiagnostics()
  } catch (err) {
    error.value = err.message
  } finally {
    isRunning.value = false
  }
}

function getOverallType() {
  if (!results.value) return 'info'
  const status = results.value.summary.overallStatus
  return status === 'ok' ? 'success' : status === 'warning' ? 'warning' : 'error'
}

function getOverallIcon() {
  if (!results.value) return 'mdi-information'
  const status = results.value.summary.overallStatus
  return status === 'ok' ? 'mdi-check-circle' : 
         status === 'warning' ? 'mdi-alert' : 'mdi-alert-circle'
}

function getChecks() {
  if (!results.value) return {}
  
  const checks = {}
  
  // Map diagnostic results to a flat structure
  if (results.value.node) {
    checks.nodejs = {
      name: 'Node.js',
      status: results.value.node.status,
      message: results.value.node.message,
      details: results.value.node.version
    }
  }
  
  if (results.value.git) {
    checks.git = {
      name: 'Git',
      status: results.value.git.status,
      message: results.value.git.message,
      details: results.value.git.version
    }
  }
  
  if (results.value.npm) {
    checks.npm = {
      name: 'npm',
      status: results.value.npm.status,
      message: results.value.npm.message,
      details: results.value.npm.version
    }
  }
  
  if (results.value.docker) {
    checks.docker = {
      name: 'Docker',
      status: results.value.docker.status,
      message: results.value.docker.message,
      details: results.value.docker.version
    }
  }
  
  return checks
}

function getCheckIcon(check) {
  if (check.status === 'ok') return 'mdi-check-circle'
  if (check.status === 'warning') return 'mdi-alert'
  if (check.status === 'error') return 'mdi-close-circle'
  return 'mdi-help-circle'
}

function getCheckColor(check) {
  if (check.status === 'ok') return 'success'
  if (check.status === 'warning') return 'warning'
  if (check.status === 'error') return 'error'
  return 'grey'
}
</script>