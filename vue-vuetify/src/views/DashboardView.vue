<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h2 mb-4">Dashboard</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Welcome back, !
        </p>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- Stats Cards -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon size="x-large" color="primary">mdi-account-group</v-icon>
            </template>
            <v-card-title>Total Users</v-card-title>
            <v-card-subtitle>Active users in system</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <p class="text-h3"></p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon size="x-large" color="success">mdi-file-document</v-icon>
            </template>
            <v-card-title>Documents</v-card-title>
            <v-card-subtitle>Total documents</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <p class="text-h3"></p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-item>
            <template v-slot:prepend>
              <v-icon size="x-large" color="info">mdi-chart-line</v-icon>
            </template>
            <v-card-title>Activity</v-card-title>
            <v-card-subtitle>This month</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <p class="text-h3"></p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-8">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Quick Actions</h2>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-plus</v-icon>
            Create New
          </v-card-title>
          <v-card-text>
            <p>Start creating something new in your application.</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="text">
              Get Started
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-cog</v-icon>
            Settings
          </v-card-title>
          <v-card-text>
            <p>Configure your application settings and preferences.</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="text">
              Open Settings
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row class="mt-8">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Recent Activity</h2>
        <v-card>
          <v-list>
            <v-list-item v-for="item in recentActivity" :key="item.id">
              <template v-slot:prepend>
                <v-icon></v-icon>
              </template>
              <v-list-item-title></v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userEmail = computed(() => authStore.userEmail)

// Mock data - replace with real data from Supabase
const stats = ref({
  users: 42,
  documents: 156,
  activity: 89
})

const recentActivity = ref([
  { id: 1, icon: 'mdi-file-plus', title: 'New document created', time: '2 hours ago' },
  { id: 2, icon: 'mdi-account-plus', title: 'User registered', time: '5 hours ago' },
  { id: 3, icon: 'mdi-update', title: 'System updated', time: '1 day ago' },
  { id: 4, icon: 'mdi-file-edit', title: 'Document edited', time: '2 days ago' },
])
</script>