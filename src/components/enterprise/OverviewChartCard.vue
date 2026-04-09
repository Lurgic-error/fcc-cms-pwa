<script setup>
import BarChart from '@/components/charts/BarChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'line', 'pie'].includes(value),
  },
  data: { type: Array, default: () => [] },
  height: { type: [Number, String], default: '100%' },
  chartOptions: { type: Object, default: () => ({}) },
})

const chartComponent = computed(() => {
  if (props.type === 'line') return LineChart
  if (props.type === 'pie') return PieChart
  return BarChart
})
</script>

<template>
  <section
    class="overview-chart-card border shadow-sm p-5"
    style="
      background-color: var(--fcc-surface);
      border-color: var(--fcc-border);
      border-radius: var(--fcc-radius-lg);
      box-shadow: var(--fcc-shadow-base);
    "
  >
    <header class="mb-4">
      <h3 class="text-base font-semibold" style="color: var(--fcc-text)">{{ title }}</h3>
      <p v-if="description" class="mt-1 text-sm" style="color: var(--fcc-text-muted)">
        {{ description }}
      </p>
    </header>

    <div class="overview-chart-card__body">
      <component :is="chartComponent" :data="data" :height="height" :chart-options="chartOptions" />
    </div>
  </section>
</template>

<style scoped>
.overview-chart-card {
  display: grid;
  grid-template-rows: auto minmax(14rem, 1fr);
  height: 100%;
}

.overview-chart-card__body {
  min-height: 14rem;
}
</style>
