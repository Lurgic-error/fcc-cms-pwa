<script setup>
import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import { useRouteAccess } from '@/composables/useRouteAccess'
import { resolveResourceViewConfig } from '@/modules/crud/resourceConfigs'
import { formatDisplayValue, resolveFieldValue } from '@/utils/adminPresentation'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { canAccessRoute } = useRouteAccess()

const routeName = computed(() => String(route.name || ''))
const resolved = computed(() => resolveResourceViewConfig(routeName.value, route.meta?.page))
const config = computed(() => resolved.value.config)
const stateKey = computed(() => resolved.value.stateKey)

const entity = ref(null)
const loading = ref(false)
const loadError = ref('')

const routeParamKey = computed(() => {
  const dynamicParam = Object.keys(route.params || {})[0]
  return dynamicParam || config.value.routeParam || 'id'
})

const recordId = computed(() => {
  const key = routeParamKey.value
  return key ? route.params?.[key] || '' : ''
})

const listRouteName = computed(() => config.value.routes?.list || '')
const createRouteName = computed(() => config.value.routes?.create || '')
const detailsRouteName = computed(() => config.value.routes?.details || '')
const editRouteName = computed(() => config.value.routes?.edit || '')
const hasSingletonRecord = computed(() => Boolean(config.value?.singleton))

const canGoList = computed(() => canAccessRoute(listRouteName.value))
const canCreate = computed(() => canAccessRoute(createRouteName.value))
const canGoDetails = computed(
  () =>
    (Boolean(recordId.value) || hasSingletonRecord.value) &&
    routeName.value !== detailsRouteName.value &&
    canAccessRoute(detailsRouteName.value),
)
const canGoEdit = computed(
  () =>
    (Boolean(recordId.value) || hasSingletonRecord.value) &&
    routeName.value !== editRouteName.value &&
    canAccessRoute(editRouteName.value),
)

const canLoadEntity = computed(() => {
  return (
    (Boolean(recordId.value) || hasSingletonRecord.value) &&
    typeof config.value?.adapter?.find === 'function'
  )
})

const WORKFLOW_NOTES = Object.freeze({
  reviewQueue: {
    step: 'Review pending submissions and approve/reject against policy.',
    outcome: 'Approved records can move to publish flow with complete audit trace.',
  },
  archive: {
    step: 'Browse archived records and verify retention/compliance metadata.',
    outcome: 'Restore selected records when reactivation is required.',
  },
  history: {
    step: 'Inspect lifecycle timeline, edits, and workflow transitions.',
    outcome: 'Use history evidence for compliance and incident response.',
  },
  schedule: {
    step: 'Plan publication windows and release sequencing.',
    outcome: 'Records are released with predictable timing and governance control.',
  },
  assignments: {
    step: 'Assign owners and execution roles for this record.',
    outcome: 'Ownership is visible and accountable across teams.',
  },
  ownership: {
    step: 'Define responsible unit, fallback owner, and escalation path.',
    outcome: 'Operational handoffs are clear and measurable.',
  },
  management: {
    step: 'Coordinate management actions and dependency changes.',
    outcome: 'Cross-team updates remain synchronized and traceable.',
  },
  structure: {
    step: 'Review structural relationships and hierarchy mapping.',
    outcome: 'Org structure remains accurate for downstream modules.',
  },
  membership: {
    step: 'Maintain membership entries and role composition.',
    outcome: 'Committee/working group composition stays current.',
  },
  activity: {
    step: 'Track user and system actions linked to this record.',
    outcome: 'Activity signals support monitoring and investigations.',
  },
  roles: {
    step: 'Review role allocations and privilege boundaries.',
    outcome: 'Access control remains least-privilege and auditable.',
  },
  response: {
    step: 'Capture and update official response actions.',
    outcome: 'Response workflow is complete and traceable.',
  },
  rules: {
    step: 'Edit publishing rules and guardrails.',
    outcome: 'Distribution remains policy-compliant across channels.',
  },
  usage: {
    step: 'Inspect where this resource is consumed.',
    outcome: 'Changes can be rolled out without breaking dependencies.',
  },
  upload: {
    step: 'Submit new assets with required metadata.',
    outcome: 'Uploaded assets are immediately discoverable and manageable.',
  },
  library: {
    step: 'Manage library-wide curation and retrieval.',
    outcome: 'Teams can find approved assets quickly.',
  },
})

const workflowNote = computed(() => {
  return (
    WORKFLOW_NOTES[stateKey.value] || {
      step: 'Execute operational actions for this module using reusable controls.',
      outcome: 'Workflow actions are standardized and traceable.',
    }
  )
})

const recordSnapshot = computed(() => {
  if (!entity.value || !Array.isArray(config.value?.detailFields)) return []

  return config.value.detailFields
    .slice(0, 8)
    .map((field) => {
      const value =
        typeof field?.formatter === 'function'
          ? field.formatter(entity.value)
          : formatDisplayValue(resolveFieldValue(entity.value, field), field)

      return {
        label: field?.label || field?.key || 'Field',
        value: value || '-',
      }
    })
    .filter((row) => row.value !== '-')
})

const stateLabel = computed(() => {
  return String(stateKey.value || 'state')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
})

const contextRows = computed(() => {
  const rows = [
    { label: 'Module', value: config.value.label },
    { label: 'State', value: stateLabel.value },
    { label: 'Route', value: routeName.value || '-' },
  ]

  if (recordId.value) {
    rows.push({ label: config.value.singular + ' ID', value: String(recordId.value) })
  } else if (hasSingletonRecord.value) {
    rows.push({ label: 'Singleton Record', value: 'Yes' })
  }

  rows.push({ label: 'Has API Adapter', value: config.value.adapter ? 'Yes' : 'No' })

  return rows
})

const headerActions = computed(() => {
  const actions = []

  if (canCreate.value) {
    actions.push({ key: 'create', label: `Create ${config.value.singular}` })
  }

  if (canGoDetails.value) {
    actions.push({ key: 'details', label: 'View Details' })
  }

  if (canGoEdit.value) {
    actions.push({ key: 'edit', label: 'Edit' })
  }

  return actions
})

function withRecordParams() {
  if (recordId.value) return { [routeParamKey.value]: recordId.value }
  return {}
}

async function loadEntity() {
  if (!canLoadEntity.value) {
    entity.value = null
    loadError.value = ''
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const response = recordId.value
      ? await config.value.adapter.find(recordId.value)
      : await config.value.adapter.find()
    const mapped =
      typeof config.value.adapter?.mapEntity === 'function'
        ? config.value.adapter.mapEntity(response)
        : response

    entity.value = mapped || null
  } catch (error) {
    loadError.value =
      error?.response?.data?.error ||
      error?.message ||
      'Unable to load record context for this action.'
    entity.value = null
  } finally {
    loading.value = false
  }
}

async function goToList() {
  if (!canGoList.value) return
  await router.push({ name: listRouteName.value })
}

async function goToCreate() {
  if (!canCreate.value) return
  await router.push({ name: createRouteName.value })
}

async function goToDetails() {
  if (!canGoDetails.value) return
  await router.push({ name: detailsRouteName.value, params: withRecordParams() })
}

async function goToEdit() {
  if (!canGoEdit.value) return
  await router.push({ name: editRouteName.value, params: withRecordParams() })
}

async function onHeaderAction(action) {
  switch (action?.key) {
    case 'create':
      await goToCreate()
      return
    case 'details':
      await goToDetails()
      return
    case 'edit':
      await goToEdit()
      return
    default:
  }
}

watch([routeName, recordId, hasSingletonRecord], loadEntity, { immediate: true })
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        :title="`${config.label} ${stateLabel}`"
        :description="workflowNote.step"
        :actions="headerActions"
        :loading="loading"
        :disabled="!headerActions.length"
        :back-disabled="!canGoList"
        :back-label="`Back to ${config.label}`"
        @select="onHeaderAction"
        @back="goToList"
      >
        <template #pretitle>
          <div class="resource-action-pretitle">
            <el-tag type="info" effect="plain">Action Workspace</el-tag>
            <el-tag effect="plain">{{ config.label }}</el-tag>
            <el-tag type="warning">{{ stateLabel }}</el-tag>
          </div>
        </template>
      </EnterprisePageHeader>
    </template>

    <div class="enterprise-stack enterprise-stack--spacious">

      <AppBentoGrid columns="auto">
        <AppSurfaceSection title="Workflow Guidance" title-tag="h3">
          <template #actions>
            <el-tag size="small" type="success" effect="light">Reusable</el-tag>
          </template>
          <div class="resource-action-guidance">
            <p>{{ workflowNote.outcome }}</p>
            <el-alert
              title="Operational note"
              type="info"
              :closable="false"
              show-icon
              description="Use this route to manage non-CRUD actions while keeping module navigation and context consistent."
            />
          </div>
        </AppSurfaceSection>

        <AppSurfaceSection title="Context" title-tag="h3">
          <AppDetailGrid :columns="1">
            <AppDetailItem
              v-for="row in contextRows"
              :key="row.label"
              :label="row.label"
              direction="horizontal"
            >
              {{ row.value }}
            </AppDetailItem>
          </AppDetailGrid>
        </AppSurfaceSection>
      </AppBentoGrid>

      <AppSurfaceSection
        v-if="canLoadEntity"
        v-loading="loading"
        title="Record Summary"
        title-tag="h3"
      >
        <template #actions>
          <el-button size="small" text @click="loadEntity">Refresh</el-button>
        </template>

        <el-alert
          v-if="loadError"
          title="Unable to load record context"
          type="error"
          :description="loadError"
          :closable="false"
          show-icon
        />

        <AppDetailGrid v-else-if="recordSnapshot.length" :columns="2">
          <AppDetailItem
            v-for="row in recordSnapshot"
            :key="row.label"
            :label="row.label"
            direction="horizontal"
          >
            {{ row.value }}
          </AppDetailItem>
        </AppDetailGrid>

        <p v-else class="resource-action-empty-note">No summary is available for this route yet.</p>
      </AppSurfaceSection>
    </div>
  </PageWrapper>
</template>
