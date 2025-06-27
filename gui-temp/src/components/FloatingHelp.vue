<template>
  <v-fab
    location="bottom end"
    size="small"
    color="primary"
    icon="mdi-help"
    @click="showHelp"
    class="ma-4"
    :style="{ opacity: hovering ? 1 : 0.7 }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <v-tooltip
      activator="parent"
      location="left"
    >
      Help (F1 or Ctrl+?)
    </v-tooltip>
  </v-fab>
</template>

<script setup>
import { ref } from 'vue'

const hovering = ref(false)

function showHelp() {
  window.dispatchEvent(new CustomEvent('show-help'))
}
</script>