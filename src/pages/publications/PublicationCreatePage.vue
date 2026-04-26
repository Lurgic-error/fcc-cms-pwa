<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { usePublicationCategoriesStore } from '@/stores/publications/usePublicationCategoriesStore'
import { buildCategorySummary } from '@/utils/publicationsWorkspace'
import { extractErrorMessage } from '@/utils/httpError'

const config = getResourceConfig('publications')
const route = useRoute()
const router = useRouter()
const categoriesStore = usePublicationCategoriesStore()

const loading = ref(false)
const error = ref('')
const categories = ref([])
const headerActions = Object.freeze([{ key: 'createCategory', label: 'Create Category First' }])

const categorySummary = computed(() => buildCategorySummary(categories.value))
const stats = computed(() => [
  { key: 'available', label: 'Available Categories', value: categorySummary.value.total },
  { key: 'published', label: 'Published Categories', value: categorySummary.value.published },
  { key: 'review', label: 'Under Review', value: categorySummary.value.submitted },
  { key: 'empty', label: 'Categories With No Publications', value: categorySummary.value.empty },
])

async function loadCategories() {
  loading.value = true
  error.value = ''
  try {
    categories.value = await categoriesStore.listCategories({ page: 1, limit: 200 })
  } catch (err) {
    error.value = extractErrorMessage(err, 'Failed to load publication categories.')
  } finally {
    loading.value = false
  }
}

function goToCategories() {
  router.push({ name: 'publicationCategories.list' })
}

function goToCreateCategory() {
  router.push({
    name: 'publicationCategories.create',
    query: {
      returnTo: route.fullPath,
      returnField: 'category',
    },
  })
}

function onHeaderAction(action) {
  if (action?.key !== 'createCategory') return
  goToCreateCategory()
}

onMounted(async () => {
  if (route.query?.categoryId && !route.query?.category) {
    await router.replace({
      name: String(route.name || 'publications.create'),
      query: {
        ...route.query,
        category: route.query.categoryId,
      },
    })
  }
  await loadCategories()
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Create Publication"
        title="Add a publication under a category"
        description="Publications always belong to one category. If the right category is missing, create it first and this form will reopen with the new category selected."
        :actions="headerActions"
        @select="onHeaderAction"
        @back="goToCategories"
      />
    </template>

    <div class="enterprise-stack">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

      <el-alert
        v-else-if="!loading && !categories.length"
        title="No publication categories are available yet."
        type="warning"
        show-icon
        :closable="false"
      >
        <template #default>
          <div class="publication-create__empty-state">
            <span>
              Create the parent category first, then continue here to create the publication under
              it.
            </span>
            <el-button type="warning" plain @click="goToCreateCategory">Create Category</el-button>
          </div>
        </template>
      </el-alert>

      <template v-if="categories.length">
        <OverviewStatsGrid :stats="stats" />

        <el-alert
          type="info"
          show-icon
          :closable="false"
          title="Publishing rule"
          description="A publication can only go live after its category has been approved. When you publish a publication, the system will publish its category automatically if needed."
        />

        <ResourceFormPage :config="config" mode="create" />
      </template>
    </div>
  </PageWrapper>
</template>
