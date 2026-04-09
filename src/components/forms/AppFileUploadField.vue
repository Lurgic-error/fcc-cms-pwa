<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Array, Object, File, null],
    default: () => [],
  },
  field: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const previewUrls = ref([])

const normalizedValue = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (!props.modelValue) return []
  return [props.modelValue]
})

const isImageField = computed(() => String(props.field?.accept || '').includes('image'))

const uploadFileList = computed(() =>
  normalizedValue.value.map((item, index) => ({
    name: item?.name || item?.filename || item?.originalname || `File ${index + 1}`,
    status: 'success',
    size: item?.size,
    url: item?.url,
    raw: item instanceof File ? item : undefined,
  })),
)

watch(
  normalizedValue,
  (items) => {
    previewUrls.value
      .filter((url) => url.startsWith('blob:'))
      .forEach((url) => URL.revokeObjectURL(url))

    previewUrls.value = items.map((item) => {
      if (item instanceof File) {
        return URL.createObjectURL(item)
      }

      return item?.url || item?.path || item?.src || ''
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  previewUrls.value
    .filter((url) => url.startsWith('blob:'))
    .forEach((url) => URL.revokeObjectURL(url))
})

function emitFiles(uploadFiles = []) {
  const nextFiles = uploadFiles
    .map((item) => item?.raw || item)
    .filter((item) => item instanceof File)

  emit('update:modelValue', props.field?.multiple === false ? nextFiles[0] || null : nextFiles)
}

function handleChange(_file, uploadFiles) {
  emitFiles(uploadFiles)
}

function handleRemove(_file, uploadFiles) {
  emitFiles(uploadFiles)
}

function beforeUpload() {
  return false
}
</script>

<template>
  <div class="app-file-upload-field">
    <el-upload
      drag
      :auto-upload="false"
      :show-file-list="true"
      :multiple="field.multiple !== false"
      :limit="field.limit || 10"
      :accept="field.accept || ''"
      :disabled="disabled"
      :file-list="uploadFileList"
      :before-upload="beforeUpload"
      @change="handleChange"
      @remove="handleRemove"
    >
      <el-icon class="el-icon--upload mb-3 text-2xl text-[var(--fcc-primary-700)]">
        <UploadFilled />
      </el-icon>
      <div class="text-sm font-semibold text-[var(--fcc-text)]">
        {{ field.uploadTitle || 'Drop files here or click to choose files' }}
      </div>
      <div class="mt-1 text-xs text-[var(--fcc-text-muted)]">
        {{ field.uploadHint || 'Uploaded files stay attached to this record after saving.' }}
      </div>
      <template #tip>
        <div class="mt-2 text-xs text-[var(--fcc-text-muted)]">
          {{ field.tip || 'Only approved file types are accepted.' }}
        </div>
      </template>
    </el-upload>

    <div v-if="isImageField && previewUrls.some(Boolean)" class="mt-4 grid gap-3 sm:grid-cols-2">
      <div
        v-for="(previewUrl, index) in previewUrls.filter(Boolean)"
        :key="`preview-${index}`"
        class="overflow-hidden border"
        style="
          border-radius: var(--fcc-radius-lg);
          border-color: var(--fcc-border);
          background-color: var(--fcc-surface-muted);
        "
      >
        <img
          :src="previewUrl"
          :alt="uploadFileList[index]?.name || `Preview ${index + 1}`"
          class="h-40 w-full object-cover"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-file-upload-field :deep(.el-upload),
.app-file-upload-field :deep(.el-upload-dragger) {
  width: 100%;
}

.app-file-upload-field :deep(.el-upload-dragger) {
  border-radius: var(--fcc-radius-lg);
  border-color: var(--fcc-border);
  background: var(--fcc-surface-muted);
  transition: all 0.2s ease;
}

.app-file-upload-field :deep(.el-upload-dragger):hover {
  border-color: var(--fcc-primary-400);
  background: var(--fcc-surface);
}

.app-file-upload-field :deep(.el-upload-list__item) {
  border-radius: var(--fcc-radius-md);
}
</style>
