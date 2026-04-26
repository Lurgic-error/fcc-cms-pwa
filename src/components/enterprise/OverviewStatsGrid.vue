<script setup>
import { computed } from 'vue'
import { formatNumber } from '@/utils/adminPresentation'

const props = defineProps({
  stats: { type: Array, default: () => [] },
})

const gridClass = computed(() => {
  const count = props.stats.length
  if (count <= 1) return 'enterprise-overview-stats--1'
  if (count === 2) return 'enterprise-overview-stats--2'
  if (count === 3) return 'enterprise-overview-stats--3'
  if (count === 4) return 'enterprise-overview-stats--4'
  if (count === 5) return 'enterprise-overview-stats--5'
  if (count >= 6) return 'enterprise-overview-stats--6'
  return 'enterprise-overview-stats--4'
})
</script>

<template>
  <section class="enterprise-overview-stats" :class="gridClass">
    <article
      v-for="stat in stats"
      :key="stat.key"
      class="enterprise-stat-card"
    >
      <p class="enterprise-stat-card__label">
        {{ stat.label }}
      </p>
      <p class="enterprise-stat-card__value">
        {{ formatNumber(stat.value) }}
      </p>
      <p v-if="stat.helper" class="enterprise-stat-card__helper">
        {{ stat.helper }}
      </p>
    </article>
  </section>
</template>
