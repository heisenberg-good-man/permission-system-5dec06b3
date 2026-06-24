const express = require('express')
const router = express.Router()
const { applications, jobs, notifications, nextAppId, nextNotificationId } = require('../data/store')

const STATUS_LABELS = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  rejected: '不合适'
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
  const { jobId, status, keyword, applicantName } = req.query
  let result = [...applications]
  if (jobId) {
    result = result.filter(a => a.jobId === jobId)
  }
  if (status) {
    result = result.filter(a => a.status === status)
  }
  if (applicantName) {
    const name = applicantName.toLowerCase().trim()
    result = result.filter(a => a.applicantName.toLowerCase() === name)
  }
  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter(a =>
      a.applicantName.toLowerCase().includes(kw) ||
      a.targetPosition.toLowerCase().includes(kw) ||
      a.skillTags.some(t => t.toLowerCase().includes(kw))
    )
  }
  const enriched = result.map(app => {
    const job = jobs.find(j => j.id === app.jobId)
    return { ...app, jobTitle: job ? job.title : '', company: job ? job.company : '' }
  })
  res.json(enriched)
})

router.get('/:id', (req, res) => {
  const app = applications.find(a => a.id === req.params.id)
  if (!app) return res.status(404).json({ error: '投递记录不存在' })
  const job = jobs.find(j => j.id === app.jobId)
  res.json({ ...app, jobTitle: job ? job.title : '', company: job ? job.company : '' })
})

router.post('/', (req, res) => {
  const { jobId, applicantName, contact, targetPosition, resumeSummary, skillTags, workYears } = req.body
  if (!jobId || !applicantName || !contact) {
    return res.status(400).json({ error: '目标岗位、姓名和联系方式为必填项' })
  }
  const job = jobs.find(j => j.id === jobId)
  if (!job) return res.status(400).json({ error: '目标岗位不存在' })
  if (job.status !== 'open') {
    return res.status(400).json({ error: '该职位已关闭，暂不接受投递' })
  }

  const trimmedName = String(applicantName).trim()
  const existing = applications.find(a =>
    a.jobId === jobId &&
    a.applicantName.toLowerCase() === trimmedName.toLowerCase()
  )
  if (existing) {
    return res.status(409).json({
      error: `您已向「${job.title}」投递过简历，请勿重复投递`,
      duplicate: true,
      applicationId: existing.id
    })
  }

  const now = new Date().toISOString()
  const app = {
    id: nextAppId,
    jobId,
    applicantName: trimmedName,
    contact: String(contact).trim(),
    targetPosition: targetPosition || job.title,
    resumeSummary: resumeSummary || '',
    skillTags: Array.isArray(skillTags) ? skillTags : [],
    workYears: Number(workYears) || 0,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }
  applications.push(app)

  createNotification({
    targetRole: 'recruiter',
    targetName: 'all',
    type: 'new_application',
    title: '新的投递',
    content: `${trimmedName} 投递了「${job.title}」岗位，请及时查看。`,
    relatedId: app.id
  })
  createNotification({
    targetRole: 'manager',
    targetName: 'all',
    type: 'new_application',
    title: '新的投递',
    content: `${trimmedName} 投递了「${job.title}」岗位。`,
    relatedId: app.id
  })
  createNotification({
    targetRole: 'applicant',
    targetName: trimmedName,
    type: 'new_application',
    title: '投递成功',
    content: `您投递的「${job.title}」岗位已提交，HR会尽快与您联系。`,
    relatedId: app.id
  })

  res.status(201).json({ ...app, jobTitle: job.title, company: job.company })
})

router.patch('/:id/status', (req, res) => {
  const { status } = req.body
  const validStatuses = ['pending', 'contacted', 'interviewing', 'rejected']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `无效状态，允许值: ${validStatuses.join(', ')}` })
  }
  const idx = applications.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: '投递记录不存在' })
  const oldStatus = applications[idx].status
  applications[idx].status = status
  applications[idx].updatedAt = new Date().toISOString()

  if (oldStatus !== status) {
    const app = applications[idx]
    const job = jobs.find(j => j.id === app.jobId)
    const jobTitle = job ? job.title : app.targetPosition

    createNotification({
      targetRole: 'applicant',
      targetName: app.applicantName,
      type: 'status_changed',
      title: '状态更新',
      content: `您投递的「${jobTitle}」岗位状态已更新为：${STATUS_LABELS[status]}。`,
      relatedId: app.id
    })
    createNotification({
      targetRole: 'manager',
      targetName: 'all',
      type: 'status_changed',
      title: '候选人状态更新',
      content: `${app.applicantName}（${jobTitle}）状态更新为：${STATUS_LABELS[status]}。`,
      relatedId: app.id
    })
  }

  res.json(applications[idx])
})

module.exports = router
