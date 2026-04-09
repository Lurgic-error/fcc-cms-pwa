<script setup>
import { schedulerAPI } from '@/api'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useArticlesStore } from '@/stores/useArticlesStore'
import { extractErrorMessage } from '@/utils/httpError'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()

const articleId = computed(() => String(route.params?.articleId || ''))

const loadingRecord = ref(false)
const loadingSchedules = ref(false)
const submitting = ref(false)
const actionLoadingId = ref('')
const errorMessage = ref('')

const article = ref(null)
const schedules = ref([])

const form = reactive({
  action: 'publish',
  runAt: null,
  timezone: 'Africa/Dar_es_Salaam',
})

function resolveText(value) {
  if (typeof value === 'string' && value.trim()) return value
  if (!value || typeof value !== 'object') return ''
  if (typeof value.en === 'string' && value.en.trim()) return value.en
  if (typeof value.sw === 'string' && value.sw.trim()) return value.sw
  const first = Object.values(value).find((entry) => typeof entry === 'string' && entry.trim())
  return first || ''
}

const articleTitle = computed(() => resolveText(article.value?.title) || 'Untitled article')

const articleStatus = computed(() => {
  if (article.value?.publicationStatus) return String(article.value.publicationStatus)
  if (article.value?.status) return String(article.value.status)
  if (article.value?.published === true) return 'published'
  if (article.value?.published === false) return 'unpublished'
  return 'draft'
})

const statusTagType = computed(() => {
  const status = String(articleStatus.value || '').toLowerCase()
  if (status === 'published') return 'success'
  if (status === 'approved') return 'info'
  if (status === 'scheduled') return 'warning'
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

async function loadArticle() {
  if (!articleId.value) return
  loadingRecord.value = true
  errorMessage.value = ''

  try {
    article.value = await articlesStore.findArticle(articleId.value)
  } catch (error) {
    errorMessage.value = extractErrorMessage(error, 'Failed to load article.')
  } finally {
    loadingRecord.value = false
  }
}

async function loadSchedules() {
  if (!articleId.value) return
  loadingSchedules.value = true
  errorMessage.value = ''

  const response = await schedulerAPI.listSchedules({
    contentType: 'articles',
    contentId: articleId.value,
    limit: 50,
  })

  loadingSchedules.value = false

  if (response?.error) {
    errorMessage.value = extractErrorMessage(response.error, 'Failed to load schedules.')
    return
  }

  schedules.value = response?.data || []
}

async function scheduleAction() {
  if (!articleId.value) return
  if (!form.runAt) {
    errorMessage.value = 'Please select a schedule date and time.'
    return
  }

  const scheduleAt = new Date(form.runAt)
  if (Number.isNaN(scheduleAt.getTime())) {
    errorMessage.value = 'Schedule date/time is invalid.'
    return
  }

  if (scheduleAt.getTime() <= Date.now()) {
    errorMessage.value = 'Please choose a future date and time.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  try {
    if (form.action === 'publish') {
      await articlesStore.schedulePublish(articleId.value, {
        scheduledPublishAt: scheduleAt.toISOString(),
        timezone: form.timezone,
      })
    } else {
      await articlesStore.scheduleUnpublish(articleId.value, {
        scheduledUnpublishAt: scheduleAt.toISOString(),
        timezone: form.timezone,
      })
    }
  } catch (error) {
    errorMessage.value = extractErrorMessage(error, 'Scheduling failed.')
    submitting.value = false
    return
  } finally {
    submitting.value = false
  }

  await Promise.all([loadArticle(), loadSchedules()])
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

  await Promise.all([loadArticle(), loadSchedules()])
}

async function goBack() {
  if (window.history.length > 1) {
    await router.back()
    return
  }
  await router.push('/dashboard')
}

onMounted(async () => {
  await Promise.all([loadArticle(), loadSchedules()])
})
</script>

<template>
  <page-wrapper
    title="Schedule Article"
    description="Plan publish and unpublish times for this article."
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
            <h3 class="text-base font-semibold">{{ articleTitle }}</h3>
            <p class="text-sm text-slate-600">
              Scheduling is configured against this article record.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <el-tag :type="statusTagType" effect="light">
              {{ articleStatus }}
            </el-tag>
            <el-button @click="goBack">Back</el-button>
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
