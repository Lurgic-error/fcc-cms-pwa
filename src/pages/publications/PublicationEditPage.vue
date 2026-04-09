<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'

const config = getResourceConfig('publications')
</script>

<template>
  <PageWrapper
    title="Edit Publication"
    description="Update metadata, keep the publication attached to the correct category, and use the detail page for workflow transitions."
  >
    <el-alert
      type="info"
      show-icon
      :closable="false"
      title="Workflow note"
      description="Editing does not publish content. Use the publication detail page to submit, approve, publish, or unpublish this record."
      class="mb-4"
    />
    <ResourceFormPage :config="config" mode="edit" />
  </PageWrapper>
</template>
