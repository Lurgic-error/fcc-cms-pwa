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
