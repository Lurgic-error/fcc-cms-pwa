<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import EntityDetailsPanel from '@/components/enterprise/EntityDetailsPanel.vue'
import EntityTable from '@/components/tables/EntityTable.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useRouteAccess } from '@/composables/useRouteAccess'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { publicationsAPI } from '@/api'
import { useEditorialActions } from '@/composables/useEditorialActions'
import { useEntityCrud } from '@/composables/useEntityCrud'
import { formatDisplayDate, getStatusLabel } from '@/utils/adminPresentation'
import { buildCategoryVisibility, resolveLocalizedLabel } from '@/utils/publicationsWorkspace'
import { extractErrorMessage } from '@/utils/httpError'

const route = useRoute()
const router = useRouter()
const { canAccessRoute } = useRouteAccess()

const categoryConfig = getResourceConfig('publicationCategories')
const pubConfig = getResourceConfig('publications')

const categoryId = computed(() => route.params?.categoryId || '')

const {
  entity: category,
  loading: catLoading,
  error: catError,
  fetchOne,
  runWorkflow,
} = useEntityCrud(categoryConfig.adapter)
const { executeRecordAction, getRecordActions } = useEditorialActions(categoryConfig)

const publications = ref([])
const pubLoading = ref(false)
const pubError = ref('')
const search = ref('')
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

const categoryVisibility = computed(() => buildCategoryVisibility(category.value))
const canCreatePublication = computed(() => canAccessRoute(pubConfig.routes.create))
const canViewPublication = computed(() => canAccessRoute(pubConfig.routes.details))
const canEditPublication = computed(() => canAccessRoute(pubConfig.routes.edit))
const detailActions = computed(() =>
  getRecordActions(category.value, {
    canView: false,
    extraActions: canCreatePublication.value
      ? [{ key: 'createPublication', label: 'Create Publication', group: 'navigation' }]
      : [],
  }),
)

function publicationRowActions() {
  const actions = []

  if (canViewPublication.value) {
    actions.push({ label: 'View', key: 'view', type: 'primary' })
  }

  if (canEditPublication.value) {
    actions.push({ label: 'Edit', key: 'edit' })
  }

  return actions
}

async function loadCategory() {
  if (!categoryId.value) return
  await fetchOne(categoryId.value)
}

async function loadPublications() {
  if (!categoryId.value) return
  pubLoading.value = true
  pubError.value = ''

  try {
    const query = {
      categoryId: categoryId.value,
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: search.value || undefined,
    }
    const response = query.search
      ? await publicationsAPI.searchPublications(query)
      : await publicationsAPI.listPublications(query)

    if (response?.error) throw response.error

    publications.value = response?.publications || response?.items || []
    pagination.value = {
      page: Number(response?.page || response?.pagination?.page || pagination.value.page || 1),
      limit: Number(response?.limit || response?.pagination?.limit || pagination.value.limit || 10),
      total: Number(
        response?.total || response?.pagination?.total || publications.value.length || 0,
      ),
      totalPages: Number(
        response?.totalPages ||
          response?.pagination?.totalPages ||
          Math.max(
            1,
            Math.ceil((response?.total || publications.value.length || 0) / pagination.value.limit),
          ),
      ),
    }
  } catch (err) {
    pubError.value = extractErrorMessage(
      err,
      'Failed to load publications linked to this category.',
    )
  } finally {
    pubLoading.value = false
  }
}

function goToList() {
  router.push({ name: categoryConfig.routes.list })
}

function goToCreatePublication() {
  if (!canCreatePublication.value) return
  router.push({ name: pubConfig.routes.create, query: { category: categoryId.value } })
}

function onPublicationView(row) {
  if (!canViewPublication.value) return
  router.push({
    name: pubConfig.routes.details,
    params: { publicationId: pubConfig.adapter.getId(row) },
  })
}

function onPublicationEdit(row) {
  if (!canEditPublication.value) return
  router.push({
    name: pubConfig.routes.edit,
    params: { publicationId: pubConfig.adapter.getId(row) },
  })
}

async function onAction(action) {
  if (action?.key === 'createPublication') {
    goToCreatePublication()
    return
  }

  const completed = await executeRecordAction(action, category.value, {
    runWorkflow,
    reload: async () => Promise.all([loadCategory(), loadPublications()]),
  })

  if (completed && action?.key === 'delete') {
    router.push({ name: categoryConfig.routes.list })
  }
}

onMounted(() => {
  loadCategory()
  loadPublications()
})

watch(categoryId, async (nextId, previousId) => {
  if (!nextId || nextId === previousId) return
  search.value = ''
  pagination.value.page = 1
  await Promise.all([loadCategory(), loadPublications()])
})

watch(search, () => {
  window.clearTimeout(loadPublications.timer)
  loadPublications.timer = window.setTimeout(() => {
    pagination.value.page = 1
    loadPublications()
  }, 260)
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        :title="resolveLocalizedLabel(category, 'Publication Category')"
        description="Manage the parent category, review workflow state, and inspect every publication that belongs to it."
        :actions="detailActions"
        :loading="catLoading"
        @select="onAction"
        @back="goToList"
      />
    </template>

    <div class="enterprise-stack enterprise-stack--spacious">
      <el-alert
        v-if="categoryVisibility.label !== 'Public'"
        :title="categoryVisibility.label"
        :type="categoryVisibility.tone"
        show-icon
        :closable="false"
        :description="categoryVisibility.description"
      />

      <AppBentoGrid columns="2">
        <AppDetailCard title="Website Visibility">
          <template #header-actions>
            <el-tag :type="categoryVisibility.tone" effect="light" round size="small">
              {{ categoryVisibility.label }}
            </el-tag>
          </template>

          <AppDetailGrid :columns="1">
            <AppDetailItem label="Workflow status">
              <StatusBadge :value="category?.effectiveStatus || category?.publicationStatus" />
            </AppDetailItem>
            <AppDetailItem label="Linked publications">
              <span class="detail-item__emphasis">{{
                Number(category?.publicationCount || 0)
              }}</span>
            </AppDetailItem>
            <AppDetailItem label="Published publications">
              <span class="detail-item__emphasis">{{
                Number(category?.publishedPublicationCount || 0)
              }}</span>
            </AppDetailItem>
            <AppDetailItem label="Visibility guidance" colSpan="full">
              <span class="detail-item__hint">{{
                categoryVisibility.description
              }}</span>
            </AppDetailItem>
          </AppDetailGrid>
        </AppDetailCard>

        <AppDetailCard title="Lifecycle Summary">
          <AppDetailGrid :columns="1">
            <AppDetailItem label="System key">
              <span class="detail-item__emphasis">{{ category?.systemKey || '-' }}</span>
            </AppDetailItem>
            <AppDetailItem label="Validity type">
              <span class="detail-item__emphasis">{{
                category?.validityType || '-'
              }}</span>
            </AppDetailItem>
            <AppDetailItem label="Last updated">
              <span class="detail-item__emphasis">{{
                formatDisplayDate(
                  category?.lastModifiedAt || category?.updatedAt || category?.createdAt,
                )
              }}</span>
            </AppDetailItem>
            <AppDetailItem label="Current workflow state">
              <span class="detail-item__emphasis">{{
                getStatusLabel(category?.effectiveStatus || category?.publicationStatus)
              }}</span>
            </AppDetailItem>
          </AppDetailGrid>
        </AppDetailCard>
      </AppBentoGrid>

      <EntityDetailsPanel
        :title="resolveLocalizedLabel(category, 'Category')"
        subtitle="Category metadata, lifecycle state, and publication counts."
        :record="category"
        :fields="categoryConfig.detailFields"
        :loading="catLoading"
        :error="catError"
      />

      <div class="enterprise-stack">
        <EntityTable
          title="Related Publications"
          description="Every publication linked to this category appears here so editors can manage the relationship directly."
          :records="publications"
          :columns="pubConfig.columns"
          :row-key="pubConfig.idKey"
          :loading="pubLoading"
          :error="pubError"
          :search-query="search"
          :show-search="true"
          :show-refresh="true"
          :show-create="canCreatePublication"
          create-label="Create Publication"
          :actions="publicationRowActions"
          @update:search-query="search = $event"
          @view="onPublicationView"
          @edit="onPublicationEdit"
          @row-click="onPublicationView"
          @create="goToCreatePublication"
          @refresh="loadPublications"
        />

        <el-alert
          v-if="!pubLoading && publications.length === 0"
          title="This category does not have any publications yet."
          type="info"
          show-icon
          :closable="false"
        >
          <template #default>
            <div class="enterprise-callout-row">
              <span
                >Create the first publication under this category to make the relationship
                explicit.</span
              >
              <el-button
                v-if="canCreatePublication"
                type="primary"
                plain
                @click="goToCreatePublication"
              >
                Create Publication
              </el-button>
            </div>
          </template>
        </el-alert>

        <TablePagination
          :pagination="pagination"
          :loading="pubLoading"
          @update:page="
            (page) => {
              pagination.page = page
              loadPublications()
            }
          "
          @update:limit="
            (limit) => {
              pagination.limit = limit
              pagination.page = 1
              loadPublications()
            }
          "
        />
      </div>
    </div>
  </PageWrapper>
</template>
