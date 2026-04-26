<script setup>
import { computed, ref } from 'vue'

import AppFileUploadField from '@/components/forms/AppFileUploadField.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'
import AppRepeatableListField from '@/components/forms/AppRepeatableListField.vue'

import CommissionWizardImagePreview from './CommissionWizardImagePreview.vue'
import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const formRef = ref(null)
const model = computed(() => props.form)
const singleImageField = Object.freeze({
  accept: 'image/*',
  multiple: false,
  limit: 1,
  uploadTitle: 'Drop an image here or click to choose one',
  uploadHint: 'Use a high-quality image that can be reused on the public site.',
  tip: 'PNG and JPG files are accepted.',
})

const galleryImagesField = Object.freeze({
  itemTitle: 'gallery image',
  addLabel: 'Add Image',
  itemDescription: 'Upload one image per gallery card and preview each image before saving.',
  emptyDescription: 'No gallery images added yet.',
  itemSchema: [
    {
      key: 'image',
      label: 'Gallery Image',
      tableLabel: 'Image',
      columnWidth: 220,
      component: 'file-upload',
      required: true,
      ...singleImageField,
      uploadTitle: 'Drop the gallery image here or click to choose one',
      uploadHint: 'Each gallery card should use one uploaded image.',
    },
  ],
})

const commissionFunctionsField = Object.freeze({
  itemTitle: 'commission function',
  addLabel: 'Add Function',
  itemDescription: 'List the high-level public commission functions in both languages.',
  emptyDescription: 'No commission functions added yet.',
  itemSchema: [
    {
      key: 'en',
      label: 'Function (English)',
      component: 'textarea',
      rows: 3,
      required: true,
      placeholder: 'Describe the function in English.',
    },
    {
      key: 'sw',
      label: 'Function (Swahili)',
      component: 'textarea',
      rows: 3,
      required: true,
      placeholder: 'Elezea jukumu kwa Kiswahili.',
    },
  ],
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
    <div class="commission-step-grid">
      <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
        title="Commission identity"
        description="Set the commission name that appears in bilingual profile and overview areas."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Commission Name (English)"
            prop="name.en"
            :rules="requiredRule('Enter the commission name in English.')"
          >
            <el-input v-model="model.name.en" placeholder="Fair Competition Commission" />
          </el-form-item>

          <el-form-item
            label="Commission Name (Swahili)"
            prop="name.sw"
            :rules="requiredRule('Enter the commission name in Swahili.')"
          >
            <el-input v-model="model.name.sw" placeholder="Tume ya Ushindani wa Haki" />
          </el-form-item>
        </AppFormRow>
      </AppSurfaceSection>

      <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
        title="Welcome note"
        description="Use this as the main bilingual welcome content for the commission profile."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Welcome Note (English)"
            prop="welcomeNote.en"
            :rules="requiredRule('Enter the welcome note in English.')"
            class="app-form-row__item--full"
          >
            <el-input
              v-model="model.welcomeNote.en"
              type="textarea"
              :rows="5"
              placeholder="Welcome visitors with the commission overview in English."
            />
          </el-form-item>

          <el-form-item
            label="Welcome Note (Swahili)"
            prop="welcomeNote.sw"
            :rules="requiredRule('Enter the welcome note in Swahili.')"
            class="app-form-row__item--full"
          >
            <el-input
              v-model="model.welcomeNote.sw"
              type="textarea"
              :rows="5"
              placeholder="Karibisha wageni kwa muhtasari wa tume kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>
      </AppSurfaceSection>

      <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
        title="Featured media"
        description="Connect the cover image and any gallery images that support the commission profile."
      >
        <AppFormRow :columns="1">
          <el-form-item label="Cover Image">
            <AppFileUploadField
              v-model="model.coverImage"
              :field="{
                ...singleImageField,
                uploadTitle: 'Drop the commission cover image here or click to choose one',
                uploadHint: 'Use a landscape image for the hero, cards, and landing sections.',
              }"
            />
          </el-form-item>
        </AppFormRow>

        <CommissionWizardImagePreview
          :value="model.coverImage"
          label="Cover image preview"
          empty-label="Upload a cover image to preview the commission hero image."
        />

        <AppRepeatableListField v-model="model.galleryImages" :field="galleryImagesField" />
      </AppSurfaceSection>

      <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
        title="Featured statements"
        description="Maintain the commissioner message and the public-facing commission function list."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Commissioner Statement (English)"
            prop="commissionerStatement.en"
            :rules="requiredRule('Enter the commissioner statement in English.')"
            class="app-form-row__item--full"
          >
            <el-input
              v-model="model.commissionerStatement.en"
              type="textarea"
              :rows="5"
              placeholder="Write the commissioner statement in English."
            />
          </el-form-item>

          <el-form-item
            label="Commissioner Statement (Swahili)"
            prop="commissionerStatement.sw"
            :rules="requiredRule('Enter the commissioner statement in Swahili.')"
            class="app-form-row__item--full"
          >
            <el-input
              v-model="model.commissionerStatement.sw"
              type="textarea"
              :rows="5"
              placeholder="Andika neno la mjumbe wa tume kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>

        <AppRepeatableListField
          v-model="model.commissionFunctions"
          :field="commissionFunctionsField"
        />
      </AppSurfaceSection>
    </div>
  </el-form>
</template>
