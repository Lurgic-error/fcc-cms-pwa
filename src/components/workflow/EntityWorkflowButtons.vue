<script setup>
import { computed } from 'vue'

import { getEffectiveWorkflowStatus } from '@/utils/contentWorkflow'
import EntityActionsDropdown from './EntityActionsDropdown.vue'

const props = defineProps({
  record: { type: Object, default: null },
  disabled: { type: Boolean, default: false },
  showSoftDelete: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
})

const emit = defineEmits([
  'submit',
  'approve',
  'reject',
  'publish',
  'unpublish',
  'archive',
  'restore',
  'restoreArchived',
  'softDelete',
  'delete',
])

const actions = computed(() => {
  const status = getEffectiveWorkflowStatus(props.record || {})
  const isArchived = props.record?.isArchived === true || status === 'archived'
  const isDeleted = props.record?.isDeleted === true || status === 'deleted'

  if (isDeleted) {
    return [{ key: 'restore', label: 'Restore', type: 'success' }]
  }

  const nextActions = []

  if (['draft', 'unpublished', 'rejected'].includes(status)) {
    nextActions.push({ key: 'submit', label: 'Submit for Review', type: 'info' })
  }

  if (status === 'submitted') {
    nextActions.push(
      { key: 'approve', label: 'Approve', type: 'success' },
      { key: 'reject', label: 'Reject', type: 'danger', plain: true },
    )
  }

  if (status === 'approved') {
    nextActions.push({ key: 'publish', label: 'Publish', type: 'primary' })
  }

  if (status === 'published') {
    nextActions.push({ key: 'unpublish', label: 'Unpublish', type: 'warning', plain: true })
  }

  if (isArchived) {
    nextActions.push({
      key: 'restoreArchived',
      label: 'Restore Archive',
      type: 'success',
      plain: true,
    })
  } else {
    nextActions.push({ key: 'archive', label: 'Archive', type: 'info', plain: true })
  }

  if (props.showSoftDelete) {
    nextActions.push({ key: 'softDelete', label: 'Soft Delete', type: 'danger', plain: true })
  }

  if (props.showDelete) {
    nextActions.push({ key: 'delete', label: 'Delete', type: 'danger' })
  }

  return nextActions
})

function onAction(key) {
  emit(key)
}
</script>

<template>
  <EntityActionsDropdown
    :actions="
      actions.map((action) => ({ ...action, group: 'workflow', danger: action.type === 'danger' }))
    "
    label="Workflow Actions"
    size="large"
    plain
    :disabled="disabled"
    @select="onAction($event.key)"
  />
</template>
