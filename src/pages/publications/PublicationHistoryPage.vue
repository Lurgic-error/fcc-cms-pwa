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

const publicationId = computed(() => String(route.params?.publicationId || ''))
const loading = ref(false)
const error = ref('')
const publication = ref(null)

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
  if (!publication.value) return []
  return WORKFLOW_FIELDS.filter((entry) => publication.value[entry.key])
    .sort((a, b) => new Date(publication.value[a.key]) - new Date(publication.value[b.key]))
    .map((entry) => ({
      label: entry.label,
      timestamp: publication.value[entry.key],
      by: publication.value[entry.by],
      note: entry.note ? publication.value[entry.note] : null,
    }))
})

const headerActions = computed(() =>
  publicationId.value ? [{ key: 'viewDetails', label: 'View Details' }] : [],
)

function resolveBy(by) {
  if (!by) return null
  if (typeof by === 'string') return by
  return by?.fullName || by?.name || by?.email || String(by?._id || by?.userId || '')
}

function goBack() {
  router.push({ name: 'publications.list' })
}

function onHeaderAction(action) {
  if (action?.key !== 'viewDetails' || !publicationId.value) return

  router.push({ name: 'publications.details', params: { publicationId: publicationId.value } })
}

async function loadPublication() {
  if (!publicationId.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await publicationsAPI.findPublication({ publicationId: publicationId.value })
    if (res?.error) throw res.error
    publication.value = res?.publication || res
  } catch (err) {
    error.value = err?.message || 'Failed to load publication history.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPublication)
watch(publicationId, (next, prev) => {
  if (next && next !== prev) loadPublication()
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Publication History"
        :title="resolveLocalizedLabel(publication, 'Publication')"
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
            <div v-if="publication">
              <StatusBadge
                :value="publication?.effectiveStatus || publication?.publicationStatus"
              />
            </div>
          </template>

          <div v-loading="loading">
            <AppDetailGrid :columns="1">
              <AppDetailItem label="Publication ID" direction="horizontal">
                <code class="enterprise-detail-code">{{ publication?.publicationId || '-' }}</code>
              </AppDetailItem>
              <AppDetailItem label="Created" direction="horizontal">
                <span class="detail-item__emphasis">{{
                  formatDisplayDate(publication?.createdAt)
                }}</span>
              </AppDetailItem>
              <AppDetailItem label="Last modified" direction="horizontal">
                <span class="detail-item__emphasis">{{
                  formatDisplayDate(publication?.lastModifiedAt)
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
