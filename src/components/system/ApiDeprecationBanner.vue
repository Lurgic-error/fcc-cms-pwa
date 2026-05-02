<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import { useApiDeprecationStore } from '@/stores/useApiDeprecationStore'

const deprecationStore = useApiDeprecationStore()

const message = computed(() => {
  const sunset = deprecationStore.notice?.sunset
  if (sunset) return `Deprecated API route sunset: ${sunset}`
  return 'Deprecated API route in use.'
})

function handleDeprecationEvent(event) {
  deprecationStore.setNotice(event.detail)
}

onMounted(() => {
  window.addEventListener('fcc:api-deprecation', handleDeprecationEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('fcc:api-deprecation', handleDeprecationEvent)
})
</script>

<template>
  <aside v-if="deprecationStore.visible" class="api-deprecation-banner" role="status">
    <span>{{ message }}</span>
    <button type="button" aria-label="Dismiss deprecation notice" @click="deprecationStore.clearNotice">
      Dismiss
    </button>
  </aside>
</template>

<style scoped>
.api-deprecation-banner {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f59e0b;
  padding: 0.625rem 1rem;
  background: #fffbeb;
  color: #78350f;
  font-size: 0.875rem;
  font-weight: 700;
}

.api-deprecation-banner button {
  border: 1px solid #92400e;
  border-radius: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: transparent;
  color: #78350f;
  font-weight: 700;
}
</style>
