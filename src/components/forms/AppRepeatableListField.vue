<script setup>
import { Delete, Plus, Rank } from '@element-plus/icons-vue'
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  field: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const itemSchema = computed(() => {
  if (Array.isArray(props.field?.itemSchema) && props.field.itemSchema.length) {
    return props.field.itemSchema
  }

  return [
    {
      key: 'value',
      label: props.field?.itemLabel || 'Item',
      component: 'input',
      placeholder: props.field?.placeholder || 'Add item',
    },
  ]
})

const usesPrimitiveValues = computed(
  () => props.field?.valueMode === 'primitive' && itemSchema.value.length === 1,
)

function createEmptyItem() {
  return Object.fromEntries(itemSchema.value.map((item) => [item.key, '']))
}

function normalizeItem(item) {
  if (usesPrimitiveValues.value) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return { ...createEmptyItem(), ...item }
    }

    return {
      [itemSchema.value[0].key]: item == null ? '' : String(item),
    }
  }

  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return { ...createEmptyItem(), ...item }
  }

  return createEmptyItem()
}

const normalizedItems = computed(() =>
  (Array.isArray(props.modelValue) ? props.modelValue : []).map((item) => normalizeItem(item)),
)

function emitItems(items = []) {
  const nextItems = items.map((item) => normalizeItem(item))

  if (usesPrimitiveValues.value) {
    emit(
      'update:modelValue',
      nextItems.map((item) => item[itemSchema.value[0].key] || ''),
    )
    return
  }

  emit('update:modelValue', nextItems)
}

function updateItemValue(index, key, value) {
  const nextItems = normalizedItems.value.map((item, itemIndex) =>
    itemIndex === index ? { ...item, [key]: value } : { ...item },
  )
  emitItems(nextItems)
}

function addItem() {
  emitItems([...normalizedItems.value, createEmptyItem()])
}

function removeItem(index) {
  emitItems(normalizedItems.value.filter((_, itemIndex) => itemIndex !== index))
}

function moveItem(index, direction) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= normalizedItems.value.length) return

  const nextItems = normalizedItems.value.map((item) => ({ ...item }))
  const [movedItem] = nextItems.splice(index, 1)
  nextItems.splice(nextIndex, 0, movedItem)
  emitItems(nextItems)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(item, index) in normalizedItems"
      :key="`${field.key || 'repeatable'}-${index}`"
      class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-900">
            {{ field.itemTitle || 'Item' }} {{ index + 1 }}
          </p>
          <p v-if="field.itemDescription" class="text-xs text-slate-500">
            {{ field.itemDescription }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <el-button
            circle
            plain
            size="small"
            :disabled="disabled || index === 0"
            @click="moveItem(index, -1)"
          >
            <el-icon><Rank /></el-icon>
          </el-button>
          <el-button
            circle
            plain
            size="small"
            :disabled="disabled || index === normalizedItems.length - 1"
            @click="moveItem(index, 1)"
          >
            <el-icon class="rotate-180"><Rank /></el-icon>
          </el-button>
          <el-button
            circle
            plain
            size="small"
            type="danger"
            :disabled="disabled"
            @click="removeItem(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <div
        class="grid gap-4"
        :class="itemSchema.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'"
      >
        <div v-for="inputField in itemSchema" :key="`${index}-${inputField.key}`">
          <label class="mb-1 block text-sm font-medium text-slate-700">{{
            inputField.label
          }}</label>
          <el-input
            v-if="inputField.component !== 'textarea'"
            :model-value="item[inputField.key]"
            :type="inputField.type || 'text'"
            :disabled="disabled"
            :placeholder="inputField.placeholder || ''"
            @update:model-value="updateItemValue(index, inputField.key, $event)"
          />
          <el-input
            v-else
            :model-value="item[inputField.key]"
            type="textarea"
            :rows="inputField.rows || 4"
            :disabled="disabled"
            :placeholder="inputField.placeholder || ''"
            @update:model-value="updateItemValue(index, inputField.key, $event)"
          />
        </div>
      </div>
    </div>

    <el-button plain :disabled="disabled" @click="addItem">
      <el-icon class="mr-2"><Plus /></el-icon>
      {{ field.addLabel || 'Add item' }}
    </el-button>
  </div>
</template>
