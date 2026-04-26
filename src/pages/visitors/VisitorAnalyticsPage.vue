<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import { useVisitorsStore } from '@/stores/useVisitorsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visitorsStore = useVisitorsStore()
const { summary, loading, error } = storeToRefs(visitorsStore)
const headerActions = Object.freeze([{ key: 'refreshSummary', label: 'Refresh Summary' }])

const cards = computed(() => [
  {
    key: 'totalVisitors',
    label: 'Total Visitors',
    value: summary.value.totalVisitors || 0,
    helper: 'All recorded visitors in the summary range',
  },
  {
    key: 'totalPageViews',
    label: 'Total Page Views',
    value: summary.value.totalPageViews || 0,
    helper: 'Combined page requests recorded so far',
  },
  {
    key: 'onlineVisitors',
    label: 'Online Visitors',
    value: summary.value.onlineVisitors || 0,
    helper: 'Visitors currently active in the latest snapshot',
  },
  {
    key: 'todayVisitors',
    label: 'Today',
    value: summary.value.todayVisitors || 0,
    helper: 'Unique visitors recorded today',
  },
  {
    key: 'yesterdayVisitors',
    label: 'Yesterday',
    value: summary.value.yesterdayVisitors || 0,
    helper: 'Comparison baseline from the prior day',
  },
  {
    key: 'thisWeekVisitors',
    label: 'This Week',
    value: summary.value.thisWeekVisitors || 0,
    helper: 'Traffic captured in the current week',
  },
  {
    key: 'thisMonthVisitors',
    label: 'This Month',
    value: summary.value.thisMonthVisitors || 0,
    helper: 'Traffic captured in the current month',
  },
])

const generatedAt = computed(() =>
  summary.value.generatedAt ? new Date(summary.value.generatedAt).toLocaleString() : '-',
)

const sinceLabel = computed(() =>
  summary.value.since ? new Date(summary.value.since).toLocaleDateString() : '-',
)

async function refreshSummary() {
  await visitorsStore.fetchSummary()
}

async function onHeaderAction(action) {
  if (action?.key !== 'refreshSummary') return
  await refreshSummary()
}

async function goBack() {
  await router.push({ name: 'visitors.list' })
}

onMounted(async () => {
  await refreshSummary()
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Visitor Analytics"
        title="Visitor summary"
        description="Review the current aggregate website traffic snapshot without leaving the CMS."
        :actions="headerActions"
        :loading="loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="app-inline-alert"
    />

    <div class="workspace-shell">
      <el-skeleton v-if="loading" :rows="8" animated />

      <template v-else>
        <OverviewStatsGrid :stats="cards" />

        <WorkspacePanel
          eyebrow="Snapshot metadata"
          title="Traffic summary context"
          description="These values come from the summary endpoint and help explain when the current numbers were generated."
        >
          <AppDetailGrid :columns="3">
            <AppDetailItem label="Since" :value="sinceLabel" />
            <AppDetailItem label="Generated At" :value="generatedAt" />
            <AppDetailItem
              label="Active Right Now"
              :value="Number(summary.onlineVisitors || 0).toLocaleString()"
            />
          </AppDetailGrid>
        </WorkspacePanel>
      </template>
    </div>
  </PageWrapper>
</template>
