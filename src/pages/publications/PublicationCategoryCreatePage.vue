<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import ResourceFormPage from '@/components/enterprise/ResourceFormPage.vue'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { useRouter } from 'vue-router'

const config = getResourceConfig('publicationCategories')
const router = useRouter()

async function goBack() {
  await router.push({ name: 'publicationCategories.list' })
}
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Publication Workspace"
        title="Create Publication Category"
        description="Categories are the parent records in this module. Define the category first, then create publications under it."
        @back="goBack"
      />
    </template>

    <div class="enterprise-stack">
      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="Category-first workflow"
        description="Use categories to group publications, manage review and publish state, and control what can eventually appear on the public website."
      />
      <ResourceFormPage :config="config" mode="create" />
    </div>
  </PageWrapper>
</template>
