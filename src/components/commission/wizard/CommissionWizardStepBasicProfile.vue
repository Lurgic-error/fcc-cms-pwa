<script setup>
import { computed, ref } from 'vue'

import AppFileUploadField from '@/components/forms/AppFileUploadField.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'

import CommissionWizardImagePreview from './CommissionWizardImagePreview.vue'
import CommissionWizardSectionCard from './CommissionWizardSectionCard.vue'

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

function requiredRule(message) {
  return [{ required: true, message, trigger: 'blur' }]
}

function addGalleryImage() {
  model.value.galleryImages.push({ image: null })
}

function removeGalleryImage(index) {
  if (model.value.galleryImages.length === 1) return
  model.value.galleryImages.splice(index, 1)
}

function addCommissionFunction() {
  model.value.commissionFunctions.push({ en: '', sw: '' })
}

function removeCommissionFunction(index) {
  if (model.value.commissionFunctions.length === 1) return
  model.value.commissionFunctions.splice(index, 1)
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
      <CommissionWizardSectionCard
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
      </CommissionWizardSectionCard>

      <CommissionWizardSectionCard
        title="Welcome note"
        description="Use this as the main bilingual welcome content for the commission profile."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Welcome Note (English)"
            prop="welcomeNote.en"
            :rules="requiredRule('Enter the welcome note in English.')"
            class="md:col-span-2"
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
            class="md:col-span-2"
          >
            <el-input
              v-model="model.welcomeNote.sw"
              type="textarea"
              :rows="5"
              placeholder="Karibisha wageni kwa muhtasari wa tume kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>
      </CommissionWizardSectionCard>

      <CommissionWizardSectionCard
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

        <div class="commission-step-list-header">
          <div>
            <h4>Gallery images</h4>
            <p>Upload one image per gallery card and preview each image before saving.</p>
          </div>
          <el-button type="primary" plain @click="addGalleryImage">Add Image</el-button>
        </div>

        <div class="commission-step-stack">
          <CommissionWizardSectionCard
            v-for="(item, index) in model.galleryImages"
            :key="`gallery-image-${index}`"
            compact
          >
            <template #header>
              <div class="commission-step-item-header">
                <div>
                  <h4>Gallery image {{ index + 1 }}</h4>
                  <p>Upload the image file that should appear in the commission gallery.</p>
                </div>
                <el-button text type="danger" @click="removeGalleryImage(index)">Remove</el-button>
              </div>
            </template>

            <AppFormRow :columns="1">
              <el-form-item :label="`Gallery Image ${index + 1}`">
                <AppFileUploadField
                  v-model="item.image"
                  :field="{
                    ...singleImageField,
                    uploadTitle: `Drop gallery image ${index + 1} here or click to choose one`,
                    uploadHint: 'Each gallery card should use one uploaded image.',
                  }"
                />
              </el-form-item>
            </AppFormRow>

            <CommissionWizardImagePreview
              :value="item.image"
              :label="`Gallery image ${index + 1}`"
              empty-label="Upload a gallery image to see the preview."
            />
          </CommissionWizardSectionCard>
        </div>
      </CommissionWizardSectionCard>

      <CommissionWizardSectionCard
        title="Featured statements"
        description="Maintain the commissioner message and the public-facing commission function list."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Commissioner Statement (English)"
            prop="commissionerStatement.en"
            :rules="requiredRule('Enter the commissioner statement in English.')"
            class="md:col-span-2"
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
            class="md:col-span-2"
          >
            <el-input
              v-model="model.commissionerStatement.sw"
              type="textarea"
              :rows="5"
              placeholder="Andika neno la mjumbe wa tume kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>

        <div class="commission-step-list-header">
          <div>
            <h4>Commission functions</h4>
            <p>List the high-level public commission functions in both languages.</p>
          </div>
          <el-button type="primary" plain @click="addCommissionFunction">Add Function</el-button>
        </div>

        <div class="commission-step-stack">
          <CommissionWizardSectionCard
            v-for="(item, index) in model.commissionFunctions"
            :key="`commission-function-${index}`"
            compact
          >
            <template #header>
              <div class="commission-step-item-header">
                <div>
                  <h4>Commission function {{ index + 1 }}</h4>
                  <p>Use a concise line item rather than a long paragraph.</p>
                </div>
                <el-button text type="danger" @click="removeCommissionFunction(index)">
                  Remove
                </el-button>
              </div>
            </template>

            <AppFormRow :columns="2">
              <el-form-item :label="`Function ${index + 1} (English)`">
                <el-input
                  v-model="item.en"
                  type="textarea"
                  :rows="3"
                  placeholder="Describe the function in English."
                />
              </el-form-item>

              <el-form-item :label="`Function ${index + 1} (Swahili)`">
                <el-input
                  v-model="item.sw"
                  type="textarea"
                  :rows="3"
                  placeholder="Elezea jukumu kwa Kiswahili."
                />
              </el-form-item>
            </AppFormRow>
          </CommissionWizardSectionCard>
        </div>
      </CommissionWizardSectionCard>
    </div>
  </el-form>
</template>

<style scoped>
.commission-step-grid,
.commission-step-stack {
  display: grid;
  gap: 1rem;
}

.commission-step-list-header,
.commission-step-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.commission-step-list-header h4,
.commission-step-item-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--fcc-text);
  letter-spacing: -0.01em;
}

.commission-step-list-header p,
.commission-step-item-header p {
  margin: 0.35rem 0 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--fcc-text-muted);
}

@media (max-width: 767px) {
  .commission-step-list-header,
  .commission-step-item-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
