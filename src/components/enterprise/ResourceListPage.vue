<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import OverviewChartCard from '@/components/enterprise/OverviewChartCard.vue'
import OverviewFilterBar from '@/components/enterprise/OverviewFilterBar.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import EntityTable from '@/components/tables/EntityTable.vue'
import BulkActionsDropdown from '@/components/workflow/BulkActionsDropdown.vue'
import { useEditorialActions } from '@/composables/useEditorialActions'
import { useEntityCrud } from '@/composables/useEntityCrud'
import { useRouteAccess } from '@/composables/useRouteAccess'
import {
  buildOverviewMetrics,
  buildRecentActivity,
  buildStatusDistribution,
  buildTrendSeries,
} from '@/utils/adminOverview'
import { formatDisplayDate, getStatusLabel } from '@/utils/adminPresentation'

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const { canAccessRoute } = useRouteAccess()
const {
  items,
  loading,
  error,
  pagination,
  fetchArchivedList,
  fetchList,
  fetchPublishedList,
  runBulkWorkflow,
  runWorkflow,
} = useEntityCrud(props.config.adapter)
const { canView, executeBulkAction, executeRecordAction, getBulkActions, getRecordActions } =
  useEditorialActions(props.config)

const extraFilterKeys = (props.config?.overview?.extraFilters || []).map((field) => field.key)

const filters = reactive({
  search: '',
  scope: 'all',
  status: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 20,
  ...Object.fromEntries(extraFilterKeys.map((key) => [key, ''])),
})

const selectedRecords = ref([])

const canCreate = computed(() => {
  const routeName = props.config?.routes?.create
  return canAccessRoute(routeName)
})

const supportedStatusOptions = computed(() => {
  const statusField = (props.config?.formSchema || []).find((field) =>
    ['publicationStatus', 'status'].includes(field?.key),
  )

  return statusField?.options || []
})

const hasPublishedScope = computed(() => typeof props.config?.adapter?.listPublished === 'function')
const hasArchivedScope = computed(() => typeof props.config?.adapter?.listArchived === 'function')
const hasDeletedScope = computed(
  () =>
    typeof props.config?.adapter?.restore === 'function' ||
    typeof props.config?.adapter?.bulkRestore === 'function',
)

const scopeOptions = computed(() => {
  const options = [{ label: 'All Records', value: 'all' }]

  if (hasPublishedScope.value) {
    options.push({ label: 'Published', value: 'published' })
  }

  if (hasArchivedScope.value) {
    options.push({ label: 'Archived', value: 'archived' })
  }

  if (hasDeletedScope.value) {
    options.push({ label: 'Deleted', value: 'deleted' })
  }

  return options
})

const statusFilterKey = computed(() => {
  const statusField = (props.config?.formSchema || []).find((field) =>
    ['publicationStatus', 'status'].includes(field?.key),
  )

  return statusField?.key || 'publicationStatus'
})

const filterFields = computed(() => {
  const fields = []

  if (scopeOptions.value.length > 1) {
    fields.push({
      key: 'scope',
      type: 'select',
      label: 'Collection',
      placeholder: 'Select collection',
      options: scopeOptions.value,
    })
  }

  if (supportedStatusOptions.value.length) {
    fields.push({
      key: 'status',
      type: 'select',
      label: 'Status',
      placeholder: 'Filter by status',
      options: supportedStatusOptions.value,
    })
  }

  if (props.config?.overview?.enableDateFilter) {
    fields.push(
      { key: 'startDate', type: 'date', label: 'From', placeholder: 'Start date' },
      { key: 'endDate', type: 'date', label: 'To', placeholder: 'End date' },
    )
  }

  if (props.config?.overview?.extraFilters) {
    fields.push(...props.config.overview.extraFilters)
  }

  return fields
})

const filterValues = computed(() =>
  Object.fromEntries(filterFields.value.map((field) => [field.key, filters[field.key] || ''])),
)

const overviewDescription = computed(
  () =>
    props.config?.overview?.description ||
    `Track ${props.config.label.toLowerCase()} status, workflow, and recent records from one admin surface.`,
)

const records = computed(() => items.value || [])
const selectedRowKeys = computed(() =>
  selectedRecords.value.map(
    (record) => props.config.adapter?.getId?.(record) || record?.[props.config.idKey],
  ),
)
const stats = computed(() => buildOverviewMetrics(records.value, pagination, props.config))
const statusDistribution = computed(() => buildStatusDistribution(records.value, props.config))
const trendSeries = computed(() => buildTrendSeries(records.value, props.config))
const recentActivity = computed(() => buildRecentActivity(records.value, props.config))
const bulkActions = computed(() => getBulkActions(selectedRecords.value))

function rowActions(row) {
  return getRecordActions(row)
}

function updateFilterValues(value = {}) {
  Object.keys(value || {}).forEach((key) => {
    if (key in filters) {
      filters[key] = value[key] || ''
    }
  })
}

async function loadList() {
  const query = {
    page: filters.page,
    limit: filters.limit,
  }

  if (filters.search?.trim()) {
    query.search = filters.search.trim()
  }

  if (filters.status) {
    query[statusFilterKey.value] = filters.status
  }

  if (filters.startDate) {
    query.startDate = filters.startDate
  }

  if (filters.endDate) {
    query.endDate = filters.endDate
  }

  extraFilterKeys.forEach((key) => {
    if (filters[key]) {
      query[key] = filters[key]
    }
  })

  if (typeof props.config.buildListQuery === 'function') {
    Object.assign(query, props.config.buildListQuery({ ...filters }))
  }

  try {
    if (filters.scope === 'published' && hasPublishedScope.value) {
      await fetchPublishedList(query)
    } else if (filters.scope === 'archived' && hasArchivedScope.value) {
      await fetchArchivedList(query)
    } else if (filters.scope === 'deleted' && hasDeletedScope.value) {
      await fetchList({
        ...query,
        includeDeleted: true,
        isDeleted: true,
      })
    } else {
      await fetchList(query)
    }
    selectedRecords.value = []
  } catch {
    // Error state is rendered in component.
  }
}

async function onCreate() {
  if (!canCreate.value) return
  await router.push({ name: props.config.routes.create })
}

async function onView(row) {
  if (!canView.value) return
  const id = props.config.adapter?.getId?.(row) || row?.[props.config.idKey]
  if (!id) return

  await router.push({
    name: props.config.routes.details,
    params: { [props.config.routeParam]: id },
  })
}

async function onRowAction({ action, row }) {
  const completed = await executeRecordAction(action, row, {
    runWorkflow,
    reload: loadList,
  })

  if (completed && action?.key === 'delete') {
    await loadList()
  }
}

async function onBulkAction(action) {
  const completed = await executeBulkAction(action, selectedRecords.value, {
    runBulkWorkflow,
    reload: loadList,
  })

  if (completed) {
    selectedRecords.value = []
  }
}

async function setPage(page) {
  filters.page = page
  await loadList()
}

async function setLimit(limit) {
  filters.limit = limit
  filters.page = 1
  await loadList()
}

async function applyFilters() {
  filters.page = 1
  await loadList()
}

async function resetFilters() {
  filters.search = ''
  filters.scope = 'all'
  filters.status = ''
  filters.startDate = ''
  filters.endDate = ''
  filters.page = 1

  extraFilterKeys.forEach((key) => {
    filters[key] = ''
  })

  await loadList()
}

let searchTimer = null
watch(
  () => filters.search,
  () => {
    window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(() => {
      filters.page = 1
      loadList()
    }, 280)
  },
)

onMounted(loadList)
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Overview
          </p>
          <h1 class="text-2xl font-semibold text-slate-950">{{ config.label }}</h1>
          <p class="max-w-3xl text-sm text-slate-600">{{ overviewDescription }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span v-if="selectedRecords.length" class="text-sm font-medium text-slate-500">
            {{ selectedRecords.length }} selected
          </span>
          <BulkActionsDropdown
            v-if="selectedRecords.length"
            :actions="bulkActions"
            :selection-count="selectedRecords.length"
            :loading="loading"
            @select="onBulkAction"
          />
          <el-button plain :loading="loading" @click="loadList">Refresh</el-button>
          <el-button v-if="canCreate" type="primary" :disabled="loading" @click="onCreate">
            Create {{ config.singular }}
          </el-button>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <OverviewStatsGrid :stats="stats" />

      <AppBentoGrid columns="2">
        <OverviewChartCard
          title="Status Distribution"
          description="Workflow and lifecycle breakdown for the current result set."
          type="pie"
          :data="statusDistribution"
        />
        <OverviewChartCard
          title="Recent Trend"
          description="Recent record activity grouped by date."
          type="line"
          :data="trendSeries"
        />
      </AppBentoGrid>

      <AppBentoGrid columns="2">
        <OverviewFilterBar
          :search-query="filters.search"
          :search-label="`Search ${config.label}`"
          :search-placeholder="config.searchPlaceholder || 'Search records...'"
          :filter-fields="filterFields"
          :filter-values="filterValues"
          :loading="loading"
          @update:search-query="filters.search = $event"
          @update:filter-values="updateFilterValues"
          @apply="applyFilters"
          @reset="resetFilters"
        />

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <header class="mb-4">
            <h3 class="text-base font-semibold text-slate-950">Recent Activity</h3>
            <p class="mt-1 text-sm text-slate-500">Latest records in the current result set.</p>
          </header>

          <div v-if="recentActivity.length" class="space-y-3">
            <article
              v-for="item in recentActivity"
              :key="`${item.title}-${item.timestamp || item.status}`"
              class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-medium text-slate-900">{{ item.title }}</p>
                  <p class="text-sm text-slate-500">{{ item.meta }}</p>
                </div>
                <el-tag effect="light" size="small">{{ getStatusLabel(item.status) }}</el-tag>
              </div>
              <p v-if="item.timestamp" class="mt-2 text-xs text-slate-500">
                {{ formatDisplayDate(item.timestamp) }}
              </p>
            </article>
          </div>

          <el-empty v-else description="No recent records to summarize." :image-size="72" />
        </section>
      </AppBentoGrid>

      <EntityTable
        title="Records"
        :description="`Search, inspect, and take action on ${config.label.toLowerCase()} records.`"
        :records="records"
        :columns="config.columns"
        :row-key="config.idKey"
        :loading="loading"
        :error="error"
        :show-search="false"
        :show-refresh="false"
        :show-create="false"
        :actions="rowActions"
        selectable
        :selected-row-keys="selectedRowKeys"
        @action="onRowAction"
        @selection-change="selectedRecords = $event"
        @row-click="onView"
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
