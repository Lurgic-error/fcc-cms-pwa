<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section
    class="border shadow-sm overflow-hidden flex flex-col"
    style="
      background-color: var(--fcc-surface);
      border-color: var(--fcc-border);
      border-radius: var(--fcc-radius-lg);
      box-shadow: var(--fcc-shadow-base);
    "
  >
    <header
      v-if="title || subtitle || $slots['header-actions']"
      class="px-5 py-4 border-b flex flex-wrap items-start justify-between gap-4"
      style="border-color: var(--fcc-border); background-color: var(--fcc-surface-muted)"
    >
      <div class="min-w-0 flex-1">
        <h3
          v-if="title"
          class="text-base font-semibold text-slate-900 dark:text-slate-100 leading-6"
          style="color: var(--fcc-text)"
        >
          {{ title }}
        </h3>
        <p
          v-if="subtitle"
          class="mt-1 text-sm text-slate-500 dark:text-slate-400"
          style="color: var(--fcc-text-muted)"
        >
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots['header-actions']" class="flex shrink-0 items-center gap-2">
        <slot name="header-actions" />
      </div>
    </header>
    <div class="p-5">
      <slot />
    </div>
  </section>
</template>
