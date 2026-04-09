<script setup>
import { visitorsAPI } from '@/api'
import PageWrapper from '@/components/common/PageWrapper.vue'
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
import { computed, onMounted, reactive, ref } from 'vue'

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

const biggestDay = computed(() => {
  return visitTrendSeries.value.reduce((best, item) => (item.value > best.value ? item : best), {
    label: 'No activity yet',
    value: 0,
  })
})

const strongestPath = computed(() => topPagesSeries.value[0]?.fullLabel || 'No tracked path yet')
const strongestSource = computed(() => referrerSeries.value[0]?.label || 'Direct / unknown')
const generatedAt = computed(() =>
  summary.value.generatedAt ? new Date(summary.value.generatedAt).toLocaleString() : '-',
)

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

onMounted(loadAnalytics)
</script>

<template>
  <PageWrapper
    title="Dashboard Analytics"
    description="A visitor-first analytics workspace for live traffic, paths, sources, and engagement patterns."
  >
    <div class="analytics-shell">
      <el-alert v-if="loadError" type="warning" show-icon :closable="false" :title="loadError" />

      <section class="analytics-hero surface-card">
        <div>
          <p class="analytics-eyebrow">Website intelligence</p>
          <h2 class="analytics-hero__title">Traffic patterns at a glance</h2>
          <p class="analytics-hero__description">
            This view focuses on visitor behavior: where traffic is landing, who is returning, and
            which sources are actively driving the public website.
          </p>
        </div>

        <div class="analytics-hero__actions">
          <el-select v-model="filters.days" class="w-36">
            <el-option :value="7" label="7 days" />
            <el-option :value="14" label="14 days" />
            <el-option :value="30" label="30 days" />
            <el-option :value="90" label="90 days" />
          </el-select>
          <el-select v-model="filters.limit" class="w-36">
            <el-option :value="5" label="Top 5" />
            <el-option :value="8" label="Top 8" />
            <el-option :value="10" label="Top 10" />
          </el-select>
          <el-button type="primary" :loading="loading" @click="loadAnalytics">Refresh</el-button>
        </div>
      </section>

      <OverviewStatsGrid :stats="stats" />

      <section class="analytics-insights">
        <article class="analytics-insight-card surface-card">
          <span>Busiest recent day</span>
          <strong>{{ biggestDay.label }}</strong>
          <p>{{ Number(biggestDay.value || 0).toLocaleString() }} tracked events</p>
        </article>
        <article class="analytics-insight-card surface-card">
          <span>Strongest landing path</span>
          <strong :title="strongestPath">{{ strongestPath }}</strong>
          <p>Most active destination in the selected visitor window</p>
        </article>
        <article class="analytics-insight-card surface-card">
          <span>Strongest source</span>
          <strong>{{ strongestSource }}</strong>
          <p>Generated at {{ generatedAt }}</p>
        </article>
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

<style scoped>
.analytics-shell {
  display: grid;
  gap: 1rem;
}

.analytics-hero {
  display: grid;
  gap: 1rem;
  padding: 1.35rem;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 26%),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.12), transparent 32%),
    linear-gradient(135deg, color-mix(in srgb, var(--fcc-surface) 98%, white), #effcf9);
}

.analytics-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fcc-secondary-700);
}

.analytics-hero__title {
  margin-top: 0.35rem;
  font-size: clamp(1.5rem, 2.3vw, 2.15rem);
}

.analytics-hero__description {
  margin-top: 0.4rem;
  max-width: 42rem;
  color: var(--fcc-text-muted);
}

.analytics-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: start;
}

.analytics-insights {
  display: grid;
  gap: 1rem;
}

.analytics-insight-card {
  padding: 1.05rem 1.1rem;
  display: grid;
  gap: 0.35rem;
}

.analytics-insight-card span {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fcc-text-muted);
}

.analytics-insight-card strong {
  font-size: 1.1rem;
  color: var(--fcc-text);
}

.analytics-insight-card p {
  color: var(--fcc-text-muted);
}

.analytics-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr);
  grid-auto-flow: dense;
}

.analytics-card {
  min-width: 0;
  min-height: 100%;
}

@media (min-width: 900px) {
  .analytics-hero {
    grid-template-columns: minmax(0, 1.4fr) auto;
    align-items: end;
  }

  .analytics-insights {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .analytics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .analytics-card--trend,
  .analytics-card--paths {
    grid-column: span 2;
  }
}

@media (min-width: 1280px) {
  .analytics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
