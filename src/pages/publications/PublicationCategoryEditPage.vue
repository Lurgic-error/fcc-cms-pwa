<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { useRoute, useRouter } from 'vue-router'

const config = getResourceConfig('publicationCategories')
const route = useRoute()
const router = useRouter()

async function goBack() {
  const categoryId = String(route.params?.categoryId || '')

  if (categoryId) {
    await router.push({ name: 'publicationCategories.details', params: { categoryId } })
    return
  }

  await router.push({ name: 'publicationCategories.list' })
}
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Publication Workspace"
        title="Edit Publication Category"
        description="Update category identity, validity rules, and publishing guidance without hiding the parent-child relationship."
        @back="goBack"
      />
    </template>

    <div class="enterprise-stack">
      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="Workflow note"
        description="Editing metadata does not change publish state. Use the category detail page to review, approve, publish, archive, or safely delete the category."
      />
      <ResourceFormPage :config="config" mode="edit" />
    </div>
  </PageWrapper>
</template>
