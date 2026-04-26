<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { schedulerAPI } from '@/api'
import EntityScheduleWorkspace from '@/components/enterprise/EntityScheduleWorkspace.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import { useEventsStore } from '@/stores/useEventsStore'
import { extractErrorMessage } from '@/utils/httpError'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()

const eventId = computed(() => String(route.params?.eventId || ''))

const loadingRecord = ref(false)
const loadingSchedules = ref(false)
const submitting = ref(false)
const actionLoadingId = ref('')
const errorMessage = ref('')

const event = ref(null)
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

const eventTitle = computed(() => {
  const title = event.value?.title
  if (typeof title === 'string' && title.trim()) return title
  if (title?.en) return title.en
  if (title?.sw) return title.sw
  return 'Untitled event'
})

const eventStatus = computed(() => String(event.value?.publicationStatus || 'draft'))

async function loadEvent() {
  if (!eventId.value) return
  loadingRecord.value = true
  errorMessage.value = ''

  try {
    event.value = await eventsStore.findEvent(eventId.value)
  } catch (error) {
    errorMessage.value = extractErrorMessage(error, 'Failed to load event.')
  } finally {
    loadingRecord.value = false
  }
}

async function loadSchedules() {
  if (!eventId.value) return
  loadingSchedules.value = true
  errorMessage.value = ''

  const response = await schedulerAPI.listSchedules({
    contentType: 'events',
    contentId: eventId.value,
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
  if (!eventId.value) return
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
      await eventsStore.schedulePublish(eventId.value, {
        scheduledPublishAt: scheduleAt.toISOString(),
        timezone: form.timezone,
      })
    } else {
      await eventsStore.scheduleUnpublish(eventId.value, {
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

  await Promise.all([loadEvent(), loadSchedules()])
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

  await Promise.all([loadEvent(), loadSchedules()])
}

async function onHeaderAction(action) {
  if (action?.key === 'refreshSchedules') {
    await Promise.all([loadEvent(), loadSchedules()])
    return
  }

  if (action?.key === 'viewDetails' && eventId.value) {
    await router.push({ name: 'events.details', params: { eventId: eventId.value } })
  }
}

async function goBack() {
  await router.push({ name: 'events.list' })
}

onMounted(async () => {
  await Promise.all([loadEvent(), loadSchedules()])
})
</script>

<template>
  <EntityScheduleWorkspace
    title="Schedule Event"
    description="Plan publish and unpublish times for this event."
    :header-actions="headerActions"
    :loading-header="loadingRecord || loadingSchedules || submitting"
    back-label="Back to list"
    :error="errorMessage"
    :loading-record="loadingRecord"
    :loading-schedules="loadingSchedules"
    record-title="Selected event"
    record-description="Scheduling is configured against this event record."
    :record-status="eventStatus"
    :record-status-label="eventStatus"
    :schedules="schedules"
    :action-loading-id="actionLoadingId"
    empty-text="No schedules have been created for this event yet."
    @select="onHeaderAction"
    @back="goBack"
    @refresh-schedules="loadSchedules"
    @run-schedule-action="runScheduleAction"
  >
    <template #record>
      <p class="workspace-panel__description">{{ eventTitle }}</p>
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
