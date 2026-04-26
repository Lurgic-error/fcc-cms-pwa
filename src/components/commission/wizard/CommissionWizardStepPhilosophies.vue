<script setup>
import { computed, ref } from 'vue'

import AppRepeatableListField from '@/components/forms/AppRepeatableListField.vue'

import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const formRef = ref(null)
const model = computed(() => props.form)

const philosophiesField = Object.freeze({
  itemTitle: 'philosophy',
  addLabel: 'Add Philosophy',
  itemDescription:
    'Every philosophy should have a clear title and a supporting bilingual description.',
  emptyDescription: 'No philosophy entries added yet.',
  itemSchema: [
    {
      key: 'title.en',
      label: 'Title (English)',
      required: true,
      placeholder: 'Write the philosophy title in English.',
    },
    {
      key: 'title.sw',
      label: 'Title (Swahili)',
      required: true,
      placeholder: 'Andika kichwa cha falsafa kwa Kiswahili.',
    },
    {
      key: 'description.en',
      label: 'Description (English)',
      component: 'textarea',
      rows: 4,
      required: true,
      placeholder: 'Explain the philosophy in English.',
    },
    {
      key: 'description.sw',
      label: 'Description (Swahili)',
      component: 'textarea',
      rows: 4,
      required: true,
      placeholder: 'Elezea falsafa kwa Kiswahili.',
    },
  ],
})

function hasText(value) {
  return Boolean(String(value || '').trim())
}

function hasPhilosophyItems(items = []) {
  return (
    Array.isArray(items) &&
    items.some(
      (item) =>
        hasText(item?.title?.en) &&
        hasText(item?.title?.sw) &&
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
      title="Commission philosophies"
      description="Manage the repeatable philosophy cards that communicate the commission principles."
    >
      <el-form-item
        prop="philosophies"
        :rules="
          requiredItemsRule(
            'Add at least one complete philosophy with bilingual title and description.',
            hasPhilosophyItems,
          )
        "
        class="form-item-flush"
      >
        <AppRepeatableListField v-model="model.philosophies" :field="philosophiesField" />
      </el-form-item>
    </AppSurfaceSection>
  </el-form>
</template>
