const express = require('express')
const router = express.Router()
const { applications, jobs, nextAppId } = require('../data/store')

router.get('/', (req, res) => {
  const { jobId, status, keyword } = req.query
  let result = [...applications]
  if (jobId) {
    result = result.filter(a => a.jobId === jobId)
  }
  if (status) {
    result = result.filter(a => a.status === status)
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
  const now = new Date().toISOString()
  const app = {
    id: nextAppId,
    jobId,
    applicantName,
    contact,
    targetPosition: targetPosition || job.title,
    resumeSummary: resumeSummary || '',
    skillTags: Array.isArray(skillTags) ? skillTags : [],
    workYears: Number(workYears) || 0,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }
  applications.push(app)
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
  applications[idx].status = status
  applications[idx].updatedAt = new Date().toISOString()
  res.json(applications[idx])
})

module.exports = router
