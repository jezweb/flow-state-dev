<template>
  <v-container>
    <v-row justify="center" class="my-8">
      <v-col cols="12" md="8" lg="6">
        <div class="text-center">
          <v-icon size="80" color="primary" class="mb-4">mdi-rocket-launch</v-icon>
          <h1 class="text-h2 mb-4">Flow State Dev GUI</h1>
          <p class="text-h6 text-medium-emphasis mb-8">
            Create modern web projects with a visual interface
          </p>
        </div>
        
        <v-row>
          <v-col cols="12" sm="6">
            <v-card 
              class="pa-4 h-100" 
              :to="{ name: 'create' }"
              hover
              elevation="2"
            >
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon start color="primary">mdi-plus-circle</v-icon>
                  Create Project
                </div>
                <KeyboardHint shortcut="ctrl+n" description="Create new project" />
              </v-card-title>
              <v-card-text>
                Start a new project with your chosen stack
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6">
            <v-card 
              class="pa-4 h-100" 
              :to="{ name: 'modules' }"
              hover
              elevation="2"
            >
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon start color="secondary">mdi-view-module</v-icon>
                  Browse Modules
                </div>
                <KeyboardHint shortcut="ctrl+m" description="Browse modules" />
              </v-card-title>
              <v-card-text>
                Explore available modules and build custom stacks
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6">
            <v-card 
              class="pa-4 h-100" 
              :to="{ name: 'projects' }"
              hover
              elevation="2"
            >
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon start color="orange">mdi-folder-multiple</v-icon>
                  My Projects
                </div>
                <KeyboardHint shortcut="ctrl+p" description="View projects" />
              </v-card-title>
              <v-card-text>
                Manage your existing Flow State Dev projects
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6">
            <v-card 
              class="pa-4 h-100" 
              :to="{ name: 'diagnostics' }"
              hover
              elevation="2"
            >
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon start color="success">mdi-stethoscope</v-icon>
                  Diagnostics
                </div>
                <KeyboardHint shortcut="ctrl+d" description="View diagnostics" />
              </v-card-title>
              <v-card-text>
                Check your system and project health
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6">
            <v-card 
              class="pa-4 h-100" 
              :to="{ name: 'settings' }"
              hover
              elevation="2"
            >
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon start color="grey-darken-1">mdi-cog</v-icon>
                  Settings
                </div>
                <KeyboardHint shortcut="ctrl+," description="Open settings" />
              </v-card-title>
              <v-card-text>
                Configure project paths and preferences
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6">
            <v-card 
              class="pa-4 h-100" 
              href="https://github.com/jezweb/flow-state-dev"
              target="_blank"
              hover
              elevation="2"
            >
              <v-card-title class="d-flex align-center">
                <v-icon start>mdi-book-open-variant</v-icon>
                Documentation
              </v-card-title>
              <v-card-text>
                Learn more about Flow State Dev
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import KeyboardHint from '../components/KeyboardHint.vue'
</script>