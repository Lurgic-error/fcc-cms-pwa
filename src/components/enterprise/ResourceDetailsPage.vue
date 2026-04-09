<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageWrapper from '@/components/common/PageWrapper.vue'
import EntityDetailsPanel from '@/components/enterprise/EntityDetailsPanel.vue'
import ContentWorkflowStatusPanel from '@/components/workflow/ContentWorkflowStatusPanel.vue'
import EntityActionsDropdown from '@/components/workflow/EntityActionsDropdown.vue'
import { useEditorialActions } from '@/composables/useEditorialActions'
import { useEntityCrud } from '@/composables/useEntityCrud'
import { useRouteAccess } from '@/composables/useRouteAccess'

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const { canAccessRoute } = useRouteAccess()
const { entity, loading, error, fetchOne, runWorkflow } = useEntityCrud(props.config.adapter)
const { executeRecordAction, getRecordActions } = useEditorialActions(props.config)

const recordId = computed(() => route.params?.[props.config.routeParam] || '')
const isSingleton = computed(() => Boolean(props.config.singleton))
const canGoList = computed(() => {
  const routeName = props.config?.routes?.list
  return canAccessRoute(routeName)
})

const pageTitle = computed(() => `${props.config.singular} Details`)
const pageDescription = computed(
  () =>
    `Review ${props.config.singular.toLowerCase()} metadata, workflow state, and scheduling controls.`,
)
const detailActions = computed(() =>
  getRecordActions(entity.value, {
    canView: false,
    includeRespond: true,
  }),
)

async function loadRecord() {
  if (!recordId.value && !isSingleton.value) return
  try {
    if (recordId.value) {
      await fetchOne(recordId.value)
      return
    }
    await fetchOne()
  } catch {
    // Error state is rendered in component.
  }
}

async function goBack() {
  if (canGoList.value) {
    await router.push({ name: props.config.routes.list })
    return
  }

  router.back()
}

async function onAction(action) {
  const completed = await executeRecordAction(action, entity.value, {
    runWorkflow,
    reload: loadRecord,
  })

  if (completed && action?.key === 'delete') {
    await goBack()
  }
}

onMounted(loadRecord)

watch(recordId, (nextId, previousId) => {
  if (!nextId || nextId === previousId) return
  loadRecord()
})
</script>

<template>
  <PageWrapper>
    <template #header>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Detail View
          </p>
          <h1 class="text-2xl font-semibold text-slate-950">{{ pageTitle }}</h1>
          <p class="max-w-3xl text-sm text-slate-600">{{ pageDescription }}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <el-button plain @click="goBack">Back</el-button>
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

    <div class="space-y-4">
      <ContentWorkflowStatusPanel :record="entity" />

      <EntityDetailsPanel
        :title="`${config.singular} Record`"
        :subtitle="`Detailed metadata and content fields for this ${config.singular.toLowerCase()}.`"
        :record="entity"
        :fields="config.detailFields"
        :loading="loading"
        :error="error"
      />
    </div>
  </PageWrapper>
</template>
