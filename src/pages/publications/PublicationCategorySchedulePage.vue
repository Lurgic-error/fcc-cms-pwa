<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { schedulerAPI } from '@/api'
import EntityScheduleWorkspace from '@/components/enterprise/EntityScheduleWorkspace.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import { usePublicationCategoriesStore } from '@/stores/publications/usePublicationCategoriesStore'
import { getEffectiveWorkflowStatus, withWorkflowState } from '@/utils/contentWorkflow'
import { extractErrorMessage } from '@/utils/httpError'
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

const headerActions = Object.freeze([
  { key: 'refreshSchedules', label: 'Refresh schedules', group: 'workspace' },
  { key: 'viewDetails', label: 'View details', group: 'navigation' },
])

const form = reactive({
  action: 'publish',
  runAt: null,
  timezone: 'Africa/Dar_es_Salaam',
})

const categoryTitle = computed(() => resolveLocalizedLabel(category.value, 'Untitled category'))
const categoryStatus = computed(() => getEffectiveWorkflowStatus(category.value))

const canSchedulePublish = computed(() => {
  const status = categoryStatus.value
  return status === 'approved' || status === 'unpublished'
})

const canScheduleUnpublish = computed(() => categoryStatus.value === 'published')

async function loadCategory() {
  if (!categoryId.value) return
  loadingRecord.value = true
  errorMessage.value = ''

  try {
    category.value = withWorkflowState(await categoriesStore.findCategory(categoryId.value))
  } catch (err) {
    errorMessage.value = extractErrorMessage(err, 'Failed to load category.')
  } finally {
    loadingRecord.value = false
  }
}

async function loadSchedules() {
  if (!categoryId.value) return
  loadingSchedules.value = true
  errorMessage.value = ''

  const response = await schedulerAPI.listSchedules({
    contentType: 'publicationCategories',
    contentId: categoryId.value,
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
    errorMessage.value = extractErrorMessage(err, 'Scheduling failed.')
    return
  } finally {
    submitting.value = false
  }

  await Promise.all([loadCategory(), loadSchedules()])
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

  await Promise.all([loadCategory(), loadSchedules()])
}

async function onHeaderAction(action) {
  if (action?.key === 'refreshSchedules') {
    await Promise.all([loadCategory(), loadSchedules()])
    return
  }

  if (action?.key === 'viewDetails' && categoryId.value) {
    await router.push({
      name: 'publicationCategories.details',
      params: { categoryId: categoryId.value },
    })
  }
}

async function goBack() {
  await router.push({ name: 'publicationCategories.list' })
}

onMounted(async () => {
  await Promise.all([loadCategory(), loadSchedules()])
})
</script>

<template>
  <EntityScheduleWorkspace
    title="Schedule Category"
    description="Plan publish and unpublish times for this publication category."
    :header-actions="headerActions"
    :loading-header="loadingRecord || loadingSchedules || submitting"
    back-label="Back to list"
    :error="errorMessage"
    :loading-record="loadingRecord"
    :loading-schedules="loadingSchedules"
    record-title="Selected category"
    record-description="Scheduling is configured against this category record."
    :record-status="categoryStatus"
    :record-status-label="categoryStatus"
    :schedules="schedules"
    :action-loading-id="actionLoadingId"
    empty-text="No schedules have been created for this category yet."
    @select="onHeaderAction"
    @back="goBack"
    @refresh-schedules="loadSchedules"
    @run-schedule-action="runScheduleAction"
  >
    <template #notices>
      <el-alert
        v-if="form.action === 'publish' && !canSchedulePublish && category"
        type="warning"
        show-icon
        :closable="false"
        title="Category cannot be scheduled for publishing in its current state."
        description="The category must first be approved before it can be scheduled for publishing."
      />
    </template>

    <template #record>
      <p class="workspace-panel__description">{{ categoryTitle }}</p>
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
