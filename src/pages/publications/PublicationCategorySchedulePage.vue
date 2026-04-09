<script setup>
import { schedulerAPI } from '@/api'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { usePublicationCategoriesStore } from '@/stores/publications/usePublicationCategoriesStore'
import { getEffectiveWorkflowStatus, withWorkflowState } from '@/utils/contentWorkflow'
import { resolveLocalizedLabel } from '@/utils/publicationsWorkspace'

const route = useRoute()
const router = useRouter()
const categoriesStore = usePublicationCategoriesStore()

const categoryId = computed(() => String(route.params?.categoryId || ''))

const loadingRecord = ref(false)
const loadingSchedules = ref(false)
const submitting = ref(false)
const actionLoadingId = ref('')
const errorMessage = ref('')

const category = ref(null)
const schedules = ref([])

const form = reactive({
  action: 'publish',
  runAt: null,
  timezone: 'Africa/Dar_es_Salaam',
})

const categoryTitle = computed(() => resolveLocalizedLabel(category.value, 'Untitled category'))

const categoryStatus = computed(() => getEffectiveWorkflowStatus(category.value))

const statusTagType = computed(() => {
  const status = String(categoryStatus.value || '').toLowerCase()
  if (status === 'published') return 'success'
  if (status === 'approved') return 'info'
  if (status === 'scheduled') return 'warning'
  if (status === 'unpublished') return 'danger'
  return ''
})

const canSchedulePublish = computed(() => {
  const status = categoryStatus.value
  return status === 'approved' || status === 'unpublished'
})

const canScheduleUnpublish = computed(() => {
  return categoryStatus.value === 'published'
})

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function mapScheduleAction(jobName) {
  return jobName === 'unpublishContent' ? 'Unpublish' : 'Publish'
}

function getScheduleStatusType(status = '') {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'success'
  if (value === 'paused') return 'warning'
  if (value === 'cancelled') return 'danger'
  if (value === 'completed') return 'info'
  return ''
}

async function loadCategory() {
  if (!categoryId.value) return
  loadingRecord.value = true
  errorMessage.value = ''

  try {
    category.value = withWorkflowState(await categoriesStore.findCategory(categoryId.value))
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || err?.message || 'Failed to load category.'
  } finally {
    loadingRecord.value = false
  }
}

async function loadSchedules() {
  if (!categoryId.value) return
  loadingSchedules.value = true

  const response = await schedulerAPI.listSchedules({
    contentType: 'publicationCategories',
    contentId: categoryId.value,
    limit: 50,
  })

  loadingSchedules.value = false

  if (response?.error) {
    errorMessage.value =
      response.error?.response?.data?.error ||
      response.error?.message ||
      'Failed to load schedules.'
    return
  }

  schedules.value = response?.data || []
}

async function scheduleAction() {
  if (!categoryId.value) return
  if (!form.runAt) {
    errorMessage.value = 'Please select a schedule date and time.'
    return
  }

  const scheduleAt = new Date(form.runAt)
  if (Number.isNaN(scheduleAt.getTime())) {
    errorMessage.value = 'Schedule date/time is invalid.'
    return
  }

  if (form.action === 'publish' && !canSchedulePublish.value) {
    errorMessage.value =
      'The category must be in approved or unpublished state before it can be scheduled for publishing.'
    return
  }

  if (form.action === 'unpublish' && !canScheduleUnpublish.value) {
    errorMessage.value =
      'The category must be published before it can be scheduled for unpublishing.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    if (form.action === 'publish') {
      await categoriesStore.schedulePublish(categoryId.value, {
        scheduledPublishAt: scheduleAt.toISOString(),
        timezone: form.timezone,
      })
    } else {
      await categoriesStore.scheduleUnpublish(categoryId.value, {
        scheduledUnpublishAt: scheduleAt.toISOString(),
        timezone: form.timezone,
      })
    }
  } catch (err) {
    errorMessage.value = err?.response?.data?.error || err?.message || 'Scheduling failed.'
    submitting.value = false
    return
  }

  submitting.value = false

  await Promise.all([loadCategory(), loadSchedules()])
}

async function runScheduleAction(scheduleId, action) {
  actionLoadingId.value = `${scheduleId}:${action}`
  errorMessage.value = ''

  let response = null
  if (action === 'pause') response = await schedulerAPI.pauseSchedule({ scheduleId })
  if (action === 'resume') response = await schedulerAPI.resumeSchedule({ scheduleId })
  if (action === 'cancel') response = await schedulerAPI.cancelSchedule({ scheduleId })
  if (action === 'runNow') response = await schedulerAPI.runNow({ scheduleId })

  actionLoadingId.value = ''

  if (response?.error) {
    errorMessage.value =
      response.error?.response?.data?.error ||
      response.error?.message ||
      `Failed to ${action} schedule.`
    return
  }

  await Promise.all([loadCategory(), loadSchedules()])
}

onMounted(async () => {
  await Promise.all([loadCategory(), loadSchedules()])
})
</script>

<template>
  <page-wrapper
    title="Schedule Category"
    description="Plan publish and unpublish times for this publication category."
  >
    <div class="space-y-4">
      <el-alert
        v-if="errorMessage"
        type="error"
        show-icon
        :closable="false"
        :title="errorMessage"
      />

      <el-card shadow="never" v-loading="loadingRecord">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold">{{ categoryTitle }}</h3>
            <p class="text-sm text-slate-600">
              Scheduling is configured against this category record.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <el-tag :type="statusTagType" effect="light">
              {{ categoryStatus || 'draft' }}
            </el-tag>
            <el-button @click="router.push({ name: 'publicationCategories.list' })">
              Back to List
            </el-button>
            <el-button
              type="primary"
              plain
              @click="
                router.push({ name: 'publicationCategories.details', params: { categoryId } })
              "
            >
              View Details
            </el-button>
          </div>
        </div>
      </el-card>

      <el-alert
        v-if="form.action === 'publish' && !canSchedulePublish && category"
        type="warning"
        show-icon
        :closable="false"
        title="Category cannot be scheduled for publishing in its current state."
        description="The category must first be approved before it can be scheduled for publishing."
      />

      <el-card shadow="never">
        <template #header>
          <span class="font-semibold">Create Schedule</span>
        </template>

        <el-form label-position="top">
          <AppFormRow :columns="3">
            <el-form-item label="Action">
              <el-select v-model="form.action">
                <el-option label="Publish" value="publish" />
                <el-option label="Unpublish" value="unpublish" />
              </el-select>
            </el-form-item>

            <el-form-item label="Run At">
              <el-date-picker
                v-model="form.runAt"
                type="datetime"
                placeholder="Select date and time"
              />
            </el-form-item>

            <el-form-item label="Timezone">
              <el-input v-model="form.timezone" />
            </el-form-item>
          </AppFormRow>

          <div class="mt-4">
            <el-button type="primary" :loading="submitting" @click="scheduleAction">
              Save Schedule
            </el-button>
          </div>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold">Current Schedules</span>
            <el-button :loading="loadingSchedules" @click="loadSchedules">Refresh</el-button>
          </div>
        </template>

        <el-table :data="schedules" stripe size="small" v-loading="loadingSchedules">
          <el-table-column label="Action" min-width="130">
            <template #default="{ row }">{{ mapScheduleAction(row.jobName) }}</template>
          </el-table-column>
          <el-table-column label="Run At" min-width="180">
            <template #default="{ row }">{{ formatDate(row.runAt) }}</template>
          </el-table-column>
          <el-table-column label="Status" width="130">
            <template #default="{ row }">
              <el-tag :type="getScheduleStatusType(row.status)" effect="light">
                {{ row.status || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Last Updated" min-width="170">
            <template #default="{ row }">{{
              formatDate(row.lastModifiedAt || row.updatedAt)
            }}</template>
          </el-table-column>
          <el-table-column label="Manage" min-width="260" fixed="right">
            <template #default="{ row }">
              <div class="flex flex-wrap gap-2">
                <el-button
                  size="small"
                  :loading="actionLoadingId === `${row.scheduleId}:runNow`"
                  @click="runScheduleAction(row.scheduleId, 'runNow')"
                >
                  Run Now
                </el-button>

                <el-button
                  v-if="row.status === 'active'"
                  size="small"
                  type="warning"
                  :loading="actionLoadingId === `${row.scheduleId}:pause`"
                  @click="runScheduleAction(row.scheduleId, 'pause')"
                >
                  Pause
                </el-button>

                <el-button
                  v-if="row.status === 'paused'"
                  size="small"
                  type="success"
                  :loading="actionLoadingId === `${row.scheduleId}:resume`"
                  @click="runScheduleAction(row.scheduleId, 'resume')"
                >
                  Resume
                </el-button>

                <el-button
                  v-if="row.status !== 'cancelled' && row.status !== 'completed'"
                  size="small"
                  type="danger"
                  :loading="actionLoadingId === `${row.scheduleId}:cancel`"
                  @click="runScheduleAction(row.scheduleId, 'cancel')"
                >
                  Cancel
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-empty
          v-if="!loadingSchedules && schedules.length === 0"
          description="No schedules created yet."
        />
      </el-card>
    </div>
  </page-wrapper>
</template>
