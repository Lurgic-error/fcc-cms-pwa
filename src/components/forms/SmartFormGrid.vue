<script setup>
import { computed } from 'vue'

const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
  columns: {
    type: Number,
    default: 2,
  },
})

const visibleFields = computed(() =>
  (Array.isArray(props.fields) ? props.fields : []).filter(
    (field) => field && field.hidden !== true && field.visible !== false,
  ),
)

const FULL_WIDTH_COMPONENTS = new Set([
  'section',
  'textarea',
  'file-upload',
  'repeatable-list',
  'editor',
  'rich-text',
  'upload',
  'image-upload',
  'document-upload',
])

function shouldSpanFullWidth(field = {}) {
  if (!field || typeof field !== 'object') return false
  if (field.fullWidth) return true
  if (FULL_WIDTH_COMPONENTS.has(field.component)) return true
  return field.type === 'textarea' || field.type === 'file'
}

function splitBalanced(group, maxColumns) {
  if (!group.length) return []

  const safeMaxColumns = Math.max(1, Math.min(maxColumns, 4))
  if (group.length <= safeMaxColumns) return [group]

  const rows = []
  let remaining = [...group]

  while (remaining.length > 0) {
    if (remaining.length <= safeMaxColumns) {
      rows.push(remaining)
      break
    }

    if (remaining.length % safeMaxColumns === 1) {
      const rowSize = Math.max(2, safeMaxColumns - 1)
      rows.push(remaining.slice(0, rowSize))
      remaining = remaining.slice(rowSize)
      continue
    }

    rows.push(remaining.slice(0, safeMaxColumns))
    remaining = remaining.slice(safeMaxColumns)
  }

  return rows
}

const rows = computed(() => {
  const result = []
  let currentGroup = []

  function flushCurrentGroup() {
    if (!currentGroup.length) return
    result.push(...splitBalanced(currentGroup, props.columns))
    currentGroup = []
  }

  for (const field of visibleFields.value) {
    if (shouldSpanFullWidth(field)) {
      flushCurrentGroup()
      result.push([field])
      continue
    }

    currentGroup.push(field)
  }

  flushCurrentGroup()
  return result
})

function getRowClasses(row) {
  const columns = Math.min(Math.max(row.length, 1), 4)

  return {
    'smart-form-grid__row--1': columns === 1,
    'smart-form-grid__row--2': columns === 2,
    'smart-form-grid__row--3': columns === 3,
    'smart-form-grid__row--4': columns >= 4,
  }
}
</script>

<template>
  <div class="smart-form-grid">
    <div
      v-for="(row, rowIndex) in rows"
      :key="`row-${rowIndex}`"
      class="smart-form-grid__row"
      :class="getRowClasses(row)"
    >
      <slot v-for="field in row" :key="field.key || field.label" :field="field" />
    </div>
  </div>
</template>
