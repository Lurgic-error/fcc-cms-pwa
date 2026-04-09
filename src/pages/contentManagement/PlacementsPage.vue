<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import EntityRelationshipSelect from '@/components/forms/EntityRelationshipSelect.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useCmsPagesStore } from '@/stores/useCmsPagesStore'
import { useContentItemsStore } from '@/stores/useContentItemsStore'
import { useContentVersionsStore } from '@/stores/useContentVersionsStore'
import { usePlacementsStore } from '@/stores/usePlacementsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'

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

function clearForm() {
  selectedId.value = ''
  loadForm(null)
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
  clearForm()
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

onMounted(refresh)
</script>

<template>
  <PageWrapper class="page">
    <div class="toolbar">
      <h1>Placements</h1>
      <div class="toolbar-actions">
        <button class="btn btn-muted" type="button" @click="refresh">Refresh</button>
        <button class="btn btn-muted" type="button" @click="clearForm">New</button>
      </div>
    </div>

    <AppBentoGrid columns="2">
      <section class="card">
        <h2>{{ selectedId ? 'Edit Placement' : 'Create Placement' }}</h2>
        <form class="form" @submit.prevent="save">
          <label>
            Page
            <EntityRelationshipSelect v-model="form.pageId" :field="pageField" :model="form" />
          </label>
          <label>Region Key <input v-model="form.regionKey" type="text" required /></label>
          <label>
            Content Item
            <EntityRelationshipSelect
              v-model="form.contentItemId"
              :field="contentItemField"
              :model="form"
            />
          </label>
          <label>
            Content Version
            <EntityRelationshipSelect
              v-model="form.contentVersionId"
              :field="contentVersionField"
              :model="form"
            />
          </label>
          <label
            >Inline Block (JSON optional) <textarea v-model="form.inlineBlockJson" rows="5" />
          </label>
          <label>Order <input v-model.number="form.order" type="number" min="1" /></label>
          <label><input v-model="form.isActive" type="checkbox" /> Active</label>
          <label>Start At <input v-model="form.startAt" type="datetime-local" /></label>
          <label>End At <input v-model="form.endAt" type="datetime-local" /></label>
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : selectedId ? 'Update Placement' : 'Create Placement' }}
          </button>
          <p v-if="feedback" class="feedback">{{ feedback }}</p>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </section>

      <section class="card">
        <h2>Placements</h2>
        <p v-if="loading">Loading placements...</p>
        <p v-else-if="!placements.length">No placements found.</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Placement ID</th>
              <th>Page</th>
              <th>Region</th>
              <th>Order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in placements"
              :key="item.placementId"
              :class="{ selected: item.placementId === selectedId }"
              @click="selectPlacement(item)"
            >
              <td>{{ item.placementId }}</td>
              <td>{{ getPageLabel(findPageId(item)) }}</td>
              <td>{{ item.regionKey }}</td>
              <td>{{ item.order }}</td>
              <td>{{ item.publicationStatus || 'draft' }}</td>
            </tr>
          </tbody>
        </table>
        <TablePagination
          v-if="placements.length"
          :pagination="pagination"
          :loading="loading"
          @update:page="setPage"
          @update:limit="setLimit"
        />
      </section>
    </AppBentoGrid>

    <section class="card">
      <h2>Workflow Actions</h2>
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
    </section>

    <section class="card">
      <h2>Drag &amp; Drop Reorder</h2>
      <div class="filters">
        <label>
          Page
          <EntityRelationshipSelect
            v-model="reorderFilter.pageId"
            :field="pageField"
            :model="reorderFilter"
          />
        </label>
        <label
          >Region Key <input v-model="reorderFilter.regionKey" type="text" placeholder="hero"
        /></label>
      </div>
      <p class="hint">Filter by both page and region, drag rows to reorder, then click save.</p>
      <ul class="reorder-list">
        <li
          v-for="(item, index) in reorderRows"
          :key="item.placementId"
          class="reorder-item"
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
      <button
        class="btn btn-primary"
        type="button"
        :disabled="!reorderRows.length"
        @click="persistReorder"
      >
        Save Reorder
      </button>
    </section>
  </PageWrapper>
</template>

<style scoped>
.page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.toolbar,
.toolbar-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.card {
  border: 1px solid var(--color-fcc-border);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--color-surface);
}

.form,
.filters {
  display: grid;
  gap: 0.6rem;
}

label {
  display: grid;
  gap: 0.3rem;
}

input,
textarea {
  border: 1px solid var(--color-secondary-300);
  border-radius: 0.375rem;
  padding: 0.45rem 0.55rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid var(--color-fcc-border);
  padding: 0.45rem;
  text-align: left;
  font-size: 0.82rem;
}

.table tbody tr {
  cursor: pointer;
}

.table tbody tr.selected {
  background: var(--color-secondary-50);
}

.reorder-list {
  list-style: none;
  padding: 0;
  margin: 0.7rem 0;
  display: grid;
  gap: 0.45rem;
}

.reorder-item {
  border: 1px dashed var(--color-fcc-text-muted);
  border-radius: 0.35rem;
  background: var(--color-surface-muted);
  padding: 0.45rem 0.6rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  cursor: move;
  font-size: 0.85rem;
}

.btn {
  border: 1px solid var(--color-secondary-300);
  border-radius: 0.375rem;
  padding: 0.45rem 0.7rem;
  background: var(--color-surface);
  cursor: pointer;
}

.btn-primary {
  border-color: var(--color-primary-600);
  background: var(--color-primary-600);
  color: var(--color-surface);
}

.btn-muted {
  background: var(--color-surface-muted);
}

.feedback {
  color: var(--color-primary-600);
}

.hint {
  color: var(--color-fcc-text-muted);
  font-size: 0.86rem;
}

.error {
  color: var(--color-danger);
}
</style>
