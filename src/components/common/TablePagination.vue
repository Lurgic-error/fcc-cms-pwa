<script setup>
const props = defineProps({
  pagination: {
    type: Object,
    default: () => ({ page: 1, limit: 20, total: 0, totalPages: 1 }),
  },
  loading: { type: Boolean, default: false },
  limitOptions: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
})

const emit = defineEmits(['update:page', 'update:limit'])

function prev() {
  if (props.loading) return
  if ((props.pagination?.page || 1) <= 1) return
  emit('update:page', (props.pagination?.page || 1) - 1)
}

function next() {
  if (props.loading) return
  const page = props.pagination?.page || 1
  const totalPages = props.pagination?.totalPages || 1
  if (page >= totalPages) return
  emit('update:page', page + 1)
}

function changeLimit(value) {
  const nextLimit = Number(value || 20)
  emit('update:limit', nextLimit)
}
</script>

<template>
  <div class="table-pagination">
    <div class="summary">
      <span>Page {{ pagination?.page || 1 }} / {{ pagination?.totalPages || 1 }}</span>
      <span>· Total {{ pagination?.total || 0 }}</span>
    </div>

    <div class="controls">
      <label class="limit">
        Rows
        <el-select
          :model-value="pagination?.limit || 20"
          size="large"
          class="table-pagination__select"
          :disabled="loading"
          @update:model-value="changeLimit"
        >
          <el-option v-for="option in limitOptions" :key="option" :label="String(option)" :value="option" />
        </el-select>
      </label>

      <el-button
        size="large"
        plain
        :disabled="loading || (pagination?.page || 1) <= 1"
        @click="prev"
      >
        Prev
      </el-button>
      <el-button
        size="large"
        plain
        :disabled="loading || (pagination?.page || 1) >= (pagination?.totalPages || 1)"
        @click="next"
      >
        Next
      </el-button>
    </div>
  </div>
</template>
