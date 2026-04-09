<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import EntityActionsDropdown from '@/components/workflow/EntityActionsDropdown.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useEditorialActions } from '@/composables/useEditorialActions'
import { useRouteAccess } from '@/composables/useRouteAccess'
import { extractMediaUrl } from '@/modules/crud/structuralContentForms'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { hasCommissionContent } from '@/modules/commission/commissionWizard'
import { useLocale } from '@/composables/useLocale'
import { useCommissionStore } from '@/stores/useCommissionStore'
import { formatDisplayDate, getStatusLabel } from '@/utils/adminPresentation'

const router = useRouter()
const { translate } = useLocale()
const commissionConfig = getResourceConfig('commission')
const commissionStore = useCommissionStore()
const { canAccessRoute } = useRouteAccess()
const { commission, loading, error } = storeToRefs(commissionStore)
const { executeRecordAction, getRecordActions } = useEditorialActions(commissionConfig)
const activeTab = ref('profile')

async function loadCommission() {
  try {
    await commissionStore.fetchCommission()
  } catch {
    // Error is handled by the store
  }
}

const record = computed(() => commission.value || {})
const detailActions = computed(() => getRecordActions(record.value, { canView: false }))

const wizardRouteName = computed(() =>
  hasCommissionContent(commission.value || {}) ? 'commission.edit' : 'commission.create',
)
const canOpenWizard = computed(() => canAccessRoute(wizardRouteName.value))

async function goToWizard() {
  if (!canOpenWizard.value) return
  await router.push({ name: wizardRouteName.value })
}

async function runCommissionWorkflow(actionKey, id, payload = {}) {
  switch (actionKey) {
    case 'reject':
      return commissionStore.reject(id, payload.reason)
    case 'archive':
      return commissionStore.archive(id, payload.reason)
    case 'softDelete':
      return commissionStore.softDelete(id, payload.reason)
    case 'schedulePublish':
      return commissionStore.schedulePublish(id, payload)
    case 'scheduleUnpublish':
      return commissionStore.scheduleUnpublish(id, payload)
    case 'delete':
      return commissionStore.remove(id)
    default:
      return commissionStore[actionKey]?.(id)
  }
}

async function onAction(action) {
  await executeRecordAction(action, record.value, {
    runWorkflow: runCommissionWorkflow,
    reload: loadCommission,
  })
}

function getMediaUrl(media) {
  return extractMediaUrl(media)
}

function t(value) {
  return translate(value) || '-'
}

onMounted(loadCommission)
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          <h1 class="page-title fcc-page-title">Commission Overview</h1>
          <p class="page-description fcc-page-subtitle mt-1">
            Review the current commission payload that feeds the public FCC website.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <el-button :loading="loading" @click="loadCommission" plain round> Refresh </el-button>
          <EntityActionsDropdown
            :actions="detailActions"
            label="Actions"
            type="primary"
            :loading="loading"
            @select="onAction"
          />
          <el-button v-if="canOpenWizard" type="primary" @click="goToWizard" round>
            {{ wizardRouteName === 'commission.create' ? 'Create Commission' : 'Edit Commission' }}
          </el-button>
        </div>
      </div>
    </template>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-4" />

    <el-skeleton v-if="loading" :rows="10" animated />

    <el-tabs
      v-else-if="commission"
      v-model="activeTab"
      tab-position="left"
      class="commission-vertical-tabs"
    >
      <el-tab-pane label="Workflow" name="workflow">
        <AppBentoGrid columns="2">
          <AppDetailCard title="Workflow State" subtitle="Editorial and lifecycle state">
            <AppDetailGrid :columns="1">
              <AppDetailItem label="Current Status">
                <StatusBadge :value="record.effectiveStatus || record.publicationStatus" />
              </AppDetailItem>
              <AppDetailItem label="Status Label">
                {{ getStatusLabel(record.effectiveStatus || record.publicationStatus) }}
              </AppDetailItem>
              <AppDetailItem
                label="Scheduled Publish"
                :value="formatDisplayDate(record.scheduledPublishAt)"
              />
              <AppDetailItem
                label="Scheduled Unpublish"
                :value="formatDisplayDate(record.scheduledUnpublishAt)"
              />
              <AppDetailItem label="Archived" :value="record.isArchived ? 'Yes' : 'No'" />
              <AppDetailItem label="Deleted" :value="record.isDeleted ? 'Yes' : 'No'" />
            </AppDetailGrid>
          </AppDetailCard>

          <AppDetailCard title="Workflow Metadata" subtitle="Audit trail for the current state">
            <AppDetailGrid :columns="1">
              <AppDetailItem label="Submitted At" :value="formatDisplayDate(record.submittedAt)" />
              <AppDetailItem label="Approved At" :value="formatDisplayDate(record.approvedAt)" />
              <AppDetailItem label="Rejected At" :value="formatDisplayDate(record.rejectedAt)" />
              <AppDetailItem label="Published At" :value="formatDisplayDate(record.publishedAt)" />
              <AppDetailItem
                label="Unpublished At"
                :value="formatDisplayDate(record.unpublishedAt)"
              />
              <AppDetailItem label="Archived At" :value="formatDisplayDate(record.archivedAt)" />
              <AppDetailItem label="Deleted At" :value="formatDisplayDate(record.deletedAt)" />
              <AppDetailItem
                label="Last Modified"
                :value="formatDisplayDate(record.lastModifiedAt || record.updatedAt)"
              />
            </AppDetailGrid>
          </AppDetailCard>
        </AppBentoGrid>
      </el-tab-pane>

      <el-tab-pane label="Profile & Media" name="profile">
        <div class="space-y-6">
          <!-- Basic Profile -->
          <AppDetailCard title="Basic Profile" subtitle="General identity and welcome information">
            <AppDetailGrid :columns="2">
              <AppDetailItem label="Commission Name" :value="t(record.name)" />
              <AppDetailItem label="Slogan" :value="t(record.slogan)" />
              <AppDetailItem label="Call to Action (CTA)" :value="t(record.cta)" colSpan="full" />
              <AppDetailItem label="Welcome Note" :value="t(record.welcomeNote)" colSpan="full" />
              <AppDetailItem label="Introduction" :value="t(record.introduction)" colSpan="full" />
              <AppDetailItem label="History" :value="t(record.history)" colSpan="full" />
              <AppDetailItem label="Outro" :value="t(record.outro)" colSpan="full" />
            </AppDetailGrid>
          </AppDetailCard>

          <!-- Featured Media -->
          <AppDetailCard title="Featured Media" subtitle="Cover image and gallery">
            <AppDetailGrid :columns="1">
              <AppDetailItem label="Cover Image">
                <div
                  v-if="getMediaUrl(record.coverImage)"
                  class="mt-2 rounded-[var(--fcc-radius-lg)] overflow-hidden border border-[var(--fcc-border)] inline-block"
                >
                  <img :src="getMediaUrl(record.coverImage)" class="h-64 w-auto object-cover" />
                </div>
                <span v-else class="text-slate-400 italic block mt-1">No cover image</span>
              </AppDetailItem>

              <AppDetailItem label="Gallery Images">
                <div v-if="record.galleryImages?.length" class="flex flex-wrap gap-4 mt-2">
                  <div
                    v-for="(img, i) in record.galleryImages"
                    :key="i"
                    class="rounded-[var(--fcc-radius-md)] overflow-hidden border border-[var(--fcc-border)]"
                  >
                    <img :src="getMediaUrl(img.image)" class="h-32 w-48 object-cover" />
                  </div>
                </div>
                <span v-else class="text-slate-400 italic block mt-1">No gallery images</span>
              </AppDetailItem>
            </AppDetailGrid>
          </AppDetailCard>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Mandate & Functions" name="mandate">
        <div class="space-y-6">
          <!-- Mandate -->
          <AppDetailCard title="Mandate" subtitle="Commission mandate and items">
            <AppDetailGrid :columns="1">
              <AppDetailItem label="Overview" :value="t(record.mandate?.description)" />
              <AppDetailItem label="Mandate Items">
                <ul
                  v-if="record.mandate?.items?.length"
                  class="list-disc pl-5 mt-2 space-y-2 text-[var(--fcc-text)]"
                >
                  <li v-for="(item, i) in record.mandate?.items" :key="i" class="leading-relaxed">
                    {{ t(item) }}
                  </li>
                </ul>
                <span v-else class="text-slate-400 italic block mt-1">No mandate items listed</span>
              </AppDetailItem>
            </AppDetailGrid>
          </AppDetailCard>

          <!-- Statements & Functions -->
          <AppDetailCard
            title="Public Functions"
            subtitle="Commissioner statements and public functions"
          >
            <AppDetailGrid :columns="1">
              <AppDetailItem
                label="Commissioner Statement"
                :value="t(record.commissionerStatement)"
              />
              <AppDetailItem label="Commission Functions">
                <ul
                  v-if="record.commissionFunctions?.length"
                  class="list-disc pl-5 mt-2 space-y-2 text-[var(--fcc-text)]"
                >
                  <li
                    v-for="(fn, i) in record.commissionFunctions"
                    :key="i"
                    class="leading-relaxed"
                  >
                    {{ t(fn) }}
                  </li>
                </ul>
                <span v-else class="text-slate-400 italic block mt-1">No functions listed</span>
              </AppDetailItem>
            </AppDetailGrid>
          </AppDetailCard>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Philosophies & Core Values" name="philosophies">
        <div class="space-y-6">
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AppDetailCard title="Philosophies" subtitle="Vision, Mission, Core Values">
              <div class="space-y-4 mt-2">
                <div
                  v-for="(phil, i) in record.philosophies"
                  :key="i"
                  class="p-5 border border-[var(--fcc-border)] rounded-[var(--fcc-radius-lg)] bg-[var(--fcc-surface-muted)] flex gap-5 items-start transition-shadow hover:shadow-sm"
                >
                  <div
                    class="shrink-0 rounded-[var(--fcc-radius-md)] overflow-hidden border border-[var(--fcc-border)] bg-white"
                  >
                    <img
                      v-if="getMediaUrl(phil.coverImageUrl || phil.coverImage)"
                      :src="getMediaUrl(phil.coverImageUrl || phil.coverImage)"
                      class="h-16 w-16 object-cover"
                    />
                    <div
                      v-else
                      class="h-16 w-16 flex items-center justify-center bg-gray-100 text-gray-400 text-xl font-bold"
                    >
                      {{ i + 1 }}
                    </div>
                  </div>
                  <div>
                    <h4 class="text-[var(--fcc-text)] font-bold text-base">
                      {{ t({ en: phil.titleEn, sw: phil.titleSw }) }}
                    </h4>
                    <p class="text-[var(--fcc-text-muted)] text-sm mt-1.5 leading-relaxed">
                      {{ t({ en: phil.descriptionEn, sw: phil.descriptionSw }) }}
                    </p>
                  </div>
                </div>
                <p v-if="!record.philosophies?.length" class="text-slate-400 italic">
                  No philosophies added
                </p>
              </div>
            </AppDetailCard>

            <AppDetailCard title="Core Functions" subtitle="Main functional areas">
              <div class="space-y-4 mt-2">
                <div
                  v-for="(cf, i) in record.coreFunctions"
                  :key="i"
                  class="p-5 border border-[var(--fcc-border)] rounded-[var(--fcc-radius-lg)] bg-[var(--fcc-surface-muted)] flex gap-5 items-start transition-shadow hover:shadow-sm"
                >
                  <div
                    class="shrink-0 rounded-[var(--fcc-radius-md)] overflow-hidden border border-[var(--fcc-border)] bg-white"
                  >
                    <img
                      v-if="getMediaUrl(cf.coverImageUrl || cf.coverImage)"
                      :src="getMediaUrl(cf.coverImageUrl || cf.coverImage)"
                      class="h-16 w-16 object-cover"
                    />
                    <div
                      v-else
                      class="h-16 w-16 flex items-center justify-center bg-gray-100 text-gray-400 text-xl font-bold"
                    >
                      {{ i + 1 }}
                    </div>
                  </div>
                  <div>
                    <h4 class="text-[var(--fcc-text)] font-bold text-base">
                      {{ t({ en: cf.titleEn, sw: cf.titleSw }) }}
                    </h4>
                    <p class="text-[var(--fcc-text-muted)] text-sm mt-1.5 leading-relaxed">
                      {{ t({ en: cf.descriptionEn, sw: cf.descriptionSw }) }}
                    </p>
                  </div>
                </div>
                <p v-if="!record.coreFunctions?.length" class="text-slate-400 italic">
                  No core functions added
                </p>
              </div>
            </AppDetailCard>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Leadership & Structure" name="leadership">
        <div class="space-y-6">
          <!-- Director General -->
          <section
            class="border border-[var(--fcc-border)] rounded-[var(--fcc-radius-xl)] bg-[var(--fcc-surface)] shadow-sm overflow-hidden"
          >
            <div
              class="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-[var(--fcc-border)] bg-[var(--fcc-surface-muted)]"
            >
              <div class="shrink-0 relative">
                <img
                  v-if="getMediaUrl(record.directorGeneral?.profilePicture)"
                  :src="getMediaUrl(record.directorGeneral?.profilePicture)"
                  class="h-40 w-40 object-cover rounded-full border-4 border-white shadow-md"
                />
                <div
                  v-else
                  class="h-40 w-40 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-gray-400 shadow-md text-4xl font-bold"
                >
                  DG
                </div>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-2xl md:text-3xl font-bold text-[var(--fcc-text)]">
                  {{
                    `${record.directorGeneral?.prefix || ''} ${record.directorGeneral?.firstName || ''} ${record.directorGeneral?.middleName || ''} ${record.directorGeneral?.surname || ''}`.trim() ||
                    'No Name Provided'
                  }}
                </h3>
                <p class="text-[var(--fcc-primary-600)] font-semibold text-lg md:text-xl mt-1.5">
                  {{ t(record.directorGeneral?.job) || 'Director General' }}
                </p>

                <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <div
                    v-if="record.directorGeneral?.email"
                    class="bg-white border border-[var(--fcc-border)] px-4 py-2 rounded-[var(--fcc-radius-pill)] text-sm font-medium text-[var(--fcc-text)] shadow-sm"
                  >
                    {{ record.directorGeneral.email }}
                  </div>
                  <div
                    v-if="record.directorGeneral?.phoneNumber"
                    class="bg-white border border-[var(--fcc-border)] px-4 py-2 rounded-[var(--fcc-radius-pill)] text-sm font-medium text-[var(--fcc-text)] shadow-sm"
                  >
                    {{ record.directorGeneral.phoneNumber }}
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6 md:p-8">
              <AppDetailGrid :columns="1">
                <AppDetailItem label="Featured Message" :value="t(record.dgStatement)" />
                <AppDetailItem
                  label="Profile Statement"
                  :value="t(record.directorGeneral?.statement)"
                />
                <AppDetailItem label="Biography" :value="t(record.directorGeneral?.biography)" />
              </AppDetailGrid>
            </div>
          </section>

          <!-- Organization Structure -->
          <AppDetailCard title="Organization Structure" subtitle="Hierarchy diagram">
            <AppDetailGrid :columns="1">
              <AppDetailItem
                label="Image Alt Text"
                :value="t(record.organizationStructure?.imageAlt)"
              />
              <AppDetailItem label="Structure Diagram">
                <div
                  v-if="getMediaUrl(record.organizationStructure?.image)"
                  class="mt-2 rounded-[var(--fcc-radius-lg)] overflow-hidden border border-[var(--fcc-border)] inline-block bg-[var(--fcc-surface-muted)] p-4"
                >
                  <img
                    :src="getMediaUrl(record.organizationStructure?.image)"
                    class="max-w-full h-auto object-contain"
                  />
                </div>
                <span v-else class="text-slate-400 italic block mt-1">No structure image</span>
              </AppDetailItem>
            </AppDetailGrid>
          </AppDetailCard>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div
      v-else
      class="py-16 px-6 text-center border border-[var(--fcc-border)] rounded-[var(--fcc-radius-xl)] bg-[var(--fcc-surface)] shadow-sm"
    >
      <div
        class="h-16 w-16 mx-auto bg-[var(--fcc-primary-50)] text-[var(--fcc-primary-500)] rounded-full flex items-center justify-center mb-4"
      >
        <span class="text-2xl font-bold">!</span>
      </div>
      <h3 class="text-lg font-bold text-[var(--fcc-text)]">No Commission Content</h3>
      <p class="text-[var(--fcc-text-muted)] mt-2 max-w-md mx-auto">
        The singleton commission record hasn't been created yet. Click "Create Commission" to
        establish the public profile.
      </p>
    </div>
  </PageWrapper>
</template>

<style scoped>
.commission-vertical-tabs {
  border-color: var(--fcc-border);
  border-radius: var(--fcc-radius-xl);
  background: var(--fcc-surface);
  box-shadow: var(--fcc-shadow-base);
  display: flex;
  min-height: 600px;
  overflow: hidden;
}

.commission-vertical-tabs :deep(.el-tabs__header.is-left) {
  background-color: var(--fcc-surface-muted);
  border-right: 1px solid var(--fcc-border);
  margin-right: 0;
  padding: 1.5rem 0;
  width: 260px;
  flex-shrink: 0;
}

.commission-vertical-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.commission-vertical-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.commission-vertical-tabs :deep(.el-tabs__item.is-left) {
  text-align: left;
  justify-content: flex-start;
  padding: 0 1.5rem !important;
  height: 3.5rem;
  line-height: 3.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--fcc-text-muted);
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  margin-bottom: 0.25rem;
}

.commission-vertical-tabs :deep(.el-tabs__item.is-left:hover) {
  color: var(--fcc-primary-600);
  background-color: color-mix(in srgb, var(--fcc-primary-50) 40%, transparent);
}

.commission-vertical-tabs :deep(.el-tabs__item.is-left.is-active) {
  color: var(--fcc-primary-700);
  background-color: color-mix(in srgb, var(--fcc-primary-50) 80%, transparent);
  border-left-color: var(--fcc-primary-600);
}

.commission-vertical-tabs :deep(.el-tabs__content) {
  flex: 1;
  padding: 2rem;
  min-width: 0;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .commission-vertical-tabs {
    flex-direction: column;
  }
  .commission-vertical-tabs :deep(.el-tabs__header.is-left) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--fcc-border);
    padding: 0;
  }
  .commission-vertical-tabs :deep(.el-tabs__nav-scroll) {
    overflow-x: auto;
  }
  .commission-vertical-tabs :deep(.el-tabs__nav) {
    display: flex;
    flex-wrap: nowrap;
  }
  .commission-vertical-tabs :deep(.el-tabs__item.is-left) {
    border-left: none;
    border-bottom: 3px solid transparent;
    height: 3rem;
    line-height: 3rem;
    white-space: nowrap;
  }
  .commission-vertical-tabs :deep(.el-tabs__item.is-left.is-active) {
    border-left-color: transparent;
    border-bottom-color: var(--fcc-primary-600);
  }
  .commission-vertical-tabs :deep(.el-tabs__content) {
    padding: 1.25rem;
  }
}
</style>
