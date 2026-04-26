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

  if (props.columns === 1 || count <= 1) return 'app-bento-grid--1'
  if (props.columns === 2 || count === 2) return 'app-bento-grid--2'
  if (props.columns === 3 || count === 3) return 'app-bento-grid--3'
  if (props.columns === 4 || count === 4) return 'app-bento-grid--4'
  if (count === 5) return 'app-bento-grid--5'

  // Auto mode logic for bento grids
  if (count === 2) return 'app-bento-grid--feature-split'

  return 'app-bento-grid--auto'
})
</script>

<template>
  <div
    ref="containerRef"
    class="app-bento-grid"
    :class="gridClass"
  >
    <slot />
  </div>
</template>
