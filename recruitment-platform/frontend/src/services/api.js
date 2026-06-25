import {
  localJobApi,
  localApplicationApi,
  localMessageApi,
  localInterviewApi,
  localNotificationApi,
  localStatsApi
} from './localApi'

const USE_REMOTE_API = false
const API_BASE = '/api'

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const msg = (data && data.error) || `请求失败 (${res.status})`
    throw new Error(msg)
  }
  return data
}

const remoteJobApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/jobs${qs ? `?${qs}` : ''}`)
  },
  get(id) { return request(`/jobs/${id}`) },
  create(data) { return request('/jobs', { method: 'POST', body: data }) },
  update(id, data) { return request(`/jobs/${id}`, { method: 'PUT', body: data }) },
  remove(id) { return request(`/jobs/${id}`, { method: 'DELETE' }) }
}

const remoteApplicationApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/applications${qs ? `?${qs}` : ''}`)
  },
  get(id) { return request(`/applications/${id}`) },
  create(data) { return request('/applications', { method: 'POST', body: data }) },
  updateStatus(id, status) {
    return request(`/applications/${id}/status`, { method: 'PATCH', body: { status } })
  }
}

const remoteMessageApi = {
  list(applicationId) { return request(`/messages/${applicationId}`) },
  create(data) { return request('/messages', { method: 'POST', body: data }) }
}

const remoteInterviewApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/interviews${qs ? `?${qs}` : ''}`)
  },
  get(id) { return request(`/interviews/${id}`) },
  create(data) { return request('/interviews', { method: 'POST', body: data }) },
  submitFeedback(id, data) {
    return request(`/interviews/${id}/feedback`, { method: 'PATCH', body: data })
  },
  cancel(id) { return request(`/interviews/${id}/cancel`, { method: 'PATCH' }) }
}

const remoteNotificationApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/notifications${qs ? `?${qs}` : ''}`)
  },
  markRead(id) { return request(`/notifications/${id}/read`, { method: 'PATCH' }) },
  markAllRead(data = {}) { return request('/notifications/read-all', { method: 'PATCH', body: data }) }
}

const remoteStatsApi = {
  get(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/stats${qs ? `?${qs}` : ''}`)
  }
}

export const jobApi = USE_REMOTE_API ? remoteJobApi : localJobApi
export const applicationApi = USE_REMOTE_API ? remoteApplicationApi : localApplicationApi
export const messageApi = USE_REMOTE_API ? remoteMessageApi : localMessageApi
export const interviewApi = USE_REMOTE_API ? remoteInterviewApi : localInterviewApi
export const notificationApi = USE_REMOTE_API ? remoteNotificationApi : localNotificationApi
export const statsApi = USE_REMOTE_API ? remoteStatsApi : localStatsApi
