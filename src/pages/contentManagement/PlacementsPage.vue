<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import EntityRelationshipSelect from '@/components/forms/EntityRelationshipSelect.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useCmsPagesStore } from '@/stores/useCmsPagesStore'
import { useContentItemsStore } from '@/stores/useContentItemsStore'
import { useContentVersionsStore } from '@/stores/useContentVersionsStore'
import { usePlacementsStore } from '@/stores/usePlacementsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const placementsStore = usePlacementsStore()
const pagesStore = useCmsPagesStore()
const contentItemsStore = useContentItemsStore()
const versionsStore = useContentVersionsStore()
const { entities: placements, loading, error, pagination } = storeToRefs(placementsStore)
const { entities: cmsPages } = storeToRefs(pagesStore)
const { entities: contentItems } = storeToRefs(contentItemsStore)

const selectedId = ref('')
const feedback = ref('')
const draggedIndex = ref(-1)
const pager = reactive({ page: 1, limit: 20 })

const reorderFilter = reactive({
  pageId: '',
  regionKey: '',
})

const reorderPlacementIds = ref([])

const form = reactive({
  pageId: '',
  regionKey: '',
  contentItemId: '',
  contentVersionId: '',
  inlineBlockJson: '',
  order: 1,
  isActive: true,
  startAt: '',
  endAt: '',
})

const selected = computed(() =>
  placements.value.find((item) => item.placementId === selectedId.value),
)

const stats = computed(() => [
  { key: 'total', label: 'Placements', value: placements.value.length },
  {
    key: 'active',
    label: 'Active',
    value: placements.value.filter((item) => item?.isActive !== false).length,
  },
  {
    key: 'scheduled',
    label: 'Scheduled',
    value: placements.value.filter((item) => Boolean(item?.startAt || item?.endAt)).length,
  },
  {
    key: 'pages',
    label: 'Pages Covered',
    value: new Set(placements.value.map((item) => findPageId(item)).filter(Boolean)).size,
  },
])

const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh workspace' },
  { key: 'create', label: 'New placement' },
])

function resolveStatus(item = {}) {
  return item?.effectiveStatus || item?.publicationStatus || 'draft'
}

function resolvePageLabel(item = {}) {
  return item?.name || item?.title || item?.slug || item?.pageId || 'Untitled page'
}

function resolveContentItemLabel(item = {}) {
  const localizedTitle = item?.metadata?.title
  return (
    localizedTitle?.en ||
    localizedTitle?.sw ||
    item?.title?.en ||
    item?.title?.sw ||
    item?.name ||
    item?.label ||
    item?.key ||
    item?.slug ||
    item?.contentItemId ||
    'Untitled content item'
  )
}

function resolveContentVersionLabel(item = {}) {
  return (
    item?.title?.en ||
    item?.title?.sw ||
    item?.name ||
    [item?.locale?.toUpperCase?.(), item?.versionNumber ? `v${item.versionNumber}` : '']
      .filter(Boolean)
      .join(' ') ||
    item?.contentVersionId ||
    'Untitled version'
  )
}

function findPageId(item = {}) {
  return item?.pageId || item?.page?._id || item?.page?.pageId || ''
}

function findContentItemId(item = {}) {
  return item?.contentItemId || item?.contentItem?._id || item?.contentItem?.contentItemId || ''
}

function findContentVersionId(item = {}) {
  return (
    item?.contentVersionId ||
    item?.contentVersion?._id ||
    item?.contentVersion?.contentVersionId ||
    ''
  )
}

async function loadPageOptions() {
  if (!cmsPages.value.length) {
    await pagesStore.list({ page: 1, limit: 200 })
  }

  return cmsPages.value.map((item) => ({
    value: item?.pageId,
    label: resolvePageLabel(item),
  }))
}

async function loadContentItemOptions() {
  if (!contentItems.value.length) {
    await contentItemsStore.list({ page: 1, limit: 200 })
  }

  return contentItems.value.map((item) => ({
    value: item?.contentItemId,
    label: resolveContentItemLabel(item),
  }))
}

async function loadContentVersionOptions({ model = {} } = {}) {
  const contentItemId = model?.contentItemId || form.contentItemId
  if (!contentItemId) return []

  const result = await versionsStore.list({
    page: 1,
    limit: 200,
    contentItemId,
  })

  return (Array.isArray(result) ? result : []).map((item) => ({
    value: item?.contentVersionId,
    label: resolveContentVersionLabel(item),
  }))
}

function getPageLabel(value) {
  const page = cmsPages.value.find((item) => item?.pageId === value)
  return page ? resolvePageLabel(page) : value || '-'
}

const pageField = {
  placeholder: 'Select page',
  loadOptions: loadPageOptions,
}

const contentItemField = {
  placeholder: 'Select content item',
  loadOptions: loadContentItemOptions,
}

const contentVersionField = {
  placeholder: 'Select content version',
  dependsOn: ['contentItemId'],
  loadOptions: loadContentVersionOptions,
}

const filteredForReorder = computed(() => {
  const pageId = String(reorderFilter.pageId || '').trim()
  const regionKey = reorderFilter.regionKey.trim().toLowerCase()

  return placements.value
    .filter((item) => {
      if (!pageId || !regionKey) return false
      return item.pageId === pageId && String(item.regionKey || '').toLowerCase() === regionKey
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
})

const reorderRows = computed(() => {
  if (!reorderPlacementIds.value.length) return filteredForReorder.value

  return reorderPlacementIds.value
    .map((placementId) => filteredForReorder.value.find((item) => item.placementId === placementId))
    .filter(Boolean)
})

watch(
  filteredForReorder,
  (rows) => {
    reorderPlacementIds.value = rows.map((item) => item.placementId)
  },
  { immediate: true },
)

watch(
  () => form.contentItemId,
  (nextValue, previousValue) => {
    if (nextValue !== previousValue) {
      form.contentVersionId = ''
    }
  },
)

function parseJson(value, fallback = null) {
  if (!value || !value.trim()) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function loadForm(item) {
  form.pageId = findPageId(item)
  form.regionKey = item?.regionKey || ''
  form.contentItemId = findContentItemId(item)
  form.contentVersionId = findContentVersionId(item)
  form.inlineBlockJson = item?.inlineBlock ? JSON.stringify(item.inlineBlock, null, 2) : ''
  form.order = item?.order || 1
  form.isActive = item?.isActive !== false
  form.startAt = item?.startAt ? String(item.startAt).slice(0, 16) : ''
  form.endAt = item?.endAt ? String(item.endAt).slice(0, 16) : ''
}

function clearForm({ preserveFeedback = false } = {}) {
  selectedId.value = ''
  if (!preserveFeedback) {
    feedback.value = ''
  }
  loadForm(null)
}

function clearReorderFilter() {
  reorderFilter.pageId = ''
  reorderFilter.regionKey = ''
  reorderPlacementIds.value = []
}

function selectPlacement(item) {
  selectedId.value = item.placementId
  loadForm(item)
}

async function refresh() {
  await Promise.all([
    placementsStore.list({ page: pager.page, limit: pager.limit }),
    pagesStore.list({ page: 1, limit: 200 }),
    contentItemsStore.list({ page: 1, limit: 200 }),
  ])
}

async function setPage(page) {
  pager.page = page
  await refresh()
}

async function setLimit(limit) {
  pager.limit = limit
  pager.page = 1
  await refresh()
}

async function save() {
  feedback.value = ''
  const pageId = String(form.pageId || '').trim()
  const contentItemId = String(form.contentItemId || '').trim()
  const contentVersionId = String(form.contentVersionId || '').trim()
  const payload = {
    pageId,
    regionKey: form.regionKey.trim(),
    contentItemId: contentItemId || null,
    contentVersionId: contentVersionId || null,
    inlineBlock: parseJson(form.inlineBlockJson, null),
    order: Number(form.order) || 1,
    isActive: form.isActive,
    startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
    endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
  }

  if (selectedId.value) {
    await placementsStore.update(selectedId.value, payload)
    feedback.value = 'Placement updated.'
  } else {
    await placementsStore.create(payload, false)
    feedback.value = 'Placement created.'
  }

  await refresh()
  clearForm({ preserveFeedback: true })
}

async function runWorkflow(action) {
  if (!selectedId.value) return
  const id = selectedId.value

  if (action === 'submit') await placementsStore.submit(id)
  if (action === 'approve') await placementsStore.approve(id)
  if (action === 'reject') await placementsStore.reject(id, 'Rejected from placements screen')
  if (action === 'publish') await placementsStore.publish(id)
  if (action === 'unpublish') await placementsStore.unpublish(id)
  if (action === 'archive') await placementsStore.archive(id, 'Archived from placements screen')
  if (action === 'restore') await placementsStore.restore(id)
  if (action === 'restoreArchived') await placementsStore.restoreArchived(id)
  if (action === 'softDelete')
    await placementsStore.softDelete(id, 'Soft deleted from placements screen')
  if (action === 'delete') await placementsStore.remove(id)

  await refresh()
}

function dragStart(index) {
  draggedIndex.value = index
}

function dragOver(event) {
  event.preventDefault()
}

function dropAt(index) {
  if (draggedIndex.value < 0 || draggedIndex.value === index) return
  const next = [...reorderPlacementIds.value]
  const [moved] = next.splice(draggedIndex.value, 1)
  next.splice(index, 0, moved)
  reorderPlacementIds.value = next
  draggedIndex.value = -1
}

async function persistReorder() {
  const pageId = String(reorderFilter.pageId || '').trim()
  const regionKey = reorderFilter.regionKey.trim().toLowerCase()
  if (!pageId || !regionKey || !reorderPlacementIds.value.length) return

  await placementsStore.reorder(pageId, regionKey, reorderPlacementIds.value)
  feedback.value = 'Placements reordered.'
  await refresh()
}

async function goBack() {
  await router.push({ name: 'contentManagement.overview' })
}

async function onHeaderAction(action) {
  if (action?.key === 'refresh') {
    await refresh()
    return
  }

  if (action?.key === 'create') {
    clearForm()
  }
}

onMounted(refresh)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Content Workspace"
        title="Placements"
        description="Map content into page regions, control timing, and keep placement order readable from one workspace."
        :actions="headerActions"
        :loading="loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="workspace-shell">
      <OverviewStatsGrid :stats="stats" />

      <section class="workspace-grid">
        <WorkspacePanel
          tag="article"
          eyebrow="Placement editor"
          :title="selectedId ? 'Update this placement' : 'Create a new placement'"
        >
          <el-form label-position="top" class="workspace-form" @submit.prevent="save">
            <AppFormRow :columns="2">
              <el-form-item label="Page" class="form-item-flush">
                <EntityRelationshipSelect v-model="form.pageId" :field="pageField" :model="form" />
              </el-form-item>
              <el-form-item label="Region Key" required class="form-item-flush">
                <el-input v-model="form.regionKey" />
              </el-form-item>
              <el-form-item label="Content Item" class="form-item-flush">
                <EntityRelationshipSelect
                  v-model="form.contentItemId"
                  :field="contentItemField"
                  :model="form"
                />
              </el-form-item>
              <el-form-item label="Content Version" class="form-item-flush">
                <EntityRelationshipSelect
                  v-model="form.contentVersionId"
                  :field="contentVersionField"
                  :model="form"
                />
              </el-form-item>
            </AppFormRow>

            <AppFormRow :columns="3">
              <el-form-item label="Order" class="form-item-flush">
                <el-input-number v-model="form.order" :min="1" />
              </el-form-item>
              <el-form-item label="Start At" class="form-item-flush">
                <el-date-picker
                  v-model="form.startAt"
                  type="datetime"
                  value-format="YYYY-MM-DDTHH:mm"
                  placeholder="Select start date"
                />
              </el-form-item>
              <el-form-item label="End At" class="form-item-flush">
                <el-date-picker
                  v-model="form.endAt"
                  type="datetime"
                  value-format="YYYY-MM-DDTHH:mm"
                  placeholder="Select end date"
                />
              </el-form-item>
            </AppFormRow>

            <el-form-item label="Inline Block (JSON optional)" class="form-item-flush">
              <el-input v-model="form.inlineBlockJson" type="textarea" :rows="5" />
            </el-form-item>

            <div class="workspace-toggle-row">
              <el-checkbox v-model="form.isActive">Active</el-checkbox>
            </div>

            <div class="workspace-form__actions">
              <el-button size="large" plain @click="clearForm">Clear</el-button>
              <el-button size="large" type="primary" native-type="submit" :loading="loading">
                {{ selectedId ? 'Save placement' : 'Create placement' }}
              </el-button>
            </div>

            <el-alert
              v-if="feedback"
              type="success"
              show-icon
              :closable="false"
              :title="feedback"
            />
            <el-alert v-if="error" type="error" show-icon :closable="false" :title="error" />
          </el-form>
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          eyebrow="Placement library"
          title="Browse active placement records"
        >
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="placements"
              row-key="placementId"
              stripe
              highlight-current-row
              :current-row-key="selectedId"
              v-loading="loading"
              @row-click="selectPlacement"
            >
              <el-table-column prop="placementId" label="Placement ID" min-width="190" />
              <el-table-column label="Page" min-width="220">
                <template #default="{ row }">
                  {{ getPageLabel(findPageId(row)) }}
                </template>
              </el-table-column>
              <el-table-column prop="regionKey" label="Region" min-width="140" />
              <el-table-column prop="order" label="Order" min-width="100" />
              <el-table-column label="Active" min-width="120">
                <template #default="{ row }">
                  <el-tag :type="row.isActive ? 'success' : 'info'" effect="plain">
                    {{ row.isActive ? 'Active' : 'Inactive' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Workflow" min-width="140">
                <template #default="{ row }">
                  <StatusBadge :value="resolveStatus(row)" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <TablePagination
            v-if="placements.length"
            :pagination="pagination"
            :loading="loading"
            @update:page="setPage"
            @update:limit="setLimit"
          />
        </WorkspacePanel>
      </section>

      <section class="workspace-grid workspace-grid--bottom">
        <WorkspacePanel
          tag="article"
          eyebrow="Selected placement"
          :title="selected?.placementId || 'Choose a placement from the list'"
        >
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div v-if="selected" class="workspace-summary">
            <div class="workspace-summary__row">
              <span>Page</span>
              <strong>{{ getPageLabel(findPageId(selected)) }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Region</span>
              <strong>{{ selected.regionKey || '-' }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Content item</span>
              <strong>{{ findContentItemId(selected) || 'Inline block only' }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Order</span>
              <strong>{{ selected.order || 1 }}</strong>
            </div>
          </div>

          <p v-else class="workspace-empty">
            Select a placement to review where it appears, what it references, and how it is ordered.
          </p>
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          eyebrow="Workflow"
          title="Submit, approve, archive, or restore"
        >
          <EntityWorkflowButtons
            :disabled="!selected"
            @submit="runWorkflow('submit')"
            @approve="runWorkflow('approve')"
            @reject="runWorkflow('reject')"
            @publish="runWorkflow('publish')"
            @unpublish="runWorkflow('unpublish')"
            @archive="runWorkflow('archive')"
            @restore="runWorkflow('restore')"
            @restore-archived="runWorkflow('restoreArchived')"
            @soft-delete="runWorkflow('softDelete')"
            @delete="runWorkflow('delete')"
          />
        </WorkspacePanel>
      </section>

      <WorkspacePanel eyebrow="Reorder workspace" title="Drag placement rows into the right sequence">
        <el-form label-position="top" class="workspace-form">
          <AppFormRow :columns="2">
            <el-form-item label="Page" class="form-item-flush">
              <EntityRelationshipSelect
                v-model="reorderFilter.pageId"
                :field="pageField"
                :model="reorderFilter"
              />
            </el-form-item>
            <el-form-item label="Region Key" class="form-item-flush">
              <el-input v-model="reorderFilter.regionKey" placeholder="hero" />
            </el-form-item>
          </AppFormRow>
        </el-form>

        <p class="workspace-hint">
          Filter by both page and region, then drag rows to reorder before saving.
        </p>

        <ul v-if="reorderRows.length" class="workspace-reorder-list">
          <li
            v-for="(item, index) in reorderRows"
            :key="item.placementId"
            class="workspace-reorder-item"
            draggable="true"
            @dragstart="dragStart(index)"
            @dragover="dragOver"
            @drop="dropAt(index)"
          >
            <span>#{{ index + 1 }}</span>
            <span>{{ item.placementId }}</span>
            <span>{{ getPageLabel(findPageId(item)) }} / {{ item.regionKey }}</span>
          </li>
        </ul>
        <p v-else class="workspace-empty">
          Select a page and region to load placements for manual ordering.
        </p>

        <div class="workspace-form__actions">
          <el-button size="large" plain @click="clearReorderFilter">Clear selection</el-button>
          <el-button
            size="large"
            type="primary"
            :disabled="!reorderRows.length"
            @click="persistReorder"
          >
            Save reorder
          </el-button>
        </div>
      </WorkspacePanel>
    </div>
  </PageWrapper>
</template>
