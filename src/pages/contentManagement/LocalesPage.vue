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
import { useLocalesStore } from '@/stores/useLocalesStore'
import { formatDisplayDate } from '@/utils/adminPresentation'
import { replaceValidationState, validateRequiredFields } from '@/utils/formValidation'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
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
const validationErrors = reactive({})

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

const directionOptions = Object.freeze([
  { label: 'Left to right', value: 'ltr' },
  { label: 'Right to left', value: 'rtl' },
])

const localeFields = Object.freeze([
  {
    key: 'code',
    label: 'Locale Code',
    placeholder: 'en, sw, fr',
    required: true,
  },
  {
    key: 'name',
    label: 'Display Name',
    placeholder: 'English, Kiswahili, French',
    required: true,
  },
  {
    key: 'nativeName',
    label: 'Native Name',
    placeholder: 'Kiswahili, Francais',
  },
  {
    key: 'direction',
    label: 'Reading Direction',
    component: 'select',
    options: directionOptions,
  },
])

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

const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh workspace' },
  { key: 'create', label: 'New locale' },
])

function loadForm(item = null) {
  replaceValidationState(validationErrors)
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

function validateForm() {
  const { errors, isValid } = validateRequiredFields([
    {
      key: 'code',
      label: 'Locale Code',
      value: () => form.code.trim().toLowerCase(),
    },
    {
      key: 'name',
      label: 'Display Name',
      value: () => form.name.trim(),
    },
  ])

  replaceValidationState(validationErrors, errors)
  return isValid
}

async function onSubmit() {
  feedback.value = ''
  if (!validateForm()) return
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
        title="Locales"
        description="Manage language options, fallback behavior, and publishing readiness in a translation-friendly workspace."
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
          eyebrow="Language setup"
          :title="selectedLocaleId ? 'Update locale settings' : 'Create a new locale'"
        >
          <el-form label-position="top" class="workspace-form" @submit.prevent="onSubmit">
            <SmartFormGrid :fields="localeFields" :columns="2">
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

            <el-form-item label="Fallback Locales" class="form-item-flush">
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
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          eyebrow="Translation workspace"
          title="Browse available locales"
        >
          <template #aside>
            <AppSearchField
              v-model="searchQuery"
              label="Search locales"
              placeholder="Search by locale code, display name, native name, or direction"
              class="workspace-search"
            />
          </template>

          <div class="workspace-table">
            <el-table :data="filteredLocales" v-loading="loading" stripe>
              <el-table-column label="Locale" min-width="180">
                <template #default="{ row }">
                  <el-button link class="workspace-link" @click="selectLocale(row)">
                    {{ row.code.toUpperCase() }}
                  </el-button>
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
        </WorkspacePanel>
      </section>

      <section class="workspace-grid workspace-grid--bottom">
        <WorkspacePanel tag="article" eyebrow="Fallback resolver" title="Test the language chain">
          <div class="workspace-form">
            <AppSearchField
              v-model="fallbackInput"
              label="Requested locale"
              placeholder="Type a locale code such as sw or fr"
            />
            <div class="workspace-inline-actions">
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
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          eyebrow="Selected locale"
          :title="selectedLocale?.name || 'Choose a locale from the list'"
        >
          <template #aside>
            <StatusBadge
              v-if="selectedLocale"
              :value="selectedLocale.effectiveStatus || selectedLocale.publicationStatus"
            />
          </template>

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

            <div class="workspace-inline-actions">
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
        </WorkspacePanel>
      </section>
    </div>
  </PageWrapper>
</template>
