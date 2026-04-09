import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/useAuthStore'
import { humanizeKey } from '@/utils/adminPresentation'
import { resolveBulkActionItems, resolveEntityActionItems } from '@/utils/editorialActions'
import { extractErrorMessage } from '@/utils/httpError'

function getRouteMeta(router, routeName) {
  if (!routeName || !router.hasRoute(routeName)) return null
  return router.getRoutes().find((route) => route.name === routeName)?.meta || null
}

function resolveRecordId(config = {}, record = {}) {
  return (
    config?.adapter?.getId?.(record) || record?.[config.idKey] || record?._id || record?.id || ''
  )
}

function getIdField(config = {}) {
  return config?.routeParam || config?.idKey || 'id'
}

function toIsoDateTime(value = '') {
  if (!value) return ''
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

function isFutureDateTime(value = '') {
  const isoValue = toIsoDateTime(value)
  if (!isoValue) return false
  return new Date(isoValue).getTime() > Date.now()
}

function resolveActionError(error, fallback = 'Action failed.') {
  return extractErrorMessage(error, fallback)
}

function resolveActionSuccess(actionKey, response = {}) {
  if (response?.message) return response.message

  const successMessages = {
    submit: 'Submitted for approval successfully.',
    approve: 'Approved successfully.',
    reject: 'Rejected successfully.',
    publish: 'Published successfully.',
    unpublish: 'Unpublished successfully.',
    schedulePublish: 'Publish schedule saved successfully.',
    scheduleUnpublish: 'Unpublish schedule saved successfully.',
    cancelPublishSchedule: 'Publish schedule cancelled successfully.',
    cancelUnpublishSchedule: 'Unpublish schedule cancelled successfully.',
    archive: 'Archived successfully.',
    restoreArchived: 'Archive restored successfully.',
    softDelete: 'Moved to trash successfully.',
    restore: 'Restored successfully.',
    delete: 'Deleted permanently.',
  }

  return successMessages[actionKey] || `${humanizeKey(actionKey)} completed.`
}

export function useEditorialActions(config = {}) {
  const router = useRouter()
  const authStore = useAuthStore()

  const canView = computed(() => {
    const routeMeta = getRouteMeta(router, config?.routes?.details)
    return Boolean(routeMeta) && authStore.canAccess(routeMeta)
  })

  const canEdit = computed(() => {
    const routeMeta = getRouteMeta(router, config?.routes?.edit)
    return Boolean(routeMeta) && authStore.canAccess(routeMeta)
  })

  const canRespond = computed(() => {
    const routeMeta = getRouteMeta(router, config?.routes?.response)
    return Boolean(routeMeta) && authStore.canAccess(routeMeta)
  })

  function hasPermission(permission) {
    return authStore.canAccess({ permissions: [permission] })
  }

  function getRecordActions(record, overrides = {}) {
    const extraActions = [...(overrides.extraActions || [])]

    if (overrides.includeRespond && canRespond.value) {
      extraActions.push({
        key: 'respond',
        label: 'Respond',
        group: 'navigation',
      })
    }

    return resolveEntityActionItems({
      record,
      adapter: config.adapter,
      canView: overrides.canView ?? canView.value,
      canEdit: overrides.canEdit ?? canEdit.value,
      hasPermission,
      extraActions,
    })
  }

  function getBulkActions(records = []) {
    return resolveBulkActionItems({
      records,
      adapter: config.adapter,
      hasPermission,
    })
  }

  async function promptReason(actionLabel, description, placeholder, { required = false } = {}) {
    const { value } = await ElMessageBox.prompt(description, actionLabel, {
      inputPlaceholder: placeholder,
      inputType: 'textarea',
      inputValidator: (inputValue) =>
        !required || String(inputValue || '').trim().length > 0 || 'A short note is required.',
    })

    return { reason: String(value || '').trim() }
  }

  async function promptSchedule(actionLabel, fieldLabel) {
    const { value } = await ElMessageBox.prompt(
      `Choose when this content should ${fieldLabel.toLowerCase()}.`,
      actionLabel,
      {
        inputType: 'datetime-local',
        inputPlaceholder: 'Select date and time',
        inputValidator: (inputValue) =>
          isFutureDateTime(inputValue) || 'Please choose a valid future date and time.',
      },
    )

    return {
      [`scheduled${fieldLabel}At`]: toIsoDateTime(value),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }

  async function confirmAction(title, message, type = 'warning') {
    await ElMessageBox.confirm(message, title, { type })
    return {}
  }

  async function collectActionPayload(actionKey, { selectionCount = 1 } = {}) {
    const label = humanizeKey(actionKey)
    const isBulk = selectionCount > 1
    const targetText = isBulk ? `${selectionCount} selected records` : 'this record'

    switch (actionKey) {
      case 'reject':
        return promptReason(
          label,
          `Explain why ${targetText} should be rejected.`,
          'Reason for rejection',
          { required: true },
        )
      case 'archive':
        return promptReason(label, `Add an archive note for ${targetText}.`, 'Archive reason')
      case 'softDelete':
        return promptReason(
          label,
          `Explain why ${targetText} should be soft deleted.`,
          'Deletion reason',
        )
      case 'schedulePublish':
        return promptSchedule(label, 'Publish')
      case 'scheduleUnpublish':
        return promptSchedule(label, 'Unpublish')
      case 'publish':
      case 'unpublish':
      case 'restore':
      case 'restoreArchived':
      case 'cancelPublishSchedule':
      case 'cancelUnpublishSchedule':
      case 'delete':
        return confirmAction(
          label,
          `Are you sure you want to ${label.toLowerCase()} ${targetText}?`,
        )
      default:
        return {}
    }
  }

  async function navigateToAction(actionKey, record) {
    const id = resolveRecordId(config, record)
    const idField = getIdField(config)
    const routeMap = {
      view: config?.routes?.details,
      edit: config?.routes?.edit,
      respond: config?.routes?.response,
    }
    const routeName = routeMap[actionKey]
    if (!routeName) return false

    if (!id) {
      return false
    }

    await router.push({
      name: routeName,
      params: { [idField]: id },
    })
    return true
  }

  async function executeRecordAction(action, record, { runWorkflow, reload } = {}) {
    const actionKey = typeof action === 'string' ? action : action?.key
    if (!actionKey) return false

    if (await navigateToAction(actionKey, record)) {
      return true
    }

    const id = resolveRecordId(config, record)
    if (!id || typeof runWorkflow !== 'function') return false

    try {
      const payload = await collectActionPayload(actionKey)
      const response = await runWorkflow(actionKey, id, payload)
      ElMessage({
        type: 'success',
        message: resolveActionSuccess(actionKey, response),
      })

      if (actionKey !== 'delete' && typeof reload === 'function') {
        await reload()
      }

      return true
    } catch (error) {
      if (
        String(error || '')
          .toLowerCase()
          .includes('cancel')
      ) {
        return false
      }

      ElMessage({
        type: 'error',
        message: resolveActionError(error, `${humanizeKey(actionKey)} failed.`),
      })
      return false
    }
  }

  async function executeBulkAction(action, records = [], { runBulkWorkflow, reload } = {}) {
    const actionKey = typeof action === 'string' ? action : action?.key
    if (
      !actionKey ||
      !Array.isArray(records) ||
      !records.length ||
      typeof runBulkWorkflow !== 'function'
    ) {
      return false
    }

    try {
      const payload = await collectActionPayload(actionKey, { selectionCount: records.length })
      const ids = records.map((record) => resolveRecordId(config, record)).filter(Boolean)
      const idField = getIdField(config)
      let response = null

      if (actionKey === 'schedulePublish' || actionKey === 'scheduleUnpublish') {
        const scheduleField =
          actionKey === 'schedulePublish' ? 'scheduledPublishAt' : 'scheduledUnpublishAt'
        response = await runBulkWorkflow(actionKey, {
          items: ids.map((id) => ({
            [idField]: id,
            [scheduleField]: payload[scheduleField],
            timezone: payload.timezone,
          })),
        })
      } else if (actionKey === 'archive' || actionKey === 'softDelete') {
        response = await runBulkWorkflow(actionKey, { ids, reason: payload.reason })
      } else {
        response = await runBulkWorkflow(actionKey, { ids })
      }

      ElMessage({
        type: 'success',
        message:
          response?.message || `${humanizeKey(actionKey)} completed for ${records.length} records.`,
      })

      if (typeof reload === 'function') {
        await reload()
      }

      return true
    } catch (error) {
      if (
        String(error || '')
          .toLowerCase()
          .includes('cancel')
      ) {
        return false
      }

      ElMessage({
        type: 'error',
        message: resolveActionError(error, `${humanizeKey(actionKey)} failed.`),
      })
      return false
    }
  }

  return {
    canEdit,
    canRespond,
    canView,
    executeBulkAction,
    executeRecordAction,
    getBulkActions,
    getRecordActions,
  }
}
