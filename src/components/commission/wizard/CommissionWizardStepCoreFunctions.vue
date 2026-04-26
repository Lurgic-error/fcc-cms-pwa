<script setup>
import { computed, ref } from 'vue'

import AppRepeatableListField from '@/components/forms/AppRepeatableListField.vue'

import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'

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

const coreFunctionsField = Object.freeze({
  itemTitle: 'core function',
  addLabel: 'Add Core Function',
  itemDescription:
    'Use one function card per public-facing responsibility and add cover imagery when available.',
  emptyDescription: 'No core function cards added yet.',
  itemSchema: [
    {
      key: 'name.en',
      label: 'Name (English)',
      required: true,
      placeholder: 'Write the core function name in English.',
    },
    {
      key: 'name.sw',
      label: 'Name (Swahili)',
      required: true,
      placeholder: 'Andika jina la jukumu kwa Kiswahili.',
    },
    {
      key: 'description.en',
      label: 'Description (English)',
      component: 'textarea',
      rows: 4,
      required: true,
      placeholder: 'Explain the core function in English.',
    },
    {
      key: 'description.sw',
      label: 'Description (Swahili)',
      component: 'textarea',
      rows: 4,
      required: true,
      placeholder: 'Elezea jukumu kwa Kiswahili.',
    },
    {
      key: 'coverImage',
      label: 'Cover Image',
      tableLabel: 'Image',
      columnWidth: 220,
      component: 'file-upload',
      ...coreFunctionImageField,
    },
  ],
})

function hasText(value) {
  return Boolean(String(value || '').trim())
}

function hasCoreFunctionItems(items = []) {
  return (
    Array.isArray(items) &&
    items.some(
      (item) =>
        hasText(item?.name?.en) &&
        hasText(item?.name?.sw) &&
        hasText(item?.description?.en) &&
        hasText(item?.description?.sw),
    )
  )
}

function requiredItemsRule(message, predicate) {
  return [
    {
      validator: (_rule, value, callback) => {
        if (predicate(value)) {
          callback()
          return
        }

        callback(new Error(message))
      },
      trigger: 'change',
    },
  ]
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
      title="Core function cards"
      description="Manage the repeatable function cards that explain what the commission does."
    >
      <el-form-item
        prop="coreFunctions"
        :rules="
          requiredItemsRule(
            'Add at least one complete core function with bilingual name and description.',
            hasCoreFunctionItems,
          )
        "
        class="form-item-flush"
      >
        <AppRepeatableListField v-model="model.coreFunctions" :field="coreFunctionsField" />
      </el-form-item>
    </AppSurfaceSection>
  </el-form>
</template>
