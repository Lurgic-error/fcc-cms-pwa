<script setup>
import CommissionWizardBilingualContentStep from './CommissionWizardBilingualContentStep.vue'

defineProps({
  form: { type: Object, required: true },
})
</script>

<template>
  <CommissionWizardBilingualContentStep
    :form="form"
    field-key="outro"
    label="Outro"
    helper="Wrap up the commission story with a clean closing message for the public website."
    :rows="6"
    placeholder-en="Write the English outro."
    placeholder-sw="Andika hitimisho kwa Kiswahili."
  />
</template>
