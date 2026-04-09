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

// Chunk fields into balanced rows based on visibility and fullWidth directives
const rows = computed(() => {
  const result = []
  let currentRow = []

  for (const field of props.fields) {
    // Treat sections and explicitly fullWidth items as breaking the current row
    if (field.component === 'section' || field.fullWidth) {
      if (currentRow.length > 0) {
        result.push([...currentRow])
        currentRow = []
      }
      result.push([field])
    } else {
      currentRow.push(field)
      if (currentRow.length >= props.columns) {
        result.push([...currentRow])
        currentRow = []
      }
    }
  }

  if (currentRow.length > 0) {
    result.push([...currentRow])
  }

  return result
})

function getGridClass(row) {
  const len = row.length
  // If only 1 field is in the row, it spans full width
  if (len === 1) return 'grid-cols-1'
  // If 2 fields, split 2
  if (len === 2) return 'grid-cols-1 md:grid-cols-2'
  // If 3 fields, split 3
  if (len === 3) return 'grid-cols-1 md:grid-cols-3'
  // If 4 fields, split 4
  if (len >= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return 'grid-cols-1 md:grid-cols-2'
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="(row, rowIndex) in rows"
      :key="`row-${rowIndex}`"
      class="grid gap-x-6 gap-y-4"
      :class="getGridClass(row)"
    >
      <slot v-for="field in row" :key="field.key || field.label" :field="field" />
    </div>
  </div>
</template>
