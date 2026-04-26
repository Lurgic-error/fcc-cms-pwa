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
import { usePublicationCategoriesStore } from '@/stores/publications/usePublicationCategoriesStore'

const config = getResourceConfig('publicationCategories')
const router = useRouter()
const categoriesStore = usePublicationCategoriesStore()

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

    archived.value = await categoriesStore.listArchivedCategories(query)
    pagination.total = Number(categoriesStore.pagination.total || archived.value.length || 0)
    pagination.totalPages = Number(
      categoriesStore.pagination.totalPages ||
        Math.max(1, Math.ceil(pagination.total / pagination.limit)),
    )
  } catch (err) {
    error.value = err?.message || 'Failed to load archived categories.'
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
        eyebrow="Category Archive"
        title="Archived categories"
        description="Categories removed from active management appear here. Open a record to restore it when reactivation is needed."
        :actions="headerActions"
        :loading="loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="workspace-shell">
      <WorkspacePanel eyebrow="Archive filters" title="Search archived categories">
        <OverviewFilterBar
          :search-query="search"
          search-label="Search archive"
          search-placeholder="Search archived categories"
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
        description="Review archived publication categories and open a record when it needs to be restored or inspected."
        :records="archived"
        :columns="config.columns"
        :row-key="config.idKey"
        :loading="loading"
        :show-create="false"
        :show-refresh="false"
        :show-search="false"
        :actions="[{ key: 'view', label: 'View', type: 'primary' }]"
        empty-text="No archived categories found."
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
