const express = require('express')
const router = express.Router()
const { interviews, applications, jobs, notifications, nextInterviewId, nextNotificationId } = require('../data/store')

const INTERVIEW_TYPES = {
  onsite: '现场面试',
  video: '视频面试',
  phone: '电话面试'
}

const INTERVIEW_STATUS = {
  scheduled: '已安排',
  completed: '已完成',
  cancelled: '已取消'
}

const FEEDBACK_RESULTS = {
  pass: '通过',
  pending: '待定',
  fail: '不通过'
}

function enrichInterview(itv) {
  const job = jobs.find(j => j.id === itv.jobId)
  const app = applications.find(a => a.id === itv.applicationId)
  return {
    ...itv,
    interviewTypeLabel: INTERVIEW_TYPES[itv.interviewType] || itv.interviewType,
    statusLabel: INTERVIEW_STATUS[itv.status] || itv.status,
    feedbackResultLabel: itv.feedbackResult ? (FEEDBACK_RESULTS[itv.feedbackResult] || itv.feedbackResult) : '',
    jobTitle: job ? job.title : '',
    jobCompany: job ? job.company : '',
    applicationStatus: app ? app.status : ''
  }
}

function createNotification(notif) {
  const n = {
    id: nextNotificationId,
    read: false,
    createdAt: new Date().toISOString(),
    ...notif
  }
  notifications.unshift(n)
  return n
}

router.get('/', (req, res) => {
  const { jobId, status, interviewType, applicantName } = req.query
  let result = [...interviews]
  if (jobId) result = result.filter(i => i.jobId === jobId)
  if (status) result = result.filter(i => i.status === status)
  if (interviewType) result = result.filter(i => i.interviewType === interviewType)
  if (applicantName) {
    result = result.filter(i =>
      i.applicantName.toLowerCase().includes(applicantName.toLowerCase())
    )
  }
  result.sort((a, b) => new Date(b.interviewTime) - new Date(a.interviewTime))
  res.json(result.map(enrichInterview))
})

router.get('/:id', (req, res) => {
  const itv = interviews.find(i => i.id === req.params.id)
  if (!itv) return res.status(404).json({ error: '面试记录不存在' })
  res.json(enrichInterview(itv))
})

router.post('/', (req, res) => {
  const { applicationId, interviewTime, interviewType, interviewer, location, meetingLink, note } = req.body

  if (!applicationId) return res.status(400).json({ error: '请选择要安排面试的投递记录' })
  if (!interviewTime) return res.status(400).json({ error: '请选择面试时间' })
  if (!interviewType) return res.status(400).json({ error: '请选择面试方式' })
  if (!interviewer || !String(interviewer).trim()) return res.status(400).json({ error: '请填写面试官' })

  const time = new Date(interviewTime)
  if (isNaN(time.getTime())) return res.status(400).json({ error: '面试时间格式不合法' })
  if (time.getTime() < Date.now()) return res.status(400).json({ error: '面试时间不能早于当前时间' })

  if (!INTERVIEW_TYPES[interviewType]) return res.status(400).json({ error: '面试方式不合法' })

  if (interviewType === 'onsite' && (!location || !String(location).trim())) {
    return res.status(400).json({ error: '现场面试请填写地点' })
  }
  if (interviewType === 'video' && (!meetingLink || !String(meetingLink).trim())) {
    return res.status(400).json({ error: '视频面试请填写会议链接' })
  }

  const app = applications.find(a => a.id === applicationId)
  if (!app) return res.status(404).json({ error: '投递记录不存在' })

  if (!['contacted', 'interviewing'].includes(app.status)) {
    return res.status(400).json({ error: '候选人状态需为「已沟通」或「面试中」才能安排面试' })
  }

  const job = jobs.find(j => j.id === app.jobId)

  const itv = {
    id: nextInterviewId,
    applicationId,
    jobId: app.jobId,
    applicantName: app.applicantName,
    interviewTime: time.toISOString(),
    interviewType,
    interviewer: String(interviewer).trim(),
    location: location ? String(location).trim() : '',
    meetingLink: meetingLink ? String(meetingLink).trim() : '',
    note: note ? String(note).trim() : '',
    status: 'scheduled',
    feedbackResult: '',
    feedbackContent: '',
    feedbackAt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  interviews.unshift(itv)

  if (app.status === 'contacted') {
    app.status = 'interviewing'
    app.updatedAt = new Date().toISOString()
  }

  const timeLabel = time.toLocaleString('zh-CN', { hour12: false })
  createNotification({
    targetRole: 'applicant',
    targetName: app.applicantName,
    type: 'interview_scheduled',
    title: '面试已安排',
    content: `您好，您投递的「${job ? job.title : app.targetPosition}」${INTERVIEW_TYPES[interviewType]}已安排在 ${timeLabel}，请准时参加。`,
    relatedId: itv.id
  })
  createNotification({
    targetRole: 'manager',
    targetName: 'all',
    type: 'interview_scheduled',
    title: '新面试安排',
    content: `${app.applicantName}（${job ? job.title : app.targetPosition}）面试已安排：${timeLabel} ${INTERVIEW_TYPES[interviewType]}。`,
    relatedId: itv.id
  })

  res.json(enrichInterview(itv))
})

router.patch('/:id/feedback', (req, res) => {
  const itv = interviews.find(i => i.id === req.params.id)
  if (!itv) return res.status(404).json({ error: '面试记录不存在' })

  const { feedbackResult, feedbackContent } = req.body
  if (!feedbackResult || !FEEDBACK_RESULTS[feedbackResult]) {
    return res.status(400).json({ error: '请选择有效的面试结果' })
  }
  if (!feedbackContent || !String(feedbackContent).trim()) {
    return res.status(400).json({ error: '请填写面试反馈内容' })
  }

  itv.feedbackResult = feedbackResult
  itv.feedbackContent = String(feedbackContent).trim()
  itv.feedbackAt = new Date().toISOString()
  itv.status = 'completed'
  itv.updatedAt = new Date().toISOString()

  const app = applications.find(a => a.id === itv.applicationId)
  if (app && feedbackResult === 'fail') {
    app.status = 'rejected'
    app.updatedAt = new Date().toISOString()
  }

  createNotification({
    targetRole: 'manager',
    targetName: 'all',
    type: 'interview_feedback',
    title: '面试反馈已提交',
    content: `${itv.applicantName} 的面试反馈：${FEEDBACK_RESULTS[feedbackResult]}。`,
    relatedId: itv.id
  })

  res.json(enrichInterview(itv))
})

router.patch('/:id/cancel', (req, res) => {
  const itv = interviews.find(i => i.id === req.params.id)
  if (!itv) return res.status(404).json({ error: '面试记录不存在' })
  if (itv.status === 'completed') return res.status(400).json({ error: '已完成的面试无法取消' })

  itv.status = 'cancelled'
  itv.updatedAt = new Date().toISOString()

  createNotification({
    targetRole: 'applicant',
    targetName: itv.applicantName,
    type: 'interview_cancelled',
    title: '面试已取消',
    content: `您好，您的「${itv.jobTitle || itv.targetPosition || ''}」面试已取消，请留意后续通知。`,
    relatedId: itv.id
  })

  res.json(enrichInterview(itv))
})

module.exports = { router, INTERVIEW_TYPES, INTERVIEW_STATUS, FEEDBACK_RESULTS }
