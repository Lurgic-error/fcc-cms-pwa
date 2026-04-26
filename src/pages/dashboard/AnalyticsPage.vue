<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { visitorsAPI } from '@/api'
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import OverviewChartCard from '@/components/enterprise/OverviewChartCard.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import {
  buildActiveSessionSeries,
  buildLocaleSeries,
  buildReferrerSeries,
  buildReturnVisitorSeries,
  buildTopPagesSeries,
  buildVisitTrendSeries,
} from '@/utils/visitorAnalytics'

const router = useRouter()

const loading = ref(false)
const loadError = ref('')
const summary = ref({
  since: null,
  totalVisitors: 0,
  totalPageViews: 0,
  onlineVisitors: 0,
  todayVisitors: 0,
  yesterdayVisitors: 0,
  thisWeekVisitors: 0,
  thisMonthVisitors: 0,
  generatedAt: null,
})
const hotspots = ref({
  windowDays: 30,
  generatedAt: null,
  topPages: [],
  topReferrers: [],
  topLocales: [],
  recentActivity: [],
})
const visitors = ref([])

const filters = reactive({
  days: 30,
  limit: 8,
})

const headerActions = Object.freeze([{ key: 'refreshAnalytics', label: 'Refresh analytics' }])

function fulfilled(result) {
  return result.status === 'fulfilled' && !result.value?.error ? result.value : null
}

const stats = computed(() => [
  { key: 'visitors', label: 'Total Visitors', value: summary.value.totalVisitors || 0 },
  { key: 'pageViews', label: 'Page Views', value: summary.value.totalPageViews || 0 },
  { key: 'live', label: 'Online Now', value: summary.value.onlineVisitors || 0 },
  { key: 'today', label: 'Today', value: summary.value.todayVisitors || 0 },
  { key: 'yesterday', label: 'Yesterday', value: summary.value.yesterdayVisitors || 0 },
  { key: 'week', label: 'This Week', value: summary.value.thisWeekVisitors || 0 },
  { key: 'month', label: 'This Month', value: summary.value.thisMonthVisitors || 0 },
  { key: 'trackedPaths', label: 'Tracked Paths', value: hotspots.value.topPages?.length || 0 },
])

const visitTrendSeries = computed(() =>
  buildVisitTrendSeries(hotspots.value.recentActivity, Math.min(filters.days, 21)),
)
const topPagesSeries = computed(() =>
  buildTopPagesSeries(hotspots.value.topPages, { limit: filters.limit }),
)
const referrerSeries = computed(() =>
  buildReferrerSeries(hotspots.value.topReferrers, { limit: Math.min(filters.limit, 6) }),
)
const localeSeries = computed(() =>
  buildLocaleSeries(hotspots.value.topLocales, { limit: Math.min(filters.limit, 6) }),
)
const returnVisitorSeries = computed(() => buildReturnVisitorSeries(visitors.value))
const activeSessionSeries = computed(() => buildActiveSessionSeries(visitors.value))

const biggestDay = computed(() =>
  visitTrendSeries.value.reduce((best, item) => (item.value > best.value ? item : best), {
    label: 'No activity yet',
    value: 0,
  }),
)

const strongestPath = computed(() => topPagesSeries.value[0]?.fullLabel || 'No tracked path yet')
const strongestSource = computed(() => referrerSeries.value[0]?.label || 'Direct / unknown')
const generatedAt = computed(() =>
  summary.value.generatedAt ? new Date(summary.value.generatedAt).toLocaleString() : '-',
)

const insightCards = computed(() => [
  {
    key: 'busiest-day',
    eyebrow: 'Busiest recent day',
    title: biggestDay.value.label,
    description: `${Number(biggestDay.value.value || 0).toLocaleString()} tracked events`,
  },
  {
    key: 'strongest-path',
    eyebrow: 'Strongest landing path',
    title: strongestPath.value,
    description: 'Most active destination in the selected visitor window.',
  },
  {
    key: 'strongest-source',
    eyebrow: 'Strongest source',
    title: strongestSource.value,
    description: `Generated at ${generatedAt.value}.`,
  },
])

async function loadAnalytics() {
  loading.value = true
  loadError.value = ''

  const [summaryResult, hotspotsResult, visitorsResult] = await Promise.allSettled([
    visitorsAPI.fetchSummary(),
    visitorsAPI.fetchHotspots({ days: filters.days, limit: Math.max(filters.limit, 20) }),
    visitorsAPI.listVisitors({ page: 1, limit: 200 }),
  ])

  const nextSummary = fulfilled(summaryResult)
  const nextHotspots = fulfilled(hotspotsResult)
  const nextVisitors = fulfilled(visitorsResult)

  if (nextSummary?.summary) {
    summary.value = { ...summary.value, ...nextSummary.summary }
  }

  if (nextHotspots?.hotspots) {
    hotspots.value = { ...hotspots.value, ...nextHotspots.hotspots }
  }

  if (Array.isArray(nextVisitors?.visitors)) {
    visitors.value = nextVisitors.visitors
  }

  const failed = [summaryResult, hotspotsResult, visitorsResult].some(
    (result) => result.status === 'rejected' || result.value?.error,
  )

  if (failed) {
    loadError.value =
      'Some analytics panels could not be refreshed. The dashboard is showing the visitor data that loaded successfully.'
  }

  loading.value = false
}

async function onHeaderAction(action) {
  if (action?.key === 'refreshAnalytics') {
    await loadAnalytics()
  }
}

async function goBack() {
  await router.push({ name: 'dashboard.overview' })
}

onMounted(loadAnalytics)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Visitor analytics"
        title="Dashboard Analytics"
        description="A visitor-first analytics workspace for live traffic, paths, sources, and engagement patterns."
        :actions="headerActions"
        :loading="loading"
        back-label="Back to dashboard"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="analytics-shell">
      <el-alert v-if="loadError" type="warning" show-icon :closable="false" :title="loadError" />

      <WorkspacePanel
        class="analytics-hero"
        eyebrow="Website intelligence"
        title="Traffic patterns at a glance"
        description="This view focuses on visitor behavior: where traffic is landing, who is returning, and which sources are actively driving the public website."
      >
        <template #actions>
          <div class="analytics-hero__actions">
            <el-select v-model="filters.days" size="large" class="analytics-hero__select">
              <el-option :value="7" label="7 days" />
              <el-option :value="14" label="14 days" />
              <el-option :value="30" label="30 days" />
              <el-option :value="90" label="90 days" />
            </el-select>
            <el-select v-model="filters.limit" size="large" class="analytics-hero__select">
              <el-option :value="5" label="Top 5" />
              <el-option :value="8" label="Top 8" />
              <el-option :value="10" label="Top 10" />
            </el-select>
            <el-button type="primary" size="large" :loading="loading" @click="loadAnalytics">
              Refresh
            </el-button>
          </div>
        </template>
      </WorkspacePanel>

      <OverviewStatsGrid :stats="stats" />

      <section class="analytics-insights">
        <WorkspacePanel
          v-for="card in insightCards"
          :key="card.key"
          tag="article"
          class="analytics-insight-card"
          :eyebrow="card.eyebrow"
          :title="card.title"
          :description="card.description"
          heading-level="h3"
        />
      </section>

      <div class="analytics-grid">
        <OverviewChartCard
          class="analytics-card analytics-card--trend"
          title="Recent activity trend"
          description="A Chart.js line view of the latest tracked visitor events inside the selected analytics window."
          type="line"
          :data="visitTrendSeries"
        />

        <OverviewChartCard
          class="analytics-card analytics-card--paths"
          title="Top paths"
          description="The website routes attracting the strongest recent visitor attention."
          type="bar"
          :data="topPagesSeries"
          :chart-options="{
            indexAxis: 'y',
            scales: {
              x: { beginAtZero: true, ticks: { precision: 0 } },
              y: { ticks: { autoSkip: false } },
            },
          }"
        />

        <OverviewChartCard
          class="analytics-card analytics-card--sources"
          title="Traffic sources"
          description="Referrer domains and channels currently driving the most visitor sessions."
          type="pie"
          :data="referrerSeries"
        />

        <OverviewChartCard
          class="analytics-card analytics-card--locale"
          title="Locale mix"
          description="Language or locale distribution observed in tracked page activity."
          type="pie"
          :data="localeSeries"
        />

        <OverviewChartCard
          class="analytics-card analytics-card--return"
          title="Return visitor mix"
          description="A quick split between first-time and repeat visitors in the loaded sample."
          type="pie"
          :data="returnVisitorSeries"
        />

        <OverviewChartCard
          class="analytics-card analytics-card--session"
          title="Session state"
          description="Current active versus inactive visitor sessions in the loaded sample."
          type="bar"
          :data="activeSessionSeries"
        />
      </div>
    </div>
  </PageWrapper>
</template>
