<script setup>
import { computed, ref } from 'vue'

import AppFormRow from '@/components/forms/AppFormRow.vue'
import AppRepeatableListField from '@/components/forms/AppRepeatableListField.vue'

import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const formRef = ref(null)
const model = computed(() => props.form)

const mandateItemsField = Object.freeze({
  itemTitle: 'mandate item',
  addLabel: 'Add Mandate Item',
  itemDescription: 'Each mandate item should carry the same meaning in English and Swahili.',
  emptyDescription: 'No mandate items added yet.',
  itemSchema: [
    {
      key: 'en',
      label: 'Mandate Item (English)',
      component: 'textarea',
      rows: 3,
      required: true,
      placeholder: 'Describe the mandate item in English.',
    },
    {
      key: 'sw',
      label: 'Mandate Item (Swahili)',
      component: 'textarea',
      rows: 3,
      required: true,
      placeholder: 'Andika kipengele cha mandate kwa Kiswahili.',
    },
  ],
})

function requiredRule(message) {
  return [{ required: true, message, trigger: 'blur' }]
}

function hasText(value) {
  return Boolean(String(value || '').trim())
}

function hasLocalizedItems(items = []) {
  return Array.isArray(items) && items.some((item) => hasText(item?.en) && hasText(item?.sw))
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
    <div class="commission-step-grid">
      <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
        title="Mandate overview"
        description="Start with a short bilingual explanation of the commission mandate before listing specific mandate items."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Mandate Description (English)"
            prop="mandate.description.en"
            :rules="requiredRule('Enter the mandate description in English.')"
            class="app-form-row__item--full"
          >
            <el-input
              v-model="model.mandate.description.en"
              type="textarea"
              :rows="5"
              placeholder="Describe the commission mandate in English."
            />
          </el-form-item>

          <el-form-item
            label="Mandate Description (Swahili)"
            prop="mandate.description.sw"
            :rules="requiredRule('Enter the mandate description in Swahili.')"
            class="app-form-row__item--full"
          >
            <el-input
              v-model="model.mandate.description.sw"
              type="textarea"
              :rows="5"
              placeholder="Elezea mandate ya tume kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>
      </AppSurfaceSection>

      <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
        title="Mandate items"
        description="Add the detailed mandate points as a repeatable bilingual list."
      >
        <el-form-item
          prop="mandate.items"
          :rules="
            requiredItemsRule(
              'Add at least one complete mandate item in both languages.',
              hasLocalizedItems,
            )
          "
          class="form-item-flush"
        >
          <AppRepeatableListField v-model="model.mandate.items" :field="mandateItemsField" />
        </el-form-item>
      </AppSurfaceSection>
    </div>
  </el-form>
</template>
