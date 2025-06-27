<template>
  <v-card class="h-100">
    <v-card-title>
      <div class="d-flex align-center justify-space-between">
        <span>{{ module.displayName || module.name }}</span>
        <v-chip size="x-small" color="primary" variant="tonal">
          v{{ module.version }}
        </v-chip>
      </div>
    </v-card-title>
    
    <v-card-subtitle>
      {{ module.category }}
    </v-card-subtitle>
    
    <v-card-text>
      <p class="text-body-2 mb-3">{{ module.description }}</p>
      
      <div v-if="module.provides?.length" class="mb-2">
        <strong class="text-caption">Provides:</strong>
        <div class="d-flex flex-wrap ga-1 mt-1">
          <v-chip 
            v-for="item in module.provides" 
            :key="item"
            size="x-small"
            color="success"
            variant="tonal"
          >
            {{ item }}
          </v-chip>
        </div>
      </div>
      
      <div v-if="module.requires?.length" class="mb-2">
        <strong class="text-caption">Requires:</strong>
        <div class="d-flex flex-wrap ga-1 mt-1">
          <v-chip 
            v-for="item in module.requires" 
            :key="item"
            size="x-small"
            color="warning"
            variant="tonal"
          >
            {{ item }}
          </v-chip>
        </div>
      </div>
      
      <div v-if="module.conflicts?.length" class="mb-2">
        <strong class="text-caption">Conflicts:</strong>
        <div class="d-flex flex-wrap ga-1 mt-1">
          <v-chip 
            v-for="item in module.conflicts" 
            :key="item"
            size="x-small"
            color="error"
            variant="tonal"
          >
            {{ item }}
          </v-chip>
        </div>
      </div>
      
      <div v-if="module.tags?.length" class="mt-3">
        <div class="d-flex flex-wrap ga-1">
          <v-chip 
            v-for="tag in module.tags" 
            :key="tag"
            size="x-small"
            variant="outlined"
          >
            {{ tag }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  module: {
    type: Object,
    required: true
  }
})
</script>