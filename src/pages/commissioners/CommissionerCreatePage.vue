<script setup>
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('commissioners')
</script>

<template>
  <ResourceFormPage :config="config" mode="create" />
</template>
