export function isFormValueEmpty(value) {
  return (
    value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)
  )
}

export function validateRequiredFields(fields = []) {
  const errors = {}

  fields.forEach((field) => {
    if (!field?.key || field.required === false) return
    const resolvedValue = typeof field.value === 'function' ? field.value() : field.value

    if (isFormValueEmpty(resolvedValue)) {
      errors[field.key] = `${field.label} is required.`
      return
    }

    if (typeof field.validate === 'function') {
      const nextError = field.validate(resolvedValue)
      if (nextError) {
        errors[field.key] = nextError
      }
    }
  })

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function replaceValidationState(target, nextErrors = {}) {
  Object.keys(target).forEach((key) => {
    delete target[key]
  })

  Object.assign(target, nextErrors)
}
