<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import {
  articlesAPI,
  eventsAPI,
  inquiriesAPI,
  publicationsAPI,
  schedulerAPI,
} from '@/api'
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import OverviewFilterBar from '@/components/enterprise/OverviewFilterBar.vue'
import ScheduleJobsTable from '@/components/enterprise/ScheduleJobsTable.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import EntityRelationshipSelect from '@/components/forms/EntityRelationshipSelect.vue'
import { extractErrorMessage } from '@/utils/httpError'

const router = useRouter()

const loading = ref(false)
const actionLoadingId = ref('')
const errorMessage = ref('')
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const schedules = ref([])

const filters = reactive({
  status: '',
  jobName: '',
  contentType: '',
  contentId: '',
  q: '',
})

const createForm = reactive({
  contentType: 'publications',
  action: 'publish',
  contentId: '',
  runAt: null,
  timezone: 'Africa/Dar_es_Salaam',
})

const headerActions = Object.freeze([{ key: 'refreshSchedules', label: 'Refresh schedules' }])

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
]

const jobOptions = [
  { label: 'Publish Content', value: 'publishContent' },
  { label: 'Unpublish Content', value: 'unpublishContent' },
]

const contentTypeOptions = [
  { label: 'Publications', value: 'publications' },
  { label: 'Articles', value: 'articles' },
  { label: 'Events', value: 'events' },
  { label: 'Inquiries', value: 'inquiries' },
  { label: 'Notices', value: 'notices' },
]

const actionOptions = [
  { label: 'Publish', value: 'publish' },
  { label: 'Unpublish', value: 'unpublish' },
]

const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)))
const supportsScheduledSelector = computed(() => createForm.contentType !== 'notices')

const filterFields = computed(() => [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Filter by status',
    options: statusOptions,
  },
  {
    key: 'jobName',
    label: 'Job Type',
    type: 'select',
    placeholder: 'Filter by job type',
    options: jobOptions,
  },
  {
    key: 'contentType',
    label: 'Content Type',
    type: 'select',
    placeholder: 'Filter by content type',
    options: contentTypeOptions,
  },
  {
    key: 'contentId',
    label: 'Content ID',
    placeholder: 'Filter by content ID',
  },
])

function normalizeCollection(response, keys = []) {
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }

  return Array.isArray(response?.items) ? response.items : []
}

function resolveScheduledContentLabel(item = {}) {
  return (
    item?.title?.en ||
    item?.title?.sw ||
    item?.name?.en ||
    item?.name?.sw ||
    item?.title ||
    item?.name ||
    item?.subject ||
    item?.slug ||
    item?.code ||
    item?.inquiryId ||
    item?.publicationId ||
    item?.articleId ||
    item?.eventId ||
    'Untitled content'
  )
}

async function loadScheduledContentOptions({ model = {} } = {}) {
  const contentType = model?.contentType || createForm.contentType

  if (contentType === 'publications') {
    const response = await publicationsAPI.listPublications({ page: 1, limit: 200 })
    return normalizeCollection(response, ['publications']).map((item) => ({
      value: item?.publicationId,
      label: resolveScheduledContentLabel(item),
    }))
  }

  if (contentType === 'articles') {
    const response = await articlesAPI.listArticles({ page: 1, limit: 200 })
    return normalizeCollection(response, ['articles']).map((item) => ({
      value: item?.articleId,
      label: resolveScheduledContentLabel(item),
    }))
  }

  if (contentType === 'events') {
    const response = await eventsAPI.listEvents({ page: 1, limit: 200 })
    return normalizeCollection(response, ['events']).map((item) => ({
      value: item?.eventId,
      label: resolveScheduledContentLabel(item),
    }))
  }

  if (contentType === 'inquiries') {
    const response = await inquiriesAPI.listInquiries({ page: 1, limit: 200 })
    return normalizeCollection(response, ['inquiries']).map((item) => ({
      value: item?.inquiryId,
      label: resolveScheduledContentLabel(item),
    }))
  }

  return []
}

const scheduledContentField = {
  placeholder: 'Select content',
  dependsOn: ['contentType'],
  loadOptions: loadScheduledContentOptions,
}

watch(
  () => createForm.contentType,
  () => {
    createForm.contentId = ''
  },
)

async function fetchSchedules({ resetPage = false } = {}) {
  if (resetPage) page.value = 1
  loading.value = true
  errorMessage.value = ''

  const query = {
    page: page.value,
    limit: limit.value,
    ...filters,
  }

  Object.keys(query).forEach((key) => {
    if (query[key] === '' || query[key] == null) delete query[key]
  })

  const response = await schedulerAPI.listSchedules(query)
  loading.value = false

  if (response?.error) {
    errorMessage.value = extractErrorMessage(response.error, 'Failed to load schedules.')
    return
  }

  schedules.value = response?.data || []
  total.value = Number(response?.total || 0)
}

async function createSchedule() {
  errorMessage.value = ''

  const runAtDate = new Date(createForm.runAt)
  const contentId = String(createForm.contentId || '').trim()

  if (!contentId) {
    errorMessage.value = 'Content target is required.'
    return
  }

  if (Number.isNaN(runAtDate.getTime())) {
    errorMessage.value = 'Run time must be a valid date/time.'
    return
  }

  if (runAtDate.getTime() <= Date.now()) {
    errorMessage.value = 'Choose a future date and time.'
    return
  }

  const isUnpublish = createForm.action === 'unpublish'
  const response = await schedulerAPI.createSchedule({
    name: `${createForm.action}:${createForm.contentType}:${contentId}`,
    description: `Manual ${createForm.action} schedule from system scheduler`,
    jobName: isUnpublish ? 'unpublishContent' : 'publishContent',
    type: 'once',
    runAt: runAtDate.toISOString(),
    timezone: createForm.timezone || 'UTC',
    data: {
      action: createForm.action,
      contentType: createForm.contentType,
      contentId,
    },
  })

  if (response?.error) {
    errorMessage.value = extractErrorMessage(response.error, 'Failed to create schedule.')
    return
  }

  createForm.contentId = ''
  createForm.runAt = null
  await fetchSchedules({ resetPage: true })
}

async function runAction({ scheduleId, action }) {
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

  await fetchSchedules()
}

function resetFilters() {
  filters.status = ''
  filters.jobName = ''
  filters.contentType = ''
  filters.contentId = ''
  filters.q = ''
  fetchSchedules({ resetPage: true })
}

async function onHeaderAction(action) {
  if (action?.key === 'refreshSchedules') {
    await fetchSchedules()
  }
}

async function goBack() {
  await router.push({ name: 'dashboard.overview' })
}

onMounted(async () => {
  await fetchSchedules()
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="System scheduling"
        title="Scheduled Jobs"
        description="Create and manage Agenda-backed publish and unpublish schedules."
        :actions="headerActions"
        :loading="loading"
        back-label="Back to dashboard"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="workspace-shell">
      <el-alert
        v-if="errorMessage"
        :closable="false"
        show-icon
        type="error"
        :title="errorMessage"
      />

      <WorkspacePanel
        eyebrow="Manual schedule creation"
        title="Create Schedule"
        description="Target a record, choose the workflow action, and set the run time for the scheduler."
      >
        <el-form label-position="top" class="workspace-form" @submit.prevent="createSchedule">
          <AppFormRow :columns="5">
            <el-form-item label="Content Type">
              <el-select v-model="createForm.contentType" size="large">
                <el-option
                  v-for="option in contentTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Action">
              <el-select v-model="createForm.action" size="large">
                <el-option
                  v-for="option in actionOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Content">
              <EntityRelationshipSelect
                v-if="supportsScheduledSelector"
                v-model="createForm.contentId"
                :field="scheduledContentField"
                :model="createForm"
              />
              <el-input v-else v-model="createForm.contentId" size="large" placeholder="Enter notice ID" />
            </el-form-item>

            <el-form-item label="Run At">
              <el-date-picker
                v-model="createForm.runAt"
                type="datetime"
                size="large"
                placeholder="Select date and time"
              />
            </el-form-item>

            <el-form-item label="Timezone">
              <el-input v-model="createForm.timezone" size="large" placeholder="Africa/Dar_es_Salaam" />
            </el-form-item>
          </AppFormRow>

          <div class="workspace-form__actions">
            <el-button type="primary" size="large" native-type="submit">Create Schedule</el-button>
          </div>
        </el-form>
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Scheduler monitor"
        title="Manage Schedules"
        description="Filter the queue, inspect scheduled targets, and operate jobs without leaving the workspace."
      >
        <OverviewFilterBar
          :search-query="filters.q"
          search-label="Search schedules"
          search-placeholder="Search by name or description"
          :filter-fields="filterFields"
          :filter-values="filters"
          apply-label="Apply filters"
          reset-label="Clear filters"
          :loading="loading"
          :framed="false"
          @update:search-query="filters.q = $event"
          @update:filter-values="Object.assign(filters, $event)"
          @apply="fetchSchedules({ resetPage: true })"
          @reset="resetFilters"
        />

        <ScheduleJobsTable
          :records="schedules"
          :loading="loading"
          :action-loading-id="actionLoadingId"
          :show-name="true"
          :show-target="true"
          :show-content-id="true"
          metadata-date-label="Created"
          metadata-date-key="createdAt"
          empty-text="No schedules match the current filters."
          @run-action="runAction"
        />

        <div class="schedule-pagination">
          <span>Total: {{ total }}</span>
          <div class="schedule-pagination__controls">
            <el-button
              size="large"
              plain
              :disabled="page <= 1 || loading"
              @click="
                () => {
                  page -= 1
                  fetchSchedules()
                }
              "
            >
              Prev
            </el-button>

            <span>Page {{ page }} / {{ totalPages }}</span>

            <el-button
              size="large"
              plain
              :disabled="page >= totalPages || loading"
              @click="
                () => {
                  page += 1
                  fetchSchedules()
                }
              "
            >
              Next
            </el-button>
          </div>
        </div>
      </WorkspacePanel>
    </div>
  </PageWrapper>
</template>
