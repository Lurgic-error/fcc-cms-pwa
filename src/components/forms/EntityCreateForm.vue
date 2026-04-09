<script setup>
import EntitySchemaForm from './EntitySchemaForm.vue'

defineProps({
  title: { type: String, default: 'Create' },
  subtitle: { type: String, default: '' },
  schema: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  wizard: { type: [Boolean, Object], default: false },
})

defineEmits(['update:modelValue', 'submit', 'cancel'])
</script>

<template>
  <EntitySchemaForm
    :title="title"
    :subtitle="subtitle"
    :schema="schema"
    :model-value="modelValue"
    :loading="loading"
    :error="error"
    :wizard="wizard"
    submit-label="Create"
    @update:model-value="$emit('update:modelValue', $event)"
    @submit="$emit('submit', $event)"
    @cancel="$emit('cancel')"
  />
</template>
