<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import CommissionFeatureCardsTab from '@/components/commission/details/CommissionFeatureCardsTab.vue'
import CommissionLeadershipStructureTab from '@/components/commission/details/CommissionLeadershipStructureTab.vue'
import CommissionMandateFunctionsTab from '@/components/commission/details/CommissionMandateFunctionsTab.vue'
import CommissionProfileMediaTab from '@/components/commission/details/CommissionProfileMediaTab.vue'
import CommissionWorkflowTab from '@/components/commission/details/CommissionWorkflowTab.vue'
import { useEditorialActions } from '@/composables/useEditorialActions'
import { useRouteAccess } from '@/composables/useRouteAccess'
import { extractMediaUrl } from '@/modules/crud/structuralContentForms'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { hasCommissionContent, mapCommissionToWizardForm } from '@/modules/commission/commissionWizard'
import { useLocale } from '@/composables/useLocale'
import { useCommissionStore } from '@/stores/useCommissionStore'

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
const content = computed(() => mapCommissionToWizardForm(record.value || {}))
const detailActions = computed(() => getRecordActions(record.value, { canView: false }))
const headerActions = computed(() => {
  const actions = detailActions.value.map((action) => ({
    ...action,
    group: action.group || 'workflow',
  }))

  actions.push({
    key: 'refreshCommission',
    label: 'Refresh Overview',
    group: 'workspace',
  })

  if (canOpenWizard.value) {
    actions.push({
      key: 'openWizard',
      label: wizardRouteName.value === 'commission.create' ? 'Create Commission' : 'Edit Commission',
      group: 'workspace',
    })
  }

  return actions
})

const wizardRouteName = computed(() =>
  hasCommissionContent(commission.value || {}) ? 'commission.edit' : 'commission.create',
)
const canOpenWizard = computed(() => canAccessRoute(wizardRouteName.value))
const coverImageUrl = computed(() => getMediaUrl(content.value.coverImage))
const galleryImages = computed(() => content.value.galleryImages || [])
const galleryItems = computed(() =>
  galleryImages.value
    .map((item, index) => ({
      key: item?.image?.fileId || item?.fileId || `gallery-${index}`,
      url: getMediaUrl(item?.image || item),
      alt: t(item?.altText || item?.caption || `Gallery image ${index + 1}`),
    }))
    .filter((item) => item.url),
)
const profileRows = computed(() => [
  { label: 'Commission Name', value: t(content.value.name) },
  { label: 'Slogan', value: t(content.value.slogan) },
  { label: 'Call to Action (CTA)', value: t(content.value.cta), colSpan: 'full' },
  { label: 'Welcome Note', value: t(content.value.welcomeNote), colSpan: 'full' },
  { label: 'Introduction', value: t(content.value.introduction), colSpan: 'full' },
  { label: 'History', value: t(content.value.history), colSpan: 'full' },
  { label: 'Outro', value: t(content.value.outro), colSpan: 'full' },
])
const mandateItems = computed(() => content.value.mandate?.items || [])
const commissionFunctions = computed(() =>
  (content.value.commissionFunctions || []).map((item) => t(item)),
)
const philosophyCards = computed(() =>
  (content.value.philosophies || []).map((item, index) => ({
    key: item.philosophyId || `philosophy-${index}`,
    title: t(item.title),
    description: t(item.description),
    mediaUrl: getMediaUrl(item.coverImage),
    fallback: String(index + 1),
  })),
)
const coreFunctionCards = computed(() =>
  (content.value.coreFunctions || []).map((item, index) => ({
    key: item.coreFunctionId || `core-function-${index}`,
    title: t(item.name),
    description: t(item.description),
    mediaUrl: getMediaUrl(item.coverImage),
    fallback: String(index + 1),
  })),
)
const directorGeneralName = computed(() => {
  const director = content.value.directorGeneral || {}

  return [
    director.prefix,
    director.firstName,
    director.middleName,
    director.surname,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'No Name Provided'
})
const directorGeneralRole = computed(() =>
  t(content.value.directorGeneral?.job, 'Director General'),
)
const directorGeneralContacts = computed(() => {
  const director = content.value.directorGeneral || {}
  return [director.email, director.phoneNumber].filter(Boolean)
})
const directorGeneralImageUrl = computed(() =>
  getMediaUrl(content.value.directorGeneral?.profilePicture),
)
const structureImageUrl = computed(() =>
  getMediaUrl(content.value.organizationStructure?.image),
)
const structureImageAlt = computed(() => t(content.value.organizationStructure?.imageAlt))
const mandateOverview = computed(() => t(content.value.mandate?.description))
const commissionerStatement = computed(() => t(content.value.commissionerStatement))
const featuredMessage = computed(() => t(content.value.dgStatement))
const directorGeneralStatement = computed(() => t(content.value.directorGeneral?.statement))
const directorGeneralBiography = computed(() => t(content.value.directorGeneral?.biography))

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

async function onHeaderAction(action) {
  if (!action) return

  if (action.key === 'refreshCommission') {
    await loadCommission()
    return
  }

  if (action.key === 'openWizard') {
    await goToWizard()
    return
  }

  await onAction(action)
}

async function goBack() {
  if (window.history.length > 1) {
    await router.back()
    return
  }

  if (canAccessRoute('dashboard.overview')) {
    await router.push({ name: 'dashboard.overview' })
  }
}

function getMediaUrl(media) {
  return extractMediaUrl(media)
}

function t(value, fallback = '-') {
  return translate(value) || fallback
}

onMounted(loadCommission)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        title="Commission Overview"
        description="Review the current commission payload that feeds the public FCC website."
        :actions="headerActions"
        :loading="loading"
        @select="onHeaderAction"
        @back="goBack"
      />
    </template>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="app-inline-alert"
    />

    <el-skeleton v-if="loading" :rows="10" animated />

    <el-tabs
      v-else-if="commission"
      v-model="activeTab"
      tab-position="left"
      class="fcc-vertical-tabs"
    >
      <el-tab-pane label="Workflow" name="workflow">
        <CommissionWorkflowTab :record="record" />
      </el-tab-pane>

      <el-tab-pane label="Profile & Media" name="profile">
        <CommissionProfileMediaTab
          :profile-rows="profileRows"
          :cover-image-url="coverImageUrl"
          :gallery-items="galleryItems"
        />
      </el-tab-pane>

      <el-tab-pane label="Mandate & Functions" name="mandate">
        <CommissionMandateFunctionsTab
          :mandate-overview="mandateOverview"
          :mandate-items="mandateItems.map((item) => t(item))"
          :commissioner-statement="commissionerStatement"
          :commission-functions="commissionFunctions"
        />
      </el-tab-pane>

      <el-tab-pane label="Philosophies & Core Values" name="philosophies">
        <CommissionFeatureCardsTab
          :philosophy-cards="philosophyCards"
          :core-function-cards="coreFunctionCards"
        />
      </el-tab-pane>

      <el-tab-pane label="Leadership & Structure" name="leadership">
        <CommissionLeadershipStructureTab
          :director-general-name="directorGeneralName"
          :director-general-role="directorGeneralRole"
          :director-general-contacts="directorGeneralContacts"
          :director-general-image-url="directorGeneralImageUrl"
          :featured-message="featuredMessage"
          :profile-statement="directorGeneralStatement"
          :biography="directorGeneralBiography"
          :structure-image-url="structureImageUrl"
          :structure-image-alt="structureImageAlt"
        />
      </el-tab-pane>
    </el-tabs>

    <div v-else class="enterprise-empty-state">
      <div class="enterprise-empty-state__icon">
        <span class="commission-empty-state__icon-mark">!</span>
      </div>
      <h3 class="enterprise-empty-state__title">No Commission Content</h3>
      <p class="enterprise-empty-state__description">
        The singleton commission record hasn't been created yet. Click "Create Commission" to
        establish the public profile.
      </p>
    </div>
  </PageWrapper>
</template>
