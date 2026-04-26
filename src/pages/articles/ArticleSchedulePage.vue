<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { schedulerAPI } from '@/api'
import EntityScheduleWorkspace from '@/components/enterprise/EntityScheduleWorkspace.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
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

const headerActions = Object.freeze([
  { key: 'refreshSchedules', label: 'Refresh schedules', group: 'workspace' },
  { key: 'viewDetails', label: 'View details', group: 'navigation' },
])

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
    return
  } finally {
    submitting.value = false
  }

  await Promise.all([loadArticle(), loadSchedules()])
}

async function runScheduleAction({ scheduleId, action }) {
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

async function onHeaderAction(action) {
  if (action?.key === 'refreshSchedules') {
    await Promise.all([loadArticle(), loadSchedules()])
    return
  }

  if (action?.key === 'viewDetails' && articleId.value) {
    await router.push({ name: 'articles.details', params: { articleId: articleId.value } })
  }
}

async function goBack() {
  await router.push({ name: 'articles.list' })
}

onMounted(async () => {
  await Promise.all([loadArticle(), loadSchedules()])
})
</script>

<template>
  <EntityScheduleWorkspace
    title="Schedule Article"
    description="Plan publish and unpublish times for this article."
    :header-actions="headerActions"
    :loading-header="loadingRecord || loadingSchedules || submitting"
    back-label="Back to list"
    :error="errorMessage"
    :loading-record="loadingRecord"
    :loading-schedules="loadingSchedules"
    record-title="Selected article"
    record-description="Scheduling is configured against this article record."
    :record-status="articleStatus"
    :record-status-label="articleStatus"
    :schedules="schedules"
    :action-loading-id="actionLoadingId"
    empty-text="No schedules have been created for this article yet."
    @select="onHeaderAction"
    @back="goBack"
    @refresh-schedules="loadSchedules"
    @run-schedule-action="runScheduleAction"
  >
    <template #record>
      <p class="workspace-panel__description">{{ articleTitle }}</p>
    </template>

    <template #form>
      <el-form label-position="top" class="workspace-form" @submit.prevent="scheduleAction">
        <AppFormRow :columns="3">
          <el-form-item label="Action">
            <el-select v-model="form.action" size="large">
              <el-option label="Publish" value="publish" />
              <el-option label="Unpublish" value="unpublish" />
            </el-select>
          </el-form-item>

          <el-form-item label="Run At">
            <el-date-picker
              v-model="form.runAt"
              type="datetime"
              size="large"
              placeholder="Select date and time"
            />
          </el-form-item>

          <el-form-item label="Timezone">
            <el-input v-model="form.timezone" size="large" />
          </el-form-item>
        </AppFormRow>

        <div class="workspace-form__actions">
          <el-button type="primary" size="large" :loading="submitting" native-type="submit">
            Save Schedule
          </el-button>
        </div>
      </el-form>
    </template>
  </EntityScheduleWorkspace>
</template>
