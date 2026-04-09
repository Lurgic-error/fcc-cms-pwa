<script setup>
import ResourceDetailsPage from '@/components/enterprise/ResourceDetailsPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('offices')
</script>

<template>
  <ResourceDetailsPage :config="config" />
</template>
