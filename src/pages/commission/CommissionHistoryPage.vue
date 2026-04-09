<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import { commissionAPI } from '@/api'
import { toLocalizedParts } from '@/modules/crud/structuralContentForms'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const history = ref(null)

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

onMounted(loadHistory)
</script>

<template>
  <PageWrapper
    title="Commission History"
    description="Review the bilingual history block currently assigned to the commission singleton."
  >
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-4" />

    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-slate-900">History Content</h2>
            <p class="text-sm text-slate-600">
              Use the main commission editor to change this content.
            </p>
          </div>
          <div class="flex gap-2">
            <el-button @click="loadHistory">Refresh</el-button>
            <el-button type="primary" @click="router.push({ name: 'commission.edit' })"
              >Open Editor</el-button
            >
          </div>
        </div>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated />

      <AppBentoGrid v-else>
        <el-card shadow="never" class="border border-slate-200">
          <template #header>
            <span class="font-medium text-slate-900">English</span>
          </template>
          <p class="whitespace-pre-line text-sm text-slate-700">{{ englishHistory }}</p>
        </el-card>

        <el-card shadow="never" class="border border-slate-200">
          <template #header>
            <span class="font-medium text-slate-900">Swahili</span>
          </template>
          <p class="whitespace-pre-line text-sm text-slate-700">{{ swahiliHistory }}</p>
        </el-card>
      </AppBentoGrid>
    </el-card>
  </PageWrapper>
</template>
