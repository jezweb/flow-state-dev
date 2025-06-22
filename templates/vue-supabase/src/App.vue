<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>{{ appName }}</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Navigation -->
      <v-btn text :to="{ name: 'home' }">Home</v-btn>
      <v-btn text :to="{ name: 'about' }">About</v-btn>
      
      <!-- Auth Button -->
      <v-btn 
        v-if="!user" 
        text 
        :to="{ name: 'login' }"
      >
        Login
      </v-btn>
      <v-menu v-else>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app>
      <v-col class="text-center" cols="12">
        {{ new Date().getFullYear() }} — <strong>{{ appName }}</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const appName = import.meta.env.VITE_APP_NAME || 'My App'
const user = computed(() => authStore.user)

// Check auth on mount
onMounted(() => {
  authStore.initialize()
})

// Logout function
const logout = async () => {
  await authStore.signOut()
  router.push({ name: 'home' })
}
</script>