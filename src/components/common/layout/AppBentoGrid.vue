<script setup>
import { computed, ref, onMounted, onUpdated } from 'vue'

const props = defineProps({
  columns: {
    type: [Number, String],
    default: 'auto', // 1, 2, 3, 4, or 'auto'
  },
})

const containerRef = ref(null)
const visibleCount = ref(typeof props.columns === 'number' ? props.columns : 3)

function updateCount() {
  if (!containerRef.value) return
  visibleCount.value = containerRef.value.children.length
}

onMounted(updateCount)
onUpdated(updateCount)

const gridClass = computed(() => {
  const count = visibleCount.value

  if (props.columns === 1 || count <= 1) return 'grid-cols-1'
  if (props.columns === 2 || count === 2) return 'grid-cols-1 lg:grid-cols-2'
  if (props.columns === 3 || count === 3) return 'grid-cols-1 lg:grid-cols-3'
  if (props.columns === 4 || count === 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
  if (count === 5) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-5' // or something similar

  // Auto mode logic for bento grids
  if (count === 2) return 'grid-cols-1 lg:grid-cols-[1.4fr_1fr]'

  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
})
</script>

<template>
  <div
    ref="containerRef"
    class="grid gap-4 md:gap-5 transition-all duration-300 items-stretch"
    :class="gridClass"
  >
    <slot />
  </div>
</template>
