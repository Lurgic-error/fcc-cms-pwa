<script setup>
import { computed } from 'vue'

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
  <section
    class="border p-5 shadow-sm"
    style="
      background-color: var(--fcc-surface);
      border-color: var(--fcc-border);
      border-radius: var(--fcc-radius-lg);
      box-shadow: var(--fcc-shadow-base);
    "
  >
    <header class="mb-4 space-y-1">
      <h2 class="text-base font-semibold" style="color: var(--fcc-text)">{{ title }}</h2>
      <p class="text-sm" style="color: var(--fcc-text-muted)">{{ description }}</p>
    </header>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="fact in facts"
        :key="fact.key"
        class="border px-4 py-3"
        style="
          background-color: var(--fcc-surface-muted);
          border-color: var(--fcc-border);
          border-radius: var(--fcc-radius-md);
        "
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.16em]"
          style="color: var(--fcc-text-muted)"
        >
          {{ fact.label }}
        </p>
        <div class="mt-2">
          <StatusBadge v-if="fact.badge" :value="fact.value" />
          <p v-else class="text-sm font-medium" style="color: var(--fcc-text)">{{ fact.value }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
