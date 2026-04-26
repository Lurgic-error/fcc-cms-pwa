<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number, Boolean, null, undefined],
    default: undefined,
  },
  direction: {
    type: String,
    default: 'vertical', // 'vertical' or 'horizontal'
  },
  colSpan: {
    type: [Number, String],
    default: 1, // 1, 2, 'full'
  },
})
</script>

<template>
  <div
    class="detail-item"
    :class="[
      direction === 'horizontal' ? 'detail-item--horizontal' : 'detail-item--vertical',
      colSpan === 2 ? 'detail-item--span-2' : '',
      colSpan === 'full' ? 'detail-item--full' : '',
    ]"
  >
    <dt
      class="detail-item__label"
      :class="[direction === 'horizontal' ? 'detail-item__label--horizontal' : '']"
    >
      {{ label }}
    </dt>
    <dd
      class="detail-item__value"
      :class="[direction === 'horizontal' ? 'detail-item__value--horizontal' : '']"
    >
      <slot>
        <span v-if="value !== undefined && value !== null && value !== ''">{{ value }}</span>
        <span v-else class="detail-item__fallback">Not provided</span>
      </slot>
    </dd>
  </div>
</template>
