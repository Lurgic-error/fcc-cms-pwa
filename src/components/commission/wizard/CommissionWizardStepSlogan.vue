<script setup>
import CommissionWizardBilingualContentStep from './CommissionWizardBilingualContentStep.vue'

defineProps({
  form: { type: Object, required: true },
})
</script>

<template>
  <CommissionWizardBilingualContentStep
    :form="form"
    field-key="slogan"
    label="Slogan"
    helper="Keep the slogan short, memorable, and semantically correct in both languages."
    :rows="4"
    placeholder-en="Write the English slogan."
    placeholder-sw="Andika kaulimbiu kwa Kiswahili."
  />
</template>
