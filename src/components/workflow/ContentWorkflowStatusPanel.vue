<script setup>
import { computed } from 'vue'

import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { getWorkflowSchedule } from '@/utils/contentWorkflow'

const props = defineProps({
  record: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: 'Lifecycle Summary',
  },
  description: {
    type: String,
    default: 'Current workflow, visibility, and scheduling state for this record.',
  },
})

const schedule = computed(() => getWorkflowSchedule(props.record || {}))
const effectiveStatus = computed(
  () =>
    props.record?.effectiveStatus ||
    props.record?.publicationStatus ||
    props.record?.status ||
    'draft',
)
const facts = computed(() => [
  {
    key: 'workflow',
    label: 'Workflow Status',
    badge: true,
    value: effectiveStatus.value,
  },
  {
    key: 'archived',
    label: 'Archived',
    value: props.record?.isArchived || props.record?.archived ? 'Yes' : 'No',
  },
  {
    key: 'deleted',
    label: 'Deleted',
    value: props.record?.isDeleted || props.record?.deleted ? 'Yes' : 'No',
  },
  {
    key: 'publishSchedule',
    label: 'Publish Schedule',
    value: schedule.value.hasPublishSchedule
      ? formatDisplayDate(schedule.value.scheduledPublishAt)
      : 'Not scheduled',
  },
  {
    key: 'unpublishSchedule',
    label: 'Unpublish Schedule',
    value: schedule.value.hasUnpublishSchedule
      ? formatDisplayDate(schedule.value.scheduledUnpublishAt)
      : 'Not scheduled',
  },
  {
    key: 'updatedAt',
    label: 'Last Updated',
    value: formatDisplayDate(
      props.record?.updatedAt || props.record?.lastModifiedAt || props.record?.createdAt,
    ),
  },
])
</script>

<template>
  <AppSurfaceSection
    class="content-workflow-status-panel"
    :title="title"
    :subtitle="description"
    title-tag="h2"
  >
    <div class="content-workflow-status-panel__grid">
      <article
        v-for="fact in facts"
        :key="fact.key"
        class="content-workflow-status-panel__fact"
      >
        <p class="content-workflow-status-panel__label">
          {{ fact.label }}
        </p>
        <div class="content-workflow-status-panel__value">
          <StatusBadge v-if="fact.badge" :value="fact.value" />
          <p v-else class="content-workflow-status-panel__text">{{ fact.value }}</p>
        </div>
      </article>
    </div>
  </AppSurfaceSection>
</template>
