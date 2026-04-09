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
  showCancel: { type: Boolean, default: true },
})

const emit = defineEmits(['previous', 'next', 'submit', 'cancel', 'jump'])

const isFirstStep = computed(() => props.currentStep <= 0)
const isLastStep = computed(() => props.currentStep >= props.steps.length - 1)
const currentStepMeta = computed(() => props.steps[props.currentStep] || null)
</script>

<template>
  <section
    class="border shadow-sm overflow-hidden flex flex-col"
    style="
      background-color: var(--fcc-surface);
      border-color: var(--fcc-border);
      border-radius: var(--fcc-radius-lg);
      box-shadow: var(--fcc-shadow-base);
    "
  >
    <!-- Header -->
    <header
      class="px-5 py-5 border-b"
      style="background-color: var(--fcc-surface-muted); border-color: var(--fcc-border)"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h2>
      <p v-if="subtitle" class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ subtitle }}</p>

      <!-- Custom Stepper -->
      <div v-if="steps.length > 1" class="mt-6">
        <nav aria-label="Progress">
          <ol role="list" class="flex items-center">
            <li v-for="(step, index) in steps" :key="step.key || index" class="relative flex-1">
              <div
                v-if="index < steps.length - 1"
                class="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-slate-200 dark:bg-slate-700"
                aria-hidden="true"
                :class="{ 'bg-primary-600 dark:bg-primary-500': index < currentStep }"
              ></div>

              <button
                class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-white dark:bg-slate-900 transition-colors"
                :class="[
                  index < currentStep
                    ? 'border-primary-600 dark:border-primary-500 bg-primary-600 dark:bg-primary-500'
                    : '',
                  index === currentStep ? 'border-primary-600 dark:border-primary-500' : '',
                  index > currentStep
                    ? 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    : '',
                ]"
                @click="emit('jump', index)"
                :disabled="index > currentStep"
                :aria-current="index === currentStep ? 'step' : undefined"
              >
                <!-- Completed Icon -->
                <svg
                  v-if="index < currentStep"
                  class="w-5 h-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  />
                </svg>
                <!-- Active dot -->
                <span
                  v-else-if="index === currentStep"
                  class="h-2.5 w-2.5 bg-primary-600 dark:bg-primary-500 rounded-full"
                  aria-hidden="true"
                ></span>
                <!-- Inactive dot -->
                <span
                  v-else
                  class="h-2.5 w-2.5 bg-transparent rounded-full"
                  aria-hidden="true"
                ></span>
              </button>
            </li>
          </ol>
        </nav>
      </div>
    </header>

    <div class="p-5 md:p-7">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-5" />

      <!-- Step Meta -->
      <div v-if="currentStepMeta" class="mb-6">
        <h3 class="text-base font-medium leading-6 text-slate-900 dark:text-slate-100">
          <span
            class="text-primary-600 dark:text-primary-400 mr-2 text-sm uppercase tracking-wider font-semibold"
            >Step {{ currentStep + 1 }}</span
          >
          {{ currentStepMeta.title }}
        </h3>
        <p
          v-if="currentStepMeta.description"
          class="mt-1 text-sm text-slate-500 dark:text-slate-400"
        >
          {{ currentStepMeta.description }}
        </p>
      </div>

      <!-- Form Content -->
      <div class="space-y-6">
        <slot />
      </div>

      <!-- Footer Actions -->
      <div
        class="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
      >
        <div class="flex gap-3">
          <el-button v-if="showCancel" @click="$emit('cancel')" plain>{{ cancelLabel }}</el-button>
          <el-button v-if="!isFirstStep" @click="$emit('previous')">Back</el-button>
        </div>

        <el-button v-if="!isLastStep" type="primary" :loading="loading" @click="$emit('next')">
          Continue to Next Step
        </el-button>

        <el-button v-else type="primary" :loading="loading" @click="$emit('submit')">
          {{ submitLabel }}
        </el-button>
      </div>
    </div>
  </section>
</template>
