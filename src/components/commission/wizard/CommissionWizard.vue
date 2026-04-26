<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import FormWizardLayout from '@/components/forms/FormWizardLayout.vue'
import { useCommissionWizard } from '@/composables/useCommissionWizard'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CommissionWizardStepBasicProfile from './CommissionWizardStepBasicProfile.vue'
import CommissionWizardStepCTA from './CommissionWizardStepCTA.vue'
import CommissionWizardStepCoreFunctions from './CommissionWizardStepCoreFunctions.vue'
import CommissionWizardStepDirectorGeneral from './CommissionWizardStepDirectorGeneral.vue'
import CommissionWizardStepHistory from './CommissionWizardStepHistory.vue'
import CommissionWizardStepIntroduction from './CommissionWizardStepIntroduction.vue'
import CommissionWizardStepMandate from './CommissionWizardStepMandate.vue'
import CommissionWizardStepOrganizationStructure from './CommissionWizardStepOrganizationStructure.vue'
import CommissionWizardStepOutro from './CommissionWizardStepOutro.vue'
import CommissionWizardStepPhilosophies from './CommissionWizardStepPhilosophies.vue'
import CommissionWizardStepReview from './CommissionWizardStepReview.vue'
import CommissionWizardStepSlogan from './CommissionWizardStepSlogan.vue'

const router = useRouter()
const bootstrapping = ref(true)

const {
  form,
  currentStep,
  currentStepKey,
  pageTitle,
  pageDescription,
  loading,
  savingCurrentStep,
  stepStates,
  reviewSections,
  missingSteps,
  loadError,
  saveError,
  successMessage,
  loadCommission,
  registerStepRef,
  goToStep,
  previousStep,
  saveStep,
  saveAndContinue,
} = useCommissionWizard()

const stepComponents = Object.freeze({
  basicProfile: CommissionWizardStepBasicProfile,
  introduction: CommissionWizardStepIntroduction,
  history: CommissionWizardStepHistory,
  mandate: CommissionWizardStepMandate,
  philosophies: CommissionWizardStepPhilosophies,
  coreFunctions: CommissionWizardStepCoreFunctions,
  organizationStructure: CommissionWizardStepOrganizationStructure,
  directorGeneral: CommissionWizardStepDirectorGeneral,
  cta: CommissionWizardStepCTA,
  slogan: CommissionWizardStepSlogan,
  outro: CommissionWizardStepOutro,
  review: CommissionWizardStepReview,
})

const currentComponent = computed(
  () => stepComponents[currentStepKey.value] || CommissionWizardStepReview,
)

const currentComponentProps = computed(() => {
  if (currentStepKey.value === 'review') {
    return {
      reviewSections: reviewSections.value,
      missingSteps: missingSteps.value,
      stepStates: stepStates.value,
    }
  }

  return {
    form,
  }
})

const wizardLoading = computed(
  () => bootstrapping.value || loading.value || savingCurrentStep.value,
)

async function finishWizard() {
  const saved = await saveStep('review')
  if (!saved) return
  await router.push({ name: 'commission.details' })
}

async function bootstrap() {
  bootstrapping.value = true

  try {
    await loadCommission()
  } finally {
    bootstrapping.value = false
  }
}

onMounted(bootstrap)
</script>

<template>
  <PageWrapper dense>
    <FormWizardLayout
      :title="pageTitle"
      :subtitle="pageDescription"
      :steps="stepStates"
      :current-step="currentStep"
      :loading="wizardLoading"
      :error="loadError"
      submit-label="Finish Wizard"
      cancel-label="Back to Overview"
      save-label="Save Draft"
      :show-save="true"
      :lock-future-steps="false"
      @cancel="router.push({ name: 'commission.details' })"
      @previous="previousStep"
      @next="saveAndContinue"
      @save="saveStep(currentStepKey)"
      @submit="finishWizard"
      @jump="goToStep"
    >
      <template #header-meta>
        <div class="commission-wizard-meta">
          <span class="commission-wizard-meta__badge">
            {{ stepStates[currentStep]?.saved ? 'Saved' : 'In Progress' }}
          </span>
        </div>
      </template>

      <el-skeleton v-if="bootstrapping && loading" :rows="12" animated />

      <template v-else>
        <el-alert
          v-if="saveError"
          type="error"
          show-icon
          :closable="false"
          :title="saveError"
          class="commission-wizard-alert"
        />

        <el-alert
          v-if="successMessage"
          type="success"
          show-icon
          :closable="false"
          :title="successMessage"
          class="commission-wizard-alert"
        />

        <component
          :is="currentComponent"
          :key="currentStepKey"
          v-bind="currentComponentProps"
          :ref="(instance) => registerStepRef(currentStepKey, instance)"
          @jump="goToStep"
        />
      </template>
    </FormWizardLayout>
  </PageWrapper>
</template>
