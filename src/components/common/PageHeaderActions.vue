<script setup>
import { computed } from 'vue'

import EntityActionsDropdown from '@/components/workflow/EntityActionsDropdown.vue'

const props = defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
  actionLabel: {
    type: String,
    default: 'Actions',
  },
  selectionCount: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  backLabel: {
    type: String,
    default: 'Back',
  },
  backDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'back'])

const resolvedActionLabel = computed(() =>
  props.selectionCount > 0 ? `${props.actionLabel} (${props.selectionCount})` : props.actionLabel,
)
</script>

<template>
  <div class="page-header-actions">
    <EntityActionsDropdown
      class="page-header-actions__dropdown"
      :actions="actions"
      :label="resolvedActionLabel"
      type="primary"
      size="large"
      :disabled="disabled || !actions.length"
      :loading="loading"
      @select="emit('select', $event)"
    />

    <el-button
      class="page-header-actions__back"
      size="large"
      plain
      :disabled="backDisabled"
      @click="emit('back')"
    >
      {{ backLabel }}
    </el-button>
  </div>
</template>
