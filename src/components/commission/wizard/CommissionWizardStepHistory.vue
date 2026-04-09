<script setup>
import CommissionWizardBilingualContentStep from './CommissionWizardBilingualContentStep.vue'

defineProps({
  form: { type: Object, required: true },
})
</script>

<template>
  <CommissionWizardBilingualContentStep
    :form="form"
    field-key="history"
    label="History"
    helper="Document the commission history with matching English and Swahili narratives."
    :rows="8"
    placeholder-en="Write the commission history in English."
    placeholder-sw="Andika historia ya tume kwa Kiswahili."
  />
</template>
