<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import EntityRelationshipSelect from '@/components/forms/EntityRelationshipSelect.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useContentVersionsStore } from '@/stores/useContentVersionsStore'
import { useContentItemsStore } from '@/stores/useContentItemsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

const versionsStore = useContentVersionsStore()
const contentItemsStore = useContentItemsStore()
const { entities: versions, loading, error, pagination } = storeToRefs(versionsStore)
const { entities: contentItems } = storeToRefs(contentItemsStore)

const selectedId = ref('')
const feedback = ref('')
const pager = reactive({ page: 1, limit: 20 })

const filters = reactive({
  contentItemId: '',
  locale: '',
})

const form = reactive({
  contentItemId: '',
  locale: 'en',
  translationStatus: 'completed',
  titleJson: '{\n  "en": "",\n  "sw": ""\n}',
  blocksJson: '[]',
  mediaJson: '{\n  "coverImage": null,\n  "backgroundImage": null,\n  "gallery": []\n}',
  styleJson: '{}',
  actionsJson: '[]',
  metadataJson: '{}',
})

const selected = computed(() =>
  versions.value.find((item) => item.contentVersionId === selectedId.value),
)

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

function findContentItemId(item = {}) {
  return item?.contentItemId || item?.contentItem?._id || item?.contentItem?.contentItemId || ''
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

function getContentItemLabel(item = {}) {
  const contentItemId = findContentItemId(item)
  const linkedItem = item?.contentItem
  const storedItem = contentItems.value.find((entry) => entry?.contentItemId === contentItemId)

  if (linkedItem && Object.keys(linkedItem).length) {
    return resolveContentItemLabel(linkedItem)
  }

  if (storedItem) {
    return resolveContentItemLabel(storedItem)
  }

  return contentItemId || '-'
}

const contentItemField = {
  placeholder: 'Select content item',
  loadOptions: loadContentItemOptions,
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function loadForm(item) {
  form.contentItemId = findContentItemId(item)
  form.locale = item?.locale || 'en'
  form.translationStatus = item?.translationStatus || 'completed'
  form.titleJson = JSON.stringify(item?.title || {}, null, 2)
  form.blocksJson = JSON.stringify(item?.blocks || [], null, 2)
  form.mediaJson = JSON.stringify(item?.media || {}, null, 2)
  form.styleJson = JSON.stringify(item?.style || {}, null, 2)
  form.actionsJson = JSON.stringify(item?.actions || [], null, 2)
  form.metadataJson = JSON.stringify(item?.metadata || {}, null, 2)
}

function clearForm() {
  selectedId.value = ''
  loadForm(null)
}

function selectContentVersion(item) {
  selectedId.value = item.contentVersionId
  loadForm(item)
}

async function refresh() {
  const query = { page: pager.page, limit: pager.limit }
  const contentItemId = String(filters.contentItemId || '').trim()
  if (contentItemId) query.contentItemId = contentItemId
  if (filters.locale.trim()) query.locale = filters.locale.trim().toLowerCase()
  await Promise.all([versionsStore.list(query), contentItemsStore.list({ page: 1, limit: 200 })])
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
  const contentItemId = String(form.contentItemId || '').trim()
  const payload = {
    contentItemId,
    locale: form.locale.trim().toLowerCase(),
    translationStatus: form.translationStatus,
    title: parseJson(form.titleJson, {}),
    blocks: parseJson(form.blocksJson, []),
    media: parseJson(form.mediaJson, {}),
    style: parseJson(form.styleJson, {}),
    actions: parseJson(form.actionsJson, []),
    metadata: parseJson(form.metadataJson, {}),
  }

  if (selectedId.value) {
    await versionsStore.update(selectedId.value, payload)
    feedback.value = 'Content version updated.'
  } else {
    await versionsStore.createForItem(contentItemId, payload)
    feedback.value = 'Content version created.'
  }

  await refresh()
  clearForm()
}

async function runWorkflow(action) {
  if (!selectedId.value) return
  const id = selectedId.value

  if (action === 'submit') await versionsStore.submit(id)
  if (action === 'approve') await versionsStore.approve(id)
  if (action === 'reject') await versionsStore.reject(id, 'Rejected from content versions screen')
  if (action === 'publish') await versionsStore.publish(id)
  if (action === 'unpublish') await versionsStore.unpublish(id)
  if (action === 'archive') await versionsStore.archive(id, 'Archived from content versions screen')
  if (action === 'restore') await versionsStore.restore(id)
  if (action === 'restoreArchived') await versionsStore.restoreArchived(id)
  if (action === 'softDelete')
    await versionsStore.softDelete(id, 'Soft deleted from content versions screen')
  if (action === 'delete') await versionsStore.remove(id)

  await refresh()
}

onMounted(refresh)
</script>

<template>
  <PageWrapper class="page">
    <div class="toolbar">
      <h1>Content Versions</h1>
      <div class="toolbar-actions">
        <button class="btn btn-muted" type="button" @click="refresh">Refresh</button>
        <button class="btn btn-muted" type="button" @click="clearForm">New</button>
      </div>
    </div>

    <section class="card">
      <h2>Filters</h2>
      <AppFormRow :columns="3" class="mb-4">
        <label>
          Content Item
          <EntityRelationshipSelect
            v-model="filters.contentItemId"
            :field="contentItemField"
            :model="filters"
          />
        </label>
        <label>
          Locale
          <select v-model="filters.locale">
            <option value="">All</option>
            <option value="en">English</option>
            <option value="sw">Swahili</option>
          </select>
        </label>
        <button class="btn btn-primary" type="button" @click="refresh">Apply Filters</button>
      </AppFormRow>
    </section>

    <AppBentoGrid columns="2">
      <section class="card">
        <h2>{{ selectedId ? 'Edit Content Version' : 'Create Content Version' }}</h2>
        <form class="form" @submit.prevent="save">
          <label>
            Content Item
            <EntityRelationshipSelect
              v-model="form.contentItemId"
              :field="contentItemField"
              :model="form"
            />
          </label>
          <label>
            Locale
            <select v-model="form.locale" required>
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </label>
          <label>
            Translation Status
            <select v-model="form.translationStatus">
              <option value="missing">missing</option>
              <option value="in-progress">in-progress</option>
              <option value="completed">completed</option>
              <option value="reviewed">reviewed</option>
              <option value="rejected">rejected</option>
            </select>
          </label>
          <label>Title (JSON) <textarea v-model="form.titleJson" rows="5" /></label>
          <label>Blocks (JSON Array) <textarea v-model="form.blocksJson" rows="8" /></label>
          <label>Media (JSON) <textarea v-model="form.mediaJson" rows="6" /></label>
          <label>Style (JSON) <textarea v-model="form.styleJson" rows="4" /></label>
          <label>Actions (JSON Array) <textarea v-model="form.actionsJson" rows="5" /></label>
          <label>Metadata (JSON) <textarea v-model="form.metadataJson" rows="5" /></label>
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : selectedId ? 'Update Version' : 'Create Version' }}
          </button>
          <p v-if="feedback" class="feedback">{{ feedback }}</p>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </section>

      <section class="card">
        <h2>Versions</h2>
        <p v-if="loading">Loading content versions...</p>
        <p v-else-if="!versions.length">No versions found.</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Version ID</th>
              <th>Content Item</th>
              <th>Locale</th>
              <th>Version</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in versions"
              :key="item.contentVersionId"
              :class="{ selected: item.contentVersionId === selectedId }"
              @click="selectContentVersion(item)"
            >
              <td>{{ item.contentVersionId }}</td>
              <td>{{ getContentItemLabel(item) }}</td>
              <td>{{ item.locale }}</td>
              <td>{{ item.versionNumber }}</td>
              <td>{{ item.publicationStatus || 'draft' }}</td>
            </tr>
          </tbody>
        </table>
        <TablePagination
          v-if="versions.length"
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

.form {
  display: grid;
  gap: 0.6rem;
}

label {
  display: grid;
  gap: 0.3rem;
}

input,
select,
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

.error {
  color: var(--color-danger);
}
</style>
