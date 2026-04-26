<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppSearchField from '@/components/common/AppSearchField.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import AppTagInputField from '@/components/forms/AppTagInputField.vue'
import SmartFormGrid from '@/components/forms/SmartFormGrid.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useContentItemsStore } from '@/stores/useContentItemsStore'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { replaceValidationState, validateRequiredFields } from '@/utils/formValidation'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const itemsStore = useContentItemsStore()
const { entities: items, loading, error, pagination } = storeToRefs(itemsStore)

const selectedId = ref('')
const feedback = ref('')
const searchQuery = ref('')
const pager = reactive({ page: 1, limit: 20 })
const metadataSnapshot = ref({})
const validationErrors = reactive({})

const form = reactive({
  key: '',
  type: '',
  slug: '',
  visibility: 'public',
  tags: [],
  titleEn: '',
  titleSw: '',
  summaryEn: '',
  summarySw: '',
  ctaLabel: '',
  ctaHref: '',
  editorNote: '',
})

const selected = computed(() => items.value.find((item) => item.contentItemId === selectedId.value))

const filteredItems = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  if (!term) return items.value

  return items.value.filter((item) =>
    [
      item?.key,
      item?.type,
      item?.slug,
      item?.visibility,
      item?.metadata?.title?.en,
      item?.metadata?.title?.sw,
      item?.metadata?.summary?.en,
      item?.metadata?.summary?.sw,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(term),
  )
})

const visibilityOptions = Object.freeze([
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
  { label: 'Authenticated only', value: 'auth-only' },
])

const identityFields = Object.freeze([
  {
    key: 'key',
    label: 'Reference Key',
    placeholder: 'homepage.hero.primary',
    required: true,
  },
  {
    key: 'type',
    label: 'Content Type',
    placeholder: 'hero, banner, callout, caption',
    required: true,
  },
  {
    key: 'slug',
    label: 'Optional Slug',
    placeholder: '/about/mission',
  },
  {
    key: 'visibility',
    label: 'Visibility',
    component: 'select',
    options: visibilityOptions,
  },
])

const metadataFields = Object.freeze([
  {
    key: 'titleEn',
    label: 'Title (English)',
    placeholder: 'Headline used on the website',
  },
  {
    key: 'titleSw',
    label: 'Title (Swahili)',
    placeholder: 'Kichwa cha maudhui',
  },
  {
    key: 'summaryEn',
    label: 'Summary (English)',
    component: 'textarea',
    rows: 4,
    placeholder: 'Short summary for editors and website visitors',
  },
  {
    key: 'summarySw',
    label: 'Summary (Swahili)',
    component: 'textarea',
    rows: 4,
    placeholder: 'Muhtasari mfupi wa maudhui',
  },
])

const actionFields = Object.freeze([
  {
    key: 'ctaLabel',
    label: 'Call to Action Label',
    placeholder: 'Read more, Download, Contact us',
  },
  {
    key: 'ctaHref',
    label: 'Call to Action Link',
    placeholder: '/publications or https://...',
  },
  {
    key: 'editorNote',
    label: 'Editorial Note',
    component: 'textarea',
    rows: 4,
    placeholder: 'Anything your PR team should remember about where this content is used',
  },
])

const stats = computed(() => [
  { key: 'total', label: 'Content Items', value: items.value.length },
  {
    key: 'published',
    label: 'Published',
    value: items.value.filter((item) => item?.effectiveStatus === 'published').length,
  },
  {
    key: 'review',
    label: 'Under Review',
    value: items.value.filter((item) => item?.effectiveStatus === 'submitted').length,
  },
  {
    key: 'private',
    label: 'Private Items',
    value: items.value.filter((item) => item?.visibility === 'private').length,
  },
])

const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh workspace' },
  { key: 'create', label: 'New content item' },
])

function loadForm(item = null) {
  replaceValidationState(validationErrors)
  metadataSnapshot.value = item?.metadata || {}
  form.key = item?.key || ''
  form.type = item?.type || ''
  form.slug = item?.slug || ''
  form.visibility = item?.visibility || 'public'
  form.tags = Array.isArray(item?.tags) ? item.tags : []
  form.titleEn = item?.metadata?.title?.en || ''
  form.titleSw = item?.metadata?.title?.sw || ''
  form.summaryEn = item?.metadata?.summary?.en || ''
  form.summarySw = item?.metadata?.summary?.sw || ''
  form.ctaLabel = item?.metadata?.cta?.label || ''
  form.ctaHref = item?.metadata?.cta?.href || ''
  form.editorNote = item?.metadata?.note || ''
}

function clearForm() {
  selectedId.value = ''
  feedback.value = ''
  loadForm(null)
}

function selectContentItem(item) {
  selectedId.value = item.contentItemId
  loadForm(item)
}

async function refresh() {
  await itemsStore.list({ page: pager.page, limit: pager.limit })
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

function validateForm() {
  const { errors, isValid } = validateRequiredFields([
    {
      key: 'key',
      label: 'Reference Key',
      value: () => form.key.trim(),
    },
    {
      key: 'type',
      label: 'Content Type',
      value: () => form.type.trim(),
    },
  ])

  replaceValidationState(validationErrors, errors)
  return isValid
}

async function save() {
  feedback.value = ''
  if (!validateForm()) return

  const payload = {
    key: form.key.trim(),
    type: form.type.trim(),
    slug: form.slug.trim() || null,
    visibility: form.visibility,
    tags: Array.isArray(form.tags) ? form.tags.filter(Boolean) : [],
    metadata: {
      ...metadataSnapshot.value,
      title: {
        ...(metadataSnapshot.value?.title || {}),
        en: form.titleEn.trim(),
        sw: form.titleSw.trim(),
      },
      summary: {
        ...(metadataSnapshot.value?.summary || {}),
        en: form.summaryEn.trim(),
        sw: form.summarySw.trim(),
      },
      cta: {
        ...(metadataSnapshot.value?.cta || {}),
        label: form.ctaLabel.trim(),
        href: form.ctaHref.trim(),
      },
      note: form.editorNote.trim(),
    },
  }

  if (selectedId.value) {
    await itemsStore.update(selectedId.value, payload)
    feedback.value = 'Content item updated.'
  } else {
    await itemsStore.create(payload, false)
    feedback.value = 'Content item created.'
  }

  await refresh()
  clearForm()
}

async function runWorkflow(action) {
  if (!selectedId.value) return
  const id = selectedId.value

  if (action === 'submit') await itemsStore.submit(id)
  if (action === 'approve') await itemsStore.approve(id)
  if (action === 'reject') await itemsStore.reject(id, 'Rejected from content workspace')
  if (action === 'publish') await itemsStore.publish(id)
  if (action === 'unpublish') await itemsStore.unpublish(id)
  if (action === 'archive') await itemsStore.archive(id, 'Archived from content workspace')
  if (action === 'restore') await itemsStore.restore(id)
  if (action === 'restoreArchived') await itemsStore.restoreArchived(id)
  if (action === 'softDelete') await itemsStore.softDelete(id, 'Removed from content workspace')
  if (action === 'delete') await itemsStore.remove(id)

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
        title="Content Items"
        description="Manage reusable website copy in a structured editorial form instead of editing metadata by hand."
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
          eyebrow="Editorial form"
          :title="selectedId ? 'Refine this content item' : 'Create a new content item'"
        >
          <el-form label-position="top" class="workspace-form" @submit.prevent="save">
            <SmartFormGrid :fields="identityFields" :columns="2">
              <template #default="{ field }">
                <el-form-item
                  :label="field.label"
                  :required="field.required"
                  :error="validationErrors[field.key]"
                  class="form-item-flush"
                >
                  <el-select v-if="field.component === 'select'" v-model="form[field.key]">
                    <el-option
                      v-for="option in field.options || []"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>

                  <el-input v-else v-model="form[field.key]" :placeholder="field.placeholder" />
                </el-form-item>
              </template>
            </SmartFormGrid>

            <el-form-item label="Tags">
              <AppTagInputField
                v-model="form.tags"
                placeholder="Add content tags and press Enter"
              />
            </el-form-item>

            <SmartFormGrid :fields="metadataFields" :columns="2">
              <template #default="{ field }">
                <el-form-item :label="field.label" class="form-item-flush">
                  <el-input
                    v-if="field.component === 'textarea'"
                    v-model="form[field.key]"
                    type="textarea"
                    :rows="field.rows || 4"
                    :placeholder="field.placeholder"
                  />

                  <el-input v-else v-model="form[field.key]" :placeholder="field.placeholder" />
                </el-form-item>
              </template>
            </SmartFormGrid>

            <SmartFormGrid :fields="actionFields" :columns="2">
              <template #default="{ field }">
                <el-form-item :label="field.label" class="form-item-flush">
                  <el-input
                    v-if="field.component === 'textarea'"
                    v-model="form[field.key]"
                    type="textarea"
                    :rows="field.rows || 4"
                    :placeholder="field.placeholder"
                  />

                  <el-input v-else v-model="form[field.key]" :placeholder="field.placeholder" />
                </el-form-item>
              </template>
            </SmartFormGrid>

            <div class="workspace-form__actions">
              <el-button @click="clearForm">Clear</el-button>
              <el-button type="primary" :loading="loading" native-type="submit">
                {{ selectedId ? 'Save changes' : 'Create content item' }}
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
          eyebrow="Content library"
          title="Browse and select content items"
        >
          <template #aside>
            <AppSearchField
              v-model="searchQuery"
              label="Search content items"
              placeholder="Search by key, type, title, summary, or visibility"
              class="workspace-search"
            />
          </template>

          <div class="workspace-table">
            <el-table :data="filteredItems" v-loading="loading" stripe>
              <el-table-column label="Key" min-width="220">
                <template #default="{ row }">
                  <el-button link class="workspace-link" @click="selectContentItem(row)">
                    {{ row.key }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column label="Type" min-width="140" prop="type" />
              <el-table-column label="Title" min-width="220">
                <template #default="{ row }">
                  {{ row?.metadata?.title?.en || row?.metadata?.title?.sw || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="Visibility" min-width="120" prop="visibility" />
              <el-table-column label="Status" min-width="130">
                <template #default="{ row }">
                  <StatusBadge :value="row.effectiveStatus || row.publicationStatus" />
                </template>
              </el-table-column>
              <el-table-column label="Updated" min-width="170">
                <template #default="{ row }">
                  {{ formatDisplayDate(row.updatedAt || row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <TablePagination
            v-if="items.length"
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
          eyebrow="Selected item"
          :title="selected?.key || 'Choose an item from the library'"
        >
          <template #aside>
            <StatusBadge
              v-if="selected"
              :value="selected.effectiveStatus || selected.publicationStatus"
            />
          </template>

          <div v-if="selected" class="workspace-summary">
            <div class="workspace-summary__row">
              <span>Public title</span>
              <strong>{{
                selected?.metadata?.title?.en || selected?.metadata?.title?.sw || '-'
              }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Visibility</span>
              <strong>{{ selected.visibility || 'public' }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Tags</span>
              <strong>{{
                Array.isArray(selected.tags) && selected.tags.length
                  ? selected.tags.join(', ')
                  : 'No tags yet'
              }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Last updated</span>
              <strong>{{ formatDisplayDate(selected.updatedAt || selected.createdAt) }}</strong>
            </div>
          </div>

          <p v-else class="workspace-empty">
            Select a content item to see its editorial summary and workflow controls.
          </p>
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          eyebrow="Workflow"
          title="Review, publish, archive, or restore"
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
