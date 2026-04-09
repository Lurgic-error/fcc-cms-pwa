<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppFileUploadField from './AppFileUploadField.vue'
import AppRepeatableListField from './AppRepeatableListField.vue'
import AppTagInputField from './AppTagInputField.vue'
import EntityRelationshipSelect from './EntityRelationshipSelect.vue'
import FormWizardLayout from './FormWizardLayout.vue'
import SmartFormGrid from './SmartFormGrid.vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  schema: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  submitLabel: { type: String, default: 'Save' },
  cancelLabel: { type: String, default: 'Cancel' },
  showCancel: { type: Boolean, default: true },
  columns: { type: Number, default: 2 },
  wizard: { type: [Boolean, Object], default: false },
})

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])
const validationErrors = reactive({})
const emptyFields = reactive({})

const internalModel = reactive(cloneModel(props.modelValue))
const currentStep = ref(0)

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item))
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]))
  }

  return value
}

function cloneModel(value = {}) {
  if (!isPlainObject(value)) return {}
  return cloneValue(value)
}

function areValuesEquivalent(left, right) {
  if (left === right) return true

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false
    return left.every((item, index) => areValuesEquivalent(item, right[index]))
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)

    if (leftKeys.length !== rightKeys.length) return false

    return leftKeys.every((key) => areValuesEquivalent(left[key], right[key]))
  }

  return false
}

function syncInternalModel(nextValue = {}) {
  Object.keys(internalModel).forEach((key) => {
    delete internalModel[key]
  })
  Object.assign(internalModel, cloneModel(nextValue))
}

function emitModelUpdate() {
  emit('update:modelValue', cloneModel(internalModel))
}

function onFieldEmpty(fieldKey, isEmpty) {
  if (isEmpty) {
    emptyFields[fieldKey] = true
  } else {
    delete emptyFields[fieldKey]
  }
}

function goToCreateForField(routeName, fieldKey) {
  if (routeName) {
    router.push({
      name: routeName,
      query: {
        returnTo: route.fullPath,
        returnField: fieldKey,
      },
    })
  }
}

function isFieldVisible(field) {
  if (!field) return false
  if (!field.visibleWhen) return true
  if (typeof field.visibleWhen === 'function') {
    return field.visibleWhen(internalModel)
  }

  return Object.entries(field.visibleWhen).every(([key, value]) => internalModel[key] === value)
}

const visibleSchema = computed(() => props.schema.filter((field) => isFieldVisible(field)))

const wizardSteps = computed(() => {
  const steps = []
  let current = null

  visibleSchema.value.forEach((field, index) => {
    if (field.component === 'section') {
      current = {
        key: field.key || `step-${index}`,
        title: field.label || `Step ${steps.length + 1}`,
        description: field.description || '',
        fields: [],
      }
      steps.push(current)
      return
    }

    if (!current) {
      current = {
        key: 'general',
        title: 'Details',
        description: 'Complete the required record details.',
        fields: [],
      }
      steps.push(current)
    }

    current.fields.push(field)
  })

  return steps.filter((step) => step.fields.length)
})

const shouldUseWizard = computed(() => {
  if (!props.wizard) return false
  if (wizardSteps.value.length > 1) return true
  return Boolean(props.wizard === true || props.wizard?.enabled === true)
})

const currentFields = computed(() => {
  if (!shouldUseWizard.value) return visibleSchema.value
  return wizardSteps.value[currentStep.value]?.fields || []
})

const isLastWizardStep = computed(() => {
  if (!shouldUseWizard.value) return true
  return currentStep.value >= wizardSteps.value.length - 1
})

function isFieldEmpty(fieldKey) {
  return Boolean(emptyFields[fieldKey])
}

watch(
  () => props.modelValue,
  (nextValue) => {
    if (areValuesEquivalent(nextValue || {}, internalModel)) {
      return
    }

    syncInternalModel(nextValue || {})
  },
  { deep: true, immediate: true },
)

watch(
  wizardSteps,
  (steps) => {
    if (!steps.length) {
      currentStep.value = 0
      return
    }

    if (currentStep.value > steps.length - 1) {
      currentStep.value = steps.length - 1
    }
  },
  { immediate: true },
)

function updateFieldValue(key, value) {
  if (areValuesEquivalent(internalModel[key], value)) {
    return
  }

  internalModel[key] = cloneValue(value)
  if (validationErrors[key]) delete validationErrors[key]
  emitModelUpdate()
}

function isFieldRequired(field) {
  if (!field) return false
  if (typeof field.requiredWhen === 'function') {
    return Boolean(field.requiredWhen(internalModel))
  }

  if (field.requiredWhen && typeof field.requiredWhen === 'object') {
    return Object.entries(field.requiredWhen).every(([key, value]) => internalModel[key] === value)
  }

  return Boolean(field.required)
}

function isValueEmpty(value) {
  return (
    value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)
  )
}

function validateRepeatableField(field, value) {
  if (!Array.isArray(value) || !value.length) {
    return `${field.label} is required.`
  }

  const itemSchema = Array.isArray(field?.itemSchema) ? field.itemSchema : []

  for (let index = 0; index < value.length; index += 1) {
    const item = value[index]

    if (field?.valueMode === 'primitive' && itemSchema.length === 1) {
      if (isValueEmpty(item)) {
        return `${field.label}: item ${index + 1} is required.`
      }
      continue
    }

    if (!item || typeof item !== 'object') {
      return `${field.label}: item ${index + 1} is incomplete.`
    }

    const requiredFields = itemSchema.filter((itemField) => itemField?.required)
    for (const itemField of requiredFields) {
      if (isValueEmpty(item[itemField.key])) {
        return `${field.label}: ${itemField.label} is required for item ${index + 1}.`
      }
    }
  }

  return ''
}

function validate(fields = visibleSchema.value) {
  let isValid = true

  for (const field of fields) {
    if (!field?.key) continue
    if (!isFieldRequired(field)) continue
    if (!isFieldVisible(field)) continue
    const value = internalModel[field.key]

    if (field.component === 'repeatable-list') {
      const repeatableError = validateRepeatableField(field, value)
      if (repeatableError) {
        validationErrors[field.key] = repeatableError
        isValid = false
      }
      continue
    }

    if (isValueEmpty(value)) {
      validationErrors[field.key] = `${field.label} is required.`
      isValid = false
    }
  }

  return isValid
}

function clearValidationErrors(fields = []) {
  fields.forEach((field) => {
    if (!field?.key) return
    delete validationErrors[field.key]
  })
}

function submit() {
  Object.keys(validationErrors).forEach((key) => delete validationErrors[key])
  if (!validate()) return
  emit('submit', cloneModel(internalModel))
}

function handleFormSubmit() {
  if (shouldUseWizard.value && !isLastWizardStep.value) {
    return
  }

  submit()
}

function nextStep() {
  clearValidationErrors(currentFields.value)
  if (!validate(currentFields.value)) return
  currentStep.value += 1
}

function previousStep() {
  currentStep.value = Math.max(0, currentStep.value - 1)
}

function jumpToStep(stepIndex) {
  if (stepIndex <= currentStep.value) {
    currentStep.value = stepIndex
    return
  }

  clearValidationErrors(currentFields.value)
  if (!validate(currentFields.value)) return
  currentStep.value = stepIndex
}
</script>

<template>
  <FormWizardLayout
    v-if="shouldUseWizard"
    :title="title"
    :subtitle="subtitle"
    :steps="wizardSteps"
    :current-step="currentStep"
    :loading="loading"
    :error="error"
    :submit-label="submitLabel"
    :cancel-label="cancelLabel"
    :show-cancel="showCancel"
    @cancel="$emit('cancel')"
    @next="nextStep"
    @previous="previousStep"
    @submit="submit"
    @jump="jumpToStep"
  >
    <el-form label-position="top" :disabled="loading" @submit.prevent="handleFormSubmit">
      <div v-for="field in currentFields" :key="field.key" class="mb-4">
        <el-alert
          v-if="field.component === 'entity-select' && emptyFields[field.key]"
          :title="`No ${field.label} available.`"
          type="warning"
          show-icon
          :closable="false"
          class="mb-2"
        >
          <template #default>
            <div class="flex items-center justify-between">
              <span>You must create at least one {{ field.label.toLowerCase() }} first.</span>
              <el-button
                v-if="field.createRoute"
                type="warning"
                size="small"
                plain
                @click="goToCreateForField(field.createRoute, field.key)"
              >
                Create {{ field.label }}
              </el-button>
            </div>
          </template>
        </el-alert>
      </div>

      <SmartFormGrid :fields="currentFields" :columns="columns">
        <template #default="{ field }">
          <el-form-item :label="field.label" :error="validationErrors[field.key]" class="mb-0">
            <div
              v-if="field.component === 'section'"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
            >
              <h3 class="text-base font-semibold text-slate-900">
                {{ field.label }}
              </h3>
              <p v-if="field.description" class="mt-1 text-sm text-slate-500">
                {{ field.description }}
              </p>
            </div>

            <el-input
              v-else-if="!field.component || field.component === 'input'"
              :model-value="internalModel[field.key]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder || ''"
              :rows="field.rows || 3"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <el-input
              v-else-if="field.component === 'textarea'"
              :model-value="internalModel[field.key]"
              type="textarea"
              :placeholder="field.placeholder || ''"
              :rows="field.rows || 4"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <EntityRelationshipSelect
              v-else-if="field.component === 'entity-select'"
              :model-value="internalModel[field.key]"
              :field="field"
              :model="internalModel"
              :disabled="loading"
              @update:model-value="updateFieldValue(field.key, $event)"
              @empty="onFieldEmpty(field.key, $event)"
            />

            <AppTagInputField
              v-else-if="field.component === 'tag-input'"
              :model-value="internalModel[field.key]"
              :placeholder="field.placeholder || 'Add tags and press Enter'"
              :disabled="loading"
              :max-collapse-tags="field.maxCollapseTags || 3"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <AppFileUploadField
              v-else-if="field.component === 'file-upload'"
              :model-value="internalModel[field.key]"
              :field="field"
              :disabled="loading"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <AppRepeatableListField
              v-else-if="field.component === 'repeatable-list'"
              :model-value="internalModel[field.key]"
              :field="field"
              :disabled="loading"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <el-select
              v-else-if="field.component === 'select'"
              :model-value="internalModel[field.key]"
              :placeholder="field.placeholder || 'Select option'"
              class="w-full"
              @update:model-value="updateFieldValue(field.key, $event)"
            >
              <el-option
                v-for="option in field.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <el-switch
              v-else-if="field.component === 'switch'"
              :model-value="Boolean(internalModel[field.key])"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <el-date-picker
              v-else-if="field.component === 'date'"
              :model-value="internalModel[field.key]"
              type="date"
              value-format="YYYY-MM-DD"
              class="w-full"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <p v-if="field.helpText" class="mt-2 text-xs text-slate-500">
              {{ field.helpText }}
            </p>
          </el-form-item>
        </template>
      </SmartFormGrid>
    </el-form>
  </FormWizardLayout>

  <section v-else class="surface-card p-4 md:p-5">
    <header class="mb-4">
      <h2 class="section-title">{{ title }}</h2>
      <p v-if="subtitle" class="mt-1 text-sm text-slate-600">{{ subtitle }}</p>
    </header>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-3" />

    <el-form label-position="top" :disabled="loading" @submit.prevent="handleFormSubmit">
      <SmartFormGrid :fields="visibleSchema" :columns="columns">
        <template #default="{ field }">
          <el-form-item :label="field.label" :error="validationErrors[field.key]" class="mb-0">
            <el-alert
              v-if="field.component === 'entity-select' && isFieldEmpty(field.key)"
              :title="`No ${field.label} available.`"
              type="warning"
              show-icon
              :closable="false"
              class="mb-3"
            >
              <template #default>
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    You need to create at least one {{ field.label.toLowerCase() }} before you can
                    continue.
                  </span>
                  <el-button
                    v-if="field.createRoute"
                    type="warning"
                    plain
                    @click="goToCreateForField(field.createRoute, field.key)"
                  >
                    Create {{ field.label }}
                  </el-button>
                </div>
              </template>
            </el-alert>

            <div
              v-if="field.component === 'section'"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
            >
              <h3 class="text-base font-semibold text-slate-900">
                {{ field.label }}
              </h3>
              <p v-if="field.description" class="mt-1 text-sm text-slate-500">
                {{ field.description }}
              </p>
            </div>

            <el-input
              v-else-if="!field.component || field.component === 'input'"
              :model-value="internalModel[field.key]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder || ''"
              :rows="field.rows || 3"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <el-input
              v-else-if="field.component === 'textarea'"
              :model-value="internalModel[field.key]"
              type="textarea"
              :placeholder="field.placeholder || ''"
              :rows="field.rows || 4"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <EntityRelationshipSelect
              v-else-if="field.component === 'entity-select'"
              :model-value="internalModel[field.key]"
              :field="field"
              :model="internalModel"
              :disabled="loading"
              @update:model-value="updateFieldValue(field.key, $event)"
              @empty="onFieldEmpty(field.key, $event)"
            />

            <AppTagInputField
              v-else-if="field.component === 'tag-input'"
              :model-value="internalModel[field.key]"
              :placeholder="field.placeholder || 'Add tags and press Enter'"
              :disabled="loading"
              :max-collapse-tags="field.maxCollapseTags || 3"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <AppFileUploadField
              v-else-if="field.component === 'file-upload'"
              :model-value="internalModel[field.key]"
              :field="field"
              :disabled="loading"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <AppRepeatableListField
              v-else-if="field.component === 'repeatable-list'"
              :model-value="internalModel[field.key]"
              :field="field"
              :disabled="loading"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <el-select
              v-else-if="field.component === 'select'"
              :model-value="internalModel[field.key]"
              :placeholder="field.placeholder || 'Select option'"
              class="w-full"
              @update:model-value="updateFieldValue(field.key, $event)"
            >
              <el-option
                v-for="option in field.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>

            <el-switch
              v-else-if="field.component === 'switch'"
              :model-value="Boolean(internalModel[field.key])"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <el-date-picker
              v-else-if="field.component === 'date'"
              :model-value="internalModel[field.key]"
              type="date"
              value-format="YYYY-MM-DD"
              class="w-full"
              @update:model-value="updateFieldValue(field.key, $event)"
            />

            <p v-if="field.helpText" class="mt-2 text-xs text-slate-500">
              {{ field.helpText }}
            </p>
          </el-form-item>
        </template>
      </SmartFormGrid>

      <div class="mt-6 pt-5 border-t border-slate-100 flex flex-wrap justify-end gap-3">
        <el-button v-if="showCancel" @click="$emit('cancel')">{{ cancelLabel }}</el-button>
        <el-button type="primary" :loading="loading" @click="submit">{{ submitLabel }}</el-button>
      </div>
    </el-form>
  </section>
</template>
