const express = require('express')
const router = express.Router()
const { jobs, applications, interviews, notifications } = require('../data/store')

router.get('/', (req, res) => {
  const { role = 'manager', applicantName = '' } = req.query
  const today = new Date().toISOString().slice(0, 10)
  const now = Date.now()

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

  const todayInterviews = interviews.filter(i => i.interviewTime.slice(0, 10) === today && i.status !== 'cancelled').length
  const pendingFeedbackInterviews = interviews.filter(i =>
    i.status === 'scheduled' && new Date(i.interviewTime).getTime() < now
  ).length + interviews.filter(i => i.status === 'scheduled' && !i.feedbackResult).length

  const pendingFeedback = interviews.filter(i => i.status === 'scheduled' && !i.feedbackResult).length
  const passedInterviews = interviews.filter(i => i.feedbackResult === 'pass').length

  let unreadNotifications = 0
  if (role === 'manager' || role === 'recruiter') {
    unreadNotifications = notifications.filter(n => n.targetRole === role && !n.read).length
  } else if (role === 'applicant') {
    unreadNotifications = notifications.filter(n =>
      n.targetRole === 'applicant' && !n.read &&
      (n.targetName === 'all' || (applicantName && n.targetName === applicantName))
    ).length
  }

  const recentInterviews = [...interviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(i => {
      const job = jobs.find(j => j.id === i.jobId)
      return {
        id: i.id,
        applicantName: i.applicantName,
        jobTitle: job ? job.title : '',
        interviewTime: i.interviewTime,
        status: i.status,
        statusLabel: i.status === 'scheduled' ? '已安排' : i.status === 'completed' ? '已完成' : '已取消'
      }
    })

  res.json({
    openPositions,
    todayNewApplications,
    pendingCandidates,
    contactedCount,
    interviewingCount,
    rejectedCount,
    totalApplications,
    statusBreakdown,
    todayInterviews,
    pendingFeedbackInterviews: pendingFeedback,
    passedInterviews,
    unreadNotifications,
    recentInterviews
  })
})

module.exports = router
