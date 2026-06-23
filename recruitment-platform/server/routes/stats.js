const express = require('express')
const router = express.Router()
const { jobs, applications } = require('../data/store')

router.get('/', (req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  const openPositions = jobs.filter(j => j.status === 'open').length
  const todayNewApplications = applications.filter(a => a.createdAt.slice(0, 10) === today).length
  const pendingCandidates = applications.filter(a => a.status === 'pending').length
  const contactedCount = applications.filter(a => a.status === 'contacted').length
  const interviewingCount = applications.filter(a => a.status === 'interviewing').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length
  const totalApplications = applications.length

  const statusBreakdown = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {})

  res.json({
    openPositions,
    todayNewApplications,
    pendingCandidates,
    contactedCount,
    interviewingCount,
    rejectedCount,
    totalApplications,
    statusBreakdown
  })
})

module.exports = router
