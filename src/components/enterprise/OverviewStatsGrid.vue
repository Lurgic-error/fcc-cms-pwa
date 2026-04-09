<script setup>
import { computed } from 'vue'
import { formatNumber } from '@/utils/adminPresentation'

const props = defineProps({
  stats: { type: Array, default: () => [] },
})

const gridClass = computed(() => {
  const count = props.stats.length
  if (count <= 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  if (count === 3) return 'grid-cols-1 md:grid-cols-3'
  if (count === 4) return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
  if (count === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  if (count >= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
})
</script>

<template>
  <section class="grid gap-4" :class="gridClass">
    <article
      v-for="stat in stats"
      :key="stat.key"
      class="border p-5 shadow-sm transition-shadow hover:shadow-md"
      style="
        background-color: var(--fcc-surface);
        border-color: var(--fcc-border);
        border-radius: var(--fcc-radius-lg);
      "
    >
      <p
        class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
      >
        {{ stat.label }}
      </p>
      <p class="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
        {{ formatNumber(stat.value) }}
      </p>
      <p v-if="stat.helper" class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {{ stat.helper }}
      </p>
    </article>
  </section>
</template>
