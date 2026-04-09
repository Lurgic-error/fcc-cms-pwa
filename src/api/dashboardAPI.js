function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

export default function ({ request }) {
  return Object.freeze({
    fetchDashboardSummary,
    fetchVisitorSummary,
    fetchRecentPublications,
  })

  async function fetchDashboardSummary() {
    try {
      const [visitorSummaryResult, publicationsResult] = await Promise.allSettled([
        request.get('/visitors/summary'),
        request.get('/publications', { params: { page: 1, limit: 5 } }),
      ])

      const visitorSummary =
        visitorSummaryResult.status === 'fulfilled'
          ? visitorSummaryResult.value.data?.summary || {}
          : {}

      const recentPublications =
        publicationsResult.status === 'fulfilled'
          ? publicationsResult.value.data?.publications ||
            publicationsResult.value.data?.items ||
            []
          : []

      return {
        summary: {
          ...visitorSummary,
          recentPublicationsCount: recentPublications.length,
        },
        recentPublications,
      }
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function fetchVisitorSummary(query = {}) {
    try {
      const { data } = await request.get('/visitors/summary', { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function fetchRecentPublications(query = {}) {
    try {
      const { data } = await request.get('/publications', {
        params: { page: 1, limit: 10, ...query },
      })
      return {
        publications: data?.publications || data?.items || [],
        pagination: data?.pagination || null,
      }
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
