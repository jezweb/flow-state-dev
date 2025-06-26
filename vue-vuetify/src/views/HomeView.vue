<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h2 mb-4">Welcome to </h1>
        <p class="text-h6 text-medium-emphasis mb-8">
          Built with Vue 3, Vuetify 3, and Supabase
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-lightning-bolt</v-icon>
            Fast Development
          </v-card-title>
          <v-card-text>
            Get started quickly with pre-configured Vue 3 and Vuetify components.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-database</v-icon>
            Supabase Backend
          </v-card-title>
          <v-card-text>
            Full backend with authentication, database, and real-time subscriptions.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-palette</v-icon>
            Beautiful UI
          </v-card-title>
          <v-card-text>
            Material Design components with Vuetify 3 for a professional look.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" class="text-center">
        <v-btn
          v-if="!isAuthenticated"
          color="primary"
          size="large"
          :to="{ name: 'login' }"
        >
          Get Started
        </v-btn>
        <v-btn
          v-else
          color="primary"
          size="large"
          :to="{ name: 'dashboard' }"
        >
          Go to Dashboard
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const appName = import.meta.env.VITE_APP_NAME || 'My App'
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>