const express = require('express')
const router = express.Router()
const { jobs, nextJobId } = require('../data/store')

router.get('/', (req, res) => {
  const { keyword, location, status } = req.query
  let result = [...jobs]
  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter(j =>
      j.title.toLowerCase().includes(kw) ||
      j.company.toLowerCase().includes(kw) ||
      j.requirements.toLowerCase().includes(kw)
    )
  }
  if (location) {
    result = result.filter(j => j.location === location)
  }
  if (status) {
    result = result.filter(j => j.status === status)
  }
  res.json(result)
})

router.get('/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id)
  if (!job) return res.status(404).json({ error: '职位不存在' })
  res.json(job)
})

router.post('/', (req, res) => {
  const { title, company, department, location, salaryMin, salaryMax, headcount, requirements, status } = req.body
  if (!title || !company) {
    return res.status(400).json({ error: '职位名称和公司为必填项' })
  }
  const now = new Date().toISOString()
  const job = {
    id: nextJobId,
    title,
    company,
    department: department || '',
    location: location || '',
    salaryMin: Number(salaryMin) || 0,
    salaryMax: Number(salaryMax) || 0,
    headcount: Number(headcount) || 1,
    requirements: requirements || '',
    status: status || 'open',
    createdAt: now,
    updatedAt: now
  }
  jobs.push(job)
  res.status(201).json(job)
})

router.put('/:id', (req, res) => {
  const idx = jobs.findIndex(j => j.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: '职位不存在' })
  const updated = { ...jobs[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() }
  jobs[idx] = updated
  res.json(updated)
})

router.delete('/:id', (req, res) => {
  const idx = jobs.findIndex(j => j.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: '职位不存在' })
  const removed = jobs.splice(idx, 1)[0]
  res.json(removed)
})

module.exports = router
