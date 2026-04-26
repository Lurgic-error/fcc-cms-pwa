<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import ScheduleJobsTable from '@/components/enterprise/ScheduleJobsTable.vue'

defineProps({
  eyebrow: {
    type: String,
    default: 'Scheduling workspace',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  headerActions: {
    type: Array,
    default: () => [],
  },
  headerActionLabel: {
    type: String,
    default: 'Actions',
  },
  backLabel: {
    type: String,
    default: 'Back',
  },
  error: {
    type: String,
    default: '',
  },
  loadingHeader: {
    type: Boolean,
    default: false,
  },
  loadingRecord: {
    type: Boolean,
    default: false,
  },
  loadingSchedules: {
    type: Boolean,
    default: false,
  },
  recordEyebrow: {
    type: String,
    default: 'Selected record',
  },
  recordTitle: {
    type: String,
    default: '',
  },
  recordDescription: {
    type: String,
    default: '',
  },
  recordStatus: {
    type: String,
    default: '',
  },
  recordStatusLabel: {
    type: String,
    default: '',
  },
  formEyebrow: {
    type: String,
    default: 'Create schedule',
  },
  formTitle: {
    type: String,
    default: 'Create Schedule',
  },
  formDescription: {
    type: String,
    default: 'Choose the action, target date, and timezone for this schedule.',
  },
  schedulesEyebrow: {
    type: String,
    default: 'Schedule monitor',
  },
  schedulesTitle: {
    type: String,
    default: 'Current Schedules',
  },
  schedulesDescription: {
    type: String,
    default: 'Review active jobs and manage the current schedule state from one place.',
  },
  schedules: {
    type: Array,
    default: () => [],
  },
  actionLoadingId: {
    type: String,
    default: '',
  },
  emptyText: {
    type: String,
    default: 'No schedules have been created yet.',
  },
})

const emit = defineEmits(['select', 'back', 'refresh-schedules', 'run-schedule-action'])
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        :eyebrow="eyebrow"
        :title="title"
        :description="description"
        :actions="headerActions"
        :action-label="headerActionLabel"
        :loading="loadingHeader"
        :show-back="true"
        :back-label="backLabel"
        @select="emit('select', $event)"
        @back="emit('back')"
      />
    </template>

    <div class="workspace-shell">
      <el-alert
        v-if="error"
        type="error"
        show-icon
        :closable="false"
        :title="error"
      />

      <slot name="notices" />

      <WorkspacePanel
        v-loading="loadingRecord"
        :eyebrow="recordEyebrow"
        :title="recordTitle"
        :description="recordDescription"
      >
        <template v-if="recordStatus || recordStatusLabel" #aside>
          <StatusBadge :value="recordStatus" :label="recordStatusLabel || recordStatus" />
        </template>
        <slot name="record" />
      </WorkspacePanel>

      <WorkspacePanel
        :eyebrow="formEyebrow"
        :title="formTitle"
        :description="formDescription"
      >
        <slot name="form" />
      </WorkspacePanel>

      <WorkspacePanel
        :eyebrow="schedulesEyebrow"
        :title="schedulesTitle"
        :description="schedulesDescription"
      >
        <template #actions>
          <el-button size="large" plain :loading="loadingSchedules" @click="emit('refresh-schedules')">
            Refresh
          </el-button>
        </template>

        <ScheduleJobsTable
          :records="schedules"
          :loading="loadingSchedules"
          :action-loading-id="actionLoadingId"
          :empty-text="emptyText"
          @run-action="emit('run-schedule-action', $event)"
        />
      </WorkspacePanel>
    </div>
  </PageWrapper>
</template>
