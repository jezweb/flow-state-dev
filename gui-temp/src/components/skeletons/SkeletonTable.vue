<template>
  <div class="skeleton-table">
    <v-data-table-virtual
      :headers="skeletonHeaders"
      :items="skeletonItems"
      :height="height"
      :density="density"
      class="skeleton-data-table"
    >
      <template v-for="header in skeletonHeaders" :key="header.key" v-slot:[`item.${header.key}`]>
        <v-skeleton-loader
          :type="getColumnType(header.type)"
          :width="getColumnWidth(header.type)"
        />
      </template>
    </v-data-table-virtual>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: {
    type: Number,
    default: 10
  },
  columns: {
    type: Array,
    default: () => [
      { key: 'name', title: 'Name', type: 'text' },
      { key: 'status', title: 'Status', type: 'chip' },
      { key: 'date', title: 'Date', type: 'text' },
      { key: 'actions', title: 'Actions', type: 'button' }
    ]
  },
  height: {
    type: [String, Number],
    default: 400
  },
  density: {
    type: String,
    default: 'default'
  }
})

const skeletonHeaders = computed(() => 
  props.columns.map(col => ({
    key: col.key,
    title: col.title,
    type: col.type || 'text',
    sortable: false
  }))
)

const skeletonItems = computed(() => 
  Array.from({ length: props.rows }, (_, i) => {
    const item = { id: i }
    props.columns.forEach(col => {
      item[col.key] = null // Placeholder for skeleton content
    })
    return item
  })
)

function getColumnType(type) {
  const typeMap = {
    text: 'text',
    chip: 'chip',
    button: 'button',
    avatar: 'avatar',
    image: 'image',
    number: 'text'
  }
  return typeMap[type] || 'text'
}

function getColumnWidth(type) {
  const widthMap = {
    text: '80%',
    chip: '60px',
    button: '40px',
    avatar: '40px',
    image: '60px',
    number: '60%'
  }
  return widthMap[type] || '70%'
}
</script>

<style scoped>
.skeleton-table {
  transition: opacity 0.3s ease;
}

:deep(.skeleton-data-table .v-skeleton-loader__bone) {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-surface-variant), 0.8) 25%, 
    rgba(var(--v-theme-surface-variant), 0.4) 50%, 
    rgba(var(--v-theme-surface-variant), 0.8) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>