<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import { useVisitorsStore } from '@/stores/useVisitorsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

const visitorsStore = useVisitorsStore()
const { summary, loading, error } = storeToRefs(visitorsStore)

const cards = computed(() => [
  { label: 'Total Visitors', value: summary.value.totalVisitors || 0 },
  { label: 'Total Page Views', value: summary.value.totalPageViews || 0 },
  { label: 'Online Visitors', value: summary.value.onlineVisitors || 0 },
  { label: 'Today', value: summary.value.todayVisitors || 0 },
  { label: 'Yesterday', value: summary.value.yesterdayVisitors || 0 },
  { label: 'This Week', value: summary.value.thisWeekVisitors || 0 },
  { label: 'This Month', value: summary.value.thisMonthVisitors || 0 },
])

const generatedAt = computed(() =>
  summary.value.generatedAt ? new Date(summary.value.generatedAt).toLocaleString() : '-',
)

onMounted(async () => {
  await visitorsStore.fetchSummary()
})
</script>

<template>
  <PageWrapper title="Visitor Analytics">
    <div class="mb-6 flex justify-end">
      <el-button @click="visitorsStore.fetchSummary()">Refresh</el-button>
    </div>

    <p v-if="loading" class="text-sm text-slate-500">Loading analytics...</p>
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-4" />

    <AppDetailCard v-if="!loading" title="Traffic Summary">
      <AppDetailGrid columns="auto">
        <AppDetailItem v-for="card in cards" :key="card.label" :label="card.label">
          <span class="text-2xl font-bold text-slate-900 dark:text-white">{{
            Number(card.value || 0).toLocaleString()
          }}</span>
        </AppDetailItem>
      </AppDetailGrid>
    </AppDetailCard>

    <div v-if="!loading" class="mt-4 flex gap-6 text-sm text-slate-500">
      <p>
        <strong>Since:</strong>
        {{ summary.since ? new Date(summary.since).toLocaleDateString() : '-' }}
      </p>
      <p><strong>Generated At:</strong> {{ generatedAt }}</p>
    </div>
  </PageWrapper>
</template>

<style scoped></style>
