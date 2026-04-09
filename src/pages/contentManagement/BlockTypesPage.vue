<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useBlockTypesStore } from '@/stores/useBlockTypesStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

const blockTypesStore = useBlockTypesStore()
const { entities: blockTypes, loading, error, pagination } = storeToRefs(blockTypesStore)

const selectedId = ref('')
const feedback = ref('')
const pager = reactive({ page: 1, limit: 20 })

const form = reactive({
  key: '',
  label: '',
  description: '',
  allowedMediaCsv: '',
  schemaText: '{\n  "fields": []\n}',
  uiText: '{\n  "group": "content"\n}',
  isReusable: true,
  isActive: true,
})

const selected = computed(() =>
  blockTypes.value.find((item) => item.blockTypeId === selectedId.value),
)

function parseJson(text, fallback = {}) {
  try {
    return JSON.parse(text || '{}')
  } catch {
    return fallback
  }
}

function loadForm(item) {
  form.key = item?.key || ''
  form.label = item?.label || ''
  form.description = item?.description || ''
  form.allowedMediaCsv = Array.isArray(item?.allowedMedia) ? item.allowedMedia.join(', ') : ''
  form.schemaText = JSON.stringify(item?.schema || { fields: [] }, null, 2)
  form.uiText = JSON.stringify(item?.ui || { group: 'content' }, null, 2)
  form.isReusable = item?.isReusable !== false
  form.isActive = item?.isActive !== false
}

function clearForm() {
  selectedId.value = ''
  loadForm(null)
}

function selectBlockType(item) {
  selectedId.value = item.blockTypeId
  loadForm(item)
}

async function refresh() {
  await blockTypesStore.list({ page: pager.page, limit: pager.limit })
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
  const payload = {
    key: form.key.trim(),
    label: form.label.trim(),
    description: form.description.trim() || null,
    allowedMedia: form.allowedMediaCsv
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    schema: parseJson(form.schemaText, { fields: [] }),
    ui: parseJson(form.uiText, { group: 'content' }),
    isReusable: form.isReusable,
    isActive: form.isActive,
  }

  if (selectedId.value) {
    await blockTypesStore.update(selectedId.value, payload)
    feedback.value = 'Block type updated.'
  } else {
    await blockTypesStore.create(payload, false)
    feedback.value = 'Block type created.'
  }
  await refresh()
  clearForm()
}

async function runWorkflow(action) {
  if (!selectedId.value) return
  const id = selectedId.value

  if (action === 'submit') await blockTypesStore.submit(id)
  if (action === 'approve') await blockTypesStore.approve(id)
  if (action === 'reject') await blockTypesStore.reject(id, 'Rejected from block types screen')
  if (action === 'publish') await blockTypesStore.publish(id)
  if (action === 'unpublish') await blockTypesStore.unpublish(id)
  if (action === 'archive') await blockTypesStore.archive(id, 'Archived from block types screen')
  if (action === 'restore') await blockTypesStore.restore(id)
  if (action === 'restoreArchived') await blockTypesStore.restoreArchived(id)
  if (action === 'softDelete')
    await blockTypesStore.softDelete(id, 'Soft deleted from block types screen')
  if (action === 'delete') await blockTypesStore.remove(id)

  await refresh()
}

onMounted(refresh)
</script>

<template>
  <PageWrapper class="page">
    <div class="toolbar">
      <h1>Block Types</h1>
      <div class="toolbar-actions">
        <button class="btn btn-muted" type="button" @click="refresh">Refresh</button>
        <button class="btn btn-muted" type="button" @click="clearForm">New</button>
      </div>
    </div>

    <AppBentoGrid columns="2">
      <section class="card">
        <h2>{{ selectedId ? 'Edit Block Type' : 'Create Block Type' }}</h2>
        <form class="form" @submit.prevent="save">
          <label>Key <input v-model="form.key" type="text" required /></label>
          <label>Label <input v-model="form.label" type="text" required /></label>
          <label>Description <input v-model="form.description" type="text" /></label>
          <label>Allowed Media <input v-model="form.allowedMediaCsv" type="text" /></label>
          <label>Schema (JSON) <textarea v-model="form.schemaText" rows="7" /></label>
          <label>UI (JSON) <textarea v-model="form.uiText" rows="5" /></label>
          <div class="checkboxes">
            <label><input v-model="form.isReusable" type="checkbox" /> Reusable</label>
            <label><input v-model="form.isActive" type="checkbox" /> Active</label>
          </div>
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : selectedId ? 'Update' : 'Create' }}
          </button>
          <p v-if="feedback" class="feedback">{{ feedback }}</p>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </section>

      <section class="card">
        <h2>Registered Block Types</h2>
        <p v-if="loading">Loading block types...</p>
        <p v-else-if="!blockTypes.length">No block types found.</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th>Reusable</th>
              <th>Active</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in blockTypes"
              :key="item.blockTypeId"
              :class="{ selected: item.blockTypeId === selectedId }"
              @click="selectBlockType(item)"
            >
              <td>{{ item.key }}</td>
              <td>{{ item.label }}</td>
              <td>{{ item.isReusable ? 'Yes' : 'No' }}</td>
              <td>{{ item.isActive ? 'Yes' : 'No' }}</td>
              <td>{{ item.publicationStatus || 'draft' }}</td>
            </tr>
          </tbody>
        </table>
        <TablePagination
          v-if="blockTypes.length"
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-actions,
.checkboxes {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
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
  font-size: 0.9rem;
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
  font-size: 0.86rem;
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
