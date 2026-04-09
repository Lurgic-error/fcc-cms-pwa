<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import PageWrapper from '@/components/common/PageWrapper.vue'
import TablePagination from '@/components/common/TablePagination.vue'
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

onMounted(loadArchive)
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Category Archive
          </p>
          <h1 class="text-3xl font-semibold text-slate-950">Archived categories</h1>
          <p class="max-w-4xl text-sm text-slate-600">
            Categories removed from active management appear here. Open a record to restore it when
            reactivation is needed.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <el-button plain :loading="loading" @click="loadArchive">Refresh</el-button>
          <el-button type="primary" @click="router.push({ name: 'publicationCategories.list' })">
            All Categories
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
          placeholder="Search archived categories"
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
        empty-text="No archived categories found."
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
