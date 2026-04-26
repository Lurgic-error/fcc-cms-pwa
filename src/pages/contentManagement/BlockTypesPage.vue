<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useBlockTypesStore } from '@/stores/useBlockTypesStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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

const stats = computed(() => [
  { key: 'total', label: 'Block Types', value: blockTypes.value.length },
  {
    key: 'active',
    label: 'Active',
    value: blockTypes.value.filter((item) => item?.isActive !== false).length,
  },
  {
    key: 'reusable',
    label: 'Reusable',
    value: blockTypes.value.filter((item) => item?.isReusable !== false).length,
  },
  {
    key: 'published',
    label: 'Published',
    value: blockTypes.value.filter((item) => resolveStatus(item) === 'published').length,
  },
])

const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh workspace' },
  { key: 'create', label: 'New block type' },
])

function parseJson(text, fallback = {}) {
  try {
    return JSON.parse(text || '{}')
  } catch {
    return fallback
  }
}

function resolveStatus(item = {}) {
  return item?.effectiveStatus || item?.publicationStatus || 'draft'
}

function countSchemaFields(item = {}) {
  return Array.isArray(item?.schema?.fields) ? item.schema.fields.length : 0
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

function clearForm({ preserveFeedback = false } = {}) {
  selectedId.value = ''
  if (!preserveFeedback) {
    feedback.value = ''
  }
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
  clearForm({ preserveFeedback: true })
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
        title="Block Types"
        description="Define reusable content blueprints, editor field schema, and media behavior in one structured workspace."
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
          eyebrow="Schema editor"
          :title="selectedId ? 'Update this block type' : 'Create a new block type'"
        >
          <el-form label-position="top" class="workspace-form" @submit.prevent="save">
            <AppFormRow :columns="2">
              <el-form-item label="Key" required class="form-item-flush">
                <el-input v-model="form.key" />
              </el-form-item>
              <el-form-item label="Label" required class="form-item-flush">
                <el-input v-model="form.label" />
              </el-form-item>
              <el-form-item label="Description" class="form-item-flush">
                <el-input v-model="form.description" />
              </el-form-item>
              <el-form-item label="Allowed Media" class="form-item-flush">
                <el-input v-model="form.allowedMediaCsv" placeholder="image, video, document" />
              </el-form-item>
            </AppFormRow>

            <el-form-item label="Schema (JSON)" class="form-item-flush">
              <el-input v-model="form.schemaText" type="textarea" :rows="8" />
            </el-form-item>

            <el-form-item label="UI (JSON)" class="form-item-flush">
              <el-input v-model="form.uiText" type="textarea" :rows="6" />
            </el-form-item>

            <div class="workspace-toggle-row">
              <el-checkbox v-model="form.isReusable">Reusable</el-checkbox>
              <el-checkbox v-model="form.isActive">Active</el-checkbox>
            </div>

            <div class="workspace-form__actions">
              <el-button size="large" plain @click="clearForm">Clear</el-button>
              <el-button size="large" type="primary" native-type="submit" :loading="loading">
                {{ selectedId ? 'Save block type' : 'Create block type' }}
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

        <WorkspacePanel tag="article" eyebrow="Block library" title="Browse registered block types">
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="blockTypes"
              row-key="blockTypeId"
              stripe
              highlight-current-row
              :current-row-key="selectedId"
              v-loading="loading"
              @row-click="selectBlockType"
            >
              <el-table-column prop="key" label="Key" min-width="180" />
              <el-table-column prop="label" label="Label" min-width="180" />
              <el-table-column label="Reusable" min-width="120">
                <template #default="{ row }">
                  <el-tag :type="row.isReusable ? 'success' : 'info'" effect="plain">
                    {{ row.isReusable ? 'Reusable' : 'Single use' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Active" min-width="120">
                <template #default="{ row }">
                  <el-tag :type="row.isActive ? 'success' : 'info'" effect="plain">
                    {{ row.isActive ? 'Active' : 'Inactive' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Status" min-width="140">
                <template #default="{ row }">
                  <StatusBadge :value="resolveStatus(row)" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <TablePagination
            v-if="blockTypes.length"
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
          eyebrow="Selected block type"
          :title="selected?.label || 'Choose a block type from the library'"
        >
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div v-if="selected" class="workspace-summary">
            <div class="workspace-summary__row">
              <span>Key</span>
              <strong>{{ selected.key }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Allowed media</span>
              <strong>{{
                Array.isArray(selected.allowedMedia) && selected.allowedMedia.length
                  ? selected.allowedMedia.join(', ')
                  : 'Not specified'
              }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Schema fields</span>
              <strong>{{ countSchemaFields(selected) }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Editor mode</span>
              <strong>{{ selected.isReusable ? 'Reusable' : 'Single use' }}</strong>
            </div>
          </div>

          <p v-else class="workspace-empty">
            Select a block type to review how editors can reuse it and what media it allows.
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
    </div>
  </PageWrapper>
</template>
