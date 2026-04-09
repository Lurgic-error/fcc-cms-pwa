<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('publicationCategories')
</script>

<template>
  <PageWrapper
    title="Edit Publication Category"
    description="Update category identity, validity rules, and publishing guidance without hiding the parent-child relationship."
  >
    <el-alert
      type="info"
      show-icon
      :closable="false"
      title="Workflow note"
      description="Editing metadata does not change publish state. Use the category detail page to review, approve, publish, archive, or safely delete the category."
      class="mb-4"
    />
    <ResourceFormPage :config="config" mode="edit" />
  </PageWrapper>
</template>
