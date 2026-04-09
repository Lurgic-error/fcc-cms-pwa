<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import EntityDetailsPanel from '@/components/enterprise/EntityDetailsPanel.vue'
import OverviewChartCard from '@/components/enterprise/OverviewChartCard.vue'
import OverviewFilterBar from '@/components/enterprise/OverviewFilterBar.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityTable from '@/components/tables/EntityTable.vue'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { useVisitorsStore } from '@/stores/useVisitorsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'

const visitorsStore = useVisitorsStore()
const { visitors, visitor, summary, hotspots, pagination, loading, error } =
  storeToRefs(visitorsStore)

const pageLoading = ref(false)
const analytics = reactive({
  days: 30,
  limit: 8,
})

const filters = reactive({
  search: '',
  isActive: '',
  page: 1,
  limit: 25,
})

const tableColumns = computed(() => [
  { key: 'visitorId', label: 'Visitor ID', minWidth: 190 },
  { key: 'ipAddress', label: 'IP Address', minWidth: 170 },
  { key: 'visitCount', label: 'Visits', minWidth: 100 },
  {
    key: 'pagesVisited',
    label: 'Pages Tracked',
    minWidth: 130,
    formatter: (row) => String(Array.isArray(row?.pagesVisited) ? row.pagesVisited.length : 0),
  },
  {
    key: 'lastVisit',
    label: 'Last Visit',
    minWidth: 180,
    formatter: (row) => formatDisplayDate(row?.lastVisit),
  },
  {
    key: 'status',
    label: 'Status',
    type: 'status',
    minWidth: 120,
    formatter: (row) => (row?.isActive ? 'active' : 'inactive'),
  },
])

const visitorDetailFields = computed(() => [
  { key: 'visitorId', label: 'Visitor ID' },
  { key: 'visitorToken', label: 'Token' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'visitCount', label: 'Visit Count' },
  {
    key: 'pagesVisited',
    label: 'Tracked Pages',
    formatter: (row) => String(Array.isArray(row?.pagesVisited) ? row.pagesVisited.length : 0),
  },
  {
    key: 'firstVisitAt',
    label: 'First Visit',
    formatter: (row) => formatDisplayDate(row?.firstVisitAt),
  },
  {
    key: 'lastVisit',
    label: 'Last Visit',
    formatter: (row) => formatDisplayDate(row?.lastVisit),
  },
  {
    key: 'status',
    label: 'Status',
    formatter: (row) => (row?.isActive ? 'active' : 'inactive'),
  },
  { key: 'userAgent', label: 'User Agent' },
])

const filterFields = computed(() => [
  {
    key: 'isActive',
    type: 'select',
    label: 'Activity',
    placeholder: 'Filter by activity',
    options: [
      { label: 'Active', value: 'true' },
      { label: 'Inactive', value: 'false' },
    ],
  },
])

const repeatVisitors = computed(
  () => (visitors.value || []).filter((item) => Number(item?.visitCount || 0) > 1).length,
)

const newVisitors = computed(
  () => (visitors.value || []).filter((item) => Number(item?.visitCount || 0) <= 1).length,
)

const activeVisitors = computed(
  () => (visitors.value || []).filter((item) => item?.isActive === true).length,
)

const stats = computed(() => [
  {
    key: 'total',
    label: 'Total Visitors',
    value: summary.value.totalVisitors || 0,
    helper: 'All tracked visitors',
  },
  {
    key: 'today',
    label: 'Today',
    value: summary.value.todayVisitors || 0,
    helper: 'Visitors recorded today',
  },
  {
    key: 'week',
    label: 'This Week',
    value: summary.value.thisWeekVisitors || 0,
    helper: 'Seven-day activity',
  },
  {
    key: 'month',
    label: 'This Month',
    value: summary.value.thisMonthVisitors || 0,
    helper: 'Current month traffic',
  },
  {
    key: 'online',
    label: 'Online',
    value: summary.value.onlineVisitors || 0,
    helper: 'Active visitors right now',
  },
  {
    key: 'repeat',
    label: 'Repeat Visitors',
    value: repeatVisitors.value,
    helper: 'Current result set',
  },
  {
    key: 'new',
    label: 'New Visitors',
    value: newVisitors.value,
    helper: 'Current result set',
  },
  {
    key: 'active',
    label: 'Active in Table',
    value: activeVisitors.value,
    helper: 'Current result set',
  },
])

const visitsTrendData = computed(() => {
  const grouped = (hotspots.value.recentActivity || []).reduce((accumulator, item) => {
    const value = item?.visitedAt
    if (!value) return accumulator

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return accumulator

    const key = parsed.toISOString().slice(0, 10)
    accumulator[key] = (accumulator[key] || 0) + 1
    return accumulator
  }, {})

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-7)
    .map(([date, value]) => ({
      label: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value,
    }))
})

const topPagesData = computed(() =>
  (hotspots.value.topPages || []).slice(0, 6).map((item) => ({
    key: item?.path,
    label: item?.path || 'Unknown path',
    value: Number(item?.views || 0),
  })),
)

const localeDistributionData = computed(() =>
  (hotspots.value.topLocales || []).slice(0, 6).map((item) => ({
    key: item?.locale,
    label: item?.locale || 'Unknown',
    value: Number(item?.visits || 0),
  })),
)

async function refreshList() {
  await visitorsStore.listVisitors({
    page: filters.page,
    limit: filters.limit,
    search: filters.search.trim() || undefined,
    isActive: filters.isActive === '' ? undefined : filters.isActive === 'true',
  })
}

async function refreshAll() {
  pageLoading.value = true

  try {
    await visitorsStore.fetchSummary()
    await visitorsStore.fetchHotspots({
      days: analytics.days,
      limit: analytics.limit,
    })
    await refreshList()
  } finally {
    pageLoading.value = false
  }
}

async function loadVisitor(row) {
  if (!row?.visitorId) return
  await visitorsStore.findVisitor(row.visitorId)
}

async function setPage(page) {
  filters.page = page
  await refreshList()
}

async function setLimit(limit) {
  filters.limit = limit
  filters.page = 1
  await refreshList()
}

async function applyFilters() {
  filters.page = 1
  await refreshList()
}

async function resetFilters() {
  filters.search = ''
  filters.isActive = ''
  filters.page = 1
  await refreshList()
}

function updateFilterValues(values = {}) {
  filters.isActive = values.isActive || ''
}

let searchTimer = null
watch(
  () => filters.search,
  () => {
    window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(() => {
      filters.page = 1
      refreshList()
    }, 280)
  },
)

onMounted(refreshAll)
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Admin Overview
          </p>
          <h1 class="text-2xl font-semibold text-slate-950">Visitors</h1>
          <p class="max-w-3xl text-sm text-slate-600">
            Monitor visitor volume, recent traffic patterns, hotspot behavior, and individual
            visitor records from one management page.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <el-select v-model="analytics.days" class="w-36">
            <el-option :value="7" label="7 days" />
            <el-option :value="14" label="14 days" />
            <el-option :value="30" label="30 days" />
            <el-option :value="90" label="90 days" />
          </el-select>
          <el-select v-model="analytics.limit" class="w-36">
            <el-option :value="5" label="Top 5" />
            <el-option :value="8" label="Top 8" />
            <el-option :value="10" label="Top 10" />
          </el-select>
          <el-button plain :loading="pageLoading || loading" @click="refreshAll">Refresh</el-button>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <OverviewStatsGrid :stats="stats" />

      <AppBentoGrid columns="3">
        <OverviewChartCard
          title="Visits Over Time"
          description="Recent tracked visit activity across the selected hotspot window."
          type="line"
          :data="visitsTrendData"
        />
        <OverviewChartCard
          title="Top Pages"
          description="Most-visited tracked paths in the selected window."
          type="bar"
          :data="topPagesData"
        />
        <OverviewChartCard
          title="Locale Distribution"
          description="Visitor language or locale mix from tracked activity."
          type="pie"
          :data="localeDistributionData"
        />
      </AppBentoGrid>

      <AppBentoGrid columns="2">
        <OverviewFilterBar
          :search-query="filters.search"
          search-placeholder="Search visitor ID, token, IP, or user agent..."
          :filter-fields="filterFields"
          :filter-values="{ isActive: filters.isActive }"
          :loading="pageLoading || loading"
          @update:search-query="filters.search = $event"
          @update:filter-values="updateFilterValues"
          @apply="applyFilters"
          @reset="resetFilters"
        />

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <header class="mb-4">
            <h3 class="text-base font-semibold text-slate-950">Traffic Highlights</h3>
            <p class="mt-1 text-sm text-slate-500">
              Quick context from referrers and latest tracked activity.
            </p>
          </header>

          <div class="space-y-4">
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Top Referrers
              </p>
              <div v-if="hotspots.topReferrers?.length" class="space-y-2">
                <div
                  v-for="item in hotspots.topReferrers.slice(0, 4)"
                  :key="item.referrer"
                  class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <p class="truncate text-sm font-medium text-slate-900">
                    {{ item.referrer || 'Direct / Unknown' }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ Number(item.visits || 0).toLocaleString() }} visits
                  </p>
                </div>
              </div>
              <el-empty v-else description="No referrer data." :image-size="64" />
            </div>

            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recent Activity
              </p>
              <div v-if="hotspots.recentActivity?.length" class="space-y-2">
                <div
                  v-for="item in hotspots.recentActivity.slice(0, 4)"
                  :key="`${item.visitorId}-${item.visitedAt}-${item.path}`"
                  class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <p class="text-sm font-medium text-slate-900">
                    {{ item.path || 'Unknown path' }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ item.visitorId }} • {{ formatDisplayDate(item.visitedAt) }}
                  </p>
                </div>
              </div>
              <el-empty v-else description="No recent activity." :image-size="64" />
            </div>
          </div>
        </section>
      </AppBentoGrid>

      <EntityTable
        title="Visitor Records"
        description="Search, filter, and inspect visitor activity records. Select a row to load detailed visitor context."
        :records="visitors"
        :columns="tableColumns"
        row-key="visitorId"
        :loading="pageLoading || loading"
        :error="error || ''"
        :show-search="false"
        :show-refresh="false"
        :show-create="false"
        @row-click="loadVisitor"
      />

      <TablePagination
        :pagination="pagination"
        :loading="pageLoading || loading"
        @update:page="setPage"
        @update:limit="setLimit"
      />

      <EntityDetailsPanel
        v-if="visitor"
        title="Visitor Details"
        subtitle="Inspect the selected visitor's token, session footprint, and last known activity."
        :record="visitor"
        :fields="visitorDetailFields"
        :loading="loading"
        :error="error || ''"
      />
    </div>
  </PageWrapper>
</template>
