<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import PageWrapper from '@/components/common/PageWrapper.vue'
import TablePagination from '@/components/common/TablePagination.vue'
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

onMounted(loadArchive)
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Publication Archive
          </p>
          <h1 class="text-3xl font-semibold text-slate-950">Archived publications</h1>
          <p class="max-w-4xl text-sm text-slate-600">
            Publications removed from active management appear here. Open a record to restore it
            when reactivation is needed.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <el-button plain :loading="loading" @click="loadArchive">Refresh</el-button>
          <el-button type="primary" @click="router.push({ name: 'publications.list' })">
            All Publications
          </el-button>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <el-input
          v-model="search"
          clearable
          placeholder="Search archived publications"
          @change="
            () => {
              pagination.page = 1
              loadArchive()
            }
          "
        />
      </div>

      <EntityTable
        title="Archive"
        :records="archived"
        :columns="config.columns"
        :row-key="config.idKey"
        :loading="loading"
        :show-create="false"
        :show-refresh="true"
        :show-search="false"
        :actions="[{ key: 'view', label: 'View', type: 'primary' }]"
        empty-text="No archived publications found."
        @row-click="goToDetails"
        @view="goToDetails"
        @refresh="loadArchive"
      />

      <TablePagination
        :pagination="pagination"
        :loading="loading"
        @update:page="
          (page) => {
            pagination.page = page
            loadArchive()
          }
        "
        @update:limit="
          (limit) => {
            pagination.limit = limit
            pagination.page = 1
            loadArchive()
          }
        "
      />
    </div>
  </PageWrapper>
</template>
