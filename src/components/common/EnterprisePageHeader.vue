<script setup>
import { computed, useSlots } from 'vue'

import PageHeaderActions from '@/components/common/PageHeaderActions.vue'

const props = defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  eyebrowClass: {
    type: String,
    default: 'enterprise-card-eyebrow',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  actions: {
    type: Array,
    default: () => [],
  },
  actionLabel: {
    type: String,
    default: 'Actions',
  },
  selectionCount: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  backLabel: {
    type: String,
    default: 'Back',
  },
  backDisabled: {
    type: Boolean,
    default: false,
  },
  showBack: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['select', 'back'])

const slots = useSlots()
const hasDescription = computed(() => Boolean(props.description || slots.description))
const hasDefaultActions = computed(() => props.showBack || props.actions.length > 0)
</script>

<template>
  <div class="enterprise-page-header">
    <div class="enterprise-page-header__copy">
      <slot name="pretitle" />
      <p v-if="eyebrow" :class="eyebrowClass">{{ eyebrow }}</p>
      <h1 class="enterprise-page-header__title">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="hasDescription" class="enterprise-page-header__description">
        <slot name="description">{{ description }}</slot>
      </p>
      <slot />
    </div>

    <div class="enterprise-page-header__actions">
      <slot name="actions">
        <PageHeaderActions
          v-if="hasDefaultActions"
          :actions="actions"
          :action-label="actionLabel"
          :selection-count="selectionCount"
          :loading="loading"
          :disabled="disabled"
          :back-label="backLabel"
          :back-disabled="backDisabled"
          @select="emit('select', $event)"
          @back="emit('back')"
        />
      </slot>
    </div>
  </div>
</template>
