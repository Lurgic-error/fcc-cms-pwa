<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import ReviewQueueWorkspace from '@/components/enterprise/ReviewQueueWorkspace.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('publications')
const router = useRouter()

const loading = ref(false)
const error = ref('')
const submitted = ref([])
const approved = ref([])

const headerActions = Object.freeze([{ key: 'refreshQueue', label: 'Refresh queue' }])

const stats = computed(() => [
  { key: 'submitted', label: 'Awaiting Review', value: submitted.value.length },
  { key: 'approved', label: 'Approved & Ready', value: approved.value.length },
])

const tabs = computed(() => [
  {
    name: 'awaiting-review',
    label: `Awaiting Review (${submitted.value.length})`,
    records: submitted.value,
    columns: config.columns,
    rowKey: config.idKey,
    actions: [{ key: 'view', label: 'Review', type: 'primary' }],
    emptyText: 'No publications are currently submitted for review.',
  },
  {
    name: 'approved-ready',
    label: `Approved & Ready (${approved.value.length})`,
    records: approved.value,
    columns: config.columns,
    rowKey: config.idKey,
    actions: [{ key: 'view', label: 'View', type: 'primary' }],
    emptyText: 'No approved publications waiting to be published.',
  },
])

async function loadQueues() {
  loading.value = true
  error.value = ''

  try {
    const [submittedRes, approvedRes] = await Promise.all([
      publicationsAPI.listPublications({ publicationStatus: 'submitted', page: 1, limit: 100 }),
      publicationsAPI.listPublications({ publicationStatus: 'approved', page: 1, limit: 100 }),
    ])

    if (submittedRes?.error) throw submittedRes.error
    if (approvedRes?.error) throw approvedRes.error

    submitted.value = submittedRes?.publications || submittedRes?.items || []
    approved.value = approvedRes?.publications || approvedRes?.items || []
  } catch (err) {
    error.value = err?.message || 'Failed to load review queues.'
  } finally {
    loading.value = false
  }
}

function goToDetails(row) {
  const id = config.adapter.getId(row)
  if (!id) return
  router.push({ name: 'publications.details', params: { publicationId: id } })
}

function goBack() {
  router.push({ name: 'publications.list' })
}

async function onHeaderAction(action) {
  if (action?.key === 'refreshQueue') {
    await loadQueues()
  }
}

onMounted(loadQueues)
</script>

<template>
  <ReviewQueueWorkspace
    eyebrow="Publication Review Queue"
    title="Review pending publications"
    description="Publications submitted for approval appear here. Open each one to approve, reject, or move it to the publish pipeline."
    :actions="headerActions"
    :loading="loading"
    :error="error"
    back-label="Back to list"
    :stats="stats"
    :tabs="tabs"
    @select="onHeaderAction"
    @back="goBack"
    @row-click="goToDetails"
    @view="goToDetails"
  />
</template>
