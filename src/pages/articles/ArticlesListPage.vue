<script setup>
import ResourceListPage from '@/components/enterprise/ResourceListPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('articles')
</script>

<template>
  <ResourceListPage :config="config" />
</template>
