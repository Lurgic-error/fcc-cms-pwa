<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
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
import { useRouter } from 'vue-router'

const router = useRouter()
const visitorsStore = useVisitorsStore()
const { visitors, visitor, summary, hotspots, pagination, loading, error } =
  storeToRefs(visitorsStore)

const pageLoading = ref(false)
const headerActions = Object.freeze([
  { key: 'refreshOverview', label: 'Refresh Overview' },
  { key: 'openAnalytics', label: 'Open Analytics' },
  { key: 'openHeatmap', label: 'Open Heatmap' },
])
const analyticsWindowOptions = Object.freeze([
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
])
const analyticsLimitOptions = Object.freeze([
  { value: 5, label: 'Top 5' },
  { value: 8, label: 'Top 8' },
  { value: 10, label: 'Top 10' },
])
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

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push({ name: 'dashboard.overview' })
}

async function onHeaderAction(action) {
  switch (action?.key) {
    case 'refreshOverview':
      await refreshAll()
      return
    case 'openAnalytics':
      await router.push({ name: 'visitors.analytics' })
      return
    case 'openHeatmap':
      await router.push({ name: 'visitors.heatmap' })
      return
    default:
  }
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
      <EnterprisePageHeader
        eyebrow="Admin Overview"
        title="Visitors"
        description="Monitor visitor volume, recent traffic patterns, hotspot behavior, and individual visitor records from one management page."
        :actions="headerActions"
        :loading="pageLoading || loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="enterprise-stack">
      <WorkspacePanel
        class="enterprise-filter-surface"
        eyebrow="Analytics controls"
        title="Adjust the reporting window and leaderboard scope"
      >
        <el-form label-position="top" class="workspace-form" @submit.prevent="refreshAll">
          <AppFormRow :columns="3">
            <el-form-item label="Analytics Window" class="form-item-flush">
              <el-select v-model="analytics.days" size="large" @change="refreshAll">
                <el-option
                  v-for="option in analyticsWindowOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Leaderboard Size" class="form-item-flush">
              <el-select
                v-model="analytics.limit"
                size="large"
                @change="refreshAll"
              >
                <el-option
                  v-for="option in analyticsLimitOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </el-form-item>

            <div class="app-form-row__action">
              <el-button
                size="large"
                plain
                native-type="submit"
                :loading="pageLoading || loading"
              >
                Refresh Data
              </el-button>
            </div>
          </AppFormRow>
        </el-form>
      </WorkspacePanel>

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

      <div class="enterprise-list-toolbar">
        <OverviewFilterBar
          class="enterprise-list-toolbar__filter"
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

        <section class="enterprise-support-card enterprise-list-toolbar__support">
          <header class="enterprise-support-card__header">
            <h3 class="enterprise-support-card__title">Traffic Highlights</h3>
            <p class="enterprise-support-card__description">
              Quick context from referrers and latest tracked activity.
            </p>
          </header>

          <div class="enterprise-support-card__sections">
            <section class="enterprise-support-card__section">
              <p class="enterprise-support-card__section-title">
                Top Referrers
              </p>
              <div v-if="hotspots.topReferrers?.length" class="enterprise-support-list">
                <div
                  v-for="item in hotspots.topReferrers.slice(0, 4)"
                  :key="item.referrer"
                  class="enterprise-support-item"
                >
                  <p class="enterprise-support-item__title enterprise-support-item__title--truncate">
                    {{ item.referrer || 'Direct / Unknown' }}
                  </p>
                  <p class="enterprise-support-item__meta enterprise-support-item__meta--compact">
                    {{ Number(item.visits || 0).toLocaleString() }} visits
                  </p>
                </div>
              </div>
              <el-empty v-else description="No referrer data." :image-size="64" />
            </section>

            <section class="enterprise-support-card__section">
              <p class="enterprise-support-card__section-title">
                Recent Activity
              </p>
              <div v-if="hotspots.recentActivity?.length" class="enterprise-support-list">
                <div
                  v-for="item in hotspots.recentActivity.slice(0, 4)"
                  :key="`${item.visitorId}-${item.visitedAt}-${item.path}`"
                  class="enterprise-support-item"
                >
                  <p class="enterprise-support-item__title">
                    {{ item.path || 'Unknown path' }}
                  </p>
                  <p class="enterprise-support-item__meta enterprise-support-item__meta--compact">
                    {{ item.visitorId }} • {{ formatDisplayDate(item.visitedAt) }}
                  </p>
                </div>
              </div>
              <el-empty v-else description="No recent activity." :image-size="64" />
            </section>
          </div>
        </section>
      </div>

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
