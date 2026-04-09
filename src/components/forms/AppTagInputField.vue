<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Array, String],
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Add a tag and press Enter',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  maxCollapseTags: {
    type: Number,
    default: 3,
  },
})

const emit = defineEmits(['update:modelValue'])

const normalizedValue = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (typeof props.modelValue === 'string') {
    return props.modelValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
})
</script>

<template>
  <el-input-tag
    :model-value="normalizedValue"
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="maxCollapseTags"
    :placeholder="placeholder"
    :disabled="disabled"
    aria-label="Add tags and press Enter after each one"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
