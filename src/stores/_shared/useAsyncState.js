import { ref } from 'vue'
import { extractErrorMessage, normalizeThrownError } from '@/utils/httpError'

export function useAsyncState() {
  const loading = ref(false)
  const error = ref(null)

  function clearError() {
    error.value = null
  }

  function handleError(err) {
    error.value = extractErrorMessage(err, 'An error occurred')
    loading.value = false
    throw normalizeThrownError(err, error.value)
  }

  async function withAsync(fn) {
    loading.value = true
    clearError()
    try {
      return await fn()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    clearError,
    handleError,
    withAsync,
  }
}
