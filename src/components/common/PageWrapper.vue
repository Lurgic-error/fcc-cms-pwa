<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  dense: {
    type: Boolean,
    default: false,
  },
})

const slots = useSlots()
const hasHeader = computed(() => Boolean(props.title || props.description || slots.header))
</script>

<template>
  <section class="page-wrapper" :class="{ dense }">
    <header v-if="hasHeader" class="page-header fcc-page-heading">
      <slot name="header">
        <h1 v-if="title" class="page-title fcc-page-title">{{ title }}</h1>
        <p v-if="description" class="page-description fcc-page-subtitle">{{ description }}</p>
      </slot>
    </header>

    <div class="page-content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-wrapper {
  display: grid;
  gap: 1rem;
  padding: 0.2rem;
}

.page-wrapper.dense {
  gap: 0.7rem;
}

.page-header {
  display: grid;
  gap: 0.35rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.page-description {
  font-size: 0.92rem;
}

.page-content {
  min-width: 0;
}
</style>
