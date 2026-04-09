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

function changeLimit(event) {
  const nextLimit = Number(event?.target?.value || 20)
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
        <select :value="pagination?.limit || 20" @change="changeLimit">
          <option v-for="option in limitOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <button
        class="btn"
        type="button"
        :disabled="loading || (pagination?.page || 1) <= 1"
        @click="prev"
      >
        Prev
      </button>
      <button
        class="btn"
        type="button"
        :disabled="loading || (pagination?.page || 1) >= (pagination?.totalPages || 1)"
        @click="next"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.table-pagination {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.summary {
  color: var(--fcc-text-muted);
  font-size: 0.85rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.limit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--fcc-text-muted);
}

.limit select {
  border: 1px solid var(--fcc-border);
  border-radius: 0.375rem;
  padding: 0.3rem 0.45rem;
  background: var(--fcc-surface);
  color: var(--fcc-text);
}

.btn {
  border: 1px solid var(--fcc-border);
  border-radius: 0.375rem;
  padding: 0.35rem 0.65rem;
  background: var(--fcc-surface);
  color: var(--fcc-text);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
