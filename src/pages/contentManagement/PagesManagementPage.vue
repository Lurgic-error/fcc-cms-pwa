<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppSearchField from '@/components/common/AppSearchField.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EntityRelationshipSelect from '@/components/forms/EntityRelationshipSelect.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useCmsPagesStore } from '@/stores/useCmsPagesStore'
import { useLayoutsStore } from '@/stores/useLayoutsStore'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

const pagesStore = useCmsPagesStore()
const layoutsStore = useLayoutsStore()
const { entities: pages, loading, error, pagination } = storeToRefs(pagesStore)
const { entities: layouts } = storeToRefs(layoutsStore)

const selectedId = ref('')
const searchQuery = ref('')
const feedback = ref('')
const pager = reactive({ page: 1, limit: 20 })
const metaSnapshot = ref({})

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

function loadForm(item = null) {
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

async function save() {
  feedback.value = ''

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

onMounted(refresh)
</script>

<template>
  <PageWrapper
    title="Website Pages"
    description="Shape page identity, layout, and public-facing copy in a language PR officers can understand."
  >
    <div class="workspace-shell">
      <OverviewStatsGrid :stats="stats" />

      <section class="workspace-grid">
        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Page editor</p>
              <h2>{{ selectedId ? 'Update this page' : 'Create a new page' }}</h2>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button plain @click="refresh">Refresh</el-button>
              <el-button type="primary" plain @click="clearForm">New page</el-button>
            </div>
          </header>

          <el-form label-position="top" class="workspace-form" @submit.prevent="save">
            <div class="workspace-form__grid">
              <el-form-item label="Page Name" required>
                <el-input v-model="form.name" placeholder="About FCC" />
              </el-form-item>

              <el-form-item label="Page URL" required>
                <el-input v-model="form.slug" placeholder="/about" />
              </el-form-item>

              <el-form-item label="Layout">
                <EntityRelationshipSelect
                  v-model="form.layoutId"
                  :field="layoutField"
                  :model="form"
                />
              </el-form-item>

              <el-form-item label="Visibility">
                <el-select v-model="form.visibility">
                  <el-option label="Public" value="public" />
                  <el-option label="Private" value="private" />
                  <el-option label="Authenticated only" value="auth-only" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item>
              <el-checkbox v-model="form.isHomePage"
                >Use this as a homepage entry point</el-checkbox
              >
            </el-form-item>

            <div class="workspace-form__grid">
              <el-form-item label="SEO Title (English)">
                <el-input
                  v-model="form.metaTitleEn"
                  placeholder="Page title shown to search engines"
                />
              </el-form-item>

              <el-form-item label="SEO Title (Swahili)">
                <el-input
                  v-model="form.metaTitleSw"
                  placeholder="Kichwa cha ukurasa kwa injini za utafutaji"
                />
              </el-form-item>

              <el-form-item label="SEO Description (English)">
                <el-input
                  v-model="form.metaDescriptionEn"
                  type="textarea"
                  :rows="4"
                  placeholder="Short description for sharing and search results"
                />
              </el-form-item>

              <el-form-item label="SEO Description (Swahili)">
                <el-input
                  v-model="form.metaDescriptionSw"
                  type="textarea"
                  :rows="4"
                  placeholder="Maelezo mafupi kwa mitandao na utafutaji"
                />
              </el-form-item>
            </div>

            <div class="workspace-form__grid">
              <el-form-item label="Hero Eyebrow">
                <el-input v-model="form.heroEyebrow" placeholder="For example: Our mandate" />
              </el-form-item>

              <el-form-item label="Hero Summary">
                <el-input
                  v-model="form.heroSummary"
                  type="textarea"
                  :rows="4"
                  placeholder="Short introductory message for this page"
                />
              </el-form-item>
            </div>

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
        </article>

        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Page library</p>
              <h2>Find and select pages</h2>
            </div>
            <AppSearchField
              v-model="searchQuery"
              label="Search pages"
              placeholder="Search by page name, URL, SEO text, or visibility"
              class="workspace-search"
            />
          </header>

          <div class="workspace-table">
            <el-table :data="filteredPages" v-loading="loading" stripe>
              <el-table-column label="Page" min-width="220">
                <template #default="{ row }">
                  <button type="button" class="workspace-link" @click="selectPage(row)">
                    {{ row.name }}
                  </button>
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
        </article>
      </section>

      <section class="workspace-grid workspace-grid--bottom">
        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Selected page</p>
              <h2>{{ selected?.name || 'Choose a page from the library' }}</h2>
            </div>
            <StatusBadge
              v-if="selected"
              :value="selected.effectiveStatus || selected.publicationStatus"
            />
          </header>

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
        </article>

        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Workflow</p>
              <h2>Submit, publish, archive, or restore</h2>
            </div>
          </header>

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
        </article>
      </section>
    </div>
  </PageWrapper>
</template>

<style scoped>
.workspace-shell,
.workspace-form,
.workspace-summary {
  display: grid;
  gap: 1rem;
}

.workspace-grid {
  display: grid;
  gap: 1rem;
}

.workspace-panel {
  padding: 1.2rem;
}

.workspace-panel__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.workspace-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fcc-secondary-700);
}

.workspace-form__grid {
  display: grid;
  gap: 1rem;
}

.workspace-form__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.workspace-search {
  width: min(100%, 24rem);
}

.workspace-table {
  min-height: 24rem;
}

.workspace-link {
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  color: var(--fcc-primary-800);
  font-weight: 700;
  cursor: pointer;
}

.workspace-summary__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--fcc-border);
}

.workspace-summary__row span {
  color: var(--fcc-text-muted);
}

.workspace-summary__row strong {
  text-align: right;
  color: var(--fcc-text);
}

.workspace-empty {
  color: var(--fcc-text-muted);
}

@media (min-width: 1024px) {
  .workspace-grid {
    grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
  }

  .workspace-grid--bottom {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }

  .workspace-form__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
