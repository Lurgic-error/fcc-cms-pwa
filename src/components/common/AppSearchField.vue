<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Search' },
  placeholder: { type: String, default: 'Search records' },
  clearable: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="app-search-field">
    <span class="app-search-field__label">{{ label }}</span>
    <el-input
      :model-value="modelValue"
      :placeholder="placeholder"
      :prefix-icon="Search"
      :clearable="clearable"
      :disabled="disabled"
      size="large"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </label>
</template>
