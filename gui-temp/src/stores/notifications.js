import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  let notificationId = 0

  function addNotification(notification) {
    const id = ++notificationId
    const newNotification = {
      id,
      type: 'info',
      timeout: 6000,
      ...notification,
      timestamp: Date.now()
    }
    
    notifications.value.push(newNotification)
    
    // Auto-remove after timeout
    if (newNotification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.timeout)
    }
    
    return id
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index >= 0) {
      notifications.value.splice(index, 1)
    }
  }

  function showError(message, options = {}) {
    return addNotification({
      type: 'error',
      message,
      icon: 'mdi-alert-circle',
      ...options
    })
  }

  function showSuccess(message, options = {}) {
    return addNotification({
      type: 'success',
      message,
      icon: 'mdi-check-circle',
      timeout: 4000,
      ...options
    })
  }

  function showInfo(message, options = {}) {
    return addNotification({
      type: 'info',
      message,
      icon: 'mdi-information',
      ...options
    })
  }

  function showWarning(message, options = {}) {
    return addNotification({
      type: 'warning',
      message,
      icon: 'mdi-alert',
      ...options
    })
  }

  function clearAll() {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    clearAll
  }
})