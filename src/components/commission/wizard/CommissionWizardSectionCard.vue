<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <section class="commission-wizard-section" :class="{ compact }">
    <header v-if="title || description || $slots.header" class="commission-wizard-section__header">
      <slot name="header">
        <div>
          <h3 v-if="title" class="commission-wizard-section__title">{{ title }}</h3>
          <p v-if="description" class="commission-wizard-section__description">{{ description }}</p>
        </div>
      </slot>
    </header>

    <div class="commission-wizard-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.commission-wizard-section {
  display: grid;
  gap: 1.25rem;
  padding: 1.5rem;
  border: 1px solid var(--fcc-border);
  border-radius: var(--fcc-radius-xl);
  background: var(--fcc-surface-elevated);
  box-shadow: var(--fcc-shadow-base);
  transition: all 0.2s ease;
}

.commission-wizard-section.compact {
  gap: 1rem;
  padding: 1.25rem;
  background: var(--fcc-surface);
}

.commission-wizard-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--fcc-border);
}

.commission-wizard-section__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--fcc-text);
  letter-spacing: -0.01em;
}

.commission-wizard-section__description {
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--fcc-text-muted);
}

.commission-wizard-section__body {
  display: grid;
  gap: 1.25rem;
}
</style>
