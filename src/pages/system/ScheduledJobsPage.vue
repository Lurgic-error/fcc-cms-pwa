<script setup>
import EntityRelationshipSelect from '@/components/forms/EntityRelationshipSelect.vue'
import { articlesAPI, eventsAPI, inquiriesAPI, publicationsAPI, schedulerAPI } from '@/api'
import { computed, onMounted, reactive, ref, watch } from 'vue'

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

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed' },
]

const jobOptions = [
  { label: 'All Job Types', value: '' },
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

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function scheduleTypeLabel(schedule = {}) {
  const type = schedule?.data?.contentType || '-'
  const action =
    schedule?.data?.action || (schedule.jobName === 'unpublishContent' ? 'unpublish' : 'publish')
  return `${type} / ${action}`
}

function scheduleStatusType(status = '') {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'success'
  if (value === 'paused') return 'warning'
  if (value === 'cancelled') return 'danger'
  if (value === 'completed') return 'info'
  return ''
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
    errorMessage.value =
      response.error?.response?.data?.error ||
      response.error?.message ||
      'Failed to load schedules.'
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
    errorMessage.value =
      response.error?.response?.data?.error ||
      response.error?.message ||
      'Failed to create schedule.'
    return
  }

  createForm.contentId = ''
  createForm.runAt = null
  await fetchSchedules({ resetPage: true })
}

async function runAction(scheduleId, action) {
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

  await fetchSchedules()
}

onMounted(async () => {
  await fetchSchedules()
})
</script>

<template>
  <page-wrapper
    title="Scheduled Jobs"
    description="Create and manage Agenda-backed publish/unpublish schedules."
  >
    <div class="space-y-4">
      <el-alert
        v-if="errorMessage"
        :closable="false"
        show-icon
        type="error"
        :title="errorMessage"
      />

      <el-card shadow="never">
        <template #header>
          <span class="font-semibold">Create Schedule</span>
        </template>

        <el-form label-position="top">
          <AppFormRow :columns="5">
            <el-form-item label="Content Type">
              <el-select v-model="createForm.contentType">
                <el-option
                  v-for="option in contentTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Action">
              <el-select v-model="createForm.action">
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
              <el-input v-else v-model="createForm.contentId" placeholder="Enter notice ID" />
            </el-form-item>

            <el-form-item label="Run At">
              <el-date-picker
                v-model="createForm.runAt"
                type="datetime"
                placeholder="Select date and time"
              />
            </el-form-item>

            <el-form-item label="Timezone">
              <el-input v-model="createForm.timezone" placeholder="Africa/Dar_es_Salaam" />
            </el-form-item>
          </AppFormRow>

          <div class="mt-4">
            <el-button type="primary" @click="createSchedule">Create Schedule</el-button>
          </div>
        </el-form>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="font-semibold">Manage Schedules</span>
            <el-button :loading="loading" @click="fetchSchedules">Refresh</el-button>
          </div>
        </template>

        <AppFormRow :columns="6" class="mb-3">
          <el-select v-model="filters.status" @change="fetchSchedules({ resetPage: true })">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-select v-model="filters.jobName" @change="fetchSchedules({ resetPage: true })">
            <el-option
              v-for="option in jobOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-select
            v-model="filters.contentType"
            clearable
            placeholder="Filter by content type"
            @change="fetchSchedules({ resetPage: true })"
          >
            <el-option
              v-for="option in contentTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-input
            v-model="filters.contentId"
            clearable
            placeholder="Filter by content ID"
            @keyup.enter="fetchSchedules({ resetPage: true })"
          />

          <el-input
            v-model="filters.q"
            clearable
            placeholder="Search by name/description"
            @keyup.enter="fetchSchedules({ resetPage: true })"
          />

          <el-button
            :loading="loading"
            type="primary"
            plain
            @click="fetchSchedules({ resetPage: true })"
            >Apply Filters</el-button
          >
        </AppFormRow>

        <el-table v-loading="loading" :data="schedules" stripe size="small">
          <el-table-column prop="name" label="Name" min-width="220" />
          <el-table-column label="Target" min-width="180">
            <template #default="{ row }">{{ scheduleTypeLabel(row) }}</template>
          </el-table-column>
          <el-table-column label="Content ID" min-width="180">
            <template #default="{ row }">{{ row?.data?.contentId || '-' }}</template>
          </el-table-column>
          <el-table-column label="Run At" min-width="190">
            <template #default="{ row }">{{ formatDate(row?.runAt) }}</template>
          </el-table-column>
          <el-table-column label="Status" width="130">
            <template #default="{ row }">
              <el-tag :type="scheduleStatusType(row?.status)" effect="light">{{
                row?.status || '-'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Created" min-width="180">
            <template #default="{ row }">{{ formatDate(row?.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="Actions" min-width="280" fixed="right">
            <template #default="{ row }">
              <div class="flex flex-wrap gap-2">
                <el-button
                  size="small"
                  :loading="actionLoadingId === `${row.scheduleId}:runNow`"
                  @click="runAction(row.scheduleId, 'runNow')"
                >
                  Run Now
                </el-button>

                <el-button
                  v-if="row.status === 'active'"
                  size="small"
                  type="warning"
                  :loading="actionLoadingId === `${row.scheduleId}:pause`"
                  @click="runAction(row.scheduleId, 'pause')"
                >
                  Pause
                </el-button>

                <el-button
                  v-if="row.status === 'paused'"
                  size="small"
                  type="success"
                  :loading="actionLoadingId === `${row.scheduleId}:resume`"
                  @click="runAction(row.scheduleId, 'resume')"
                >
                  Resume
                </el-button>

                <el-button
                  v-if="row.status !== 'cancelled' && row.status !== 'completed'"
                  size="small"
                  type="danger"
                  :loading="actionLoadingId === `${row.scheduleId}:cancel`"
                  @click="runAction(row.scheduleId, 'cancel')"
                >
                  Cancel
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-4 flex items-center justify-between gap-2 text-sm text-slate-600">
          <span>Total: {{ total }}</span>
          <div class="flex items-center gap-2">
            <el-button
              :disabled="page <= 1 || loading"
              @click="
                () => {
                  page -= 1
                  fetchSchedules()
                }
              "
              >Prev</el-button
            >
            <span>Page {{ page }} / {{ totalPages }}</span>
            <el-button
              :disabled="page >= totalPages || loading"
              @click="
                () => {
                  page += 1
                  fetchSchedules()
                }
              "
              >Next</el-button
            >
          </div>
        </div>
      </el-card>
    </div>
  </page-wrapper>
</template>
