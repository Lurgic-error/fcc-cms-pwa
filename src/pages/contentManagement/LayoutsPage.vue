<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useLayoutsStore } from '@/stores/useLayoutsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

const layoutsStore = useLayoutsStore()
const { entities: layouts, loading, error, pagination } = storeToRefs(layoutsStore)

const selectedId = ref('')
const feedback = ref('')
const pager = reactive({ page: 1, limit: 20 })

const form = reactive({
  name: '',
  description: '',
  regionsJson: JSON.stringify(
    [
      {
        key: 'hero',
        label: 'Hero',
        order: 1,
        allowedBlockTypes: ['hero'],
        maxItems: 1,
        isRepeatable: false,
      },
      {
        key: 'main',
        label: 'Main Content',
        order: 2,
        allowedBlockTypes: ['cta', 'text'],
        maxItems: null,
        isRepeatable: true,
      },
    ],
    null,
    2,
  ),
  isActive: true,
})

const selected = computed(() => layouts.value.find((item) => item.layoutId === selectedId.value))

function parseJson(value, fallback = []) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function loadForm(item) {
  form.name = item?.name || ''
  form.description = item?.description || ''
  form.regionsJson = JSON.stringify(item?.regions || [], null, 2)
  form.isActive = item?.isActive !== false
}

function clearForm() {
  selectedId.value = ''
  loadForm(null)
}

function selectLayout(item) {
  selectedId.value = item.layoutId
  loadForm(item)
}

async function refresh() {
  await layoutsStore.list({ page: pager.page, limit: pager.limit })
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
    name: form.name.trim(),
    description: form.description.trim() || null,
    regions: parseJson(form.regionsJson, []),
    isActive: form.isActive,
  }

  if (selectedId.value) {
    await layoutsStore.update(selectedId.value, payload)
    feedback.value = 'Layout updated.'
  } else {
    await layoutsStore.create(payload, false)
    feedback.value = 'Layout created.'
  }

  await refresh()
  clearForm()
}

async function runWorkflow(action) {
  if (!selectedId.value) return
  const id = selectedId.value

  if (action === 'submit') await layoutsStore.submit(id)
  if (action === 'approve') await layoutsStore.approve(id)
  if (action === 'reject') await layoutsStore.reject(id, 'Rejected from layouts screen')
  if (action === 'publish') await layoutsStore.publish(id)
  if (action === 'unpublish') await layoutsStore.unpublish(id)
  if (action === 'archive') await layoutsStore.archive(id, 'Archived from layouts screen')
  if (action === 'restore') await layoutsStore.restore(id)
  if (action === 'restoreArchived') await layoutsStore.restoreArchived(id)
  if (action === 'softDelete') await layoutsStore.softDelete(id, 'Soft deleted from layouts screen')
  if (action === 'delete') await layoutsStore.remove(id)

  await refresh()
}

onMounted(refresh)
</script>

<template>
  <PageWrapper class="page">
    <div class="toolbar">
      <h1>Layouts</h1>
      <div class="toolbar-actions">
        <button class="btn btn-muted" type="button" @click="refresh">Refresh</button>
        <button class="btn btn-muted" type="button" @click="clearForm">New</button>
      </div>
    </div>

    <AppBentoGrid columns="2">
      <section class="card">
        <h2>{{ selectedId ? 'Edit Layout' : 'Create Layout' }}</h2>
        <form class="form" @submit.prevent="save">
          <label>Name <input v-model="form.name" type="text" required /></label>
          <label>Description <input v-model="form.description" type="text" /></label>
          <label>Regions (JSON Array) <textarea v-model="form.regionsJson" rows="12" /></label>
          <label><input v-model="form.isActive" type="checkbox" /> Active</label>
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : selectedId ? 'Update Layout' : 'Create Layout' }}
          </button>
          <p v-if="feedback" class="feedback">{{ feedback }}</p>
          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </section>

      <section class="card">
        <h2>Layouts</h2>
        <p v-if="loading">Loading layouts...</p>
        <p v-else-if="!layouts.length">No layouts found.</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Regions</th>
              <th>Active</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in layouts"
              :key="item.layoutId"
              :class="{ selected: item.layoutId === selectedId }"
              @click="selectLayout(item)"
            >
              <td>{{ item.name }}</td>
              <td>{{ Array.isArray(item.regions) ? item.regions.length : 0 }}</td>
              <td>{{ item.isActive ? 'Yes' : 'No' }}</td>
              <td>{{ item.publicationStatus || 'draft' }}</td>
            </tr>
          </tbody>
        </table>
        <TablePagination
          v-if="layouts.length"
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
