<template>
  <div class="w-full">
    <label 
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      
    </label>
    
    <div class="relative">
      <div
        v-if="$slots.iconLeft"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <div class="text-gray-400 dark:text-gray-500">
          <slot name="iconLeft" />
        </div>
      </div>
      
      <input
        :id="inputId"
        :class="inputClasses"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        v-bind="$attrs"
      />
      
      <div
        v-if="$slots.iconRight"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <div class="text-gray-400 dark:text-gray-500">
          <slot name="iconRight" />
        </div>
      </div>
    </div>
    
    <p
      v-if="error"
      class="mt-1 text-sm text-red-600 dark:text-red-400"
    >
      
    </p>
    
    <p
      v-else-if="helperText"
      class="mt-1 text-sm text-gray-500 dark:text-gray-400"
    >
      
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  error?: string
  helperText?: string
  id?: string
}

const props = defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => 
  props.id || props.label?.toLowerCase().replace(/\s+/g, '-') || undefined
)

const inputClasses = computed(() => {
  const baseClasses = 'w-full border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200 focus:ring-2 focus:border-transparent'
  
  const stateClasses = props.error 
    ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
  
  const paddingClasses = 'px-3 py-2'
  
  return [baseClasses, stateClasses, paddingClasses].join(' ')
})
</script>