import state from '../services/mockData'

function isToday(ts) {
  if (!ts) return false
  const d = new Date(ts)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
}

export function calcStats(params = {}) {
  const { role, applicantName } = params

  let apps = state.applications
  let jobs = state.jobs
  let interviews = state.interviews
  let notifs = state.notifications

  if (role === 'applicant' && applicantName) {
    apps = apps.filter(a => a.applicantName === applicantName)
    interviews = interviews.filter(i => i.applicantName === applicantName)
  }

  const openPositions = jobs.filter(j => j.status === 'open').length
  const todayNewApplications = apps.filter(a => isToday(a.createdAt)).length
  const pendingCandidates = apps.filter(a => a.status === 'pending').length
  const contactedCount = apps.filter(a => a.status === 'contacted').length
  const interviewingCount = apps.filter(a => a.status === 'interviewing').length
  const rejectedCount = apps.filter(a => a.status === 'rejected').length
  const totalApplications = apps.length

  const statusBreakdown = { pending: pendingCandidates, contacted: contactedCount, interviewing: interviewingCount, rejected: rejectedCount }

  const todayInterviews = interviews.filter(i => isToday(i.interviewTime) && i.status === 'scheduled').length

  const scheduled = interviews.filter(i => i.status === 'scheduled')
  const pendingFeedbackInterviews = scheduled.length

  const completed = interviews.filter(i => i.status === 'completed')
  const passedInterviews = completed.filter(i => i.feedbackResult === 'pass').length

  let filteredNotifs = notifs
  if (role) {
    filteredNotifs = filteredNotifs.filter(n => n.targetRole === role || n.targetRole === 'all')
  }
  if (role === 'applicant' && applicantName) {
    filteredNotifs = filteredNotifs.filter(n => n.targetName === applicantName || n.targetName === 'all')
  }
  const unreadNotifications = filteredNotifs.filter(n => !n.read).length

  const recentInterviews = interviews
    .filter(i => i.status === 'scheduled' || i.status === 'completed')
    .sort((a, b) => new Date(b.interviewTime) - new Date(a.interviewTime))
    .slice(0, 8)
    .map(i => ({
      ...i,
      jobTitle: jobs.find(j => j.id === i.jobId)?.title || i.applicantName,
      statusLabel: i.status === 'scheduled' ? '已安排' : i.status === 'completed' ? '已完成' : i.status === 'cancelled' ? '已取消' : i.status
    }))

  return {
    openPositions,
    todayNewApplications,
    pendingCandidates,
    contactedCount,
    interviewingCount,
    rejectedCount,
    totalApplications,
    statusBreakdown,
    todayInterviews,
    pendingFeedbackInterviews,
    passedInterviews,
    unreadNotifications,
    recentInterviews
  }
}
