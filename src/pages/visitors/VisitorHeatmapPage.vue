<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import { useVisitorsStore } from '@/stores/useVisitorsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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
const stats = computed(() => [
  {
    key: 'window',
    label: 'Window',
    value: hotspots.value.windowDays || filters.days,
    helper: 'Days tracked in the current snapshot',
  },
  {
    key: 'pages',
    label: 'Top Paths',
    value: topPages.value.length,
    helper: 'Tracked routes with recorded visits',
  },
  {
    key: 'referrers',
    label: 'Referrers',
    value: topReferrers.value.length,
    helper: 'Known traffic sources in the window',
  },
  {
    key: 'activity',
    label: 'Recent Visits',
    value: recentActivity.value.length,
    helper:
      formatDate(hotspots.value.generatedAt) === '-'
        ? 'Waiting for analytics snapshot'
        : `Generated ${formatDate(hotspots.value.generatedAt)}`,
  },
])

const headerActions = Object.freeze([{ key: 'refresh', label: 'Refresh snapshot' }])

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

async function goBack() {
  await router.push({ name: 'visitors.list' })
}

async function onHeaderAction(action) {
  if (action?.key === 'refresh') {
    await refresh()
  }
}

onMounted(refresh)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Visitor Analytics"
        title="Visitor Hotspots"
        description="Inspect the most visited paths, top referrers, locales, and recent tracked activity."
        :actions="headerActions"
        :loading="loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="workspace-shell">
      <OverviewStatsGrid :stats="stats" />

      <WorkspacePanel eyebrow="Hotspot filters" title="Adjust the analytics snapshot">
        <el-form label-position="top" class="workspace-form" @submit.prevent="refresh">
          <AppFormRow :columns="2">
            <el-form-item label="Window (days)" class="form-item-flush">
              <el-input-number v-model="filters.days" :min="1" :max="365" />
            </el-form-item>
            <el-form-item label="Rows" class="form-item-flush">
              <el-input-number v-model="filters.limit" :min="1" :max="50" />
            </el-form-item>
          </AppFormRow>
        </el-form>

        <el-alert v-if="error" type="error" show-icon :closable="false" :title="error" />
      </WorkspacePanel>

      <section class="workspace-grid">
        <WorkspacePanel
          tag="article"
          eyebrow="Top pages"
          title="Most visited tracked paths"
        >
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="topPages"
              stripe
              v-loading="loading"
              empty-text="No page hotspots recorded for this window."
            >
              <el-table-column prop="path" label="Path" min-width="220" />
              <el-table-column prop="views" label="Views" min-width="110" />
              <el-table-column
                prop="uniqueVisitors"
                label="Unique Visitors"
                min-width="150"
              />
              <el-table-column label="Last Visit" min-width="180">
                <template #default="{ row }">
                  {{ formatDate(row.lastVisitedAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </WorkspacePanel>

        <WorkspacePanel tag="article" eyebrow="Referrers" title="Traffic sources">
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="topReferrers"
              stripe
              v-loading="loading"
              empty-text="No referrer data recorded for this window."
            >
              <el-table-column prop="referrer" label="Referrer" min-width="240" />
              <el-table-column prop="visits" label="Visits" min-width="110" />
            </el-table>
          </div>
        </WorkspacePanel>
      </section>

      <section class="workspace-grid">
        <WorkspacePanel tag="article" eyebrow="Locales" title="Language distribution">
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="topLocales"
              stripe
              v-loading="loading"
              empty-text="No locale data recorded for this window."
            >
              <el-table-column prop="locale" label="Locale" min-width="160" />
              <el-table-column prop="visits" label="Visits" min-width="110" />
            </el-table>
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          eyebrow="Recent activity"
          title="Latest tracked page visits"
        >
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="recentActivity"
              stripe
              v-loading="loading"
              empty-text="No recent activity recorded for this window."
            >
              <el-table-column prop="visitorId" label="Visitor" min-width="180" />
              <el-table-column prop="path" label="Path" min-width="220" />
              <el-table-column prop="locale" label="Locale" min-width="110" />
              <el-table-column label="Visited" min-width="180">
                <template #default="{ row }">
                  {{ formatDate(row.visitedAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </WorkspacePanel>
      </section>
    </div>
  </PageWrapper>
</template>
