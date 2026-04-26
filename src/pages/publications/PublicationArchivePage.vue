<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import OverviewFilterBar from '@/components/enterprise/OverviewFilterBar.vue'
import EntityTable from '@/components/tables/EntityTable.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { usePublicationsStore } from '@/stores/publications/usePublicationsStore'

const config = getResourceConfig('publications')
const router = useRouter()
const publicationsStore = usePublicationsStore()

const loading = ref(false)
const error = ref('')
const archived = ref([])
const pagination = reactive({ page: 1, limit: 20, total: 0, totalPages: 1 })
const search = ref('')
const headerActions = Object.freeze([{ key: 'refreshArchive', label: 'Refresh Archive' }])

async function loadArchive() {
  loading.value = true
  error.value = ''
  try {
    const query = { page: pagination.page, limit: pagination.limit }
    if (search.value.trim()) query.search = search.value.trim()

    archived.value = await publicationsStore.listArchivedPublications(query)
    pagination.total = Number(publicationsStore.pagination.total || archived.value.length || 0)
    pagination.totalPages = Number(
      publicationsStore.pagination.totalPages ||
        Math.max(1, Math.ceil(pagination.total / pagination.limit)),
    )
  } catch (err) {
    error.value = err?.message || 'Failed to load archived publications.'
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
  if (action?.key !== 'refreshArchive') return
  await loadArchive()
}

async function applySearch() {
  pagination.page = 1
  await loadArchive()
}

async function clearSearch() {
  search.value = ''
  pagination.page = 1
  await loadArchive()
}

async function setPage(page) {
  pagination.page = page
  await loadArchive()
}

async function setLimit(limit) {
  pagination.limit = limit
  pagination.page = 1
  await loadArchive()
}

onMounted(loadArchive)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Publication Archive"
        title="Archived publications"
        description="Publications removed from active management appear here. Open a record to restore it when reactivation is needed."
        :actions="headerActions"
        :loading="loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="workspace-shell">
      <WorkspacePanel eyebrow="Archive filters" title="Search archived publications">
        <OverviewFilterBar
          :search-query="search"
          search-label="Search archive"
          search-placeholder="Search archived publications"
          apply-label="Apply search"
          reset-label="Clear search"
          :loading="loading"
          :error="error"
          :framed="false"
          @update:search-query="search = $event"
          @apply="applySearch"
          @reset="clearSearch"
        />
      </WorkspacePanel>

      <EntityTable
        title="Archive records"
        description="Review archived publications and open a record when it needs to be restored or inspected."
        :records="archived"
        :columns="config.columns"
        :row-key="config.idKey"
        :loading="loading"
        :show-create="false"
        :show-refresh="false"
        :show-search="false"
        :actions="[{ key: 'view', label: 'View', type: 'primary' }]"
        empty-text="No archived publications found."
        @row-click="goToDetails"
        @view="goToDetails"
      />

      <TablePagination
        :pagination="pagination"
        :loading="loading"
        @update:page="setPage"
        @update:limit="setLimit"
      />
    </div>
  </PageWrapper>
</template>
