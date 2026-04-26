export function normalizeUploadValue(modelValue) {
  if (Array.isArray(modelValue)) return modelValue
  if (!modelValue) return []
  return [modelValue]
}

export function resolveUploadItemName(item, index = 0) {
  return item?.name || item?.filename || item?.originalname || `File ${index + 1}`
}

export function resolveUploadItemUrl(item) {
  return item?.url || item?.path || item?.src || ''
}

export function buildUploadFileList(items = []) {
  return normalizeUploadValue(items).map((item, index) => ({
    uid: item?.uid || item?.id || item?._id || `${resolveUploadItemName(item, index)}-${index}`,
    name: resolveUploadItemName(item, index),
    status: 'success',
    size: item?.size,
    url: resolveUploadItemUrl(item),
    raw: item instanceof File ? item : undefined,
    __fccValue: item,
  }))
}

export function extractUploadValue(uploadEntry) {
  return uploadEntry?.__fccValue ?? uploadEntry?.raw ?? uploadEntry
}

export function normalizeUploadEmission(uploadFiles = [], multiple = true) {
  const nextItems = uploadFiles
    .map((item) => extractUploadValue(item))
    .filter((item) => item !== undefined && item !== null && item !== '')

  return multiple === false ? nextItems[0] || null : nextItems
}
