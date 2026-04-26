<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import ReviewQueueWorkspace from '@/components/enterprise/ReviewQueueWorkspace.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('publicationCategories')
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
    emptyText: 'No categories are currently submitted for review.',
  },
  {
    name: 'approved-ready',
    label: `Approved & Ready (${approved.value.length})`,
    records: approved.value,
    columns: config.columns,
    rowKey: config.idKey,
    actions: [{ key: 'view', label: 'View', type: 'primary' }],
    emptyText: 'No approved categories waiting to be published.',
  },
])

async function loadQueues() {
  loading.value = true
  error.value = ''

  try {
    const [submittedRes, approvedRes] = await Promise.all([
      publicationsAPI.listPublicationCategories({
        publicationStatus: 'submitted',
        page: 1,
        limit: 100,
      }),
      publicationsAPI.listPublicationCategories({
        publicationStatus: 'approved',
        page: 1,
        limit: 100,
      }),
    ])

    if (submittedRes?.error) throw submittedRes.error
    if (approvedRes?.error) throw approvedRes.error

    submitted.value = submittedRes?.categories || submittedRes?.items || []
    approved.value = approvedRes?.categories || approvedRes?.items || []
  } catch (err) {
    error.value = err?.message || 'Failed to load category review queues.'
  } finally {
    loading.value = false
  }
}

function goToDetails(row) {
  const id = row?.categoryId || row?._id
  if (!id) return
  router.push({ name: 'publicationCategories.details', params: { categoryId: id } })
}

function goBack() {
  router.push({ name: 'publicationCategories.list' })
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
    eyebrow="Category Review Queue"
    title="Review pending categories"
    description="Categories submitted for approval appear here. Open each one to approve, reject, or publish."
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
