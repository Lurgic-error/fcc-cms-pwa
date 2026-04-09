<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import { useCommissionWizard } from '@/composables/useCommissionWizard'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CommissionWizardActions from './CommissionWizardActions.vue'
import CommissionWizardSidebar from './CommissionWizardSidebar.vue'
import CommissionWizardStepBasicProfile from './CommissionWizardStepBasicProfile.vue'
import CommissionWizardStepCTA from './CommissionWizardStepCTA.vue'
import CommissionWizardStepCoreFunctions from './CommissionWizardStepCoreFunctions.vue'
import CommissionWizardStepDirectorGeneral from './CommissionWizardStepDirectorGeneral.vue'
import CommissionWizardStepHeader from './CommissionWizardStepHeader.vue'
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
  currentStepMeta,
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
  nextStep,
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
const currentState = computed(() => stepStates.value[currentStep.value] || stepStates.value[0])

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
  <PageWrapper :title="pageTitle" :description="pageDescription">
    <div class="commission-wizard-shell">
      <CommissionWizardSidebar :steps="stepStates" @jump="goToStep" />

      <section class="commission-wizard-panel">
        <div class="commission-wizard-panel__toolbar">
          <el-button plain @click="router.push({ name: 'commission.details' })"
            >Back to Overview</el-button
          >
        </div>

        <el-skeleton v-if="bootstrapping && loading" :rows="12" animated />

        <template v-else>
          <CommissionWizardStepHeader
            :step="currentStepMeta"
            :index="currentStep"
            :total-steps="stepStates.length"
            :saved="currentState?.saved"
            :complete="currentState?.complete"
            :error="currentState?.error"
          />

          <el-alert
            v-if="loadError"
            type="error"
            show-icon
            :closable="false"
            :title="loadError"
            class="commission-wizard-alert"
          />

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

          <div class="commission-wizard-panel__body">
            <component
              :is="currentComponent"
              :key="currentStepKey"
              v-bind="currentComponentProps"
              :ref="(instance) => registerStepRef(currentStepKey, instance)"
              @jump="goToStep"
            />
          </div>

          <CommissionWizardActions
            :is-first="currentStep === 0"
            :is-last="currentStep === stepStates.length - 1"
            :saving="savingCurrentStep"
            @previous="previousStep"
            @next="nextStep"
            @save="saveStep(currentStepKey)"
            @save-and-continue="saveAndContinue"
            @finish="finishWizard"
          />
        </template>
      </section>
    </div>
  </PageWrapper>
</template>

<style scoped>
.commission-wizard-shell {
  display: grid;
  gap: 1rem;
}

.commission-wizard-panel {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: var(--fcc-radius-2xl);
  border: 1px solid var(--fcc-border);
  background: var(--fcc-surface);
  box-shadow: var(--fcc-shadow-soft);
}

.commission-wizard-panel__toolbar {
  display: flex;
  justify-content: flex-end;
}

.commission-wizard-panel__body {
  min-width: 0;
}

.commission-wizard-alert {
  margin-top: -0.4rem;
}

@media (min-width: 1024px) {
  .commission-wizard-shell {
    grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
    align-items: start;
  }

  .commission-wizard-panel {
    padding: 1.35rem;
  }
}
</style>
