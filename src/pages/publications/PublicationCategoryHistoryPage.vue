<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { resolveLocalizedLabel } from '@/utils/publicationsWorkspace'

const route = useRoute()
const router = useRouter()

const categoryId = computed(() => String(route.params?.categoryId || ''))
const loading = ref(false)
const error = ref('')
const category = ref(null)

const WORKFLOW_FIELDS = [
  { key: 'createdAt', label: 'Created', by: 'createdBy' },
  { key: 'submittedAt', label: 'Submitted for Review', by: 'submittedBy' },
  { key: 'approvedAt', label: 'Approved', by: 'approvedBy' },
  { key: 'rejectedAt', label: 'Rejected', by: 'rejectedBy', note: 'rejectionReason' },
  { key: 'publishedAt', label: 'Published', by: 'publishedBy' },
  { key: 'unpublishedAt', label: 'Unpublished', by: 'unpublishedBy' },
  { key: 'scheduledPublishAt', label: 'Scheduled Publish', by: 'scheduledPublishBy' },
  { key: 'scheduledUnpublishAt', label: 'Scheduled Unpublish', by: 'scheduledUnpublishBy' },
  { key: 'archivedAt', label: 'Archived', by: 'archivedBy', note: 'archiveReason' },
  { key: 'lastModifiedAt', label: 'Last Modified', by: 'lastModifiedBy' },
]

const timeline = computed(() => {
  if (!category.value) return []
  return WORKFLOW_FIELDS.filter((entry) => category.value[entry.key])
    .sort((a, b) => new Date(category.value[a.key]) - new Date(category.value[b.key]))
    .map((entry) => ({
      label: entry.label,
      timestamp: category.value[entry.key],
      by: category.value[entry.by],
      note: entry.note ? category.value[entry.note] : null,
    }))
})

function resolveBy(by) {
  if (!by) return null
  if (typeof by === 'string') return by
  return by?.fullName || by?.name || by?.email || String(by?._id || by?.userId || '')
}

async function loadCategory() {
  if (!categoryId.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await publicationsAPI.findPublicationCategory({ categoryId: categoryId.value })
    if (res?.error) throw res.error
    category.value = res?.category || res
  } catch (err) {
    error.value = err?.message || 'Failed to load category history.'
  } finally {
    loading.value = false
  }
}

onMounted(loadCategory)
watch(categoryId, (next, prev) => {
  if (next && next !== prev) loadCategory()
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Category History
          </p>
          <h1 class="text-3xl font-semibold text-slate-950">
            {{ resolveLocalizedLabel(category, 'Publication Category') }}
          </h1>
          <p class="max-w-4xl text-sm text-slate-600">
            Lifecycle timeline showing every workflow transition, who triggered it, and when.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <el-button plain @click="router.push({ name: 'publicationCategories.list' })">
            All Categories
          </el-button>
          <el-button
            v-if="categoryId"
            type="primary"
            @click="router.push({ name: 'publicationCategories.details', params: { categoryId } })"
          >
            View Details
          </el-button>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <AppBentoGrid columns="2">
        <el-card shadow="never" class="border border-slate-200" v-loading="loading">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-slate-900">Current State</span>
              <StatusBadge :value="category?.effectiveStatus || category?.publicationStatus" />
            </div>
          </template>
          <div class="space-y-2 text-sm text-slate-700">
            <div class="flex items-center justify-between">
              <span>Category ID</span>
              <code class="text-xs text-slate-500">{{ category?.categoryId || '-' }}</code>
            </div>
            <div class="flex items-center justify-between">
              <span>Created</span>
              <strong>{{ formatDisplayDate(category?.createdAt) }}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span>Last modified</span>
              <strong>{{
                formatDisplayDate(category?.lastModifiedAt || category?.updatedAt)
              }}</strong>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="border border-slate-200">
          <template #header>
            <span class="font-semibold text-slate-900">Workflow Timeline</span>
          </template>

          <el-timeline v-if="timeline.length" class="mt-2">
            <el-timeline-item
              v-for="(event, index) in timeline"
              :key="index"
              :timestamp="formatDisplayDate(event.timestamp)"
              placement="top"
            >
              <p class="font-medium text-slate-800">{{ event.label }}</p>
              <p v-if="resolveBy(event.by)" class="text-sm text-slate-500">
                by {{ resolveBy(event.by) }}
              </p>
              <p v-if="event.note" class="mt-1 text-sm italic text-slate-500">"{{ event.note }}"</p>
            </el-timeline-item>
          </el-timeline>

          <el-empty v-else-if="!loading" description="No lifecycle events recorded yet." />
        </el-card>
      </AppBentoGrid>
    </div>
  </PageWrapper>
</template>
