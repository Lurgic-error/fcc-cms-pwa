export const SESSION_STORAGE_KEY = 'fcc-cms-session'

function hasWindow() {
  return typeof window !== 'undefined'
}

export function readPersistedSession() {
  if (!hasWindow()) return null

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writePersistedSession(session) {
  if (!hasWindow()) return

  if (!session || typeof session !== 'object') {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function mergePersistedSession(patch = {}) {
  const current = readPersistedSession() || {}
  const next = { ...current, ...patch }
  writePersistedSession(next)
  return next
}

export function clearPersistedSession() {
  writePersistedSession(null)
}

export function getPersistedAccessToken() {
  return readPersistedSession()?.accessToken || ''
}
