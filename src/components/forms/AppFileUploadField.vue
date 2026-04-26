<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  buildUploadFileList,
  normalizeUploadEmission,
  normalizeUploadValue,
  resolveUploadItemName,
  resolveUploadItemUrl,
} from './appFileUploadFieldState'

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
const previewItems = ref([])

const normalizedValue = computed(() => normalizeUploadValue(props.modelValue))

const isImageField = computed(() => String(props.field?.accept || '').includes('image'))

const uploadFileList = computed(() => buildUploadFileList(normalizedValue.value))

watch(
  normalizedValue,
  (items) => {
    previewItems.value
      .map((item) => item?.url)
      .filter((url) => url?.startsWith('blob:'))
      .forEach((url) => URL.revokeObjectURL(url))

    previewItems.value = items
      .map((item, index) => {
        const url = item instanceof File ? URL.createObjectURL(item) : resolveUploadItemUrl(item)
        return {
          name: resolveUploadItemName(item, index),
          url,
        }
      })
      .filter((item) => item.url)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  previewItems.value
    .map((item) => item?.url)
    .filter((url) => url?.startsWith('blob:'))
    .forEach((url) => URL.revokeObjectURL(url))
})

function emitFiles(uploadFiles = []) {
  emit('update:modelValue', normalizeUploadEmission(uploadFiles, props.field?.multiple !== false))
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
      <el-icon class="app-file-upload-field__icon">
        <UploadFilled />
      </el-icon>
      <div class="app-file-upload-field__title">
        {{ field.uploadTitle || 'Drop files here or click to choose files' }}
      </div>
      <div class="app-file-upload-field__hint">
        {{ field.uploadHint || 'Uploaded files stay attached to this record after saving.' }}
      </div>
      <template #tip>
        <div class="app-file-upload-field__tip">
          {{ field.tip || 'Only approved file types are accepted.' }}
        </div>
      </template>
    </el-upload>

    <div v-if="isImageField && previewItems.length" class="app-file-upload-field__preview-grid">
      <div
        v-for="(preview, index) in previewItems"
        :key="`preview-${index}`"
        class="app-file-upload-field__preview"
      >
        <img
          :src="preview.url"
          :alt="preview.name || `Preview ${index + 1}`"
          class="app-file-upload-field__preview-image"
        />
      </div>
    </div>
  </div>
</template>
