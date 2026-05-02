import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'

export function compactAuditQuery(query = {}) {
  return Object.fromEntries(
    Object.entries(query)
      .map(([key, value]) => {
        if (typeof value === 'string') return [key, value.trim()]
        return [key, value]
      })
      .filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

function resolveItems(payload = {}) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.auditLogs)) return payload.auditLogs
  if (Array.isArray(payload.data)) return payload.data
  return []
}

export function normalizeAuditListPayload(payload = {}) {
  const data = unwrapApiResponsePayload(payload) || {}
  if (data?.error) return data

  const items = resolveItems(data)
  const pagination = data.pagination || {}
  const limit = Number(data.limit || pagination.limit || 20)
  const total = Number(data.total || pagination.total || items.length || 0)

  return {
    ...data,
    items,
    page: Number(data.page || pagination.page || 1),
    limit,
    total,
    totalPages: Number(
      data.totalPages ||
        pagination.totalPages ||
        (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1),
    ),
  }
}

export default function makeAuditAPI({ request }) {
  return Object.freeze({
    async listAuditLogs(query = {}) {
      try {
        const { data } = await request.get('/admin/audit', {
          params: compactAuditQuery(query),
        })
        return normalizeAuditListPayload(data)
      } catch (error) {
        return wrapApiErrorResult(error)
      }
    },
  })
}
