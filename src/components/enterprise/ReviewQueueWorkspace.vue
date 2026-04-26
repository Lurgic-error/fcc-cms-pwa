<script setup>
import { ref, watch } from 'vue'

import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import EntityTable from '@/components/tables/EntityTable.vue'

const props = defineProps({
  eyebrow: {
    type: String,
    default: 'Review queue',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  actions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  backLabel: {
    type: String,
    default: 'Back',
  },
  stats: {
    type: Array,
    default: () => [],
  },
  tabs: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select', 'back', 'row-click', 'view'])

const activeTab = ref(props.tabs[0]?.name ?? '0')

watch(
  () => props.tabs,
  (nextTabs) => {
    if (!nextTabs.some((tab) => tab.name === activeTab.value)) {
      activeTab.value = nextTabs[0]?.name ?? '0'
    }
  },
  { deep: true },
)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        :eyebrow="eyebrow"
        :title="title"
        :description="description"
        :actions="actions"
        :loading="loading"
        @select="emit('select', $event)"
        @back="emit('back')"
      />
    </template>

    <div class="workspace-shell">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <OverviewStatsGrid :stats="stats" />

      <WorkspacePanel
        eyebrow="Editorial review lanes"
        title="Queue workspace"
        description="Switch between review lanes without leaving the workspace."
      >
        <el-tabs v-model="activeTab" class="review-queue-tabs">
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.label"
            :name="tab.name"
          >
            <EntityTable
              title=""
              :records="tab.records"
              :columns="tab.columns"
              :row-key="tab.rowKey"
              :loading="loading"
            :show-create="false"
            :show-refresh="false"
            :show-search="false"
            :framed="false"
            :actions="tab.actions || []"
            :empty-text="tab.emptyText"
            @row-click="emit('row-click', $event)"
              @view="emit('view', $event)"
            />
          </el-tab-pane>
        </el-tabs>
      </WorkspacePanel>
    </div>
  </PageWrapper>
</template>
