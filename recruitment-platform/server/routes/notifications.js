const express = require('express')
const router = express.Router()
const { notifications, nextNotificationId } = require('../data/store')

const NOTIF_TYPES = {
  new_application: '新投递',
  status_changed: '状态变更',
  interview_scheduled: '面试安排',
  interview_feedback: '面试反馈',
  interview_cancelled: '面试取消',
  new_message: '新消息'
}

function filterByRole(list, role, applicantName) {
  return list.filter(n => {
    if (n.targetRole === role) {
      if (role === 'applicant' && n.targetName && n.targetName !== 'all') {
        return applicantName ? n.targetName === applicantName : true
      }
      return true
    }
    return false
  })
}

router.get('/', (req, res) => {
  const { role, applicantName, unreadOnly } = req.query
  if (!role) return res.status(400).json({ error: '缺少 role 参数' })

  let list = [...notifications]
  list = filterByRole(list, role, applicantName)
  if (unreadOnly === 'true' || unreadOnly === '1') {
    list = list.filter(n => !n.read)
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const enriched = list.map(n => ({
    ...n,
    typeLabel: NOTIF_TYPES[n.type] || n.type
  }))

  const unreadCount = enriched.filter(n => !n.read).length
  res.json({ list: enriched, unreadCount, total: enriched.length })
})

router.patch('/:id/read', (req, res) => {
  const n = notifications.find(x => x.id === req.params.id)
  if (!n) return res.status(404).json({ error: '通知不存在' })
  if (n.read) return res.json({ ...n, alreadyRead: true })
  n.read = true
  res.json(n)
})

router.patch('/read-all', (req, res) => {
  const { role, applicantName } = req.body || {}
  if (!role) return res.status(400).json({ error: '缺少 role 参数' })
  const targets = filterByRole(notifications, role, applicantName).filter(n => !n.read)
  targets.forEach(n => { n.read = true })
  res.json({ markedCount: targets.length })
})

module.exports = { router, NOTIF_TYPES }
