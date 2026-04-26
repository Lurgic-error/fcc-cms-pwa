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
