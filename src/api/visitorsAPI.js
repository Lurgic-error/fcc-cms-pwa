function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed'
  )
}

export default function ({ request }) {
  const url = '/visitors'

  return Object.freeze({
    listVisitors,
    findVisitor,
    fetchSummary,
    fetchHotspots,
  })

  async function listVisitors(query = {}) {
    try {
      const { data } = await request.get(`${url}`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findVisitor(visitorId) {
    try {
      const { data } = await request.get(`${url}/${visitorId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function fetchSummary(query = {}) {
    try {
      const { data } = await request.get(`${url}/summary`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function fetchHotspots(query = {}) {
    try {
      const { data } = await request.get(`${url}/hotspots`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
