<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import PageWrapper from '@/components/common/PageWrapper.vue'
import EntityTable from '@/components/tables/EntityTable.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('publicationCategories')
const router = useRouter()

const loading = ref(false)
const error = ref('')
const submitted = ref([])
const approved = ref([])
const tabIndex = ref(0)

const stats = computed(() => [
  { key: 'submitted', label: 'Awaiting Review', value: submitted.value.length },
  { key: 'approved', label: 'Approved & Ready', value: approved.value.length },
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

onMounted(loadQueues)
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Category Review Queue
          </p>
          <h1 class="text-3xl font-semibold text-slate-950">Review pending categories</h1>
          <p class="max-w-4xl text-sm text-slate-600">
            Categories submitted for approval appear here. Open each one to approve, reject, or
            publish.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <el-button plain :loading="loading" @click="loadQueues">Refresh</el-button>
          <el-button type="primary" @click="router.push({ name: 'publicationCategories.list' })">
            All Categories
          </el-button>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <div class="grid grid-cols-2 gap-4">
        <el-card
          v-for="stat in stats"
          :key="stat.key"
          shadow="never"
          class="border border-slate-200"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-600">{{ stat.label }}</span>
            <strong class="text-2xl font-semibold text-slate-900">{{ stat.value }}</strong>
          </div>
        </el-card>
      </div>

      <el-tabs v-model="tabIndex" type="border-card">
        <el-tab-pane :label="`Awaiting Review (${submitted.length})`" :name="0">
          <EntityTable
            title=""
            :records="submitted"
            :columns="config.columns"
            :row-key="config.idKey"
            :loading="loading"
            :show-create="false"
            :show-refresh="false"
            :show-search="false"
            :actions="[{ key: 'view', label: 'Review', type: 'primary' }]"
            empty-text="No categories are currently submitted for review."
            @row-click="goToDetails"
            @view="goToDetails"
          />
        </el-tab-pane>

        <el-tab-pane :label="`Approved & Ready (${approved.length})`" :name="1">
          <EntityTable
            title=""
            :records="approved"
            :columns="config.columns"
            :row-key="config.idKey"
            :loading="loading"
            :show-create="false"
            :show-refresh="false"
            :show-search="false"
            :actions="[{ key: 'view', label: 'View', type: 'primary' }]"
            empty-text="No approved categories waiting to be published."
            @row-click="goToDetails"
            @view="goToDetails"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </PageWrapper>
</template>
