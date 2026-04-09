import { resolveResourceViewConfig } from '@/modules/crud/resourceConfigs'

const WORKFLOW_STATE_FIELDS = Object.freeze([
  'workflowState',
  'publicationStatus',
  'status',
  'state',
])

function normalize(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function extractAllowedStates(to) {
  const metaAllowed = Array.isArray(to.meta?.allowedStates) ? to.meta.allowedStates : []
  const workflowAllowed = Array.isArray(to.meta?.workflow?.allowedStates)
    ? to.meta.workflow.allowedStates
    : []

  return [...new Set([...metaAllowed, ...workflowAllowed].map(normalize).filter(Boolean))]
}

function extractRouteRecordId(to, config = {}) {
  const routeParam = config?.routeParam
  if (routeParam && to.params?.[routeParam]) return String(to.params[routeParam])

  const keys = Object.keys(to.params || {})
  if (!keys.length) return ''

  if (keys.length === 1) {
    const onlyKey = keys[0]
    return to.params?.[onlyKey] ? String(to.params[onlyKey]) : ''
  }

  for (const key of keys) {
    if (key.toLowerCase().endsWith('id') && to.params?.[key]) {
      return String(to.params[key])
    }
  }

  return ''
}

function extractStateFromEntity(entity, config = {}) {
  if (!entity || typeof entity !== 'object') return ''

  if (typeof config.resolveWorkflowState === 'function') {
    return normalize(config.resolveWorkflowState(entity))
  }

  for (const field of WORKFLOW_STATE_FIELDS) {
    if (entity?.[field]) {
      return normalize(entity[field])
    }
  }

  return ''
}

async function resolveWorkflowState(to, config = {}) {
  const explicitState = to.meta?.workflowState || to.meta?.workflow?.state || ''
  if (explicitState) return normalize(explicitState)

  if (!config?.adapter || typeof config.adapter.find !== 'function') return ''

  const recordId = extractRouteRecordId(to, config)
  if (!recordId && !config.singleton) return ''

  const response = recordId ? await config.adapter.find(recordId) : await config.adapter.find()
  if (response?.error) {
    throw new Error(
      typeof response.error === 'string' ? response.error : 'Failed to load workflow state.',
    )
  }

  const entity =
    typeof config.adapter.mapEntity === 'function'
      ? config.adapter.mapEntity(response)
      : response?.item || response

  return extractStateFromEntity(entity, config)
}

export async function workflowGuard(to, from, next) {
  const allowedStates = extractAllowedStates(to)
  if (!allowedStates.length) return next()

  const routeName = String(to.name || '')
  const { config } = resolveResourceViewConfig(routeName, to.meta?.page)

  try {
    const workflowState = await resolveWorkflowState(to, config)

    if (!workflowState || allowedStates.includes(workflowState)) {
      return next()
    }

    return next({
      name: 'unauthorized',
      query: {
        reason: 'workflow-state',
        state: workflowState,
        allowed: allowedStates.join(','),
      },
    })
  } catch {
    return next({
      name: 'unauthorized',
      query: { reason: 'workflow-state-check' },
    })
  }
}
