export default function ({ request }) {
  const url = '/public-notices'

  return Object.freeze({
    findNotice,
    scheduleNoticePublish,
    scheduleNoticeUnpublish,
    cancelNoticePublishSchedule,
    cancelNoticeUnpublishSchedule,
  })

  async function findNotice({ noticeId }) {
    try {
      const { data } = await request.get(`${url}/${noticeId}`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleNoticePublish({ noticeId, scheduledPublishAt, timezone }) {
    try {
      const { data } = await request.put(`${url}/${noticeId}/schedule-publish`, {
        scheduledPublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleNoticeUnpublish({ noticeId, scheduledUnpublishAt, timezone }) {
    try {
      const { data } = await request.put(`${url}/${noticeId}/schedule-unpublish`, {
        scheduledUnpublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelNoticePublishSchedule({ noticeId }) {
    try {
      const { data } = await request.put(`${url}/${noticeId}/cancel-publish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelNoticeUnpublishSchedule({ noticeId }) {
    try {
      const { data } = await request.put(`${url}/${noticeId}/cancel-unpublish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }
}
