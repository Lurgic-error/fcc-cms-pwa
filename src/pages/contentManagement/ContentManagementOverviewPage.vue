<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'

const router = useRouter()

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
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Content Management
          </p>
          <h1 class="text-3xl font-semibold text-slate-950">
            Operate the managed content system with less guesswork
          </h1>
          <p class="max-w-4xl text-sm text-slate-600">
            This workspace is the control layer for localized page building. Start with the system
            foundations, move into pages and content items, then verify versions and placements
            before publishing changes.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <el-button plain @click="openWorkspace('contentManagement.pages')">Open Pages</el-button>
          <el-button type="primary" @click="openWorkspace('contentManagement.contentItems')">
            Open Content Items
          </el-button>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <OverviewStatsGrid :stats="stats" />

      <AppBentoGrid columns="3">
        <el-card
          v-for="group in workspaceGroups"
          :key="group.key"
          shadow="never"
          class="border border-slate-200"
        >
          <div class="space-y-4">
            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {{ group.eyebrow }}
              </p>
              <h2 class="text-xl font-semibold text-slate-900">{{ group.title }}</h2>
              <p class="text-sm leading-6 text-slate-600">{{ group.description }}</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <el-button
                v-for="action in group.actions"
                :key="action.route"
                plain
                @click="openWorkspace(action.route)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </div>
        </el-card>
      </AppBentoGrid>

      <el-card shadow="never" class="border border-slate-200">
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold text-slate-900">Recommended editor flow</p>
            <p class="text-sm text-slate-600">
              1. Confirm locale and layout foundations. 2. Create or update the page shell. 3. Edit
              content items. 4. Place blocks on the page. 5. Review versions before publishing.
            </p>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold text-slate-900">Why this overview exists</p>
            <p class="text-sm text-slate-600">
              The previous landing flow dropped users directly into one submodule. This overview
              makes the relationship between the content-management areas explicit so the editorial
              system is easier to learn and test.
            </p>
          </div>
        </div>
      </el-card>
    </div>
  </PageWrapper>
</template>
