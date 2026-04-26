<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
import { commissionAPI } from '@/api'
import { toLocalizedParts } from '@/modules/crud/structuralContentForms'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const history = ref(null)
const headerActions = Object.freeze([
  { key: 'refreshHistory', label: 'Refresh History' },
  { key: 'openEditor', label: 'Open Editor' },
])

async function loadHistory() {
  loading.value = true
  error.value = ''

  try {
    const response = await commissionAPI.fetchCommissionHistory()
    if (response?.error) throw new Error(response.error)
    history.value = response?.history || null
  } catch (err) {
    error.value = err?.message || 'Unable to load commission history.'
    history.value = null
  } finally {
    loading.value = false
  }
}

const englishHistory = computed(() => toLocalizedParts(history.value).en || '-')
const swahiliHistory = computed(() => toLocalizedParts(history.value).sw || '-')

async function onHeaderAction(action) {
  if (action?.key === 'refreshHistory') {
    await loadHistory()
    return
  }

  if (action?.key === 'openEditor') {
    await router.push({ name: 'commission.edit' })
  }
}

async function goBack() {
  await router.push({ name: 'commission.details' })
}

onMounted(loadHistory)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Commission History"
        title="Commission history"
        description="Review the bilingual history block currently assigned to the commission singleton."
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

    <div class="workspace-shell">
      <WorkspacePanel
        eyebrow="History content"
        title="Bilingual commission history"
        description="Use the main commission editor when this narrative needs to change."
      >
        <el-skeleton v-if="loading" :rows="6" animated />

        <AppBentoGrid v-else columns="2">
          <AppSurfaceSection
            title="English"
            description="Current English copy on the public website."
            title-tag="h3"
          >
            <p class="commission-history-copy">{{ englishHistory }}</p>
          </AppSurfaceSection>

          <AppSurfaceSection
            title="Swahili"
            description="Current Swahili copy on the public website."
            title-tag="h3"
          >
            <p class="commission-history-copy">{{ swahiliHistory }}</p>
          </AppSurfaceSection>
        </AppBentoGrid>
      </WorkspacePanel>
    </div>
  </PageWrapper>
</template>
