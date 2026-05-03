function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function isApiEnvelope(payload) {
  return (
    isPlainObject(payload) &&
    Object.prototype.hasOwnProperty.call(payload, 'data') &&
    Object.prototype.hasOwnProperty.call(payload, 'error')
  )
}

export function normalizeApiErrorPayload(errorPayload, fallback = 'Request failed.') {
  if (isPlainObject(errorPayload)) {
    return {
      code: errorPayload.code,
      message: errorPayload.message || errorPayload.code || fallback,
      details: errorPayload.details,
    }
  }

  if (typeof errorPayload === 'string' && errorPayload.trim()) {
    return { message: errorPayload }
  }

  return { message: fallback }
}

function compactErrorResult(result) {
  return Object.fromEntries(Object.entries(result).filter(([, value]) => value !== undefined))
}

export function unwrapApiResponsePayload(payload) {
  if (!isApiEnvelope(payload)) return payload

  if (payload.error) return wrapApiErrorResult({ response: { data: payload } })
  return payload.data
}

export function normalizeApiErrorMessage(error, fallback = 'Request failed.') {
  const responsePayload = error?.response?.data
  const envelopeError = isApiEnvelope(responsePayload) ? responsePayload.error : responsePayload?.error
  const normalized = normalizeApiErrorPayload(envelopeError, fallback)
  const hasEnvelopeError = envelopeError !== undefined && envelopeError !== null

  return (
    (hasEnvelopeError ? normalized.message : '') ||
    responsePayload?.message ||
    error?.message ||
    (typeof error === 'string' ? error : '') ||
    fallback
  )
}

export function wrapApiErrorResult(error, parseError = normalizeApiErrorMessage) {
  const responsePayload = error?.response?.data
  const envelopeError = isApiEnvelope(responsePayload) ? responsePayload.error : responsePayload?.error
  const normalized = normalizeApiErrorPayload(envelopeError)
  const parsed = parseError(error)
  const message = typeof parsed === 'string' ? parsed : parsed?.message || normalized.message

  return compactErrorResult({
    error: message,
    errorCode: normalized.code,
    errorDetails: normalized.details,
  })
}
