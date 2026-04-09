import { ref } from 'vue'

export function usePagination() {
  const pagination = ref({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  })

  function setPagination(p) {
    if (!p) return

    const source = p?.pagination || p
    const hasTopLevelPagination =
      Object.prototype.hasOwnProperty.call(source, 'page') ||
      Object.prototype.hasOwnProperty.call(source, 'total') ||
      Object.prototype.hasOwnProperty.call(source, 'totalPages') ||
      Object.prototype.hasOwnProperty.call(source, 'limit')

    if (!hasTopLevelPagination) return

    const next = {
      page: Math.max(Number(source.page) || 1, 1),
      limit: Math.max(Number(source.limit) || pagination.value.limit || 20, 1),
      total: Math.max(Number(source.total) || 0, 0),
      totalPages: Math.max(Number(source.totalPages) || 0, 0),
    }

    if (!next.totalPages) {
      next.totalPages = Math.max(Math.ceil(next.total / next.limit), 1)
    }

    pagination.value = next
  }

  return {
    pagination,
    setPagination,
  }
}
