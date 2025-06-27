<template>
  <v-layout>
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      v-model="notification.show"
      :timeout="-1"
      :color="getColor(notification.type)"
      location="top right"
      variant="flat"
      multi-line
      class="notification-snackbar"
      :style="{ top: getOffset(notification) + 'px' }"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="notification.icon" 
          class="mr-3"
          size="small"
        />
        <div class="flex-grow-1">
          <div v-if="notification.title" class="font-weight-medium">
            {{ notification.title }}
          </div>
          <div>{{ notification.message }}</div>
        </div>
      </div>
      
      <template v-slot:actions>
        <v-btn
          v-if="notification.action"
          variant="text"
          size="small"
          @click="handleAction(notification)"
        >
          {{ notification.action.label }}
        </v-btn>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="removeNotification(notification.id)"
        />
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useNotificationsStore } from '../stores/notifications'

const notificationsStore = useNotificationsStore()

const notifications = computed(() => 
  notificationsStore.notifications.map((n, index) => ({
    ...n,
    show: true,
    index
  }))
)

function getColor(type) {
  const colors = {
    error: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info'
  }
  return colors[type] || 'info'
}

function getOffset(notification) {
  const baseOffset = 64 // App bar height
  const notificationHeight = 80
  const gap = 8
  return baseOffset + (notification.index * (notificationHeight + gap))
}

function removeNotification(id) {
  notificationsStore.removeNotification(id)
}

function handleAction(notification) {
  if (notification.action?.handler) {
    notification.action.handler()
  }
  removeNotification(notification.id)
}
</script>

<style scoped>
.notification-snackbar {
  transition: all 0.3s ease;
}

:deep(.v-snackbar__wrapper) {
  margin: 8px;
}
</style>