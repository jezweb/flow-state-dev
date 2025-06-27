<template>
  <v-card class="ma-4">
    <v-card-title>Error Boundary Test Component</v-card-title>
    <v-card-text>
      <p>This component demonstrates error boundary functionality.</p>
      <v-btn-group class="mt-4">
        <v-btn 
          color="error" 
          @click="throwError"
          prepend-icon="mdi-alert"
        >
          Throw Error
        </v-btn>
        <v-btn 
          color="warning" 
          @click="throwAsyncError"
          prepend-icon="mdi-clock-alert"
        >
          Throw Async Error
        </v-btn>
        <v-btn 
          color="info" 
          @click="throwNetworkError"
          prepend-icon="mdi-wifi-off"
        >
          Network Error
        </v-btn>
      </v-btn-group>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useNotificationsStore } from '../stores/notifications'

const notifications = useNotificationsStore()

function throwError() {
  throw new Error('This is a synchronous error thrown by the test component')
}

async function throwAsyncError() {
  await new Promise(resolve => setTimeout(resolve, 100))
  throw new Error('This is an asynchronous error thrown after a delay')
}

async function throwNetworkError() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/invalid-endpoint')
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    notifications.showError('Failed to fetch data from server', {
      title: 'Network Error',
      action: {
        label: 'Retry',
        handler: throwNetworkError
      }
    })
    throw error
  }
}
</script>