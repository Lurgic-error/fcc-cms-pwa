export function extractErrorMessage(error, fallback = 'An unexpected error occurred.') {
  const source = error?.error || error

  return (
    source?.response?.data?.error ||
    source?.response?.data?.message ||
    source?.publicMessage ||
    source?.message ||
    fallback
  )
}

export function normalizeThrownError(error, fallback = 'An unexpected error occurred.') {
  const source = error?.error || error
  const message = extractErrorMessage(error, fallback)

  if (source instanceof Error) {
    source.message = message
    return source
  }

  return new Error(message)
}
