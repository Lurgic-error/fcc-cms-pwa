<script setup>
import Chart from 'chart.js/auto'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

const palette = Object.freeze([
  '#0f766e',
  '#14b8a6',
  '#0ea5e9',
  '#f59e0b',
  '#f97316',
  '#ef4444',
  '#1d4ed8',
  '#475569',
])

const props = defineProps({
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'line', 'pie'].includes(value),
  },
  data: { type: Array, default: () => [] },
  height: { type: [Number, String], default: '100%' },
  chartOptions: { type: Object, default: () => ({}) },
  emptyDescription: { type: String, default: 'No chart data available.' },
})

const canvasRef = ref(null)
const chartInstance = shallowRef(null)

const normalizedData = computed(() =>
  (Array.isArray(props.data) ? props.data : [])
    .map((item, index) => ({
      key: item?.key || item?.label || `item-${index}`,
      label: String(item?.label || item?.key || `Item ${index + 1}`),
      value: Number(item?.value || 0),
      color: item?.color || palette[index % palette.length],
    }))
    .filter((item) =>
      props.type === 'pie'
        ? Number.isFinite(item.value) && item.value > 0
        : item.label && Number.isFinite(item.value),
    ),
)

const hasData = computed(() => normalizedData.value.length > 0)
const canvasHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
)

function withAlpha(color, alpha) {
  if (!String(color || '').startsWith('#')) return color

  const hex = color.replace('#', '')
  const normalizedHex =
    hex.length === 3
      ? hex
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : hex

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16)
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16)
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function mergeChartOptions(base, overrides = {}) {
  const scales = { ...(base.scales || {}), ...(overrides.scales || {}) }

  ;['x', 'y', 'r'].forEach((axis) => {
    if (base.scales?.[axis] || overrides.scales?.[axis]) {
      scales[axis] = {
        ...(base.scales?.[axis] || {}),
        ...(overrides.scales?.[axis] || {}),
      }
    }
  })

  return {
    ...base,
    ...overrides,
    plugins: {
      ...(base.plugins || {}),
      ...(overrides.plugins || {}),
      legend: {
        ...(base.plugins?.legend || {}),
        ...(overrides.plugins?.legend || {}),
      },
      tooltip: {
        ...(base.plugins?.tooltip || {}),
        ...(overrides.plugins?.tooltip || {}),
      },
    },
    scales,
  }
}

function destroyChart() {
  if (!chartInstance.value) return

  chartInstance.value.destroy()
  chartInstance.value = null
}

function createLineGradient(context) {
  const gradient = context.createLinearGradient(0, 0, 0, context.canvas.height || 280)
  gradient.addColorStop(0, 'rgba(15, 118, 110, 0.35)')
  gradient.addColorStop(1, 'rgba(45, 212, 191, 0.05)')
  return gradient
}

function buildConfig(context) {
  const labels = normalizedData.value.map((item) => item.label)
  const values = normalizedData.value.map((item) => item.value)
  const colors = normalizedData.value.map((item) => item.color)
  const resolvedType = props.type === 'pie' ? 'doughnut' : props.type

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 720,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: props.type === 'line' ? 'index' : 'nearest',
    },
    layout: {
      padding: {
        top: 8,
        right: 8,
        bottom: 2,
        left: 4,
      },
    },
    plugins: {
      legend:
        props.type === 'pie'
          ? {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 8,
                padding: 18,
                color: '#475569',
                font: {
                  size: 12,
                  weight: 600,
                },
              },
            }
          : { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${Number(tooltipItem.raw || 0).toLocaleString()}`,
        },
      },
    },
    scales:
      props.type === 'pie'
        ? {}
        : {
            x: {
              ticks: {
                color: '#64748b',
                maxRotation: 0,
                minRotation: 0,
                font: {
                  size: 11,
                  weight: 600,
                },
              },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#64748b',
                precision: 0,
                font: {
                  size: 11,
                  weight: 600,
                },
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.18)',
                drawBorder: false,
              },
              border: { display: false },
            },
          },
  }

  if (resolvedType === 'line') {
    return {
      type: resolvedType,
      data: {
        labels,
        datasets: [
          {
            label: 'Visitors',
            data: values,
            fill: true,
            borderColor: '#0f766e',
            backgroundColor: createLineGradient(context),
            pointBackgroundColor: '#0f766e',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointRadius: 4,
            borderWidth: 3,
            tension: 0.38,
          },
        ],
      },
      options: mergeChartOptions(baseOptions, props.chartOptions),
    }
  }

  if (resolvedType === 'doughnut') {
    return {
      type: resolvedType,
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors.map((color) => withAlpha(color, 0.88)),
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 10,
            spacing: 2,
          },
        ],
      },
      options: mergeChartOptions(
        {
          ...baseOptions,
          cutout: '68%',
        },
        props.chartOptions,
      ),
    }
  }

  return {
    type: resolvedType,
    data: {
      labels,
      datasets: [
        {
          label: 'Visitors',
          data: values,
          backgroundColor: colors.map((color) => withAlpha(color, 0.82)),
          borderColor: colors,
          borderWidth: 1.5,
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 34,
          hoverBackgroundColor: colors,
        },
      ],
    },
    options: mergeChartOptions(baseOptions, props.chartOptions),
  }
}

function renderChart() {
  destroyChart()

  if (!hasData.value || !canvasRef.value) return

  const context = canvasRef.value.getContext('2d')
  if (!context) return

  chartInstance.value = new Chart(context, buildConfig(context))
}

watch(
  [normalizedData, () => props.type, () => props.height, () => props.chartOptions],
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()
  renderChart()
})

onBeforeUnmount(destroyChart)
</script>

<template>
  <div v-if="hasData" class="chart-canvas" :style="{ height: canvasHeight }">
    <canvas ref="canvasRef" />
  </div>

  <el-empty v-else :description="emptyDescription" :image-size="72" />
</template>

<style scoped>
.chart-canvas {
  position: relative;
  width: 100%;
}
</style>
