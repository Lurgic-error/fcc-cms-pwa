import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
import { buildEditorialEntityApi, parseEditorialApiError } from './editorialEntityApi'

function parseError(error) {
  return parseEditorialApiError(error)
}

export default function ({ request }) {
  const url = '/faqs'
  const workflow = buildEditorialEntityApi({ request, baseUrl: url, parseError })

  return Object.freeze({
    listQuestions,
    listPublished: listPublishedQuestions,
    listPublishedQuestions,
    listArchivedQuestions: workflow.listArchived,
    findQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    publishQuestion,
    unpublishQuestion,
    ...workflow,
  })

  async function listQuestions(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function listPublishedQuestions(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function findQuestion({ questionId }) {
    try {
      const { data } = await request.get(`${url}/${questionId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function createQuestion(payload = {}) {
    const body = payload.questionInfo || payload
    try {
      const { data } = await request.post(`${url}/create`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateQuestion({ questionId, ...payload }) {
    const body = payload.questionInfo || payload
    try {
      const { data } = await request.put(`${url}/${questionId}/update`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function deleteQuestion({ questionId }) {
    try {
      const { data } = await request.delete(`${url}/${questionId}/delete`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function publishQuestion({ questionId }) {
    try {
      const { data } = await request.put(`${url}/${questionId}/publish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function unpublishQuestion({ questionId }) {
    try {
      const { data } = await request.put(`${url}/${questionId}/unpublish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
