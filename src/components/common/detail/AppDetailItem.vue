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
    class="detail-item group"
    :class="[
      direction === 'horizontal'
        ? 'flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 first:pt-0'
        : 'flex flex-col gap-1.5',
      colSpan === 2 ? 'md:col-span-2' : '',
      colSpan === 'full' ? 'col-span-full' : '',
    ]"
  >
    <dt
      class="text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0"
      :class="[direction === 'horizontal' ? 'w-1/3 max-w-[200px]' : '']"
    >
      {{ label }}
    </dt>
    <dd
      class="text-sm text-slate-900 dark:text-slate-100 break-words"
      :class="[direction === 'horizontal' ? 'flex-1 text-right sm:text-left' : '']"
    >
      <slot>
        <span v-if="value !== undefined && value !== null && value !== ''">{{ value }}</span>
        <span v-else class="text-slate-400 dark:text-slate-600 italic">Not provided</span>
      </slot>
    </dd>
  </div>
</template>
