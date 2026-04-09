<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppSearchField from '@/components/common/AppSearchField.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppTagInputField from '@/components/forms/AppTagInputField.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useContentItemsStore } from '@/stores/useContentItemsStore'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

const itemsStore = useContentItemsStore()
const { entities: items, loading, error, pagination } = storeToRefs(itemsStore)

const selectedId = ref('')
const feedback = ref('')
const searchQuery = ref('')
const pager = reactive({ page: 1, limit: 20 })
const metadataSnapshot = ref({})

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

function loadForm(item = null) {
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

async function save() {
  feedback.value = ''

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

onMounted(refresh)
</script>

<template>
  <PageWrapper
    title="Content Items"
    description="Manage reusable website copy in a structured editorial form instead of editing metadata by hand."
  >
    <div class="workspace-shell">
      <OverviewStatsGrid :stats="stats" />

      <section class="workspace-grid">
        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Editorial form</p>
              <h2>{{ selectedId ? 'Refine this content item' : 'Create a new content item' }}</h2>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button plain @click="refresh">Refresh</el-button>
              <el-button type="primary" plain @click="clearForm">New item</el-button>
            </div>
          </header>

          <el-form label-position="top" class="workspace-form" @submit.prevent="save">
            <div class="workspace-form__grid">
              <el-form-item label="Reference Key" required>
                <el-input v-model="form.key" placeholder="homepage.hero.primary" />
              </el-form-item>

              <el-form-item label="Content Type" required>
                <el-input v-model="form.type" placeholder="hero, banner, callout, caption" />
              </el-form-item>

              <el-form-item label="Optional Slug">
                <el-input v-model="form.slug" placeholder="/about/mission" />
              </el-form-item>

              <el-form-item label="Visibility">
                <el-select v-model="form.visibility">
                  <el-option label="Public" value="public" />
                  <el-option label="Private" value="private" />
                  <el-option label="Authenticated only" value="auth-only" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="Tags">
              <AppTagInputField
                v-model="form.tags"
                placeholder="Add content tags and press Enter"
              />
            </el-form-item>

            <div class="workspace-form__grid">
              <el-form-item label="Title (English)">
                <el-input v-model="form.titleEn" placeholder="Headline used on the website" />
              </el-form-item>

              <el-form-item label="Title (Swahili)">
                <el-input v-model="form.titleSw" placeholder="Kichwa cha maudhui" />
              </el-form-item>

              <el-form-item label="Summary (English)">
                <el-input
                  v-model="form.summaryEn"
                  type="textarea"
                  :rows="4"
                  placeholder="Short summary for editors and website visitors"
                />
              </el-form-item>

              <el-form-item label="Summary (Swahili)">
                <el-input
                  v-model="form.summarySw"
                  type="textarea"
                  :rows="4"
                  placeholder="Muhtasari mfupi wa maudhui"
                />
              </el-form-item>
            </div>

            <div class="workspace-form__grid">
              <el-form-item label="Call to Action Label">
                <el-input v-model="form.ctaLabel" placeholder="Read more, Download, Contact us" />
              </el-form-item>

              <el-form-item label="Call to Action Link">
                <el-input v-model="form.ctaHref" placeholder="/publications or https://..." />
              </el-form-item>
            </div>

            <el-form-item label="Editorial Note">
              <el-input
                v-model="form.editorNote"
                type="textarea"
                :rows="4"
                placeholder="Anything your PR team should remember about where this content is used"
              />
            </el-form-item>

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
        </article>

        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Content library</p>
              <h2>Browse and select content items</h2>
            </div>
            <AppSearchField
              v-model="searchQuery"
              label="Search content items"
              placeholder="Search by key, type, title, summary, or visibility"
              class="workspace-search"
            />
          </header>

          <div class="workspace-table">
            <el-table :data="filteredItems" v-loading="loading" stripe>
              <el-table-column label="Key" min-width="220">
                <template #default="{ row }">
                  <button type="button" class="workspace-link" @click="selectContentItem(row)">
                    {{ row.key }}
                  </button>
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
        </article>
      </section>

      <section class="workspace-grid workspace-grid--bottom">
        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Selected item</p>
              <h2>{{ selected?.key || 'Choose an item from the library' }}</h2>
            </div>
            <StatusBadge
              v-if="selected"
              :value="selected.effectiveStatus || selected.publicationStatus"
            />
          </header>

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
        </article>

        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Workflow</p>
              <h2>Review, publish, archive, or restore</h2>
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
