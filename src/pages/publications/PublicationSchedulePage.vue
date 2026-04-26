<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { schedulerAPI } from '@/api'
import EntityScheduleWorkspace from '@/components/enterprise/EntityScheduleWorkspace.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
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

const headerActions = Object.freeze([
  { key: 'refreshSchedules', label: 'Refresh schedules', group: 'workspace' },
  { key: 'viewDetails', label: 'View details', group: 'navigation' },
])

const categoryStatus = computed(() => String(category.value?.publicationStatus || '').toLowerCase())
const isCategoryPublished = computed(() => categoryStatus.value === 'published')
const canCategorySupportPublishing = computed(() =>
  ['approved', 'published', 'unpublished', 'scheduled'].includes(categoryStatus.value),
)

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

async function publishCategory() {
  if (!category.value?.categoryId) return
  submitting.value = true
  errorMessage.value = ''

  try {
    await categoriesStore.publish(category.value.categoryId)
    await loadPublication()
  } catch (err) {
    errorMessage.value = extractErrorMessage(err, 'Failed to publish category.')
  } finally {
    submitting.value = false
  }
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

  const categoryId =
    publication.value?.category?.categoryId ||
    publication.value?.category?._id ||
    publication.value?.category

  category.value = null
  if (categoryId && typeof categoryId === 'string') {
    try {
      category.value = await categoriesStore.findCategory(categoryId)
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
    errorMessage.value = extractErrorMessage(response.error, 'Failed to load schedules.')
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
    return
  } finally {
    submitting.value = false
  }

  await Promise.all([loadPublication(), loadSchedules()])
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

  await Promise.all([loadPublication(), loadSchedules()])
}

async function onHeaderAction(action) {
  if (action?.key === 'refreshSchedules') {
    await Promise.all([loadPublication(), loadSchedules()])
    return
  }

  if (action?.key === 'viewDetails' && publicationId.value) {
    await router.push({
      name: 'publications.details',
      params: { publicationId: publicationId.value },
    })
  }
}

async function goBack() {
  await router.push({ name: 'publications.list' })
}

onMounted(async () => {
  await Promise.all([loadPublication(), loadSchedules()])
})
</script>

<template>
  <EntityScheduleWorkspace
    title="Schedule Publication"
    description="Plan publish and unpublish times for this publication."
    :header-actions="headerActions"
    :loading-header="loadingRecord || loadingSchedules || submitting"
    back-label="Back to list"
    :error="errorMessage"
    :loading-record="loadingRecord"
    :loading-schedules="loadingSchedules"
    record-title="Selected publication"
    record-description="Scheduling is configured against this publication record."
    :record-status="publicationStatus"
    :record-status-label="publicationStatus"
    :schedules="schedules"
    :action-loading-id="actionLoadingId"
    empty-text="No schedules have been created for this publication yet."
    @select="onHeaderAction"
    @back="goBack"
    @refresh-schedules="loadSchedules"
    @run-schedule-action="runScheduleAction"
  >
    <template #notices>
      <el-alert
        v-if="category && form.action === 'publish' && !isCategoryPublished"
        :type="canCategorySupportPublishing ? 'info' : 'warning'"
        show-icon
        :closable="false"
      >
        <template #title>
          Category "{{ category.name?.en || category.name }}" is {{ categoryStatus || 'draft' }}.
        </template>
        <template #default>
          <div class="schedule-notice">
            <span>
              {{
                canCategorySupportPublishing
                  ? 'When this schedule runs, the publication will go live and its category will be published automatically if needed.'
                  : 'Approve this category first before scheduling publication publishing.'
              }}
            </span>
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
    </template>

    <template #record>
      <p class="workspace-panel__description">{{ publicationTitle }}</p>
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
