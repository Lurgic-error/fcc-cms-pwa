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

  if (props.columns === 1 || count <= 1) return 'detail-grid--1'
  if (props.columns === 2 || count === 2) return 'detail-grid--2'
  if (props.columns === 3 || count === 3) return 'detail-grid--3'

  if (props.columns === 4 || count === 4) return 'detail-grid--4'

  if (count === 5) return 'detail-grid--5'

  if (count >= 6) return 'detail-grid--6'

  return 'detail-grid--4'
})
</script>

<template>
  <div ref="containerRef" class="detail-grid" :class="gridClass">
    <slot />
  </div>
</template>
