<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppSearchField from '@/components/common/AppSearchField.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import EntityRelationshipSelect from '@/components/forms/EntityRelationshipSelect.vue'
import SmartFormGrid from '@/components/forms/SmartFormGrid.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useCmsPagesStore } from '@/stores/useCmsPagesStore'
import { useLayoutsStore } from '@/stores/useLayoutsStore'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { replaceValidationState, validateRequiredFields } from '@/utils/formValidation'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pagesStore = useCmsPagesStore()
const layoutsStore = useLayoutsStore()
const { entities: pages, loading, error, pagination } = storeToRefs(pagesStore)
const { entities: layouts } = storeToRefs(layoutsStore)

const selectedId = ref('')
const searchQuery = ref('')
const feedback = ref('')
const pager = reactive({ page: 1, limit: 20 })
const metaSnapshot = ref({})
const validationErrors = reactive({})

const form = reactive({
  name: '',
  slug: '/',
  layoutId: '',
  visibility: 'public',
  isHomePage: false,
  metaTitleEn: '',
  metaTitleSw: '',
  metaDescriptionEn: '',
  metaDescriptionSw: '',
  heroEyebrow: '',
  heroSummary: '',
})

const selected = computed(() => pages.value.find((item) => item.pageId === selectedId.value))

const filteredPages = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  if (!term) return pages.value

  return pages.value.filter((item) =>
    [
      item?.name,
      item?.slug,
      item?.visibility,
      item?.meta?.title?.en,
      item?.meta?.title?.sw,
      item?.meta?.description?.en,
      item?.meta?.description?.sw,
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

const stats = computed(() => [
  { key: 'total', label: 'Pages', value: pages.value.length },
  {
    key: 'published',
    label: 'Published',
    value: pages.value.filter((item) => item?.effectiveStatus === 'published').length,
  },
  {
    key: 'home',
    label: 'Home Pages',
    value: pages.value.filter((item) => item?.isHomePage).length,
  },
  {
    key: 'private',
    label: 'Private Pages',
    value: pages.value.filter((item) => item?.visibility === 'private').length,
  },
])

const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh workspace' },
  { key: 'create', label: 'New page' },
])

function resolveLayoutLabel(item = {}) {
  return item?.name || item?.description || item?.slug || item?.layoutId || 'Untitled layout'
}

function findLayoutId(item = {}) {
  return item?.layoutId || item?.layout?._id || item?.layout?.layoutId || ''
}

async function loadLayoutOptions() {
  if (!layouts.value.length) {
    await layoutsStore.list({ page: 1, limit: 200 })
  }

  return layouts.value.map((item) => ({
    value: item?.layoutId,
    label: resolveLayoutLabel(item),
  }))
}

function getLayoutLabel(value) {
  const layout = layouts.value.find((item) => item?.layoutId === value)
  return layout ? resolveLayoutLabel(layout) : value || '-'
}

const layoutField = {
  placeholder: 'Select layout',
  loadOptions: loadLayoutOptions,
}

const identityFields = computed(() => [
  {
    key: 'name',
    label: 'Page Name',
    placeholder: 'About FCC',
    required: true,
  },
  {
    key: 'slug',
    label: 'Page URL',
    placeholder: '/about',
    required: true,
  },
  {
    key: 'layoutId',
    label: 'Layout',
    component: 'entity-select',
    ...layoutField,
  },
  {
    key: 'visibility',
    label: 'Visibility',
    component: 'select',
    options: visibilityOptions,
  },
])

const seoFields = Object.freeze([
  {
    key: 'metaTitleEn',
    label: 'SEO Title (English)',
    placeholder: 'Page title shown to search engines',
  },
  {
    key: 'metaTitleSw',
    label: 'SEO Title (Swahili)',
    placeholder: 'Kichwa cha ukurasa kwa injini za utafutaji',
  },
  {
    key: 'metaDescriptionEn',
    label: 'SEO Description (English)',
    component: 'textarea',
    rows: 4,
    placeholder: 'Short description for sharing and search results',
  },
  {
    key: 'metaDescriptionSw',
    label: 'SEO Description (Swahili)',
    component: 'textarea',
    rows: 4,
    placeholder: 'Maelezo mafupi kwa mitandao na utafutaji',
  },
])

const heroFields = Object.freeze([
  {
    key: 'heroEyebrow',
    label: 'Hero Eyebrow',
    placeholder: 'For example: Our mandate',
  },
  {
    key: 'heroSummary',
    label: 'Hero Summary',
    component: 'textarea',
    rows: 4,
    placeholder: 'Short introductory message for this page',
  },
])

function loadForm(item = null) {
  replaceValidationState(validationErrors)
  metaSnapshot.value = item?.meta || {}
  form.name = item?.name || ''
  form.slug = item?.slug || '/'
  form.layoutId = findLayoutId(item)
  form.visibility = item?.visibility || 'public'
  form.isHomePage = Boolean(item?.isHomePage)
  form.metaTitleEn = item?.meta?.title?.en || ''
  form.metaTitleSw = item?.meta?.title?.sw || ''
  form.metaDescriptionEn = item?.meta?.description?.en || ''
  form.metaDescriptionSw = item?.meta?.description?.sw || ''
  form.heroEyebrow = item?.meta?.heroEyebrow || ''
  form.heroSummary = item?.meta?.heroSummary || ''
}

function clearForm() {
  selectedId.value = ''
  feedback.value = ''
  loadForm(null)
}

function selectPage(item) {
  selectedId.value = item.pageId
  loadForm(item)
}

async function refresh() {
  await Promise.all([
    pagesStore.list({ page: pager.page, limit: pager.limit }),
    layoutsStore.list({ page: 1, limit: 200 }),
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

function validateForm() {
  const { errors, isValid } = validateRequiredFields([
    {
      key: 'name',
      label: 'Page Name',
      value: () => form.name.trim(),
    },
    {
      key: 'slug',
      label: 'Page URL',
      value: () => form.slug.trim(),
    },
  ])

  replaceValidationState(validationErrors, errors)
  return isValid
}

async function save() {
  feedback.value = ''
  if (!validateForm()) return

  const payload = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    layoutId: String(form.layoutId || '').trim(),
    visibility: form.visibility,
    isHomePage: form.isHomePage,
    meta: {
      ...metaSnapshot.value,
      title: {
        ...(metaSnapshot.value?.title || {}),
        en: form.metaTitleEn.trim(),
        sw: form.metaTitleSw.trim(),
      },
      description: {
        ...(metaSnapshot.value?.description || {}),
        en: form.metaDescriptionEn.trim(),
        sw: form.metaDescriptionSw.trim(),
      },
      heroEyebrow: form.heroEyebrow.trim(),
      heroSummary: form.heroSummary.trim(),
    },
  }

  if (selectedId.value) {
    await pagesStore.update(selectedId.value, payload)
    feedback.value = 'Page updated.'
  } else {
    await pagesStore.create(payload, false)
    feedback.value = 'Page created.'
  }

  await refresh()
  clearForm()
}

async function runWorkflow(action) {
  if (!selectedId.value) return
  const id = selectedId.value

  if (action === 'submit') await pagesStore.submit(id)
  if (action === 'approve') await pagesStore.approve(id)
  if (action === 'reject') await pagesStore.reject(id, 'Rejected from page workspace')
  if (action === 'publish') await pagesStore.publish(id)
  if (action === 'unpublish') await pagesStore.unpublish(id)
  if (action === 'archive') await pagesStore.archive(id, 'Archived from page workspace')
  if (action === 'restore') await pagesStore.restore(id)
  if (action === 'restoreArchived') await pagesStore.restoreArchived(id)
  if (action === 'softDelete') await pagesStore.softDelete(id, 'Removed from page workspace')
  if (action === 'delete') await pagesStore.remove(id)

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
        title="Website Pages"
        description="Shape page identity, layout, and public-facing copy in a language PR officers can understand."
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
          eyebrow="Page editor"
          :title="selectedId ? 'Update this page' : 'Create a new page'"
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
                  <EntityRelationshipSelect
                    v-if="field.component === 'entity-select'"
                    v-model="form[field.key]"
                    :field="field"
                    :model="form"
                  />

                  <el-select v-else-if="field.component === 'select'" v-model="form[field.key]">
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

            <el-form-item class="workspace-form__checkbox">
              <el-checkbox v-model="form.isHomePage"
                >Use this as a homepage entry point</el-checkbox
              >
            </el-form-item>

            <SmartFormGrid :fields="seoFields" :columns="2">
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

            <SmartFormGrid :fields="heroFields" :columns="2">
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
                {{ selectedId ? 'Save page changes' : 'Create page' }}
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

        <WorkspacePanel tag="article" eyebrow="Page library" title="Find and select pages">
          <template #aside>
            <AppSearchField
              v-model="searchQuery"
              label="Search pages"
              placeholder="Search by page name, URL, SEO text, or visibility"
              class="workspace-search"
            />
          </template>

          <div class="workspace-table">
            <el-table :data="filteredPages" v-loading="loading" stripe>
              <el-table-column label="Page" min-width="220">
                <template #default="{ row }">
                  <el-button link class="workspace-link" @click="selectPage(row)">
                    {{ row.name }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column label="URL" min-width="180" prop="slug" />
              <el-table-column label="Layout" min-width="180">
                <template #default="{ row }">
                  {{ getLayoutLabel(findLayoutId(row)) }}
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
            v-if="pages.length"
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
          eyebrow="Selected page"
          :title="selected?.name || 'Choose a page from the library'"
        >
          <template #aside>
            <StatusBadge
              v-if="selected"
              :value="selected.effectiveStatus || selected.publicationStatus"
            />
          </template>

          <div v-if="selected" class="workspace-summary">
            <div class="workspace-summary__row">
              <span>Public URL</span>
              <strong>{{ selected.slug }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Layout</span>
              <strong>{{ getLayoutLabel(findLayoutId(selected)) }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Homepage</span>
              <strong>{{ selected.isHomePage ? 'Yes' : 'No' }}</strong>
            </div>
            <div class="workspace-summary__row">
              <span>Last updated</span>
              <strong>{{ formatDisplayDate(selected.updatedAt || selected.createdAt) }}</strong>
            </div>
          </div>

          <p v-else class="workspace-empty">
            Select a page to review its current status and workflow options.
          </p>
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          eyebrow="Workflow"
          title="Submit, publish, archive, or restore"
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
