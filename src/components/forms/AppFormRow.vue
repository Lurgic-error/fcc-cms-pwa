<script setup>
import { computed, ref, onMounted, onUpdated } from 'vue'

const props = defineProps({
  columns: {
    type: Number,
    default: 2,
  },
})

const containerRef = ref(null)
const visibleCount = ref(props.columns) // initialize with expected columns

function updateCount() {
  if (!containerRef.value) return
  visibleCount.value = containerRef.value.children.length
}

onMounted(updateCount)
onUpdated(updateCount)

const gridClass = computed(() => {
  const count = visibleCount.value

  if (count <= 1) return 'app-form-row--1'
  if (count === 2) return 'app-form-row--2'
  if (count === 3) return 'app-form-row--3'
  if (count >= 4) return 'app-form-row--4'

  return 'app-form-row--2'
})
</script>

<template>
  <div
    ref="containerRef"
    class="app-form-row"
    :class="gridClass"
  >
    <slot />
  </div>
</template>
