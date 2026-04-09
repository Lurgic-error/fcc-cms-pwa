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

  if (count <= 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  if (count === 3) return 'grid-cols-1 md:grid-cols-3'
  if (count >= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return 'grid-cols-1 md:grid-cols-2'
})
</script>

<template>
  <div
    ref="containerRef"
    class="grid gap-x-6 gap-y-4 transition-all duration-300"
    :class="gridClass"
  >
    <slot />
  </div>
</template>
