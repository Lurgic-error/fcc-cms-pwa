<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'

const router = useRouter()
const headerActions = Object.freeze([
  { key: 'openPages', label: 'Open Pages' },
  { key: 'openContentItems', label: 'Open Content Items' },
])

const stats = computed(() => [
  {
    key: 'structure',
    label: 'Structured Areas',
    value: 6,
    helper: 'Locales, block types, layouts, pages, content items, and placements',
  },
  {
    key: 'workflow',
    label: 'Operational Goal',
    value: 'Review-ready',
    helper: 'Use the workspaces below to create, version, place, and govern managed content.',
  },
  {
    key: 'guidance',
    label: 'Best Entry Point',
    value: 'Pages',
    helper: 'Most editors start with pages, content items, or placements.',
  },
])

const workspaceGroups = Object.freeze([
  {
    key: 'foundations',
    eyebrow: 'Foundations',
    title: 'Define the content system',
    description:
      'Set the localization, building blocks, and layouts before editors start publishing or arranging page content.',
    actions: [
      { label: 'Locales', route: 'contentManagement.locales' },
      { label: 'Block Types', route: 'contentManagement.blockTypes' },
      { label: 'Layouts', route: 'contentManagement.layouts' },
    ],
  },
  {
    key: 'delivery',
    eyebrow: 'Delivery',
    title: 'Manage live page composition',
    description:
      'Create pages, attach content items, and control where blocks appear so editors can move from draft structures to publish-ready content.',
    actions: [
      { label: 'Pages', route: 'contentManagement.pages' },
      { label: 'Content Items', route: 'contentManagement.contentItems' },
      { label: 'Placements', route: 'contentManagement.placements' },
    ],
  },
  {
    key: 'governance',
    eyebrow: 'Governance',
    title: 'Track versions and editorial state',
    description:
      'Review historical versions before republishing changes or diagnosing content regressions across the managed website.',
    actions: [{ label: 'Content Versions', route: 'contentManagement.contentVersions' }],
  },
])

function openWorkspace(routeName) {
  router.push({ name: routeName })
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push({ name: 'dashboard.overview' })
}

function onHeaderAction(action) {
  switch (action?.key) {
    case 'openPages':
      openWorkspace('contentManagement.pages')
      return
    case 'openContentItems':
      openWorkspace('contentManagement.contentItems')
      return
    default:
  }
}
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Content Management"
        eyebrow-class="workspace-eyebrow"
        title="Operate the managed content system with less guesswork"
        description="This workspace is the control layer for localized page building. Start with the system foundations, move into pages and content items, then verify versions and placements before publishing changes."
        :actions="headerActions"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="enterprise-stack enterprise-stack--spacious">
      <OverviewStatsGrid :stats="stats" />

      <AppBentoGrid columns="3">
        <WorkspacePanel
          v-for="group in workspaceGroups"
          :key="group.key"
          tag="section"
          :eyebrow="group.eyebrow"
          :title="group.title"
          :description="group.description"
        >
          <div class="workspace-inline-actions">
            <el-button
              v-for="action in group.actions"
              :key="action.route"
              size="large"
              plain
              @click="openWorkspace(action.route)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </WorkspacePanel>
      </AppBentoGrid>

      <WorkspacePanel>
        <div class="content-admin-note-grid">
          <article class="content-admin-note">
            <h3>Recommended editor flow</h3>
            <p>
              1. Confirm locale and layout foundations. 2. Create or update the page shell. 3. Edit
              content items. 4. Place blocks on the page. 5. Review versions before publishing.
            </p>
          </article>

          <article class="content-admin-note">
            <h3>Why this overview exists</h3>
            <p>
              The previous landing flow dropped users directly into one submodule. This overview
              makes the relationship between the content-management areas explicit so the editorial
              system is easier to learn and test.
            </p>
          </article>
        </div>
      </WorkspacePanel>
    </div>
  </PageWrapper>
</template>
