<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import PageWrapper from '@/components/common/PageWrapper.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import EntityTable from '@/components/tables/EntityTable.vue'
import BulkActionsDropdown from '@/components/workflow/BulkActionsDropdown.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useEditorialActions } from '@/composables/useEditorialActions'
import { useRouteAccess } from '@/composables/useRouteAccess'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import {
  runEntityBulkWorkflowAction,
  runEntityWorkflowAction,
} from '@/stores/publications/workflowActionDispatch'
import { usePublicationsStore } from '@/stores/publications/usePublicationsStore'
import { formatDisplayDate, getStatusLabel } from '@/utils/adminPresentation'
import {
  buildCategorySummary,
  buildPublicationSummary,
  matchesSearch,
  resolveLocalizedLabel,
  sortByRecent,
} from '@/utils/publicationsWorkspace'
import { extractErrorMessage } from '@/utils/httpError'

const router = useRouter()

const publicationConfig = getResourceConfig('publications')
const publicationsStore = usePublicationsStore()
const { loading: workflowLoading } = storeToRefs(publicationsStore)
const { canAccessRoute } = useRouteAccess()
const { executeRecordAction, executeBulkAction, getBulkActions, getRecordActions } =
  useEditorialActions(publicationConfig)

const loading = ref(false)
const error = ref('')
const publications = ref([])
const summaryPublications = ref([])
const categories = ref([])
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
const selectedPublications = ref([])

const filters = reactive({
  search: '',
  scope: 'all',
  status: '',
  categoryId: '',
})

const publicationSummary = computed(() => buildPublicationSummary(summaryPublications.value))
const categorySummary = computed(() =>
  buildCategorySummary(categories.value, summaryPublications.value),
)
const isBusy = computed(() => loading.value || workflowLoading.value)
const canManageCategories = computed(() => canAccessRoute('publicationCategories.list'))
const canCreateCategory = computed(() => canAccessRoute('publicationCategories.create'))
const canCreatePublication = computed(() => canAccessRoute('publications.create'))
const canCreateFromTable = computed(
  () => canCreatePublication.value || (!categories.value.length && canCreateCategory.value),
)
const tableCreateLabel = computed(() =>
  categories.value.length ? 'Create Publication' : 'Create Category First',
)

const stats = computed(() => [
  { key: 'categories', label: 'Categories', value: categorySummary.value.total },
  {
    key: 'published-categories',
    label: 'Published Categories',
    value: categorySummary.value.published,
  },
  {
    key: 'empty-categories',
    label: 'Categories With No Publications',
    value: categorySummary.value.empty,
  },
  { key: 'publications', label: 'Publications', value: publicationSummary.value.total },
  {
    key: 'review',
    label: 'Under Review',
    value: publicationSummary.value.submitted + categorySummary.value.submitted,
  },
  {
    key: 'public',
    label: 'Public Website Items',
    value: publicationSummary.value.published,
  },
])

const categoryOptions = computed(() =>
  categories.value.map((category) => ({
    value: category.categoryId || category._id,
    label: resolveLocalizedLabel(category),
  })),
)

const categoriesMissingPublications = computed(() =>
  categories.value.filter((category) => Number(category?.publicationCount || 0) === 0).slice(0, 5),
)

const categoriesNeedingAction = computed(() =>
  categories.value
    .filter((category) =>
      ['submitted', 'approved'].includes(
        String(category?.effectiveStatus || category?.publicationStatus || ''),
      ),
    )
    .slice(0, 5),
)

const recentPublications = computed(() => sortByRecent(summaryPublications.value).slice(0, 5))
const bulkActions = computed(() => getBulkActions(selectedPublications.value))
const selectedRowKeys = computed(() =>
  selectedPublications.value.map((record) => publicationConfig.adapter.getId(record)),
)

function buildQuery({ forSummary = false } = {}) {
  const query = {
    page: forSummary ? 1 : pagination.value.page,
    limit: forSummary ? 200 : pagination.value.limit,
  }

  if (filters.search.trim()) query.search = filters.search.trim()
  if (filters.status) query.publicationStatus = filters.status
  if (filters.categoryId) query.categoryId = filters.categoryId

  return query
}

function rowActions(row) {
  return getRecordActions(row)
}

async function runPublicationWorkflow(actionKey, id, payload = {}) {
  return runEntityWorkflowAction(publicationsStore, actionKey, id, payload)
}

async function runPublicationBulkWorkflow(actionKey, payload = {}) {
  return runEntityBulkWorkflowAction(publicationsStore, actionKey, payload)
}

async function loadCategories() {
  const response = await publicationsAPI.listPublicationCategories({ page: 1, limit: 200 })
  if (response?.error) throw response.error
  categories.value = response?.categories || response?.items || []
}

async function loadPublications() {
  const query = buildQuery()
  let response

  if (filters.scope === 'published') {
    response = await publicationsAPI.listPublishedPublications(query)
  } else if (filters.scope === 'archived') {
    response = await publicationsAPI.listArchivedPublications(query)
  } else if (filters.scope === 'deleted') {
    response = await publicationsAPI.listPublications({
      ...query,
      includeDeleted: true,
      isDeleted: true,
    })
  } else {
    response = query.search
      ? await publicationsAPI.searchPublications(query)
      : await publicationsAPI.listPublications(query)
  }

  if (response?.error) throw response.error

  publications.value = response?.publications || response?.items || []
  selectedPublications.value = []
  pagination.value = {
    page: Number(response?.page || response?.pagination?.page || pagination.value.page || 1),
    limit: Number(response?.limit || response?.pagination?.limit || pagination.value.limit || 20),
    total: Number(response?.total || response?.pagination?.total || publications.value.length || 0),
    totalPages: Number(
      response?.totalPages ||
        response?.pagination?.totalPages ||
        Math.max(
          1,
          Math.ceil((response?.total || publications.value.length || 0) / pagination.value.limit),
        ),
    ),
  }
}

async function loadSummaryPublications() {
  const query = buildQuery({ forSummary: true })
  const response = query.search
    ? await publicationsAPI.searchPublications(query)
    : await publicationsAPI.listPublications(query)
  if (response?.error) throw response.error
  summaryPublications.value = response?.publications || response?.items || []
}

async function loadWorkspace() {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([loadCategories(), loadPublications(), loadSummaryPublications()])
  } catch (err) {
    error.value = extractErrorMessage(err, 'Failed to load the publications workspace.')
  } finally {
    loading.value = false
  }
}

function goToCategories() {
  if (!canManageCategories.value) return
  router.push({ name: 'publicationCategories.list' })
}

function goToCreateCategory() {
  if (!canCreateCategory.value) return
  router.push({ name: 'publicationCategories.create' })
}

function goToCreatePublication() {
  if (!categories.value.length) {
    goToCreateCategory()
    return
  }

  if (!canCreatePublication.value) return
  router.push({ name: 'publications.create' })
}

function goToDetails(row) {
  const publicationId = publicationConfig.adapter.getId(row)
  if (!publicationId) return
  router.push({ name: 'publications.details', params: { publicationId } })
}

function goToCategory(category) {
  const categoryId = category?.categoryId || category?._id
  if (!categoryId) return
  router.push({ name: 'publicationCategories.details', params: { categoryId } })
}

async function applyFilters() {
  pagination.value.page = 1
  await loadWorkspace()
}

async function resetFilters() {
  filters.search = ''
  filters.scope = 'all'
  filters.status = ''
  filters.categoryId = ''
  pagination.value.page = 1
  await loadWorkspace()
}

async function onRowAction({ action, row }) {
  const completed = await executeRecordAction(action, row, {
    runWorkflow: runPublicationWorkflow,
    reload: loadWorkspace,
  })

  if (completed && action?.key === 'delete') {
    await loadWorkspace()
  }
}

async function onBulkAction(action) {
  const completed = await executeBulkAction(action, selectedPublications.value, {
    runBulkWorkflow: runPublicationBulkWorkflow,
    reload: loadWorkspace,
  })

  if (completed) {
    selectedPublications.value = []
  }
}

watch(
  () => filters.search,
  () => {
    window.clearTimeout(applyFilters.timer)
    applyFilters.timer = window.setTimeout(() => {
      pagination.value.page = 1
      loadWorkspace()
    }, 260)
  },
)

onMounted(loadWorkspace)
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <h1 class="page-title fcc-page-title">Manage publications and categories together</h1>
          <p class="page-description fcc-page-subtitle mt-1">
            Publications and publication categories belong to one editorial workspace. Use this page
            to understand category health, create new publication records, and jump into the
            category directory when taxonomy or validity rules need attention.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <span
            v-if="selectedPublications.length"
            class="px-2 text-sm font-medium text-[var(--fcc-text-muted)]"
          >
            {{ selectedPublications.length }} selected
          </span>
          <BulkActionsDropdown
            v-if="selectedPublications.length"
            :actions="bulkActions"
            :selection-count="selectedPublications.length"
            :loading="isBusy"
            @select="onBulkAction"
          />
          <el-button
            v-if="canManageCategories"
            plain
            round
            :disabled="isBusy"
            @click="goToCategories"
          >
            Manage Categories
          </el-button>
          <el-button plain round :loading="isBusy" @click="loadWorkspace">Refresh</el-button>
          <el-button
            v-if="canCreateCategory"
            type="primary"
            plain
            round
            :disabled="isBusy"
            @click="goToCreateCategory"
          >
            Create Category
          </el-button>
          <el-button
            v-if="canCreatePublication"
            type="primary"
            round
            :disabled="isBusy || !categories.length"
            @click="goToCreatePublication"
          >
            Create Publication
          </el-button>
        </div>
      </div>
    </template>

    <div class="space-y-6 mt-4">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <el-alert
        v-else-if="!categories.length"
        title="Create publication categories before creating publications."
        type="warning"
        show-icon
        :closable="false"
      >
        <template #default>
          <div class="flex flex-wrap items-center justify-between gap-3 mt-1">
            <span class="text-sm">
              Publications belong to exactly one category. Start by creating the parent category,
              then return here to add publications under it.
            </span>
            <el-button
              v-if="canCreateCategory"
              type="warning"
              plain
              round
              :disabled="isBusy"
              @click="goToCreateCategory"
            >
              Create Category
            </el-button>
          </div>
        </template>
      </el-alert>

      <OverviewStatsGrid :stats="stats" />

      <AppBentoGrid columns="2">
        <AppDetailCard title="Categories Needing Action">
          <template #header-actions>
            <StatusBadge
              value="approved"
              :label="`${categoriesNeedingAction.length} active items`"
            />
          </template>

          <div v-if="categoriesNeedingAction.length" class="space-y-3">
            <button
              v-for="category in categoriesNeedingAction"
              :key="category.categoryId"
              type="button"
              class="flex w-full items-center justify-between p-4 rounded-[var(--fcc-radius-lg)] border border-[var(--fcc-border)] bg-[var(--fcc-surface-muted)] text-left transition hover:border-[var(--fcc-primary-400)]"
              @click="goToCategory(category)"
            >
              <div>
                <p class="font-semibold text-[var(--fcc-text)]">
                  {{ resolveLocalizedLabel(category) }}
                </p>
                <p class="text-sm text-[var(--fcc-text-muted)] mt-1">
                  {{ Number(category.publicationCount || 0) }} linked publications
                </p>
              </div>
              <StatusBadge :value="category.effectiveStatus || category.publicationStatus" />
            </button>
          </div>

          <el-empty
            v-else
            description="No categories are currently waiting for review or publication."
            :image-size="60"
          />
        </AppDetailCard>

        <AppDetailCard title="Recent Publications">
          <template #header-actions>
            <StatusBadge value="published" :label="`${publicationSummary.published} public`" />
          </template>

          <div v-if="recentPublications.length" class="space-y-3">
            <button
              v-for="publication in recentPublications"
              :key="publication.publicationId"
              type="button"
              class="flex w-full items-center justify-between p-4 rounded-[var(--fcc-radius-lg)] border border-[var(--fcc-border)] bg-[var(--fcc-surface-muted)] text-left transition hover:border-[var(--fcc-primary-400)]"
              @click="goToDetails(publication)"
            >
              <div>
                <p class="font-semibold text-[var(--fcc-text)]">
                  {{ resolveLocalizedLabel(publication) }}
                </p>
                <p class="text-sm text-[var(--fcc-text-muted)] mt-1">
                  {{ resolveLocalizedLabel(publication.category, 'Unassigned') }} ·
                  {{
                    formatDisplayDate(
                      publication.lastModifiedAt || publication.updatedAt || publication.createdAt,
                    )
                  }}
                </p>
              </div>
              <StatusBadge :value="publication.effectiveStatus || publication.publicationStatus" />
            </button>
          </div>

          <el-empty v-else description="No publications have been created yet." :image-size="60" />
        </AppDetailCard>
      </AppBentoGrid>

      <AppBentoGrid columns="2">
        <AppDetailCard title="Workflow Health">
          <div class="space-y-4 text-sm text-[var(--fcc-text)] p-2">
            <div class="flex items-center justify-between pb-3 border-b border-[var(--fcc-border)]">
              <span class="text-[var(--fcc-text-muted)]">Categories without publications</span>
              <strong class="text-base">{{ categorySummary.empty }}</strong>
            </div>
            <div class="flex items-center justify-between pb-3 border-b border-[var(--fcc-border)]">
              <span class="text-[var(--fcc-text-muted)]"
                >Publications blocked by category state</span
              >
              <strong class="text-base">{{ publicationSummary.blockedByCategory }}</strong>
            </div>
            <div class="flex items-center justify-between pb-3 border-b border-[var(--fcc-border)]">
              <span class="text-[var(--fcc-text-muted)]"
                >Approved publications ready to publish</span
              >
              <strong class="text-base">{{ publicationSummary.approved }}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--fcc-text-muted)]">Categories live on the website</span>
              <strong class="text-base">{{ categorySummary.live }}</strong>
            </div>
          </div>
        </AppDetailCard>

        <AppDetailCard title="Category Gaps">
          <template #header-actions>
            <StatusBadge
              value="draft"
              :label="`${categoriesMissingPublications.length} highlighted`"
            />
          </template>

          <div v-if="categoriesMissingPublications.length" class="space-y-3">
            <button
              v-for="category in categoriesMissingPublications"
              :key="category.categoryId"
              type="button"
              class="flex w-full items-center justify-between p-4 rounded-[var(--fcc-radius-lg)] border border-[var(--fcc-border)] bg-[var(--fcc-surface-muted)] text-left transition hover:border-[var(--fcc-primary-400)]"
              @click="goToCategory(category)"
            >
              <div>
                <p class="font-semibold text-[var(--fcc-text)]">
                  {{ resolveLocalizedLabel(category) }}
                </p>
                <p class="text-sm text-[var(--fcc-text-muted)] mt-1">
                  {{ getStatusLabel(category.effectiveStatus || category.publicationStatus) }}
                </p>
              </div>
              <el-button size="small" plain round type="primary">Open</el-button>
            </button>
          </div>

          <el-empty
            v-else
            description="Every category currently has at least one linked publication."
            :image-size="60"
          />
        </AppDetailCard>
      </AppBentoGrid>

      <section
        class="rounded-[var(--fcc-radius-lg)] border border-[var(--fcc-border)] bg-[var(--fcc-surface)] p-4 shadow-sm"
      >
        <div class="grid gap-3 lg:grid-cols-[1.4fr,1fr,1fr,1fr,auto]">
          <el-input
            v-model="filters.search"
            clearable
            placeholder="Search publications, categories, or descriptions"
          />
          <el-select v-model="filters.scope" clearable placeholder="Filter by collection">
            <el-option label="All Records" value="all" />
            <el-option label="Published" value="published" />
            <el-option label="Archived" value="archived" />
            <el-option label="Deleted" value="deleted" />
          </el-select>
          <el-select v-model="filters.status" clearable placeholder="Filter by workflow status">
            <el-option label="Draft" value="draft" />
            <el-option label="Under Review" value="submitted" />
            <el-option label="Approved" value="approved" />
            <el-option label="Published" value="published" />
            <el-option label="Unpublished" value="unpublished" />
            <el-option label="Scheduled" value="scheduled" />
            <el-option label="Rejected" value="rejected" />
          </el-select>
          <el-select v-model="filters.categoryId" clearable placeholder="Filter by category">
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <div class="flex flex-wrap justify-end gap-2">
            <el-button plain round :disabled="isBusy" @click="resetFilters">Reset</el-button>
            <el-button type="primary" round :loading="isBusy" @click="applyFilters"
              >Apply</el-button
            >
          </div>
        </div>
      </section>

      <EntityTable
        title="Publications"
        description="Every publication stays attached to one category, with workflow status visible from the list."
        :records="publications.filter((record) => matchesSearch(record, filters.search))"
        :columns="publicationConfig.columns"
        :row-key="publicationConfig.idKey"
        :loading="isBusy"
        :error="error"
        :show-create="canCreateFromTable"
        :create-label="tableCreateLabel"
        :show-refresh="true"
        :show-search="false"
        :actions="rowActions"
        selectable
        :selected-row-keys="selectedRowKeys"
        @create="goToCreatePublication"
        @refresh="loadWorkspace"
        @row-click="goToDetails"
        @action="onRowAction"
        @selection-change="selectedPublications = $event"
      />

      <TablePagination
        :pagination="pagination"
        :loading="isBusy"
        @update:page="
          (page) => {
            pagination.page = page
            loadWorkspace()
          }
        "
        @update:limit="
          (limit) => {
            pagination.limit = limit
            pagination.page = 1
            loadWorkspace()
          }
        "
      />
    </div>
  </PageWrapper>
</template>
