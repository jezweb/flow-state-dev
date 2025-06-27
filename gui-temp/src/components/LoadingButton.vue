<template>
  <v-btn
    v-bind="buttonProps"
    :disabled="disabled || loading"
    :loading="loading"
    @click="handleClick"
  >
    <!-- Loading state -->
    <template v-if="loading" v-slot:prepend>
      <v-progress-circular
        v-if="showSpinner"
        :size="spinnerSize"
        :width="spinnerWidth"
        :color="spinnerColor"
        indeterminate
      />
    </template>
    
    <!-- Normal state prepend -->
    <template v-else-if="$slots.prepend || prependIcon" v-slot:prepend>
      <slot name="prepend">
        <v-icon v-if="prependIcon" :icon="prependIcon" />
      </slot>
    </template>
    
    <!-- Button text -->
    <span v-if="loading && loadingText">{{ loadingText }}</span>
    <slot v-else />
    
    <!-- Normal state append -->
    <template v-if="!loading && ($slots.append || appendIcon)" v-slot:append>
      <slot name="append">
        <v-icon v-if="appendIcon" :icon="appendIcon" />
      </slot>
    </template>
  </v-btn>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showSpinner: {
    type: Boolean,
    default: true
  },
  spinnerSize: {
    type: Number,
    default: 16
  },
  spinnerWidth: {
    type: Number,
    default: 2
  },
  spinnerColor: {
    type: String,
    default: 'current'
  },
  prependIcon: {
    type: String,
    default: ''
  },
  appendIcon: {
    type: String,
    default: ''
  },
  // Vuetify button props passthrough
  variant: {
    type: String,
    default: 'flat'
  },
  color: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'default'
  },
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: [Boolean, String],
    default: false
  },
  elevation: {
    type: [Number, String],
    default: undefined
  }
})

const emit = defineEmits(['click'])

// Pass through props to v-btn, excluding our custom props
const buttonProps = computed(() => {
  const excludedProps = [
    'loading', 'loadingText', 'showSpinner', 'spinnerSize', 
    'spinnerWidth', 'spinnerColor', 'prependIcon', 'appendIcon'
  ]
  
  const result = {}
  Object.keys(props).forEach(key => {
    if (!excludedProps.includes(key)) {
      result[key] = props[key]
    }
  })
  
  return result
})

function handleClick(event) {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Custom loading button styles */
:deep(.v-btn--loading .v-btn__content) {
  opacity: 1 !important;
}

:deep(.v-btn--loading .v-btn__overlay) {
  opacity: 0.1;
}
</style>