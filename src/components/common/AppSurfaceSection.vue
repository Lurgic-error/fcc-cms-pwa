<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  tag: {
    type: String,
    default: 'section',
  },
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  titleTag: {
    type: String,
    default: 'h2',
  },
  bodyClass: {
    type: String,
    default: '',
  },
})

const slots = useSlots()

const resolvedSubtitle = computed(() => props.description || props.subtitle)

const hasHeader = computed(() =>
  Boolean(props.eyebrow || props.title || resolvedSubtitle.value || slots.header || slots.actions),
)
</script>

<template>
  <component :is="tag" class="app-surface-section surface-card">
    <slot name="header">
      <header v-if="hasHeader" class="app-surface-section__header">
        <div class="app-surface-section__header-copy">
          <p v-if="eyebrow" class="app-surface-section__eyebrow">{{ eyebrow }}</p>
          <component :is="titleTag" v-if="title" class="app-surface-section__title">
            {{ title }}
          </component>
          <p v-if="resolvedSubtitle" class="app-surface-section__subtitle">{{ resolvedSubtitle }}</p>
        </div>
        <div v-if="$slots.actions" class="app-surface-section__actions">
          <slot name="actions" />
        </div>
      </header>
    </slot>

    <div v-if="$slots.default" class="app-surface-section__body" :class="bodyClass">
      <slot />
    </div>
  </component>
</template>
