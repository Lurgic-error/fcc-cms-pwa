<script setup>
defineProps({
  padded: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <section class="component-wrapper" :class="{ padded }">
    <slot />
  </section>
</template>

<style scoped>
.component-wrapper {
  border: 1px solid var(--fcc-border);
  border-radius: var(--fcc-radius-lg);
  background: var(--fcc-surface);
  box-shadow: var(--fcc-shadow-soft);
}

.component-wrapper.padded {
  padding: 1rem;
}
</style>
