import { ref, inject, watch } from 'vue'
import { notificationApi } from '../services/api'

const unreadCount = ref(0)
const lastFetched = ref('')

export function useNotifications() {
  const role = inject('role')

  function getApplicantName() {
    try {
      return localStorage.getItem('lastApplicantName') || ''
    } catch (e) { return '' }
  }

  async function refresh() {
    if (!role) return
    try {
      const params = { role: role.role.value, unreadOnly: 'true' }
      if (role.isApplicant.value) {
        const name = getApplicantName()
        if (name) params.applicantName = name
      }
      const data = await notificationApi.list(params)
      unreadCount.value = data.unreadCount || 0
      lastFetched.value = new Date().toISOString()
    } catch (e) {
      console.warn('刷新通知数量失败:', e.message)
    }
  }

  async function listAll() {
    if (!role) return { list: [], unreadCount: 0, total: 0 }
    const params = { role: role.role.value }
    if (role.isApplicant.value) {
      const name = getApplicantName()
      if (name) params.applicantName = name
    }
    return notificationApi.list(params)
  }

  async function markRead(id) {
    try {
      await notificationApi.markRead(id)
      if (unreadCount.value > 0) unreadCount.value -= 1
    } catch (e) {
      console.warn('标记已读失败:', e.message)
    }
  }

  async function markAllRead() {
    if (!role) return
    try {
      const data = { role: role.role.value }
      if (role.isApplicant.value) {
        const name = getApplicantName()
        if (name) data.applicantName = name
      }
      await notificationApi.markAllRead(data)
      unreadCount.value = 0
    } catch (e) {
      console.warn('全部标记已读失败:', e.message)
    }
  }

  watch(
    () => role?.role?.value,
    () => { if (role) refresh() },
    { immediate: true }
  )

  return {
    unreadCount,
    lastFetched,
    refresh,
    listAll,
    markRead,
    markAllRead,
    getApplicantName
  }
}
