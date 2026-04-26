<script setup>
import {
  formatScheduleDate,
  getScheduleActionLabel,
  getScheduleStatusType,
  resolveScheduleContentId,
  resolveScheduleTargetLabel,
} from '@/utils/schedulingWorkspace'

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  actionLoadingId: {
    type: String,
    default: '',
  },
  emptyText: {
    type: String,
    default: 'No schedules have been created yet.',
  },
  showName: {
    type: Boolean,
    default: false,
  },
  showTarget: {
    type: Boolean,
    default: false,
  },
  showContentId: {
    type: Boolean,
    default: false,
  },
  primaryDateLabel: {
    type: String,
    default: 'Run At',
  },
  primaryDateKey: {
    type: String,
    default: 'runAt',
  },
  metadataDateLabel: {
    type: String,
    default: 'Last Updated',
  },
  metadataDateKey: {
    type: String,
    default: 'lastModifiedAt',
  },
})

const emit = defineEmits(['run-action'])

function metadataDate(row = {}) {
  return row?.[props.metadataDateKey] || row?.updatedAt || row?.lastModifiedAt || row?.createdAt
}

function isActionLoading(scheduleId, action) {
  return props.actionLoadingId === `${scheduleId}:${action}`
}

function runAction(scheduleId, action) {
  emit('run-action', { scheduleId, action })
}
</script>

<template>
  <div class="schedule-jobs-table">
    <div class="schedule-jobs-table__desktop workspace-table workspace-table--scroll">
      <el-table :data="records" stripe size="small" v-loading="loading" :empty-text="emptyText">
        <el-table-column v-if="showName" prop="name" label="Name" min-width="220" />

        <el-table-column v-if="showTarget" label="Target" min-width="180">
          <template #default="{ row }">{{ resolveScheduleTargetLabel(row) }}</template>
        </el-table-column>

        <el-table-column v-if="showContentId" label="Content ID" min-width="170">
          <template #default="{ row }">{{ resolveScheduleContentId(row) }}</template>
        </el-table-column>

        <el-table-column label="Action" min-width="130">
          <template #default="{ row }">{{ getScheduleActionLabel(row.jobName) }}</template>
        </el-table-column>

        <el-table-column :label="primaryDateLabel" min-width="180">
          <template #default="{ row }">{{ formatScheduleDate(row?.[primaryDateKey]) }}</template>
        </el-table-column>

        <el-table-column label="Status" width="130">
          <template #default="{ row }">
            <el-tag :type="getScheduleStatusType(row.status)" effect="plain" round size="small">
              {{ row.status || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="metadataDateLabel" min-width="170">
          <template #default="{ row }">{{ formatScheduleDate(metadataDate(row)) }}</template>
        </el-table-column>

        <el-table-column label="Manage" min-width="280" fixed="right">
          <template #default="{ row }">
            <div class="table-row-actions">
              <el-button
                size="small"
                :loading="isActionLoading(row.scheduleId, 'runNow')"
                @click="runAction(row.scheduleId, 'runNow')"
              >
                Run Now
              </el-button>

              <el-button
                v-if="row.status === 'active'"
                size="small"
                type="warning"
                :loading="isActionLoading(row.scheduleId, 'pause')"
                @click="runAction(row.scheduleId, 'pause')"
              >
                Pause
              </el-button>

              <el-button
                v-if="row.status === 'paused'"
                size="small"
                type="success"
                :loading="isActionLoading(row.scheduleId, 'resume')"
                @click="runAction(row.scheduleId, 'resume')"
              >
                Resume
              </el-button>

              <el-button
                v-if="row.status !== 'cancelled' && row.status !== 'completed'"
                size="small"
                type="danger"
                :loading="isActionLoading(row.scheduleId, 'cancel')"
                @click="runAction(row.scheduleId, 'cancel')"
              >
                Cancel
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="schedule-jobs-mobile">
      <article
        v-for="row in records"
        :key="row.scheduleId || row.name || row.runAt"
        class="schedule-jobs-mobile__card"
      >
        <div class="schedule-jobs-mobile__rows">
          <div v-if="showName" class="schedule-jobs-mobile__row">
            <span class="schedule-jobs-mobile__label">Name</span>
            <span class="schedule-jobs-mobile__value">{{ row.name || '-' }}</span>
          </div>

          <div v-if="showTarget" class="schedule-jobs-mobile__row">
            <span class="schedule-jobs-mobile__label">Target</span>
            <span class="schedule-jobs-mobile__value">{{ resolveScheduleTargetLabel(row) }}</span>
          </div>

          <div v-if="showContentId" class="schedule-jobs-mobile__row">
            <span class="schedule-jobs-mobile__label">Content ID</span>
            <span class="schedule-jobs-mobile__value">{{ resolveScheduleContentId(row) }}</span>
          </div>

          <div class="schedule-jobs-mobile__row">
            <span class="schedule-jobs-mobile__label">Action</span>
            <span class="schedule-jobs-mobile__value">{{ getScheduleActionLabel(row.jobName) }}</span>
          </div>

          <div class="schedule-jobs-mobile__row">
            <span class="schedule-jobs-mobile__label">{{ primaryDateLabel }}</span>
            <span class="schedule-jobs-mobile__value">
              {{ formatScheduleDate(row?.[primaryDateKey]) }}
            </span>
          </div>

          <div class="schedule-jobs-mobile__row">
            <span class="schedule-jobs-mobile__label">Status</span>
            <el-tag :type="getScheduleStatusType(row.status)" effect="plain" round size="small">
              {{ row.status || '-' }}
            </el-tag>
          </div>

          <div class="schedule-jobs-mobile__row">
            <span class="schedule-jobs-mobile__label">{{ metadataDateLabel }}</span>
            <span class="schedule-jobs-mobile__value">{{ formatScheduleDate(metadataDate(row)) }}</span>
          </div>
        </div>

        <div class="table-row-actions">
          <el-button
            size="small"
            :loading="isActionLoading(row.scheduleId, 'runNow')"
            @click="runAction(row.scheduleId, 'runNow')"
          >
            Run Now
          </el-button>

          <el-button
            v-if="row.status === 'active'"
            size="small"
            type="warning"
            :loading="isActionLoading(row.scheduleId, 'pause')"
            @click="runAction(row.scheduleId, 'pause')"
          >
            Pause
          </el-button>

          <el-button
            v-if="row.status === 'paused'"
            size="small"
            type="success"
            :loading="isActionLoading(row.scheduleId, 'resume')"
            @click="runAction(row.scheduleId, 'resume')"
          >
            Resume
          </el-button>

          <el-button
            v-if="row.status !== 'cancelled' && row.status !== 'completed'"
            size="small"
            type="danger"
            :loading="isActionLoading(row.scheduleId, 'cancel')"
            @click="runAction(row.scheduleId, 'cancel')"
          >
            Cancel
          </el-button>
        </div>
      </article>

      <p v-if="!loading && !records.length" class="entity-table__empty">
        {{ emptyText }}
      </p>
    </div>
  </div>
</template>
