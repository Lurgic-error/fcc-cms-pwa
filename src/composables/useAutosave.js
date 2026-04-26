import { computed, onScopeDispose, ref, toValue, watch } from 'vue'

import { extractErrorMessage } from '@/utils/httpError'

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]))
  }

  return value
}

function resolveSourceValue(source) {
  return typeof source === 'function' ? source() : toValue(source)
}

export function useAutosave(source, save, options = {}) {
  const saving = ref(false)
  const pending = ref(false)
  const error = ref('')
  const savedAt = ref(null)

  const delay = computed(() => Math.max(Number(toValue(options.delay ?? 800)) || 0, 0))
  const enabled = computed(() => toValue(options.enabled ?? true) !== false)
  const deep = computed(() => toValue(options.deep ?? true) !== false)
  const immediate = computed(() => toValue(options.immediate ?? false) === true)

  let initialized = false
  let paused = false
  let timerId = null

  function clearTimer() {
    if (timerId !== null) {
      globalThis.clearTimeout(timerId)
      timerId = null
    }
  }

  async function flush({ force = false } = {}) {
    clearTimer()
    pending.value = false

    if ((!enabled.value || paused) && !force) {
      return false
    }

    saving.value = true
    error.value = ''

    try {
      await save(cloneValue(resolveSourceValue(source)))
      savedAt.value = new Date()
      return true
    } catch (err) {
      error.value = extractErrorMessage(err, 'Autosave failed.')
      throw err
    } finally {
      saving.value = false
    }
  }

  function schedule() {
    if (!enabled.value || paused) return false

    clearTimer()
    pending.value = true
    timerId = globalThis.setTimeout(() => {
      void flush().catch(() => {})
    }, delay.value)
    return true
  }

  function cancel() {
    clearTimer()
    pending.value = false
  }

  function pause() {
    paused = true
    cancel()
  }

  function resume() {
    paused = false
  }

  watch(
    () => resolveSourceValue(source),
    () => {
      if (!initialized) {
        initialized = true
        if (immediate.value) {
          schedule()
        }
        return
      }

      schedule()
    },
    {
      deep: deep.value,
      immediate: true,
    },
  )

  onScopeDispose(() => {
    cancel()
  })

  return {
    saving,
    pending,
    error,
    savedAt,
    schedule,
    flush,
    cancel,
    pause,
    resume,
  }
}
