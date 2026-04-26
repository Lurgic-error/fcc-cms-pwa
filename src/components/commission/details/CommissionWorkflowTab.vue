<script setup>
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { formatDisplayDate, getStatusLabel } from '@/utils/adminPresentation'

defineProps({
  record: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <AppBentoGrid columns="2">
    <AppDetailCard title="Workflow State" subtitle="Editorial and lifecycle state">
      <AppDetailGrid :columns="1">
        <AppDetailItem label="Current Status">
          <StatusBadge :value="record.effectiveStatus || record.publicationStatus" />
        </AppDetailItem>
        <AppDetailItem label="Status Label">
          {{ getStatusLabel(record.effectiveStatus || record.publicationStatus) }}
        </AppDetailItem>
        <AppDetailItem
          label="Scheduled Publish"
          :value="formatDisplayDate(record.scheduledPublishAt)"
        />
        <AppDetailItem
          label="Scheduled Unpublish"
          :value="formatDisplayDate(record.scheduledUnpublishAt)"
        />
        <AppDetailItem label="Archived" :value="record.isArchived ? 'Yes' : 'No'" />
        <AppDetailItem label="Deleted" :value="record.isDeleted ? 'Yes' : 'No'" />
      </AppDetailGrid>
    </AppDetailCard>

    <AppDetailCard title="Workflow Metadata" subtitle="Audit trail for the current state">
      <AppDetailGrid :columns="1">
        <AppDetailItem label="Submitted At" :value="formatDisplayDate(record.submittedAt)" />
        <AppDetailItem label="Approved At" :value="formatDisplayDate(record.approvedAt)" />
        <AppDetailItem label="Rejected At" :value="formatDisplayDate(record.rejectedAt)" />
        <AppDetailItem label="Published At" :value="formatDisplayDate(record.publishedAt)" />
        <AppDetailItem label="Unpublished At" :value="formatDisplayDate(record.unpublishedAt)" />
        <AppDetailItem label="Archived At" :value="formatDisplayDate(record.archivedAt)" />
        <AppDetailItem label="Deleted At" :value="formatDisplayDate(record.deletedAt)" />
        <AppDetailItem
          label="Last Modified"
          :value="formatDisplayDate(record.lastModifiedAt || record.updatedAt)"
        />
      </AppDetailGrid>
    </AppDetailCard>
  </AppBentoGrid>
</template>
