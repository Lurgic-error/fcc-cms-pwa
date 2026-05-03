import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { auditAPI } from '@/api'
import { useUsersStore } from '@/stores/useUsersStore'

const DEFAULT_FILTERS = Object.freeze({
  userId: '',
  action: '',
  actor: '',
  resourceType: '',
  resourceId: '',
  startDate: '',
  endDate: '',
})

const RESOURCE_FILTER_ERROR = 'resourceType and resourceId must be provided together.'
const PII_REDACTION = '[redacted]'

function normalizeRole(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
}

export function canViewAuditPii({ role = '', roles = [] } = {}) {
  const normalizedRoles = [...roles, role].map(normalizeRole).filter(Boolean)
  return normalizedRoles.some((entry) => entry === 'system admin' || entry === 'system administrator')
}

export function redactAuditEntry(entry = {}, user = {}) {
  if (canViewAuditPii(user)) return { ...entry }

  return {
    ...entry,
    ip: entry.ip ? PII_REDACTION : entry.ip,
    ipAddress: entry.ipAddress ? PII_REDACTION : entry.ipAddress,
    userAgent: entry.userAgent ? PII_REDACTION : entry.userAgent,
  }
}

function compactQuery(query = {}) {
  return Object.fromEntries(
    Object.entries(query)
      .map(([key, value]) => {
        if (typeof value === 'string') return [key, value.trim()]
        return [key, value]
      })
      .filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function buildAuditQuery(filters = {}, pagination = {}) {
  const query = compactQuery({
    ...filters,
    page: pagination.page,
    limit: pagination.limit,
  })

  const hasResourceType = Boolean(query.resourceType)
  const hasResourceId = Boolean(query.resourceId)
  if (hasResourceType !== hasResourceId) {
    throw new Error(RESOURCE_FILTER_ERROR)
  }

  return query
}

function toPagination(response = {}, fallback = {}) {
  return {
    page: Number(response.page || fallback.page || 1),
    limit: Number(response.limit || fallback.limit || 20),
    total: Number(response.total || 0),
    totalPages: Number(response.totalPages || 1),
  }
}

export const useAuditLogStore = defineStore('auditLog', () => {
  const usersStore = useUsersStore()
  const filters = ref({ ...DEFAULT_FILTERS })
  const entries = ref([])
  const loading = ref(false)
  const error = ref('')
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })

  const hasActiveFilters = computed(() =>
    Object.values(filters.value).some((value) => String(value || '').trim()),
  )

  function setFilters(nextFilters = {}) {
    filters.value = {
      ...filters.value,
      ...nextFilters,
    }
  }

  function resetFilters() {
    filters.value = { ...DEFAULT_FILTERS }
  }

  async function fetchAuditLogs(options = {}) {
    loading.value = true
    error.value = ''

    try {
      const query = buildAuditQuery(filters.value, {
        page: options.page || pagination.value.page,
        limit: options.limit || pagination.value.limit,
      })

      const response = await auditAPI.listAuditLogs(query)
      if (response?.error) throw new Error(response.error)

      entries.value = (response.items || []).map((entry) =>
        redactAuditEntry(entry, {
          role: usersStore.role,
          roles: usersStore.roles,
        }),
      )
      pagination.value = toPagination(response, query)
      return entries.value
    } catch (err) {
      error.value = err?.message || 'Failed to load audit logs.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    error,
    filters,
    hasActiveFilters,
    loading,
    pagination,
    fetchAuditLogs,
    resetFilters,
    setFilters,
  }
})
