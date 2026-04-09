import { questionsAPI } from '@/api'
import { defineStore } from 'pinia'
import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const adapterApi = {
  list: (query) => questionsAPI.listQuestions(query),
  find: (id) => questionsAPI.findQuestion({ questionId: id }),
  create: (payload) => questionsAPI.createQuestion(payload),
  update: (id, payload) => questionsAPI.updateQuestion({ questionId: id, ...payload }),
  remove: (id) => questionsAPI.deleteQuestion({ questionId: id }),
  listPublished: (query) => questionsAPI.listPublishedQuestions(query),
  listArchived: (query) => questionsAPI.listArchivedQuestions(query),
  softDelete: (id, reason) => questionsAPI.softDelete(id, reason),
  restore: (id) => questionsAPI.restore(id),
  submit: (id) => questionsAPI.submit(id),
  approve: (id) => questionsAPI.approve(id),
  reject: (id, reason) => questionsAPI.reject(id, reason),
  publish: (id) => questionsAPI.publish(id),
  unpublish: (id) => questionsAPI.unpublish(id),
  archive: (id, reason) => questionsAPI.archive(id, reason),
  restoreArchived: (id) => questionsAPI.restoreArchived(id),
}

export const useQuestionsStore = defineStore('questions', () => {
  return createWorkflowEntityStore({
    api: adapterApi,
    idField: 'questionId',
    entityKey: 'question',
    collectionKeys: ['questions', 'faqs'],
    detailsRouteName: 'questions.details',
  })
})
