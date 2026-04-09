<script setup>
import { schedulerAPI } from '@/api'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { usePublicationCategoriesStore } from '@/stores/publications/usePublicationCategoriesStore'
import { usePublicationsStore } from '@/stores/publications/usePublicationsStore'
import { getEffectiveWorkflowStatus, withWorkflowState } from '@/utils/contentWorkflow'
import { extractErrorMessage } from '@/utils/httpError'

const route = useRoute()
const router = useRouter()
const publicationsStore = usePublicationsStore()
const categoriesStore = usePublicationCategoriesStore()

const publicationId = computed(() => String(route.params?.publicationId || ''))

const loadingRecord = ref(false)
const loadingSchedules = ref(false)
const submitting = ref(false)
const actionLoadingId = ref('')
const errorMessage = ref('')

const publication = ref(null)
const category = ref(null)
const schedules = ref([])

const categoryStatus = computed(() => {
  const status = String(category.value?.publicationStatus || '').toLowerCase()
  return status
})
const isCategoryPublished = computed(() => categoryStatus.value === 'published')
const canCategorySupportPublishing = computed(() =>
  ['approved', 'published', 'unpublished', 'scheduled'].includes(categoryStatus.value),
)

async function publishCategory() {
  if (!category.value?.categoryId) return
  submitting.value = true
  errorMessage.value = ''
  try {
    await categoriesStore.publish(category.value.categoryId)
    await loadPublication()
  } catch (err) {
    errorMessage.value = err?.message || 'Failed to publish category.'
  } finally {
    submitting.value = false
  }
}

const form = reactive({
  action: 'publish',
  runAt: null,
  timezone: 'Africa/Dar_es_Salaam',
})

const publicationTitle = computed(() => {
  const name = publication.value?.name
  if (typeof name === 'string' && name.trim()) return name
  if (name?.en) return name.en
  if (name?.sw) return name.sw
  return 'Untitled publication'
})

const publicationStatus = computed(() => getEffectiveWorkflowStatus(publication.value))

const statusTagType = computed(() => {
  const status = String(publicationStatus.value || '').toLowerCase()
  if (status === 'published') return 'success'
  if (status === 'approved') return 'info'
  if (status === 'scheduled') return 'warning'
  if (status === 'expired') return 'danger'
  if (status === 'unpublished') return 'danger'
  return ''
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

async function loadPublication() {
  if (!publicationId.value) return
  loadingRecord.value = true
  errorMessage.value = ''

  try {
    publication.value = withWorkflowState(
      await publicationsStore.findPublication(publicationId.value),
    )
  } catch (err) {
    errorMessage.value = extractErrorMessage(err, 'Failed to load publication.')
    loadingRecord.value = false
    return
  }

  loadingRecord.value = false

  // Fetch category if linked
  const catId =
    publication.value?.category?.categoryId ||
    publication.value?.category?._id ||
    publication.value?.category
  category.value = null
  if (catId && typeof catId === 'string') {
    try {
      category.value = await categoriesStore.findCategory(catId)
    } catch {
      category.value = null
    }
  }
}

async function loadSchedules() {
  if (!publicationId.value) return
  loadingSchedules.value = true
  errorMessage.value = ''

  const response = await schedulerAPI.listSchedules({
    contentType: 'publications',
    contentId: publicationId.value,
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
  if (!publicationId.value) return
  if (!form.runAt) {
    errorMessage.value = 'Please select a schedule date and time.'
    return
  }

  const scheduleAt = new Date(form.runAt)
  if (Number.isNaN(scheduleAt.getTime())) {
    errorMessage.value = 'Schedule date/time is invalid.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  if (form.action === 'publish' && category.value && !canCategorySupportPublishing.value) {
    errorMessage.value =
      'This publication cannot be scheduled for publishing until its category has been approved.'
    submitting.value = false
    return
  }

  try {
    if (form.action === 'publish') {
      await publicationsStore.schedulePublish(publicationId.value, {
        scheduledPublishAt: scheduleAt.toISOString(),
        timezone: form.timezone,
      })
    } else {
      await publicationsStore.scheduleUnpublish(publicationId.value, {
        scheduledUnpublishAt: scheduleAt.toISOString(),
        timezone: form.timezone,
      })
    }
  } catch (err) {
    errorMessage.value = extractErrorMessage(err, 'Scheduling failed.')
    submitting.value = false
    return
  }

  submitting.value = false

  await Promise.all([loadPublication(), loadSchedules()])
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
    errorMessage.value = extractErrorMessage(response.error, `Failed to ${action} schedule.`)
    return
  }

  await Promise.all([loadPublication(), loadSchedules()])
}

async function goToDetails() {
  if (!publicationId.value) return
  await router.push({
    name: 'publications.details',
    params: { publicationId: publicationId.value },
  })
}

async function goToList() {
  await router.push({ name: 'publications.list' })
}

onMounted(async () => {
  await Promise.all([loadPublication(), loadSchedules()])
})
</script>

<template>
  <page-wrapper
    title="Schedule Publication"
    description="Plan publish and unpublish times for this publication."
  >
    <div class="space-y-4">
      <el-alert
        v-if="errorMessage"
        type="error"
        show-icon
        :closable="false"
        :title="errorMessage"
      />

      <el-alert
        v-if="category && form.action === 'publish' && !isCategoryPublished"
        :type="canCategorySupportPublishing ? 'info' : 'warning'"
        show-icon
        :closable="false"
        class="mb-4"
      >
        <template #title>
          Category "{{ category.name?.en || category.name }}" is {{ categoryStatus || 'draft' }}.
        </template>
        <template #default>
          <div class="flex items-center justify-between">
            <span>{{
              canCategorySupportPublishing
                ? 'When this schedule runs, the publication will go live and its category will be published automatically if needed.'
                : 'Approve this category first before scheduling publication publishing.'
            }}</span>
            <el-button
              v-if="!canCategorySupportPublishing"
              type="warning"
              size="small"
              plain
              :loading="submitting"
              @click="publishCategory"
            >
              Publish Category Now
            </el-button>
          </div>
        </template>
      </el-alert>

      <el-card shadow="never" v-loading="loadingRecord">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold">{{ publicationTitle }}</h3>
            <p class="text-sm text-slate-600">
              Scheduling is configured against this publication record.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <el-tag :type="statusTagType" effect="light">
              {{ publicationStatus || 'draft' }}
            </el-tag>
            <el-button @click="goToList">Back to List</el-button>
            <el-button type="primary" plain @click="goToDetails">View Details</el-button>
          </div>
        </div>
      </el-card>

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
      </el-card>
    </div>
  </page-wrapper>
</template>
