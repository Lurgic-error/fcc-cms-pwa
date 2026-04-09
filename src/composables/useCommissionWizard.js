import { computed, reactive, ref } from 'vue'

import { useCommissionStore } from '@/stores'
import {
  COMMISSION_WIZARD_STEPS,
  buildCommissionStepPayload,
  buildCommissionWizardPayload,
  buildCommissionWizardReview,
  createCommissionWizardForm,
  hasCommissionContent,
  isCommissionWizardStepComplete,
  mapCommissionToWizardForm,
} from '@/modules/commission/commissionWizard'

const STEP_SAVE_ACTIONS = Object.freeze({
  basicProfile: 'saveBasicProfile',
  introduction: 'saveIntroduction',
  history: 'saveHistory',
  mandate: 'saveMandate',
  philosophies: 'savePhilosophies',
  coreFunctions: 'saveCoreFunctions',
  organizationStructure: 'saveOrganizationStructure',
  directorGeneral: 'saveDirectorGeneral',
  cta: 'saveCTA',
  slogan: 'saveSlogan',
  outro: 'saveOutro',
  review: 'saveCommission',
})

function syncFormState(target, nextValue) {
  Object.keys(target).forEach((key) => delete target[key])
  Object.assign(target, nextValue)
}

export function useCommissionWizard() {
  const commissionStore = useCommissionStore()
  const form = reactive(createCommissionWizardForm())
  const currentStep = ref(0)
  const loadError = ref('')
  const saveError = ref('')
  const successMessage = ref('')
  const stepRefs = reactive({})
  const attemptedSteps = reactive({})
  const failedSteps = reactive({})
  const savedSteps = reactive({})

  const currentStepMeta = computed(
    () => COMMISSION_WIZARD_STEPS[currentStep.value] || COMMISSION_WIZARD_STEPS[0],
  )
  const currentStepKey = computed(() => currentStepMeta.value.key)
  const isCreateMode = computed(() => !hasCommissionContent(commissionStore.commission))
  const pageTitle = computed(() => (isCreateMode.value ? 'Create Commission' : 'Edit Commission'))
  const pageDescription = computed(() =>
    isCreateMode.value
      ? 'Set up the commission profile through one guided, section-by-section wizard.'
      : 'Maintain the commission profile through one guided, section-by-section wizard.',
  )
  const reviewSections = computed(() => buildCommissionWizardReview(form))
  const missingSteps = computed(() =>
    COMMISSION_WIZARD_STEPS.filter((step) => step.key !== 'review').filter(
      (step) => !isCommissionWizardStepComplete(step.key, form),
    ),
  )

  const maxUnlockedStep = computed(() => {
    let unlocked = 0

    COMMISSION_WIZARD_STEPS.forEach((step, index) => {
      if (step.key === 'review') return
      if (index === 0) {
        unlocked = 0
        return
      }

      const previous = COMMISSION_WIZARD_STEPS[index - 1]
      if (previous.key === 'review') return

      if (savedSteps[previous.key] || isCommissionWizardStepComplete(previous.key, form)) {
        unlocked = index
      }
    })

    if (!missingSteps.value.length) {
      unlocked = COMMISSION_WIZARD_STEPS.length - 1
    }

    return unlocked
  })

  const stepStates = computed(() =>
    COMMISSION_WIZARD_STEPS.map((step, index) => {
      const complete =
        step.key === 'review'
          ? !missingSteps.value.length
          : isCommissionWizardStepComplete(step.key, form)

      return {
        ...step,
        index,
        current: index === currentStep.value,
        complete,
        saved: Boolean(savedSteps[step.key]),
        error: Boolean(failedSteps[step.key]),
        locked: index > maxUnlockedStep.value && index !== currentStep.value,
      }
    }),
  )

  function applyCommission(record = {}) {
    syncFormState(form, mapCommissionToWizardForm(record))
    COMMISSION_WIZARD_STEPS.forEach((step) => {
      if (step.key === 'review') return
      savedSteps[step.key] = isCommissionWizardStepComplete(step.key, form)
      failedSteps[step.key] = false
    })
  }

  async function loadCommission() {
    loadError.value = ''
    saveError.value = ''
    successMessage.value = ''

    try {
      const record = await commissionStore.fetchCommission()
      applyCommission(record || {})
      return record
    } catch (err) {
      loadError.value = err?.message || 'Unable to load commission content.'
      throw err
    }
  }

  function registerStepRef(stepKey, instance) {
    if (instance) {
      stepRefs[stepKey] = instance
      return
    }

    delete stepRefs[stepKey]
  }

  async function validateStep(stepKey = currentStepKey.value) {
    attemptedSteps[stepKey] = true
    saveError.value = ''

    const instance = stepRefs[stepKey]
    if (!instance?.validate) {
      failedSteps[stepKey] = false
      return true
    }

    try {
      const isValid = await instance.validate()
      failedSteps[stepKey] = isValid === false
      return isValid !== false
    } catch {
      failedSteps[stepKey] = true
      return false
    }
  }

  async function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= COMMISSION_WIZARD_STEPS.length) return false
    if (stepIndex === currentStep.value) return true
    if (stepIndex > maxUnlockedStep.value) return false

    if (stepIndex > currentStep.value) {
      const isValid = await validateStep(currentStepKey.value)
      if (!isValid) {
        saveError.value = 'Fix the current step before moving forward.'
        return false
      }
    }

    currentStep.value = stepIndex
    saveError.value = ''
    successMessage.value = ''
    return true
  }

  async function nextStep() {
    return goToStep(Math.min(currentStep.value + 1, COMMISSION_WIZARD_STEPS.length - 1))
  }

  function previousStep() {
    currentStep.value = Math.max(currentStep.value - 1, 0)
    saveError.value = ''
    successMessage.value = ''
  }

  async function saveStep(stepKey = currentStepKey.value) {
    saveError.value = ''
    successMessage.value = ''

    if (stepKey !== 'review') {
      const isValid = await validateStep(stepKey)
      if (!isValid) {
        saveError.value = 'Fix the highlighted validation errors before saving this step.'
        return false
      }
    }

    try {
      const actionName = STEP_SAVE_ACTIONS[stepKey]
      const payload =
        stepKey === 'review'
          ? buildCommissionWizardPayload(form)
          : buildCommissionStepPayload(stepKey, form)

      await commissionStore[actionName](payload)
      applyCommission(commissionStore.commission || {})

      if (stepKey === 'review') {
        COMMISSION_WIZARD_STEPS.forEach((step) => {
          if (step.key === 'review') return
          savedSteps[step.key] = true
          failedSteps[step.key] = false
        })
      } else {
        savedSteps[stepKey] = true
        failedSteps[stepKey] = false
      }

      successMessage.value =
        stepKey === 'review'
          ? 'Commission wizard saved successfully.'
          : `${currentStepMeta.value.title} saved successfully.`

      return true
    } catch (err) {
      saveError.value = err?.message || 'Unable to save this step right now.'
      failedSteps[stepKey] = true
      return false
    }
  }

  async function saveAndContinue() {
    const saved = await saveStep(currentStepKey.value)
    if (!saved) return false
    return nextStep()
  }

  return {
    form,
    currentStep,
    currentStepKey,
    currentStepMeta,
    pageTitle,
    pageDescription,
    loading: computed(() => commissionStore.loading),
    savingCurrentStep: computed(() => commissionStore.isSavingSection(currentStepKey.value)),
    stepStates,
    maxUnlockedStep,
    reviewSections,
    missingSteps,
    loadError,
    saveError,
    successMessage,
    isCreateMode,
    loadCommission,
    registerStepRef,
    validateStep,
    goToStep,
    nextStep,
    previousStep,
    saveStep,
    saveAndContinue,
  }
}
