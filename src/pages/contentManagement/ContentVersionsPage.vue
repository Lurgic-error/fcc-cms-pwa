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
import { useContentVersionsStore } from '@/stores/useContentVersionsStore'
import { useContentItemsStore } from '@/stores/useContentItemsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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

const stats = computed(() => [
  { key: 'total', label: 'Versions', value: versions.value.length },
  {
    key: 'completed',
    label: 'Completed',
    value: versions.value.filter((item) => item?.translationStatus === 'completed').length,
  },
  {
    key: 'reviewed',
    label: 'Reviewed',
    value: versions.value.filter((item) => item?.translationStatus === 'reviewed').length,
  },
  {
    key: 'published',
    label: 'Published',
    value: versions.value.filter((item) => resolveStatus(item) === 'published').length,
  },
])

const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh workspace' },
  { key: 'create', label: 'New version' },
  { key: 'resetFilters', label: 'Clear filters' },
])

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

function resolveStatus(item = {}) {
  return item?.effectiveStatus || item?.publicationStatus || 'draft'
}

function resolveTranslationTone(status = '') {
  if (status === 'completed' || status === 'reviewed') return 'success'
  if (status === 'in-progress') return 'warning'
  if (status === 'rejected') return 'danger'
  return 'info'
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

function clearForm({ preserveFeedback = false } = {}) {
  selectedId.value = ''
  if (!preserveFeedback) {
    feedback.value = ''
  }
  loadForm(null)
}

async function resetFilters() {
  filters.contentItemId = ''
  filters.locale = ''
  pager.page = 1
  await refresh()
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
  clearForm({ preserveFeedback: true })
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
    return
  }

  if (action?.key === 'resetFilters') {
    await resetFilters()
  }
}

onMounted(refresh)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Content Workspace"
        title="Content Versions"
        description="Manage localized content payloads and translation lifecycle in a structured editorial workspace."
        :actions="headerActions"
        :loading="loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="workspace-shell">
      <OverviewStatsGrid :stats="stats" />

      <WorkspacePanel eyebrow="Filters" title="Focus the active version list">
        <el-form label-position="top" class="workspace-form" @submit.prevent="refresh">
          <AppFormRow :columns="2">
            <el-form-item label="Content Item" class="form-item-flush">
              <EntityRelationshipSelect
                v-model="filters.contentItemId"
                :field="contentItemField"
                :model="filters"
              />
            </el-form-item>
            <el-form-item label="Locale" class="form-item-flush">
              <el-select v-model="filters.locale">
                <el-option label="All" value="" />
                <el-option label="English" value="en" />
                <el-option label="Swahili" value="sw" />
              </el-select>
            </el-form-item>
          </AppFormRow>

          <div class="workspace-form__actions">
            <el-button size="large" plain @click="resetFilters">Clear filters</el-button>
            <el-button size="large" type="primary" native-type="submit">Apply filters</el-button>
          </div>
        </el-form>
      </WorkspacePanel>

      <section class="workspace-grid">
        <WorkspacePanel
          tag="article"
          eyebrow="Version editor"
          :title="selectedId ? 'Update this content version' : 'Create a new content version'"
        >
          <el-form label-position="top" class="workspace-form" @submit.prevent="save">
            <AppFormRow :columns="3">
              <el-form-item label="Content Item" class="form-item-flush">
                <EntityRelationshipSelect
                  v-model="form.contentItemId"
                  :field="contentItemField"
                  :model="form"
                />
              </el-form-item>
              <el-form-item label="Locale" required class="form-item-flush">
                <el-select v-model="form.locale">
                  <el-option label="English" value="en" />
                  <el-option label="Swahili" value="sw" />
                </el-select>
              </el-form-item>
              <el-form-item label="Translation Status" class="form-item-flush">
                <el-select v-model="form.translationStatus">
                  <el-option label="missing" value="missing" />
                  <el-option label="in-progress" value="in-progress" />
                  <el-option label="completed" value="completed" />
                  <el-option label="reviewed" value="reviewed" />
                  <el-option label="rejected" value="rejected" />
                </el-select>
              </el-form-item>
            </AppFormRow>

            <el-form-item label="Title (JSON)" class="form-item-flush">
              <el-input v-model="form.titleJson" type="textarea" :rows="5" />
            </el-form-item>
            <el-form-item label="Blocks (JSON Array)" class="form-item-flush">
              <el-input v-model="form.blocksJson" type="textarea" :rows="8" />
            </el-form-item>
            <el-form-item label="Media (JSON)" class="form-item-flush">
              <el-input v-model="form.mediaJson" type="textarea" :rows="6" />
            </el-form-item>
            <el-form-item label="Style (JSON)" class="form-item-flush">
              <el-input v-model="form.styleJson" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="Actions (JSON Array)" class="form-item-flush">
              <el-input v-model="form.actionsJson" type="textarea" :rows="5" />
            </el-form-item>
            <el-form-item label="Metadata (JSON)" class="form-item-flush">
              <el-input v-model="form.metadataJson" type="textarea" :rows="5" />
            </el-form-item>

            <div class="workspace-form__actions">
              <el-button size="large" plain @click="clearForm">Clear</el-button>
              <el-button size="large" type="primary" native-type="submit" :loading="loading">
                {{ selectedId ? 'Save version' : 'Create version' }}
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
          eyebrow="Version library"
          title="Browse and select content versions"
        >
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div class="workspace-table workspace-table--scroll">
            <el-table
              :data="versions"
              row-key="contentVersionId"
              stripe
              highlight-current-row
              :current-row-key="selectedId"
              v-loading="loading"
              @row-click="selectContentVersion"
            >
              <el-table-column prop="contentVersionId" label="Version ID" min-width="180" />
              <el-table-column label="Content Item" min-width="220">
                <template #default="{ row }">
                  {{ getContentItemLabel(row) }}
                </template>
              </el-table-column>
              <el-table-column prop="locale" label="Locale" min-width="100" />
              <el-table-column prop="versionNumber" label="Version" min-width="100" />
              <el-table-column label="Translation" min-width="150">
                <template #default="{ row }">
                  <el-tag :type="resolveTranslationTone(row.translationStatus)" effect="plain">
                    {{ row.translationStatus || 'missing' }}
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
            v-if="versions.length"
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
          eyebrow="Selected version"
          :title="selected?.contentVersionId || 'Choose a content version from the list'"
        >
          <template #aside>
            <StatusBadge v-if="selected" :value="resolveStatus(selected)" />
          </template>
          <div v-if="selected" class="workspace-summary">
            <div class="workspace-summary__row">
              <span>Content item</span>
              <strong>{{ getContentItemLabel(selected) }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Locale</span>
              <strong>{{ selected.locale || '-' }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Translation status</span>
              <strong>{{ selected.translationStatus || 'missing' }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Version number</span>
              <strong>{{ selected.versionNumber || '-' }}</strong>
            </div>
          </div>

          <p v-else class="workspace-empty">
            Select a content version to review the linked content item, locale, and workflow state.
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
