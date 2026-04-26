import { computed, unref } from 'vue'

import {
  getEffectiveWorkflowStatus,
  getWorkflowSchedule,
  withWorkflowState,
  withWorkflowStateList,
} from '@/utils/contentWorkflow'

function resolveValue(source) {
  if (typeof source === 'function') {
    return source()
  }

  return unref(source)
}

export function useWorkflow(source = null) {
  const workflowState = computed(() => withWorkflowState(resolveValue(source) || {}))
  const status = computed(() => getEffectiveWorkflowStatus(workflowState.value))
  const schedule = computed(() => getWorkflowSchedule(workflowState.value))

  const isDraft = computed(() => status.value === 'draft')
  const isPublished = computed(() => status.value === 'published')
  const isArchived = computed(() => status.value === 'archived')
  const isDeleted = computed(() => status.value === 'deleted')
  const isScheduled = computed(
    () => workflowState.value.isScheduled || schedule.value.hasPublishSchedule,
  )

  function normalizeRecord(value = {}) {
    return withWorkflowState(value)
  }

  function normalizeCollection(list = []) {
    return withWorkflowStateList(list)
  }

  function resolveStatus(value = workflowState.value) {
    return getEffectiveWorkflowStatus(value)
  }

  return {
    workflowState,
    status,
    schedule,
    isDraft,
    isPublished,
    isArchived,
    isDeleted,
    isScheduled,
    normalizeRecord,
    normalizeCollection,
    resolveStatus,
  }
}
