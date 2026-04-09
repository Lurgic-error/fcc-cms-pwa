export default function ({ request }) {
  const url = '/scheduler'

  return Object.freeze({
    listSchedules,
    createSchedule,
    updateSchedule,
    cancelSchedule,
    pauseSchedule,
    resumeSchedule,
    runNow,
  })

  async function listSchedules(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function createSchedule(payload) {
    try {
      const { data } = await request.post(`${url}/create`, payload)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function updateSchedule({ scheduleId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/update`, payload)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelSchedule({ scheduleId, reason }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/cancel`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function pauseSchedule({ scheduleId }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/pause`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function resumeSchedule({ scheduleId }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/resume`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function runNow({ scheduleId }) {
    try {
      const { data } = await request.post(`${url}/${scheduleId}/run-now`)
      return data
    } catch (error) {
      return { error }
    }
  }
}
