<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
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

const headerActions = computed(() =>
  categoryId.value ? [{ key: 'viewDetails', label: 'View Details' }] : [],
)

function resolveBy(by) {
  if (!by) return null
  if (typeof by === 'string') return by
  return by?.fullName || by?.name || by?.email || String(by?._id || by?.userId || '')
}

function goBack() {
  router.push({ name: 'publicationCategories.list' })
}

function onHeaderAction(action) {
  if (action?.key !== 'viewDetails' || !categoryId.value) return

  router.push({ name: 'publicationCategories.details', params: { categoryId: categoryId.value } })
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
      <EnterprisePageHeader
        eyebrow="Category History"
        :title="resolveLocalizedLabel(category, 'Publication Category')"
        description="Lifecycle timeline showing every workflow transition, who triggered it, and when."
        :actions="headerActions"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="enterprise-stack">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <AppBentoGrid columns="2">
        <AppDetailCard title="Current State">
          <template #header-actions>
            <div v-if="category">
              <StatusBadge :value="category?.effectiveStatus || category?.publicationStatus" />
            </div>
          </template>

          <div v-loading="loading">
            <AppDetailGrid :columns="1">
              <AppDetailItem label="Category ID" direction="horizontal">
                <code class="enterprise-detail-code">{{ category?.categoryId || '-' }}</code>
              </AppDetailItem>
              <AppDetailItem label="Created" direction="horizontal">
                <span class="detail-item__emphasis">{{ formatDisplayDate(category?.createdAt) }}</span>
              </AppDetailItem>
              <AppDetailItem label="Last modified" direction="horizontal">
                <span class="detail-item__emphasis">{{
                  formatDisplayDate(category?.lastModifiedAt || category?.updatedAt)
                }}</span>
              </AppDetailItem>
            </AppDetailGrid>
          </div>
        </AppDetailCard>

        <AppDetailCard title="Workflow Timeline">
          <div v-loading="loading">
            <el-timeline v-if="timeline.length" class="enterprise-timeline">
              <el-timeline-item
                v-for="(event, index) in timeline"
                :key="index"
                :timestamp="formatDisplayDate(event.timestamp)"
                placement="top"
              >
                <p class="enterprise-timeline__event-title">{{ event.label }}</p>
                <p v-if="resolveBy(event.by)" class="enterprise-timeline__meta">
                  by {{ resolveBy(event.by) }}
                </p>
                <p v-if="event.note" class="enterprise-timeline__note">"{{ event.note }}"</p>
              </el-timeline-item>
            </el-timeline>

            <el-empty v-else-if="!loading" description="No lifecycle events recorded yet." />
          </div>
        </AppDetailCard>
      </AppBentoGrid>
    </div>
  </PageWrapper>
</template>
