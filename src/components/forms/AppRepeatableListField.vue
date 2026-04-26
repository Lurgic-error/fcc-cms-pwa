<script setup>
import { ArrowDown, ArrowUp, Delete, EditPen, Plus } from '@element-plus/icons-vue'
import { computed, reactive, ref } from 'vue'

import EntitySchemaFields from './EntitySchemaFields.vue'
import {
  normalizeUploadValue,
  resolveUploadItemName,
  resolveUploadItemUrl,
} from './appFileUploadFieldState'

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

const dialogOpen = ref(false)
const editingIndex = ref(-1)
const dialogMode = ref('create')
const draftItem = reactive({})
const draftErrors = reactive({})
const draftEmptyFields = reactive({})

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function cloneValue(value) {
  if (value instanceof File) return value
  if (Array.isArray(value)) return value.map((item) => cloneValue(item))
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneValue(item)]),
    )
  }

  return value
}

function splitKeyPath(path = '') {
  return String(path)
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function getValueByPath(source, path, fallback = undefined) {
  if (!path) return source ?? fallback

  const value = splitKeyPath(path).reduce((current, segment) => current?.[segment], source)
  return value === undefined ? fallback : value
}

function setValueByPath(target, path, value) {
  const segments = splitKeyPath(path)
  if (!segments.length) return target

  let current = target

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value
      return
    }

    if (!isPlainObject(current[segment]) && !Array.isArray(current[segment])) {
      current[segment] = {}
    }

    current = current[segment]
  })

  return target
}

function defaultFieldValue(field = {}) {
  if (field.default !== undefined) return cloneValue(field.default)
  if (field.component === 'tag-input') return []
  if (field.component === 'switch') return false
  if (field.component === 'file-upload') return field.multiple === false ? null : []
  return ''
}

const itemSchema = computed(() => {
  if (Array.isArray(props.field?.itemSchema) && props.field.itemSchema.length) {
    return props.field.itemSchema.filter(
      (itemField) => itemField?.component !== 'section' && itemField?.hidden !== true,
    )
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

const tableColumns = computed(() =>
  itemSchema.value.filter((itemField) => itemField?.key && itemField?.tableHidden !== true),
)

const dialogTitle = computed(() =>
  dialogMode.value === 'edit'
    ? `Edit ${props.field?.itemTitle || 'item'}`
    : `Add ${props.field?.itemTitle || 'item'}`,
)

function createEmptyItem() {
  return itemSchema.value.reduce((item, field) => {
    setValueByPath(item, field.key, defaultFieldValue(field))
    return item
  }, {})
}

function normalizeItem(item) {
  if (usesPrimitiveValues.value) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const nextItem = cloneValue(item)
      if (getValueByPath(nextItem, itemSchema.value[0].key) === undefined) {
        setValueByPath(nextItem, itemSchema.value[0].key, defaultFieldValue(itemSchema.value[0]))
      }
      return nextItem
    }

    const nextItem = createEmptyItem()
    setValueByPath(nextItem, itemSchema.value[0].key, item == null ? '' : String(item))
    return nextItem
  }

  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const nextItem = cloneValue(item)
    itemSchema.value.forEach((itemField) => {
      if (getValueByPath(nextItem, itemField.key) === undefined) {
        setValueByPath(nextItem, itemField.key, defaultFieldValue(itemField))
      }
    })
    return nextItem
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
      nextItems.map((item) => getValueByPath(item, itemSchema.value[0].key, '') || ''),
    )
    return
  }

  emit('update:modelValue', nextItems)
}

function clearDraftErrors() {
  Object.keys(draftErrors).forEach((key) => delete draftErrors[key])
}

function clearDraftEmptyFields() {
  Object.keys(draftEmptyFields).forEach((key) => delete draftEmptyFields[key])
}

function syncDraft(item = createEmptyItem()) {
  Object.keys(draftItem).forEach((key) => delete draftItem[key])
  Object.assign(draftItem, normalizeItem(item))
  clearDraftErrors()
  clearDraftEmptyFields()
}

function openCreate() {
  dialogMode.value = 'create'
  editingIndex.value = -1
  syncDraft(createEmptyItem())
  dialogOpen.value = true
}

function openEdit(index) {
  const item = normalizedItems.value[index]
  if (!item) return

  dialogMode.value = 'edit'
  editingIndex.value = index
  syncDraft(item)
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  editingIndex.value = -1
  clearDraftErrors()
  clearDraftEmptyFields()
}

function updateDraftValue(key, value) {
  setValueByPath(draftItem, key, value)
  if (draftErrors[key]) delete draftErrors[key]
}

function getDraftValue(key, fallback = '') {
  return getValueByPath(draftItem, key, fallback)
}

function resolveDraftValue(_model, key, fallback = '') {
  return getDraftValue(key, fallback)
}

function onDraftFieldEmpty(fieldKey, isEmpty) {
  if (isEmpty) {
    draftEmptyFields[fieldKey] = true
    return
  }

  delete draftEmptyFields[fieldKey]
}

function isValueEmpty(value) {
  return (
    value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)
  )
}

function validateDraft() {
  clearDraftErrors()
  let valid = true

  itemSchema.value.forEach((itemField) => {
    if (!itemField?.required) return
    if (isValueEmpty(getValueByPath(draftItem, itemField.key))) {
      draftErrors[itemField.key] = `${itemField.label} is required.`
      valid = false
    }
  })

  return valid
}

function saveDraftItem() {
  if (!validateDraft()) return

  const nextItems = normalizedItems.value.map((item) => ({ ...item }))
  const payload = normalizeItem(draftItem)

  if (editingIndex.value >= 0) {
    nextItems.splice(editingIndex.value, 1, payload)
  } else {
    nextItems.push(payload)
  }

  emitItems(nextItems)
  closeDialog()
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

function resolveColumnMinWidth(inputField = {}) {
  if (inputField?.columnMinWidth) return inputField.columnMinWidth
  if (inputField?.columnWidth) return inputField.columnWidth
  if (inputField?.component === 'textarea') return 280
  if (inputField?.component === 'file-upload') return 220
  if (inputField?.component === 'switch') return 120
  if (
    inputField?.component === 'date' ||
    inputField?.type === 'date' ||
    inputField?.type === 'time'
  ) {
    return 140
  }

  return 160
}

function formatCellValue(item, inputField) {
  const value = getValueByPath(item, inputField.key)

  if (typeof inputField?.tableValue === 'function') {
    return inputField.tableValue(value, item)
  }

  if (inputField?.component === 'file-upload') {
    const files = normalizeUploadValue(value)
    if (!files.length) return '—'
    return files.map((file, index) => resolveUploadItemName(file, index)).join(', ')
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (value === null || value === undefined || value === '') {
    return '—'
  }

  return String(value)
}

function isFileColumn(inputField = {}) {
  return inputField?.component === 'file-upload'
}

function isImageColumn(inputField = {}) {
  return isFileColumn(inputField) && String(inputField?.accept || '').includes('image')
}

function resolveCellPreviewUrl(item, inputField) {
  if (!isImageColumn(inputField)) return ''

  const [file] = normalizeUploadValue(getValueByPath(item, inputField.key))
  return resolveUploadItemUrl(file)
}
</script>

<template>
  <div class="repeatable-table-field">
    <div class="repeatable-table-field__header">
      <div class="repeatable-table-field__copy">
        <p v-if="field.itemDescription" class="repeatable-table-field__description">
          {{ field.itemDescription }}
        </p>
      </div>

      <el-button size="large" plain :disabled="disabled" @click="openCreate">
        <el-icon class="repeatable-table-field__add-icon"><Plus /></el-icon>
        {{ field.addLabel || 'Add item' }}
      </el-button>
    </div>

    <div v-if="normalizedItems.length" class="repeatable-table-field__table-wrap">
      <el-table :data="normalizedItems" size="small" stripe class="repeatable-table-field__table">
        <el-table-column
          v-for="inputField in tableColumns"
          :key="inputField.key"
          :label="inputField.tableLabel || inputField.label"
          :min-width="resolveColumnMinWidth(inputField)"
          show-overflow-tooltip
          :width="inputField.columnWidth"
        >
          <template #default="{ row }">
            <div
              v-if="isFileColumn(inputField)"
              class="repeatable-table-field__media-cell"
              :class="{ 'repeatable-table-field__media-cell--image': isImageColumn(inputField) }"
            >
              <img
                v-if="resolveCellPreviewUrl(row, inputField)"
                :src="resolveCellPreviewUrl(row, inputField)"
                :alt="formatCellValue(row, inputField)"
                class="repeatable-table-field__media-preview"
              />
              <span>{{ formatCellValue(row, inputField) }}</span>
            </div>
            <span v-else>{{ formatCellValue(row, inputField) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="152" fixed="right">
          <template #default="{ $index }">
            <div class="repeatable-table-field__actions">
              <el-button
                link
                :disabled="disabled || $index === 0"
                aria-label="Move item up"
                title="Move up"
                @click="moveItem($index, -1)"
              >
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button
                link
                :disabled="disabled || $index === normalizedItems.length - 1"
                aria-label="Move item down"
                title="Move down"
                @click="moveItem($index, 1)"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button
                link
                :disabled="disabled"
                aria-label="Edit item"
                title="Edit"
                @click="openEdit($index)"
              >
                <el-icon><EditPen /></el-icon>
              </el-button>
              <el-popconfirm
                title="Remove this item?"
                confirm-button-text="Remove"
                cancel-button-text="Cancel"
                @confirm="removeItem($index)"
              >
                <template #reference>
                  <el-button
                    link
                    type="danger"
                    :disabled="disabled"
                    aria-label="Delete item"
                    title="Delete"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-empty
      v-else
      :description="field.emptyDescription || 'No items added yet.'"
      class="repeatable-table-field__empty"
    >
      <el-button size="large" type="primary" plain :disabled="disabled" @click="openCreate">
        {{ field.addLabel || 'Add item' }}
      </el-button>
    </el-empty>

    <el-dialog
      v-model="dialogOpen"
      :title="dialogTitle"
      :width="'min(46rem, calc(100vw - 2rem))'"
      append-to-body
      destroy-on-close
      class="repeatable-table-field__dialog"
      @closed="closeDialog"
    >
      <el-form label-position="top" :disabled="disabled">
        <EntitySchemaFields
          :fields="itemSchema"
          :columns="2"
          :model="draftItem"
          :loading="disabled"
          :validation-errors="draftErrors"
          :empty-fields="draftEmptyFields"
          :value-resolver="resolveDraftValue"
          @update-field="updateDraftValue"
          @field-empty="onDraftFieldEmpty"
        />
      </el-form>

      <template #footer>
        <div class="repeatable-table-field__dialog-actions">
          <el-button size="large" plain @click="closeDialog">Cancel</el-button>
          <el-button size="large" type="primary" @click="saveDraftItem">
            {{ dialogMode === 'edit' ? 'Save Changes' : 'Add Item' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
