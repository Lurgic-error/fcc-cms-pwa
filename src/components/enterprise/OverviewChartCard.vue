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
  <section class="enterprise-chart-card">
    <header class="enterprise-chart-card__header">
      <h3 class="enterprise-chart-card__title">{{ title }}</h3>
      <p v-if="description" class="enterprise-chart-card__description">
        {{ description }}
      </p>
    </header>

    <div class="enterprise-chart-card__body">
      <component :is="chartComponent" :data="data" :height="height" :chart-options="chartOptions" />
    </div>
  </section>
</template>
