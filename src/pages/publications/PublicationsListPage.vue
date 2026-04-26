<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import OverviewFilterBar from '@/components/enterprise/OverviewFilterBar.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import EntityTable from '@/components/tables/EntityTable.vue'
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

const filterFields = computed(() => [
  {
    key: 'scope',
    type: 'select',
    label: 'Collection',
    placeholder: 'Filter by collection',
    options: [
      { label: 'All Records', value: 'all' },
      { label: 'Published', value: 'published' },
      { label: 'Archived', value: 'archived' },
      { label: 'Deleted', value: 'deleted' },
    ],
  },
  {
    key: 'status',
    type: 'select',
    label: 'Workflow Status',
    placeholder: 'Filter by workflow status',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Under Review', value: 'submitted' },
      { label: 'Approved', value: 'approved' },
      { label: 'Published', value: 'published' },
      { label: 'Unpublished', value: 'unpublished' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Rejected', value: 'rejected' },
    ],
  },
  {
    key: 'categoryId',
    type: 'select',
    label: 'Category',
    placeholder: 'Filter by category',
    options: categoryOptions.value,
  },
])

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
const headerActions = computed(() => {
  const actions = []

  if (selectedPublications.value.length) {
    actions.push(
      ...bulkActions.value.map((action) => ({
        ...action,
        group: action.group || 'selection',
      })),
    )
  }

  if (canManageCategories.value) {
    actions.push({
      key: 'manageCategories',
      label: 'Manage Categories',
      group: 'workspace',
      disabled: isBusy.value,
    })
  }

  actions.push({
    key: 'refreshWorkspace',
    label: 'Refresh Workspace',
    group: 'workspace',
  })

  if (canCreateCategory.value) {
    actions.push({
      key: 'createCategory',
      label: 'Create Category',
      group: 'workspace',
      disabled: isBusy.value,
    })
  }

  if (canCreatePublication.value) {
    actions.push({
      key: 'createPublication',
      label: 'Create Publication',
      group: 'workspace',
      disabled: isBusy.value || !categories.value.length,
    })
  }

  return actions
})

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

function updateFilterValues(values = {}) {
  filters.scope = typeof values.scope === 'string' ? values.scope : ''
  filters.status = typeof values.status === 'string' ? values.status : ''
  filters.categoryId = typeof values.categoryId === 'string' ? values.categoryId : ''
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

async function onHeaderAction(action) {
  if (!action) return

  if (
    selectedPublications.value.length &&
    bulkActions.value.some((item) => item.key === action.key)
  ) {
    await onBulkAction(action)
    return
  }

  switch (action.key) {
    case 'manageCategories':
      goToCategories()
      return
    case 'refreshWorkspace':
      await loadWorkspace()
      return
    case 'createCategory':
      goToCreateCategory()
      return
    case 'createPublication':
      goToCreatePublication()
      return
    default:
  }
}

async function goBack() {
  if (window.history.length > 1) {
    await router.back()
    return
  }

  await router.push({ name: 'dashboard.overview' })
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
      <EnterprisePageHeader
        title="Manage publications and categories together"
        description="Publications and publication categories belong to one editorial workspace. Use this page to understand category health, create new publication records, and jump into the category directory when taxonomy or validity rules need attention."
        :actions="headerActions"
        :loading="isBusy"
        :selection-count="selectedPublications.length"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <div class="enterprise-stack enterprise-stack--spacious">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <el-alert
        v-else-if="!categories.length"
        title="Create publication categories before creating publications."
        type="warning"
        show-icon
        :closable="false"
      >
        <template #default>
          <div class="enterprise-callout-row enterprise-callout-row--compact">
            <span class="enterprise-callout-row__copy">
              Publications belong to exactly one category. Start by creating the parent category,
              then return here to add publications under it.
            </span>
            <el-button
              v-if="canCreateCategory"
              size="large"
              type="warning"
              plain
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

          <div v-if="categoriesNeedingAction.length" class="enterprise-support-list">
            <el-button
              v-for="category in categoriesNeedingAction"
              :key="category.categoryId"
              text
              class="enterprise-support-button"
              @click="goToCategory(category)"
            >
              <div class="enterprise-support-button__body">
                <p class="enterprise-support-button__title">
                  {{ resolveLocalizedLabel(category) }}
                </p>
                <p class="enterprise-support-button__meta">
                  {{ Number(category.publicationCount || 0) }} linked publications
                </p>
              </div>
              <StatusBadge :value="category.effectiveStatus || category.publicationStatus" />
            </el-button>
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

          <div v-if="recentPublications.length" class="enterprise-support-list">
            <el-button
              v-for="publication in recentPublications"
              :key="publication.publicationId"
              text
              class="enterprise-support-button"
              @click="goToDetails(publication)"
            >
              <div class="enterprise-support-button__body">
                <p class="enterprise-support-button__title">
                  {{ resolveLocalizedLabel(publication) }}
                </p>
                <p class="enterprise-support-button__meta">
                  {{ resolveLocalizedLabel(publication.category, 'Unassigned') }} ·
                  {{
                    formatDisplayDate(
                      publication.lastModifiedAt || publication.updatedAt || publication.createdAt,
                    )
                  }}
                </p>
              </div>
              <StatusBadge :value="publication.effectiveStatus || publication.publicationStatus" />
            </el-button>
          </div>

          <el-empty v-else description="No publications have been created yet." :image-size="60" />
        </AppDetailCard>
      </AppBentoGrid>

      <AppBentoGrid columns="2">
        <AppDetailCard title="Workflow Health">
          <div class="enterprise-stat-list">
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Categories without publications</span>
              <strong class="enterprise-stat-row__value">{{ categorySummary.empty }}</strong>
            </div>
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Publications blocked by category state</span>
              <strong class="enterprise-stat-row__value">{{
                publicationSummary.blockedByCategory
              }}</strong>
            </div>
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Approved publications ready to publish</span>
              <strong class="enterprise-stat-row__value">{{ publicationSummary.approved }}</strong>
            </div>
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Categories live on the website</span>
              <strong class="enterprise-stat-row__value">{{ categorySummary.live }}</strong>
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

          <div v-if="categoriesMissingPublications.length" class="enterprise-support-list">
            <el-button
              v-for="category in categoriesMissingPublications"
              :key="category.categoryId"
              text
              class="enterprise-support-button"
              @click="goToCategory(category)"
            >
              <div class="enterprise-support-button__body">
                <p class="enterprise-support-button__title">
                  {{ resolveLocalizedLabel(category) }}
                </p>
                <p class="enterprise-support-button__meta">
                  {{ getStatusLabel(category.effectiveStatus || category.publicationStatus) }}
                </p>
              </div>
              <span class="enterprise-support-button__cta">Open</span>
            </el-button>
          </div>

          <el-empty
            v-else
            description="Every category currently has at least one linked publication."
            :image-size="60"
          />
        </AppDetailCard>
      </AppBentoGrid>

      <OverviewFilterBar
        :search-query="filters.search"
        search-label="Search Publications"
        search-placeholder="Search publications, categories, or descriptions"
        :filter-fields="filterFields"
        :filter-values="{
          scope: filters.scope,
          status: filters.status,
          categoryId: filters.categoryId,
        }"
        :loading="isBusy"
        @update:search-query="filters.search = $event"
        @update:filter-values="updateFilterValues"
        @apply="applyFilters"
        @reset="resetFilters"
      />

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
