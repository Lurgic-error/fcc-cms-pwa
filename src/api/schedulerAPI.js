import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
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
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function createSchedule(payload) {
    try {
      const { data } = await request.post(`${url}/create`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function updateSchedule({ scheduleId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/update`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function cancelSchedule({ scheduleId, reason }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/cancel`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function pauseSchedule({ scheduleId }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/pause`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function resumeSchedule({ scheduleId }) {
    try {
      const { data } = await request.put(`${url}/${scheduleId}/resume`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function runNow({ scheduleId }) {
    try {
      const { data } = await request.post(`${url}/${scheduleId}/run-now`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }
}
