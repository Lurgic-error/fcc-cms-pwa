<script setup>
import CommissionWizardBilingualContentStep from './CommissionWizardBilingualContentStep.vue'

defineProps({
  form: { type: Object, required: true },
})
</script>

<template>
  <CommissionWizardBilingualContentStep
    :form="form"
    field-key="cta"
    label="Call To Action"
    helper="Use action-oriented messaging that tells visitors exactly what to do next."
    :rows="5"
    placeholder-en="Write the English call to action."
    placeholder-sw="Andika wito wa hatua kwa Kiswahili."
  />
</template>
