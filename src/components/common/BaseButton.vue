<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'md',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const isDisabled = computed(() => props.loading || props.disabled)

function onClick(event) {
  if (isDisabled.value) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    class="base-button"
    :class="[variant, size, { block, loading }]"
    :disabled="isDisabled"
    @click="onClick"
  >
    <span v-if="loading" class="spinner" />
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  border: 1px solid transparent;
  border-radius: var(--fcc-radius-pill);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.base-button.block {
  width: 100%;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button.sm {
  font-size: 0.78rem;
  padding: 0.35rem 0.75rem;
}

.base-button.md {
  font-size: 0.85rem;
  padding: 0.5rem 1.15rem;
}

.base-button.lg {
  font-size: 0.94rem;
  padding: 0.65rem 1.5rem;
}

.base-button.primary {
  background: var(--fcc-primary-600);
  border-color: var(--fcc-primary-600);
  color: white;
}

.base-button.primary:hover:enabled {
  background: var(--fcc-primary-700);
  border-color: var(--fcc-primary-700);
  box-shadow: var(--fcc-shadow-base);
}

.base-button.secondary {
  background: var(--fcc-surface);
  border-color: var(--fcc-border-strong);
  color: var(--fcc-text);
}

.base-button.secondary:hover:enabled {
  background: var(--fcc-surface-muted);
  border-color: var(--fcc-border-strong);
}

.base-button.danger {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: white;
}

.base-button.danger:hover:enabled {
  background: var(--color-danger-hover);
  border-color: var(--color-danger-hover);
}

.base-button.ghost {
  background: transparent;
  border-color: transparent;
  color: var(--fcc-text-muted);
}

.base-button.ghost:hover:enabled {
  background: var(--fcc-surface-muted);
  color: var(--fcc-text);
}

.spinner {
  width: 0.84rem;
  height: 0.84rem;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: white;
  border-radius: var(--fcc-radius-pill);
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
