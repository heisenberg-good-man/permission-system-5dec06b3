const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `请求失败: ${res.status}`)
  }
  return res.json()
}

export const jobApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/jobs${qs ? '?' + qs : ''}`)
  },
  get(id) { return request(`/jobs/${id}`) },
  create(data) { return request('/jobs', { method: 'POST', body: JSON.stringify(data) }) },
  update(id, data) { return request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }) },
  remove(id) { return request(`/jobs/${id}`, { method: 'DELETE' }) }
}

export const applicationApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return request(`/applications${qs ? '?' + qs : ''}`)
  },
  get(id) { return request(`/applications/${id}`) },
  create(data) { return request('/applications', { method: 'POST', body: JSON.stringify(data) }) },
  updateStatus(id, status) { return request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }) }
}

export const messageApi = {
  list(applicationId) { return request(`/messages/${applicationId}`) },
  create(data) { return request('/messages', { method: 'POST', body: JSON.stringify(data) }) }
}

export const statsApi = {
  get() { return request('/stats') }
}
