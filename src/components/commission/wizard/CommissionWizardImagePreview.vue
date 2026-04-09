<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  value: { type: [String, Object, File, null], default: '' },
  label: { type: String, default: 'Image preview' },
  emptyLabel: { type: String, default: 'Add an image to preview it here.' },
})

const previewUrl = ref('')

function resolvePreviewUrl(value) {
  if (!value) return ''
  if (value instanceof File) return URL.createObjectURL(value)
  if (typeof value === 'string') return String(value || '').trim()
  return String(value.url || value.path || value.src || '').trim()
}

watch(
  () => props.value,
  (value) => {
    if (previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = resolvePreviewUrl(value)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

const hasImage = computed(() => Boolean(previewUrl.value))
</script>

<template>
  <div class="commission-wizard-image-preview" :class="{ 'is-empty': !hasImage }">
    <img v-if="hasImage" :src="previewUrl" :alt="label" />
    <div v-else class="commission-wizard-image-preview__placeholder">
      <span>{{ emptyLabel }}</span>
    </div>
    <div class="commission-wizard-image-preview__caption">
      <strong>{{ label }}</strong>
      <span>{{ hasImage ? 'Live preview' : 'Preview unavailable' }}</span>
    </div>
  </div>
</template>

<style scoped>
.commission-wizard-image-preview {
  overflow: hidden;
  border-radius: var(--fcc-radius-lg);
  border: 1px solid var(--fcc-border);
  background: var(--fcc-surface-muted);
}

.commission-wizard-image-preview img,
.commission-wizard-image-preview__placeholder {
  width: 100%;
  min-height: 200px;
  max-height: 240px;
  display: grid;
  place-items: center;
  object-fit: cover;
}

.commission-wizard-image-preview__placeholder {
  padding: 1.5rem;
  text-align: center;
  color: var(--fcc-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.commission-wizard-image-preview__caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--fcc-border);
  background: var(--fcc-surface);
}

.commission-wizard-image-preview__caption strong {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--fcc-text);
}

.commission-wizard-image-preview__caption span {
  font-size: 0.8rem;
  color: var(--fcc-text-muted);
}
</style>
