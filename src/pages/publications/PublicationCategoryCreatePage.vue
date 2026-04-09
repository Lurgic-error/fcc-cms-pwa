<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('publicationCategories')
</script>

<template>
  <PageWrapper
    title="Create Publication Category"
    description="Categories are the parent records in this module. Define the category first, then create publications under it."
  >
    <el-alert
      type="info"
      show-icon
      :closable="false"
      title="Category-first workflow"
      description="Use categories to group publications, manage review and publish state, and control what can eventually appear on the public website."
      class="mb-4"
    />
    <ResourceFormPage :config="config" mode="create" />
  </PageWrapper>
</template>
