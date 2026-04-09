<script setup>
import CommissionWizardBilingualContentStep from './CommissionWizardBilingualContentStep.vue'

defineProps({
  form: { type: Object, required: true },
})
</script>

<template>
  <CommissionWizardBilingualContentStep
    :form="form"
    field-key="introduction"
    label="Introduction"
    helper="Introduce the commission in clear, audience-facing bilingual copy."
    :rows="7"
    placeholder-en="Write the commission introduction in English."
    placeholder-sw="Andika utangulizi wa tume kwa Kiswahili."
  />
</template>
