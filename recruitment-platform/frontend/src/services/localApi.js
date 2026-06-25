import state, { nextId } from './mockData'
import { calcStats } from '../utils/statsCalc'

function enrichApp(app) {
  const job = state.jobs.find(j => j.id === app.jobId)
  return {
    ...app,
    company: app.company || (job ? job.company : ''),
    targetPosition: app.targetPosition || (job ? job.title : '')
  }
}

function enrichInterview(itv) {
  const app = state.applications.find(a => a.id === itv.applicationId)
  const job = state.jobs.find(j => j.id === itv.jobId)
  const typeLabels = { onsite: '现场面试', video: '视频面试', phone: '电话面试' }
  const statusLabels = { scheduled: '已安排', completed: '已完成', cancelled: '已取消' }
  const resultLabels = { pass: '通过', pending: '待定', fail: '不通过' }
  return {
    ...itv,
    applicantName: itv.applicantName || (app ? app.applicantName : ''),
    jobTitle: job ? job.title : (app ? app.targetPosition : ''),
    jobCompany: job ? job.company : (app ? app.company : ''),
    targetPosition: app ? app.targetPosition : '',
    applicationStatus: app ? app.status : '',
    interviewTypeLabel: typeLabels[itv.interviewType] || itv.interviewType,
    statusLabel: statusLabels[itv.status] || itv.status,
    feedbackResultLabel: itv.feedbackResult ? (resultLabels[itv.feedbackResult] || itv.feedbackResult) : ''
  }
}

function enrichNotification(n) {
  const typeLabels = {
    new_application: '新投递',
    status_changed: '状态变更',
    interview_scheduled: '面试安排',
    interview_feedback: '面试反馈',
    interview_cancelled: '面试取消',
    new_message: '新消息'
  }
  return {
    ...n,
    typeLabel: typeLabels[n.type] || n.type
  }
}

export const localJobApi = {
  list(params = {}) {
    let result = [...state.jobs]
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(j =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        (j.requirements || '').toLowerCase().includes(kw)
      )
    }
    if (params.location) {
      result = result.filter(j => j.location === params.location)
    }
    if (params.status) {
      result = result.filter(j => j.status === params.status)
    }
    return Promise.resolve(result)
  },
  get(id) {
    const job = state.jobs.find(j => j.id === id)
    if (!job) return Promise.reject(new Error('职位不存在'))
    return Promise.resolve({ ...job })
  },
  create(data) {
    const now = new Date().toISOString()
    const job = {
      id: nextId('job_'),
      title: data.title || '',
      company: data.company || '',
      department: data.department || '',
      location: data.location || '',
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      headcount: data.headcount || 1,
      requirements: data.requirements || '',
      status: data.status || 'open',
      createdAt: now,
      updatedAt: now
    }
    state.jobs.push(job)
    return Promise.resolve({ ...job })
  },
  update(id, data) {
    const idx = state.jobs.findIndex(j => j.id === id)
    if (idx === -1) return Promise.reject(new Error('职位不存在'))
    Object.assign(state.jobs[idx], data, { updatedAt: new Date().toISOString() })
    return Promise.resolve({ ...state.jobs[idx] })
  },
  remove(id) {
    const idx = state.jobs.findIndex(j => j.id === id)
    if (idx === -1) return Promise.reject(new Error('职位不存在'))
    state.jobs.splice(idx, 1)
    return Promise.resolve({ success: true })
  }
}

export const localApplicationApi = {
  list(params = {}) {
    let result = state.applications.map(enrichApp)
    if (params.jobId) {
      result = result.filter(a => a.jobId === params.jobId)
    }
    if (params.status) {
      result = result.filter(a => a.status === params.status)
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(a =>
        a.applicantName.toLowerCase().includes(kw) ||
        a.targetPosition.toLowerCase().includes(kw) ||
        (a.skillTags || []).some(t => t.toLowerCase().includes(kw))
      )
    }
    if (params.applicantName) {
      result = result.filter(a => a.applicantName === params.applicantName)
    }
    return Promise.resolve(result)
  },
  get(id) {
    const app = state.applications.find(a => a.id === id)
    if (!app) return Promise.reject(new Error('投递记录不存在'))
    return Promise.resolve(enrichApp({ ...app }))
  },
  create(data) {
    const job = state.jobs.find(j => j.id === data.jobId)
    if (!job) return Promise.reject(new Error('目标职位不存在'))
    if (job.status === 'closed') return Promise.reject(new Error('该职位已关闭，无法投递'))

    const duplicate = state.applications.find(
      a => a.jobId === data.jobId && a.applicantName === data.applicantName
    )
    if (duplicate) return Promise.reject(new Error('您已向该职位投递过简历，请勿重复投递'))

    const now = new Date().toISOString()
    const app = {
      id: nextId('app_'),
      jobId: data.jobId,
      applicantName: (data.applicantName || '').trim(),
      contact: (data.contact || '').trim(),
      targetPosition: data.targetPosition || job.title,
      company: job.company,
      resumeSummary: data.resumeSummary || '',
      skillTags: data.skillTags || [],
      workYears: data.workYears || 0,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    }
    state.applications.push(app)

    state.notifications.push({
      id: nextId('notif_'),
      targetRole: 'recruiter',
      targetName: 'all',
      type: 'new_application',
      title: '新的投递',
      content: `${app.applicantName} 投递了「${app.targetPosition}」岗位，请及时查看。`,
      relatedId: app.id,
      read: false,
      createdAt: now
    })

    return Promise.resolve(enrichApp({ ...app }))
  },
  updateStatus(id, status) {
    const app = state.applications.find(a => a.id === id)
    if (!app) return Promise.reject(new Error('投递记录不存在'))
    const validStatuses = ['pending', 'contacted', 'interviewing', 'rejected']
    if (!validStatuses.includes(status)) return Promise.reject(new Error('无效的状态值'))
    app.status = status
    app.updatedAt = new Date().toISOString()

    const statusLabels = { pending: '待筛选', contacted: '已沟通', interviewing: '面试中', rejected: '不合适' }
    state.notifications.push({
      id: nextId('notif_'),
      targetRole: 'applicant',
      targetName: app.applicantName,
      type: 'status_changed',
      title: '状态更新',
      content: `您投递的「${app.targetPosition}」岗位状态已更新为：${statusLabels[status]}。`,
      relatedId: app.id,
      read: false,
      createdAt: new Date().toISOString()
    })

    state.notifications.push({
      id: nextId('notif_'),
      targetRole: 'manager',
      targetName: 'all',
      type: 'status_changed',
      title: '候选人状态更新',
      content: `${app.applicantName}（${app.targetPosition}）状态更新为：${statusLabels[status]}。`,
      relatedId: app.id,
      read: false,
      createdAt: new Date().toISOString()
    })

    return Promise.resolve(enrichApp({ ...app }))
  }
}

export const localMessageApi = {
  list(applicationId) {
    const result = state.messages.filter(m => m.applicationId === applicationId)
    return Promise.resolve(result.map(m => ({ ...m })))
  },
  create(data) {
    const now = new Date().toISOString()
    const msg = {
      id: nextId('msg_'),
      applicationId: data.applicationId,
      senderRole: data.senderRole,
      senderName: data.senderName || (data.senderRole === 'recruiter' ? '招聘方HR' : '应聘者'),
      content: data.content,
      createdAt: now
    }
    state.messages.push(msg)

    const app = state.applications.find(a => a.id === data.applicationId)
    if (app) {
      state.notifications.push({
        id: nextId('notif_'),
        targetRole: data.senderRole === 'recruiter' ? 'applicant' : 'recruiter',
        targetName: data.senderRole === 'recruiter' ? app.applicantName : 'all',
        type: 'new_message',
        title: '新消息',
        content: `${msg.senderName} 发来了新消息：${data.content.slice(0, 50)}${data.content.length > 50 ? '...' : ''}`,
        relatedId: data.applicationId,
        read: false,
        createdAt: now
      })
    }

    return Promise.resolve({ ...msg })
  }
}

export const localInterviewApi = {
  list(params = {}) {
    let result = state.interviews.map(enrichInterview)
    if (params.applicationId) {
      result = result.filter(i => i.applicationId === params.applicationId)
    }
    if (params.status) {
      result = result.filter(i => i.status === params.status)
    }
    if (params.interviewType) {
      result = result.filter(i => i.interviewType === params.interviewType)
    }
    if (params.applicantName) {
      const kw = params.applicantName.toLowerCase()
      result = result.filter(i => (i.applicantName || '').toLowerCase().includes(kw))
    }
    return Promise.resolve(result)
  },
  get(id) {
    const itv = state.interviews.find(i => i.id === id)
    if (!itv) return Promise.reject(new Error('面试记录不存在'))
    return Promise.resolve(enrichInterview({ ...itv }))
  },
  create(data) {
    const app = state.applications.find(a => a.id === data.applicationId)
    if (!app) return Promise.reject(new Error('投递记录不存在'))

    const now = new Date().toISOString()
    const itv = {
      id: nextId('int_'),
      applicationId: data.applicationId,
      jobId: app.jobId,
      applicantName: app.applicantName,
      interviewTime: data.interviewTime,
      interviewType: data.interviewType,
      interviewer: data.interviewer || '',
      location: data.location || '',
      meetingLink: data.meetingLink || '',
      note: data.note || '',
      status: 'scheduled',
      feedbackResult: '',
      feedbackContent: '',
      feedbackAt: '',
      createdAt: now,
      updatedAt: now
    }
    state.interviews.push(itv)

    state.notifications.push({
      id: nextId('notif_'),
      targetRole: 'applicant',
      targetName: app.applicantName,
      type: 'interview_scheduled',
      title: '面试已安排',
      content: `您好，您投递的「${app.targetPosition}」岗位面试已安排，请准时参加。`,
      relatedId: itv.id,
      read: false,
      createdAt: now
    })

    return Promise.resolve(enrichInterview({ ...itv }))
  },
  submitFeedback(id, data) {
    const itv = state.interviews.find(i => i.id === id)
    if (!itv) return Promise.reject(new Error('面试记录不存在'))
    itv.feedbackResult = data.feedbackResult
    itv.feedbackContent = data.feedbackContent
    itv.feedbackAt = new Date().toISOString()
    itv.status = 'completed'
    itv.updatedAt = new Date().toISOString()

    const app = state.applications.find(a => a.id === itv.applicationId)
    if (app) {
      state.notifications.push({
        id: nextId('notif_'),
        targetRole: 'manager',
        targetName: 'all',
        type: 'interview_feedback',
        title: '面试反馈',
        content: `${itv.applicantName}（${app.targetPosition}）的面试反馈已提交。`,
        relatedId: itv.id,
        read: false,
        createdAt: new Date().toISOString()
      })
    }

    return Promise.resolve(enrichInterview({ ...itv }))
  },
  cancel(id) {
    const itv = state.interviews.find(i => i.id === id)
    if (!itv) return Promise.reject(new Error('面试记录不存在'))
    itv.status = 'cancelled'
    itv.updatedAt = new Date().toISOString()

    const app = state.applications.find(a => a.id === itv.applicationId)
    if (app) {
      state.notifications.push({
        id: nextId('notif_'),
        targetRole: 'applicant',
        targetName: app.applicantName,
        type: 'interview_cancelled',
        title: '面试已取消',
        content: `您投递的「${app.targetPosition}」岗位面试已取消。`,
        relatedId: itv.id,
        read: false,
        createdAt: new Date().toISOString()
      })
    }

    return Promise.resolve(enrichInterview({ ...itv }))
  }
}

export const localNotificationApi = {
  list(params = {}) {
    let result = state.notifications.map(enrichNotification)
    if (params.role) {
      result = result.filter(n => n.targetRole === params.role || n.targetRole === 'all')
    }
    if (params.applicantName) {
      result = result.filter(n => n.targetName === params.applicantName || n.targetName === 'all')
    }
    const unreadOnly = params.unreadOnly === 'true' || params.unreadOnly === true
    if (unreadOnly) {
      result = result.filter(n => !n.read)
    }
    const unreadCount = result.filter(n => !n.read).length
    return Promise.resolve({ list: result, unreadCount, total: result.length })
  },
  markRead(id) {
    const n = state.notifications.find(x => x.id === id)
    if (n) n.read = true
    return Promise.resolve({ success: true })
  },
  markAllRead(data = {}) {
    state.notifications.forEach(n => {
      if (data.role && n.targetRole !== data.role && n.targetRole !== 'all') return
      if (data.applicantName && n.targetName !== data.applicantName && n.targetName !== 'all') return
      n.read = true
    })
    return Promise.resolve({ success: true })
  }
}

export const localStatsApi = {
  get(params = {}) {
    return Promise.resolve(calcStats(params))
  }
}
