<script setup>
import { computed, ref } from 'vue'

import AppFileUploadField from '@/components/forms/AppFileUploadField.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'

import CommissionWizardImagePreview from './CommissionWizardImagePreview.vue'
import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const formRef = ref(null)
const model = computed(() => props.form)
const structureImageField = Object.freeze({
  accept: 'image/*',
  multiple: false,
  limit: 1,
  uploadTitle: 'Drop the organization structure diagram here or click to choose one',
  uploadHint: 'Use a crisp chart image that remains legible on desktop and mobile.',
  tip: 'PNG and JPG files are accepted.',
})

function requiredRule(message) {
  return [{ required: true, message, trigger: 'blur' }]
}

async function validate() {
  if (!formRef.value) return true

  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

defineExpose({ validate })
</script>

<template>
  <el-form ref="formRef" :model="model" label-position="top" scroll-to-error>
    <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
      title="Organization structure"
      description="Maintain the title, explanatory copy, accessible image alt text, and structure diagram image."
    >
      <AppFormRow :columns="2">
        <el-form-item
          label="Title (English)"
          prop="organizationStructure.title.en"
          :rules="requiredRule('Enter the organization structure title in English.')"
        >
          <el-input
            v-model="model.organizationStructure.title.en"
            placeholder="Organization structure"
          />
        </el-form-item>

        <el-form-item
          label="Title (Swahili)"
          prop="organizationStructure.title.sw"
          :rules="requiredRule('Enter the organization structure title in Swahili.')"
        >
          <el-input
            v-model="model.organizationStructure.title.sw"
            placeholder="Muundo wa taasisi"
          />
        </el-form-item>

        <el-form-item
          label="Description (English)"
          prop="organizationStructure.description.en"
          :rules="requiredRule('Enter the organization structure description in English.')"
          class="app-form-row__item--full"
        >
          <el-input
            v-model="model.organizationStructure.description.en"
            type="textarea"
            :rows="5"
            placeholder="Explain how the commission structure is organized in English."
          />
        </el-form-item>

        <el-form-item
          label="Description (Swahili)"
          prop="organizationStructure.description.sw"
          :rules="requiredRule('Enter the organization structure description in Swahili.')"
          class="app-form-row__item--full"
        >
          <el-input
            v-model="model.organizationStructure.description.sw"
            type="textarea"
            :rows="5"
            placeholder="Elezea muundo wa tume kwa Kiswahili."
          />
        </el-form-item>

        <el-form-item label="Image Alt (English)" class="app-form-row__item--full">
          <el-input
            v-model="model.organizationStructure.imageAlt.en"
            placeholder="Describe the organization chart image in English."
          />
        </el-form-item>

        <el-form-item label="Image Alt (Swahili)" class="app-form-row__item--full">
          <el-input
            v-model="model.organizationStructure.imageAlt.sw"
            placeholder="Elezea picha ya muundo wa taasisi kwa Kiswahili."
          />
        </el-form-item>
      </AppFormRow>

      <AppFormRow :columns="1">
        <el-form-item
          label="Structure Image"
          prop="organizationStructure.image"
          :rules="requiredRule('Upload the organization structure image.')"
        >
          <AppFileUploadField
            v-model="model.organizationStructure.image"
            :field="structureImageField"
          />
        </el-form-item>
      </AppFormRow>

      <CommissionWizardImagePreview
        :value="model.organizationStructure.image"
        label="Organization structure preview"
        empty-label="Upload the organization structure image to preview the diagram."
      />
    </AppSurfaceSection>
  </el-form>
</template>
