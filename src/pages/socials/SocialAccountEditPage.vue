<script setup>
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('socials')
</script>

<template>
  <ResourceFormPage :config="config" mode="edit" />
</template>
