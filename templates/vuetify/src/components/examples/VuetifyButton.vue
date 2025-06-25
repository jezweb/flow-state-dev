<template>
  <div class="button-examples pa-4">
    <h2 class="text-h4 mb-4">Vuetify Button Examples</h2>
    
    <div class="mb-6">
      <h3 class="text-h6 mb-3">Basic Buttons</h3>
      <div class="d-flex flex-wrap ga-2">
        <v-btn>Default</v-btn>
        <v-btn color="primary">Primary</v-btn>
        <v-btn color="secondary">Secondary</v-btn>
        <v-btn color="success">Success</v-btn>
        <v-btn color="warning">Warning</v-btn>
        <v-btn color="error">Error</v-btn>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-h6 mb-3">Button Variants</h3>
      <div class="d-flex flex-wrap ga-2">
        <v-btn variant="elevated" color="primary">Elevated</v-btn>
        <v-btn variant="flat" color="primary">Flat</v-btn>
        <v-btn variant="tonal" color="primary">Tonal</v-btn>
        <v-btn variant="outlined" color="primary">Outlined</v-btn>
        <v-btn variant="text" color="primary">Text</v-btn>
        <v-btn variant="plain" color="primary">Plain</v-btn>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-h6 mb-3">Button Sizes</h3>
      <div class="d-flex align-center flex-wrap ga-2">
        <v-btn size="x-small" color="primary">X-Small</v-btn>
        <v-btn size="small" color="primary">Small</v-btn>
        <v-btn size="default" color="primary">Default</v-btn>
        <v-btn size="large" color="primary">Large</v-btn>
        <v-btn size="x-large" color="primary">X-Large</v-btn>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-h6 mb-3">Icon Buttons</h3>
      <div class="d-flex flex-wrap ga-2">
        <v-btn icon="$home" color="primary"></v-btn>
        <v-btn icon="$heart" color="error"></v-btn>
        <v-btn icon="$magnify" color="info"></v-btn>
        <v-btn prepend-icon="$plus" color="success">Add Item</v-btn>
        <v-btn append-icon="$chevronDown" color="primary">Menu</v-btn>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-h6 mb-3">Button States</h3>
      <div class="d-flex flex-wrap ga-2">
        <v-btn color="primary">Normal</v-btn>
        <v-btn color="primary" disabled>Disabled</v-btn>
        <v-btn color="primary" loading>Loading</v-btn>
        <v-btn color="primary" :loading="loading" @click="handleAsyncAction">
          Async Action
        </v-btn>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-h6 mb-3">Floating Action Button</h3>
      <v-btn
        icon="$plus"
        color="primary"
        size="large"
        elevation="4"
        class="fab"
      ></v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

const handleAsyncAction = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  loading.value = false
}
</script>

<style scoped>
.button-examples {
  max-width: 800px;
}

.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
}
</style>