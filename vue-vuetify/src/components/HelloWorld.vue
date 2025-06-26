<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5">
            
          </v-card-title>
          <v-card-text>
            <p></p>
            <v-text-field
              v-model="name"
              label="Enter your name"
              @keyup.enter="updateGreeting"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="updateGreeting">
              Update Greeting
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Hello from Flow State Dev!'
  }
})

// State
const name = ref('')
const customGreeting = ref('')

// Computed
const message = computed(() => {
  if (customGreeting.value) {
    return customGreeting.value
  }
  return 'This component demonstrates the Vue 3 Composition API pattern.'
})

// Methods
const updateGreeting = () => {
  if (name.value.trim()) {
    customGreeting.value = `Hello ${name.value}! Welcome to Flow State Dev.`
  }
}
</script>