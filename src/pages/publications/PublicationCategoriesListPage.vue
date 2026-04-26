<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { publicationsAPI } from '@/api'
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
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
import { usePublicationCategoriesStore } from '@/stores/publications/usePublicationCategoriesStore'
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
const categoryConfig = getResourceConfig('publicationCategories')
const categoriesStore = usePublicationCategoriesStore()
const { loading: workflowLoading } = storeToRefs(categoriesStore)
const { canAccessRoute } = useRouteAccess()
const { executeRecordAction, executeBulkAction, getBulkActions, getRecordActions } =
  useEditorialActions(categoryConfig)

const loading = ref(false)
const error = ref('')
const categories = ref([])
const summaryCategories = ref([])
const summaryPublications = ref([])
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
const selectedCategories = ref([])

const filters = reactive({
  search: '',
  scope: 'all',
  status: '',
  validityType: '',
})

const categorySummary = computed(() =>
  buildCategorySummary(summaryCategories.value, summaryPublications.value),
)
const publicationSummary = computed(() => buildPublicationSummary(summaryPublications.value))
const bulkActions = computed(() => getBulkActions(selectedCategories.value))
const selectedRowKeys = computed(() =>
  selectedCategories.value.map((record) => categoryConfig.adapter.getId(record)),
)
const headerActions = computed(() => {
  const actions = []

  if (selectedCategories.value.length) {
    actions.push(
      ...bulkActions.value.map((action) => ({
        ...action,
        group: action.group || 'selection',
      })),
    )
  }

  actions.push({
    key: 'refreshWorkspace',
    label: 'Refresh Categories',
    group: 'workspace',
  })

  if (canCreatePublication.value) {
    actions.push({
      key: 'createPublication',
      label: 'Create Publication',
      group: 'workspace',
      disabled: isBusy.value,
    })
  }

  if (canCreateCategory.value) {
    actions.push({
      key: 'createCategory',
      label: 'Create Category',
      group: 'workspace',
      disabled: isBusy.value,
    })
  }

  return actions
})
const isBusy = computed(() => loading.value || workflowLoading.value)
const canOpenPublications = computed(() => canAccessRoute('publications.list'))
const canCreateCategory = computed(() => canAccessRoute('publicationCategories.create'))
const canCreatePublication = computed(() => canAccessRoute('publications.create'))

const stats = computed(() => [
  { key: 'categories', label: 'Categories', value: categorySummary.value.total },
  { key: 'published', label: 'Published Categories', value: categorySummary.value.published },
  { key: 'review', label: 'Under Review', value: categorySummary.value.submitted },
  { key: 'approved', label: 'Approved', value: categorySummary.value.approved },
  { key: 'empty', label: 'No Publications Yet', value: categorySummary.value.empty },
  { key: 'public', label: 'Categories With Public Content', value: categorySummary.value.live },
])

const recentCategories = computed(() => sortByRecent(summaryCategories.value).slice(0, 5))
const categoriesWithoutPublications = computed(() =>
  summaryCategories.value
    .filter((category) => Number(category?.publicationCount || 0) === 0)
    .slice(0, 5),
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
      { label: 'Rejected', value: 'rejected' },
    ],
  },
  {
    key: 'validityType',
    type: 'select',
    label: 'Validity Type',
    placeholder: 'Filter by validity type',
    options: [
      { label: 'Permanent', value: 'permanent' },
      { label: 'Time-bound', value: 'time-bound' },
    ],
  },
])

function buildQuery({ forSummary = false } = {}) {
  const query = {
    page: forSummary ? 1 : pagination.value.page,
    limit: forSummary ? 200 : pagination.value.limit,
  }

  if (filters.search.trim()) query.search = filters.search.trim()
  if (filters.status) query.publicationStatus = filters.status
  if (filters.validityType) query.validityType = filters.validityType

  return query
}

function rowActions(row) {
  return getRecordActions(row)
}

async function runCategoryWorkflow(actionKey, id, payload = {}) {
  return runEntityWorkflowAction(categoriesStore, actionKey, id, payload)
}

async function runCategoryBulkWorkflow(actionKey, payload = {}) {
  return runEntityBulkWorkflowAction(categoriesStore, actionKey, payload)
}

async function loadCategoryTable() {
  const query = buildQuery()
  let response

  if (filters.scope === 'published') {
    response = await publicationsAPI.listPublishedCategories(query)
  } else if (filters.scope === 'archived') {
    response = await publicationsAPI.listArchivedCategories(query)
  } else if (filters.scope === 'deleted') {
    response = await publicationsAPI.listPublicationCategories({
      ...query,
      includeDeleted: true,
      isDeleted: true,
    })
  } else {
    response = query.search
      ? await publicationsAPI.searchCategories(query)
      : await publicationsAPI.listPublicationCategories(query)
  }

  if (response?.error) throw response.error

  categories.value = response?.categories || response?.items || []
  selectedCategories.value = []
  pagination.value = {
    page: Number(response?.page || response?.pagination?.page || pagination.value.page || 1),
    limit: Number(response?.limit || response?.pagination?.limit || pagination.value.limit || 20),
    total: Number(response?.total || response?.pagination?.total || categories.value.length || 0),
    totalPages: Number(
      response?.totalPages ||
        response?.pagination?.totalPages ||
        Math.max(
          1,
          Math.ceil((response?.total || categories.value.length || 0) / pagination.value.limit),
        ),
    ),
  }
}

async function loadSummary() {
  const categoryQuery = buildQuery({ forSummary: true })
  const [categoryResponse, publicationResponse] = await Promise.all([
    categoryQuery.search
      ? publicationsAPI.searchCategories(categoryQuery)
      : publicationsAPI.listPublicationCategories(categoryQuery),
    publicationsAPI.listPublications({ page: 1, limit: 200 }),
  ])

  if (categoryResponse?.error) throw categoryResponse.error
  if (publicationResponse?.error) throw publicationResponse.error

  summaryCategories.value = categoryResponse?.categories || categoryResponse?.items || []
  summaryPublications.value = publicationResponse?.publications || publicationResponse?.items || []
}

async function loadWorkspace() {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([loadCategoryTable(), loadSummary()])
  } catch (err) {
    error.value = extractErrorMessage(err, 'Failed to load publication categories.')
  } finally {
    loading.value = false
  }
}

function goToPublications() {
  if (!canOpenPublications.value) return
  router.push({ name: 'publications.list' })
}

function goToCreateCategory() {
  if (!canCreateCategory.value) return
  router.push({ name: 'publicationCategories.create' })
}

function goToCreatePublication() {
  if (!canCreatePublication.value) return
  router.push({ name: 'publications.create' })
}

function goToDetails(row) {
  const categoryId = row?.categoryId || row?._id
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
  filters.validityType = ''
  pagination.value.page = 1
  await loadWorkspace()
}

function updateFilterValues(values = {}) {
  filters.scope = typeof values.scope === 'string' ? values.scope : ''
  filters.status = typeof values.status === 'string' ? values.status : ''
  filters.validityType = typeof values.validityType === 'string' ? values.validityType : ''
}

async function onRowAction({ action, row }) {
  const completed = await executeRecordAction(action, row, {
    runWorkflow: runCategoryWorkflow,
    reload: loadWorkspace,
  })

  if (completed && action?.key === 'delete') {
    await loadWorkspace()
  }
}

async function onBulkAction(action) {
  const completed = await executeBulkAction(action, selectedCategories.value, {
    runBulkWorkflow: runCategoryBulkWorkflow,
    reload: loadWorkspace,
  })

  if (completed) {
    selectedCategories.value = []
  }
}

async function onHeaderAction(action) {
  if (!action) return

  if (selectedCategories.value.length && bulkActions.value.some((item) => item.key === action.key)) {
    await onBulkAction(action)
    return
  }

  switch (action.key) {
    case 'refreshWorkspace':
      await loadWorkspace()
      return
    case 'createPublication':
      goToCreatePublication()
      return
    case 'createCategory':
      goToCreateCategory()
      return
    default:
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
      <EnterprisePageHeader
        title="Category directory for publications management"
        description="Categories are the structural layer behind publication records. Review their workflow state, validity rules, and publication counts here before editors move back into the publication forms."
        :actions="headerActions"
        :loading="isBusy"
        :selection-count="selectedCategories.length"
        :back-disabled="!canOpenPublications"
        @select="onHeaderAction"
        @back="goToPublications"
      />
    </template>

    <div class="enterprise-stack enterprise-stack--spacious">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <OverviewStatsGrid :stats="stats" />

      <AppBentoGrid columns="2">
        <AppDetailCard title="Recently Updated Categories">
          <template #header-actions>
            <StatusBadge value="published" :label="`${categorySummary.published} published`" />
          </template>

          <div v-if="recentCategories.length" class="enterprise-support-list">
            <el-button
              v-for="category in recentCategories"
              :key="category.categoryId"
              text
              class="enterprise-support-button"
              @click="goToDetails(category)"
            >
              <div class="enterprise-support-button__body">
                <p class="enterprise-support-button__title">
                  {{ resolveLocalizedLabel(category) }}
                </p>
                <p class="enterprise-support-button__meta">
                  {{
                    formatDisplayDate(
                      category.lastModifiedAt || category.updatedAt || category.createdAt,
                    )
                  }}
                </p>
              </div>
              <StatusBadge :value="category.effectiveStatus || category.publicationStatus" />
            </el-button>
          </div>

          <el-empty v-else description="No categories available yet." :image-size="60" />
        </AppDetailCard>

        <AppDetailCard title="Category Coverage Gaps">
          <template #header-actions>
            <StatusBadge value="draft" :label="`${categorySummary.empty} empty`" />
          </template>

          <div v-if="categoriesWithoutPublications.length" class="enterprise-support-list">
            <el-button
              v-for="category in categoriesWithoutPublications"
              :key="category.categoryId"
              text
              class="enterprise-support-button"
              @click="goToDetails(category)"
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

      <AppBentoGrid columns="2">
        <AppDetailCard title="Visibility Rules">
          <div class="enterprise-note-list">
            <p>Categories must be published before their publications can be public.</p>
            <p>
              Published categories with zero published publications stay internally ready, but they
              do not expose public content yet.
            </p>
            <p>
              Deletion is blocked when publications still belong to the category, so parent-child
              relationships remain explicit and safe.
            </p>
          </div>
        </AppDetailCard>

        <AppDetailCard title="Module Snapshot">
          <div class="enterprise-stat-list">
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Total linked publications</span>
              <strong class="enterprise-stat-row__value">{{ publicationSummary.total }}</strong>
            </div>
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Published publications</span>
              <strong class="enterprise-stat-row__value">{{ publicationSummary.published }}</strong>
            </div>
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Categories waiting for review</span>
              <strong class="enterprise-stat-row__value">{{ categorySummary.submitted }}</strong>
            </div>
            <div class="enterprise-stat-row">
              <span class="enterprise-stat-row__label">Approved categories ready to publish</span>
              <strong class="enterprise-stat-row__value">{{ categorySummary.approved }}</strong>
            </div>
          </div>
        </AppDetailCard>
      </AppBentoGrid>

      <OverviewFilterBar
        :search-query="filters.search"
        search-label="Search Categories"
        search-placeholder="Search categories by name, key, or description"
        :filter-fields="filterFields"
        :filter-values="{
          scope: filters.scope,
          status: filters.status,
          validityType: filters.validityType,
        }"
        :loading="isBusy"
        @update:search-query="filters.search = $event"
        @update:filter-values="updateFilterValues"
        @apply="applyFilters"
        @reset="resetFilters"
      />

      <EntityTable
        title="Category Directory"
        description="Category workflow, visibility, and linked publication counts are visible from one management view."
        :records="categories.filter((record) => matchesSearch(record, filters.search))"
        :columns="categoryConfig.columns"
        :row-key="categoryConfig.idKey"
        :loading="isBusy"
        :error="error"
        :show-create="canCreateCategory"
        create-label="Create Category"
        :show-refresh="true"
        :show-search="false"
        :actions="rowActions"
        selectable
        :selected-row-keys="selectedRowKeys"
        @create="goToCreateCategory"
        @refresh="loadWorkspace"
        @row-click="goToDetails"
        @action="onRowAction"
        @selection-change="selectedCategories = $event"
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
