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
const coreFunctionImageField = Object.freeze({
  accept: 'image/*',
  multiple: false,
  limit: 1,
  uploadTitle: 'Drop a core function cover image here or click to choose one',
  uploadHint: 'Use a supporting visual that works well inside card layouts.',
  tip: 'PNG and JPG files are accepted.',
})

function requiredRule(message) {
  return [{ required: true, message, trigger: 'blur' }]
}

function addCoreFunction() {
  model.value.coreFunctions.push({
    coreFunctionId: '',
    name: { en: '', sw: '' },
    description: { en: '', sw: '' },
    coverImage: null,
  })
}

function removeCoreFunction(index) {
  if (model.value.coreFunctions.length === 1) return
  model.value.coreFunctions.splice(index, 1)
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
    <CommissionWizardSectionCard
      title="Core function cards"
      description="Manage the repeatable function cards that explain what the commission does."
    >
      <div class="commission-step-list-header">
        <div>
          <h4>Core function collection</h4>
          <p>
            Use one function card per public-facing responsibility and add cover imagery when
            available.
          </p>
        </div>
        <el-button type="primary" plain @click="addCoreFunction">Add Core Function</el-button>
      </div>

      <div class="commission-step-stack">
        <CommissionWizardSectionCard
          v-for="(item, index) in model.coreFunctions"
          :key="item.coreFunctionId || `core-function-${index}`"
          compact
        >
          <template #header>
            <div class="commission-step-item-header">
              <div>
                <h4>Core function {{ index + 1 }}</h4>
                <p>
                  Pair each function with a bilingual title, description, and optional cover image.
                </p>
              </div>
              <el-button text type="danger" @click="removeCoreFunction(index)">Remove</el-button>
            </div>
          </template>

          <AppFormRow :columns="2">
            <el-form-item
              :label="`Name ${index + 1} (English)`"
              :prop="`coreFunctions.${index}.name.en`"
              :rules="requiredRule('Enter the English core function name.')"
            >
              <el-input
                v-model="item.name.en"
                placeholder="Write the core function name in English."
              />
            </el-form-item>

            <el-form-item
              :label="`Name ${index + 1} (Swahili)`"
              :prop="`coreFunctions.${index}.name.sw`"
              :rules="requiredRule('Enter the Swahili core function name.')"
            >
              <el-input v-model="item.name.sw" placeholder="Andika jina la jukumu kwa Kiswahili." />
            </el-form-item>

            <el-form-item
              :label="`Description ${index + 1} (English)`"
              :prop="`coreFunctions.${index}.description.en`"
              :rules="requiredRule('Enter the English core function description.')"
              class="md:col-span-2"
            >
              <el-input
                v-model="item.description.en"
                type="textarea"
                :rows="4"
                placeholder="Explain the core function in English."
              />
            </el-form-item>

            <el-form-item
              :label="`Description ${index + 1} (Swahili)`"
              :prop="`coreFunctions.${index}.description.sw`"
              :rules="requiredRule('Enter the Swahili core function description.')"
              class="md:col-span-2"
            >
              <el-input
                v-model="item.description.sw"
                type="textarea"
                :rows="4"
                placeholder="Elezea jukumu kwa Kiswahili."
              />
            </el-form-item>

            <el-form-item :label="`Cover Image ${index + 1}`" class="md:col-span-2">
              <AppFileUploadField v-model="item.coverImage" :field="coreFunctionImageField" />
            </el-form-item>
          </AppFormRow>

          <CommissionWizardImagePreview
            :value="item.coverImage"
            :label="`Core function ${index + 1} image`"
            empty-label="Upload a cover image to preview the core function card visual."
          />
        </CommissionWizardSectionCard>
      </div>
    </CommissionWizardSectionCard>
  </el-form>
</template>

<style scoped>
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
  font-size: 0.94rem;
  font-weight: 700;
  color: rgb(15 23 42);
}

.commission-step-list-header p,
.commission-step-item-header p {
  margin: 0.25rem 0 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: rgb(71 85 105);
}

@media (max-width: 767px) {
  .commission-step-list-header,
  .commission-step-item-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
