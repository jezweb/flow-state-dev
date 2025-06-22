<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" class="mx-auto">
        <h1 class="text-h2 mb-4">About {{ appName }}</h1>
        
        <v-card class="mb-6">
          <v-card-title>Built with Flow State Dev</v-card-title>
          <v-card-text>
            <p>
              This application was created using Flow State Dev, a tool designed to eliminate 
              friction between human developers and AI coding assistants.
            </p>
          </v-card-text>
        </v-card>

        <v-card class="mb-6">
          <v-card-title>Technology Stack</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item prepend-icon="mdi-vuejs">
                <v-list-item-title>Vue 3</v-list-item-title>
                <v-list-item-subtitle>Progressive JavaScript Framework</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item prepend-icon="mdi-material-design">
                <v-list-item-title>Vuetify 3</v-list-item-title>
                <v-list-item-subtitle>Material Design Component Library</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item prepend-icon="mdi-database">
                <v-list-item-title>Supabase</v-list-item-title>
                <v-list-item-subtitle>Open Source Firebase Alternative</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item prepend-icon="mdi-flash">
                <v-list-item-title>Vite</v-list-item-title>
                <v-list-item-subtitle>Next Generation Frontend Tooling</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Get Started</v-card-title>
          <v-card-text>
            <p class="mb-4">
              Ready to start building? Check out the documentation in the 
              <code>CLAUDE.md</code> file for AI-assisted development tips.
            </p>
            <v-btn color="primary" :to="{ name: 'login' }">
              Sign Up Now
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const appName = import.meta.env.VITE_APP_NAME || 'My App'
</script>