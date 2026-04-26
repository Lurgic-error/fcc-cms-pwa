<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useLayoutsStore } from '@/stores/useLayoutsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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

const stats = computed(() => [
  { key: 'total', label: 'Layouts', value: layouts.value.length },
  {
    key: 'active',
    label: 'Active',
    value: layouts.value.filter((item) => item?.isActive !== false).length,
  },
  {
    key: 'published',
    label: 'Published',
    value: layouts.value.filter((item) => resolveStatus(item) === 'published').length,
  },
  {
    key: 'regions',
    label: 'Defined Regions',
    value: layouts.value.reduce((total, item) => total + countRegions(item), 0),
  },
])

const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh workspace' },
  { key: 'create', label: 'New layout' },
])

function parseJson(value, fallback = []) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function resolveStatus(item = {}) {
  return item?.effectiveStatus || item?.publicationStatus || 'draft'
}

function countRegions(item = {}) {
  return Array.isArray(item?.regions) ? item.regions.length : 0
}

function loadForm(item) {
  form.name = item?.name || ''
  form.description = item?.description || ''
  form.regionsJson = JSON.stringify(item?.regions || [], null, 2)
  form.isActive = item?.isActive !== false
}

function clearForm({ preserveFeedback = false } = {}) {
  selectedId.value = ''
  if (!preserveFeedback) {
    feedback.value = ''
  }
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
  clearForm({ preserveFeedback: true })
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
  if (action === 'softDelete')
    await layoutsStore.softDelete(id, 'Soft deleted from layouts screen')
  if (action === 'delete') await layoutsStore.remove(id)

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
        title="Layouts"
        description="Shape reusable page regions and allowed content structure from one editorial layout workspace."
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
          eyebrow="Layout editor"
          :title="selectedId ? 'Update this layout' : 'Create a new layout'"
        >
          <el-form label-position="top" class="workspace-form" @submit.prevent="save">
            <AppFormRow :columns="2">
              <el-form-item label="Name" required class="form-item-flush">
                <el-input v-model="form.name" />
              </el-form-item>
              <el-form-item label="Description" class="form-item-flush">
                <el-input v-model="form.description" />
              </el-form-item>
            </AppFormRow>

            <el-form-item label="Regions (JSON Array)" class="form-item-flush">
              <el-input v-model="form.regionsJson" type="textarea" :rows="12" />
            </el-form-item>

            <div class="workspace-toggle-row">
              <el-checkbox v-model="form.isActive">Active</el-checkbox>
            </div>

            <div class="workspace-form__actions">
              <el-button size="large" plain @click="clearForm">Clear</el-button>
              <el-button size="large" type="primary" native-type="submit" :loading="loading">
                {{ selectedId ? 'Save layout' : 'Create layout' }}
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

        <WorkspacePanel tag="article" eyebrow="Layout library" title="Browse registered layouts">
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="layouts"
              row-key="layoutId"
              stripe
              highlight-current-row
              :current-row-key="selectedId"
              v-loading="loading"
              @row-click="selectLayout"
            >
              <el-table-column prop="name" label="Name" min-width="200" />
              <el-table-column label="Regions" min-width="120">
                <template #default="{ row }">
                  {{ countRegions(row) }}
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
            v-if="layouts.length"
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
          eyebrow="Selected layout"
          :title="selected?.name || 'Choose a layout from the library'"
        >
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div v-if="selected" class="workspace-summary">
            <div class="workspace-summary__row">
              <span>Description</span>
              <strong>{{ selected.description || 'No description yet' }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Defined regions</span>
              <strong>{{ countRegions(selected) }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Lifecycle</span>
              <strong>{{ selected.isActive ? 'Active' : 'Inactive' }}</strong>
            </div>
          </div>

          <p v-else class="workspace-empty">
            Select a layout to review how many regions it exposes and whether it is ready for use.
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
