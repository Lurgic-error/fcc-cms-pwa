<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import { useVisitorsStore } from '@/stores/useVisitorsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive } from 'vue'

const visitorsStore = useVisitorsStore()
const { hotspots, loading, error } = storeToRefs(visitorsStore)

const filters = reactive({
  days: 30,
  limit: 10,
})

const topPages = computed(() => hotspots.value.topPages || [])
const topReferrers = computed(() => hotspots.value.topReferrers || [])
const topLocales = computed(() => hotspots.value.topLocales || [])
const recentActivity = computed(() => hotspots.value.recentActivity || [])

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

async function refresh() {
  await visitorsStore.fetchHotspots({
    days: filters.days,
    limit: filters.limit,
  })
}

onMounted(refresh)
</script>

<template>
  <PageWrapper
    title="Visitor Hotspots"
    description="Inspect the most visited paths, top referrers, locales, and recent tracked activity."
  >
    <div class="page space-y-6">
      <section class="card controls">
        <label>
          Window (days)
          <input v-model.number="filters.days" type="number" min="1" max="365" />
        </label>
        <label>
          Rows
          <input v-model.number="filters.limit" type="number" min="1" max="50" />
        </label>
        <button class="btn btn-primary" type="button" :disabled="loading" @click="refresh">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </section>

      <AppDetailCard title="Heatmap Snapshot">
        <AppDetailGrid columns="4">
          <AppDetailItem label="Window">
            <span class="font-bold text-lg text-slate-900 dark:text-white"
              >{{ hotspots.windowDays || filters.days }} days</span
            >
          </AppDetailItem>
          <AppDetailItem label="Top Paths">
            <span class="font-bold text-lg text-slate-900 dark:text-white">{{
              topPages.length
            }}</span>
          </AppDetailItem>
          <AppDetailItem label="Top Referrers">
            <span class="font-bold text-lg text-slate-900 dark:text-white">{{
              topReferrers.length
            }}</span>
          </AppDetailItem>
          <AppDetailItem label="Generated">
            <span class="font-bold text-lg text-slate-900 dark:text-white">{{
              formatDate(hotspots.generatedAt)
            }}</span>
          </AppDetailItem>
        </AppDetailGrid>
      </AppDetailCard>

      <p v-if="error" class="error">{{ error }}</p>

      <AppBentoGrid columns="2">
        <article class="card">
          <div class="section-header">
            <h2>Top Pages</h2>
            <span class="muted">Most visited tracked paths</span>
          </div>
          <table v-if="topPages.length" class="table">
            <thead>
              <tr>
                <th>Path</th>
                <th>Views</th>
                <th>Unique Visitors</th>
                <th>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="page in topPages" :key="page.path">
                <td>{{ page.path }}</td>
                <td>{{ page.views }}</td>
                <td>{{ page.uniqueVisitors }}</td>
                <td>{{ formatDate(page.lastVisitedAt) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="muted">No page hotspots recorded for this window.</p>
        </article>

        <article class="card">
          <div class="section-header">
            <h2>Referrers</h2>
            <span class="muted">Traffic sources</span>
          </div>
          <table v-if="topReferrers.length" class="table">
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="referrer in topReferrers" :key="referrer.referrer">
                <td>{{ referrer.referrer }}</td>
                <td>{{ referrer.visits }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="muted">No referrer data recorded for this window.</p>
        </article>
      </AppBentoGrid>

      <AppBentoGrid columns="2">
        <article class="card">
          <div class="section-header">
            <h2>Locales</h2>
            <span class="muted">Language distribution</span>
          </div>
          <table v-if="topLocales.length" class="table">
            <thead>
              <tr>
                <th>Locale</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="locale in topLocales" :key="locale.locale">
                <td>{{ locale.locale }}</td>
                <td>{{ locale.visits }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="muted">No locale data recorded for this window.</p>
        </article>

        <article class="card">
          <div class="section-header">
            <h2>Recent Activity</h2>
            <span class="muted">Latest tracked page visits</span>
          </div>
          <table v-if="recentActivity.length" class="table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Path</th>
                <th>Locale</th>
                <th>Visited</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in recentActivity"
                :key="`${item.visitorId}:${item.visitedAt}:${item.path}`"
              >
                <td>{{ item.visitorId }}</td>
                <td>{{ item.path || '-' }}</td>
                <td>{{ item.locale || '-' }}</td>
                <td>{{ formatDate(item.visitedAt) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="muted">No recent activity recorded for this window.</p>
        </article>
      </AppBentoGrid>
    </div>
  </PageWrapper>
</template>

<style scoped>
.page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: end;
}

.card {
  border: 1px solid var(--color-fcc-border);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--color-surface);
}

.metric .label {
  color: var(--color-fcc-text-muted);
  font-size: 0.84rem;
}

.metric .value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-fcc-text);
}

.metric .value.small {
  font-size: 0.95rem;
}

label {
  display: grid;
  gap: 0.3rem;
  font-size: 0.9rem;
}

input {
  border: 1px solid var(--color-secondary-300);
  border-radius: 0.375rem;
  padding: 0.45rem 0.55rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid var(--color-fcc-border);
  padding: 0.45rem;
  font-size: 0.84rem;
  text-align: left;
  vertical-align: top;
}

.btn {
  border: 1px solid var(--color-secondary-300);
  border-radius: 0.375rem;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.btn-primary {
  border-color: var(--color-primary-600);
  background: var(--color-primary-600);
  color: var(--color-surface);
}

.muted {
  color: var(--color-fcc-text-muted);
  font-size: 0.84rem;
}

.error {
  color: var(--color-danger);
}
</style>
