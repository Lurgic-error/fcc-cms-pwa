<script setup>
import { computed, ref, onMounted, onUpdated } from 'vue'

const props = defineProps({
  columns: {
    type: [Number, String],
    default: 'auto', // 1, 2, 3, 4, or 'auto'
  },
})

const containerRef = ref(null)
const visibleCount = ref(typeof props.columns === 'number' ? props.columns : 4)

function updateCount() {
  if (!containerRef.value) return
  visibleCount.value = containerRef.value.children.length
}

onMounted(updateCount)
onUpdated(updateCount)

const gridClass = computed(() => {
  const count = visibleCount.value

  if (props.columns === 1 || count <= 1) return 'grid-cols-1'
  if (props.columns === 2 || count === 2) return 'grid-cols-1 md:grid-cols-2'
  if (props.columns === 3 || count === 3) return 'grid-cols-1 md:grid-cols-3'

  // If count is exactly 4, or columns is exactly 4
  if (props.columns === 4 || count === 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'

  // If count is exactly 5
  if (count === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'

  // If count is exactly 6 or more
  if (count >= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'

  // Fallback
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
})
</script>

<template>
  <div
    ref="containerRef"
    class="grid gap-x-6 gap-y-6 transition-all duration-300"
    :class="gridClass"
  >
    <slot />
  </div>
</template>
