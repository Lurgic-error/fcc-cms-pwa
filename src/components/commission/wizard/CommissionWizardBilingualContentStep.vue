<script setup>
import { computed, ref } from 'vue'

import AppFormRow from '@/components/forms/AppFormRow.vue'

import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  helper: { type: String, default: '' },
  rows: { type: Number, default: 6 },
  placeholderEn: { type: String, default: '' },
  placeholderSw: { type: String, default: '' },
})

const formRef = ref(null)
const model = computed(() => props.form)

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
    <AppSurfaceSection class="commission-wizard-section" title-tag="h3" :title="label" :description="helper">
      <AppFormRow :columns="2">
        <el-form-item
          :label="`${label} (English)`"
          :prop="`${fieldKey}.en`"
          :rules="requiredRule(`Enter the English ${label.toLowerCase()}.`)"
          class="app-form-row__item--full"
        >
          <el-input
            v-model="model[fieldKey].en"
            type="textarea"
            :rows="rows"
            :placeholder="placeholderEn"
          />
        </el-form-item>

        <el-form-item
          :label="`${label} (Swahili)`"
          :prop="`${fieldKey}.sw`"
          :rules="requiredRule(`Enter the Swahili ${label.toLowerCase()}.`)"
          class="app-form-row__item--full"
        >
          <el-input
            v-model="model[fieldKey].sw"
            type="textarea"
            :rows="rows"
            :placeholder="placeholderSw"
          />
        </el-form-item>
      </AppFormRow>
    </AppSurfaceSection>
  </el-form>
</template>
