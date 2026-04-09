<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import EntityDetailsPanel from '@/components/enterprise/EntityDetailsPanel.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EntityActionsDropdown from '@/components/workflow/EntityActionsDropdown.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { useEditorialActions } from '@/composables/useEditorialActions'
import { useEntityCrud } from '@/composables/useEntityCrud'
import { usePublicationCategoriesStore } from '@/stores/publications/usePublicationCategoriesStore'
import { formatDisplayDate, getStatusLabel } from '@/utils/adminPresentation'
import {
  buildPublicationVisibility,
  resolveCategoryId,
  resolveLocalizedLabel,
} from '@/utils/publicationsWorkspace'
import { extractErrorMessage } from '@/utils/httpError'

const config = getResourceConfig('publications')
const route = useRoute()
const router = useRouter()
const categoriesStore = usePublicationCategoriesStore()

const { entity: publication, loading, error, fetchOne, runWorkflow } = useEntityCrud(config.adapter)
const { executeRecordAction, getRecordActions } = useEditorialActions(config)

const category = ref(null)
const categoryError = ref('')

const publicationId = computed(() => route.params?.publicationId || '')
const visibility = computed(() => buildPublicationVisibility(publication.value, category.value))
const categoryStatus = computed(
  () => category.value?.effectiveStatus || category.value?.publicationStatus || '',
)
const detailActions = computed(() => getRecordActions(publication.value, { canView: false }))

async function loadPublication() {
  if (!publicationId.value) return
  await fetchOne(publicationId.value)

  const categoryId = resolveCategoryId(publication.value)
  category.value = null
  categoryError.value = ''

  if (!categoryId) return

  try {
    category.value = await categoriesStore.findCategory(categoryId)
  } catch (err) {
    categoryError.value = extractErrorMessage(err, 'Failed to load the assigned category.')
  }
}

function goToList() {
  router.push({ name: config.routes.list })
}

function goToCategory(categoryId) {
  if (!categoryId) return
  router.push({ name: 'publicationCategories.details', params: { categoryId } })
}

async function onAction(action) {
  const completed = await executeRecordAction(action, publication.value, {
    runWorkflow,
    reload: loadPublication,
  })

  if (completed && action?.key === 'delete') {
    goToList()
  }
}

onMounted(loadPublication)

watch(publicationId, (nextId, previousId) => {
  if (!nextId || nextId === previousId) return
  loadPublication()
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <h1 class="page-title fcc-page-title">
            {{ resolveLocalizedLabel(publication, 'Publication') }}
          </h1>
          <p class="page-description fcc-page-subtitle mt-1">
            Review category assignment, lifecycle state, and whether this publication is actually
            visible on the public website.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <el-button plain round @click="goToList">Back</el-button>
          <EntityActionsDropdown
            :actions="detailActions"
            label="Actions"
            type="primary"
            :loading="loading"
            @select="onAction"
          />
        </div>
      </div>
    </template>

    <div class="space-y-6 mt-4">
      <el-alert
        v-if="categoryError"
        :title="categoryError"
        type="error"
        show-icon
        :closable="false"
      />

      <el-alert
        v-if="visibility.label !== 'Public'"
        :title="visibility.label"
        :type="visibility.tone === 'danger' ? 'error' : visibility.tone"
        show-icon
        :closable="false"
        :description="visibility.description"
      />

      <AppBentoGrid columns="2">
        <AppDetailCard title="Website Visibility">
          <template #header-actions>
            <el-tag :type="visibility.tone" effect="light" round size="small">
              {{ visibility.label }}
            </el-tag>
          </template>

          <AppDetailGrid :columns="1">
            <AppDetailItem label="Publication status">
              <StatusBadge
                :value="publication?.effectiveStatus || publication?.publicationStatus"
              />
            </AppDetailItem>
            <AppDetailItem label="Category status">
              <StatusBadge :value="categoryStatus" :label="getStatusLabel(categoryStatus)" />
            </AppDetailItem>
            <AppDetailItem colSpan="full">
              <span class="text-sm italic text-[var(--fcc-text-muted)]">{{
                visibility.description
              }}</span>
            </AppDetailItem>
          </AppDetailGrid>
        </AppDetailCard>

        <AppDetailCard title="Lifecycle Summary">
          <AppDetailGrid :columns="1">
            <AppDetailItem label="Issue date">
              <span class="font-bold text-[var(--fcc-text)]">{{
                formatDisplayDate(publication?.issueDate, { dateOnly: true })
              }}</span>
            </AppDetailItem>
            <AppDetailItem label="Visible from">
              <span class="font-bold text-[var(--fcc-text)]">{{
                formatDisplayDate(publication?.validFrom, { dateOnly: true })
              }}</span>
            </AppDetailItem>
            <AppDetailItem label="Visible until">
              <span class="font-bold text-[var(--fcc-text)]">{{
                formatDisplayDate(publication?.validUntil, { dateOnly: true })
              }}</span>
            </AppDetailItem>
            <AppDetailItem label="Last updated">
              <span class="font-bold text-[var(--fcc-text)]">{{
                formatDisplayDate(
                  publication?.lastModifiedAt || publication?.updatedAt || publication?.createdAt,
                )
              }}</span>
            </AppDetailItem>
          </AppDetailGrid>
        </AppDetailCard>
      </AppBentoGrid>

      <EntityDetailsPanel
        :title="resolveLocalizedLabel(publication, 'Publication')"
        subtitle="Publication metadata, category context, and workflow state."
        :record="publication"
        :fields="config.detailFields"
        :loading="loading"
        :error="error"
      >
        <template #field-category="{ record, value }">
          <el-button
            v-if="record?.category"
            type="primary"
            link
            class="!p-0 h-auto font-medium"
            @click="goToCategory(resolveCategoryId(record))"
          >
            {{ value.formattedValue }}
          </el-button>
          <span v-else>{{ value.formattedValue }}</span>
        </template>
      </EntityDetailsPanel>
    </div>
  </PageWrapper>
</template>
