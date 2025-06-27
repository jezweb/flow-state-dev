<template>
  <v-tooltip :text="description" location="bottom">
    <template v-slot:activator="{ props }">
      <v-chip
        v-bind="props"
        size="x-small"
        variant="outlined"
        class="font-monospace ml-2 opacity-60"
      >
        {{ formatShortcut(shortcut) }}
      </v-chip>
    </template>
  </v-tooltip>
</template>

<script setup>
import { formatShortcut } from '../composables/useKeyboardShortcuts'

defineProps({
  shortcut: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.font-monospace {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>