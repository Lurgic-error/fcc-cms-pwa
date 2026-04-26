<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object, Boolean],
    default: '',
  },
  field: { type: Object, default: () => ({}) },
  model: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'empty'])

const options = ref([])
const loading = ref(false)

function resolveLabel(item) {
  if (typeof props.field?.optionLabel === 'function') {
    return props.field.optionLabel(item)
  }

  return (
    item?.label ||
    item?.name?.en ||
    item?.name?.sw ||
    item?.title?.en ||
    item?.title?.sw ||
    item?.name ||
    item?.title ||
    item?.systemKey ||
    item?.code ||
    item?.id ||
    item?._id ||
    ''
  )
}

function resolveValue(item) {
  if (typeof props.field?.optionValue === 'function') {
    return props.field.optionValue(item)
  }

  return (
    item?.value ??
    item?._id ??
    item?.id ??
    item?.categoryId ??
    item?.directorateId ??
    item?.sectionId ??
    item?.unitId ??
    item?.officeId ??
    item?.commissionerId ??
    item
  )
}

function normalizeOptions(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    label: resolveLabel(item),
    value: resolveValue(item),
  }))
}

async function loadOptions() {
  if (typeof props.field?.loadOptions !== 'function') {
    options.value = normalizeOptions(props.field?.options || [])
    return
  }

  loading.value = true

  try {
    const result = await props.field.loadOptions({
      model: props.model || {},
      value: props.modelValue,
    })
    const normalized = normalizeOptions(result?.items || result?.options || result || [])
    options.value = normalized
    if (normalized.length === 0) {
      emit('empty', true)
    } else {
      emit('empty', false)
    }
  } catch {
    options.value = []
    emit('empty', true)
  } finally {
    loading.value = false
  }
}

const dependencySignature = computed(() =>
  JSON.stringify((props.field?.dependsOn || []).map((key) => props.model?.[key] ?? null)),
)

watch(
  [() => props.field, dependencySignature],
  () => {
    loadOptions()
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <el-select
    :model-value="modelValue"
    :placeholder="field.placeholder || 'Select option'"
    size="large"
    :loading="loading"
    :disabled="disabled"
    filterable
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-option
      v-for="option in options"
      :key="`${option.value}`"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>
