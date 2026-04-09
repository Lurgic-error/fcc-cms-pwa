function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

function normalizeSubscriberError(error) {
  const message = parseError(error)

  if (error?.response?.status === 404) {
    return 'Subscribers endpoints are not available on the current fcc-cms-server build.'
  }

  return message
}

export default function ({ request }) {
  const url = '/subscribers'

  return Object.freeze({
    listSubscribers,
    findSubscriber,
  })

  async function listSubscribers(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: normalizeSubscriberError(error) }
    }
  }

  async function findSubscriber(payload = {}) {
    const subscriberId = payload?.subscriberId || payload?.id
    if (!subscriberId) return { error: 'Subscriber ID is required.' }

    try {
      const { data } = await request.get(`${url}/${subscriberId}`)
      return data
    } catch (error) {
      return { error: normalizeSubscriberError(error) }
    }
  }
}
