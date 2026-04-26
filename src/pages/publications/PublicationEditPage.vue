<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { useRoute, useRouter } from 'vue-router'

const config = getResourceConfig('publications')
const route = useRoute()
const router = useRouter()

async function goBack() {
  const publicationId = String(route.params?.publicationId || '')

  if (publicationId) {
    await router.push({ name: 'publications.details', params: { publicationId } })
    return
  }

  await router.push({ name: 'publications.list' })
}
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Publication Workspace"
        title="Edit Publication"
        description="Update metadata, keep the publication attached to the correct category, and use the detail page for workflow transitions."
        @back="goBack"
      />
    </template>

    <div class="enterprise-stack">
      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="Workflow note"
        description="Editing does not publish content. Use the publication detail page to submit, approve, publish, or unpublish this record."
      />
      <ResourceFormPage :config="config" mode="edit" />
    </div>
  </PageWrapper>
</template>
