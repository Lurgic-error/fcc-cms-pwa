<script setup>
import { computed } from 'vue'

const props = defineProps({
  step: { type: Object, required: true },
  index: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 0 },
  saved: { type: Boolean, default: false },
  complete: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
})

const status = computed(() => {
  if (props.error) return { label: 'Needs attention', type: 'danger' }
  if (props.saved) return { label: 'Saved', type: 'success' }
  if (props.complete) return { label: 'Complete', type: 'info' }
  return { label: 'In progress', type: 'warning' }
})
</script>

<template>
  <header class="commission-wizard-step-header">
    <div class="commission-wizard-step-header__content">
      <p class="commission-wizard-step-header__eyebrow">Step {{ index + 1 }} of {{ totalSteps }}</p>
      <h2 class="commission-wizard-step-header__title">{{ step.title }}</h2>
      <p class="commission-wizard-step-header__description">{{ step.description }}</p>
      <p v-if="step.helper" class="commission-wizard-step-header__helper">{{ step.helper }}</p>
    </div>

    <el-tag :type="status.type" effect="light" round>
      {{ status.label }}
    </el-tag>
  </header>
</template>

<style scoped>
.commission-wizard-step-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.3rem;
  border-bottom: 1px solid rgb(226 232 240 / 0.95);
}

.commission-wizard-step-header__content {
  display: grid;
  gap: 0.45rem;
}

.commission-wizard-step-header__eyebrow {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgb(14 116 144);
}

.commission-wizard-step-header__title {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  line-height: 1.1;
  font-weight: 800;
  color: rgb(15 23 42);
}

.commission-wizard-step-header__description,
.commission-wizard-step-header__helper {
  margin: 0;
  max-width: 56rem;
  font-size: 0.95rem;
  line-height: 1.65;
}

.commission-wizard-step-header__description {
  color: rgb(30 41 59);
}

.commission-wizard-step-header__helper {
  color: rgb(71 85 105);
}

@media (max-width: 767px) {
  .commission-wizard-step-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
