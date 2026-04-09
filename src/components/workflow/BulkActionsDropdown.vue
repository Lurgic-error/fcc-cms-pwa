<script setup>
import { computed } from 'vue'

import EntityActionsDropdown from './EntityActionsDropdown.vue'

const props = defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
  selectionCount: {
    type: Number,
    default: 0,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const label = computed(() =>
  props.selectionCount > 0 ? `Bulk Actions (${props.selectionCount})` : 'Bulk Actions',
)
</script>

<template>
  <EntityActionsDropdown
    :actions="actions"
    :label="label"
    type="default"
    plain
    :disabled="disabled || selectionCount === 0"
    :loading="loading"
    @select="emit('select', $event)"
  />
</template>
