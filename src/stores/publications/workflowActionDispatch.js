function capitalize(value = '') {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : ''
}

export async function runEntityWorkflowAction(store, actionKey, id, payload = {}) {
  if (!store || !actionKey || !id) return null

  switch (actionKey) {
    case 'submit':
      return store.submit?.(id) || store.submitForApproval?.(id)
    case 'reject':
    case 'archive':
    case 'softDelete':
      return store[actionKey]?.(id, payload.reason || '')
    case 'schedulePublish':
    case 'scheduleUnpublish':
      return store[actionKey]?.(id, payload)
    case 'delete':
      return store.remove?.(id)
    default:
      return store[actionKey]?.(id) || null
  }
}

export async function runEntityBulkWorkflowAction(store, actionKey, payload = {}) {
  if (!store || !actionKey) return null

  switch (actionKey) {
    case 'archive':
    case 'softDelete':
      return store[`bulk${capitalize(actionKey)}`]?.(payload.ids || [], payload.reason || '')
    case 'schedulePublish':
    case 'scheduleUnpublish':
      return store[`bulk${capitalize(actionKey)}`]?.(payload.items || [])
    case 'delete':
      return store.bulkRemove?.(payload.ids || [])
    default:
      return store[`bulk${capitalize(actionKey)}`]?.(payload.ids || []) || null
  }
}
