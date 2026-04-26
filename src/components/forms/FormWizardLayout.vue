<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  steps: { type: Array, default: () => [] },
  currentStep: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  submitLabel: { type: String, default: 'Save' },
  cancelLabel: { type: String, default: 'Cancel' },
  saveLabel: { type: String, default: 'Save Draft' },
  showCancel: { type: Boolean, default: true },
  showSave: { type: Boolean, default: false },
  lockFutureSteps: { type: Boolean, default: true },
})

const emit = defineEmits(['previous', 'next', 'submit', 'cancel', 'save', 'jump'])

const isFirstStep = computed(() => props.currentStep <= 0)
const isLastStep = computed(() => props.currentStep >= props.steps.length - 1)
const currentStepMeta = computed(() => props.steps[props.currentStep] || null)
const totalSteps = computed(() => props.steps.length)

const hasNestedSteps = computed(() =>
  props.steps.some((step) => getStepChildren(step).length > 0),
)
const usesSideNavigation = computed(() => totalSteps.value > 4 || hasNestedSteps.value)
const usesTopNavigation = computed(() => totalSteps.value > 1 && !usesSideNavigation.value)

function getStepChildren(step) {
  if (!step || typeof step !== 'object') return []
  return [step.children, step.steps, step.substeps].find((value) => Array.isArray(value)) || []
}

function getStepIndex(step, fallbackIndex) {
  return Number.isInteger(step?.index) ? step.index : fallbackIndex
}

function isStepCurrent(step, index) {
  return Boolean(step?.current) || index === props.currentStep
}

function isStepComplete(step, index) {
  return Boolean(step?.complete || step?.completed) || index < props.currentStep
}

function isStepError(step) {
  return Boolean(step?.error)
}

function isStepDisabled(step, index) {
  if (props.loading) return true
  if (step?.disabled || step?.locked) return true
  return props.lockFutureSteps && index > props.currentStep
}

function stepStatus(step, index) {
  if (isStepError(step)) return 'error'
  if (isStepCurrent(step, index)) return 'current'
  if (isStepComplete(step, index)) return 'complete'
  return 'upcoming'
}

function emitJump(step, fallbackIndex) {
  const targetIndex = getStepIndex(step, fallbackIndex)
  if (!Number.isInteger(targetIndex) || isStepDisabled(step, targetIndex)) return
  emit('jump', targetIndex)
}

function stepNumber(index) {
  return String(index + 1).padStart(2, '0')
}
</script>

<template>
  <section
    class="wizard-shell"
    :class="{
      'wizard-shell--side': usesSideNavigation,
      'wizard-shell--top': usesTopNavigation,
    }"
  >
    <header class="wizard-shell__header">
      <div class="wizard-shell__heading">
        <p v-if="totalSteps" class="wizard-shell__eyebrow">
          Step {{ currentStep + 1 }} of {{ totalSteps }}
        </p>
        <h2 class="wizard-shell__title">{{ title }}</h2>
        <p v-if="subtitle" class="wizard-shell__subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="currentStepMeta || $slots['header-meta']" class="wizard-shell__header-meta">
        <div v-if="currentStepMeta" class="wizard-shell__step-summary">
          <span class="wizard-shell__step-caption">Current Step</span>
          <strong class="wizard-shell__step-title">{{ currentStepMeta.title }}</strong>
          <span v-if="currentStepMeta.description" class="wizard-shell__step-description">
            {{ currentStepMeta.description }}
          </span>
        </div>

        <slot name="header-meta" :step="currentStepMeta" />
      </div>
    </header>

    <div
      class="wizard-shell__body"
      :class="{
        'wizard-shell__body--side': usesSideNavigation,
        'wizard-shell__body--top': usesTopNavigation,
      }"
    >
      <aside v-if="usesSideNavigation" class="wizard-shell__nav wizard-shell__nav--side">
        <div class="wizard-shell__nav-scroll">
          <ol class="wizard-step-list wizard-step-list--side">
            <li
              v-for="(step, index) in steps"
              :key="step.key || step.title || index"
              class="wizard-step-list__item"
            >
              <el-button
                text
                class="wizard-step wizard-step--side"
                :class="`is-${stepStatus(step, getStepIndex(step, index))}`"
                :disabled="isStepDisabled(step, getStepIndex(step, index))"
                :aria-current="
                  isStepCurrent(step, getStepIndex(step, index)) ? 'step' : undefined
                "
                @click="emitJump(step, index)"
              >
                <span class="wizard-step__index">{{ stepNumber(index) }}</span>
                <span class="wizard-step__copy">
                  <span class="wizard-step__title">{{ step.title }}</span>
                  <span v-if="step.description" class="wizard-step__description">
                    {{ step.description }}
                  </span>
                </span>
              </el-button>

              <ol
                v-if="getStepChildren(step).length"
                class="wizard-step-list wizard-step-list--nested"
              >
                <li
                  v-for="(childStep, childIndex) in getStepChildren(step)"
                  :key="childStep.key || childStep.title || `${index}-${childIndex}`"
                  class="wizard-step-list__item"
                >
                  <el-button
                    text
                    class="wizard-step wizard-step--nested"
                    :class="
                      `is-${stepStatus(childStep, getStepIndex(childStep, getStepIndex(step, index)))}`
                    "
                    :disabled="
                      isStepDisabled(childStep, getStepIndex(childStep, getStepIndex(step, index)))
                    "
                    :aria-current="
                      isStepCurrent(childStep, getStepIndex(childStep, getStepIndex(step, index)))
                        ? 'step'
                        : undefined
                    "
                    @click="emitJump(childStep, getStepIndex(step, index))"
                  >
                    <span class="wizard-step__title">{{ childStep.title }}</span>
                    <span v-if="childStep.description" class="wizard-step__description">
                      {{ childStep.description }}
                    </span>
                  </el-button>
                </li>
              </ol>
            </li>
          </ol>
        </div>
      </aside>

      <div class="wizard-shell__main">
        <nav v-if="usesTopNavigation" class="wizard-shell__nav wizard-shell__nav--top">
          <div class="wizard-shell__nav-scroll wizard-shell__nav-scroll--horizontal">
            <ol
              class="wizard-step-list wizard-step-list--top"
              :style="{ '--wizard-top-step-count': totalSteps }"
            >
              <li
                v-for="(step, index) in steps"
                :key="step.key || step.title || index"
                class="wizard-step-list__item"
              >
                <el-button
                  text
                  class="wizard-step wizard-step--top"
                  :class="`is-${stepStatus(step, getStepIndex(step, index))}`"
                  :disabled="isStepDisabled(step, getStepIndex(step, index))"
                  :aria-current="
                    isStepCurrent(step, getStepIndex(step, index)) ? 'step' : undefined
                  "
                  @click="emitJump(step, index)"
                >
                  <span class="wizard-step__index">{{ stepNumber(index) }}</span>
                  <span class="wizard-step__copy">
                    <span class="wizard-step__title">{{ step.title }}</span>
                    <span v-if="step.description" class="wizard-step__description">
                      {{ step.description }}
                    </span>
                  </span>
                </el-button>
              </li>
            </ol>
          </div>
        </nav>

        <section class="wizard-shell__content">
          <div class="wizard-shell__content-scroll">
            <el-alert
              v-if="error"
              :title="error"
              type="error"
              show-icon
              :closable="false"
              class="wizard-shell__alert"
            />

            <slot />
          </div>
        </section>
      </div>
    </div>

    <footer class="wizard-shell__footer">
      <div class="wizard-shell__footer-group">
        <el-button v-if="showCancel" size="large" plain @click="$emit('cancel')">
          {{ cancelLabel }}
        </el-button>
        <el-button v-if="!isFirstStep" size="large" @click="$emit('previous')">
          Previous
        </el-button>
      </div>

      <div class="wizard-shell__footer-group wizard-shell__footer-group--end">
        <el-button v-if="showSave" size="large" plain :loading="loading" @click="$emit('save')">
          {{ saveLabel }}
        </el-button>

        <el-button
          v-if="!isLastStep"
          size="large"
          type="primary"
          :loading="loading"
          @click="$emit('next')"
        >
          Next
        </el-button>

        <el-button v-else size="large" type="primary" :loading="loading" @click="$emit('submit')">
          {{ submitLabel }}
        </el-button>
      </div>
    </footer>
  </section>
</template>
