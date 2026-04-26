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
  <section class="enterprise-detail-card">
    <header
      v-if="title || subtitle || $slots['header-actions']"
      class="enterprise-detail-card__header"
    >
      <div class="enterprise-detail-card__header-copy">
        <h3 v-if="title">
          {{ title }}
        </h3>
        <p v-if="subtitle">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots['header-actions']" class="enterprise-detail-card__actions">
        <slot name="header-actions" />
      </div>
    </header>
    <div class="enterprise-detail-card__body">
      <slot />
    </div>
  </section>
</template>
