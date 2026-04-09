<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppSearchField from '@/components/common/AppSearchField.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppTagInputField from '@/components/forms/AppTagInputField.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import EntityWorkflowButtons from '@/components/workflow/EntityWorkflowButtons.vue'
import { useLocalesStore } from '@/stores/useLocalesStore'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'

const localesStore = useLocalesStore()
const {
  entities: locales,
  loading,
  error,
  pagination,
  activeLocales,
  fallbackChain,
  fallbackRequestedLocale,
} = storeToRefs(localesStore)

const selectedLocaleId = ref('')
const feedback = ref('')
const searchQuery = ref('')
const fallbackInput = ref('')
const pager = reactive({ page: 1, limit: 20 })

const form = reactive({
  code: '',
  name: '',
  nativeName: '',
  direction: 'ltr',
  isDefault: false,
  isActive: true,
  fallbackLocales: [],
})

const selectedLocale = computed(() =>
  locales.value.find((item) => item.localeId === selectedLocaleId.value),
)

const filteredLocales = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  if (!term) return locales.value

  return locales.value.filter((item) =>
    [item?.code, item?.name, item?.nativeName, item?.direction]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(term),
  )
})

const stats = computed(() => [
  { key: 'total', label: 'Locales', value: locales.value.length },
  { key: 'active', label: 'Active Locales', value: activeLocales.value.length },
  {
    key: 'default',
    label: 'Default Locale',
    value: activeLocales.value.find((item) => item?.isDefault)?.code || '-',
  },
  {
    key: 'review',
    label: 'Under Review',
    value: locales.value.filter((item) => item?.effectiveStatus === 'submitted').length,
  },
])

function loadForm(item = null) {
  form.code = item?.code || ''
  form.name = item?.name || ''
  form.nativeName = item?.nativeName || ''
  form.direction = item?.direction || 'ltr'
  form.isDefault = Boolean(item?.isDefault)
  form.isActive = item?.isActive !== false
  form.fallbackLocales = Array.isArray(item?.fallbackLocales) ? item.fallbackLocales : []
}

function clearForm() {
  selectedLocaleId.value = ''
  feedback.value = ''
  loadForm(null)
}

function selectLocale(item) {
  selectedLocaleId.value = item.localeId
  loadForm(item)
}

async function refresh() {
  await Promise.all([
    localesStore.list({ page: pager.page, limit: pager.limit }),
    localesStore.listActive(),
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

async function onSubmit() {
  feedback.value = ''
  const payload = {
    code: form.code.trim().toLowerCase(),
    name: form.name.trim(),
    nativeName: form.nativeName.trim() || null,
    direction: form.direction,
    isDefault: form.isDefault,
    isActive: form.isActive,
    fallbackLocales: Array.isArray(form.fallbackLocales)
      ? form.fallbackLocales
          .map((item) =>
            String(item || '')
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean)
      : [],
  }

  if (selectedLocaleId.value) {
    await localesStore.update(selectedLocaleId.value, payload)
    feedback.value = 'Locale updated.'
  } else {
    await localesStore.create(payload, false)
    feedback.value = 'Locale created.'
  }

  await refresh()
  clearForm()
}

async function runWorkflow(action) {
  if (!selectedLocaleId.value) return
  const id = selectedLocaleId.value

  if (action === 'submit') await localesStore.submit(id)
  if (action === 'approve') await localesStore.approve(id)
  if (action === 'reject') await localesStore.reject(id, 'Rejected from locale workspace')
  if (action === 'publish') await localesStore.publish(id)
  if (action === 'unpublish') await localesStore.unpublish(id)
  if (action === 'archive') await localesStore.archive(id, 'Archived from locale workspace')
  if (action === 'restore') await localesStore.restore(id)
  if (action === 'restoreArchived') await localesStore.restoreArchived(id)
  if (action === 'softDelete') await localesStore.softDelete(id, 'Removed from locale workspace')
  if (action === 'delete') await localesStore.remove(id)

  await refresh()
}

async function makeDefault() {
  if (!selectedLocaleId.value) return
  await localesStore.setDefault(selectedLocaleId.value)
  feedback.value = 'Default locale updated.'
  await refresh()
}

async function toggleActive() {
  if (!selectedLocale.value) return
  await localesStore.setActive(selectedLocale.value.localeId, !selectedLocale.value.isActive)
  feedback.value = selectedLocale.value.isActive ? 'Locale disabled.' : 'Locale enabled.'
  await refresh()
}

async function resolveFallbacks() {
  await localesStore.resolveFallbackChain(fallbackInput.value.trim())
}

onMounted(refresh)
</script>

<template>
  <PageWrapper
    title="Locales"
    description="Manage language options, fallback behavior, and publishing readiness in a translation-friendly workspace."
  >
    <div class="workspace-shell">
      <OverviewStatsGrid :stats="stats" />

      <section class="workspace-grid">
        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Language setup</p>
              <h2>{{ selectedLocaleId ? 'Update locale settings' : 'Create a new locale' }}</h2>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-button plain @click="refresh">Refresh</el-button>
              <el-button type="primary" plain @click="clearForm">New locale</el-button>
            </div>
          </header>

          <el-form label-position="top" class="workspace-form" @submit.prevent="onSubmit">
            <div class="workspace-form__grid">
              <el-form-item label="Locale Code" required>
                <el-input v-model="form.code" placeholder="en, sw, fr" />
              </el-form-item>

              <el-form-item label="Display Name" required>
                <el-input v-model="form.name" placeholder="English, Kiswahili, French" />
              </el-form-item>

              <el-form-item label="Native Name">
                <el-input v-model="form.nativeName" placeholder="Kiswahili, Francais" />
              </el-form-item>

              <el-form-item label="Reading Direction">
                <el-select v-model="form.direction">
                  <el-option label="Left to right" value="ltr" />
                  <el-option label="Right to left" value="rtl" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="Fallback Locales">
              <AppTagInputField
                v-model="form.fallbackLocales"
                placeholder="Add fallback locale codes and press Enter"
              />
            </el-form-item>

            <div class="workspace-toggle-row">
              <el-checkbox v-model="form.isDefault">Use as default locale</el-checkbox>
              <el-checkbox v-model="form.isActive">Locale is active</el-checkbox>
            </div>

            <div class="workspace-form__actions">
              <el-button @click="clearForm">Clear</el-button>
              <el-button type="primary" :loading="loading" native-type="submit">
                {{ selectedLocaleId ? 'Save locale changes' : 'Create locale' }}
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
              <p class="workspace-eyebrow">Translation workspace</p>
              <h2>Browse available locales</h2>
            </div>
            <AppSearchField
              v-model="searchQuery"
              label="Search locales"
              placeholder="Search by locale code, display name, native name, or direction"
              class="workspace-search"
            />
          </header>

          <div class="workspace-table">
            <el-table :data="filteredLocales" v-loading="loading" stripe>
              <el-table-column label="Locale" min-width="180">
                <template #default="{ row }">
                  <button type="button" class="workspace-link" @click="selectLocale(row)">
                    {{ row.code.toUpperCase() }}
                  </button>
                </template>
              </el-table-column>
              <el-table-column label="Name" min-width="180" prop="name" />
              <el-table-column label="Native Name" min-width="180" prop="nativeName" />
              <el-table-column label="Direction" min-width="140">
                <template #default="{ row }">
                  {{ row.direction === 'rtl' ? 'Right to left' : 'Left to right' }}
                </template>
              </el-table-column>
              <el-table-column label="Status" min-width="130">
                <template #default="{ row }">
                  <StatusBadge :value="row.effectiveStatus || row.publicationStatus" />
                </template>
              </el-table-column>
              <el-table-column label="Active" min-width="120">
                <template #default="{ row }">
                  <el-tag :type="row.isActive ? 'success' : 'info'" effect="plain" round>
                    {{ row.isActive ? 'Active' : 'Inactive' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <TablePagination
            v-if="locales.length"
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
              <p class="workspace-eyebrow">Fallback resolver</p>
              <h2>Test the language chain</h2>
            </div>
          </header>

          <div class="workspace-form">
            <AppSearchField
              v-model="fallbackInput"
              label="Requested locale"
              placeholder="Type a locale code such as sw or fr"
            />
            <div class="flex flex-wrap gap-2">
              <el-button type="primary" @click="resolveFallbacks">Resolve fallback chain</el-button>
              <el-button plain @click="fallbackInput = ''">Clear</el-button>
            </div>

            <div class="workspace-summary">
              <div class="workspace-summary__row">
                <span>Requested locale</span>
                <strong>{{ fallbackRequestedLocale || '-' }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Fallback chain</span>
                <strong>{{ fallbackChain.join(' -> ') || '-' }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Active locales</span>
                <strong>{{ activeLocales.map((item) => item.code).join(', ') || '-' }}</strong>
              </div>
            </div>
          </div>
        </article>

        <article class="workspace-panel surface-card">
          <header class="workspace-panel__header">
            <div>
              <p class="workspace-eyebrow">Selected locale</p>
              <h2>{{ selectedLocale?.name || 'Choose a locale from the list' }}</h2>
            </div>
            <StatusBadge
              v-if="selectedLocale"
              :value="selectedLocale.effectiveStatus || selectedLocale.publicationStatus"
            />
          </header>

          <div v-if="selectedLocale" class="workspace-form">
            <div class="workspace-summary">
              <div class="workspace-summary__row">
                <span>Native name</span>
                <strong>{{ selectedLocale.nativeName || selectedLocale.name }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Default locale</span>
                <strong>{{ selectedLocale.isDefault ? 'Yes' : 'No' }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Last updated</span>
                <strong>{{
                  formatDisplayDate(selectedLocale.updatedAt || selectedLocale.createdAt)
                }}</strong>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <el-button type="success" plain @click="makeDefault">Set as default</el-button>
              <el-button type="warning" plain @click="toggleActive">
                {{ selectedLocale?.isActive ? 'Disable locale' : 'Enable locale' }}
              </el-button>
            </div>

            <EntityWorkflowButtons
              :disabled="!selectedLocale"
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
          </div>

          <p v-else class="workspace-empty">
            Select a locale to manage default behavior, activation, and publishing workflow.
          </p>
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

.workspace-form__actions,
.workspace-toggle-row {
  display: flex;
  flex-wrap: wrap;
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
