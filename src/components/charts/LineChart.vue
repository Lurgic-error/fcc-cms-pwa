<script setup>
import BaseChart from './BaseChart.vue'

defineProps({
  data: { type: Array, default: () => [] },
  height: { type: [Number, String], default: 280 },
  chartOptions: { type: Object, default: () => ({}) },
})
</script>

<template>
  <BaseChart type="line" :data="data" :height="height" :chart-options="chartOptions" />
</template>
