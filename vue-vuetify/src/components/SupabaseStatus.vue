<template>
  <v-alert
    v-if="!isSupabaseConfigured && showAlert"
    type="warning"
    closable
    @click:close="dismissAlert"
    class="ma-4"
  >
    <v-alert-title>Running in Offline Mode</v-alert-title>
    <div>
      Supabase is not configured. To enable database features:
      <ol class="mt-2">
        <li>Copy <code>.env.example</code> to <code>.env</code></li>
        <li>Add your Supabase project URL and anon key</li>
        <li>Restart the development server</li>
      </ol>
    </div>
  </v-alert>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { isSupabaseConfigured } from '@/services/supabase'

const showAlert = ref(false)

// Only show alert in development
onMounted(() => {
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    // Check if user has already dismissed this alert
    const dismissed = localStorage.getItem('supabase-alert-dismissed')
    if (!dismissed) {
      showAlert.value = true
    }
  }
})

const dismissAlert = () => {
  showAlert.value = false
  // Remember that user dismissed the alert
  localStorage.setItem('supabase-alert-dismissed', 'true')
}
</script>